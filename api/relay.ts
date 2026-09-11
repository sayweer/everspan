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
import type { GuardConfig } from './_lib/guard.js'

/*
 * The gate and the fee helpers are loaded inside the handler rather than at
 * module scope, and the specifier carries a `.js` extension even though the
 * source is `.ts`.
 *
 * Both are answers to the same problem. The platform compiles each file
 * separately and does not rewrite import specifiers, so the name has to be the
 * compiled one; and a static import that fails takes the whole module down
 * before the handler exists, which the platform reports as an opaque 500 with
 * no way to tell a missing module from a broken one. Loading it here means a
 * resolution failure arrives as a message we can read.
 *
 * It fails closed: without the gate there is no admission decision, so there
 * is no submission either.
 */
interface RelayDeps {
  admits: (funcXdr: string, cfg: GuardConfig) => Promise<boolean>
  parseList: (value: string | undefined) => string[]
  INCLUSION_FEE: string
  paddedResourceFee: (quoted: bigint) => bigint
}

let cachedDeps: RelayDeps | null = null

async function loadDeps(): Promise<RelayDeps | string> {
  if (cachedDeps) return cachedDeps
  try {
    const [guard, fees] = await Promise.all([import('./_lib/guard.js'), import('./_lib/fees.js')])
    cachedDeps = {
      admits: guard.admits,
      parseList: guard.parseList,
      INCLUSION_FEE: fees.INCLUSION_FEE,
      paddedResourceFee: fees.paddedResourceFee,
    }
    return cachedDeps
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

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

function guardConfig(server: Server, deps: RelayDeps): GuardConfig {
  return {
    contracts: deps.parseList(process.env.RELAY_ALLOWED_CONTRACTS),
    wasmHashes: deps.parseList(process.env.RELAY_ALLOWED_WASM),
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

/**
 * Pull the host function and its signed authorization out of an envelope.
 *
 * A wallet deployment arrives this way, and it must not simply be fee-bumped.
 * The kit signs it with a *shared, sign-only* deployer that never pays, so the
 * signature that matters lives in the authorization entries rather than on the
 * envelope — and the envelope's source account is a deployer whose sequence
 * number every other user of the library is also consuming. Bumping it makes
 * the deployment race strangers.
 *
 * Taken apart and resubmitted on our own account, it becomes an ordinary
 * sponsored call: same gate, same fee path, no shared sequence. Returns null
 * for anything that is not exactly one host-function operation, which is the
 * case the envelope path still has to handle.
 */
function decomposeEnvelope(
  envelopeXdr: string,
): { func: xdr.HostFunction; auth: xdr.SorobanAuthorizationEntry[] } | null {
  try {
    const tx = TransactionBuilder.fromXDR(envelopeXdr, NETWORK_PASSPHRASE)
    const operations = 'operations' in tx ? tx.operations : []
    if (operations.length !== 1) return null
    const operation = operations[0]
    if (operation.type !== 'invokeHostFunction') return null
    return { func: operation.func, auth: operation.auth ?? [] }
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
  deps: RelayDeps,
): Promise<{ hash: string; status: string }> {
  const address = keypair.publicKey()
  const sequence = (await server.getAccount(address)).sequenceNumber()
  const build = (sorobanData?: xdr.SorobanTransactionData): Transaction =>
    new TransactionBuilder(new Account(address, sequence), {
      fee: deps.INCLUSION_FEE,
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
    xdr.Int64.fromString(deps.paddedResourceFee(BigInt(data.resourceFee().toString())).toString()),
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
  deps: RelayDeps,
): Promise<{ hash: string; status: string }> {
  const inner = TransactionBuilder.fromXDR(envelopeXdr, NETWORK_PASSPHRASE) as Transaction

  /*
   * A fee bump names what it will pay *per operation of the inner
   * transaction*, and the network refuses a bid below what the inner
   * transaction already offers. A Soroban deployment carries its resource fee
   * inside that number, which puts it orders of magnitude above any flat
   * inclusion fee — so the bid has to be read off the transaction being
   * bumped, not chosen in advance. Bidding a constant here is what makes a
   * wallet deployment fail while every ordinary call succeeds.
   */
  const operations = BigInt(Math.max(inner.operations.length, 1))
  const perOperation = (BigInt(inner.fee) + operations - 1n) / operations
  const floor = BigInt(deps.INCLUSION_FEE)
  const bid = (perOperation > floor ? perOperation : floor) + floor

  const bumped = TransactionBuilder.buildFeeBumpTransaction(
    keypair,
    bid.toString(),
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
  const deps = await loadDeps()
  if (typeof deps === 'string') {
    console.error('[relay] could not load its admission gate:', deps)
    return json({ error: 'Relay is unavailable.', detail: deps }, 503)
  }

  const keypair = sponsor()
  if (!keypair) return json({ error: 'Relay is not configured.' }, 503)

  const body: unknown = await request.json().catch(() => null)
  if (body === null || typeof body !== 'object') return json({ error: 'Malformed request.' }, 400)

  const { func, auth, xdr: envelope } = body as Record<string, unknown>
  const isCall = typeof func === 'string' && Array.isArray(auth)
  const isEnvelope = typeof envelope === 'string' && envelope.length > 0
  if (!isCall && !isEnvelope) return json({ error: 'Malformed request.' }, 400)

  const server = new Server(RPC_URL)

  /* An envelope carrying exactly one host function is taken apart and treated
     as an ordinary call — see `decomposeEnvelope`. Only what cannot be taken
     apart goes down the fee-bump path. */
  const decomposed = isCall ? null : decomposeEnvelope(envelope as string)
  const gated = isCall ? func : (decomposed?.func.toXDR('base64') ?? null)
  if (gated === null || !(await deps.admits(gated, guardConfig(server, deps)))) {
    return json({ error: 'Not allowed.' }, 403)
  }

  try {
    let result
    if (isCall) {
      result = await submitHostFunction(
        server,
        keypair,
        xdr.HostFunction.fromXDR(func, 'base64'),
        (auth as string[]).map((entry) => xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')),
        deps,
      )
    } else if (decomposed) {
      result = await submitHostFunction(server, keypair, decomposed.func, decomposed.auth, deps)
    } else {
      result = await submitEnvelope(server, keypair, envelope as string, deps)
    }
    return json(result, 200)
  } catch (error) {
    /* The detail rides along for the same reason the loader's does: the
       platform gives no way to read a function's own exception from outside,
       and a relay that fails silently costs a deploy cycle per guess. */
    const detail = error instanceof Error ? error.message : String(error)
    console.error('[relay] submit failed:', error)
    return json({ error: 'Relay failed.', detail }, 502)
  }
}
