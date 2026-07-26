import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "checkout-as-saga",
  title: "Checkout as a Saga",
  description: "Carry a valid hold through payment, order finalization, ticket issuance, retries, compensation, and reconciliation.",
  role: "instruction",
  sections: [
    section({
      id: "not-one-request",
      title: "Checkout Is Not One Request",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can design ticket checkout as a recoverable saga: a sequence of durable steps that carries a valid hold through payment, order finalization, ticket issuance, retries, and reconciliation without creating duplicate orders or duplicate tickets."
        }),
        p({
          id: "ordinary-wrong-shape",
          body: "The wrong mental picture is a single synchronous request: `POST /checkout` reserves seats, charges the card, creates an order, issues tickets, sends email, and returns success. That shape fails exactly where on-sales are harshest. The browser may close. The payment provider may answer later. The webhook may arrive twice. The ticket worker may fail after the order commits."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "A buyer has a valid hold. Their payment is authorized, but the browser loses connection before your API returns. When the buyer refreshes, what is the one thing your system must not do?"
        }),
        p({
          id: "predict-answer",
          body: "It must not start a brand-new purchase path that can charge again or create a second order. The system needs a durable checkout state and an idempotent finalization operation, so a retry can converge on the same result."
        }),
        diagram({
          id: "saga-flow",
          title: "Checkout Saga from Hold to Tickets",
          body: `flowchart TD
  A["Active hold"] --> B["Checkout session"]
  B --> C["Payment intent"]
  C --> D["Payment authorized"]
  D --> E["Finalize order"]
  E --> F["Consume hold and create order"]
  F --> G["Ticket job"]
  G --> H["Tickets issued"]
  C --> I["Payment failed"]
  I --> J["Release or expire hold"]
  D --> K["Reconciliation"]
  K --> E
  G --> K`
        }),
        p({
          id: "diagram-readout",
          body: "The saga crosses boundaries. Inventory, payment, orders, and ticket issuance do not all commit in one transaction. The design challenge is to make each boundary recoverable: if the next message is delayed, duplicated, or missing, the system can still find the correct next step."
        })
      ]
    }),
    section({
      id: "state-record",
      title: "First Make the State Visible",
      role: "instruction",
      blocks: [
        p({
          id: "state-intro",
          body: "A saga needs a durable state record before it needs clever workers. The record tells every retry, webhook, and support tool the same story: which hold is being checked out, which payment intent belongs to it, which state it is in, and which operation keys have already produced side effects."
        }),
        codeBlock({
          id: "checkout-schema",
          language: "sql",
          code: `CREATE TABLE checkout_sessions (
  checkout_id UUID PRIMARY KEY,
  event_id BIGINT NOT NULL,
  hold_id UUID NOT NULL,
  buyer_id BIGINT NOT NULL,
  state TEXT NOT NULL CHECK (state IN (
    'created',
    'payment_intent_created',
    'payment_authorized',
    'order_finalized',
    'tickets_issued',
    'payment_failed',
    'expired',
    'refund_required',
    'manual_review'
  )),
  payment_intent_id TEXT,
  order_id UUID,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hold_id),
  UNIQUE (payment_intent_id),
  UNIQUE (idempotency_key)
);`
        }),
        p({
          id: "schema-readout",
          body: "`UNIQUE (hold_id)` says one hold can have one checkout path. `UNIQUE (payment_intent_id)` prevents one provider payment from being attached to several orders. `UNIQUE (idempotency_key)` lets retries ask for the same operation result instead of performing the operation again."
        }),
        codeBlock({
          id: "state-transitions",
          language: "text",
          code: `created
  Checkout session exists for one active hold.

payment_intent_created
  Provider has a payment object for the same buyer, hold, amount, and currency.

payment_authorized
  Payment provider says funds are approved, but tickets still do not exist.

order_finalized
  One database transaction verified the hold, consumed inventory, and created the order.

tickets_issued
  Ticket artifacts were generated from the committed order.

refund_required / manual_review
  Money and inventory state disagree; do not issue tickets until reconciled.`
        }),
        callout({
          id: "state-not-ui",
          tone: "key-idea",
          title: "The UI is not the state machine",
          body: "A checkout page can show `Processing...`, but the durable checkout row decides what happened. If the browser closes, the saga continues from stored state."
        })
      ]
    }),
    section({
      id: "payment-boundary",
      title: "Payment Success Is Only a Signal",
      role: "instruction",
      blocks: [
        p({
          id: "payment-intro",
          body: "Payment providers are outside your transaction boundary. You can ask them to authorize money; they can call you back; you can poll them; but they cannot atomically commit your inventory and order tables. So treat payment events as signals that may trigger finalization, not as the final sale."
        }),
        p({
          id: "inspect-payment-intent",
          body: "When creating the payment intent, bind it to the hold and checkout identity. That binding is what lets a later webhook prove which saga it belongs to."
        }),
        codeBlock({
          id: "payment-intent",
          language: "json",
          code: `{
  "amount": 28400,
  "currency": "usd",
  "idempotency_key": "checkout_8f2:create-payment-intent",
  "metadata": {
    "event_id": "evt_44",
    "hold_id": "hold_c91",
    "checkout_id": "checkout_8f2",
    "buyer_id": "buyer_123"
  }
}`
        }),
        p({
          id: "payment-readout",
          body: "The idempotency key protects the provider call from duplicate browser submissions. The metadata protects your webhook handler from guessing. When a payment event arrives, the handler can locate the checkout row and verify that amount, currency, buyer, and hold still match."
        }),
        callout({
          id: "browser-return",
          tone: "caution",
          title: "Do not trust the browser return alone",
          body: "A browser redirect can be lost, replayed, or forged. Use it as a prompt to check durable payment state. The same is true for webhooks in the other direction: verify signatures and reconcile against your checkout row."
        })
      ]
    }),
    section({
      id: "finalization",
      title: "Finalization Is the Critical Transaction",
      role: "instruction",
      blocks: [
        p({
          id: "finalize-intro",
          body: "The finalization transaction is where money authorization becomes a ticketable order. This is the checkout equivalent of the inventory hold transaction: a small durable step that must be safe under retries."
        }),
        p({
          id: "inspect-finalize",
          body: "Inspect the order of checks. The transaction first collapses duplicate attempts, then verifies payment, then verifies the hold, then creates the order and consumes inventory together."
        }),
        codeBlock({
          id: "finalize-pseudocode",
          language: "text",
          code: `finalize_order(checkout_id, payment_intent_id, operation_key):
  begin transaction
    checkout = load checkout_session FOR UPDATE

    if operation_key already maps to an order_id:
      return existing order_id

    if checkout.state in ['order_finalized', 'tickets_issued']:
      return checkout.order_id

    require checkout.payment_intent_id == payment_intent_id
    require provider payment is authorized for checkout.amount and checkout.buyer_id
    require checkout.expires_at > now()

    hold = load hold FOR UPDATE
    require hold.status == 'active'
    require hold.expires_at > now()
    require hold.buyer_id == checkout.buyer_id

    order_id = create order from hold and checkout
    mark hold consumed
    set checkout.state = 'order_finalized'
    store operation_key -> order_id
  commit

  enqueue ticket issuance for order_id
  return order_id`
        }),
        p({
          id: "finalize-readout",
          body: "The transaction does not issue tickets before commit. It records the order and consumes the hold first. Ticket issuance can then run from the committed order id. If the worker fails, the order still exists and the issuance job can retry without inventing a new sale."
        }),
        diagram({
          id: "finalize-state",
          title: "Retry-Safe Finalization",
          body: `stateDiagram-v2
  [*] --> PaymentAuthorized
  PaymentAuthorized --> OrderFinalized: first valid finalize
  PaymentAuthorized --> RefundRequired: hold invalid
  OrderFinalized --> OrderFinalized: duplicate finalize
  OrderFinalized --> TicketsIssued: issue tickets
  TicketsIssued --> TicketsIssued: duplicate issuance`
        }),
        callout({
          id: "side-effect-order",
          tone: "caution",
          title: "Irreversible effects come after durable facts",
          body: "Do not email tickets, emit mobile passes, or notify fulfillment before the order commit. External side effects should be driven from durable state so they can be retried and deduplicated."
        })
      ]
    }),
    section({
      id: "webhooks",
      title: "Webhooks Are Repeated Until Proven Boring",
      role: "instruction",
      blocks: [
        p({
          id: "webhook-intro",
          body: "Payment webhooks are often at-least-once delivery. That means your handler should expect duplicate messages, out-of-order messages, and messages that arrive after the user has already refreshed the checkout page. A boring webhook handler is a good one: verify, record, attempt the next safe transition, return success for duplicates."
        }),
        codeBlock({
          id: "webhook-handler",
          language: "text",
          code: `handle_payment_webhook(event):
  require valid provider signature
  require event.id not previously processed, or return 200

  checkout = find checkout by payment_intent_id
  record event id and raw payload digest

  if event says payment_authorized:
    set checkout.state = payment_authorized if it is not already further along
    attempt finalize_order(checkout.checkout_id, event.payment_intent_id, event.id)

  if event says payment_failed:
    if checkout is not order_finalized:
      set checkout.state = payment_failed
      let hold expire or release it according to policy

  return 200`
        }),
        p({
          id: "webhook-readout",
          body: "The event id can be an operation key. If the provider sends the same authorization twice, the second call finds that the order already exists or that the event was already handled. Either way, the result converges."
        }),
        callout({
          id: "out-of-order",
          tone: "note",
          title: "Out of order is normal",
          body: "A failure-looking event might arrive after an order already finalized, or an authorization might arrive after the hold expired. The handler should check current checkout state before moving backward."
        })
      ]
    }),
    section({
      id: "compensation",
      title: "When the Saga Cannot Complete, Compensate",
      role: "instruction",
      blocks: [
        p({
          id: "compensation-intro",
          body: "A saga cannot pretend every step is reversible. If payment was authorized but the hold is invalid, you cannot create tickets for sold inventory. The repair is a compensating action: refund, void, extend review, or contact support. Compensation is not failure handling sprinkled on top; it is part of the design."
        }),
        codeBlock({
          id: "failure-cases",
          language: "text",
          code: `Case A: payment authorized, hold still active
  Finalize order, consume hold, issue tickets.

Case B: payment authorized, hold expired but seats unsold
  Policy decision: possibly revalidate and finalize, or manual review.

Case C: payment authorized, hold expired and seats sold to someone else
  Do not issue tickets. Mark refund_required and void/refund payment.

Case D: order finalized, ticket worker failed
  Keep order. Retry ticket issuance from order_id.

Case E: ticket issued, confirmation email failed
  Keep ticket. Retry email; buyer can still access ticket from account.`
        }),
        p({
          id: "case-readout",
          body: "Notice which facts are allowed to survive. A finalized order survives ticket-worker failure. A ticket survives email failure. But payment authorization does not survive invalid inventory as a ticket. The stronger fact is the committed order that consumed a valid hold."
        }),
        diagram({
          id: "compensation-flow",
          title: "Paid but No Valid Hold",
          body: `flowchart TD
  A["Payment authorized"] --> B["Finalize order"]
  B --> C{Hold valid?}
  C -->|yes| D["Create order"]
  D --> E["Issue tickets"]
  C -->|no| F["Mark refund_required"]
  F --> G["Void/refund payment"]
  G --> H["Notify and log"]`
        })
      ]
    }),
    section({
      id: "reconciliation",
      title: "Reconciliation Is the Backstop",
      role: "instruction",
      blocks: [
        p({
          id: "reconciliation-intro",
          body: "Even careful sagas leave stuck states: a worker was down, a webhook was delayed, a provider timeout hid the real result, or a deployment paused ticket issuance. Reconciliation is the periodic process that compares durable facts and nudges each checkout to the next safe state."
        }),
        codeBlock({
          id: "reconciliation-job",
          language: "text",
          code: `every minute:
  find checkout_sessions where state in (
    'payment_intent_created',
    'payment_authorized',
    'order_finalized',
    'refund_required'
  ) and updated_at is older than expected

  for each checkout:
    fetch provider payment state
    fetch hold/order/ticket state

    if payment authorized and hold valid and no order:
      attempt finalize_order(...)

    if order finalized and tickets missing:
      enqueue ticket issuance

    if payment authorized and hold invalid and no order:
      mark refund_required and enqueue refund

    if refund required and refund not requested:
      request refund with idempotency key`
        }),
        p({
          id: "reconciliation-readout",
          body: "This job is not a cleanup afterthought. It is what makes the saga honest under real delivery conditions. The job should be idempotent too: running it twice should move stuck checkouts forward, not duplicate refunds or tickets."
        }),
        callout({
          id: "observable-states",
          tone: "key-idea",
          title: "Every stuck state should have an owner",
          body: "If a checkout can sit in `payment_authorized` for ten minutes, someone or something must own that state: a worker, reconciliation job, alert, dashboard, or support queue."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice the Saga",
      role: "practice",
      blocks: [
        list({
          id: "design-prompts",
          items: [
            "A buyer double-clicks `Pay` and your API receives two create-payment-intent requests. Name the idempotency key that should make both requests converge.",
            "A webhook says payment was authorized, but the hold expired thirty seconds ago and the seats are now sold. State the checkout state you would write and the compensating action.",
            "An order finalized successfully, but ticket issuance timed out. Explain why retrying ticket issuance is safer than rerunning all checkout steps.",
            "A browser return says success, but no webhook has arrived yet. Describe what the checkout page should verify before showing tickets.",
            "Cumulative retrieval: inventory hold latency spikes during checkout and payment errors rise. Which upstream component from the previous chapter should slow down, and which invariant from the inventory chapter must remain enforced?"
          ]
        }),
        balancedQuiz({
          id: "checkout-review",
          title: "Review: Checkout Saga",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "saga-reason",
              prompt: "Why model checkout as a saga instead of one large synchronous request?",
              choices: [
                { id: "a", body: "Checkout crosses services and external systems that cannot share one atomic database transaction" },
                { id: "b", body: "Sagas make payment providers unnecessary" },
                { id: "c", body: "A saga guarantees every admitted buyer gets inventory" },
                { id: "d", body: "A saga lets the UI decide whether tickets exist" }
              ],
              answer: "a",
              explanation: "Inventory, payment, orders, and ticket issuance have separate failure and delivery modes. A saga makes each transition durable and recoverable.",
              tags: ["saga", "checkout"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "payment-signal",
              prompt: "A payment provider reports authorization. What does that prove?",
              choices: [
                { id: "a", body: "Funds were approved for the payment; your system must still finalize against a valid hold before issuing tickets" },
                { id: "b", body: "The buyer owns the seats immediately" },
                { id: "c", body: "The hold can be ignored because money moved" },
                { id: "d", body: "Ticket issuance should run before the order transaction" }
              ],
              answer: "a",
              explanation: "Payment authorization is necessary but not sufficient. The order transaction must connect payment to a valid inventory claim.",
              tags: ["payment", "inventory"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "duplicate-webhook",
              prompt: "The same payment-authorized webhook arrives twice. What should happen on the second delivery?",
              choices: [
                { id: "a", body: "Return the already recorded result or observe the existing order; do not create a second order" },
                { id: "b", body: "Create another order because the provider called twice" },
                { id: "c", body: "Cancel the buyer's hold because duplicate events are always fraud" },
                { id: "d", body: "Issue tickets before checking checkout state" }
              ],
              answer: "a",
              explanation: "Webhook delivery is at-least-once. Event ids, operation keys, and checkout state make repeated delivery converge.",
              tags: ["webhooks", "idempotency"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "ticket-worker-failure",
              prompt: "Order finalization committed, but the ticket issuance worker crashed. Which recovery is safest?",
              choices: [
                { id: "a", body: "Retry ticket issuance from the committed order id" },
                { id: "b", body: "Run checkout finalization from the beginning with a new payment" },
                { id: "c", body: "Release the consumed hold" },
                { id: "d", body: "Tell the buyer payment failed even though the order exists" }
              ],
              answer: "a",
              explanation: "The order is now the durable fact. Ticket issuance should be an idempotent side effect driven from that order.",
              tags: ["ticket-issuance", "recovery"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "cumulative-control",
              prompt: "During checkout, payment errors spike and inventory hold latency rises. Which combined response best matches the previous chapters?",
              choices: [
                { id: "a", body: "Slow or pause admissions while keeping inventory constraints and checkout reconciliation running" },
                { id: "b", body: "Disable hold uniqueness so more checkouts can finish" },
                { id: "c", body: "Keep admitting buyers at the same rate because payment is downstream" },
                { id: "d", body: "Let cached seat availability decide ownership until payment recovers" }
              ],
              answer: "a",
              explanation: "The admission gate controls incoming expensive work, while inventory constraints and saga reconciliation preserve correctness under stress.",
              tags: ["cumulative", "admission-control", "inventory", "checkout"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "What You Can Now Recover From",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "You can now design the part of the system where buyers feel the most anxiety and the business takes on the most obligation. The model is deliberately conservative: holds protect inventory, payments produce signals, finalization creates the order, ticket issuance follows durable state, and reconciliation keeps the saga moving when messages arrive late or twice."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can distinguish payment authorization, order finalization, and ticket issuance.",
            "You can design checkout state so browser retries and webhook retries converge.",
            "You can place idempotency keys on provider calls, finalization, ticket issuance, and refunds.",
            "You can choose compensation when payment succeeds but inventory cannot be consumed.",
            "You can explain how admission control, inventory invariants, and checkout reconciliation work together under launch stress."
          ]
        })
      ]
    })
  ]
});
