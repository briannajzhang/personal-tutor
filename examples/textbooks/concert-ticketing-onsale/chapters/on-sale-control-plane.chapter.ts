import {
  balancedQuiz,
  callout,
  chapter,
  codeBlock,
  component,
  componentModule,
  diagram,
  list,
  p,
  section
} from "tutor-kit";

const pressureLab = componentModule(import.meta.url, "../components/on-sale-pressure-lab.ts");

export default chapter({
  id: "on-sale-control-plane",
  title: "The On-Sale Control Plane",
  description: "Build the first useful on-sale model: bound demand, separate browsing from ownership, hold seats briefly, and finalize orders once.",
  role: "instruction",
  sections: [
    section({
      id: "one-sentence",
      title: "One Sentence for the Whole Launch",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can draw the first useful design for a major concert on-sale: a waiting room admits buyers at a controlled rate, the inventory service grants short-lived seat holds, and checkout turns a valid hold into an order exactly once."
        }),
        p({
          id: "big-idea",
          body: "If there is one sentence to keep from this chapter, make it this: an on-sale system must let millions of people express interest while only a bounded number compete for scarce inventory at any moment. The trick is not merely adding servers. It is deciding where requests are allowed to become dangerous."
        }),
        p({
          id: "ordinary-api-trap",
          body: "An ordinary API mindset says: receive request, validate, query seats, reserve, charge card, return response. That shape is fine when traffic is smooth. During a major on-sale, the same shape points the entire crowd at the few rows of data that decide who owns a seat. That narrow place is the critical section: the part of the system where concurrent work must be serialized or rejected so two buyers cannot receive the same seat."
        }),
        callout({
          id: "predict-first",
          tone: "note",
          title: "Pause and predict",
          body: "Imagine one million fans refresh at 10:00:00 for 70,000 seats. Which part should see one million requests: the CDN and waiting room, the seat-map read model, the inventory write transaction, or the payment provider? Hold that answer while we draw the path."
        }),
        diagram({
          id: "control-plane",
          title: "A Bounded On-Sale Path",
          body: `flowchart TD
  A["Fans and bots"] --> B["Edge filters"]
  B --> C["Waiting room"]
  C -->|admit rate| D["Shopping session"]
  D --> E["Map read model"]
  D -->|claim| F["Inventory hold"]
  F -->|hold id| G["Checkout"]
  G --> H["Payment"]
  H -->|signal| I["Finalize order"]
  I --> J["Issue tickets"]
  F --> K["Expire holds"]
  E -. browse hint .-> D`
        }),
        p({
          id: "diagram-readout",
          body: "The diagram separates four jobs that beginners often collapse. The waiting room protects the system from arrival rate. The read model helps people browse but cannot decide ownership. The inventory transaction decides who gets a temporary claim. Checkout finalizes only if the claim is still valid."
        }),
        p({
          id: "answer-prediction",
          body: "Now answer the prediction. The CDN and waiting room may see the million-person wave. The seat-map read model may see heavy fan-out, but it should be cacheable and allowed to be slightly stale. The inventory write path should see only admitted buyers, and even then only their actual hold attempts. The payment provider should see fewer requests still: buyers with valid holds who reached payment."
        }),
        callout({
          id: "autoscaling-boundary",
          tone: "caution",
          title: "Autoscaling does not remove the seat invariant",
          body: "You can add stateless API servers, queue workers, and cache capacity. You cannot autoscale the fact that seat A-12 has one owner. Somewhere, one durable rule must reject the second active claim."
        })
      ]
    }),
    section({
      id: "pressure",
      title: "The Spike Must Become a Rate",
      role: "instruction",
      blocks: [
        p({
          id: "pressure-intro",
          body: "Before designing tables or endpoints, inspect the first failure mode numerically. A burst is a crowd arriving faster than the scarce part can make decisions. An admission gate turns that burst into a rate: only this many buyers per second may enter the expensive path."
        }),
        component({
          id: "pressure-lab",
          title: "On-Sale Pressure Lab",
          module: pressureLab,
          props: {}
        }),
        p({
          id: "pressure-readout",
          body: "When admitted buyers per second rises, two things grow together: inventory write load and the number of active checkout holds. The waiting room is not a decoration in front of the real system. It is the control knob that keeps the real system inside the range where its correctness mechanisms can still work."
        }),
        codeBlock({
          id: "load-example",
          language: "text",
          code: `Scenario
  1,000,000 buyers arrive in the first minute.
  Average basket is 2 seats.
  Checkout takes about 6 minutes.
  The inventory service can safely process 18,000 hold attempts per minute.

Bad design
  Let every buyer reach reserve-seat immediately.
  Inventory sees far more write attempts than its tested limit.
  Timeouts cause retries, retries raise load, and buyers see inconsistent availability.

Controlled design
  Admit at most 250 buyers/second into seat selection.
  Inventory sees about 15,000 hold attempts/minute before retries.
  The queue absorbs impatience; the inventory database only handles bounded work.`
        }),
        callout({
          id: "queue-tradeoff",
          tone: "key-idea",
          title: "The queue trades latency for correctness",
          body: "A fan may wait longer before shopping, but once admitted they are less likely to lose a seat to timeout storms, duplicate payment attempts, or an overloaded inventory service."
        })
      ]
    }),
    section({
      id: "seat-holds",
      title: "A Seat Is Browsed Many Times but Held Once",
      role: "instruction",
      blocks: [
        p({
          id: "read-vs-claim",
          body: "The seat map is a read-side convenience. It may say A-12 looks available because the last published snapshot is 800 milliseconds old. That is acceptable as long as the write-side claim is the only source of truth. Browsing can be many-to-many. Holding must be one-to-one."
        }),
        p({
          id: "claim-definition",
          body: "A hold is a temporary lease on inventory: this buyer may buy these seats until a specific expiration time. It is not an order, not a charge, and not a ticket. It exists so the buyer can enter payment without the same seats being sold out from under them."
        }),
        codeBlock({
          id: "hold-contract",
          language: "sql",
          code: `-- One simplified shape. Production systems add partitions, audit rows,
-- fraud fields, channel controls, and operational metadata.
CREATE TABLE seat_holds (
  hold_id UUID NOT NULL,
  event_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  buyer_id BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'consumed')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (hold_id, seat_id)
);

CREATE UNIQUE INDEX one_active_hold_per_seat
  ON seat_holds (event_id, seat_id)
  WHERE status = 'active';`
        }),
        p({
          id: "constraint-readout",
          body: "The unique index is the important part. If two buyers try to hold the same seat, both API servers can race, but the database accepts only one active row for that event and seat. The loser does not get an order-shaped maybe. They get a clear hold failure and must choose again."
        }),
        codeBlock({
          id: "hold-attempt",
          language: "sql",
          code: `BEGIN;

-- Try to claim every requested seat for one hold id.
INSERT INTO seat_holds (hold_id, event_id, seat_id, buyer_id, status, expires_at)
VALUES
  (:hold_id, :event_id, :seat_1, :buyer_id, 'active', now() + interval '8 minutes'),
  (:hold_id, :event_id, :seat_2, :buyer_id, 'active', now() + interval '8 minutes')
ON CONFLICT DO NOTHING;

-- Application check inside the transaction:
-- if inserted row count != requested seat count, ROLLBACK and show "some seats are gone".
-- if all rows inserted, COMMIT and return hold_id plus expires_at.

COMMIT;`
        }),
        callout({
          id: "expiry-boundary",
          tone: "caution",
          title: "Expiration is a state transition, not a clock wish",
          body: "The index above only ignores rows whose status is no longer `active`. A cleanup worker, checkout finalizer, or claim transaction must mark expired holds as `expired`; otherwise old active rows keep blocking seats. Checkout must still verify `expires_at > now()` before finalizing."
        })
      ]
    }),
    section({
      id: "checkout-flow",
      title: "Checkout Is a State Machine",
      role: "instruction",
      blocks: [
        p({
          id: "checkout-intro",
          body: "Payment is slow, external, and retry-heavy. That makes checkout a poor place to improvise ownership. The inventory hold says what can be bought. The checkout state machine says what has happened so far."
        }),
        codeBlock({
          id: "checkout-states",
          language: "text",
          code: `active_hold
  Buyer has seats until expires_at.

payment_intent_created
  Payment provider knows the amount, currency, buyer, hold_id, and idempotency key.

payment_authorized
  Provider says funds are authorized or captured, but your system still must finalize.

order_finalized
  In one durable transition: verify active hold, create order, mark hold consumed.

tickets_issued
  Ticket artifacts or mobile passes are generated after the order exists.

hold_expired
  Seats return to inventory if no finalized order consumed the hold in time.`
        }),
        diagram({
          id: "checkout-state-diagram",
          title: "Checkout Transitions",
          body: `stateDiagram-v2
  [*] --> ActiveHold
  ActiveHold --> PaymentIntentCreated: create payment intent
  PaymentIntentCreated --> PaymentAuthorized: provider return or webhook
  PaymentAuthorized --> OrderFinalized: idempotent finalize
  OrderFinalized --> TicketsIssued
  ActiveHold --> HoldExpired: expires_at passes
  PaymentIntentCreated --> HoldExpired: no payment in time
  PaymentAuthorized --> RefundOrReview: invalid hold
  OrderFinalized --> OrderFinalized: duplicate retry`
        }),
        p({
          id: "idempotency",
          body: "Idempotency means a repeated request with the same operation key returns the same durable result instead of performing the operation again. It matters because browsers retry, users double-click, mobile networks drop responses, and payment webhooks may arrive more than once. `finalize_order(hold_id, payment_id)` should be safe to receive again."
        }),
        codeBlock({
          id: "finalize-pseudocode",
          language: "text",
          code: `finalize_order(hold_id, payment_id, idempotency_key):
  begin transaction
    if idempotency_key already produced order_id:
      return existing order_id

    load active hold rows for hold_id
    require every row status = 'active' and expires_at > now()
    require payment_id is authorized for the same buyer, amount, and hold_id

    create order
    mark hold rows consumed
    store idempotency_key -> order_id
  commit

  issue tickets asynchronously from order_id`
        }),
        callout({
          id: "payment-not-ownership",
          tone: "key-idea",
          title: "A payment success is not a ticket",
          body: "The payment provider can tell you money moved. Only your order finalization transaction can say the valid hold was consumed and the ticket should exist. If those two facts disagree, you need refund or manual-review logic, not duplicate tickets."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice the Design Decisions",
      role: "practice",
      blocks: [
        list({
          id: "guided-practice",
          items: [
            "Two buyers click the same seat from two different API servers. Name the exact mechanism that chooses the winner, and explain what the loser should receive.",
            "Your seat map says a seat is available, but the hold attempt fails. Explain why this is acceptable and what the UI should do next.",
            "The payment provider sends the same successful webhook three times. Describe the state or table entry that prevents three orders.",
            "A hold expires one second before the payment webhook arrives. State the safest finalization behavior and the follow-up action for the buyer's money.",
            "Your queue admission rate is high enough that active checkout holds regularly exceed the remaining inventory. Name one product symptom and one backend metric you would expect to see."
          ]
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Review: First On-Sale Model",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "critical-section",
              prompt: "During a major on-sale, which path should be most tightly protected as the inventory critical section?",
              choices: [
                { id: "a", body: "The transaction that creates or consumes seat holds" },
                { id: "b", body: "The static event detail page served by the CDN" },
                { id: "c", body: "The marketing email click tracker" },
                { id: "d", body: "The cached seat-map read endpoint" }
              ],
              answer: "a",
              explanation: "Only the hold or consume transaction changes who may own a scarce seat. Read paths can be cached or stale; ownership changes need durable concurrency control.",
              tags: ["critical-section", "seat-holds"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "read-model",
              prompt: "A buyer sees B-4 as available on the map, clicks it, and receives a hold failure. What is the best diagnosis?",
              choices: [
                { id: "a", body: "The read model was slightly stale, and the write-side claim correctly rejected the seat" },
                { id: "b", body: "The system must let the buyer buy B-4 because the UI displayed it" },
                { id: "c", body: "The database should remove uniqueness so the UI stays consistent" },
                { id: "d", body: "Payment should be attempted first to decide whether the buyer is serious" }
              ],
              answer: "a",
              explanation: "Availability displays are hints under load. The durable claim path is the authority because it enforces one active holder per seat.",
              tags: ["read-model", "seat-holds"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "queue-purpose",
              prompt: "What does the waiting room primarily control?",
              choices: [
                { id: "a", body: "The rate at which buyers enter expensive shopping and hold paths" },
                { id: "b", body: "The exact order in which every payment provider webhook arrives" },
                { id: "c", body: "The need for database constraints on seats" },
                { id: "d", body: "Whether browsers cache JavaScript correctly" }
              ],
              answer: "a",
              explanation: "The waiting room turns a burst into an admission rate. It reduces pressure but does not replace inventory constraints or idempotent checkout.",
              tags: ["admission-control"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "payment-webhook",
              prompt: "A payment webhook is delivered twice for the same hold and payment id. What should `finalize_order` do on the second delivery?",
              choices: [
                { id: "a", body: "Return the existing order result associated with the same idempotency key or operation identity" },
                { id: "b", body: "Create a second order because the provider confirmed payment again" },
                { id: "c", body: "Release the seats because duplicate webhooks are suspicious" },
                { id: "d", body: "Skip checking the hold because payment has already succeeded" }
              ],
              answer: "a",
              explanation: "Retries are normal. The finalization operation must be idempotent so repeated messages converge on one order.",
              tags: ["checkout", "idempotency"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "expired-hold",
              prompt: "A payment succeeds after the hold has expired and another buyer has since claimed the seats. Which behavior is safest?",
              choices: [
                { id: "a", body: "Do not issue tickets; put the payment into refund or manual review" },
                { id: "b", body: "Issue tickets anyway because payment is the source of truth" },
                { id: "c", body: "Delete the newer buyer's hold without recording anything" },
                { id: "d", body: "Create two orders and resolve the conflict after the event" }
              ],
              answer: "a",
              explanation: "A valid hold is the bridge between payment and inventory. If the bridge is gone, money movement alone cannot create ownership of unavailable seats.",
              tags: ["checkout", "seat-holds"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "where-next",
      title: "What This Chapter Leaves Simplified",
      role: "review",
      blocks: [
        p({
          id: "simplified",
          body: "This first model deliberately treats the inventory service as one box and the waiting room as one knob. Real systems split by event, price level, section, and channel; they fight bots; they publish availability snapshots; they reconcile payment edge cases; and they run launch dashboards. Those details matter, but they all sit on the same spine you built here: admit bounded work, hold scarce inventory durably, and finalize checkout exactly once."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can draw the on-sale path from edge traffic to ticket issuance.",
            "You can explain why the seat map may be stale while the hold transaction must be authoritative.",
            "You can identify where admission control, database constraints, expiration, and idempotency each belong.",
            "You can diagnose at least one failure caused by collapsing hold, payment, and order into a single synchronous request."
          ]
        })
      ]
    })
  ]
});
