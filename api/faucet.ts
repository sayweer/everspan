/**
 * Starting funds for a freshly deployed smart wallet.
 *
 * Friendbot cannot do this. It creates and funds classic `G…` accounts, and a
 * classic payment cannot target a contract address at all — so a smart wallet
 * has to be funded by moving XLM through the native asset's SAC instead.
 *
 * PASSKEY-ENTRY — see docs/passkey.md for how this comes out.
 */
import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk'
import { Api, Durability, Server } from '@stellar/stellar-sdk/rpc'

const RPC_URL = process.env.RELAY_RPC_URL ?? 'https://soroban-testnet.stellar.org'
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
/* The native asset's Stellar Asset Contract on Testnet — the same id this app
   already uses as the Blend market's underlying. */
const XLM_SAC =
  process.env.FAUCET_XLM_SAC ?? 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'

const STROOPS = 10_000_000n
/* Enough to deploy, wrap, split and trade a few times over. Deliberately not
   generous: every unit handed out is a unit an automated sign-up loop can
   take, and a reader who runs out can ask again from a second wallet. */
const DISPENSE_XLM = 100n
/* Below this the dispenser stops. It bounds the total a drain can take without
   needing shared state, which a serverless function does not have. */
const RESERVE_XLM = 50n

const CONTRACT_ID = /^C[A-Z2-7]{55}$/

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function dispenser(): Keypair | null {
  const secret = process.env.DISPENSER_SECRET ?? process.env.SPONSOR_SECRET
  if (!secret) return null
  try {
    return Keypair.fromSecret(secret)
  } catch {
    return null
  }
}

/** Read a SAC balance through simulation — free, and works for either address kind. */
async function balance(server: Server, source: string, holder: string): Promise<bigint | null> {
  try {
    const tx = new TransactionBuilder(await server.getAccount(source), {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(new Contract(XLM_SAC).call('balance', new Address(holder).toScVal()))
      .setTimeout(30)
      .build()
    const simulation = await server.simulateTransaction(tx)
    if (!Api.isSimulationSuccess(simulation) || !simulation.result) return null
    return scValToNative(simulation.result.retval) as bigint
  } catch {
    return null
  }
}

/*
 * Only a deployed contract running approved code is a wallet. The regex alone
 * admitted any C-address, and every never-used one holds zero — so the
 * one-per-wallet check was satisfied by inventing addresses. The approved
 * hashes are the relay's list, which is where the wallet's code is already
 * approved for deployment.
 */
async function runsApprovedCode(server: Server, contractId: string): Promise<boolean> {
  const allowed = (process.env.RELAY_ALLOWED_WASM ?? '')
    .split(',')
    .map((hash) => hash.trim().toLowerCase())
    .filter((hash) => hash.length > 0)
  if (allowed.length === 0) return false
  try {
    const entry = await server.getContractData(
      contractId,
      xdr.ScVal.scvLedgerKeyContractInstance(),
      Durability.Persistent,
    )
    const executable = entry.val.contractData().val().instance().executable()
    if (executable.switch().name !== 'contractExecutableWasm') return false
    return allowed.includes(executable.wasmHash().toString('hex').toLowerCase())
  } catch {
    return false
  }
}

/** Wait for the dispense to land; the reader's empty wallet is the cost of guessing. */
async function landed(server: Server, hash: string): Promise<boolean> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const { status } = await server.getTransaction(hash)
    if (status === Api.GetTransactionStatus.SUCCESS) return true
    if (status === Api.GetTransactionStatus.FAILED) return false
  }
  return false
}

export async function POST(request: Request): Promise<Response> {
  const keypair = dispenser()
  if (!keypair) return json({ error: 'Faucet is not configured.' }, 503)

  const body: unknown = await request.json().catch(() => null)
  const wallet =
    body !== null && typeof body === 'object' ? (body as { wallet?: unknown }).wallet : undefined
  if (typeof wallet !== 'string' || !CONTRACT_ID.test(wallet)) {
    return json({ error: 'Not a smart wallet address.' }, 400)
  }

  const server = new Server(RPC_URL)
  const source = keypair.publicKey()

  if (!(await runsApprovedCode(server, wallet))) {
    return json({ error: 'Not a smart wallet address.' }, 400)
  }

  // Both checks fail closed: a balance that cannot be read is not a zero one.
  const held = await balance(server, source, wallet)
  if (held === null) return json({ error: 'Could not check that wallet. Try again shortly.' }, 503)
  if (held > 0n) return json({ error: 'This wallet already has funds.' }, 409)

  // The floor has to survive the dispense, not just precede it.
  const reserves = await balance(server, source, source)
  if (reserves === null || reserves < (RESERVE_XLM + DISPENSE_XLM) * STROOPS) {
    return json({ error: 'The faucet is empty. Tell us and we will refill it.' }, 503)
  }

  try {
    const built = new TransactionBuilder(await server.getAccount(source), {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        new Contract(XLM_SAC).call(
          'transfer',
          new Address(source).toScVal(),
          new Address(wallet).toScVal(),
          nativeToScVal(DISPENSE_XLM * STROOPS, { type: 'i128' }),
        ),
      )
      .setTimeout(120)
      .build()

    const prepared = await server.prepareTransaction(built)
    prepared.sign(keypair)
    const sent = await server.sendTransaction(prepared)
    if (sent.status === 'ERROR' || sent.status === 'TRY_AGAIN_LATER') {
      throw new Error(`rejected (${sent.status}): ${JSON.stringify(sent.errorResult ?? {})}`)
    }
    if (!(await landed(server, sent.hash))) throw new Error(`not confirmed: ${sent.hash}`)
    return json({ hash: sent.hash, amount: DISPENSE_XLM.toString() }, 200)
  } catch (error) {
    console.error('[faucet] dispense failed:', error)
    return json({ error: 'Could not send starting funds. Try again shortly.' }, 502)
  }
}
