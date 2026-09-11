# Passkey entry point — and how to remove it

A Testnet-only, wallet-free way in: the reader taps once, the platform
authenticator fires, a Soroban smart wallet is deployed and funded for them,
and they are inside the app. It exists for one reason — to collect feedback
from people who do not already own a Stellar wallet — and it is **meant to be
removed** when the protocol moves to mainnet, where a sponsored, recovery-less,
server-funded wallet is the wrong shape.

This document is the removal procedure. Keep it current as the feature grows.

## Where the values go

The hosting dashboard and a local `.env` are independent; the deploy never
reads the local file. What each one is for:

| | Dashboard | Local `.env` |
| --- | --- | --- |
| The deployed site | **required** | ignored |
| `npm run dev` | ignored | the control appears, but `api/` does not run |
| `vercel dev` | ignored | **required** |

`npm run dev` is Vite alone. It does not serve `api/`, so `/api/relay` is a 404
locally whatever the environment says — which reads as a broken relay rather
than a missing server. Use `vercel dev` to exercise the whole path.

`.env.example` names every variable the feature needs, with the two public
values filled in and the secrets left blank.

## The kill switch

Clearing `VITE_PASSKEY_WALLET_WASM_HASH` turns the entry point off everywhere,
immediately, **without a rebuild or a deploy**. Configuration is the flag; there
is no second boolean to forget.

Independently, `passkeyEnabledFor()` refuses to arm on any network but Testnet.
A mainnet build has no passkey path whatever its environment says — that guard
is what makes it impossible to ship this by accident, and it is pinned by a
test.

## Removing it properly

Everything the feature owns lives in two places and can be deleted whole:

```
src/lib/passkey/     the client seam, capability probe, kill switch
api/                 the relay and faucet functions, plus _lib/ (admission
                     gate, fee helpers) — kept beside them because the
                     serverless bundler will not follow an import out of api/
```

Everything it touches **outside** those folders is tagged. To see the entire
surface at any time:

```
grep -rn "PASSKEY-ENTRY" src api vite.config.ts vercel.json package.json
```

Removal, in order:

1. `rm -rf src/lib/passkey api`
2. Delete every block tagged `PASSKEY-ENTRY` (the grep above lists them).
3. `npm uninstall passkey-kit buffer`. There is no bundler change to undo —
   the Buffer global is installed inside the kit seam immediately before
   `passkey-kit` is dynamically imported, so it never reaches the main bundle
   or `vite.config.ts`. The `@stellar/stellar-sdk` floor can drop back to
   `^16.2.0`, though leaving it is harmless.
4. Restore `vercel.json`'s rewrite to `"source": "/(.*)"`. It currently reads
   `"/((?!api/).*)"` — the negative lookahead is what keeps `/api/*` from being
   answered with `index.html`. That failure does not look like a missing route:
   the function never runs and the client fails parsing HTML as JSON.
5. Remove `SPONSOR_SECRET` / `DISPENSER_SECRET` and the `RELAY_*` variables from
   the hosting dashboard, and **merge the two testnet keypairs back out** so no
   funded key is left sitting unused.
6. `npm run lint && npx tsc -b --noEmit && npx vitest run && npm run build`

## Touch points outside the feature's own folders

Kept as a list so step 2 above is checkable rather than a hunt. Add a row
whenever the feature reaches into an existing file.

| File | What was added |
| --- | --- |
| `src/config.ts` | `passkeyWalletWasmHash` field and its env read |
| `vercel.json` | `/api/*` excluded from the SPA rewrite (see below) |
| `package.json` | `passkey-kit`, `buffer`, and the `@stellar/stellar-sdk` floor at `^16.3.0` |
| `tsconfig.node.json` | `api` added to `include` so the functions are typechecked |
| `src/lib/contracts/base.ts` | one branch in `invokeWrite`, plus the session import |
| `src/context/WalletContext.tsx` | the passkey address merged into the session, `isPasskey`/`adoptPasskey` |
| `src/components/PasskeySignIn.tsx` | the entry control (delete the file) |
| `src/components/ConnectPrompt.tsx` | renders `<PasskeySignIn />` above the wallet button |
| `src/components/OverviewPanel.tsx` | renders `<PasskeySignIn />` under the next-step card while disconnected |
| `src/components/AccountDrawer.tsx` | renders `<PasskeySignIn />` above the connect-a-wallet row |
| `src/components/AppEntry.tsx` | renders `<PasskeySignIn />` in the entry sheet |

