/**
 * The documentation itself. The shell in `src/routes/Docs.tsx` owns navigation
 * and layout; this file is only the writing, in the order `DOCS_SECTIONS`
 * declares.
 *
 * Copy is written as whole sentences in single text nodes wherever it can be:
 * the language bridge in `LanguageContext` translates a text node at a time,
 * so a sentence broken across three elements is three separate lookups and
 * translates in pieces. Inline links and code are therefore kept to their own
 * short fragments, with the surrounding prose left intact.
 */
import type { ReactElement } from 'react'
import { markets, explorerContractUrl, config } from '../../config'
import {
  AddressRow,
  Bullets,
  Callout,
  Faq,
  Formula,
  LinkOut,
  Numbered,
  P,
  Section,
  Sub,
  Table,
  Terms,
} from './prose'
import { DOCS_SECTIONS } from './outline'

const REPO = 'https://github.com/sayweer/everspan'

function meta(id: string): { index: number; title: string; lede: string } {
  const index = DOCS_SECTIONS.findIndex((section) => section.id === id)
  const section = DOCS_SECTIONS[index]
  return { index: index + 1, title: section.title, lede: section.lede }
}

export function DocsBody(): ReactElement {
  return (
    <div className="pt-12 sm:pt-16">
      <Overview />
      <Protocol />
      <Markets />
      <UsingTheApp />
      <Security />
      <Contracts />
      <Troubleshooting />
      <Questions />
      <Glossary />
      <Resources />
    </div>
  )
}

function Overview(): ReactElement {
  return (
    <Section id="overview" {...meta('overview')}>
      <P>
        An asset that earns yield gives you two different things at once: the money you will get
        back, and the yield it produces while you hold it. Everspan separates them. A deposit
        becomes two tokens — one that pays a fixed amount at a known date, and one that collects
        everything the deposit earns until that date.
      </P>
      <P>
        Both are ordinary transferable tokens with their own market price, so each side can be held,
        sold or bought on its own. Somebody who wants certainty buys the first at a discount and
        redeems it in full at maturity; the discount is their fixed return. Somebody who wants
        exposure to the rate buys the second, and earns whatever the deposit actually releases.
      </P>

      <Sub title="Why this exists">
        <P>
          Almost all on-chain yield is variable by construction. You deposit, and what you earn is
          whatever the pool pays next week. That is fine until you need to plan around it — and
          there is no way to take the opposite side of it either, no way to say "I think this rate
          is going higher" without also taking on the principal.
        </P>
        <P>
          Separating principal from yield makes both trades possible at once, and neither side needs
          to trust the other. The protocol holds the deposit, and the rules that decide who is owed
          what run on chain.
        </P>
      </Sub>

      <Sub title="What you can do with it">
        <Bullets
          items={[
            'Lock a fixed return. Buy a principal position at a discount and redeem it one-for-one at maturity. The rate is fixed the moment you buy.',
            'Hold yield exposure. Take the yield side of a deposit, with no principal attached, and collect what it releases before maturity.',
            'Earn trading fees. Provide both sides of a pool and take a share of the 0.30% charged on every swap through it.',
            'Trade either side at any time. Both positions are transferable tokens, and both have a pool until their maturity passes.',
          ]}
        />
      </Sub>

      <Callout tone="warning" title="Testnet only">
        Everspan is deployed on Stellar Testnet and nowhere else. Balances carry no monetary value,
        the network is reset periodically by the SDF, and there is no mainnet configuration in the
        codebase. Treat everything here as a working demonstration of the mechanism, not as a place
        to put money.
      </Callout>
    </Section>
  )
}

