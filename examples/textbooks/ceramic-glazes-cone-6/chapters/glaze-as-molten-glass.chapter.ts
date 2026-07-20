import {
  balancedQuiz,
  callout,
  chapter,
  codeBlock,
  diagram,
  glossary,
  image,
  list,
  p,
  quiz,
  section,
  transformation
} from "tutor-kit";

export default chapter({
  id: "glaze-as-molten-glass",
  title: "Glaze as Molten Glass",
  description: "Build the first useful model for cone 6 electric glazes: a fired glaze is glass that melted, moved, stiffened, and fit the clay.",
  role: "instruction",
  sections: [
    section({
      id: "start-from-the-kiln",
      title: "Start From The Kiln",
      role: "instruction",
      blocks: [
        p({
          id: "learner-goal",
          body: "After this chapter, you should be able to look at a fired cone 6 test tile and say, in plain studio language, what system the glaze was trying to balance: making glass, melting enough, staying stiff enough, fitting the clay, and healing bubbles before the kiln cooled."
        }),
        p({
          id: "not-paint",
          body: "A raw glaze looks like paint because you brush or dip it onto a pot. That is the misleading part. Paint dries into a film. Glaze is a powdered batch of minerals waiting for the kiln to turn part of it into glass. The brush marks, thickness, clay surface, and firing schedule matter, but the main event is not drying. The main event is melting."
        }),
        p({
          id: "predict-before-model",
          body: "Pause before the chemistry words arrive. Imagine a dry coat of glaze on a bisque tile. At cone 6 in an electric kiln, what must happen for that powdery coat to become a smooth, hard surface? It has to melt. It has to wet the clay instead of pulling away. It has to be fluid enough for pinholes to heal, but not so fluid that it runs onto the shelf. It has to cool into a glass that is not fighting the clay body too much."
        }),
        callout({
          id: "first-model",
          tone: "key-idea",
          title: "The first useful model",
          body: "A glaze recipe is a plan for a controlled melt. Most defects are clues that one part of the melt, surface, firing, or clay fit was outside its working range."
        })
      ]
    }),
    section({
      id: "four-jobs",
      title: "The Four Jobs Inside A Glaze",
      role: "instruction",
      blocks: [
        p({
          id: "jobs-intro",
          body: "A beginner-friendly glaze recipe is easiest to read by jobs, not by memorizing every material. The same bag of material can do more than one job, so this is a working model rather than a legal classification."
        }),
        transformation({
          id: "ingredient-jobs-transform",
          title: "From Bags Of Powder To A Melt",
          focus: "Read ingredients by the job they contribute to the fired glass.",
          layout: "flow",
          inputLabel: "Raw batch idea",
          operationLabel: "Kiln question",
          outputLabel: "Fired behavior",
          input: [
            {
              format: "table",
              columns: ["Ingredient role", "Plain question"],
              rows: [
                ["Glass former", "What can become the glass network?"],
                ["Flux", "What helps it melt at cone 6?"],
                ["Stabilizer", "What keeps the melt from being too runny?"],
                ["Color/opacifier", "What changes color, opacity, or surface response?"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "The kiln supplies heat work. Heat work means temperature plus time: cone 6 is not just a thermometer number, but a measure of how much melting work the ware experienced."
          },
          output: [
            {
              format: "table",
              columns: ["If this side is too weak", "One possible visible clue"],
              rows: [
                ["Not enough melt", "dry, underfired, rough, or unhealed surface"],
                ["Too much melt", "running, pooling, loss of detail"],
                ["Too little stiffening", "glaze moves too freely"],
                ["Clay/glaze fit mismatch", "crazing or shivering risk"]
              ]
            }
          ],
          explanation: "This does not diagnose a tile by itself. It gives you the first question to ask before changing a recipe: which job was out of balance?"
        }),
        p({
          id: "silica",
          body: "The usual glass former is silica. If you have ever seen glass, you have seen what silica-rich melts can become. But pure silica asks for far more heat than your cone 6 electric firing provides. So a studio glaze cannot just be silica. It needs helpers."
        }),
        p({
          id: "fluxes",
          body: "Fluxes are those helpers. They lower the melting range so the glass can form in your kiln. Sodium, potassium, lithium, calcium, magnesium, zinc, and boron compounds can all act as fluxes in different ways. In recipe language they may arrive through feldspar, frit, whiting, dolomite, talc, spodumene, zinc oxide, or other materials."
        }),
        p({
          id: "alumina",
          body: "Alumina is the brake. It stiffens the melt, helps suspend the raw glaze in the bucket when it comes from clay, and can keep a glaze from sliding down the pot. Too much stiffening can leave a dry or immature surface. Too little can make a glaze run, settle strangely, or fail to hold bubbles long enough to heal."
        }),
        p({
          id: "colorants",
          body: "Colorants and opacifiers are not decoration sprinkled onto a finished glass. They are participants in the melt. Cobalt, copper, iron, rutile, tin, zircon, stains, and other additions can change color, opacity, surface, melt behavior, and safety questions at the same time."
        }),
        diagram({
          id: "glaze-balance-diagram",
          title: "A cone 6 glaze balance",
          syntax: "mermaid",
          body: `flowchart LR
  A["Raw glaze coat on bisque"] --> B["Heat work at cone 6"]
  B --> C["Glass former builds network"]
  B --> D["Fluxes make melt possible"]
  B --> E["Alumina stiffens the melt"]
  C --> F["Fired glaze surface"]
  D --> F
  E --> F
  F --> G["Surface appearance"]
  F --> H["Clay/glaze fit"]
  F --> I["Durability questions"]`
        }),
        p({
          id: "diagram-readout",
          body: "Notice that appearance, fit, and durability come after the melt. A recipe can look beautiful and still be a poor fit for the clay. A glaze can be glossy and still not be proven safe for food contact. The first model helps you ask better questions; it does not let you skip testing."
        })
      ]
    }),
    section({
      id: "read-the-surface",
      title: "Read The Surface Before Naming The Defect",
      role: "instruction",
      blocks: [
        p({
          id: "image-instructions",
          body: "Study the six generated test tiles below as a cue sheet. Do not start by memorizing the labels. First look at where the surface changed: across the whole tile, at tiny holes, in bare islands, as raised bubbles, or near the lower edge."
        }),
        image({
          id: "defect-contact-sheet",
          src: "assets/glaze-defect-contact-sheet.png",
          alt: "Generated contact sheet showing six ceramic glaze test tiles labeled Stable, Crazing, Pinholes, Crawling, Blisters, and Running.",
          caption: "Generated teaching image: common fired surface outcomes on small test tiles. Use it as a looking exercise, not as a final diagnostic authority.",
          credit: "Generated for this Tutor Kit course."
        }),
        transformation({
          id: "surface-cue-to-question",
          title: "A Better First Diagnosis Move",
          focus: "Turn a visible cue into the next studio question.",
          layout: "compare",
          inputLabel: "What you see",
          operationLabel: "Question to ask first",
          outputLabel: "Why that question matters",
          input: [
            {
              format: "table",
              columns: ["Cue", "Avoid jumping straight to"],
              rows: [
                ["Fine crackle network", "The recipe is bad"],
                ["Tiny pits", "The glaze needs more glaze"],
                ["Bare clay islands", "The kiln misfired"],
                ["Thick lower-edge pooling", "The colorant caused it"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Ask what system could produce that cue: fit, gases escaping, wetting/application, melt fluidity, firing schedule, clay body, or contamination."
          },
          output: [
            {
              format: "table",
              columns: ["Cue", "First question"],
              rows: [
                ["Crazing", "Is the fired glaze contracting more than the clay as it cools?"],
                ["Pinholes", "Were gases still escaping, or did the melt fail to heal before stiffening?"],
                ["Crawling", "Did the raw coat crack, shrink, repel, or lose contact with the bisque?"],
                ["Running", "Was the melt too fluid for the application thickness and firing?"]
              ]
            }
          ],
          explanation: "A defect name is a filing label. A useful diagnosis asks what happened before, during, and after the melt."
        }),
        quiz({
          id: "cue-check",
          title: "Surface Cue Check",
          mode: "check",
          questions: [
            {
              kind: "matching",
              id: "match-cues-to-first-questions",
              prompt: "Match each fired-surface cue to the first useful question it should make you ask.",
              leftLabel: "Visible cue",
              rightLabel: "First useful question",
              pairs: [
                {
                  id: "running",
                  left: "Glossy drips and pooling near the foot",
                  right: "Was the melt too fluid or the coat too thick for this firing?"
                },
                {
                  id: "crazing",
                  left: "Fine crackle lines across the surface",
                  right: "Is the glaze under tension because it contracted more than the clay?"
                },
                {
                  id: "pinholes",
                  left: "Tiny pits that did not smooth over",
                  right: "Were gases escaping after the glaze had begun to stiffen?"
                },
                {
                  id: "crawling",
                  left: "Bare clay islands where glaze pulled away",
                  right: "Did the raw glaze coat lose contact with the bisque?"
                }
              ],
              explanation: "The matching rule is mechanism first. Look at the physical shape of the failure, then ask which part of the melt, surface contact, gas release, or fit could produce that shape.",
              tags: ["defect-cues", "diagnosis"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "safe-testing-start",
      title: "Start Testing Without Pretending To Certify",
      role: "instruction",
      blocks: [
        p({
          id: "testing-intro",
          body: "Testing your own recipes starts before the kiln. A good test is small, labeled, contained, and honest about what it can and cannot prove. A test tile can tell you melt, color, surface, fit clues, and application behavior. It cannot by itself prove that a glaze is safe for food."
        }),
        callout({
          id: "dust-safety",
          tone: "caution",
          title: "Dry glaze materials are a lung hazard",
          body: "Many clay and glaze materials can release fine mineral dust, including respirable crystalline silica. Mix dry materials with local studio rules, wet cleanup, good ventilation, and a properly fitted respirator when dusty work cannot be avoided. Do not sweep dry powder. Keep materials labeled and away from food areas."
        }),
        callout({
          id: "food-safety",
          tone: "caution",
          title: "Beautiful is not the same as food-safe",
          body: "For functional ware, use well-tested liner glazes from reliable sources until you understand durability testing. Avoid lead and cadmium materials in studio recipes. Be careful with heavy colorant loads, matte surfaces, unstable recipes, and unknown commercial or found glazes. Use lab leach testing when a glaze must be claimed safe for food contact."
        }),
        p({
          id: "first-test-batch",
          body: "A conservative first recipe test is a 100 gram batch on vertical test tiles, not a dinner set. The 100 gram batch makes percentage math easy: 20 grams of a material is 20 percent of the dry batch. The vertical tile tells you whether the glaze stays put. A catch tile or cookie underneath protects the kiln shelf if the melt runs."
        }),
        codeBlock({
          id: "notebook-template",
          language: "text",
          code: `Test ID:
Clay body:
Bisque temperature:
Glaze recipe source or change:
Batch size:
Specific gravity or water amount:
Application method:
Coat count / dip seconds:
Firing schedule and cone packs:
Placement in kiln:
Fired result:
Next question:`
        }),
        list({
          id: "starter-rules",
          style: "number",
          items: [
            "Change one thing at a time unless you are deliberately running a blend.",
            "Use a published cone 6 base glaze before inventing a base from scratch.",
            "Test on your clay body, because glaze fit belongs to the clay-glaze pair.",
            "Fire test tiles upright with room below them to catch runs.",
            "Label every tile with an ID that survives firing.",
            "Record what happened before deciding what it means."
          ]
        }),
        balancedQuiz({
          id: "testing-check",
          title: "Testing Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "first-original-recipe",
              prompt: "You want to try a new cone 6 recipe you found online. What is the safest first studio move?",
              choices: [
                { id: "a", body: "Mix a 100 gram test batch, label vertical test tiles, use a catch tile, and record application and firing details." },
                { id: "b", body: "Glaze a full set of mugs because cone 6 recipes should be safe if fired to cone 6." },
                { id: "c", body: "Add extra colorant first so the test clearly shows whether the color works." },
                { id: "d", body: "Fire one unlabeled flat tile because the kiln result will be obvious later." }
              ],
              answer: "a",
              explanation: "A small labeled test limits risk and gives usable evidence. Cone number alone does not prove fit, melt stability, or food-contact safety.",
              tags: ["safe-testing", "cone-6"],
              difficulty: "easy"
            }
          ]
        })
      ]
    }),
    section({
      id: "worked-case",
      title: "Worked Case: A Glossy White That Runs",
      role: "practice",
      blocks: [
        p({
          id: "worked-case-setup",
          body: "Suppose a glossy white glaze looks smooth on a flat tile but forms thick drips on a vertical tile at cone 6. Before changing the recipe, predict the first two things you would check."
        }),
        list({
          id: "worked-case-prediction",
          style: "bullet",
          items: [
            "Was the coat thicker than the test that looked stable?",
            "Did the kiln give more heat work than expected, especially near that shelf position?",
            "Does the recipe look low in stiffening material or high in strong fluxes?",
            "Is the glaze being used near the foot where any run can damage a shelf?"
          ]
        }),
        p({
          id: "worked-case-readout",
          body: "The important move is order. Application thickness and firing evidence are faster to check than chemistry. If the same recipe runs on several correctly labeled vertical tiles, then chemistry becomes the next question: the melt may need less flux, more alumina, more silica, or a different base. Which change fits depends on the actual recipe, so the next chapter will teach how to read those materials."
        }),
        callout({
          id: "one-cause-trap",
          tone: "caution",
          title: "The one-cause trap",
          body: "A defect often has several contributing causes. Pinholes can involve clay off-gassing, bisque temperature, glaze thickness, firing schedule, and melt viscosity. Crazing can involve clay body, glaze chemistry, cooling, and form. Treat the defect as evidence, then narrow the possibilities."
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
          body: "Close the chapter by retrieving the model without looking back: a glaze is a controlled melt that has to form glass, move enough, stop moving enough, fit the clay, and cool into a useful surface."
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Chapter Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "paint-or-glass",
              prompt: "Why is it misleading to think of glaze as paint?",
              choices: [
                { id: "a", body: "Paint mainly dries into a film; glaze must melt and cool into a glassy surface." },
                { id: "b", body: "Paint has colorants, while glaze never uses colorants." },
                { id: "c", body: "Paint is always safe for food surfaces, while glaze is never safe." },
                { id: "d", body: "Paint only works on metal, while glaze only works on porcelain." }
              ],
              answer: "a",
              explanation: "The mechanism is melting, not drying. Raw glaze application matters, but firing changes the mineral batch into a new fired surface.",
              tags: ["glaze-model"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "role-of-flux",
              prompt: "In the first model, what job does a flux do?",
              choices: [
                { id: "a", body: "It helps the glass former melt within the kiln's working range." },
                { id: "b", body: "It guarantees food safety after firing." },
                { id: "c", body: "It only adds blue or green color." },
                { id: "d", body: "It prevents all clay-glaze fit problems." }
              ],
              answer: "a",
              explanation: "Fluxes lower the melting range. They can also affect color, surface, and fit, but their first role in this model is making the melt possible at cone 6.",
              tags: ["ingredient-roles"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "smooth-food-safe",
              prompt: "A fired test tile is glossy, smooth, and attractive. What can you conclude?",
              choices: [
                { id: "a", body: "It melted into a smooth surface on that tile, but food-contact safety is not proven." },
                { id: "b", body: "It is automatically safe for acidic foods because it reached cone 6." },
                { id: "c", body: "It has no colorants or fluxes." },
                { id: "d", body: "It will fit every cone 6 clay body." }
              ],
              answer: "a",
              explanation: "Surface appearance is useful evidence, not certification. Durability and leaching require appropriate testing, especially for functional ware.",
              tags: ["safe-testing", "durability"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "pinholes-question",
              prompt: "A tile has tiny pits that did not smooth over. Which first question best follows the model?",
              choices: [
                { id: "a", body: "Were gases escaping after the glaze had begun to stiffen, or did the melt fail to heal?" },
                { id: "b", body: "Was the glaze certainly too blue?" },
                { id: "c", body: "Did the potter use too little clay body under the glaze?" },
                { id: "d", body: "Did the glaze contract more than the clay during cooling?" }
              ],
              answer: "a",
              explanation: "Pinholes point first toward gas release and healing. Cooling contraction is the first question for crazing, not pits.",
              tags: ["defect-cues", "diagnosis"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "first-test-format",
              prompt: "Why test an unfamiliar glaze on an upright tile with a catch tile?",
              choices: [
                { id: "a", body: "It shows running risk and protects the kiln shelf if the melt moves too much." },
                { id: "b", body: "It proves the glaze is chemically durable." },
                { id: "c", body: "It makes respirable dust harmless." },
                { id: "d", body: "It removes the need to record firing details." }
              ],
              answer: "a",
              explanation: "Vertical testing exposes melt movement. A catch tile is kiln protection, not a safety certification or replacement for records.",
              tags: ["safe-testing", "melt-fluidity"],
              difficulty: "easy"
            }
          ]
        }),
        list({
          id: "studio-task",
          style: "number",
          items: [
            "Choose one fired glaze test or pot you already have.",
            "Write three observations without naming a defect: for example, where it is glossy, where it is rough, whether marks are holes, lines, islands, bubbles, or runs.",
            "Then write one first question using the chapter model: melt, fit, surface contact, gas release, firing heat work, or application thickness.",
            "Do not change a recipe yet. The goal is to separate seeing from guessing."
          ]
        }),
        glossary({
          id: "first-terms",
          title: "Terms To Keep",
          entries: [
            {
              term: "heat work",
              definition: "The combined effect of temperature and time on how much melting and change the ware experiences in the kiln."
            },
            {
              term: "glass former",
              definition: "A material role, usually led by silica, that can build the glass network in the fired glaze."
            },
            {
              term: "flux",
              definition: "A material role that helps the glaze melt in the kiln's firing range."
            },
            {
              term: "alumina",
              definition: "A stiffening contributor that helps control how freely the glaze melt moves."
            },
            {
              term: "fit",
              definition: "How the fired glaze and clay body shrink and expand together, especially during cooling."
            }
          ]
        })
      ]
    })
  ]
});
