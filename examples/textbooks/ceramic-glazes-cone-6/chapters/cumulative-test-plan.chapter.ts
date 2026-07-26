import { balancedQuiz, callout, chapter, codeBlock, list, p, section, transformation } from "tutor-kit";

export default chapter({
  id: "cumulative-test-plan",
  title: "Cumulative Test Plan",
  description: "Design a small, safe, interpretable cone 6 glaze test series from question to use decision.",
  role: "cumulative-checkpoint",
  sections: [
    section({
      id: "test-brief",
      title: "Write The Test Brief",
      role: "practice",
      blocks: [
        p({
          id: "checkpoint-goal",
          body: "This chapter is a checkpoint. You are not learning a new glaze mechanism; you are proving that you can use the mechanisms together. By the end, you should have a small cone 6 test plan that names one clay body, one intended use, one question, one controlled variable, the safety controls, the fired evidence you will collect, and the decision you will allow yourself to make afterward."
        }),
        p({
          id: "scenario-intro",
          body: "Use the studio situation below as your practice case. Read it once as a potter who wants the surface, then a second time as the person responsible for dust, kiln shelves, labels, and honest use claims."
        }),
        codeBlock({
          id: "studio-situation",
          language: "text",
          code: `Studio situation:
Clay body: your usual cone 6 stoneware
Kiln: electric cone 6 oxidation
Intended use: mug exterior; maybe a liner later, but not yet
Starting evidence: a glossy base glaze melts well but runs slightly at thick lower edges
Color idea: a green colorant addition looks promising, but it has not been tested for food contact
Goal: design a small test series that is safe, labeled, interpretable, and honest about use`
        }),
        transformation({
          id: "brief-from-situation",
          title: "Turn A Wish Into A Test Question",
          focus: "Separate the surface you want from the narrow question this firing can answer.",
          layout: "flow",
          inputLabel: "Wish",
          operationLabel: "Narrowing move",
          outputLabel: "Test brief",
          input: [
            {
              format: "table",
              columns: ["Tempting wish", "Why it is too broad"],
              rows: [
                ["Make a good green mug glaze", "mixes color, fit, running, durability, application, and food use"],
                ["Fix the running and test the color", "changes more than one thing unless the design names separate lanes"],
                ["Prove it is food safe", "a studio firing and visual inspection cannot prove that"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Choose a first question that a few labeled tiles can answer: can a small feldspar-to-kaolin shift reduce edge running while keeping the base glossy enough to heal?"
          },
          output: [
            {
              format: "table",
              columns: ["Plan field", "Checkpoint answer"],
              rows: [
                ["Clay and kiln", "one cone 6 stoneware, one electric cone 6 schedule"],
                ["Intended use now", "test tiles and mug exteriors only"],
                ["Variable", "feldspar down while kaolin goes up"],
                ["Evidence", "flow distance, edge pooling, gloss, pinholes, fit cues"],
                ["Use decision", "no liner or food-contact claim from this test"]
              ]
            }
          ],
          explanation: "A good brief does not ask one firing to answer every attractive question. It protects the learning signal by deciding which answer this test is allowed to produce."
        }),
        callout({
          id: "food-contact-boundary",
          tone: "caution",
          title: "Do not let beauty outrun evidence",
          body: "A promising color on a test tile is not a food-contact result. For mug interiors, use a known liner glaze for your clay and kiln, or follow a lab leach-testing pathway appropriate to the materials and jurisdiction before making functional claims."
        })
      ]
    }),
    section({
      id: "build-series",
      title: "Build The Series",
      role: "practice",
      blocks: [
        p({
          id: "series-intro",
          body: "Now turn the brief into cups. The base already melts, so the first series should not rebuild the whole recipe. It should compare the base against a small line blend that trades melt push for more alumina stiffening. Keep the clay, firing, tile shape, application thickness, sieve, and water habits as constant as your studio can manage."
        }),
        transformation({
          id: "series-table",
          title: "A Five-Tile Plan",
          focus: "Each tile answers one part of the same question.",
          layout: "compare",
          inputLabel: "Question",
          operationLabel: "Recipe movement",
          outputLabel: "Tile series",
          input: [
            {
              format: "table",
              columns: ["Question", "Evidence to collect"],
              rows: [
                ["Does less feldspar and more kaolin reduce running?", "flow distance and edge pooling"],
                ["Does the surface still heal?", "gloss, dry patches, pinholes"],
                ["Does the clay-glaze pair show fit trouble?", "crazing, shivering, delayed fit notes"]
              ]
            }
          ],
          operation: {
            format: "markdown",
            body: "Keep total recipe parts at 100. Move in small steps from the original base toward a stiffer version."
          },
          output: [
            {
              format: "table",
              columns: ["Tile ID", "Feldspar", "Silica", "Frit", "Kaolin", "Purpose"],
              rows: [
                ["A1", "40", "25", "20", "15", "control: original base"],
                ["A2", "38", "25", "20", "17", "small stiffening step"],
                ["A3", "36", "25", "20", "19", "middle comparison"],
                ["A4", "34", "25", "20", "21", "stronger stiffening step"],
                ["A5", "32", "25", "20", "23", "edge of useful range"]
              ]
            }
          ],
          explanation: "The line blend is readable because one trade changes in one direction. If A3 is best, you know it sits between the original melt and the drier high-kaolin end, instead of wondering which of five unrelated changes mattered."
        }),
        p({
          id: "batch-math-intro",
          body: "For a first pass, 50 grams per cup is enough for small tiles in many studios. Because each recipe totals 100 parts, each part becomes 0.5 grams in a 50 gram cup. That means A3 weighs 18 grams feldspar, 12.5 grams silica, 10 grams frit, and 9.5 grams kaolin."
        }),
        codeBlock({
          id: "tile-record-table",
          language: "text",
          code: `Record before firing:
Test series: Running reduction line blend
Clay: exact clay body name
Firing: cone 6 electric, schedule or kiln program name
Tile form: upright tile with catch area
Application: same dip time or same brushed coat count for every tile
Shelf protection: kiln-washed shelf plus catch plate under every running-risk tile

Per tile:
A1: original base, 50 g test, application notes
A2: feldspar 38 / silica 25 / frit 20 / kaolin 17
A3: feldspar 36 / silica 25 / frit 20 / kaolin 19
A4: feldspar 34 / silica 25 / frit 20 / kaolin 21
A5: feldspar 32 / silica 25 / frit 20 / kaolin 23`
        }),
        callout({
          id: "color-lane",
          tone: "note",
          title: "Keep color in its lane",
          body: "If you also test the green colorant, make it a separate exterior-only lane on the best-known base or on one selected blend cup. Do not mix colorant changes into every running test unless your question is explicitly about color response across the blend."
        })
      ]
    }),
    section({
      id: "records-and-safety-gate",
      title: "Records And Safety Gate",
      role: "practice",
      blocks: [
        p({
          id: "safety-gate-intro",
          body: "Before powder moves, run the plan through a gate. The gate is not there to make the studio feel formal. It catches the failures that make a test useless or unsafe: airborne dust, unlabeled mystery tiles, unprotected shelves, unknown materials, unsupported liner claims, and records too vague to repeat."
        }),
        list({
          id: "safety-gate-list",
          items: [
            "Question: one sentence names the variable and the evidence you will inspect.",
            "Materials: every dry material is labeled, known, and appropriate for your studio rules.",
            "Dust control: containers stay closed until needed; scooping is slow and low; cleanup is wet or with an appropriate HEPA-filtered vacuum; no dry sweeping or compressed air.",
            "PPE and workspace: respiratory protection is appropriate when controls are not enough; food and drink stay out of the glaze area.",
            "Scale: the scale can resolve the smallest amount, especially colorants and small test batches.",
            "Labels: every tile and every cup has an ID that matches the notebook and survives firing.",
            "Kiln protection: running-risk tiles are upright with catch plates and appropriate shelf protection.",
            "Use boundary: exterior-only, decorative-only, liner, and food-contact decisions are written before the firing, not improvised after seeing a pretty tile."
          ]
        }),
        codeBlock({
          id: "after-firing-readout",
          language: "text",
          code: `Record after firing:
Cone evidence / heat work:
Best surface:
Worst surface:
Flow distance or edge pooling:
Gloss / matte / dry areas:
Pinholes, blisters, crawling, crazing, shivering:
Application surprises:
First diagnosis question:
Next revision rule:
Allowed use decision:
What I refuse to claim from this test:`
        }),
        p({
          id: "after-firing-rule",
          body: "That last line matters. A good test plan states what it does not prove. Your five-tile running series might identify a less runny exterior surface. It does not prove dishwasher durability, acid resistance, microwave safety, lead or cadmium release, or fitness as a liner."
        })
      ]
    }),
    section({
      id: "submit-plan-and-practice-test",
      title: "Submit The Plan",
      role: "assessment",
      blocks: [
        p({
          id: "submission-intro",
          body: "Your non-quiz checkpoint is to write a one-page test plan for the studio situation, or adapt it to your own cone 6 clay body if you have one. Use exact IDs and numbers. A future you should be able to open the notebook after firing and understand what happened."
        }),
        list({
          id: "plan-submission-tasks",
          items: [
            "Write the one-sentence question this firing will answer.",
            "Design the tile series with IDs, recipe changes, constants, and application notes.",
            "Calculate the gram weights for at least one 50 gram test cup.",
            "Identify the dust controls, shelf protection, and label method before weighing.",
            "Name the use decision this test can support and the claims it cannot support."
          ]
        }),
        codeBlock({
          id: "plan-template",
          language: "text",
          code: `Cumulative test plan:
1. Clay body and kiln:
2. Intended use for this test only:
3. One-sentence question:
4. Variable changed:
5. Constants held:
6. Tile IDs and recipe/application for each:
7. Batch size and scale precision:
8. Dust controls and PPE:
9. Shelf protection:
10. Firing record:
11. Fired evidence to inspect:
12. Next revision rule:
13. Use decision boundary:
14. Claims this test does not support:`
        }),
        callout({
          id: "passing-plan",
          tone: "key-idea",
          title: "What a passing plan feels like",
          body: "Someone else should be able to point to one tile and say what changed, why it changed, what stayed constant, how the kiln shelf was protected, and what conclusion the tile is allowed to support."
        }),
        balancedQuiz({
          id: "cumulative-practice-test",
          title: "Cumulative Practice Test",
          mode: "practice-test",
          questions: [
            {
              kind: "multiple-choice",
              id: "glaze-is-melt",
              prompt: "A beginner says, 'Glaze is basically colored paint that hardens in the kiln.' Which response best repairs the model?",
              choices: [
                { id: "a", body: "Glaze is a powdered recipe that melts into a glassy layer; color is only one part of that melt system." },
                { id: "b", body: "Glaze is clay slip with stronger pigment, so firing mainly dries it onto the pot." },
                { id: "c", body: "Glaze is paint until cone 6, then the clay body absorbs it completely." },
                { id: "d", body: "Glaze is decorative, so melt behavior matters only for functional ware." }
              ],
              answer: "a",
              explanation: "The useful model is molten glass on clay: glass former, flux, stabilizer, heat work, and clay fit all matter before color can become a reliable surface.",
              tags: ["glaze-model"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "recipe-percent-chemistry",
              prompt: "Two recipes both list 40% feldspar, but one uses a soda feldspar and one uses a potash feldspar. Why might they fire differently?",
              choices: [
                { id: "a", body: "Recipe percentages weigh raw materials; different feldspars deliver different oxide packages to the melt." },
                { id: "b", body: "Any material named feldspar contributes the same chemistry if the percentage is the same." },
                { id: "c", body: "Feldspar affects only bucket suspension, not fired melt." },
                { id: "d", body: "The difference matters only below cone 04, not at cone 6." }
              ],
              answer: "a",
              explanation: "A recipe is a weighing plan. Fired chemistry comes from what each raw material contributes after decomposition, melting, and interaction in the kiln.",
              tags: ["ingredient-roles", "recipe-chemistry"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "feldspar-package",
              prompt: "In a cone 6 base glaze, why is feldspar often called a package material?",
              choices: [
                { id: "a", body: "It brings some silica, alumina, and fluxing oxides together rather than acting as a pure single-purpose ingredient." },
                { id: "b", body: "It packages colorants so they cannot leach." },
                { id: "c", body: "It is added after firing as a surface seal." },
                { id: "d", body: "It is mainly a suspender and burns away before the glaze melts." }
              ],
              answer: "a",
              explanation: "Feldspar is not a pure flux. It brings a bundle of oxides, which is why swapping feldspar types or amounts can move melt, fit, and surface character together.",
              tags: ["ingredient-roles"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "running-first-check",
              prompt: "Your glossy glaze ran badly, but your notes show you dipped the test tile twice as long as planned. What should the next test do first?",
              choices: [
                { id: "a", body: "Retest the original recipe at the intended application thickness, with catch protection." },
                { id: "b", body: "Immediately replace several fluxes and add more silica." },
                { id: "c", body: "Assume the glaze needs a lower cone." },
                { id: "d", body: "Use the glaze only inside mugs because interiors have no edges." }
              ],
              answer: "a",
              explanation: "Application is a controllable variable and an obvious suspect. Retesting the same recipe at the intended thickness protects the signal before chemistry is changed.",
              tags: ["defect-diagnosis", "safe-testing", "running"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "crazing-shivering-direction",
              prompt: "A glaze shows fine crackle lines across the surface on your clay body. Which statement is the best first fit-direction idea?",
              choices: [
                { id: "a", body: "The glaze is likely under tension, so a lower-expansion glaze direction may be worth testing." },
                { id: "b", body: "The glaze is likely under excess compression, so lower expansion further." },
                { id: "c", body: "This is shivering, so the tile is safe if the flakes are tiny." },
                { id: "d", body: "Fit defects are solved by adding any colorant because colorants change expansion predictably." }
              ],
              answer: "a",
              explanation: "Crazing and shivering are opposite fit failures. Crazing usually points to glaze tension; shivering points to excessive compression and is a sharper reject signal.",
              tags: ["defect-diagnosis", "fit"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "pinholes-next-test",
              prompt: "A test tile has many small pinholes, and the glaze looks otherwise close to mature. Which next test best separates likely causes?",
              choices: [
                { id: "a", body: "Compare controlled thickness and a firing/hold change before making several recipe edits." },
                { id: "b", body: "Add every available flux so the glaze becomes more fluid." },
                { id: "c", body: "Assume pinholes prove the clay body is unusable." },
                { id: "d", body: "Ignore them if the glaze is a pretty color." }
              ],
              answer: "a",
              explanation: "Pinholes are gas and healing evidence. Application thickness and firing can determine whether bubbles heal, so they deserve a controlled check before a broad recipe rewrite.",
              tags: ["defect-diagnosis", "revision-loop"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "dust-control-best",
              prompt: "Which studio habit best matches safe beginner glaze testing with dry powders?",
              choices: [
                { id: "a", body: "Plan first, open only needed containers, scoop slowly, keep food away, and wet-clean or use an appropriate HEPA-filtered vacuum." },
                { id: "b", body: "Dry sweep after mixing so dust does not stay on the table." },
                { id: "c", body: "Use compressed air to move powder away from the scale quickly." },
                { id: "d", body: "Rely on any cloth mask so ventilation and cleanup do not matter." }
              ],
              answer: "a",
              explanation: "The main principle is source control: do not put respirable dust into the air, and do not create ingestion routes in the workspace.",
              tags: ["safe-testing", "dust-control"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "batch-math-50g",
              prompt: "A 100-part recipe lists feldspar 36, silica 25, frit 20, and kaolin 19. For a 50 g test batch, how much kaolin do you weigh?",
              choices: [
                { id: "a", body: "9.5 g" },
                { id: "b", body: "19 g" },
                { id: "c", body: "38 g" },
                { id: "d", body: "0.19 g" }
              ],
              answer: "a",
              explanation: "Because the recipe totals 100 parts, a 50 g batch uses a 0.5 multiplier. Nineteen parts times 0.5 is 9.5 grams.",
              tags: ["batch-math", "safe-testing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "catch-plate-purpose",
              prompt: "Why should the running-risk tiles in this checkpoint use catch plates or equivalent shelf protection?",
              choices: [
                { id: "a", body: "The test is designed to reveal flow, and shelf protection lets you observe that risk without damaging kiln furniture." },
                { id: "b", body: "Catch plates make every glaze food safe." },
                { id: "c", body: "Catch plates prevent crazing by changing thermal expansion." },
                { id: "d", body: "Catch plates replace the need for labels." }
              ],
              answer: "a",
              explanation: "A good test makes the suspected failure visible under controlled conditions while limiting damage. Shelf protection is part of the test design, not a chemistry fix.",
              tags: ["safe-testing", "running"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "line-blend-readable",
              prompt: "What makes the A1 to A5 feldspar-to-kaolin line blend interpretable?",
              choices: [
                { id: "a", body: "One trade changes step by step while the total recipe, clay, firing, and application stay controlled." },
                { id: "b", body: "Every cup changes several unrelated materials so one of them is likely to work." },
                { id: "c", body: "The colorant is changed in every cup at the same time." },
                { id: "d", body: "The blend uses large batches, so small weighing errors do not matter." }
              ],
              answer: "a",
              explanation: "Line blends teach by direction. If many unrelated variables change, the fired result may be attractive but it will not say which movement caused it.",
              tags: ["line-blend", "revision-loop"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "food-safety-claim",
              prompt: "A green exterior test looks glossy, smooth, and craze-free after one cone 6 firing. What is the most honest use decision?",
              choices: [
                { id: "a", body: "It may be considered for exterior-only testing, but the result does not prove it is safe as a food-contact liner." },
                { id: "b", body: "It is food safe because glossy glazes are automatically durable." },
                { id: "c", body: "It is food safe because cone 6 is hot enough to neutralize all colorant risks." },
                { id: "d", body: "It is unsafe for all uses because any colorant makes a glaze poisonous." }
              ],
              answer: "a",
              explanation: "Visual quality and fit evidence are not the same as leach testing or durable-use evidence. The plan must keep exterior, decorative, liner, and food-contact claims separate.",
              tags: ["food-safety", "safe-testing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "target-formula-boundary",
              prompt: "A calculated glaze formula falls inside a published cone 6 limit range. What conclusion is justified?",
              choices: [
                { id: "a", body: "The formula may be a useful guide for further testing, but it does not certify fit, durability, or food-contact safety." },
                { id: "b", body: "The glaze is certified food safe if fired in any electric kiln." },
                { id: "c", body: "The glaze will fit every cone 6 clay body." },
                { id: "d", body: "The fired result no longer needs visual inspection." }
              ],
              answer: "a",
              explanation: "Target formulas are maps, not guarantees. Clay body, firing, application, materials, and leach behavior still need evidence.",
              tags: ["recipe-chemistry", "food-safety", "fit"],
              difficulty: "hard"
            }
          ]
        })
      ]
    })
  ]
});