Note that `RequireSession`, `AppEntry` and `useEnterOnConnect` are **not** part
of this feature — the gate stands on its own and keeps working with only the
wallet path. Removing the passkey feature means deleting the one
`<PasskeySignIn />` line inside `AppEntry`, not the entry sheet itself.

## Share one URL with testers

A passkey is bound to the hostname it was created on, and the kit takes that
from the current origin. Vercel gives a project two kinds of address: a stable
production alias, and a per-deployment one carrying a build hash
(`everspan-nf9gwnhqs-…`). They are not interchangeable here.

The live one is `https://everspanfi.vercel.app`. Hand testers that. A passkey created on a per-deployment URL
stops resolving the next time anything is pushed, taking the reader's funded
wallet with it — not at some future migration, but at the next deploy. Nothing
in the code can detect this; it is purely which link gets shared.

## Known gaps, stated rather than hidden

- **The faucet is bounded, not rate-limited.** A serverless function has no
  shared state, so there is no per-hour cap. What bounds it instead: one
  dispense per wallet, a deliberately small amount, and a reserve floor that
  stops the dispenser before it empties. Passkey creation is fully automatable
  — a scripted authenticator can mint wallets in a loop — so treat the reserve
  as the real limit and refill deliberately rather than on a schedule.
- ~~`api/` imports from `src/lib/`~~ — it did, and it failed exactly as
  predicted: the serverless bundler resolves what sits under `api/`, and an
  import reaching outside it threw while the module was loading. That surfaces
  as a 500 with a platform error id *before* the handler runs, so even a
  malformed body came back 500 instead of 400 — which is the tell. The
  admission gate and the fee helpers now live in `api/_lib/`, still pure and
  still covered (`vitest.config.ts` includes `api/**/*.test.ts`).

  Two rules came out of getting this wrong twice. **Never import from `api/`
  into `src/`** — the function bundle does not reach outside `api/`. And
  **relative imports inside `api/` carry a `.js` extension**, because the
  platform compiles each file separately without rewriting specifiers;
  extensionless fails (bundler resolution only satisfies the typechecker) and
  `.ts` fails once the file on disk is `.js`.

  `relay.ts` loads its gate with a dynamic import inside the handler so a
  resolution failure comes back as a readable 503 instead of an opaque 500 —
  the platform gives no way to tell a missing module from a broken one.
  Reproduce either locally in a second, without a deploy:

  ```
  node --experimental-strip-types -e "await import('./api/relay.ts')"
  ```

  The 503 carries a `detail` field with the loader's message. It only appears
  when the relay is already broken, but it does name a path — drop it once the
  deployment path is settled.

## What this feature is not

- **It has no recovery.** A passkey is bound to one device's credential store.
  Lose the device, lose the wallet. That is acceptable only because this is
  Testnet play money gathered for feedback, and the UI has to say so plainly
  rather than leave the reader to find out.
- **It is not custody-neutral by accident.** The relay pays the fee and submits,
  but it never gets to choose *what* is submitted: the user's passkey signs the
  authorization entries, and the relay may only submit those exact entries.
  Re-simulating server-side to get "fresh" auth would silently substitute the
  sponsor's authority for the user's. Don't.
- **The relay is a public endpoint.** Its whole security model is the admission
  gate that decodes the real transaction contents and checks them against an
  allowlist. Without it, it is an open faucet paying fees for anyone's contract
  calls.
