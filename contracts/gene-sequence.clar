;; Gene Sequence Contract

(define-data-var next-sequence-id uint u0)

(define-map gene-sequences
  { sequence-id: uint }
  {
    owner: principal,
    sequence: (string-ascii 256),
    is-licensed: bool
  }
)

(define-public (register-sequence (sequence (string-ascii 256)))
  (let
    ((sequence-id (+ (var-get next-sequence-id) u1)))
    (var-set next-sequence-id sequence-id)
    (ok (map-set gene-sequences
      { sequence-id: sequence-id }
      {
        owner: tx-sender,
        sequence: sequence,
        is-licensed: false
      }
    ))
  )
)

(define-public (license-sequence (sequence-id uint))
  (let
    ((sequence (unwrap! (map-get? gene-sequences { sequence-id: sequence-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner sequence)) (err u403))
    (ok (map-set gene-sequences
      { sequence-id: sequence-id }
      (merge sequence { is-licensed: true })
    ))
  )
)

(define-public (transfer-ownership (sequence-id uint) (new-owner principal))
  (let
    ((sequence (unwrap! (map-get? gene-sequences { sequence-id: sequence-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner sequence)) (err u403))
    (ok (map-set gene-sequences
      { sequence-id: sequence-id }
      (merge sequence { owner: new-owner })
    ))
  )
)

(define-read-only (get-sequence (sequence-id uint))
  (map-get? gene-sequences { sequence-id: sequence-id })
)

