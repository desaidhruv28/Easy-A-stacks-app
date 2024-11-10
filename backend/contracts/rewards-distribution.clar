;; Leaderboard Rewards Distribution Contract

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))

;; Data vars
(define-data-var contract-owner principal tx-sender)

;; Public functions
(define-public (distribute-reward (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX to recipient
    (try! (stx-transfer? amount tx-sender recipient))

    (ok true)
  )
)

;; Getter for contract owner
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)