function Protocol(): ReactElement {
  return (
    <Section id="protocol" {...meta('protocol')}>
      <Sub title="Standardized Yield">
        <P>
          Every yield source enters Everspan through one interface, called Standardized Yield. A
          vault takes the underlying asset and exposes a single exchange rate that can only ever go
          up. Everything above the vault — the split, the settlement, the market — is written
          against that one rate and does not know or care where the yield came from.
        </P>
        <P>
          You will rarely see this in the app. You deposit the asset you already hold, and when a
          wrap is needed Everspan shows it as an explicit Prepare step with its own approval, rather
          than hiding an extra token in the middle of your balance.
        </P>
      </Sub>

      <Sub title="Principal and Yield">
        <P>
          Splitting one unit of Standardized Yield at a maturity mints exactly one Principal token
          and one Yield token for that maturity. Both are real SEP-41 tokens, deployed by the
          protocol as a fresh pair per maturity, and both can be sent to anyone.
        </P>
        <Table
          caption="What each position pays"
          head={['Position', 'What it pays', 'At maturity']}
          rows={[
            [
              'Principal',
              'Nothing until maturity. Its value is what it redeems for.',
              'Redeems for the full underlying amount, one for one.',
            ],
            [
              'Yield',
              'Everything the deposit releases, claimable as it accrues.',
              'Stops accruing at the maturity timestamp, exactly.',
            ],
          ]}
        />
        <P>
          Before maturity the two supplies are always equal: every Principal token that exists has a
          Yield token somewhere that was minted with it. After maturity that stops being true by
          design, because redeeming burns Principal while the matured Yield side simply goes inert.
        </P>
      </Sub>

      <Sub title="The four operations">
        <Numbered
          items={[
            {
              title: 'Split',
              text: 'Hand the protocol standardized yield and receive equal amounts of Principal and Yield for one maturity.',
            },
            {
              title: 'Merge',
              text: 'The reverse: return equal amounts of both before maturity and get the deposit back. A split followed immediately by a merge returns the same amount, minus at most two stroops of rounding.',
            },
            {
              title: 'Claim',
              text: 'Pay out the yield a Yield position has accrued so far, without giving up the position.',
            },
            {
              title: 'Redeem',
              text: 'After maturity, burn Principal and receive the underlying at the rate frozen at the maturity timestamp.',
            },
          ]}
        />
      </Sub>

      <Sub title="How yield is accounted for">
        <P>
          Because a Yield token can be transferred, the protocol cannot simply divide the total
          yield by the number of holders at the end. It tracks a settlement index per holder: the
          exchange rate the last time that holder was settled. Settling at a current rate credits
          the difference and moves the index up to it.
        </P>
        <Formula
          expression="released = floor(yt · S / index) − ceil(yt · S / R)"
          caption="S is the stroop scale, index is the holder’s last settlement rate, and R is the rate now — frozen at the maturity rate once maturity has passed. The result is clamped at zero."
        />
        <P>
          Every user-initiated change to a Yield balance settles both parties first, using the
          balances as they were before the change. The sender keeps everything accrued up to that
          instant and the receiver starts earning from it, so a transfer can never move somebody
          else's accrued yield along with the token.
        </P>
      </Sub>

      <Sub title="Rounding and solvency">
        <P>
          One rule governs every amount in the protocol: anything that leaves is rounded down,
          anything reserved against a liability is rounded up. The consequence is that the balance
          the contract holds is always at least the sum of everything it owes, so there is never
          dust that somebody could mint out of the rounding.
        </P>
        <Bullets
          items={[
            'Principal supply equals Yield supply for a maturity, through every pre-maturity operation.',
            'Split then merge returns the deposit minus at most two stroops — one floor in each direction.',
            'Yield stops accruing exactly at the maturity timestamp, and Principal then redeems at the rate frozen there.',
            'A scripted lifecycle test asserts solvency after every single operation, on both yield sources.',
          ]}
        />
      </Sub>
    </Section>
  )
}

