;; Biosafety Verification Contract

(define-constant CONTRACT_OWNER tx-sender)

(define-map verifiers principal bool)

(define-map verified-organisms
  { design-id: uint }
  { is-verified: bool, verifier: (optional principal) }
)

(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-set verifiers verifier true))
  )
)

(define-public (remove-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-delete verifiers verifier))
  )
)

(define-public (verify-organism (design-id uint))
  (begin
    (asserts! (default-to false (map-get? verifiers tx-sender)) (err u403))
    (ok (map-set verified-organisms
      { design-id: design-id }
      { is-verified: true, verifier: (some tx-sender) }
    ))
  )
)

(define-read-only (is-organism-verified (design-id uint))
  (default-to
    { is-verified: false, verifier: none }
    (map-get? verified-organisms { design-id: design-id })
  )
)

(define-read-only (is-verifier (address principal))
  (default-to false (map-get? verifiers address))
)

