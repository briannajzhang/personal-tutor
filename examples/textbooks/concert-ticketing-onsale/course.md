# Course: Designing a Major Concert Ticketing On-Sale

## Learner

Original request: "Use Personal Tutor to teach me how to design a concert ticketing system for a major on-sale. I understand APIs and databases, but I'm not sure how to handle the traffic spike, prevent seats from being double-booked, or manage the checkout flow."

Goal: practical system-design fluency for major on-sales.
Background: intermediate; comfortable with APIs and databases, needs the high-traffic coordination model.
Depth: deep mechanism explanation.
Pace and practice: normal pace, medium-to-heavy practice with design decisions, failure diagnosis, and concrete artifacts.

## Outcome

After this course, the learner can:

- Design a ticketing on-sale path that absorbs a sudden demand spike without letting every request reach the inventory critical section.
- Explain and implement the difference between seat search, seat hold, payment, order finalization, and ticket issuance.
- Prevent double-booking with durable inventory invariants, not cache checks or optimistic UI state.
- Design checkout as a short-lived state machine with leases, idempotency, retries, payment webhooks, and cleanup.
- Reason about fairness, bot pressure, observability, and failure drills for launch-day operations.

## Course map

- [x] The On-Sale Control Plane. Published now. Build the first mental model: queue the demand, bound checkout admission, put seats under expiring holds, and finalize orders idempotently.
- [x] Seat Inventory Is a Ledger, Not a Cache. Published now. Model reserved seating, general admission, holds, expirations, constraints, and transaction boundaries.
- [x] The Waiting Room and Admission Gate. Published now. Design queue tokens, rate limits, fairness, bot resistance, and graceful degradation.
- [x] Checkout as a Saga. Published now. Carry holds through payment intent, payment result, order creation, webhook reconciliation, and ticket issuance.
- [x] Read Models for Maps and Availability. Published now. Serve seat maps and availability under heavy fan-out without making stale reads decide ownership.
- [x] Failure Drills and Operational Signals. Published now. Load test the bottlenecks, define launch dashboards, and rehearse payment, queue, and inventory failures.
- [x] Cumulative Design Review. Published now. Given a major tour launch scenario, produce and defend an end-to-end design.

## Active publication

Outcome: after this checkpoint, the learner can produce and defend an end-to-end design for a major concert on-sale, including admission, inventory, read models, checkout, ticket issuance, and operations.

Ideas worth developing: no new central mechanism; this checkpoint asks the learner to choose among mechanisms already taught and defend the boundaries between them.

Possible worked examples: one stadium event with reserved and GA inventory, a pre-sale waiting room, stale maps, payment delays, and ticket issuance lag.

Likely learner difficulty: leaving gaps between components; forgetting idempotency and reconciliation; making read models authoritative; designing dashboards without actions.

Practice and feedback opportunities: end-to-end design task, architecture defense prompts, mixed practice-test questions across all course tags.