function Markets(): ReactElement {
  return (
    <Section id="markets" {...meta('markets')}>
      <P>
        Splitting a deposit creates the two positions, but it does not price them. That happens in
        the market: one constant-product pool per maturity, holding Principal on one side and the
        deposit on the other, with a fixed 0.30% fee on every swap that goes to the people providing
        the liquidity.
      </P>

      <Sub title="Where the fixed rate comes from">
        <P>
          A principal position redeems for a full unit at maturity, so before maturity it trades
          below one. That discount is the whole trade. Pay less than a unit now, receive a full unit
          later, and the gap between the two — annualized over the time left — is the rate you have
          locked.
        </P>
        <Formula
          expression="APY = (1 / cost) ^ (365 days / time to maturity) − 1"
          caption="cost is what one unit of principal costs today, in the deposit asset."
        />
        <P>
          Paying 0.958 for a principal position that matures in 90 days locks roughly 19% annualized
          — and it is locked, because nothing after the purchase changes what the position redeems
          for. The rate the app shows you before you confirm is the rate that trade produces,
          including its price impact and fee.
        </P>
      </Sub>

      <Sub title="Providing liquidity">
        <P>
          A pool needs both sides. Adding liquidity deposits Principal and the deposit asset
          together and mints pool shares in proportion; burning those shares later returns a
          pro-rata slice of whatever the pool holds at that moment, fees included.
        </P>
        <P>
          The usual warning about impermanent loss applies, with one difference worth knowing: a
          principal position converges to exactly one unit as its maturity approaches, so the price
          a pool is exposed to does not wander indefinitely — it walks towards a known endpoint.
        </P>
      </Sub>

      <Sub title="The two yield sources">
        <P>
          Everspan ships two entirely separate deployments, switchable in the app. They share no
          balances and no contracts; only the token code is common. One exists to be predictable,
          the other to prove the mechanism works on yield nobody controls.
        </P>
        <Table
          caption="The two markets"
          head={['', 'mUSDY', 'XLM · Blend']}
          rows={[
            [
              'Yield source',
              'A demo token whose rate grows about 5% a year by ledger time',
              'A live Blend v2 lending pool on Testnet',
            ],
            [
              'Deposit shares',
              'Wrapped one for one with the underlying',
              'Interest-bearing shares, so a wrap mints fewer units than you put in',
            ],
            [
              'Getting the asset',
              'A public faucet on the token itself',
              'Friendbot — the underlying here is plain XLM',
            ],
            [
              'Why it exists',
              'A deterministic baseline for tests and demos',
              'Proof the same mechanics run over real, external yield',
            ],
          ]}
        />
        <Callout title="Exit can genuinely fail on Blend">
          A lending pool that is fully borrowed has nothing free to pay a withdrawal. When that
          happens Everspan surfaces Blend's own error rather than a generic failure, so you are told
          the pool has no free liquidity right now instead of being left guessing. The position is
          untouched; the withdrawal can be retried once utilisation drops.
        </Callout>
      </Sub>
    </Section>
  )
}

