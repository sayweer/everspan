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
} from '@stellar/stellar-sdk'
import { Api, Server } from '@stellar/stellar-sdk/rpc'

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

  const held = await balance(server, source, wallet)
  if (held !== null && held > 0n) return json({ error: 'This wallet already has funds.' }, 409)

  const reserves = await balance(server, source, source)
  if (reserves !== null && reserves < RESERVE_XLM * STROOPS) {
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
    if (sent.status === 'ERROR') {
      throw new Error(`rejected: ${JSON.stringify(sent.errorResult ?? {})}`)
    }
    return json({ hash: sent.hash, amount: DISPENSE_XLM.toString() }, 200)
  } catch (error) {
    console.error('[faucet] dispense failed:', error)
    return json({ error: 'Could not send starting funds. Try again shortly.' }, 502)
  }
}
