import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "waiting-room-admission-gate",
  title: "The Waiting Room and Admission Gate",
  description: "Design queue ordering, admission tokens, rate limits, bot friction, and safe degradation under spike traffic.",
  role: "instruction",
  sections: [
    section({
      id: "queue-is-protocol",
      title: "The Queue Page Is Not the Queue",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can design a waiting room that converts a launch spike into controlled shopping sessions, explain what an admission token proves, and choose safe degradation behavior when downstream systems start to hurt."
        }),
        p({
          id: "wrong-picture",
          body: "It is tempting to picture the waiting room as a web page with a progress bar. That page is the least interesting part. The real waiting room is a protocol: it decides who is waiting, who may enter, for how long, and what proof they must carry when they hit the shopping APIs."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "A buyer opens ten browser tabs before the sale. Another buyer opens one tab exactly at sale time. If you sort only by first request timestamp, which buyer gets more chances to enter? What property is missing?"
        }),
        p({
          id: "predict-answer",
          body: "The multi-tab buyer gets more tickets in the lottery unless you bind queue entries to an identity or device/session budget. Arrival order is not fairness by itself. Fairness is a product policy enforced by a technical shape."
        }),
        diagram({
          id: "waiting-room-flow",
          title: "Waiting Room as an Admission Protocol",
          body: `flowchart TD
  A["Buyer arrives"] --> B["Pre-checks"]
  B --> C["Queue entry"]
  C --> D["Order policy"]
  D --> E["Scheduler"]
  E -->|token| F["Gate"]
  F -->|valid| G["Shopping APIs"]
  G --> H["Hold inventory"]
  E --> I["Slow or pause"]
  G -->|health| I`
        }),
        p({
          id: "diagram-readout",
          body: "The scheduler is the control knob. It does not merely pop the next person off a line. It chooses how many buyers to admit based on inventory health, checkout capacity, error rates, and policy. The gate then checks proof before expensive APIs run."
        })
      ]
    }),
    section({
      id: "ordering-policy",
      title: "Fair Enough Is a Design Requirement",
      role: "instruction",
      blocks: [
        p({
          id: "fair-intro",
          body: "For a major on-sale, exact fairness is usually impossible. Networks differ, clocks skew, users share devices, accounts are resold, and bots adapt. The useful goal is fair enough: ordinary buyers should not be punished for normal behavior, and attackers should not gain unlimited advantage from cheap automation."
        }),
        p({
          id: "policy-options-intro",
          body: "Inspect these three ordering policies. Each one sounds fair until you ask what behavior it rewards."
        }),
        codeBlock({
          id: "ordering-policies",
          language: "text",
          code: `Pure FIFO
  Sort by first arrival timestamp.
  Rewards fastest network, refresh scripts, pre-opened tabs, clock and edge quirks.

Pre-waiting-room lottery
  Anyone present before 10:00 gets randomized into an initial order.
  Reduces refresh races, but needs identity/session controls to avoid many entries per buyer.

Hybrid
  Lottery for pre-sale arrivals, FIFO after sale opens, with caps per account/device/risk bucket.
  Usually closer to product expectations, but harder to explain and operate.`
        }),
        p({
          id: "policy-readout",
          body: "The policy is not only an algorithm. It shapes user behavior. If refreshes improve position, people refresh. If tabs improve odds, people open tabs. A waiting room should make the desired behavior boring: arrive once, keep the page open, wait for an admission decision."
        }),
        callout({
          id: "position-boundary",
          tone: "caution",
          title: "Do not overpromise queue position",
          body: "Showing `you are exactly 18,431st` creates a contract your system may not be able to honor when fraud filtering, capacity changes, paused admissions, and inventory sell-through alter the path. A range or progress band is often more honest."
        })
      ]
    }),
    section({
      id: "admission-token",
      title: "An Admission Token Is a Narrow Passport",
      role: "instruction",
      blocks: [
        p({
          id: "token-intro",
          body: "When the scheduler admits a buyer, it should not set a client flag like `admitted=true` and hope the APIs believe it. It should issue a short-lived, signed admission token. The token is a passport into a narrow part of the system, not a promise of inventory."
        }),
        p({
          id: "inspect-token",
          body: "Read the token as a set of claims the gate can verify without asking the queue service on every request."
        }),
        codeBlock({
          id: "token-shape",
          language: "json",
          code: `{
  "iss": "waiting-room",
  "event_id": "evt_44",
  "queue_entry_id": "qe_9vM7",
  "buyer_subject": "acct_123_or_device_hash",
  "risk_bucket": "normal",
  "scope": ["seat-map:read", "hold:create"],
  "admitted_at": "2026-07-20T17:00:12Z",
  "expires_at": "2026-07-20T17:10:12Z",
  "max_hold_attempts": 8,
  "nonce": "single-use-random-value",
  "signature": "..."
}`
        }),
        p({
          id: "token-readout",
          body: "The useful fields are the limits. The event scope prevents a token for one event from opening another. The expiration prevents hoarded access. The hold-attempt budget stops an admitted buyer from hammering inventory forever. The nonce lets the gate block replay or bind a shopping session to one admitted entry."
        }),
        codeBlock({
          id: "gate-pseudocode",
          language: "text",
          code: `authorize_shopping_request(request):
  token = parse_admission_token(request.header)
  require valid_signature(token)
  require token.event_id == request.event_id
  require token.expires_at > now()
  require token.scope contains request.required_scope
  require token.nonce is bound to this shopping session
  require token attempt budget is not exhausted
  require buyer/session risk has not changed to blocked
  allow request`
        }),
        callout({
          id: "token-not-seat",
          tone: "key-idea",
          title: "Admission is not ownership",
          body: "The token only says `you may try to shop now`. The inventory transaction still decides whether any seat or GA quantity can be held."
        })
      ]
    }),
    section({
      id: "rate-limits",
      title: "Rate Limits Belong at Several Doors",
      role: "instruction",
      blocks: [
        p({
          id: "rate-limit-intro",
          body: "The waiting room controls admission into shopping, but admitted buyers can still create bad load. They reload maps, click sold seats, retry holds, change quantities, and bounce between devices. You need budgets at each door where cheap actions turn into expensive work."
        }),
        codeBlock({
          id: "rate-limit-layers",
          language: "text",
          code: `Edge
  Limit raw request floods by IP, ASN, device fingerprint, and obvious automation signals.

Queue service
  Limit queue-entry creation per account, device, and risk bucket.

Admission scheduler
  Limit buyers admitted per second per event, price level, region, or channel.

Shopping gate
  Limit seat-map refreshes, hold attempts, and checkout starts per admission token.

Inventory service
  Limit retries and conflict storms near hot sections; return product conflicts, not generic errors.`
        }),
        p({
          id: "layer-readout",
          body: "Each layer catches a different shape of pressure. Edge limits stop noise. Queue-entry limits reduce fake demand. Admission limits protect capacity. Token budgets prevent admitted sessions from becoming unbounded. Inventory limits keep hot rows from turning ordinary conflicts into retry storms."
        }),
        p({
          id: "control-loop",
          body: "A good admission scheduler is a feedback loop. It starts with a planned rate, watches downstream health, and adjusts. If hold latency doubles or payment creation errors spike, the safe move is to slow admission before the system collapses into retries."
        }),
        codeBlock({
          id: "scheduler-loop",
          language: "text",
          code: `every 5 seconds:
  target = planned_admission_rate(event_id)

  if inventory_p95_latency > 300ms:
    target = target * 0.70

  if hold_conflict_rate > expected_band and retry_rate rising:
    target = target * 0.80

  if checkout_start_errors > 1%:
    target = min(target, last_stable_rate)

  if all signals healthy for 3 windows:
    target = target + small_step

  admit target buyers/sec for the next window`
        }),
        callout({
          id: "feedback-warning",
          tone: "caution",
          title: "Do not chase every wiggle",
          body: "A feedback loop needs smoothing and guardrails. If you raise and lower admission on every tiny metric twitch, you create oscillation: buyers surge in, systems strain, admissions slam shut, systems recover, and the cycle repeats."
        })
      ]
    }),
    section({
      id: "bot-pressure",
      title: "Bot Defense Raises Cost; It Does Not Prove Humanity",
      role: "instruction",
      blocks: [
        p({
          id: "bot-intro",
          body: "Bot defense is part security, part economics. You rarely prove that someone is a real fan. You raise the cost of creating many credible queue entries and lower the reward from automation. That changes the attacker's math."
        }),
        p({
          id: "bot-layers-intro",
          body: "The strongest designs combine signals instead of worshiping one signal. A CAPTCHA, by itself, can be solved, outsourced, or avoided. A signed account, by itself, can be farmed. A device fingerprint, by itself, can be spoofed. Together, signals help choose friction and limits."
        }),
        codeBlock({
          id: "risk-buckets",
          language: "text",
          code: `normal
  Established account, ordinary device history, human-like navigation.
  Standard queue entry budget and normal admission.

unknown
  New account or weak device history, but no hard abuse signal.
  Lower entry budget, extra verification, slower admission lane.

high-risk
  Automation signatures, many accounts per device/network, impossible navigation timing.
  Challenge, throttle, or block before inventory paths.`
        }),
        p({
          id: "risk-readout",
          body: "Risk buckets let the system respond proportionally. You do not need to punish every new buyer as a bot, and you do not need to give every suspicious session the same access as a long-lived account. The admission scheduler can spend capacity where confidence is higher."
        }),
        callout({
          id: "false-positive",
          tone: "caution",
          title: "False positives are product damage",
          body: "Aggressive bot defense can block real buyers: travelers, campus networks, VPN users, families sharing a device, accessibility tools. Design review paths and conservative fallbacks for ambiguous cases."
        })
      ]
    }),
    section({
      id: "graceful-degradation",
      title: "Graceful Degradation Means Saving the Invariant First",
      role: "instruction",
      blocks: [
        p({
          id: "degrade-intro",
          body: "During a spike, not every feature deserves to survive. The system should shed work in an order that preserves correctness and buyer trust. If you have to choose between animated seat-map polish and preventing duplicate holds, the animation goes."
        }),
        codeBlock({
          id: "degradation-ladder",
          language: "text",
          code: `Level 0: Normal
  Live map refreshes, recommendations, cross-sells, precise queue estimates.

Level 1: Conserve read capacity
  Lower map refresh frequency, serve cached availability bands, disable recommendations.

Level 2: Protect write paths
  Reduce admission rate, tighten hold-attempt budgets, pause best-available searches in hot areas.

Level 3: Preserve correctness
  Pause new admissions, let admitted checkouts finish, keep expiration/finalization workers running.

Level 4: Stop the sale safely
  Freeze admissions, disable new holds, reconcile active holds and payments before reopening.`
        }),
        p({
          id: "ladder-readout",
          body: "The ladder is ordered by what the business can recover from. A stale progress estimate is annoying. A duplicate ticket is a contractual failure. A charged buyer with no recorded order is a reconciliation incident. Degradation should keep the irreversible mistakes rare."
        }),
        diagram({
          id: "health-to-action",
          title: "Health Signals Become Admission Actions",
          body: `flowchart TD
  A["Watch health"] --> B{Signal?}
  B -->|map hot| C["Coarser map"]
  B -->|inventory slow| D["Lower admission"]
  B -->|checkout errors| E["Pause checkout starts"]
  B -->|payment issue| F["Extend holds cautiously"]
  B -->|unknown risk| G["Stop admissions"]
  C --> H["Keep sale moving"]
  D --> H
  E --> H
  F --> H
  G --> I["Reconcile first"]`
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice the Admission Gate",
      role: "practice",
      blocks: [
        list({
          id: "design-prompts",
          items: [
            "A buyer copies an admission token URL to a friend. Name two token fields or gate checks that should prevent the friend from shopping with it.",
            "At 10:00, 600,000 users are already waiting and 200,000 arrive after 10:00. Choose FIFO, lottery, or hybrid ordering, and explain the behavior your choice rewards.",
            "Inventory hold p95 rises from 120 ms to 700 ms while queue size is still huge. What should the scheduler do before API retries amplify the load?",
            "A high-risk bucket has a 30% higher conversion to hold conflicts and far more map refreshes. Name one friction change and one budget change you would apply.",
            "Payment provider errors spike, but inventory is healthy. Should the system keep admitting buyers into seat selection at the same rate? Explain the failure you are trying to avoid."
          ]
        }),
        balancedQuiz({
          id: "admission-review",
          title: "Review: Waiting Room and Gate",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "queue-protocol",
              prompt: "What is the real job of the waiting room in a major on-sale?",
              choices: [
                { id: "a", body: "To decide and prove who may enter expensive shopping paths at a controlled rate" },
                { id: "b", body: "To guarantee every buyer gets tickets if they wait long enough" },
                { id: "c", body: "To replace database constraints in the inventory service" },
                { id: "d", body: "To make the event page look active while servers autoscale" }
              ],
              answer: "a",
              explanation: "The waiting room is an admission protocol. It bounds downstream work and gives admitted buyers proof, but inventory and checkout still enforce their own correctness rules.",
              tags: ["waiting-room", "admission-control"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "token-scope",
              prompt: "Why should an admission token include event scope and expiration?",
              choices: [
                { id: "a", body: "So access is narrow, short-lived, and not reusable across events or long after admission" },
                { id: "b", body: "So the buyer automatically owns any seat they click" },
                { id: "c", body: "So the seat map never needs caching" },
                { id: "d", body: "So the payment provider can skip authorization" }
              ],
              answer: "a",
              explanation: "Admission tokens should grant only a bounded opportunity to shop. Scope and expiration limit replay, leakage, and stale access.",
              tags: ["admission-token", "security"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "scheduler-feedback",
              prompt: "Hold latency and retry rate are rising quickly. What should the admission scheduler usually do first?",
              choices: [
                { id: "a", body: "Lower or pause admissions before retries push the inventory service further over budget" },
                { id: "b", body: "Admit more buyers so the queue drains faster" },
                { id: "c", body: "Disable the unique seat constraint" },
                { id: "d", body: "Tell buyers to refresh the seat map more often" }
              ],
              answer: "a",
              explanation: "The scheduler controls arrival into expensive paths. Slowing admission protects the critical section while the system stabilizes.",
              tags: ["feedback-loop", "admission-control"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "bot-defense",
              prompt: "Which statement best describes bot defense for an on-sale?",
              choices: [
                { id: "a", body: "It combines signals to raise abuse cost and choose proportional friction; it does not perfectly prove humanity" },
                { id: "b", body: "A CAPTCHA proves the buyer is a real fan" },
                { id: "c", body: "IP rate limiting alone is enough for fairness" },
                { id: "d", body: "All new accounts should be blocked from the sale" }
              ],
              answer: "a",
              explanation: "No single signal is definitive. Good defenses combine signals, budgets, friction, and review paths while accounting for false positives.",
              tags: ["bot-defense", "fairness"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "degradation-order",
              prompt: "A launch is under stress. Which degradation choice best preserves correctness?",
              choices: [
                { id: "a", body: "Reduce admissions and map refreshes while keeping hold expiration and order finalization running" },
                { id: "b", body: "Stop expiration workers so active holds never disappear" },
                { id: "c", body: "Keep admitting buyers but turn off inventory conflict checks" },
                { id: "d", body: "Prioritize cross-sell recommendations because they are cacheable" }
              ],
              answer: "a",
              explanation: "Correctness depends on the inventory and checkout state machines continuing to make durable transitions. Optional read-side features should shed first.",
              tags: ["graceful-degradation", "operations"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "What You Can Now Defend",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "The first two chapters protected the inventory critical section. This chapter taught the upstream contract that makes that protection practical. A waiting room is not a polite delay. It is the system that decides how much expensive work is allowed to exist."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can describe queue entry, ordering policy, admission scheduling, token issuance, and gate validation as separate responsibilities.",
            "You can explain why exact queue position is often a product risk rather than a transparency win.",
            "You can design a narrow admission token with scope, expiration, nonce, and budgets.",
            "You can place rate limits at edge, queue, admission, shopping, and inventory boundaries.",
            "You can choose degradation steps that shed optional work before correctness work."
          ]
        })
      ]
    })
  ]
});
