import { balancedQuiz, callout, chart, chapter, codeBlock, diagram, list, p, section } from "tutor-kit";

export default chapter({
  id: "read-models-for-availability",
  title: "Read Models for Maps and Availability",
  description: "Serve seat maps and availability through versioned snapshots, deltas, cache partitions, and explicit freshness budgets.",
  role: "instruction",
  sections: [
    section({
      id: "green-pixels",
      title: "A Green Seat Is a Hint",
      role: "instruction",
      blocks: [
        p({
          id: "goal",
          body: "After this lesson, you can design seat-map and availability read models that survive on-sale fan-out, publish useful freshness signals, and never let a stale read decide who owns inventory."
        }),
        p({
          id: "starting-picture",
          body: "At 10:02, a buyer opens the map and sees thousands of green seats. Every green pixel is a small promise: this is worth trying. It must not be a legal promise: this is yours. The write path already owns that second promise."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "Suppose 400,000 admitted buyers refresh a seat map every two seconds. If each refresh queries the live inventory tables, which earlier protection have you accidentally bypassed?"
        }),
        p({
          id: "predict-answer",
          body: "You bypass the idea of bounding the critical section. Even if the requests are reads, they compete with the tables and indexes that holds and finalization need. The map API should mostly read from a projection built for fan-out, not from the ownership tables themselves."
        }),
        diagram({
          id: "projection-flow",
          title: "Inventory Writes Publish Read Models",
          body: `flowchart TD
  A["Inventory ledger"] -->|changes| B["Projection builder"]
  B --> C["Section snapshots"]
  B --> D["Seat-status tiles"]
  B --> E["Price counts"]
  C --> F["CDN/cache"]
  D --> F
  E --> F
  F --> G["Buyer map UI"]
  G -->|hold| H["Inventory tx"]
  H --> A`
        }),
        p({
          id: "diagram-readout",
          body: "The read model is downstream of inventory, not parallel truth. Buyers browse cached projections, then hold through the inventory transaction. If projection and transaction disagree, the transaction wins and the UI recovers."
        })
      ]
    }),
    section({
      id: "freshness-contract",
      title: "Freshness Is a Contract, Not a Feeling",
      role: "instruction",
      blocks: [
        p({
          id: "freshness-intro",
          body: "A useful read model names how stale it may be. `Real-time availability` is often both expensive and misleading. A better contract is concrete: seat statuses are usually under two seconds old, section counts may lag five seconds, and exact ownership is checked only when a hold is attempted."
        }),
        p({
          id: "inspect-chart",
          body: "Inspect how different map surfaces tolerate staleness. The more a surface influences a buyer's exact click, the tighter its freshness budget should be."
        }),
        chart({
          id: "freshness-budget-chart",
          title: "Reasonable Staleness Budgets by Surface",
          type: "bar",
          xLabel: "Surface",
          yLabel: "Freshness budget in seconds",
          points: [
            { label: "Event page inventory badge", value: 30 },
            { label: "Price-level counts", value: 10 },
            { label: "Section heatmap", value: 5 },
            { label: "Seat status tile", value: 2 },
            { label: "Hold response", value: 0 }
          ]
        }),
        p({
          id: "chart-readout",
          body: "The hold response has no staleness budget because it is not a read-model answer. It is the write-path result. Everything above it can be a little stale if the product copy and failure behavior are honest."
        }),
        codeBlock({
          id: "freshness-payload",
          language: "json",
          code: `{
  "event_id": "evt_44",
  "section_id": "114",
  "snapshot_version": 928817,
  "generated_at": "2026-07-20T17:03:12.240Z",
  "max_expected_staleness_ms": 2000,
  "seat_statuses": {
    "B-4": "available",
    "B-5": "held",
    "B-6": "sold"
  }
}`
        }),
        callout({
          id: "copy-boundary",
          tone: "caution",
          title: "Product language matters",
          body: "A UI that says `available right now` when the data may be two seconds old trains buyers to distrust the system. Prefer language like `try these seats` or `recently available` near high-churn inventory."
        })
      ]
    }),
    section({
      id: "partitioning",
      title: "Partition the Map Where Buyers Look",
      role: "instruction",
      blocks: [
        p({
          id: "partition-intro",
          body: "A stadium map is too large and too hot to invalidate as one object. If one seat in section 114 changes, rebuilding and purging the whole event map wastes capacity and creates cache churn. Partition the read model along the same boundaries buyers navigate: event, price level, section, row group, accessible seating, resale channel."
        }),
        p({
          id: "inspect-keys",
          body: "Read these cache keys as a design statement. They say which data can change independently and which clients can reuse the same object."
        }),
        codeBlock({
          id: "cache-keys",
          language: "text",
          code: `event:evt_44:manifest:v17
  List of sections, price levels, static geometry, current global versions.

event:evt_44:section:114:status:v928817
  Seat statuses for one section.

event:evt_44:price-level:floor:counts:v5512
  GA or price-level availability counts.

event:evt_44:section:114:geometry:v3
  Static seat positions, row labels, accessibility metadata.

event:evt_44:advisory-message:v42
  Product message: paused admissions, low availability, checkout delay.`
        }),
        p({
          id: "key-readout",
          body: "Static geometry and dynamic availability are separate because they change at different speeds. Section 114 and section 115 are separate because one hot section should not invalidate the whole map. Advisory messages are separate because operations may need to change copy without republishing seat states."
        }),
        diagram({
          id: "cache-hierarchy",
          title: "Map Data Split by Change Rate",
          body: `flowchart TD
  A["Event manifest"] --> B["Static geometry"]
  A --> C["Dynamic section statuses"]
  A --> D["Price-level counts"]
  A --> E["Operational advisory"]
  B --> F["Long TTL, versioned"]
  C --> G["Short TTL, section version"]
  D --> H["Short TTL, count version"]
  E --> I["Tiny object, fast purge"]`
        })
      ]
    }),
    section({
      id: "snapshots-and-deltas",
      title: "Snapshots Recover; Deltas Feel Live",
      role: "instruction",
      blocks: [
        p({
          id: "snapshot-delta-intro",
          body: "A snapshot is a complete read-model object for a partition: all statuses for section 114 at version 928817. A delta is a small change after that version: B-4 moved from available to held. Deltas make the UI feel live, but snapshots are what let a client recover after a disconnect or missed message."
        }),
        codeBlock({
          id: "delta-stream",
          language: "json",
          code: `{
  "event_id": "evt_44",
  "section_id": "114",
  "from_version": 928817,
  "to_version": 928818,
  "changes": [
    { "seat_id": "B-4", "from": "available", "to": "held" },
    { "seat_id": "B-5", "from": "available", "to": "held" }
  ],
  "reason": "hold_created"
}`
        }),
        p({
          id: "delta-readout",
          body: "`from_version` is the guard. If the browser has version 928816 and receives a delta from 928817 to 928818, it is missing a step. It should fetch the latest section snapshot instead of applying changes to the wrong base."
        }),
        codeBlock({
          id: "client-recovery",
          language: "text",
          code: `on_delta(delta):
  current = section_versions[delta.section_id]

  if delta.from_version != current:
    fetch_snapshot(delta.section_id)
    return

  apply changes
  section_versions[delta.section_id] = delta.to_version`
        }),
        callout({
          id: "push-not-authority",
          tone: "key-idea",
          title: "Live updates are still read-side hints",
          body: "A WebSocket or server-sent event can make the map feel fresh. It still does not grant ownership. The hold transaction remains the authority."
        })
      ]
    }),
    section({
      id: "degrade-reads",
      title: "When Reads Get Hot, Reduce Precision First",
      role: "instruction",
      blocks: [
        p({
          id: "degrade-intro",
          body: "Under stress, the read side should degrade before the write side loses correctness. The key is to reduce precision and refresh rate while keeping the buyer oriented. Do not keep perfect-looking green dots if they are too expensive to maintain."
        }),
        codeBlock({
          id: "read-degradation",
          language: "text",
          code: `Normal
  Seat-level status updates every 1-2 seconds for open sections.

Read pressure rising
  Increase polling interval, stop background refresh for unopened sections.

Very high churn
  Show section-level availability bands: good, limited, nearly gone.

Write path under pressure
  Freeze map refresh briefly, lower admission, let active checkout finish.

Unknown correctness risk
  Hide exact availability, pause new holds, reconcile inventory state.`
        }),
        p({
          id: "degrade-readout",
          body: "A less precise map can still be honest. A precise but wrong-looking map causes furious retries. The degradation ladder should protect the transaction path by making the read side cheaper and calmer."
        }),
        callout({
          id: "retry-loop",
          tone: "caution",
          title: "Bad read UX can create write load",
          body: "If the UI keeps showing seats that almost always fail to hold, buyers click faster and retry more. Stale reads become write pressure. Availability UX is part of load control."
        })
      ]
    }),
    section({
      id: "worked-case",
      title: "Worked Case: Section 114 Goes Hot",
      role: "instruction",
      blocks: [
        p({
          id: "case-intro",
          body: "Now trace one hot section. The goal is not to eliminate staleness; it is to keep staleness bounded, visible, and harmless."
        }),
        codeBlock({
          id: "case-trace",
          language: "text",
          code: `10:03:00.000
  Section 114 snapshot v200 says B-4 and B-5 are available.

10:03:00.450
  Buyer A holds B-4 and B-5. Inventory transaction commits.
  Projection builder receives hold_created.

10:03:00.900
  Section 114 snapshot v201 is published.
  Delta v200 -> v201 is pushed to connected clients.

10:03:01.100
  Buyer B's browser still shows v200 and tries B-4/B-5.
  Hold transaction rejects conflict.
  UI fetches v201 and suggests nearby seats.

10:03:01.500
  CDN edge serves v201 to new section viewers.`
        }),
        p({
          id: "case-readout",
          body: "Buyer B saw stale data for about a second. That is acceptable because the stale data only invited an attempt; it did not create ownership. The failure mode is a product miss, not a double-booking."
        }),
        diagram({
          id: "stale-read-sequence",
          title: "Stale Read Falls Into Safe Conflict",
          body: `sequenceDiagram
  participant A as Buyer A
  participant I as Inventory
  participant P as Projection
  participant B as Buyer B
  A->>I: hold B-4, B-5
  I-->>A: hold succeeds
  I->>P: hold_created
  B->>I: hold B-4, B-5 from old map
  I-->>B: conflict, choose again
  P-->>B: snapshot v201`
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice the Read Model",
      role: "practice",
      blocks: [
        list({
          id: "design-prompts",
          items: [
            "A section changes every 300 ms during peak selection. Should the UI keep trying to show exact seat-level freshness, or switch to a coarser availability band? Explain the trade.",
            "Design cache keys for event geometry, section statuses, and price-level counts. Which keys should have long TTLs, and which should be versioned aggressively?",
            "A browser receives delta v52 -> v53, but its current section version is v51. What should it do, and why?",
            "A stale map produces many hold conflicts in one price level. Name one read-side change and one admission-side change that would reduce write pressure.",
            "Cumulative retrieval: a buyer has an admission token, sees a cached seat as available, gets a hold conflict, then pays successfully for a different valid hold. Name the component that controls admission, the mechanism that rejects the stale seat, and the saga step that creates the order."
          ]
        }),
        balancedQuiz({
          id: "read-model-review",
          title: "Review: Availability Read Models",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "read-model-purpose",
              prompt: "What is the best role for a seat-map read model during a major on-sale?",
              choices: [
                { id: "a", body: "Help buyers browse recent availability cheaply while the hold transaction decides ownership" },
                { id: "b", body: "Guarantee ownership for every green seat shown" },
                { id: "c", body: "Replace the inventory ledger during traffic spikes" },
                { id: "d", body: "Keep the primary inventory tables busy with live map polling" }
              ],
              answer: "a",
              explanation: "Read models absorb fan-out and guide buyer choices. Ownership still belongs to the write path.",
              tags: ["read-model", "inventory"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "snapshot-delta",
              prompt: "A client at section version 10 receives a delta whose `from_version` is 11 and `to_version` is 12. What should it do?",
              choices: [
                { id: "a", body: "Fetch a fresh section snapshot because it missed a delta" },
                { id: "b", body: "Apply the delta anyway because newer is always better" },
                { id: "c", body: "Create a hold for every changed seat" },
                { id: "d", body: "Clear the buyer's admission token" }
              ],
              answer: "a",
              explanation: "Deltas only make sense against the expected base version. A missed step means the client needs a complete snapshot.",
              tags: ["deltas", "recovery"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "cache-partition",
              prompt: "Why split static geometry from dynamic seat status?",
              choices: [
                { id: "a", body: "Geometry changes rarely and can be cached longer; status changes quickly and needs short-lived/versioned updates" },
                { id: "b", body: "Geometry is the authority for ownership" },
                { id: "c", body: "Dynamic status never needs caching" },
                { id: "d", body: "It lets checkout skip hold finalization" }
              ],
              answer: "a",
              explanation: "Different change rates deserve different cache objects. This avoids invalidating large stable data when a few seats change.",
              tags: ["cache-keys", "partitioning"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "read-degradation",
              prompt: "Seat-level read traffic is overwhelming the projection/cache layer. Which degradation is safest?",
              choices: [
                { id: "a", body: "Reduce refresh frequency or show section-level bands while preserving hold transaction correctness" },
                { id: "b", body: "Let cached availability create orders directly" },
                { id: "c", body: "Disable inventory conflicts so green seats always work" },
                { id: "d", body: "Increase map polling so buyers get more chances" }
              ],
              answer: "a",
              explanation: "The read side can become less precise. The write-side invariant must remain strict.",
              tags: ["degradation", "availability"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "cumulative-safe-path",
              prompt: "A buyer with a valid admission token sees B-4 as available in a stale snapshot, but the hold attempt conflicts. What made this safe?",
              choices: [
                { id: "a", body: "Admission bounded the attempt, the inventory invariant rejected stale ownership, and checkout can continue only with a valid hold" },
                { id: "b", body: "The cached snapshot was treated as legal proof of ownership" },
                { id: "c", body: "Payment can override the conflict" },
                { id: "d", body: "The UI can issue tickets after a failed hold" }
              ],
              answer: "a",
              explanation: "This is the course model working together: bounded access, durable inventory truth, and checkout tied to a valid hold.",
              tags: ["cumulative", "admission-control", "inventory", "checkout"],
              difficulty: "hard"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "What You Can Now Serve Cheaply",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "You can now design the part of the system most buyers touch most often without letting it become the source of truth. Read models make the sale feel navigable. Write models make it correct."
        }),
        list({
          id: "mastery-check",
          items: [
            "You can explain why a seat-map read model is a recent browsing hint, not an ownership decision.",
            "You can assign freshness budgets to event badges, price-level counts, section heatmaps, seat tiles, and hold responses.",
            "You can split cache keys by event manifest, static geometry, section status, price-level count, and operational advisory.",
            "You can use snapshots and deltas without losing recovery after missed messages.",
            "You can degrade read precision before weakening inventory or checkout correctness."
          ]
        })
      ]
    })
  ]
});
