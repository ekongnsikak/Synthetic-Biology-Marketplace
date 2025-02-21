;; Organism Design Contract

(define-data-var next-design-id uint u0)

(define-map organism-designs
  { design-id: uint }
  {
    name: (string-ascii 64),
    description: (string-utf8 256),
    contributors: (list 10 principal),
    gene-sequences: (list 10 uint)
  }
)

(define-public (create-design (name (string-ascii 64)) (description (string-utf8 256)))
  (let
    ((design-id (+ (var-get next-design-id) u1)))
    (var-set next-design-id design-id)
    (ok (map-set organism-designs
      { design-id: design-id }
      {
        name: name,
        description: description,
        contributors: (list tx-sender),
        gene-sequences: (list)
      }
    ))
  )
)

(define-public (add-contributor (design-id uint) (contributor principal))
  (let
    ((design (unwrap! (map-get? organism-designs { design-id: design-id }) (err u404))))
    (asserts! (is-eq tx-sender (unwrap-panic (element-at (get contributors design) u0))) (err u403))
    (ok (map-set organism-designs
      { design-id: design-id }
      (merge design { contributors: (unwrap-panic (as-max-len? (append (get contributors design) contributor) u10)) })
    ))
  )
)

(define-public (add-gene-sequence (design-id uint) (sequence-id uint))
  (let
    ((design (unwrap! (map-get? organism-designs { design-id: design-id }) (err u404))))
    (asserts! (is-some (index-of (get contributors design) tx-sender)) (err u403))
    (ok (map-set organism-designs
      { design-id: design-id }
      (merge design { gene-sequences: (unwrap-panic (as-max-len? (append (get gene-sequences design) sequence-id) u10)) })
    ))
  )
)

(define-read-only (get-design (design-id uint))
  (map-get? organism-designs { design-id: design-id })
)

