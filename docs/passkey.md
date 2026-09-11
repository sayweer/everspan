# Passkey entry point — and how to remove it

A Testnet-only, wallet-free way in: the reader taps once, the platform
authenticator fires, a Soroban smart wallet is deployed and funded for them,
and they are inside the app. It exists for one reason — to collect feedback
from people who do not already own a Stellar wallet — and it is **meant to be
removed** when the protocol moves to mainnet, where a sponsored, recovery-less,
server-funded wallet is the wrong shape.

This document is the removal procedure. Keep it current as the feature grows.

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
api/                 the relay and faucet functions
```

Everything it touches **outside** those folders is tagged. To see the entire
surface at any time:

```
grep -rn "PASSKEY-ENTRY" src api vite.config.ts vercel.json package.json
```

Removal, in order:

1. `rm -rf src/lib/passkey api`
2. Delete every block tagged `PASSKEY-ENTRY` (the grep above lists them).
3. `npm uninstall passkey-kit buffer` and drop the Buffer polyfill from
   `vite.config.ts`.
4. Drop the `/api` exception from `vercel.json`'s rewrite.
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
