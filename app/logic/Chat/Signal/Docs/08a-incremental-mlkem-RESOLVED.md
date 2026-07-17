# SPQR incremental ML-KEM-768 — the doubt, the detection, the finding

This resolves the one flagged interop risk in `08-post-quantum-ratchet-spqr.md` §10 #1.

## The doubt

SPQR streams an ML-KEM-768 key + ciphertext in pieces (`pk1`, `pk2`, `ct1`, `ct2`)
via libcrux's `mlkem768::incremental`. libcrux can compute `ct1` from the 64-byte
header (`pk1`) alone, before it has the full encap key; `@noble`'s one-shot
`encapsulate` needs the whole key. The first SPQR port therefore *invented* a
self-interop layout (full ciphertext as `ct2` + a 32-byte `ct1` commitment), which
is **not** wire-compatible with real Signal. Two specific doubts:

1. **Byte layout** — is libcrux's incremental `pk1/pk2/ct1/ct2` just the *standard*
   FIPS-203 ML-KEM-768 components, sliced at the standard boundaries? Or some
   libcrux-specific repacking/compression?
2. **Timing** — does the SPQR braid require a party to emit `ct1` *before* it has
   received `pk2`? If yes, a `@noble`-only client can't compute `ct1` at that point.

## How to detect failure (the oracle)

`@noble`'s `ml_kem768.encapsulate(ek, m)` is deterministic and FIPS-203-compliant.
`libcrux-ml-kem` is pure Rust (no protoc needed). So: build a tiny libcrux harness
(`/tmp/mlkem-ref`), dump `pk1/pk2/ct1/ct2/ss` for a fixed `(seed, m)`, and compare
against `@noble`'s standard output sliced at the FIPS-203 boundaries. Any divergence
pinpoints exactly which component/encoding differs. This is captured permanently in
`test/logic/Chat/Signal/incrementalMlKem.test.ts`.

## The finding — doubt #1 is RESOLVED (byte-exact)

For `seed = 0x07×64`, `m = 0x09×32`, libcrux's incremental bytes are **byte-identical**
to standard `@noble` ML-KEM-768 sliced thus:

```
ek (1184) = pk2 (ek[0:1152], byte-encoded t̂)  ‖  ρ (ek[1152:1184])
pk1 (64)  = ρ (32)  ‖  SHA3-256(ek) (32)
ct        = encapsulate(ek, m).cipherText (1088)
ct1 (960) = ct[0:960]   (compressed u)
ct2 (128) = ct[960:1088] (compressed v)
ss  (32)  = encapsulate(ek, m).sharedSecret
```

All five (`pk1`, `pk2`, `ct1`, `ct2`, `ss`) match the reference. So **no from-scratch
FIPS-203 IND-CPA reimplementation is needed** for byte-exactness; `incrementalMlKem.ts`
must simply use this split. (The shared secret also matches, so decapsulation interops.)

Verified: `npx vitest run test/logic/Chat/Signal/incrementalMlKem.test.ts` ✓.

## Remaining doubt — #2 (timing)

`ct1` and `ss` mathematically depend only on `pk1` (ρ → matrix Â; H(ek) → coins) + `m`
— libcrux computes them from the header. With `@noble` we can only compute them once we
hold the full `ek` (i.e. after `pk2`). For **interop**, the question is whether the braid
schedule ever forces a party to *send* `ct1` chunks before it has reconstructed `pk2`.
If it never does (a party can wait for full `ek`, then compute `encapsulate(ek,m)` and
stream `ct1`/`ct2` — the bytes are identical either way), the `@noble` split suffices.
If it does, that single spot — and only that spot — would need the header-only `ct1`
(a partial IND-CPA encrypt). **Do not implement that yet**; first confirm from the braid
schedule (`/tmp/spqr/src/v1/*.rs`, `states.rs`) whether header-only `ct1` is required.

## The fix

Rewrite `Encryption/SPQR/incrementalMlKem.ts` to the split above (drop the self-interop
commitment layout) and make `braid.ts` carry the real 960/128 `ct1`/`ct2`. Keep the
SPQR self-interop tests passing and add the golden-vector assertion to the new output.
