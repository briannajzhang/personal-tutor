import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "inventory-ledger-not-cache",
  title: "Seat Inventory Is a Ledger, Not a Cache",
  description: "Model reserved seats and general admission as durable inventory transitions with constraints, leases, capacity checks, and audit trails.",
  role: "instruction",
  sections: [
    section({
      id: "cache-lie",
      title: "The Useful Lie the Seat Map Tells",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can design the inventory write model for reserved seats and general admission, explain which database rule prevents double-booking, and decide when a cache is allowed to be wrong."
        }),
        p({
          id: "starting-picture",
          body: "Picture a seat map at 10:03:12. Seat B-4 is green on one buyer's screen, gray on another buyer's screen, and already inside a third buyer's checkout hold. Which one is true? All three, if you are careless with the word true."
        }),
        p({
          id: "read-vs-write-truth",
          body: "The map is a read model: a fast, fan-out-friendly summary that helps people browse. It can lag. The inventory ledger is the write model: the durable record of claims, releases, and sales. It cannot lag when it decides ownership. If a green pixel and a database constraint disagree, the pixel loses."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "Suppose your API checks Redis and sees `seat:B-4 = available`, then writes an order row. Another API server does the same one millisecond later. What single missing mechanism makes double-booking possible?"
        }),
        p({
          id: "predict-answer",
          body: "The missing mechanism is an atomic ownership transition. The system looked at a description of inventory, then separately wrote a result. Between those two steps, another request could do the same. For ownership, look-and-then-act is the dangerous shape."
        }),
        diagram({
          id: "read-write-split",
          title: "Browse From a Snapshot, Claim Through a Transaction",
          body: `flowchart TD
  C["Inventory tables"] -->|publish| A["Seat map cache"]
  A -->|browse| B["Buyer UI"]
  B -->|hold request| D["Inventory tx"]
  D -->|constraint| C
  D -->|result| B
  C --> E["Inventory transition log"]
  E -->|audit| F["Ops and finance"]`
        }),
        p({
          id: "diagram-readout",
          body: "The snapshot is allowed to help the buyer choose. The transaction is the only place that decides whether the choice still exists. The transition log is why we call this a ledger: not because every implementation must be event-sourced, but because every ownership change should be durable, explainable, and reconcilable."
        })
      ]
    }),
    section({
      id: "reserved-seats",
      title: "Reserved Seats Need One Active Claim",
      role: "instruction",
      blocks: [
        p({
          id: "reserved-intro",
          body: "A reserved seat has an identity: section 114, row B, seat 4. That identity gives you a clean invariant. At any instant, for one event, that seat may have at most one active claim. The claim might be a hold or a completed sale, but there cannot be two live owners."
        }),
        p({
          id: "schema-intro",
          body: "Inspect the schema below for where the invariant lives. The application will still validate requests, but correctness should not depend on every API server remembering to run the perfect check."
        }),
        codeBlock({
          id: "reserved-schema",
          language: "sql",
          code: `CREATE TABLE seats (
  event_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  section TEXT NOT NULL,
  row_label TEXT NOT NULL,
  seat_number TEXT NOT NULL,
  sellable BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (event_id, seat_id)
);

CREATE TABLE inventory_claims (
  claim_id UUID NOT NULL,
  event_id BIGINT NOT NULL,
  seat_id BIGINT NOT NULL,
  buyer_id BIGINT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('hold', 'sale')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'consumed', 'cancelled')),
  idempotency_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (claim_id, seat_id),
  FOREIGN KEY (event_id, seat_id) REFERENCES seats (event_id, seat_id)
);

CREATE UNIQUE INDEX one_live_claim_per_reserved_seat
  ON inventory_claims (event_id, seat_id)
  WHERE status = 'active';`
        }),
        p({
          id: "schema-readout",
          body: "This model does not ask the cache whether B-4 is available. It asks the database to create an active claim. If an active claim already exists, the unique index rejects the new one. That rejection is not an exception to hide; it is the ordinary answer to a race."
        }),
        codeBlock({
          id: "race-trace",
          language: "text",
          code: `Two API servers try to hold event 44, seat B-4.

T1: INSERT active claim for B-4
T2: INSERT active claim for B-4
DB: one_live_claim_per_reserved_seat can accept only one active row
T1: commits
T2: gets conflict, rolls back, returns "seat no longer available"

No server had to "win" by being faster in memory.
The durable invariant chose the only valid state.`
        }),
        callout({
          id: "do-not-swallow-conflict",
          tone: "caution",
          title: "A conflict is product behavior",
          body: "Under load, a hold conflict is not a system error. Log rates and latency, but return a buyer-facing result that lets the user choose other seats. Treating conflicts as 500s creates retries against the hottest rows."
        })
      ]
    }),
    section({
      id: "multi-seat",
      title: "A Basket Must Be All or Nothing",
      role: "instruction",
      blocks: [
        p({
          id: "basket-problem",
          body: "Concert buyers rarely want one arbitrary seat. They want two adjacent seats, four seats in a price level, or the best available pair under a budget. That turns the invariant from one row into a small set: either the whole basket is held, or none of it is."
        }),
        p({
          id: "inspect-transaction",
          body: "In this transaction, inspect three details: expired claims are cleaned before reuse, candidate seats are locked in a stable order, and the final inserted count must equal the requested count."
        }),
        codeBlock({
          id: "basket-hold-transaction",
          language: "sql",
          code: `BEGIN;

-- First materialize expiration for the exact seats being requested.
UPDATE inventory_claims
SET status = 'expired'
WHERE event_id = :event_id
  AND seat_id = ANY(:requested_seat_ids)
  AND status = 'active'
  AND claim_type = 'hold'
  AND expires_at <= now();

-- Lock seat rows in a stable order so competing baskets do not deadlock as easily.
SELECT seat_id
FROM seats
WHERE event_id = :event_id
  AND seat_id = ANY(:requested_seat_ids)
  AND sellable = true
ORDER BY seat_id
FOR UPDATE;

INSERT INTO inventory_claims (
  claim_id, event_id, seat_id, buyer_id, claim_type, status, idempotency_key, expires_at
)
SELECT :claim_id, :event_id, seat_id, :buyer_id, 'hold', 'active', :idempotency_key, now() + interval '8 minutes'
FROM unnest(:requested_seat_ids) AS requested(seat_id)
ON CONFLICT DO NOTHING;

-- Application check before commit:
-- inserted_count must equal requested_count.
-- Otherwise ROLLBACK so the buyer does not get half a pair.

COMMIT;`
        }),
        p({
          id: "transaction-readout",
          body: "The transaction is doing more than inserting rows. It turns time into state by expiring old holds, narrows the race to locked seats, attempts the claims, and refuses partial success. The buyer either gets a coherent basket or a clear miss."
        }),
        callout({
          id: "serializable-boundary",
          tone: "note",
          title: "Isolation helps, but constraints carry the invariant",
          body: "Serializable isolation can be useful in some allocators, but do not make it your only line of defense. The invariant should still be visible as a constraint, lock, or atomic counter update that explains why the impossible state cannot be committed."
        })
      ]
    }),
    section({
      id: "ga",
      title: "General Admission Is a Capacity Problem",
      role: "instruction",
      blocks: [
        p({
          id: "ga-intro",
          body: "General admission inventory has no seat B-4. It has a capacity: perhaps 5,000 floor tickets. The invariant changes shape. Instead of one active claim per seat id, you need active holds plus sold tickets to stay at or below capacity."
        }),
        p({
          id: "ga-wrong-turn",
          body: "The tempting wrong model is a cached counter: read `remaining_floor = 142`, subtract two in the application, write a hold. Under concurrency, many workers can read the same 142. The system oversells because the subtraction was not the ownership transition."
        }),
        codeBlock({
          id: "ga-counter",
          language: "sql",
          code: `CREATE TABLE ga_pools (
  event_id BIGINT NOT NULL,
  pool_id TEXT NOT NULL,
  capacity INT NOT NULL,
  active_held INT NOT NULL DEFAULT 0,
  sold INT NOT NULL DEFAULT 0,
  PRIMARY KEY (event_id, pool_id),
  CHECK (active_held >= 0),
  CHECK (sold >= 0),
  CHECK (active_held + sold <= capacity)
);

-- Atomically reserve quantity for a hold.
UPDATE ga_pools
SET active_held = active_held + :quantity
WHERE event_id = :event_id
  AND pool_id = :pool_id
  AND active_held + sold + :quantity <= capacity
RETURNING active_held, sold, capacity;`
        }),
        p({
          id: "ga-readout",
          body: "The `UPDATE` is the claim. It succeeds only if the new total fits under capacity. If no row returns, the pool does not have enough inventory right now. This is the GA version of the unique seat constraint."
        }),
        codeBlock({
          id: "ga-release-consume",
          language: "sql",
          code: `-- Hold expires or buyer abandons checkout.
UPDATE ga_pools
SET active_held = active_held - :quantity
WHERE event_id = :event_id
  AND pool_id = :pool_id;

-- Buyer completes checkout.
UPDATE ga_pools
SET active_held = active_held - :quantity,
    sold = sold + :quantity
WHERE event_id = :event_id
  AND pool_id = :pool_id;`
        }),
        callout({
          id: "ga-audit",
          tone: "key-idea",
          title: "Counters still need a trail",
          body: "Fast counters are operationally convenient, but every increment and decrement should correspond to a hold, expiration, sale, cancellation, or adjustment record. Otherwise you cannot reconcile why the pool says 37 tickets remain."
        })
      ]
    }),
    section({
      id: "ledger",
      title: "Why Ledger Thinking Saves You Later",
      role: "instruction",
      blocks: [
        p({
          id: "ledger-definition",
          body: "Ledger thinking means each inventory change has a reason, actor, time, and previous business state. You may store the current state in tables for speed, but you also keep enough transition history to answer: who claimed this inventory, when did it expire, what consumed it, and what external operation caused it?"
        }),
        codeBlock({
          id: "transition-log",
          language: "sql",
          code: `CREATE TABLE inventory_transitions (
  transition_id UUID PRIMARY KEY,
  event_id BIGINT NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('reserved_seat', 'ga_pool')),
  subject_id TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  claim_id UUID,
  order_id UUID,
  reason TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`
        }),
        p({
          id: "ledger-readout",
          body: "This table is not the only possible design. The lesson is the shape of the evidence. A support agent, finance reconciliation job, or launch engineer should not have to infer from scattered timestamps that a seat moved from available to held to sold. The system should say so."
        }),
        diagram({
          id: "state-machine",
          title: "Inventory State Transitions",
          body: `stateDiagram-v2
  [*] --> Available
  Available --> Held: hold succeeds
  Held --> Available: hold expires or cancels
  Held --> Sold: checkout finalizes
  Sold --> RefundedBlocked: refund, no resale
  Sold --> Available: approved release
  Available --> Blocked: venue hold
  Blocked --> Available: release`
        }),
        p({
          id: "state-readout",
          body: "Notice that sold does not always go straight back to available after a refund. Some tickets are refunded but not resold because of fraud, chargeback risk, artist holds, production changes, or timing. A ledger lets you preserve those reasons instead of flattening everything into `available=true`."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice the Inventory Model",
      role: "practice",
      blocks: [
        list({
          id: "design-prompts",
          items: [
            "Reserved seating: two buyers request the same pair, seats 10 and 11. Buyer A inserts seat 10, Buyer B inserts seat 11, and both then fail on the other seat. What transaction rule prevents each buyer from keeping half a pair?",
            "General admission: floor capacity is 5,000, `active_held = 400`, and `sold = 4,590`. A buyer asks for 12 tickets. Should the atomic update succeed? Show the arithmetic.",
            "Expiration: a hold has `expires_at` in the past but status still says `active`. Name two places in the system that could safely materialize expiration before inventory is reused.",
            "Read model: the cache says 20 tickets remain, but the GA counter update returns no row. Which result should the API trust, and what should the UI say?",
            "Audit: a customer claims they bought seat C-8, but the app shows no ticket. Name three transition-log fields that would help you reconstruct what happened."
          ]
        }),
        balancedQuiz({
          id: "inventory-review",
          title: "Review: Inventory Correctness",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "cache-authority",
              prompt: "A cached seat map says A-12 is available, but the hold transaction conflicts on A-12. Which answer is correct?",
              choices: [
                { id: "a", body: "The transaction result wins; the cache was only a browsing snapshot" },
                { id: "b", body: "The cache wins because the buyer saw it first" },
                { id: "c", body: "Both buyers should be allowed to continue until payment" },
                { id: "d", body: "The API should retry until the unique index accepts both rows" }
              ],
              answer: "a",
              explanation: "Read models can be stale. Ownership is created by the write-side invariant, so the conflict is the authoritative result.",
              tags: ["read-model", "reserved-seating"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "reserved-invariant",
              prompt: "What is the central reserved-seat invariant?",
              choices: [
                { id: "a", body: "For one event and seat, at most one active claim can exist" },
                { id: "b", body: "Every cache entry must update before any buyer sees a map" },
                { id: "c", body: "Every buyer must hold only one seat at a time" },
                { id: "d", body: "A payment authorization automatically creates a ticket" }
              ],
              answer: "a",
              explanation: "Reserved inventory is identity-based. Correctness depends on preventing overlapping active claims for the same event and seat.",
              tags: ["reserved-seating", "invariants"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "ga-capacity",
              prompt: "A GA pool has capacity 1,000, `active_held = 100`, and `sold = 890`. A buyer requests 15 tickets. What should the atomic reserve update do?",
              choices: [
                { id: "a", body: "Fail, because 100 + 890 + 15 exceeds 1,000" },
                { id: "b", body: "Succeed, because `sold` tickets no longer matter" },
                { id: "c", body: "Succeed, because the cache might soon expire some holds" },
                { id: "d", body: "Create the hold and ask payment to decide later" }
              ],
              answer: "a",
              explanation: "GA correctness is capacity-based. Active held inventory and sold inventory both consume capacity until a real transition releases one of them.",
              tags: ["general-admission", "capacity"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "expiration-state",
              prompt: "Why is `expires_at` alone not enough to release a reserved seat under a partial unique index on `status = 'active'`?",
              choices: [
                { id: "a", body: "The row still matches the active-status index until some transaction marks it expired" },
                { id: "b", body: "Databases cannot store timestamps accurately enough for ticketing" },
                { id: "c", body: "The payment provider must delete the row manually" },
                { id: "d", body: "A cache refresh automatically changes database status" }
              ],
              answer: "a",
              explanation: "A timestamp is evidence that a transition is due. The database state still has to change so constraints and queries treat the inventory as reusable.",
              tags: ["expiration", "reserved-seating"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "ledger-purpose",
              prompt: "What does ledger thinking add beyond a fast current-state table?",
              choices: [
                { id: "a", body: "A durable explanation of each inventory transition for reconciliation, support, and operations" },
                { id: "b", body: "A way to avoid all database constraints" },
                { id: "c", body: "A guarantee that seat maps are never stale" },
                { id: "d", body: "A reason to sell inventory before creating holds" }
              ],
              answer: "a",
              explanation: "Current state tells you what is true now. Transition history tells you how it became true and lets the system reconcile disputes and failures.",
              tags: ["ledger", "operations"],
              difficulty: "medium"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "What You Can Now Design",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "You now have the inventory half of the on-sale design. The first chapter said to protect the critical section. This chapter gave the critical section its actual rules: one active claim for reserved seats, capacity-bounded atomic updates for GA, all-or-nothing baskets, materialized expiration, and a transition trail."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can explain why a cache can help browse inventory but cannot grant ownership.",
            "You can sketch reserved-seat tables with a durable one-active-claim invariant.",
            "You can sketch GA inventory with an atomic capacity update.",
            "You can describe how expiration, cancellation, sale, refund, and blocking become explicit transitions.",
            "You can diagnose double-booking designs that separate the availability check from the ownership transition."
          ]
        })
      ]
    })
  ]
});
