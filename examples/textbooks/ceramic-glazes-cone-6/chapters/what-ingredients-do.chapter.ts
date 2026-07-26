import {
  balancedQuiz,
  callout,
  chapter,
  codeBlock,
  glossary,
  list,
  p,
  quiz,
  section,
  transformation
} from "tutor-kit";

export default chapter({
  id: "what-ingredients-do",
  title: "What Ingredients Do",
  description: "Read common cone 6 glaze materials by the jobs they contribute to the fired melt.",
  role: "instruction",
  sections: [
    section({
      id: "recipe-as-batch-plan",
      title: "A Recipe Is A Batch Plan",
      role: "instruction",
      blocks: [
        p({
          id: "learner-goal",
          body: "After this chapter, you should be able to read a simple cone 6 recipe and say what each material is probably contributing before you decide whether the recipe is worth testing."
        }),
        p({
          id: "recipe-not-chemistry-yet",
          body: "A glaze recipe looks like a grocery list: feldspar, silica, kaolin, frit, whiting, maybe a colorant. But the fired glaze does not remember the grocery list in that form. In the kiln, materials melt, dissolve, release gases, and contribute oxides to the glass. Recipe percentages tell you what you weighed. They are not the same thing as the fired chemistry."
        }),
        p({
          id: "hundred-gram-entry",
          body: "Use this teaching batch only as a reading exercise. It is recipe-shaped and plausible, but it is not being recommended as a food-safe glaze or as a glaze that will fit your clay body."
        }),
        codeBlock({
          id: "teaching-batch",
          language: "text",
          code: `Cone 6 teaching batch, 100 g dry

Feldspar       35 g
Silica         25 g
Frit 3134      20 g
EPK kaolin     15 g
Whiting         5 g
Total         100 g`
        }),
        p({
          id: "hundred-gram-readout",
          body: "Because the total is 100 grams, grams and percentages line up. The 35 grams of feldspar are 35 percent of the dry batch. That makes weighing easy, but it can also trick you into thinking 35 percent feldspar means 35 percent flux. It does not. Feldspar carries flux, alumina, and silica together."
        }),
        callout({
          id: "package-model",
          tone: "key-idea",
          title: "Think packages, not single-purpose ingredients",
          body: "Most glaze materials are packages. The useful question is not 'What is this material called?' The useful question is 'What does this material bring into the melt?'"
        })
      ]
    }),
    section({
      id: "unpack-common-materials",
      title: "Unpack Common Materials",
      role: "instruction",
      blocks: [
        p({
          id: "unpack-intro",
          body: "Look at the same batch again, but this time read it as contributions to the melt. The words below are not a full chemistry calculation. They are the first studio pass you make before reaching for glaze software."
        }),
        transformation({
          id: "raw-material-packages",
          title: "The Same Recipe, Read By Roles",
          focus: "A material name is a package label; a role is what that package contributes.",
          layout: "compare",
          inputLabel: "Material weighed",
          operationLabel: "What to ask",
          outputLabel: "Likely contribution",
          input: [
            {
              format: "table",
              columns: ["Material", "Batch amount"],
              rows: [
                ["Feldspar", "35 g"],
                ["Silica", "25 g"],
                ["Frit 3134", "20 g"],
                ["EPK kaolin", "15 g"],
                ["Whiting", "5 g"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "For each material, ask: does it mostly build glass, help the melt, stiffen the melt, suspend the bucket glaze, change color or opacity, or affect fit?"
          },
          output: [
            {
              format: "table",
              columns: ["Material", "Beginner reading"],
              rows: [
                ["Feldspar", "mixed package: alkali fluxes plus alumina and silica"],
                ["Silica", "glass former; often raises durability and expansion questions"],
                ["Frit 3134", "manufactured glass; strong boron/flux help for cone 6 melting"],
                ["EPK kaolin", "alumina and silica; stiffening plus raw glaze suspension"],
                ["Whiting", "calcium flux; can affect melt surface and fit"]
              ]
            }
          ],
          explanation: "The same recipe now looks less like five unrelated powders and more like a negotiated melt."
        }),
        p({
          id: "feldspar",
          body: "Feldspar is the beginner's first example of a mixed package. It helps melt because it brings alkali fluxes such as sodium and potassium. It also brings alumina and silica. If you replace feldspar with a pure flux material gram for gram, you have not made a small edit. You have changed several parts of the melt at once."
        }),
        p({
          id: "silica",
          body: "Silica is the main glass former. More silica often pushes a recipe toward a stiffer, more durable, less easily melted glass, but 'often' is doing real work in that sentence. The rest of the recipe decides whether the extra silica dissolves well at cone 6 or sits there making the glaze drier."
        }),
        p({
          id: "kaolin",
          body: "Kaolin, such as EPK, is a clay. In the bucket it helps the glaze stay suspended and makes the coat behave more like a brushable or dippable slurry. In the fired glaze it contributes alumina and silica. That alumina stiffens the melt, which can be exactly what you need for a runny glaze and exactly what you do not need for an under-melted one."
        }),
        p({
          id: "frit",
          body: "A frit is a manufactured glass that has already been melted, quenched, and ground. Potters use frits because some useful oxides are troublesome, soluble, variable, or hard to melt when sourced directly. In cone 6 electric glazes, boron-bearing frits are common because boron can help the glaze melt in this range."
        }),
        p({
          id: "whiting",
          body: "Whiting is calcium carbonate. During firing it releases carbon dioxide and leaves calcium oxide available to the melt. Calcium can act as a flux in the right temperature range and can influence surface quality, crystallization, opacity, and fit. The gas release is one reason firing and glaze thickness matter: bubbles need time and a fluid-enough melt to heal."
        })
      ]
    }),
    section({
      id: "colorants-and-opacifiers",
      title: "Colorants Are Small But Not Invisible",
      role: "instruction",
      blocks: [
        p({
          id: "colorants-intro",
          body: "Now suppose the base recipe has melted well, and you want color. It is tempting to treat colorants as harmless seasoning. A little cobalt can make a strong blue. Copper can move green, turquoise, or red depending on chemistry and atmosphere. Iron can move through honey, brown, green, black, speckled, or kaki-like surfaces. These additions are small, but they are not invisible to the melt."
        }),
        transformation({
          id: "addition-vs-base",
          title: "Base Batch Plus Addition",
          focus: "Learn the bookkeeping before the aesthetics.",
          layout: "flow",
          inputLabel: "Base recipe",
          operationLabel: "Addition",
          outputLabel: "What changed",
          input: [
            {
              format: "markdown",
              body: "Base recipe totals 100 g. It is the whole dry base glaze before colorants."
            }
          ],
          operation: {
            format: "markdown",
            body: "Add 2 g iron oxide as an addition. In recipe notation this is often written as '+2% iron oxide' rather than forcing the base materials to total 98 g."
          },
          output: [
            {
              format: "table",
              columns: ["Thing", "Amount"],
              rows: [
                ["Base glaze", "100 g"],
                ["Iron oxide addition", "2 g"],
                ["Dry material in cup", "102 g before water"]
              ]
            }
          ],
          explanation: "Additions are usually tracked separately so the base remains readable. That does not mean the addition is chemically irrelevant after firing."
        }),
        p({
          id: "opacifiers",
          body: "Opacifiers such as zircon or tin compounds scatter light so the glaze looks more opaque. They can also change surface feel, melt response, and color response. If a transparent base becomes a stiff white glaze after a large opacifier addition, that was not magic; you changed how light and sometimes the melt itself behave."
        }),
        callout({
          id: "colorant-safety",
          tone: "caution",
          title: "Do not learn color by adding hazardous materials casually",
          body: "Avoid lead and cadmium materials in studio glaze recipes. Be cautious with high colorant loads and with functional surfaces. A beautiful color test is not a food-safety result."
        })
      ]
    }),
    section({
      id: "predicting-edits",
      title: "Predict Before You Edit",
      role: "practice",
      blocks: [
        p({
          id: "edit-intro",
          body: "Before you test your own recipes, practice the discipline of prediction. Do not ask, 'What should I add to fix it?' Ask, 'Which part of the melt am I changing, and what could that change break?'"
        }),
        transformation({
          id: "edit-prediction",
          title: "One Change, Several Consequences",
          focus: "A recipe edit is not a button with one effect.",
          layout: "compare",
          inputLabel: "Starting problem",
          operationLabel: "Proposed edit",
          outputLabel: "Prediction to test",
          input: [
            {
              format: "markdown",
              body: "A glossy cone 6 glaze runs badly on vertical tiles."
            }
          ],
          operation: {
            format: "markdown",
            body: "Increase EPK kaolin by 5 parts and reduce feldspar by 5 parts."
          },
          output: [
            {
              format: "table",
              columns: ["Likely direction", "Why"],
              rows: [
                ["Stiffer melt", "more alumina from kaolin"],
                ["Less flux contribution", "less feldspar package"],
                ["Possibly less running", "melt has more brake and less push"],
                ["Possibly drier surface", "the glaze may no longer melt enough"]
              ]
            }
          ],
          explanation: "This is the kind of prediction that earns a test. It names the hoped-for change and the risk introduced by the same edit."
        }),
        quiz({
          id: "role-matching-check",
          title: "Material Role Check",
          mode: "check",
          questions: [
            {
              kind: "matching",
              id: "match-materials-to-roles",
              prompt: "Match each material to the beginner reading you should try first.",
              leftLabel: "Material",
              rightLabel: "First reading",
              pairs: [
                {
                  id: "silica",
                  left: "Silica",
                  right: "Main glass former"
                },
                {
                  id: "epk",
                  left: "EPK kaolin",
                  right: "Clay package: alumina, silica, and suspension"
                },
                {
                  id: "frit",
                  left: "Frit 3134",
                  right: "Manufactured glass that can supply boron and flux help"
                },
                {
                  id: "whiting",
                  left: "Whiting",
                  right: "Calcium source that releases gas during firing"
                }
              ],
              explanation: "The sorting rule is contribution, not name recognition. Each material is being read by what it brings into the raw bucket and fired melt.",
              tags: ["ingredient-roles", "recipe-reading"],
              difficulty: "easy"
            }
          ]
        }),
        balancedQuiz({
          id: "edit-check",
          title: "Prediction Check",
          mode: "check",
          questions: [
            {
              kind: "multiple-choice",
              id: "too-dry-more-silica",
              prompt: "A glaze is already dry and under-melted at cone 6. What is the best prediction if you add more silica without changing the fluxes?",
              choices: [
                { id: "a", body: "It may become even harder to melt smoothly because silica is the glass former but needs enough flux and heat work." },
                { id: "b", body: "It must become glossier because all glass formers automatically make glossy glass." },
                { id: "c", body: "It will prove food-safe because silica is present." },
                { id: "d", body: "It will stop all crawling because crawling is only caused by low silica." }
              ],
              answer: "a",
              explanation: "Silica is necessary for glass, but extra silica can remain under-dissolved if the recipe lacks enough melting help at cone 6.",
              tags: ["silica", "melt"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "more-frit-risk",
              prompt: "You add more boron-bearing frit to help a stiff glaze melt at cone 6. What risk should you watch for on vertical test tiles?",
              choices: [
                { id: "a", body: "The glaze may become more fluid and run if the melt now has too much push for its stiffening." },
                { id: "b", body: "The glaze will stop melting because frits are unmelted rocks." },
                { id: "c", body: "The clay body will no longer matter." },
                { id: "d", body: "All colorants will disappear." }
              ],
              answer: "a",
              explanation: "Frit can help the melt. That can solve dryness, but it can also create running if the recipe no longer has enough stiffening for the firing and application thickness.",
              tags: ["frit", "melt-fluidity"],
              difficulty: "medium"
            }
          ]
        })
      ]
    }),
    section({
      id: "read-a-recipe",
      title: "Read A Recipe Before Mixing It",
      role: "practice",
      blocks: [
        p({
          id: "practice-setup",
          body: "Here is your studio move for this chapter. You are not deciding whether a recipe is good yet. You are deciding whether you can read what the recipe is trying to do."
        }),
        codeBlock({
          id: "practice-recipe",
          language: "text",
          code: `Mystery cone 6 recipe

Nepheline syenite   45
Silica              20
EPK kaolin          20
Whiting             10
Zircon               5

Add:
Cobalt carbonate     1`
        }),
        list({
          id: "recipe-reading-tasks",
          style: "number",
          items: [
            "Circle the material that is most clearly a glass former.",
            "Name two materials that are packages rather than single-job ingredients.",
            "Identify the opacifier.",
            "Explain why the cobalt addition is written separately.",
            "Write one risk you would watch for if you mixed a 100 gram test batch and fired it upright."
          ]
        }),
        p({
          id: "practice-feedback",
          body: "A good answer does not need a unity formula yet. It should say that silica is the clear glass former; nepheline syenite and EPK are packages; zircon is the opacifier; cobalt is an addition because the base totals 100; and a vertical test should watch melt movement, color strength, surface stability, and fit on your clay."
        }),
        callout({
          id: "dry-material-safety",
          tone: "caution",
          title: "Recipe-reading happens before dusty work",
          body: "Do as much thinking as possible before opening bags. Once dry materials are out, use studio dust controls, wet cleanup, labels, and appropriate PPE. Crystalline silica is common in ceramic materials, and respirable dust is the exposure route to avoid."
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
          body: "The chapter's central move is small but powerful: read every ingredient twice. First as a raw material you weigh, then as a set of contributions to the fired melt."
        }),
        balancedQuiz({
          id: "chapter-review",
          title: "Chapter Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "percent-vs-chemistry",
              prompt: "Why are recipe percentages not the same as fired glaze chemistry?",
              choices: [
                { id: "a", body: "Recipe percentages tell what was weighed; materials may contribute several oxides after firing." },
                { id: "b", body: "Recipe percentages are always measured after firing." },
                { id: "c", body: "Only colorants contribute to fired chemistry." },
                { id: "d", body: "The kiln erases all differences among ingredients." }
              ],
              answer: "a",
              explanation: "A raw material is often a package. Feldspar, kaolin, frit, and whiting each contribute different fired chemistry than their names alone suggest.",
              tags: ["recipe-reading", "oxide-contributions"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "feldspar-package",
              prompt: "Which is the best beginner reading of feldspar in a cone 6 glaze recipe?",
              choices: [
                { id: "a", body: "A mixed package that can bring alkali fluxes, alumina, and silica." },
                { id: "b", body: "A pure blue colorant." },
                { id: "c", body: "A material that only suspends the bucket glaze and burns away." },
                { id: "d", body: "A food-safety certification material." }
              ],
              answer: "a",
              explanation: "Feldspar is useful partly because it is a package. That is also why replacing it gram for gram can change more than one property.",
              tags: ["feldspar", "ingredient-roles"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "kaolin-edit",
              prompt: "A glaze runs too much. Why might increasing kaolin help, and what risk comes with it?",
              choices: [
                { id: "a", body: "More kaolin can add alumina and stiffen the melt, but too much may make the glaze drier or less mature." },
                { id: "b", body: "Kaolin removes all fluxes from the kiln atmosphere, but it may make the pot magnetic." },
                { id: "c", body: "Kaolin is only a colorant, so it can turn the glaze white." },
                { id: "d", body: "Kaolin guarantees that the glaze fits every clay body." }
              ],
              answer: "a",
              explanation: "The useful prediction names both sides of the edit: more brake on the melt, with a possible loss of melt maturity.",
              tags: ["kaolin", "melt-fluidity"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "addition-bookkeeping",
              prompt: "A base recipe totals 100 grams and says '+2% iron oxide.' How much dry material is in the cup before water if you make a 100 gram base test?",
              choices: [
                { id: "a", body: "102 grams: 100 grams base plus 2 grams iron oxide." },
                { id: "b", body: "100 grams: the iron replaces 2 grams of every base material automatically." },
                { id: "c", body: "98 grams: the iron burns away before weighing." },
                { id: "d", body: "200 grams: additions double the base recipe." }
              ],
              answer: "a",
              explanation: "In common recipe notation, additions are often tracked on top of the base so the base remains easy to compare.",
              tags: ["additions", "batch-math"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "lead-cadmium-caution",
              prompt: "Which statement is the safest beginner rule for functional cone 6 ware?",
              choices: [
                { id: "a", body: "Avoid lead and cadmium materials, and do not claim food safety from appearance alone." },
                { id: "b", body: "Any glaze that reaches cone 6 is food-safe." },
                { id: "c", body: "A matte glaze is always safer than a glossy glaze." },
                { id: "d", body: "Colorants are too small to affect safety or durability." }
              ],
              answer: "a",
              explanation: "Food-contact safety needs appropriate materials, stable glaze design, and testing. Appearance alone is not enough.",
              tags: ["safety", "functional-ware"],
              difficulty: "easy"
            }
          ]
        }),
        glossary({
          id: "chapter-terms",
          title: "Terms To Keep",
          entries: [
            {
              term: "raw material",
              definition: "The bagged material you weigh into a glaze batch, such as feldspar, silica, kaolin, frit, or whiting."
            },
            {
              term: "oxide contribution",
              definition: "What a raw material supplies to the fired glaze chemistry after the kiln changes it."
            },
            {
              term: "frit",
              definition: "A manufactured glass that has been melted, cooled, and ground so useful oxides can be added to a glaze more reliably."
            },
            {
              term: "addition",
              definition: "A material, often a colorant or opacifier, tracked on top of a 100-part base recipe."
            },
            {
              term: "opacifier",
              definition: "A material added to scatter light and make a glaze less transparent."
            }
          ]
        })
      ]
    })
  ]
});
