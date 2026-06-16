# Remaining crypto work (the rest is integration/wiring)

The interop-critical crypto is done and **bit-exact with Signal** (verified against the
reference's committed KATs / a libcrux oracle): PQXDH, the SPQR triple ratchet (incl. the
byte-exact incremental ML-KEM-768 split), sealed sender v1+v2, the zkgroup auth credential +
presentation, the zkgroup core (SHO/Elligator/Lizard/UID+profile-key encryption), and the
calling signaling. What remains, in rough priority:

1. **zkgroup `lizard_decode` (inverse Elligator)** — needed to recover an ACI/PNI from a
   `UidCiphertext` on the RECEIVE path (reading group member identities). We have encode; port
   the inverse from `curve25519-dalek-signal` `lizard/jacobi_quartic.rs` (`elligator_inv`, `dual`)
   + `lizard_ristretto.rs` (`elligator_ristretto_flavor_inverse`, the 8-candidate loop). Verify
   by round-trip (encode → decode) against our existing Lizard KATs. ~150 LoC.

2. **zkgroup `ExpiringProfileKeyCredential`** — the legacy blind-ElGamal KVAC profile path
   (`zkgroup/src/crypto/proofs.rs`, different generator ordering). Needed for versioned profile
   fetch (`GET /v1/profile/{aci}/{version}/{credentialRequest}`) and for presenting member
   profile-key credentials in groups. Verify against the integration-test profile KAT. ~600 LoC.

3. **Sealed sender — referenced-by-id server certificate** — our impl handles only *embedded*
   server certs in a SenderCertificate. Real Signal sender certs reference the server cert by id
   (prod id 3). Add the `KNOWN_SERVER_CERTIFICATES` table (`sealed_sender.rs:58-87`) so we can
   verify production sealed-sender messages on receive. Small.

4. **SVR2 / registration-lock PIN** — for NEW-account registration with a PIN + recovery password
   (`POST /v1/registration` reglock path). Summarized in Docs/02 §A.5; the SVR2 enclave value
   store. Only needed for the new-account flow with a PIN (linking doesn't need it).

5. **CDSI — out of scope** (SGX remote attestation, not clean-room-practical). Not a TODO to
   implement: the roster comes from storage-service ContactRecords + incoming messages + group
   rosters instead (Docs/06). Document, don't chase.

Notes / verified-OK (no action):
- ML-KEM decapsulation uses `@noble` `ml_kem768.decapsulate` (FO transform / implicit rejection
  handled by @noble) — fine.
- The SPQR `pq_ratchet` bytes are byte-exact; ensure the MESSAGING layer actually puts them in
  `SignalMessage.pq_ratchet` (field 5) and mixes the SPQR key into the message keys via
  `deriveTripleRatchetKeys` — that's an integration item (see the messaging keystone), not new crypto.