function UsingTheApp(): ReactElement {
  return (
    <Section id="app" {...meta('app')}>
      <Numbered
        items={[
          {
            title: 'Get an account',
            text: 'Connect a Testnet wallet — Freighter, xBull, LOBSTR or Albedo — or use the passkey entry, which creates a Testnet account on the device you are holding. Signing always happens in the wallet; Everspan never sees a secret key.',
          },
          {
            title: 'Fund it',
            text: 'On the mUSDY market, the faucet under your balance mints 1,000 mUSDY. On the Blend market the underlying is plain XLM, so Friendbot funds the account instead.',
          },
          {
            title: 'Pick an outcome, not a mechanism',
            text: 'Positions open from three plain-language choices: a fixed return, exposure to the yield, or trading fees. Everspan works out which contract calls that takes.',
          },
          {
            title: 'Lock a fixed return',
            text: 'Enter an amount in the asset you actually hold. If your wallet needs a prepared balance first, Everspan shows an explicit Prepare step before the lock, each with its own approval. The panel states the locked rate, the price impact and the minimum you will receive before you sign anything.',
          },
          {
            title: 'Or take yield exposure',
            text: 'Everspan separates the deposit and sells the principal side straight back to the pool, leaving you holding only the yield. It is a staged flow, one approval per step, and every step is named before it runs.',
          },
          {
            title: 'Watch it accrue, then claim',
            text: 'Positions shows claimable yield ticking up live between polls. Claim pays it out without closing the position; after maturity, Redeem burns the principal side and returns the underlying.',
          },
          {
            title: 'Check the record',
            text: 'Activity streams every event from every contract in the market as it is confirmed, yours or anyone else\u2019s, with a link to each transaction on the explorer.',
          },
        ]}
      />

      <Sub title="Reading the numbers">
        <Terms
          items={[
            {
              term: 'Fixed APY',
              text: 'What buying principal at the current pool price locks in, annualized to maturity. This is the rate you are actually trading at.',
            },
            {
              term: 'Underlying APY',
              text: 'What the deposit itself is earning right now. It moves; the fixed rate does not.',
            },
            {
              term: 'Price impact',
              text: 'How far your own trade moves the pool price. A large trade against a thin pool gets a worse rate, and this is where that shows.',
            },
            {
              term: 'Minimum received',
              text: 'The floor your transaction will accept, derived from your slippage setting. Below it the transaction fails rather than filling at a worse price.',
            },
            {
              term: 'Claimable',
              text: 'Yield already earned and waiting. It is projected between polls, so it moves continuously rather than in steps.',
            },
          ]}
        />
      </Sub>

      <Sub title="Advanced mode">
        <P>
          Account has a switch that reveals the raw mechanics: wrapping the underlying, splitting it
          by hand, merging it back. Nothing there is required — the ordinary flows do all of it —
          but every intermediate step is available to anyone who wants to drive the protocol
          directly.
        </P>
      </Sub>
    </Section>
  )
}

function Security(): ReactElement {
  return (
    <Section id="security" {...meta('security')}>
      <Sub title="Custody">
        <P>
          Everspan is self-custodial in the literal sense: there is no account on the protocol's
          side that holds your assets for you. Your key stays in your wallet, every transaction is
          built in your browser and signed by you, and the app never requests, stores or logs a
          secret.
        </P>
        <P>
          Every function that pays out — withdraw, unwrap, merge, claim, redeem — pays the caller
          that authorized the call, from that caller’s own recorded balance. There is no argument
          for "pay someone else" to get wrong.
        </P>
      </Sub>

      <Sub title="Admin powers, in full">
        <P>
          Four entry points in the entire workspace are admin-gated, and none of them can move a
          user's funds: minting and setting the rate on the demo token, creating a maturity, and
          creating a pool. The two vaults that actually hold deposits have no admin entry point at
          all.
        </P>
        <Bullets
          items={[
            'No upgrade path. An upgrade key is a backdoor with a friendly name, so the contracts do not have one.',
            'No pause switch and no admin rotation anywhere in the workspace.',
            'The cost of that is stated plainly: a bug cannot be patched in place, and a lost admin key stops new maturities and pools being created.',
            'What it buys: even then, every existing holder can still claim, redeem and exit, because none of those paths consult an admin.',
          ]}
        />
      </Sub>

      <Sub title="What Everspan cannot do for you">
        <Bullets
          items={[
            'Reverse a signed transaction. Once it is confirmed on the ledger it is final.',
            'Recover a lost key or passkey. Nobody holds a copy, including us.',
            'Guarantee an exit from a fully utilized lending pool. That is the pool’s liquidity, not the protocol’s.',
            'Survive a Testnet reset. When the SDF resets the network, deployed contracts and balances go with it.',
          ]}
        />
      </Sub>

      <Sub title="Habits worth keeping">
        <Bullets
          items={[
            'Never type a secret key or recovery phrase into any website, including this one. Everspan has no field that asks for one.',
            'Check the domain before you approve a signature, and check that the contract id in the request matches the one published below.',
            'Read what the wallet is asking you to sign. Everspan names each step before it runs, so the two should agree.',
            'Keep the network on Testnet. The app blocks writes and shows a banner if the wallet is pointed elsewhere.',
          ]}
        />
      </Sub>

      <Sub title="Review">
        <P>
          The contracts have been through two rounds of adversarial review, with the findings and
          the storage and time-to-live audit written up in the repository, alongside a threat model
          covering assets, actors, trust boundaries and failure modes.
        </P>
        <Bullets
          items={[
            <LinkOut key="threat" href={`${REPO}/blob/main/docs/THREAT_MODEL.md`}>
              Threat model
            </LinkOut>,
            <LinkOut key="audit" href={`${REPO}/blob/main/docs/plan/audit-round-2.md`}>
              Adversarial audit, round two
            </LinkOut>,
            <LinkOut key="testing" href={`${REPO}/blob/main/docs/TESTING.md`}>
              The test suites, per crate
            </LinkOut>,
          ]}
        />
      </Sub>
    </Section>
  )
}

