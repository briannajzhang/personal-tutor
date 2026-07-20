import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "cumulative-design-review",
  title: "Cumulative Design Review",
  description: "Defend an end-to-end on-sale design for a stadium event with admission, inventory, checkout, read models, and operations.",
  role: "cumulative-checkpoint",
  sections: [
    section({
      id: "scenario",
      title: "The Scenario You Must Defend",
      role: "assessment",
      blocks: [
        p({
          id: "purpose",
          body: "This checkpoint does not introduce a new mechanism. It asks you to assemble the course into one design and defend the boundaries. A strong answer does not say `use a queue, cache, database, and payment provider`; it says what each part is allowed to decide and what it must never decide."
        }),
        codeBlock({
          id: "tour-scenario",
          language: "text",
          code: `Major on-sale scenario
  Artist: globally popular stadium tour.
  Venue: 72,000 capacity.
  Inventory:
    48,000 reserved seats.
    18,000 general admission floor tickets.
    6,000 holds for sponsors, production, accessibility, and later release.
  Demand:
    1,400,000 buyers reach the event page in the first 8 minutes.
    780,000 are present before the sale opens.
    12% of sessions are high-risk by bot signals.
  Buyer behavior:
    Average basket is 2 tickets.
    Most buyers inspect 2-5 sections.
    Three lower-bowl sections and GA floor become hot immediately.
  Payments:
    Provider usually authorizes in under 2 seconds.
    During peak, 3% of authorizations are delayed up to 6 minutes.
  Product requirements:
    Do not oversell.
    Keep ordinary buyers oriented even when exact availability is stale.
    Prevent duplicate orders and duplicate tickets.
    Be able to pause admissions without losing valid checkouts.
    Produce an audit trail support can use after the sale.`
        }),
        diagram({
          id: "system-map-to-fill",
          title: "Defend the Boundaries",
          body: `flowchart TD
  A["Edge filters"] --> B["Waiting room"]
  B --> C["Admission gate"]
  C --> D["Map read models"]
  C --> E["Inventory holds"]
  E --> F["Checkout saga"]
  F --> G["Payment"]
  F --> H["Finalize order"]
  H --> I["Issue tickets"]
  E --> J["Inventory ledger"]
  J --> D
  K["Launch ops"] --> B
  K --> D
  K --> E
  K --> F
  K --> I`
        }),
        callout({
          id: "checkpoint-rule",
          tone: "key-idea",
          title: "Checkpoint rule",
          body: "For every arrow in your design, name the state or proof being passed. For every box, name the one decision it is allowed to make."
        })
      ]
    }),
    section({
      id: "design-task",
      title: "Produce the Design",
      role: "assessment",
      blocks: [
        p({
          id: "task-intro",
          body: "Write or sketch your design before taking the quiz. Use the prompts as a review rubric. If an answer feels vague, force it into a state transition, token claim, cache key, idempotency key, metric, or runbook action."
        }),
        list({
          id: "deliverables",
          items: [
            "Draw the request path from event-page arrival to ticket issuance. Include the waiting room, admission gate, read model, inventory transaction, checkout saga, payment provider, order finalization, ticket issuance, and reconciliation.",
            "Define the admission token: at least event scope, subject binding, expiration, nonce or session binding, scope, and budgets.",
            "Define reserved-seat and GA inventory invariants. State exactly how double-booking or oversell is rejected.",
            "Define read-model cache partitions and freshness budgets for event manifest, section status, price-level counts, and operational advisory messages.",
            "Define checkout states from active hold through payment, order finalization, ticket issuance, refund-required/manual-review, and reconciliation.",
            "Choose five launch dashboard panels. For each, name a signal, the invariant it protects, and the lever it controls.",
            "Describe two failure drills: one payment-related and one inventory/read-model-related. Include injected failure, expected detection, expected action, and pass condition."
          ]
        }),
        codeBlock({
          id: "defense-template",
          language: "text",
          code: `Design defense template
  Boundary:
  What this component decides:
  What this component must not decide:
  Durable state or proof:
  Failure mode:
  Recovery or compensation:
  Metric that tells operators it is healthy:
  Lever if it is unhealthy:`
        }),
        p({
          id: "template-readout",
          body: "Use this template on at least five boundaries: admission to shopping, map to hold, hold to checkout, payment to finalization, and finalized order to ticket issuance."
        })
      ]
    }),
    section({
      id: "practice-test",
      title: "Practice Test",
      role: "assessment",
      blocks: [
        balancedQuiz({
          id: "cumulative-practice-test",
          title: "Cumulative On-Sale Design Test",
          mode: "practice-test",
          questions: [
            {
              kind: "multiple-choice",
              id: "admission-token-proof",
              prompt: "In the stadium scenario, what should an admission token prove?",
              choices: [
                { id: "a", body: "That a bounded buyer/session may attempt scoped shopping actions for one event during a short time window" },
                { id: "b", body: "That the buyer owns any green seat they click" },
                { id: "c", body: "That payment is guaranteed to succeed" },
                { id: "d", body: "That the seat map is perfectly fresh" }
              ],
              answer: "a",
              explanation: "Admission grants a narrow opportunity to shop. Inventory and checkout still decide holds, orders, and tickets.",
              tags: ["admission-token", "admission-control"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "reserved-seat-race",
              prompt: "Two admitted buyers try to hold the same reserved seat from different API servers. What should choose the winner?",
              choices: [
                { id: "a", body: "A durable inventory invariant such as one active claim per event-seat" },
                { id: "b", body: "Whichever browser saw the seat map first" },
                { id: "c", body: "The payment provider authorization result" },
                { id: "d", body: "The CDN edge closest to the venue" }
              ],
              answer: "a",
              explanation: "The database transaction or equivalent atomic write must reject overlapping active claims. Read and payment paths do not own the seat.",
              tags: ["inventory", "reserved-seating"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "ga-capacity",
              prompt: "GA floor has capacity 18,000, active holds 1,400, and sold 16,590. A buyer requests 12 tickets. What should the atomic reserve operation do?",
              choices: [
                { id: "a", body: "Fail, because 1,400 + 16,590 + 12 exceeds 18,000" },
                { id: "b", body: "Succeed, because held tickets do not count" },
                { id: "c", body: "Succeed, because the map may still show availability" },
                { id: "d", body: "Ask payment to decide whether the buyer is serious" }
              ],
              answer: "a",
              explanation: "GA inventory is capacity-based. Active holds and sold tickets both consume capacity until a real transition releases them.",
              tags: ["general-admission", "capacity"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "stale-map",
              prompt: "A buyer sees B-4 as available from a section snapshot, but the hold transaction conflicts. What should the system do?",
              choices: [
                { id: "a", body: "Treat the conflict as normal product behavior, refresh the relevant read model, and ask the buyer to choose again" },
                { id: "b", body: "Override the conflict because the buyer saw green" },
                { id: "c", body: "Create an order without a hold" },
                { id: "d", body: "Retry indefinitely against the same seat" }
              ],
              answer: "a",
              explanation: "Stale reads must fall into safe write conflicts. The UI recovers; the invariant stays strict.",
              tags: ["read-model", "inventory"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "delta-gap",
              prompt: "A browser has section version 42 and receives a delta from version 43 to 44. What should it do?",
              choices: [
                { id: "a", body: "Fetch a fresh section snapshot before applying more deltas" },
                { id: "b", body: "Apply the delta to version 42 because it is newer" },
                { id: "c", body: "Start checkout for all changed seats" },
                { id: "d", body: "Clear inventory claims in that section" }
              ],
              answer: "a",
              explanation: "The client missed the 42-to-43 step. Deltas are only safe against the expected base version.",
              tags: ["read-model", "deltas"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "payment-authorized-hold-expired",
              prompt: "Payment is authorized, but the hold expired and the seats were sold to someone else. What is the safest checkout outcome?",
              choices: [
                { id: "a", body: "Do not issue tickets; mark refund_required or manual_review and compensate the payment" },
                { id: "b", body: "Issue duplicate tickets because payment succeeded" },
                { id: "c", body: "Delete the later buyer's order without audit" },
                { id: "d", body: "Let the stale map decide who owns the seats" }
              ],
              answer: "a",
              explanation: "Payment is a signal, not ownership. Without a valid hold to consume, the saga must compensate rather than invent tickets.",
              tags: ["checkout", "payment", "compensation"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "duplicate-webhook",
              prompt: "The provider sends the same payment-authorized webhook twice. What should your handler do on the second delivery?",
              choices: [
                { id: "a", body: "Return the already recorded result or observe the existing order without duplicating side effects" },
                { id: "b", body: "Create a second order to match the second webhook" },
                { id: "c", body: "Release the buyer's hold because duplicates are always fraud" },
                { id: "d", body: "Issue tickets before checking checkout state" }
              ],
              answer: "a",
              explanation: "Webhook handling must be idempotent. Duplicate delivery should converge on the same durable checkout result.",
              tags: ["checkout", "webhooks", "idempotency"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "payment-errors-healthy-inventory",
              prompt: "Payment intent errors spike to 8%, but hold latency, successful holds/sec, and read-model freshness are healthy. What is the best first operational response?",
              choices: [
                { id: "a", body: "Reduce new checkout pressure, keep inventory invariants running, and start payment reconciliation/watch" },
                { id: "b", body: "Disable inventory uniqueness so more buyers can finish" },
                { id: "c", body: "Increase admission because inventory is healthy" },
                { id: "d", body: "Let cached availability create orders until payment recovers" }
              ],
              answer: "a",
              explanation: "Diagnose by boundary. Payment/checkout is failing; the response should reduce pressure there without weakening inventory correctness.",
              tags: ["operations", "checkout", "admission-control"],
              difficulty: "hard"
            },
            {
              kind: "multiple-choice",
              id: "load-test-realism",
              prompt: "Which load-test design is most likely to reveal launch-day bugs?",
              choices: [
                { id: "a", body: "A burst-shaped buyer simulation with queue entries, hot sections, map refreshes, conflicts, payment delays, duplicate webhooks, and ticket retries" },
                { id: "b", body: "A flat request loop against the event detail endpoint" },
                { id: "c", body: "A uniform random seat selector that avoids hot areas" },
                { id: "d", body: "A test that stops before payment because payment is external" }
              ],
              answer: "a",
              explanation: "The important bugs live in behavior shape and boundaries, not only raw RPS.",
              tags: ["operations", "load-testing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "read-pressure",
              prompt: "Seat-map projection lag reaches 20 seconds in hot sections, while inventory writes remain healthy. Which response best preserves correctness and trust?",
              choices: [
                { id: "a", body: "Switch to coarser section-level availability, slow refreshes, and keep hold conflicts safe" },
                { id: "b", body: "Let the stale projection grant ownership" },
                { id: "c", body: "Disable hold conflicts so old maps work" },
                { id: "d", body: "Purge every cache key every second regardless of origin load" }
              ],
              answer: "a",
              explanation: "Read precision can degrade. Write correctness should not.",
              tags: ["read-model", "degradation", "operations"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "ticket-issuance-lag",
              prompt: "Orders are finalized, but ticket issuance workers are lagging. What fact should recovery use?",
              choices: [
                { id: "a", body: "The committed order id; retry ticket issuance idempotently from durable order state" },
                { id: "b", body: "The original green seat-map pixels" },
                { id: "c", body: "A new payment authorization" },
                { id: "d", body: "A new hold for the same seats" }
              ],
              answer: "a",
              explanation: "Once the order is finalized, ticket issuance should be a retryable side effect driven from the order.",
              tags: ["ticket-issuance", "checkout", "recovery"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "rollback-risk",
              prompt: "A bad deploy adds a new checkout state. Why might rollback be unsafe during the sale?",
              choices: [
                { id: "a", body: "The old version may not understand current durable checkout states or token formats" },
                { id: "b", body: "Rollback always makes every buyer lose their queue entry" },
                { id: "c", body: "Rollback turns all read models authoritative" },
                { id: "d", body: "Rollback guarantees payment providers resend all webhooks" }
              ],
              answer: "a",
              explanation: "State compatibility is part of recovery. An older binary that cannot process current state can make the incident worse.",
              tags: ["operations", "recovery", "checkout"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "closing",
      title: "What Mastery Looks Like",
      role: "assessment",
      blocks: [
        p({
          id: "closing-frame",
          body: "A good final design is not the one with the most components. It is the one where every scarce decision has a clear authority, every stale view fails safely, every external retry converges, and every launch signal has an action."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can defend why admission, browsing, holding, payment, finalization, ticket issuance, and operations are separate responsibilities.",
            "You can name the invariant that prevents double-booking and the capacity rule that prevents GA oversell.",
            "You can explain how stale read models remain useful without becoming ownership truth.",
            "You can design checkout so duplicate browser actions and duplicate webhooks converge on one order.",
            "You can operate the sale with signals and levers that protect buyer-safe progress."
          ]
        })
      ]
    })
  ]
});
