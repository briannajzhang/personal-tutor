import {
  balancedQuiz,
  callout,
  chapter,
  codeBlock,
  diagram,
  glossary,
  list,
  p,
  quiz,
  section,
  transformation
} from "tutor-kit";

export default chapter({
  id: "from-recipe-to-revision",
  title: "From Recipe To Revision",
  description: "Use fired evidence to choose one recipe edit, predict its tradeoff, and decide what kind of use the result can honestly support.",
  role: "instruction",
  sections: [
    section({
      id: "revision-loop",
      title: "The Revision Loop",
      role: "instruction",
      blocks: [
        p({
          id: "learner-goal",
          body: "After this chapter, you should be able to take one fired test result and choose the next revision direction without guessing wildly: state the evidence, choose one change, predict the tradeoff, retest, and make a conservative use decision."
        }),
        p({
          id: "not-fixing",
          body: "Potters often say they are going to fix a glaze. That word can make the work too vague. A better word is revise. Revise means you know what evidence you are responding to, what variable you are changing, and what new problem that change might create."
        }),
        diagram({
          id: "revision-loop-diagram",
          title: "A small revision loop",
          syntax: "mermaid",
          body: `flowchart LR
  A["Fired evidence"] --> B["First diagnosis question"]
  B --> C["One revision direction"]
  C --> D["Prediction and risk"]
  D --> E["Small retest"]
  E --> F["Use decision"]
  F --> A`
        }),
        p({
          id: "loop-readout",
          body: "Notice where the loop ends: not with a prettier tile, but with a use decision. A glaze can move forward as a decorative surface, stay as a test-only idea, be moved into a known liner system, or be rejected."
        }),
        callout({
          id: "revision-rule",
          tone: "key-idea",
          title: "One result earns one question",
          body: "One fired result rarely justifies a complete recipe overhaul. Let one result choose the next question, then design the next test around that question."
        })
      ]
    }),
    section({
      id: "edit-directions",
      title: "Common Revision Directions",
      role: "instruction",
      blocks: [
        p({
          id: "direction-intro",
          body: "You already know the ingredient jobs: glass former, flux, alumina/stiffener, colorant, opacifier. A revision direction changes one of those jobs. The hard part is remembering that every helpful edit has a possible cost."
        }),
        transformation({
          id: "revision-direction-table",
          title: "Edit Direction And Tradeoff",
          focus: "Choose a direction by the evidence, then predict what the same edit might break.",
          layout: "compare",
          inputLabel: "Evidence",
          operationLabel: "Possible direction",
          outputLabel: "Risk to watch",
          input: [
            {
              format: "table",
              columns: ["Fired evidence", "First reading"],
              rows: [
                ["glaze runs badly", "too fluid, too thick, or too much heat work"],
                ["dry under-melted surface", "not enough melt for this firing"],
                ["crazing", "glaze expansion too high for clay, commonly"],
                ["pinholes or blisters", "gas source and/or poor healing"],
                ["good color, bad liner behavior", "color mechanism may need a better base"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Choose one revision direction after checking application and firing evidence. Recipe chemistry is not always the first suspect."
          },
          output: [
            {
              format: "table",
              columns: ["Possible direction", "Risk"],
              rows: [
                ["more alumina / less flux for running", "surface may become dry or under-melted"],
                ["more flux / more boron for dryness", "glaze may run or fit may change"],
                ["lower expansion direction for crazing", "color, melt, and matte mechanism may shift"],
                ["thinner coat or firing hold for pinholes", "color depth or run risk may change"],
                ["transplant color into known base", "color may not survive the new chemistry"]
              ]
            }
          ],
          explanation: "A revision is good when it names both the desired movement and the hazard introduced by moving that way."
        }),
        balancedQuiz({
          id: "direction-check",
          title: "Revision Direction Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "runny-glaze-first",
              prompt: "A glaze ran on a vertical tile. You also see that your application was much thicker than your notes intended. What is the best next revision?",
              choices: [
                { id: "a", body: "Retest the same recipe at the planned thickness before changing chemistry." },
                { id: "b", body: "Add several stiffening materials and change the firing schedule at the same time." },
                { id: "c", body: "Assume the glaze can never work on vertical forms." },
                { id: "d", body: "Use it on mug interiors because it is glossy." }
              ],
              answer: "a",
              explanation: "Application evidence is the first suspect here. A chemistry edit would answer a different question before you have checked the obvious variable.",
              tags: ["revision-loop", "application", "running"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "worked-running-case",
      title: "Worked Case: Less Running Without Killing The Melt",
      role: "practice",
      blocks: [
        p({
          id: "running-setup",
          body: "Suppose the application was controlled, the firing reached the expected cone, and a glossy glaze still ran. Now a recipe direction is reasonable. Inspect the revision below before reading the explanation."
        }),
        transformation({
          id: "running-revision",
          title: "A Conservative Running Revision",
          focus: "Trade some melt push for more brake while keeping the total at 100 parts.",
          layout: "flow",
          inputLabel: "Original",
          operationLabel: "Revision",
          outputLabel: "Prediction",
          input: [
            {
              format: "table",
              columns: ["Material", "Original parts"],
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
            body: "Move 5 parts from feldspar to kaolin: feldspar 35, kaolin 20. Keep silica and frit unchanged for this retest."
          },
          output: [
            {
              format: "table",
              columns: ["Expected movement", "Why"],
              rows: [
                ["less running", "less feldspar flux package and more alumina from kaolin"],
                ["possibly drier surface", "the melt may lose too much fluidity"],
                ["bucket may suspend better", "more clay in the raw slurry"],
                ["fit may shift", "chemistry changed, so do not assume the clay-glaze pair is still fine"]
              ]
            }
          ],
          explanation: "This edit is interpretable because it is small and directional. If it stops running but turns dry, your next test might split the difference rather than inventing a new glaze."
        }),
        p({
          id: "running-case-readout",
          body: "A beginner mistake is to keep adding kaolin until the glaze stops moving. That can create a stiff, dry, unpleasant surface. The goal is not zero movement; the goal is enough movement to heal and level, not enough to leave the pot."
        })
      ]
    }),
    section({
      id: "fit-direction",
      title: "Fit Direction: Crazing And Shivering",
      role: "instruction",
      blocks: [
        p({
          id: "fit-intro",
          body: "Fit revisions are where direction matters most. Crazing and shivering are opposite failures, so a careless fix can make the wrong problem worse."
        }),
        transformation({
          id: "fit-direction-table",
          title: "Do Not Fix Both The Same Way",
          focus: "Choose the expansion direction that matches the evidence.",
          layout: "compare",
          inputLabel: "Evidence",
          operationLabel: "Expansion direction",
          outputLabel: "Revision caution",
          input: [
            {
              format: "table",
              columns: ["Evidence", "Stress clue"],
              rows: [
                ["crazing lines", "glaze is being pulled apart"],
                ["shivering flakes", "glaze is being squeezed too hard"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "For crazing, the usual glaze-side direction is lower thermal expansion. For shivering, the glaze may already be too low in expansion for the clay body."
          },
          output: [
            {
              format: "table",
              columns: ["If you see...", "Do not blindly..."],
              rows: [
                ["crazing", "slow-cool forever and call it fixed"],
                ["crazing", "add high-expansion fluxes without knowing why"],
                ["shivering", "lower glaze expansion further"],
                ["either", "trust calculated numbers without testing the actual clay-glaze pair"]
              ]
            }
          ],
          explanation: "Expansion calculations and target formulas can guide the direction, but the fired clay-glaze pair has the final vote."
        }),
        p({
          id: "crazing-revision",
          body: "For a glossy well-melted glaze that crazes, a common glaze-side direction is to reduce thermal expansion by increasing the low-expansion glass-building side, often silica and sometimes alumina, while keeping melt maturity. Another direction is to transplant the color or surface idea into a base already known to fit your clay."
        }),
        p({
          id: "shivering-revision",
          body: "For shivering, do not use the same advice. A glaze flaking from edges may be under too much compression. That can require a higher-expansion glaze direction, a different clay body, or abandoning the combination. Shivering on functional ware is a reject signal, not a quirky surface."
        }),
        callout({
          id: "target-formula-boundary",
          tone: "note",
          title: "Target formulas guide; they do not certify",
          body: "A target or limit formula can show whether a glaze is in a common oxide range for cone 6, but being inside a range does not prove fit, durability, or food safety."
        })
      ]
    }),
    section({
      id: "gas-and-healing-revisions",
      title: "Gas And Healing Revisions",
      role: "instruction",
      blocks: [
        p({
          id: "gas-intro",
          body: "Pinholes and blisters are frustrating because changing the recipe can help, but it is not always the first or best move. If the body is still releasing gas or the glaze is applied too thick, a chemistry edit may only hide the real problem for one firing."
        }),
        transformation({
          id: "gas-revision-path",
          title: "Separate Gas Source From Healing",
          focus: "Choose whether to test the source of bubbles or the glaze's ability to heal them.",
          layout: "flow",
          inputLabel: "Evidence",
          operationLabel: "Two possible paths",
          outputLabel: "Small retest",
          input: [
            {
              format: "markdown",
              body: "A tile has pinholes on one clay body but the same glaze is smooth on another clay body."
            }
          ],
          operation: {
            format: "markdown",
            body: "This points first toward the clay body, bisque, surface prep, or gas release timing, not immediately toward a full glaze reformulation."
          },
          output: [
            {
              format: "table",
              columns: ["Question", "Test"],
              rows: [
                ["Is the body/source the issue?", "same glaze on both clay bodies again, same thickness and firing"],
                ["Is the glaze not healing?", "same clay and glaze with a controlled hold or thinner coat"],
                ["Is a material gassing late?", "compare a known alternate source for the same oxide in a tiny test"],
                ["Is thickness the driver?", "two controlled dip times on vertical tiles"]
              ]
            }
          ],
          explanation: "Gas defects need a split test. Otherwise you cannot tell whether you reduced gas, improved healing, or merely got lucky."
        }),
        balancedQuiz({
          id: "gas-revision-check",
          title: "Gas Revision Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "body-specific-pinholes",
              prompt: "The same glaze pinholes on one clay body but is smooth on another. Which next question comes first?",
              choices: [
                { id: "a", body: "What is the first clay body contributing through gas release, surface condition, or bisque maturity?" },
                { id: "b", body: "How can I add more colorant to cover the pinholes?" },
                { id: "c", body: "Which unrelated glaze should I layer over it?" },
                { id: "d", body: "Can I certify the smooth tile as food-safe now?" }
              ],
              answer: "a",
              explanation: "The comparison points toward the clay-glaze pair and firing history. That evidence should steer the next test.",
              tags: ["pinholes", "clay-body", "revision-loop"],
              difficulty: "medium"
            }
          ]
        })
      ]
    }),
    section({
      id: "transplant-or-reject",
      title: "Transplant Or Reject",
      role: "instruction",
      blocks: [
        p({
          id: "transplant-intro",
          body: "Sometimes the best revision is not to rescue the whole recipe. If a glaze has a wonderful blue but crazes badly, the useful idea may be the color mechanism, not the base glaze. You can try moving the colorant package into a base glaze already known to fit your clay and intended use."
        }),
        transformation({
          id: "transplant-example",
          title: "Move The Idea, Not The Whole Problem",
          focus: "Separate a surface idea from a faulty base.",
          layout: "compare",
          inputLabel: "Problem recipe",
          operationLabel: "Transplant",
          outputLabel: "Retest decision",
          input: [
            {
              format: "table",
              columns: ["What works", "What fails"],
              rows: [
                ["deep blue color", "crazes on your cone 6 clay"],
                ["gloss level", "unknown food-contact durability"],
                ["breaks nicely on texture", "pinholes on mug interiors"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Keep the colorant/opacifier idea small. Move it into a reliable base or liner glaze that already behaves well on your clay, then retest."
          },
          output: [
            {
              format: "table",
              columns: ["Possible outcome", "Decision"],
              rows: [
                ["color survives and surface stays stable", "continue testing"],
                ["color changes but base behaves", "revise color mechanism"],
                ["base becomes unstable with addition", "reduce addition or reject"],
                ["food-contact use is intended", "use tested liner or lab testing pathway"]
              ]
            }
          ],
          explanation: "This is how you avoid falling in love with a broken base glaze. Keep the part that teaches you something; reject the part that creates unacceptable risk."
        }),
        callout({
          id: "lab-testing",
          tone: "caution",
          title: "Food-contact claims need real evidence",
          body: "For original functional glazes, especially surfaces touching food or drink, use reliable tested liner glazes or appropriate lab testing. ASTM C738 is one standard used for lead and cadmium extraction from glazed ceramic surfaces; it is not the same as a casual home soak."
        }),
        p({
          id: "reject-is-success",
          body: "Rejecting a glaze can be a successful test. If a test shows shivering, severe running, rough food-contact texture, unstable color, or unknown leaching risk for functional ware, it has given you valuable information. The failed pot saved you from a failed dinner set."
        })
      ]
    }),
    section({
      id: "write-a-revision-plan",
      title: "Write A Revision Plan",
      role: "practice",
      blocks: [
        p({
          id: "plan-intro",
          body: "Now practice the complete move. Choose one fired result from your own studio or use the scenario below. Write the revision before imagining the improved tile."
        }),
        codeBlock({
          id: "scenario",
          language: "text",
          code: `Scenario:
A cone 6 glossy green glaze on your usual stoneware clay has a color you like.
On vertical test tiles it does not run.
On a mug liner test it shows fine crazing lines after a week.
The same clay body works well with a commercial clear liner glaze.

Your task:
1. Describe the evidence.
2. Name the first diagnosis question.
3. Choose one revision direction.
4. Name one risk introduced by that direction.
5. Decide whether this glaze is ready for mug interiors.`
        }),
        list({
          id: "scenario-feedback",
          style: "bullet",
          items: [
            "Evidence: good color, no running, delayed crazing on the clay body.",
            "First question: does this glaze fit this clay body over time and thermal stress?",
            "One revision direction: lower the glaze expansion direction, or transplant the green color mechanism into the known liner base.",
            "Risk: color or melt may change; extra silica/alumina can dry the surface if melt is not preserved.",
            "Use decision: not ready for mug interiors without further fit and durability evidence."
          ]
        }),
        quiz({
          id: "revision-map-check",
          title: "Revision Map Check",
          mode: "check",
          questions: [
            {
              kind: "matching",
              id: "match-evidence-to-next-move",
              prompt: "Match each evidence pattern to the most sensible first revision move.",
              leftLabel: "Evidence pattern",
              rightLabel: "First move",
              pairs: [
                {
                  id: "thick-run",
                  left: "Ran, and application was much thicker than planned",
                  right: "Retest controlled thickness before chemistry edit"
                },
                {
                  id: "stable-color-bad-fit",
                  left: "Beautiful color, but crazes on your clay",
                  right: "Test fit direction or transplant color into a fitting base"
                },
                {
                  id: "one-body-pinholes",
                  left: "Pinholes only on one clay body",
                  right: "Compare clay/bisque/gas evidence before changing whole glaze"
                },
                {
                  id: "edge-flakes",
                  left: "Sharp flakes missing from rim",
                  right: "Reject functional use and investigate shivering/fit direction"
                }
              ],
              explanation: "The map follows evidence. The right first move is the one that answers the most likely next question while keeping the test interpretable.",
              tags: ["revision-loop", "fit", "gas-defects", "application"],
              difficulty: "medium"
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
          body: "The chapter's discipline is not complicated, but it is demanding: make one edit because one piece of evidence asked for it, predict the price of the edit, and retest before trusting the surface."
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Chapter Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "revision-vs-fix",
              prompt: "Why is 'revise' a better word than 'fix' for glaze testing?",
              choices: [
                { id: "a", body: "It forces you to name evidence, choose one direction, and predict the tradeoff." },
                { id: "b", body: "It means the next test will certainly work." },
                { id: "c", body: "It removes the need for records." },
                { id: "d", body: "It proves the glaze is safe for food." }
              ],
              answer: "a",
              explanation: "A revision is a controlled response to evidence. It may fail, but it should fail in a way that teaches you something.",
              tags: ["revision-loop"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "crazing-direction",
              prompt: "A glossy glaze is well melted but crazes on your clay body. Which direction is most reasonable to investigate?",
              choices: [
                { id: "a", body: "Lower the glaze expansion direction or transplant the surface into a base known to fit the clay." },
                { id: "b", body: "Lower expansion even further if the defect is actually shivering." },
                { id: "c", body: "Use slow cooling as proof that the fit problem is solved forever." },
                { id: "d", body: "Add colorant until the crack lines are hidden." }
              ],
              answer: "a",
              explanation: "Crazing commonly points toward a glaze under tension. Lowering glaze expansion direction may help, but testing the actual clay-glaze pair remains necessary.",
              tags: ["crazing", "fit-direction"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "shivering-direction",
              prompt: "A glaze flakes sharply from the rim. What is the safest interpretation?",
              choices: [
                { id: "a", body: "Treat it as a shivering/fit danger and reject functional use while investigating the opposite direction from crazing." },
                { id: "b", body: "Use it for food because flakes only happen at edges." },
                { id: "c", body: "Lower the glaze expansion direction further without testing." },
                { id: "d", body: "Ignore it if the color is attractive." }
              ],
              answer: "a",
              explanation: "Shivering can produce sharp flakes. It is a functional reject signal and points in the opposite fit direction from crazing.",
              tags: ["shivering", "fit-direction", "functional-ware"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "target-formula-limit",
              prompt: "What can a target or limit formula do for a beginner revising cone 6 glazes?",
              choices: [
                { id: "a", body: "Guide oxide-balance thinking, while still requiring fired tests for fit, surface, and use." },
                { id: "b", body: "Certify food safety if the numbers are inside the range." },
                { id: "c", body: "Replace test tiles and witness cones." },
                { id: "d", body: "Tell you exactly how every colorant will behave." }
              ],
              answer: "a",
              explanation: "Target formulas are guides, not guarantees. The kiln, clay body, materials, application, and use case still matter.",
              tags: ["target-formula", "glaze-chemistry"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "transplant-color",
              prompt: "A glaze has a beautiful color but poor fit. What does 'transplant the color mechanism' mean?",
              choices: [
                { id: "a", body: "Move the colorant/opacifier idea into a base glaze that already behaves better on your clay, then retest." },
                { id: "b", body: "Use the faulty base anyway because color is the goal." },
                { id: "c", body: "Paint the fired pot with the colorant after firing." },
                { id: "d", body: "Double every ingredient in the original recipe." }
              ],
              answer: "a",
              explanation: "You are preserving the useful idea while abandoning the unstable base. The new combination still needs testing.",
              tags: ["transplant", "colorants"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "lab-testing-claim",
              prompt: "Which statement about food-contact claims is most responsible?",
              choices: [
                { id: "a", body: "A good-looking original glaze needs appropriate evidence such as reliable tested liner use or relevant lab testing before food-contact claims." },
                { id: "b", body: "A glossy cone 6 glaze is automatically food-safe." },
                { id: "c", body: "A vinegar soak replaces lab testing for lead and cadmium extraction." },
                { id: "d", body: "Target formula ranges certify durability." }
              ],
              answer: "a",
              explanation: "Appearance, cone, and informal home checks are not certification. Original functional glazes need a stronger evidence path.",
              tags: ["food-safety", "lab-testing"],
              difficulty: "medium"
            }
          ]
        }),
        glossary({
          id: "chapter-terms",
          title: "Terms To Keep",
          entries: [
            {
              term: "revision direction",
              definition: "The intended movement of a recipe edit, such as more melt, less running, lower expansion, or better healing."
            },
            {
              term: "tradeoff",
              definition: "A new risk introduced by the same edit that may solve the original problem."
            },
            {
              term: "target formula",
              definition: "A guideline range for oxide balance in a glaze type; useful for direction, not a safety certificate."
            },
            {
              term: "transplant",
              definition: "Moving a useful color, opacity, or surface idea into a better-behaved base glaze."
            },
            {
              term: "liner glaze",
              definition: "A glaze chosen for the inside or food-contact area of functional ware, where fit, durability, cleanability, and testing standards are stricter."
            }
          ]
        })
      ]
    })
  ]
});