function Contracts(): ReactElement {
  return (
    <Section id="contracts" {...meta('contracts')}>
      <Table
        caption="The seven contract crates"
        head={['Contract', 'Responsibility']}
        rows={[
          [
            'MockYieldToken',
            'The demo yield-bearing token. Its rate grows with ledger time and is checkpointed, so any past rate can be recovered exactly. Carries a public faucet.',
          ],
          [
            'SYVault',
            'Wraps the demo token into standardized yield, one for one. The result is itself a full SEP-41 token.',
          ],
          [
            'SYVaultBlend',
            'The same interface over a real Blend v2 lending position, with a ratchet that keeps the rate from moving backwards and a recoverable past for settlement.',
          ],
          [
            'Splitter',
            'The market for one maturity: split, merge, claim and redeem, plus the factory call that deploys a maturity’s token pair.',
          ],
          [
            'PT Token / YT Token',
            'The two positions, as transferable SEP-41 tokens minted only by the market. The yield side carries the settlement hook.',
          ],
          [
            'PT-AMM',
            'Constant-product pools, one per maturity, with a 30 basis point fee. Where the fixed rate is actually priced.',
          ],
        ]}
      />

      {markets.map((market) => (
        <Sub key={market.key} title={`${market.label} market`}>
          <P>{market.yieldSource}</P>
          <div className="max-w-2xl border-y border-neutral-950/10">
            <AddressRow
              label="Underlying"
              note={market.underlyingSymbol}
              id={market.underlyingContractId}
              href={explorerContractUrl(market.underlyingContractId)}
            />
            <AddressRow
              label="Deposit vault"
              note="Wraps the underlying into standardized yield"
              id={market.syVaultContractId}
              href={explorerContractUrl(market.syVaultContractId)}
            />
            <AddressRow
              label="Market"
              note="Split, merge, claim, redeem"
              id={market.splitterContractId}
              href={explorerContractUrl(market.splitterContractId)}
            />
            <AddressRow
              label="Pools"
              note="Constant-product principal pools"
              id={market.ammContractId}
              href={explorerContractUrl(market.ammContractId)}
            />
          </div>
        </Sub>
      ))}

      <Callout title="Per-maturity tokens">
        The Principal and Yield token addresses are not fixed: the market deploys a fresh pair when
        a maturity is created. Read them from the market with a call to get_market for that
        maturity, or from the MaturityCreated event the deployment emitted.
      </Callout>

      <P>
        Testnet is reset periodically. If an address above no longer resolves, the deployment
        scripts in the repository redeploy everything in dependency order and print the new ids.
      </P>
    </Section>
  )
}

