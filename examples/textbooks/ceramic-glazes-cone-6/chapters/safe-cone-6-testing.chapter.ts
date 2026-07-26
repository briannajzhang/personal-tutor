import {
  balancedQuiz,
  callout,
  chapter,
  codeBlock,
  glossary,
  image,
  list,
  p,
  quiz,
  section,
  transformation
} from "tutor-kit";

export default chapter({
  id: "safe-cone-6-testing",
  title: "Safe Cone 6 Testing",
  description: "Plan small glaze tests that protect your lungs, kiln shelves, records, and learning signal.",
  role: "instruction",
  sections: [
    section({
      id: "plan-before-powder",
      title: "Plan Before Powder",
      role: "instruction",
      blocks: [
        p({
          id: "learner-goal",
          body: "After this chapter, you should be able to plan a small cone 6 test before opening any dry material: one question, one controlled change, labeled tiles, shelf protection, dust controls, and a record that makes the fired result interpretable."
        }),
        p({
          id: "test-not-mini-production",
          body: "A glaze test is not a tiny production run. Production asks, 'Can I make this surface again on useful pots?' A test asks a narrower question: 'What happens if I change this one thing under these firing and application conditions?' That narrowness is what makes the result useful."
        }),
        p({
          id: "prediction",
          body: "Before you weigh, predict the failure you are trying to avoid. If a glaze might run, your setup should reveal running safely. If you are testing fit, the clay body must stay constant. If you are testing a colorant, the base glaze should stay constant. The test design comes from the question."
        }),
        image({
          id: "safe-testing-setup",
          src: "assets/safe-testing-setup.png",
          alt: "Generated studio setup with labeled upright glaze test tiles on catch plates, a gram scale, closed material jars, witness cones, a notebook, cleanup sponge, and respirator.",
          caption: "Generated teaching image: a useful glaze test setup keeps labels, shelf protection, weighing, cleanup, firing evidence, and records visible before firing.",
          credit: "Generated for this Tutor Kit course."
        }),
        callout({
          id: "central-rule",
          tone: "key-idea",
          title: "The central rule",
          body: "Change one thing when you can. When you deliberately change more than one thing, name the design as a blend and record every cup."
        })
      ]
    }),
    section({
      id: "dust-and-material-safety",
      title: "Dust And Material Safety",
      role: "instruction",
      blocks: [
        p({
          id: "dust-intro",
          body: "The most important glaze safety habit is quiet material handling. Dry ceramic powders can contain materials that harm lungs or poison the body. Silica-bearing dust is especially serious because respirable particles are small enough to travel deep into the lungs. Your first defense is not a dramatic cleanup afterward; it is preventing dust from becoming airborne."
        }),
        transformation({
          id: "dust-control-ladder",
          title: "The Dust-Control Ladder",
          focus: "Prefer controls that prevent airborne dust over controls that only protect you after dust exists.",
          layout: "flow",
          inputLabel: "Risky moment",
          operationLabel: "Better control",
          outputLabel: "Studio behavior",
          input: [
            {
              format: "table",
              columns: ["Moment", "Dust risk"],
              rows: [
                ["opening bags and jars", "powder lifted into breathing zone"],
                ["scooping and dumping", "falling powder creates a plume"],
                ["cleaning spills", "dry sweeping re-suspends dust"],
                ["sanding fired or bisque surfaces", "fine particles released"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Control at the source: keep containers closed, scoop low and slowly, mist or wipe where appropriate, use local exhaust when available, and keep dusty work away from food, drink, and shared living spaces."
          },
          output: [
            {
              format: "table",
              columns: ["Weak habit", "Safer habit"],
              rows: [
                ["dry sweep the table", "wet wipe or use an appropriate HEPA-filtered vacuum"],
                ["blow dust away", "never use compressed air for cleanup"],
                ["mix near a coffee mug", "keep food and drink out of the studio"],
                ["trust any mask", "use appropriate, well-fitting respiratory protection when controls are not enough"]
              ]
            }
          ],
          explanation: "Respirators are a backup layer, not permission to make dust. A shared studio may have specific rules for ventilation, respirators, waste, and restricted materials; follow them."
        }),
        callout({
          id: "sds-labels",
          tone: "caution",
          title: "Know the material before using it",
          body: "Keep materials labeled, read safety data sheets, and avoid unknown powders. Do not use lead or cadmium materials in beginner studio glaze tests, and be cautious with soluble materials and high colorant loads."
        }),
        callout({
          id: "respirator-boundary",
          tone: "caution",
          title: "Respirator fit matters",
          body: "For dusty work, use respiratory protection appropriate to the material and exposure, and make sure it seals to your face. If you work in a school, community studio, or workplace, use the required fit-testing, training, ventilation, and housekeeping procedures."
        }),
        quiz({
          id: "safety-gate-check",
          title: "Safety Gate Check",
          mode: "check",
          questions: [
            {
              kind: "matching",
              id: "match-risk-to-control",
              prompt: "Match the risky habit to the safer control.",
              leftLabel: "Risky habit",
              rightLabel: "Safer control",
              pairs: [
                {
                  id: "sweeping",
                  left: "Dry sweeping glaze powder",
                  right: "Wet cleanup or appropriate HEPA-filtered vacuum"
                },
                {
                  id: "air",
                  left: "Blowing dust off a bench",
                  right: "Do not use compressed air for cleanup"
                },
                {
                  id: "open-containers",
                  left: "Leaving material jars open while deciding what to test",
                  right: "Plan first, then open only what you need"
                },
                {
                  id: "food",
                  left: "Weighing glaze near a drink",
                  right: "Keep food and drink out of the studio"
                }
              ],
              explanation: "The pattern is source control. Avoid making dust, capture or wet-clean dust that exists, and keep ingestion routes out of the workspace.",
              tags: ["dust-control", "studio-safety"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "hundred-gram-tests",
      title: "Batch Math That Keeps Tests Small",
      role: "instruction",
      blocks: [
        p({
          id: "batch-size-intro",
          body: "A 100 gram test batch is easy to read, but it is not always the best size. For a single first test, 100 grams may give enough glaze for several small tiles. For a five-cup blend, 50 grams per cup may be plenty. Smaller batches reduce waste and exposure, but they demand more careful weighing."
        }),
        p({
          id: "scale-precision",
          body: "Use a gram scale that can resolve the amounts you need. If a colorant addition is 0.5 grams, a kitchen scale that jumps in whole grams is not good enough. Inaccurate weighing turns a test into a rumor."
        }),
        transformation({
          id: "scale-recipe",
          title: "Scale A 100-Part Recipe",
          focus: "Turn recipe parts into grams without changing proportions.",
          layout: "flow",
          inputLabel: "Recipe",
          operationLabel: "Choose batch size",
          outputLabel: "Weighing plan",
          input: [
            {
              format: "table",
              columns: ["Material", "Parts"],
              rows: [
                ["Feldspar", "40"],
                ["Silica", "25"],
                ["Frit", "20"],
                ["Kaolin", "15"],
                ["Total", "100"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "For a 50 g test, multiply each part by 0.5. For a 200 g batch, multiply each part by 2."
          },
          output: [
            {
              format: "table",
              columns: ["Material", "50 g test", "100 g test"],
              rows: [
                ["Feldspar", "20.0 g", "40.0 g"],
                ["Silica", "12.5 g", "25.0 g"],
                ["Frit", "10.0 g", "20.0 g"],
                ["Kaolin", "7.5 g", "15.0 g"],
                ["Total", "50.0 g", "100.0 g"]
              ]
            }
          ],
          explanation: "The multiplier preserves the recipe. What changes is only the total amount you expose yourself, your shelves, and your storage space to."
        }),
        codeBlock({
          id: "test-label-template",
          language: "text",
          code: `Tile label:
Textbook/course: cone 6 glaze tests
Test ID: A1
Clay body: your cone 6 clay name
Glaze: base recipe or blend cup
Application: dip 2 seconds, one coat
Firing: cone 6 electric, schedule name
Shelf position: middle shelf, front
Safety/use decision: test tile only`
        }),
        callout({
          id: "label-survives",
          tone: "key-idea",
          title: "The label must survive firing",
          body: "A mystery tile is almost worthless. Carve, stamp, underglaze-pencil, or otherwise label in a way your studio knows will survive the firing. Also record the same ID in the notebook."
        })
      ]
    }),
    section({
      id: "line-blends",
      title: "Line Blends: One Question Across Several Cups",
      role: "instruction",
      blocks: [
        p({
          id: "line-blend-intro",
          body: "A line blend changes one relationship in steps. It is a good beginner testing design because every cup has a clear job. Instead of asking 'What if I change the recipe?' it asks, 'What happens as this one material goes down while that one goes up?'"
        }),
        p({
          id: "line-blend-scenario",
          body: "Suppose a glaze runs too much, and from the last chapters you suspect it needs a little more stiffening and a little less melt push. One cautious test is to trade feldspar for kaolin in five steps while keeping the total at 100 parts."
        }),
        transformation({
          id: "line-blend-table",
          title: "Five-Cup Line Blend",
          focus: "Change feldspar and kaolin in opposite directions while the total stays constant.",
          layout: "compare",
          inputLabel: "Base",
          operationLabel: "Blend design",
          outputLabel: "Cups to mix",
          input: [
            {
              format: "table",
              columns: ["Material", "Base parts"],
              rows: [
                ["Feldspar", "40"],
                ["Silica", "25"],
                ["Frit", "20"],
                ["Kaolin", "15"],
                ["Total", "100"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Move 0, 5, 10, 15, and 20 parts from feldspar to kaolin. Keep silica and frit constant. Mix small cups, label A1 through A5, and fire on vertical tiles with catch plates."
          },
          output: [
            {
              format: "table",
              columns: ["Cup", "Feldspar", "Silica", "Frit", "Kaolin", "Question"],
              rows: [
                ["A1", "40", "25", "20", "15", "base result"],
                ["A2", "35", "25", "20", "20", "slightly more brake"],
                ["A3", "30", "25", "20", "25", "middle step"],
                ["A4", "25", "25", "20", "30", "stronger brake"],
                ["A5", "20", "25", "20", "35", "too stiff or useful?"]
              ]
            }
          ],
          explanation: "If running decreases and dryness increases along the row, you have learned the direction of the trade. If every cup still runs, the suspect was not strong enough or not the right one."
        }),
        balancedQuiz({
          id: "line-blend-check",
          title: "Line Blend Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "line-blend-variable",
              prompt: "In the A1-A5 line blend, what is the controlled question?",
              choices: [
                { id: "a", body: "What happens as feldspar decreases and kaolin increases while silica and frit stay constant?" },
                { id: "b", body: "What happens when every ingredient changes randomly?" },
                { id: "c", body: "Which tile is automatically food-safe?" },
                { id: "d", body: "Can labels be skipped if the color changes are obvious?" }
              ],
              answer: "a",
              explanation: "A line blend is interpretable because the change is organized. You can read the fired row as a direction, not a pile of unrelated guesses.",
              tags: ["line-blend", "controlled-testing"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "triaxial-preview",
      title: "Triaxial Blends: Three Corners, More Discipline",
      role: "instruction",
      blocks: [
        p({
          id: "triaxial-intro",
          body: "A triaxial blend explores three ingredients or three glaze versions at once. Picture a triangle: each corner is a pure direction, and the tests inside the triangle are mixtures of the corners. This is powerful, but it is easier to confuse than a line blend. Use it only when you can label carefully and explain why three corners are needed."
        }),
        codeBlock({
          id: "triaxial-preview-table",
          language: "text",
          code: `Tiny triaxial preview, 6 cups

Corners:
A = base glaze
B = base + extra silica
C = base + extra frit

Cup   A share   B share   C share   What it asks
T1    100%       0%        0%        base
T2      0%     100%        0%        silica direction
T3      0%       0%      100%        frit direction
T4     50%      50%        0%        base-to-silica midpoint
T5     50%       0%       50%        base-to-frit midpoint
T6      0%      50%       50%        silica-to-frit midpoint`
        }),
        p({
          id: "triaxial-readout",
          body: "Do not start with a 21-tile triaxial just because it looks scientific. A six-cup preview can tell you whether the triangle is worth expanding. If the labels are weak, the records are thin, or the shelf protection is poor, the bigger blend only creates a bigger mystery."
        }),
        callout({
          id: "triaxial-boundary",
          tone: "note",
          title: "Line blend first",
          body: "For your first original tests, prefer line blends. Use triaxials when you truly need to compare three directions and you are ready for stricter labeling."
        })
      ]
    }),
    section({
      id: "firing-and-use-decisions",
      title: "Firing Evidence And Use Decisions",
      role: "instruction",
      blocks: [
        p({
          id: "firing-evidence",
          body: "Your kiln controller's program is not the whole firing record. Use witness cones when your studio practice allows it, and record shelf position. Cone 6 electric kilns can vary by shelf, load, element condition, and schedule. If a glaze ran on one tile, the firing evidence helps you decide whether the glaze was too fluid everywhere or only overfired in one place."
        }),
        p({
          id: "catch-plates",
          body: "Runny tests belong on vertical tiles with catch plates or cookies, using kiln wash or shelf protection according to your studio's rules. Leave room between tests. A catch plate is not a decoration; it is a way to learn without sacrificing the kiln shelf."
        }),
        p({
          id: "food-safety-boundary",
          body: "A test tile can show color, gloss, melt, crawling, pinholes, running, and some fit clues. It cannot prove food safety. For functional ware, especially liners and surfaces that touch food or drink, use well-tested glazes from reliable sources until you understand durability testing and lab leach testing."
        }),
        callout({
          id: "pretty-not-safe",
          tone: "caution",
          title: "Pretty is not proof",
          body: "Do not use appearance, cone number, or a vinegar soak as a food-safety certificate. Avoid lead and cadmium materials, and get appropriate lab testing before making food-contact safety claims for an original glaze."
        })
      ]
    }),
    section({
      id: "write-your-test-plan",
      title: "Write Your Test Plan",
      role: "practice",
      blocks: [
        p({
          id: "plan-intro",
          body: "Before your next glaze session, write a test plan in this format. The goal is not paperwork. The goal is to make the test safer and the fired result readable."
        }),
        codeBlock({
          id: "test-plan-template",
          language: "text",
          code: `Question:
Why this question:
Recipe or glaze source:
Clay body:
Batch size per cup:
Number of cups:
One variable changed:
Variables kept constant:
Tile labels:
Application plan:
Shelf protection:
Firing evidence to record:
Dry-material controls:
Cleanup plan:
Functional-use decision before testing: test tiles only`
        }),
        list({
          id: "sample-plan",
          style: "bullet",
          items: [
            "Question: Can I reduce running by trading feldspar for kaolin?",
            "Batch design: five 50 g cups, A1-A5, feldspar down and kaolin up in 5-part steps.",
            "Constants: same clay body, same bisque, same application thickness, same firing, same shelf area if possible.",
            "Protection: vertical tiles, catch plates, enough spacing, kiln wash according to studio rules.",
            "Safety: plan weights before opening containers, scoop slowly, wet cleanup, no food or drink, appropriate respirator if dusty work cannot be adequately controlled."
          ]
        }),
        balancedQuiz({
          id: "plan-check",
          title: "Plan Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "bad-test-plan",
              prompt: "Which test plan will teach you the least?",
              choices: [
                { id: "a", body: "Change clay body, application thickness, firing schedule, and three recipe materials all at once." },
                { id: "b", body: "Run a five-cup line blend changing feldspar and kaolin while keeping the firing and application constant." },
                { id: "c", body: "Repeat a pinholed glaze thinner on the same clay and record the firing." },
                { id: "d", body: "Test a runny glaze upright with a catch plate and clear labels." }
              ],
              answer: "a",
              explanation: "Changing many variables may produce a different result, but it will not tell you which change mattered.",
              tags: ["test-design", "controlled-testing"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "review",
      title: "Review",
      role: "review",
      blocks: [
        p({
          id: "review-frame",
          body: "The habit to keep is simple: design the test before the dust exists. A good test protects the person, the kiln, and the meaning of the fired result."
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Chapter Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "respirator-role",
              prompt: "What is the best way to think about a respirator during glaze mixing?",
              choices: [
                { id: "a", body: "It is a backup layer when dust controls and safe work practices are not enough." },
                { id: "b", body: "It makes dry sweeping safe." },
                { id: "c", body: "It replaces labels and safety data sheets." },
                { id: "d", body: "It proves the glaze is food-safe after firing." }
              ],
              answer: "a",
              explanation: "Control dust at the source first. Respiratory protection still needs the right selection, seal, and studio or workplace procedure.",
              tags: ["dust-control", "respirator"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "scale-precision-question",
              prompt: "Why is a whole-gram kitchen scale a poor choice for a 0.5 g colorant addition?",
              choices: [
                { id: "a", body: "The scale may not resolve the amount accurately enough, so the test result becomes hard to trust." },
                { id: "b", body: "Colorants cannot be weighed." },
                { id: "c", body: "Small additions do not affect fired glazes." },
                { id: "d", body: "Kitchen scales only work for feldspar." }
              ],
              answer: "a",
              explanation: "If the measured amount is not reliable, the fired color or surface cannot be interpreted as the result of the intended recipe.",
              tags: ["batch-math", "weighing"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "catch-plate-purpose",
              prompt: "What is the main purpose of a catch plate under a runny glaze test?",
              choices: [
                { id: "a", body: "It protects the kiln shelf while letting you see melt movement." },
                { id: "b", body: "It proves the glaze has low expansion." },
                { id: "c", body: "It makes the glaze dry faster before firing." },
                { id: "d", body: "It replaces the need for tile labels." }
              ],
              answer: "a",
              explanation: "A catch plate lets you test a risky melt direction without turning the shelf into part of the experiment.",
              tags: ["shelf-protection", "running"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "line-blend-meaning",
              prompt: "What makes a line blend more interpretable than five unrelated tests?",
              choices: [
                { id: "a", body: "The cups change in an organized direction while other variables stay constant." },
                { id: "b", body: "The cups have different labels." },
                { id: "c", body: "The cups always produce a perfect glaze." },
                { id: "d", body: "The cups do not need records because they are arranged in a row." }
              ],
              answer: "a",
              explanation: "A line blend turns a set of fired tiles into a visible trend. The trend is meaningful only because the design is controlled.",
              tags: ["line-blend", "test-design"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "functional-claim",
              prompt: "A new glaze test is glossy, smooth, and attractive on your cone 6 clay. What is the safest functional-use decision?",
              choices: [
                { id: "a", body: "Treat it as a test result, not proof of food safety; use tested liner glazes or appropriate lab testing for food-contact claims." },
                { id: "b", body: "Use it immediately on mug interiors because cone 6 is high enough." },
                { id: "c", body: "Assume any glossy glaze is more durable than any matte glaze." },
                { id: "d", body: "Skip records because the surface looks successful." }
              ],
              answer: "a",
              explanation: "Appearance can be encouraging, but durability and leaching need appropriate evidence. This course keeps test tiles separate from food-safety claims.",
              tags: ["functional-ware", "food-safety"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "triaxial-first",
              prompt: "When should a beginner choose a triaxial blend over a line blend?",
              choices: [
                { id: "a", body: "When three clearly named directions need comparison and labeling/records are strong enough to support it." },
                { id: "b", body: "Whenever the first line blend feels boring." },
                { id: "c", body: "When there is no test question yet." },
                { id: "d", body: "When shelf protection is unavailable." }
              ],
              answer: "a",
              explanation: "A triaxial is powerful because it compares three corners, but that power only helps when the question and records are disciplined.",
              tags: ["triaxial", "test-design"],
              difficulty: "medium"
            }
          ]
        }),
        glossary({
          id: "chapter-terms",
          title: "Terms To Keep",
          entries: [
            {
              term: "line blend",
              definition: "A test series that changes one recipe relationship in organized steps."
            },
            {
              term: "triaxial blend",
              definition: "A triangular test design that explores mixtures among three corners or directions."
            },
            {
              term: "catch plate",
              definition: "A small protected clay or kiln-washed plate placed under a test to catch glaze runs."
            },
            {
              term: "witness cone",
              definition: "A pyrometric cone placed in the kiln to show heat work at a location in the firing."
            },
            {
              term: "safety data sheet",
              definition: "A document from a material supplier describing hazards, handling, storage, and protective measures."
            }
          ]
        })
      ]
    })
  ]
});
