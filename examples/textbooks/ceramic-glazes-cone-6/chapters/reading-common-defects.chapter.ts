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
  id: "reading-common-defects",
  title: "Reading Common Defects",
  description: "Learn to turn fired glaze defects into first questions and small next tests.",
  role: "instruction",
  sections: [
    section({
      id: "defect-is-evidence",
      title: "A Defect Is Evidence",
      role: "instruction",
      blocks: [
        p({
          id: "learner-goal",
          body: "After this chapter, you should be able to inspect a fired test tile, describe the visible cue, and choose a sensible next test without jumping straight to a recipe fix."
        }),
        p({
          id: "naming-trap",
          body: "A defect name is not a diagnosis. If you say 'pinholes,' you have named the shape of the evidence. You have not yet decided whether the cause was the clay body releasing gas, a glaze that sealed too early, a thick application, an under-healed firing, contamination, or some combination."
        }),
        p({
          id: "four-question-ladder",
          body: "Use a short ladder. First: what do I see? Second: when in the process could that happen? Third: what are the two most likely suspects? Fourth: what small test would separate them? This ladder is slower than guessing, but it saves firings."
        }),
        transformation({
          id: "defect-ladder",
          title: "From Name To Next Test",
          focus: "Convert a fired cue into a question you can test.",
          layout: "flow",
          inputLabel: "Visible cue",
          operationLabel: "Diagnosis ladder",
          outputLabel: "Next test idea",
          input: [
            {
              format: "table",
              columns: ["Weak move", "Better first observation"],
              rows: [
                ["It crazed.", "Fine crackle lines cross the glazed surface."],
                ["It crawled.", "Bare clay islands appear where glaze pulled away."],
                ["It blistered.", "Raised bubbles or burst craters interrupt the surface."],
                ["It ran.", "Glaze pooled and thickened near the lower edge."]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Ask when the cue could form: during raw drying, during early melt, during peak melt, while bubbles heal, or during cooling."
          },
          output: [
            {
              format: "table",
              columns: ["If timing points to...", "Try a small next test"],
              rows: [
                ["raw coat losing contact", "clean bisque, thinner coat, less shrinky slurry"],
                ["gas release or poor healing", "adjust bisque/firing/hold/thickness before changing many ingredients"],
                ["too-fluid peak melt", "vertical tile, catch tile, thinner application, then chemistry edit"],
                ["cooling fit stress", "fit tests on the actual clay body; adjust expansion direction"]
              ]
            }
          ],
          explanation: "The ladder turns a defect from a label into a controlled investigation."
        })
      ]
    }),
    section({
      id: "look-first",
      title: "Look Before You Explain",
      role: "instruction",
      blocks: [
        p({
          id: "image-instruction",
          body: "Study this generated contact sheet as visual practice. Start with location and shape: lines across the surface, chips at the edge, tiny pits, bare islands, raised bubbles, or rough unmelted texture."
        }),
        image({
          id: "defect-diagnosis-contact-sheet",
          src: "assets/defect-diagnosis-contact-sheet.png",
          alt: "Generated contact sheet of six cone 6 ceramic test tiles labeled Crazing, Shivering, Pinholes, Crawling, Blisters, and Dry Matte.",
          caption: "Generated teaching image: use these tiles to practice noticing cue shape and location before naming a likely defect.",
          credit: "Generated for this Tutor Kit course."
        }),
        quiz({
          id: "visual-cue-match",
          title: "Visual Cue Match",
          mode: "check",
          questions: [
            {
              kind: "matching",
              id: "match-cue-to-defect",
              prompt: "Match each visible cue to the defect name it most strongly suggests.",
              leftLabel: "Visible cue",
              rightLabel: "Likely defect name",
              pairs: [
                {
                  id: "crazing",
                  left: "Fine crackle lines across intact glaze",
                  right: "Crazing"
                },
                {
                  id: "shivering",
                  left: "Tiny sharp chips of glaze missing from edges",
                  right: "Shivering"
                },
                {
                  id: "crawling",
                  left: "Rounded bare clay islands inside the glazed area",
                  right: "Crawling"
                },
                {
                  id: "blisters",
                  left: "Raised bubbles or burst craters",
                  right: "Blisters"
                }
              ],
              explanation: "The decision is based on shape and location. Crackle lines point toward fit tension; edge flakes point toward excessive compression; bare islands point toward glaze pull-away; bubbles and craters point toward gas and healing trouble.",
              tags: ["visual-diagnosis", "defect-cues"],
              difficulty: "easy"
            }
          ]
        }),
        callout({
          id: "generated-image-boundary",
          tone: "note",
          title: "Use images as training wheels",
          body: "Generated examples are useful for learning what to look for, but real tests are messier. On your own tiles, write observations first, then a likely defect name, then a next test."
        })
      ]
    }),
    section({
      id: "fit-defects",
      title: "Fit Defects: Crazing And Shivering",
      role: "instruction",
      blocks: [
        p({
          id: "fit-intro",
          body: "Crazing and shivering are a pair. They happen after the glaze has melted and the pot is cooling, when clay and glaze stop shrinking together. The glaze is a thin glass layer stuck to a clay body. If that glass ends up stretched, it cracks. If it ends up squeezed too hard, it can flake off."
        }),
        transformation({
          id: "crazing-vs-shivering",
          title: "Opposite Fit Failures",
          focus: "Separate tension cracks from compression chips.",
          layout: "compare",
          inputLabel: "Cooling mismatch",
          operationLabel: "Stress in the glaze",
          outputLabel: "Visible cue",
          input: [
            {
              format: "table",
              columns: ["Pair", "Cooling relationship"],
              rows: [
                ["Crazing", "glaze contracts too much relative to clay"],
                ["Shivering", "clay contracts too much relative to glaze"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Ask whether the fired glaze is being pulled apart or compressed as the piece cools."
          },
          output: [
            {
              format: "table",
              columns: ["Stress state", "What you see"],
              rows: [
                ["tension", "fine crackle lines across the glazed surface"],
                ["excess compression", "sharp flakes or chips, often at rims and edges"]
              ]
            }
          ],
          explanation: "They can both be called 'fit problems,' but they point in opposite adjustment directions. That is why naming the pair correctly matters."
        }),
        p({
          id: "crazing-details",
          body: "Crazing may appear immediately or later. It can be decorative on nonfunctional ware, but on food surfaces it can hold grime and may signal that the clay-glaze pair is not stable enough for the intended use. The first question is not 'How do I hide the lines?' It is 'Does this glaze fit this clay body?'"
        }),
        p({
          id: "shivering-details",
          body: "Shivering is less common and more alarming. The cue is not a network of lines; it is missing flakes, often along an edge, foot, rim, or raised detail. Those flakes can be sharp. Do not use shivering ware for functional surfaces."
        }),
        callout({
          id: "fit-test-caution",
          tone: "caution",
          title: "Fit tests belong to a clay-glaze pair",
          body: "Do not decide fit from a recipe name alone. Test the glaze on the actual clay body, fired in your kiln, with the forms and thicknesses you plan to use."
        })
      ]
    }),
    section({
      id: "gas-and-healing-defects",
      title: "Gas And Healing Defects",
      role: "instruction",
      blocks: [
        p({
          id: "gas-intro",
          body: "Pinholes and blisters ask a different question: did gases leave the clay body or glaze layer while the glaze was able to heal? Imagine a bubble rising through syrup. If the syrup is fluid and stays hot long enough, the hole can close. If the melt stiffens too soon, the evidence remains."
        }),
        transformation({
          id: "pinholes-vs-blisters",
          title: "Small Pits, Big Bubbles",
          focus: "Read the size and shape of gas defects.",
          layout: "compare",
          inputLabel: "Visible surface",
          operationLabel: "Likely process",
          outputLabel: "First questions",
          input: [
            {
              format: "table",
              columns: ["Cue", "Scale"],
              rows: [
                ["Pinholes", "small pits or points"],
                ["Blisters", "raised domes, larger craters, or broken bubbles"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Ask whether gas was still escaping, whether the glaze was thick, whether the bisque left material to burn out, and whether the firing gave the melt time to smooth over."
          },
          output: [
            {
              format: "table",
              columns: ["Next test direction", "What it isolates"],
              rows: [
                ["slightly thinner application", "coat thickness and entrained air"],
                ["different bisque or cleaner clay/body surface", "gas source before glaze firing"],
                ["hold or slower cooling near mature melt", "healing time"],
                ["same glaze on another clay body", "body contribution"]
              ]
            }
          ],
          explanation: "Do not fix gas defects by changing five recipe materials first. Separate source of gas from ability of the melt to heal."
        }),
        balancedQuiz({
          id: "gas-check",
          title: "Gas Defect Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "pinholes-first-test",
              prompt: "A cone 6 test tile has many tiny pits. Which next test best follows the diagnosis ladder?",
              choices: [
                { id: "a", body: "Repeat the glaze slightly thinner and record bisque, application, and firing details before changing the whole recipe." },
                { id: "b", body: "Add every available flux because all pits mean the glaze is too stiff." },
                { id: "c", body: "Assume the defect is only decorative and use it on mug interiors." },
                { id: "d", body: "Change clay body, firing schedule, colorant, and glaze thickness all in one test." }
              ],
              answer: "a",
              explanation: "The first useful test isolates a likely variable. Thickness, gas source, and healing time are all plausible, so changing everything destroys the evidence.",
              tags: ["pinholes", "testing"],
              difficulty: "medium"
            }
          ]
        })
      ]
    }),
    section({
      id: "contact-and-melt-defects",
      title: "Contact And Melt Defects",
      role: "instruction",
      blocks: [
        p({
          id: "contact-intro",
          body: "Crawling and running look unrelated, but they both remind you that raw application and fired melt behavior are part of the recipe. Crawling says the glaze did not stay attached as a continuous coat. Running says the melt moved too much for the form, thickness, and firing."
        }),
        p({
          id: "crawling-details",
          body: "Crawling often begins before peak temperature. The dry glaze coat may shrink, crack, bead up, repel a dusty or greasy bisque surface, or fail to wet the clay well. When the kiln melts that broken coat, the gaps remain as bare islands. The first tests are often boring studio tests: clean bisque, thinner application, better slurry, less shrinky raw coat."
        }),
        p({
          id: "running-details",
          body: "Running is a peak-melt problem. A glaze can run because the recipe is too fluid, because the coat is too thick, because the kiln gave more heat work than expected, because the pot shape invited pooling, or because a layered combination became more fluid than either glaze alone. The vertical test tile exists to show you this before a shelf pays the price."
        }),
        p({
          id: "dry-matte-details",
          body: "A dry matte surface needs a careful question. Some matte glazes are intentionally mature and pleasant to touch. A rough, sandy, under-melted matte is different: it may mean insufficient melt, too much refractory material, too little flux for cone 6, or too cool a firing. Touch and use matter here; a rough functional surface deserves caution."
        }),
        transformation({
          id: "contact-melt-next-tests",
          title: "Choose The Small Test",
          focus: "Match the likely timing to a small test.",
          layout: "compare",
          inputLabel: "Cue",
          operationLabel: "Likely timing",
          outputLabel: "First controlled test",
          input: [
            {
              format: "table",
              columns: ["Cue", "Likely timing"],
              rows: [
                ["Bare rounded islands", "raw drying or early melt contact"],
                ["Glaze puddled at bottom edge", "peak melt fluidity"],
                ["Rough dry surface", "melt maturity or intentional matte surface"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Ask whether the problem appeared because the glaze lost contact, moved too much, or did not melt enough."
          },
          output: [
            {
              format: "table",
              columns: ["Cue", "First controlled test"],
              rows: [
                ["Crawling", "same glaze on cleaned bisque, thinner coat, well-mixed slurry"],
                ["Running", "same glaze thinner on vertical tile with catch tile"],
                ["Dry matte", "same recipe with witness cones and known firing; compare a slightly hotter or held test only if safe"]
              ]
            }
          ],
          explanation: "The next test should answer one question. If you change application, recipe, clay, and firing together, you may get a better tile but learn very little."
        })
      ]
    }),
    section({
      id: "diagnosis-notebook",
      title: "Diagnosis Notebook",
      role: "practice",
      blocks: [
        p({
          id: "notebook-intro",
          body: "Use this page after every defect test. It forces you to separate observation, inference, and next action."
        }),
        codeBlock({
          id: "defect-notebook-template",
          language: "text",
          code: `Test ID:
Clay body:
Glaze:
Application:
Firing evidence:

Observation without defect name:
Likely defect name:
When could it have formed?
Two plausible suspects:
One thing to keep constant:
One thing to change next:
Safety/use decision for this piece:`
        }),
        list({
          id: "notebook-example",
          style: "bullet",
          items: [
            "Observation: fine lines across the glossy liner surface, not chips at the rim.",
            "Likely defect name: crazing.",
            "When: cooling/fit, not raw application.",
            "Two suspects: glaze expansion too high for this clay; clay/glaze pair not mature together in this firing.",
            "Keep constant: application thickness and firing schedule for the next comparison.",
            "Change next: test a known compatible liner glaze or a fit-adjusted version on the same clay."
          ]
        }),
        callout({
          id: "functional-caution",
          tone: "caution",
          title: "Functional ware gets the stricter rule",
          body: "If the defect creates cracks, sharp flakes, rough food-contact texture, unstable color, or unknown leaching risk, do not treat the piece as functional ware. A good test tile can be a success even when the glaze itself is rejected."
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
          body: "Retrieve the pattern: observe the cue, locate the timing, name two suspects, then choose one small test. That is the difference between troubleshooting and guessing."
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Chapter Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "defect-name-limit",
              prompt: "Why is saying 'this glaze has pinholes' not a complete diagnosis?",
              choices: [
                { id: "a", body: "It names the visible cue but not the gas source, melt behavior, application thickness, or firing condition." },
                { id: "b", body: "Pinholes can only be diagnosed by the color of the clay body." },
                { id: "c", body: "Defect names are never useful." },
                { id: "d", body: "Pinholes always mean the recipe has too much silica." }
              ],
              answer: "a",
              explanation: "A defect name is useful filing language. Diagnosis begins when you ask what process could have made that cue.",
              tags: ["diagnosis-ladder", "pinholes"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "crazing-vs-shivering",
              prompt: "A bowl has sharp glaze flakes missing along the rim. Which fit problem is most likely, and why is it serious?",
              choices: [
                { id: "a", body: "Shivering; the glaze is under excessive compression and the flakes can be sharp." },
                { id: "b", body: "Crazing; the glaze has stretched into harmless decorative lines." },
                { id: "c", body: "Pinholing; gas bubbles are always largest at the rim." },
                { id: "d", body: "Dry matte; all matte glazes chip at edges." }
              ],
              answer: "a",
              explanation: "Edge flaking points to shivering, the opposite fit direction from crazing. It is not suitable for functional use.",
              tags: ["shivering", "fit"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "crawling-first-test",
              prompt: "A glaze has bare rounded islands where it pulled away. Which next test should usually come before a chemistry overhaul?",
              choices: [
                { id: "a", body: "Repeat on clean bisque with a thinner, well-mixed coat and record whether the raw glaze cracks or beads." },
                { id: "b", body: "Add three colorants to make the bare islands less visible." },
                { id: "c", body: "Assume the kiln reached the wrong cone because crawling cannot start before peak temperature." },
                { id: "d", body: "Change clay body and firing schedule at the same time." }
              ],
              answer: "a",
              explanation: "Crawling often involves raw contact, shrinkage, surface contamination, or application. Check those before changing many recipe variables.",
              tags: ["crawling", "application"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "running-next-test",
              prompt: "A layered glaze combination runs toward the shelf. What is the most informative next test?",
              choices: [
                { id: "a", body: "Test the same combination thinner on a vertical tile with a catch tile, keeping clay and firing constant." },
                { id: "b", body: "Put it on shorter pots only and stop labeling test tiles." },
                { id: "c", body: "Assume each glaze is safe because each one works alone." },
                { id: "d", body: "Increase application thickness to make the color easier to see." }
              ],
              answer: "a",
              explanation: "Layering can create a more fluid melt. A thinner vertical test isolates movement risk without endangering shelves.",
              tags: ["running", "testing"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "dry-matte-caution",
              prompt: "Which observation best separates an intentional matte from a suspicious under-melted surface?",
              choices: [
                { id: "a", body: "Suspicious under-melt often feels rough or sandy and may not have developed a sealed mature surface." },
                { id: "b", body: "All matte surfaces are automatically underfired." },
                { id: "c", body: "All glossy surfaces are automatically durable." },
                { id: "d", body: "Matte surfaces cannot contain fluxes." }
              ],
              answer: "a",
              explanation: "Surface feel and maturity matter. Matte can be intentional, but rough under-melted texture is a warning cue, especially for functional surfaces.",
              tags: ["dry-matte", "functional-ware"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "one-variable",
              prompt: "Why change only one variable in the next defect test when possible?",
              choices: [
                { id: "a", body: "It lets you connect the new fired result to the thing you changed." },
                { id: "b", body: "It guarantees the defect will disappear." },
                { id: "c", body: "It means you no longer need witness cones." },
                { id: "d", body: "It proves the glaze is food-safe." }
              ],
              answer: "a",
              explanation: "A controlled change preserves evidence. It does not guarantee success, but it makes the next result interpretable.",
              tags: ["testing", "diagnosis-ladder"],
              difficulty: "easy"
            }
          ]
        }),
        glossary({
          id: "chapter-terms",
          title: "Terms To Keep",
          entries: [
            {
              term: "crazing",
              definition: "Fine crackle lines in the glaze, usually from a clay-glaze fit problem that puts the glaze in tension."
            },
            {
              term: "shivering",
              definition: "Glaze flaking or chipping from edges, usually from excessive compression in a clay-glaze fit problem."
            },
            {
              term: "pinholes",
              definition: "Small pits left when gases or bubbles did not heal before the glaze stiffened."
            },
            {
              term: "crawling",
              definition: "Bare clay areas where the glaze pulled away instead of staying as a continuous coat."
            },
            {
              term: "blisters",
              definition: "Raised bubbles or burst craters in the fired glaze surface."
            }
          ]
        })
      ]
    })
  ]
});
