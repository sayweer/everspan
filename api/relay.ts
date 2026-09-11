/**
 * Fee sponsorship for passkey sessions.
 *
 * A smart wallet is born holding nothing and cannot pay to deploy itself, so a
 * server-held keypair pays and submits on its behalf. The split of duties is
 * what keeps that from being custody: the reader's passkey signs the
 * authorization entries, and this endpoint submits *those entries* — it never
 * re-simulates to get its own. Re-simulating would substitute the sponsor's
 * authority for the reader's, which is a custody bug wearing the costume of an
 * optimisation.
 *
 * The URL ships in the client bundle, so this endpoint is public and every byte
 * arriving is untrusted. `admits()` is the whole security model.
 *
 * PASSKEY-ENTRY — see docs/passkey.md for how this comes out.
 */
import {
  Account,
  Keypair,
  Operation,
  TransactionBuilder,
  xdr,
  type Transaction,
} from '@stellar/stellar-sdk'
import { Api, Durability, Server } from '@stellar/stellar-sdk/rpc'
/* Beside the function rather than in src/lib. The serverless bundler resolves
   what sits under api/; an import reaching outside it fails while the module
   is loading, which surfaces as a 500 before the handler ever runs — and looks
   nothing like a missing file. */
import { admits, parseList, type GuardConfig } from './_lib/guard.ts'
import { INCLUSION_FEE, paddedResourceFee } from './_lib/fees.ts'

const RPC_URL = process.env.RELAY_RPC_URL ?? 'https://soroban-testnet.stellar.org'
/* Hardcoded rather than read from the environment. This endpoint sponsors
   transactions with a key we hold; the network it does that on is not
   something a dashboard edit should be able to change. */
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function sponsor(): Keypair | null {
  const secret = process.env.SPONSOR_SECRET
  if (!secret) return null
  try {
    return Keypair.fromSecret(secret)
  } catch {
    return null
  }
}

function guardConfig(server: Server): GuardConfig {
  return {
    contracts: parseList(process.env.RELAY_ALLOWED_CONTRACTS),
    wasmHashes: parseList(process.env.RELAY_ALLOWED_WASM),
    readWasmHash: async (contractId) => {
      const entry = await server.getContractData(
        contractId,
        xdr.ScVal.scvLedgerKeyContractInstance(),
        Durability.Persistent,
      )
      const executable = entry.val.contractData().val().instance().executable()
      return executable.switch().name === 'contractExecutableWasm'
        ? executable.wasmHash().toString('hex')
        : null
    },
  }
}

/** Read the host function out of a fully signed envelope so it can be gated too. */
function hostFunctionOf(envelopeXdr: string): string | null {
  try {
    const tx = TransactionBuilder.fromXDR(envelopeXdr, NETWORK_PASSPHRASE)
    const operations = 'operations' in tx ? tx.operations : []
    for (const operation of operations) {
      if (operation.type === 'invokeHostFunction') return operation.func.toXDR('base64')
    }
    return null
  } catch {
    return null
  }
}

async function settle(server: Server, hash: string, initial: string): Promise<string> {
  let status = initial
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    status = (await server.getTransaction(hash)).status
    if (status !== 'NOT_FOUND' && status !== 'PENDING') break
  }
  if (status === 'FAILED') throw new Error('transaction failed on chain')
  // Reported honestly rather than claimed as success early.
  return status
}

/** Submit a host function using the caller's already-signed auth entries. */
async function submitHostFunction(
  server: Server,
  keypair: Keypair,
  func: xdr.HostFunction,
  auth: xdr.SorobanAuthorizationEntry[],
): Promise<{ hash: string; status: string }> {
  const address = keypair.publicKey()
  const sequence = (await server.getAccount(address)).sequenceNumber()
  const build = (sorobanData?: xdr.SorobanTransactionData): Transaction =>
    new TransactionBuilder(new Account(address, sequence), {
      fee: INCLUSION_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
      ...(sorobanData ? { sorobanData } : {}),
    })
      .addOperation(Operation.invokeHostFunction({ func, auth }))
      .setTimeout(120)
      .build()

  const simulation = await server.simulateTransaction(build())
  if (Api.isSimulationError(simulation)) throw new Error(`simulation failed: ${simulation.error}`)
  if (Api.isSimulationRestore(simulation)) throw new Error('ledger state is archived')
  if (!simulation.transactionData) throw new Error('simulation returned no footprint')

  const data = simulation.transactionData.build()
  data.resourceFee(
    xdr.Int64.fromString(paddedResourceFee(BigInt(data.resourceFee().toString())).toString()),
  )

  const tx = build(data)
  tx.sign(keypair)
  const sent = await server.sendTransaction(tx)
  if (sent.status === 'ERROR') {
    throw new Error(`rejected: ${JSON.stringify(sent.errorResult ?? {})}`)
  }
  return { hash: sent.hash, status: await settle(server, sent.hash, sent.status) }
}

/**
 * Submit an envelope the kit already signed. Re-signing would break its own
 * signature, so the fee is raised from outside with a fee bump and the inner
 * transaction stays byte-for-byte intact.
 */
async function submitEnvelope(
  server: Server,
  keypair: Keypair,
  envelopeXdr: string,
): Promise<{ hash: string; status: string }> {
  const inner = TransactionBuilder.fromXDR(envelopeXdr, NETWORK_PASSPHRASE) as Transaction
  const bumped = TransactionBuilder.buildFeeBumpTransaction(
    keypair,
    INCLUSION_FEE,
    inner,
    NETWORK_PASSPHRASE,
  )
  bumped.sign(keypair)
  const sent = await server.sendTransaction(bumped)
  if (sent.status === 'ERROR') {
    throw new Error(`rejected: ${JSON.stringify(sent.errorResult ?? {})}`)
  }
  return { hash: sent.hash, status: await settle(server, sent.hash, sent.status) }
}

export async function POST(request: Request): Promise<Response> {
  const keypair = sponsor()
  if (!keypair) return json({ error: 'Relay is not configured.' }, 503)

  const body: unknown = await request.json().catch(() => null)
  if (body === null || typeof body !== 'object') return json({ error: 'Malformed request.' }, 400)

  const { func, auth, xdr: envelope } = body as Record<string, unknown>
  const isCall = typeof func === 'string' && Array.isArray(auth)
  const isEnvelope = typeof envelope === 'string' && envelope.length > 0
  if (!isCall && !isEnvelope) return json({ error: 'Malformed request.' }, 400)

  const server = new Server(RPC_URL)
  const gated = isCall ? func : hostFunctionOf(envelope as string)
  if (gated === null || !(await admits(gated, guardConfig(server)))) {
    return json({ error: 'Not allowed.' }, 403)
  }

  try {
    const result = isCall
      ? await submitHostFunction(
          server,
          keypair,
          xdr.HostFunction.fromXDR(func, 'base64'),
          (auth as string[]).map((entry) =>
            xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64'),
          ),
        )
      : await submitEnvelope(server, keypair, envelope as string)
    return json(result, 200)
  } catch (error) {
    console.error('[relay] submit failed:', error)
    return json({ error: 'Relay failed.' }, 502)
  }
}