function Troubleshooting(): ReactElement {
  return (
    <Section id="troubleshooting" {...meta('troubleshooting')}>
      <P>
        Nothing is reported as a generic failure. Every contract error is mapped to the thing that
        actually went wrong, and a problem reaching the network is named as that rather than as a
        failed transaction — because a transaction that never left is very different from one that
        was rejected.
      </P>
      <Table
        caption="What each failure means"
        head={['What you see', 'What it means', 'What to do']}
        rows={[
          [
            'The wallet is not offered',
            'That wallet is not installed, or cannot exist in this browser — an extension has no place on a phone.',
            'Install it, or use a wallet that works over WalletConnect, or use the passkey entry.',
          ],
          [
            'Nothing happens after approval',
            'The signature was declined in the wallet. The action returns to idle on purpose.',
            'Run it again and approve, if that was not deliberate.',
          ],
          [
            'Insufficient balance',
            'The amount is larger than the balance the form can spend.',
            'Lower the amount, or use the faucet on the mUSDY market.',
          ],
          [
            'Wrong network',
            'The wallet is pointed at a network other than Testnet. Writes are blocked while it is.',
            'Switch the wallet to Testnet; the banner clears by itself.',
          ],
          [
            'Connection problem',
            'The RPC endpoint could not be reached. The transaction may never have been sent.',
            'Retry. Check Activity before resending, so you do not sign the same thing twice.',
          ],
          [
            'The Blend pool has no free liquidity',
            'The lending reserve is fully utilized and cannot pay a withdrawal right now.',
            'Wait for utilisation to drop and retry. The position is unaffected.',
          ],
          [
            'Maturity passed, or not reached',
            'The operation is only valid on the other side of the maturity timestamp.',
            'Redeem after maturity; split, merge and claim before it.',
          ],
          [
            'Nothing to claim',
            'The position has no yield accrued since its last settlement.',
            'Nothing to do — a transfer or an earlier claim already settled it.',
          ],
        ]}
      />

      <Sub title="If an account looks empty">
        <P>
          An unfunded Testnet account does not exist on the ledger yet, so a balance lookup returns
          nothing rather than zero. Fund it with Friendbot and the balance appears. If it still
          looks empty afterwards, check the market switch at the top of the app: each market is a
          separate deployment with separate balances.
        </P>
      </Sub>
    </Section>
  )
}

function Questions(): ReactElement {
  return (
    <Section id="faq" {...meta('faq')}>
      <Faq
        items={[
          {
            q: 'Is my fixed rate really fixed?',
            a: 'Yes, once the trade is done. A principal position redeems for a full unit at maturity no matter what happens to the underlying rate afterwards, so the discount you bought at is your return. What is not fixed is the price of the position if you sell it before maturity.',
          },
          {
            q: 'What happens if I do nothing until maturity?',
            a: 'Principal becomes redeemable for the full underlying amount, and the yield side stops accruing at that timestamp. Neither expires, and neither is lost — both wait for you.',
          },
          {
            q: 'Can I get out early?',
            a: 'Yes. Both positions are transferable tokens with a pool until maturity, so either can be sold back at the market price. Holding both sides also lets you merge them back into the deposit directly.',
          },
          {
            q: 'Where does the yield actually come from?',
            a: 'On the mUSDY market, from a demo token whose rate grows with ledger time — nothing is being generated, it is a controlled baseline. On the Blend market it is a real lending position in a Blend v2 pool on Testnet, and the yield is whatever that pool pays.',
          },
          {
            q: 'Do I need a browser extension?',
            a: 'No. The passkey entry creates a Testnet account with the device you are holding, which is what makes the app usable on a phone. Extension wallets remain fully supported on the desktop.',
          },
          {
            q: 'Can Everspan take my funds?',
            a: 'There is no code path that would let it. Every payout goes to the caller that authorized it, from that caller’s own balance, and the vaults holding deposits have no admin entry point at all.',
          },
          {
            q: 'Why does it ask me to approve twice?',
            a: 'Because two things are happening, and each is its own on-chain call. Everspan shows the preparation step rather than bundling it invisibly, so what the wallet asks you to sign matches what the screen said it would do.',
          },
          {
            q: 'Will there be a mainnet deployment?',
            a: 'Not in this repository. There is no mainnet configuration, by design — this is a Testnet protocol built to demonstrate the mechanism end to end.',
          },
        ]}
      />
    </Section>
  )
}

