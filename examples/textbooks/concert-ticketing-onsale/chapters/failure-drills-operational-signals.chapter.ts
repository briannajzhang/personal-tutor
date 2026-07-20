import { balancedQuiz, callout, chart, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "failure-drills-operational-signals",
  title: "Failure Drills and Operational Signals",
  description: "Choose launch metrics, load-test realistic buyer behavior, rehearse failures, and define owned operational levers.",
  role: "instruction",
  sections: [
    section({
      id: "launch-room",
      title: "The Design Is Not Ready Until It Can Be Operated",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can turn the on-sale architecture into a launch-day operating plan: choose the signals that protect correctness, load test the bottlenecks, rehearse failures, and decide which levers operators may pull when the sale is live."
        }),
        p({
          id: "starting-picture",
          body: "Imagine the launch room at 9:59. Everyone is watching graphs. The dangerous question is not `Are there graphs?` It is `If this line moves, who knows what to do?` An operational signal is only useful when it changes a decision."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "If you could watch only one metric during the first two minutes of a major on-sale, would you choose total HTTP requests per second, successful holds per second, payment provider latency, or database CPU? Pick one before reading on."
        }),
        p({
          id: "predict-answer",
          body: "There is no single universal metric, but `successful holds per second` is closer to the business invariant than raw traffic or CPU. It tells you whether admitted demand is becoming valid inventory claims. The best dashboard pairs it with hold latency, hold conflict rate, admission rate, checkout starts, and payment errors so you can tell why it changed."
        }),
        diagram({
          id: "signal-loop",
          title: "Signals Feed Operational Levers",
          body: `flowchart TD
  A["Observe signals"] --> B["Find stressed boundary"]
  B --> C["Choose a lever"]
  C --> D["Admission"]
  C --> E["Read precision"]
  C --> F["Hold budget"]
  C --> G["Checkout mode"]
  C --> H["Pause sale"]
  D --> I["Watch effects"]
  E --> I
  F --> I
  G --> I
  H --> I
  I --> A`
        }),
        p({
          id: "loop-readout",
          body: "The loop is the same control idea you have seen throughout the course. The system admits work, watches what happens, then tightens or loosens. The difference now is human coordination: actions must be named, rehearsed, and owned before launch."
        })
      ]
    }),
    section({
      id: "dashboard",
      title: "Dashboards Should Follow the Invariants",
      role: "instruction",
      blocks: [
        p({
          id: "dashboard-intro",
          body: "A launch dashboard should not be a museum of every metric your infrastructure emits. Start from the promises the system must keep: do not oversell, do not admit more work than the critical paths can process, do not charge buyers without recoverable order state, and do not leave buyers blind when the sale changes mode."
        }),
        p({
          id: "inspect-dashboard",
          body: "Inspect this dashboard skeleton by asking what decision each row supports."
        }),
        codeBlock({
          id: "dashboard-skeleton",
          language: "text",
          code: `Admission
  queue size, admitted buyers/sec, token validation failures, admission pause state
  Decision: raise/lower/pause admissions.

Inventory
  hold attempts/sec, successful holds/sec, hold p95/p99 latency, conflict rate, expired-hold backlog
  Decision: lower admission, tighten hold budgets, pause hot sections, investigate DB/locks.

Read models
  snapshot age by section, cache hit ratio, delta lag, map refresh rate, hold conflicts from stale snapshots
  Decision: lower map precision, slow refresh, republish snapshots, purge advisory.

Checkout
  checkout starts/sec, payment intent errors, authorization latency, finalize-order success/sec, refund_required count
  Decision: pause checkout starts, switch payment mode, trigger reconciliation, notify support.

Tickets and reconciliation
  orders finalized, tickets issued, issuance lag, stuck checkout states, duplicate webhook count
  Decision: scale workers, replay jobs, start incident review, halt reopening.`
        }),
        p({
          id: "dashboard-readout",
          body: "Notice that each row pairs a signal with a lever. `Database CPU` may still be on a lower-level panel, but the launch dashboard should answer: are we protecting the invariant, and what do we do next?"
        }),
        chart({
          id: "metric-distance-chart",
          title: "How Close Each Signal Is to Buyer-Safe Progress",
          type: "bar",
          xLabel: "Signal",
          yLabel: "Usefulness score from 1 to 5",
          points: [
            { label: "HTTP RPS", value: 1 },
            { label: "API CPU", value: 2 },
            { label: "Hold latency", value: 4 },
            { label: "Successful holds/sec", value: 5 },
            { label: "Order finalized/sec", value: 5 }
          ]
        }),
        p({
          id: "chart-readout",
          body: "The score is not a universal law. It is a reminder to prefer signals near the business state transitions you actually care about."
        })
      ]
    }),
    section({
      id: "load-tests",
      title: "Load Test the Shape, Not Just the Number",
      role: "instruction",
      blocks: [
        p({
          id: "load-intro",
          body: "A test that says `we handled 100,000 RPS` may teach very little. Real on-sale load has shape: a sudden arrival wave, queue polling, admitted shopping sessions, map refreshes, hot sections, failed holds, payment redirects, duplicate webhooks, and impatient retries."
        }),
        p({
          id: "inspect-script",
          body: "A useful load test script behaves like buyers, not like a benchmark loop."
        }),
        codeBlock({
          id: "load-script",
          language: "text",
          code: `Synthetic on-sale test
  800,000 users arrive in 90 seconds.
  70% enter pre-waiting-room before sale opens.
  15% are high-risk sessions with extra queue-entry attempts.
  Admitted buyers browse 2-4 sections.
  40% attempt a hold in one of three hot sections.
  25% of hold attempts conflict and retry once.
  65% of successful holds start checkout.
  Payment provider returns: 92% authorized, 5% failed, 3% delayed.
  Webhooks duplicate at 2% and arrive out of order at 0.5%.
  1% of ticket issuance jobs fail once and must retry.`
        }),
        p({
          id: "script-readout",
          body: "This test does not merely ask whether servers stay up. It checks whether the whole control plane behaves: queue gates, map projections, inventory constraints, checkout idempotency, and reconciliation."
        }),
        callout({
          id: "test-data-warning",
          tone: "caution",
          title: "Test data can lie",
          body: "If your synthetic users spread evenly across every section, you will miss the hot-row behavior that happens when everyone wants the same floor seats. Skew is part of the system."
        })
      ]
    }),
    section({
      id: "failure-drills",
      title: "A Drill Is a Question with a Timer",
      role: "instruction",
      blocks: [
        p({
          id: "drill-intro",
          body: "A failure drill asks a concrete question under time pressure: when this breaks, can the team preserve correctness and buyer trust before improvisation takes over? The drill should end with a runbook change, a missing metric, or evidence that the current design is sufficient."
        }),
        codeBlock({
          id: "drill-table",
          language: "text",
          code: `Drill: Inventory latency spike
  Inject: hold p99 jumps from 180 ms to 1.8 s for 3 minutes.
  Expected detection: inventory panel alerts before checkout errors rise.
  Expected action: lower admission, tighten hold-attempt budget, watch successful holds/sec.
  Pass condition: no duplicate holds, checkout backlog drains after recovery.

Drill: Payment provider partial outage
  Inject: payment intent creation errors at 8%, webhooks delayed 5 minutes.
  Expected action: slow checkout starts, keep holds expiring according to policy, reconciliation catches late auths.
  Pass condition: refund_required and manual_review are bounded and owned.

Drill: Read-model projection lag
  Inject: section snapshots lag 20 seconds for hot sections.
  Expected action: switch to section-level bands, lower refresh, keep hold conflicts product-safe.
  Pass condition: write path remains healthy and buyer copy is honest.

Drill: Ticket issuance worker down
  Inject: order finalization succeeds, issuance queue stops.
  Expected action: keep orders durable, alert on issuance lag, retry jobs after worker recovery.
  Pass condition: no duplicate orders, tickets eventually issue from order ids.`
        }),
        p({
          id: "drill-readout",
          body: "Each drill names the injected failure, the first signal that should move, the action to take, and the pass condition. Without those four pieces, the drill becomes theater."
        }),
        diagram({
          id: "drill-loop",
          title: "How a Drill Improves the System",
          body: `flowchart TD
  A["Inject failure"] --> B["Detect signal"]
  B --> C["Runbook action"]
  C --> D["Observe invariant"]
  D --> E{Pass?}
  E -->|yes| F["Record evidence"]
  E -->|no| G["Patch metric or runbook"]
  G --> A`
        })
      ]
    }),
    section({
      id: "levers",
      title: "Every Lever Needs an Owner",
      role: "instruction",
      blocks: [
        p({
          id: "lever-intro",
          body: "Launch controls are powerful enough to cause incidents themselves. Lowering admission too far can strand buyers. Extending holds can tie up inventory. Purging caches can stampede the origin. A lever is safe only if someone knows when to pull it, how far, and how to verify the effect."
        }),
        codeBlock({
          id: "lever-list",
          language: "text",
          code: `Admission rate
  Owner: launch commander or queue operator.
  Use when: inventory or checkout health degrades.
  Verify: hold latency, successful holds/sec, queue wait band.

Hold duration extension
  Owner: inventory lead.
  Use when: payment provider is delayed but inventory is otherwise valid.
  Verify: active holds, sellable inventory, expiration backlog.

Read precision downgrade
  Owner: frontend/read-model lead.
  Use when: map refresh or projection lag becomes dangerous.
  Verify: cache hit ratio, snapshot age, hold conflicts from stale reads.

Payment mode switch
  Owner: checkout/payment lead.
  Use when: provider is degraded or authorization latency spikes.
  Verify: payment intent errors, refund_required count, checkout abandonment.

Stop new holds
  Owner: incident commander.
  Use when: correctness risk is unknown.
  Verify: no new claims, active holds reconcile, buyer messaging live.`
        }),
        callout({
          id: "rollback-warning",
          tone: "caution",
          title: "Rollback is not always recovery",
          body: "During a live sale, rolling back code can be more dangerous than pausing admissions. If the old version does not understand current checkout states or token formats, rollback can break recovery paths. Treat rollback as one lever, not the default reflex."
        })
      ]
    }),
    section({
      id: "worked-incident",
      title: "Worked Incident: Payment Errors Spike",
      role: "instruction",
      blocks: [
        p({
          id: "incident-intro",
          body: "Trace a realistic incident. The useful move is to separate symptoms by boundary instead of calling the whole sale broken."
        }),
        codeBlock({
          id: "incident-timeline",
          language: "text",
          code: `10:04:00
  Admission: 300 buyers/sec, healthy.
  Inventory: hold p95 140 ms, conflict rate expected.
  Read model: section snapshots under 2 seconds.
  Checkout: payment intent errors rise from 0.2% to 7%.

10:04:30
  Checkout starts queue up; browser retries increase.
  Successful holds/sec remains healthy.
  Payment provider status page has no update.

Action
  Lower new admissions to 180/sec.
  Keep active holds valid; consider short hold extension for buyers already in payment.
  Disable checkout-start retries beyond token budget.
  Start payment reconciliation watch for delayed authorizations.
  Publish advisory: payment processing is delayed; do not refresh repeatedly.

10:08:00
  Payment errors fall below 1%.
  Reconciliation resolves delayed authorizations.
  Admission steps back up slowly.`
        }),
        p({
          id: "incident-readout",
          body: "The system did not need to stop all inventory holds immediately because inventory was healthy. It did need to reduce new pressure and prevent payment retries from becoming a second spike. The right action followed the boundary that was failing."
        }),
        callout({
          id: "buyer-copy",
          tone: "key-idea",
          title: "Buyer messaging is an operational control",
          body: "When buyers do not know what is happening, they refresh, retry, open new tabs, and contact support. Honest, specific copy can reduce load and preserve trust."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice Operating the On-Sale",
      role: "practice",
      blocks: [
        list({
          id: "design-prompts",
          items: [
            "Design a launch dashboard with five panels. For each panel, name one metric and the operational decision it supports.",
            "Your read-model delta stream is five seconds behind, but inventory and checkout are healthy. Name one read-side lever and one buyer-facing message.",
            "Hold p99 latency spikes, successful holds/sec drops, and payment errors are still normal. Which boundary is failing first, and which lever should move?",
            "A new deployment adds a checkout state that the previous version cannot read. Why might rollback be unsafe during the sale?",
            "Cumulative retrieval: a stale map causes conflicts, admitted buyers retry holds, payment errors rise, and tickets lag. Name one signal and one lever for read models, admission, inventory, checkout, and ticket issuance."
          ]
        }),
        balancedQuiz({
          id: "operations-review",
          title: "Review: Failure Drills and Signals",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "metric-choice",
              prompt: "Which metric is closest to buyer-safe progress during seat selection?",
              choices: [
                { id: "a", body: "Successful holds per second, paired with hold latency and conflict rate" },
                { id: "b", body: "Total HTTP requests per second by itself" },
                { id: "c", body: "Number of dashboard charts" },
                { id: "d", body: "Average CSS bundle download time" }
              ],
              answer: "a",
              explanation: "Successful holds are a real business transition. They still need context, but they are closer to the invariant than raw traffic.",
              tags: ["signals", "inventory"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "load-test-shape",
              prompt: "What makes an on-sale load test more realistic than a flat RPS test?",
              choices: [
                { id: "a", body: "It includes arrival burst, queue behavior, map refreshes, hot sections, conflicts, payment delays, duplicate webhooks, and retries" },
                { id: "b", body: "It sends the same endpoint request as fast as possible" },
                { id: "c", body: "It avoids payment and ticket issuance because those are external" },
                { id: "d", body: "It distributes buyers evenly across every seat" }
              ],
              answer: "a",
              explanation: "The failure modes come from behavior shape and cross-service interactions, not only request count.",
              tags: ["load-testing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "drill-pass",
              prompt: "A useful failure drill should include which four pieces?",
              choices: [
                { id: "a", body: "Injected failure, expected detection, expected action, and pass condition" },
                { id: "b", body: "A meeting title, a long dashboard, a severity label, and a calendar invite" },
                { id: "c", body: "Only the outage type, because responders should improvise" },
                { id: "d", body: "Only infrastructure metrics, because product behavior is subjective" }
              ],
              answer: "a",
              explanation: "A drill is meant to prove readiness. It needs a concrete failure, signal, action, and evidence of success.",
              tags: ["failure-drills"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "rollback-risk",
              prompt: "Why can rollback be risky during a live sale?",
              choices: [
                { id: "a", body: "The old version may not understand current tokens, checkout states, or transition records" },
                { id: "b", body: "Rollback always deletes databases" },
                { id: "c", body: "Rollback guarantees every queue position changes" },
                { id: "d", body: "Rollback disables all dashboards automatically" }
              ],
              answer: "a",
              explanation: "State compatibility matters. A rollback that cannot process current durable states can make recovery worse.",
              tags: ["recovery", "operations"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "cumulative-boundary",
              prompt: "Payment errors spike, but inventory hold latency and successful holds remain healthy. What is the best first response?",
              choices: [
                { id: "a", body: "Reduce new pressure into checkout, keep inventory invariants running, and start payment reconciliation" },
                { id: "b", body: "Disable inventory uniqueness so buyers can finish faster" },
                { id: "c", body: "Let cached seat maps create orders directly" },
                { id: "d", body: "Increase admission to compensate for payment failures" }
              ],
              answer: "a",
              explanation: "The failing boundary is checkout/payment. The response should reduce new checkout pressure while preserving inventory correctness and reconciliation.",
              tags: ["cumulative", "checkout", "inventory", "admission-control"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "What You Can Now Rehearse",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "You can now describe not only how the system should work, but how the team should know when it is drifting away from safety. That is the difference between a plausible architecture and a launchable one."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can choose launch metrics that sit close to admission, inventory, read-model, checkout, and ticket issuance invariants.",
            "You can design a load test that includes burst shape, hot inventory, conflicts, payment behavior, duplicate webhooks, and retries.",
            "You can write failure drills with injected failures, expected detection, expected action, and pass conditions.",
            "You can assign owners and verification signals to launch levers.",
            "You can explain why rollback, cache purge, hold extension, and sale pause are operational tools with risks, not magic buttons."
          ]
        })
      ]
    })
  ]
});