function Glossary(): ReactElement {
  return (
    <Section id="glossary" {...meta('glossary')}>
      <Terms
        items={[
          {
            term: 'Principal',
            text: 'The position that redeems for the full underlying amount at maturity. On chain it is the PT token.',
          },
          {
            term: 'Yield',
            text: 'The position that collects everything the deposit releases before maturity. On chain it is the YT token.',
          },
          {
            term: 'Standardized Yield',
            text: 'The one interface every yield source is wrapped into, exposing a single rate that can only go up. Abbreviated SY.',
          },
          {
            term: 'Maturity',
            text: 'The timestamp a pair of positions is tied to. Yield stops there and principal becomes redeemable.',
          },
          {
            term: 'Exchange rate',
            text: 'How much underlying one unit of standardized yield is worth. Its growth over time is the yield.',
          },
          {
            term: 'Settlement index',
            text: 'The exchange rate at a holder’s last settlement. The gap between it and the current rate is what that holder is owed.',
          },
          {
            term: 'Fixed APY',
            text: 'The annualized return implied by what a principal position costs today and what it redeems for at maturity.',
          },
          {
            term: 'Price impact',
            text: 'How far a trade moves the pool price against itself. It grows with trade size and shrinks with pool depth.',
          },
          {
            term: 'Slippage',
            text: 'The gap you are willing to accept between the quoted price and the filled price before the transaction should fail instead.',
          },
          {
            term: 'Stroop',
            text: 'The smallest unit on Stellar, a ten-millionth. All protocol arithmetic is in stroops, never in decimals.',
          },
          {
            term: 'SEP-41',
            text: 'The Stellar token interface. Both positions and both vault share tokens implement it, so any wallet or contract can move them.',
          },
          {
            term: 'Soroban',
            text: 'Stellar’s smart contract platform. All seven Everspan contracts are Soroban contracts written in Rust.',
          },
          {
            term: 'Blend',
            text: 'A lending protocol on Stellar. Everspan’s second market sits on a real Blend v2 pool on Testnet.',
          },
          {
            term: 'Friendbot',
            text: 'The Testnet faucet that funds a new account with test XLM so it exists on the ledger.',
          },
        ]}
      />
    </Section>
  )
}

function Resources(): ReactElement {
  return (
    <Section id="resources" {...meta('resources')}>
      <Sub title="Everspan">
        <Bullets
          items={[
            <LinkOut key="repo" href={REPO}>
              Source code, all seven contracts and the frontend
            </LinkOut>,
            <LinkOut key="arch" href={`${REPO}/blob/main/docs/ARCHITECTURE.md`}>
              Architecture: diagrams, the cross-contract call inventory, the rounding law
            </LinkOut>,
            <LinkOut key="deploy" href={`${REPO}/blob/main/docs/DEPLOYMENT.md`}>
              Deployment: the scripts, end to end
            </LinkOut>,
            <LinkOut key="runbooks" href={`${REPO}/blob/main/docs/RUNBOOKS.md`}>
              Runbooks: operational procedures
            </LinkOut>,
            <LinkOut key="video" href="https://youtu.be/G_06mT7pscw">
              A two-minute walkthrough of the whole flow
            </LinkOut>,
          ]}
        />
      </Sub>

      <Sub title="Stellar and Soroban">
        <Bullets
          items={[
            <LinkOut key="soroban" href="https://developers.stellar.org/docs/build/smart-contracts">
              Soroban smart contract documentation
            </LinkOut>,
            <LinkOut
              key="sep41"
              href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md"
            >
              SEP-41, the token interface
            </LinkOut>,
            <LinkOut key="expert" href={config.stellarExpertUrl}>
              Stellar Expert, the Testnet explorer
            </LinkOut>,
            <LinkOut key="blend" href="https://blend.capital">
              Blend, the lending protocol behind the second market
            </LinkOut>,
          ]}
        />
      </Sub>

      <Sub title="Something missing?">
        <P>
          If this page did not answer your question, the architecture document goes a level deeper
          on every mechanism described here, and the contracts themselves are readable — each one is
          a few hundred lines of commented Rust.
        </P>
      </Sub>
    </Section>
  )
}
