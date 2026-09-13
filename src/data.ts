import { CocoaVariety, BeanToBarStep, QuizQuestion } from "./types";

export const COCOA_VARIETIES: CocoaVariety[] = [
  {
    name: "Criollo",
    origin: "Venezuela, Madagascar, Central America, India (micro-lots)",
    flavorProfile: "Mild, delicate, with complex fruity, nutty, and floral secondary notes.",
    acidity: "Low to Moderate",
    bitterness: "Very Low",
    rarity: "Extremely Rare (< 3% of global production)",
    roastRecommendation: "Gentle / Light Roast (115°C - 120°C for 15-20 mins) to preserve volatile aromatics.",
    description: "Often called the 'prince of cocoa'. Criollo beans have white to pale pink cotyledons. Because they lack bitter tannins, they produce chocolate with an incredibly smooth, sophisticated flavor, but the tree is fragile and highly susceptible to pests.",
    indianContext: "Criollo is extremely rare and fragile to cultivate in India's monsoon zones. However, ultra-premium, single-estate micro-lots of Criollo are cultivated by specialized planters in the Western Ghats (primarily in shade-heavy pockets of Idukki and Wayanad, Kerala) for high-end limited-edition single-origin bars.",
  },
  {
    name: "Forastero",
    origin: "West Africa (Ivory Coast, Ghana), Brazil, India (Andhra Pradesh, Tamil Nadu, Karnataka)",
    flavorProfile: "Robust, deeply chocolatey, earthy, and bold with standard tannic qualities.",
    acidity: "Moderate",
    bitterness: "Moderate to High",
    rarity: "Extremely Common (~80-85% of global production)",
    roastRecommendation: "Medium-Dark Roast (130°C - 135°C for 25-30 mins) to develop deep chocolate notes and drive off harsh acidity.",
    description: "The workhorse of industrial chocolate. Forastero has dark purple cotyledons, reflecting high anthocyanin (tannin) content. It is extremely disease-resistant and produces high yields, providing the classic, intense 'chocolate' base flavor.",
    indianContext: "Forastero is the foundation of Indian cocoa farming, accounting for over 80% of regional production. It was introduced through the West African Amelonado variety. Sturdy, high-yielding clones such as VTLCC-1 (developed by CPCRI) thrive in the irrigated coconut and oil palm plantations of Andhra Pradesh and Tamil Nadu, producing fat, high-fat content seeds with a rich, mellow cocoa base.",
  },
  {
    name: "Trinitario",
    origin: "Trinidad, Madagascar, Vietnam, Colombia, India (Kerala, Karnataka)",
    flavorProfile: "Rich cocoa base combined with highly expressive fruity, spicy, and acidic undertones.",
    acidity: "Moderate to High",
    bitterness: "Low to Moderate",
    rarity: "Premium Fine Flavor (~10-12% of global production)",
    roastRecommendation: "Medium Roast (120°C - 125°C for 20-25 mins) to balance the intense fruit notes with chocolatey depth.",
    description: "A natural hybrid of Criollo and Forastero created in Trinidad after a hurricane decimated the original Criollo crops. It combines the hardiness of Forastero with the delicate flavor characteristics and complexity of Criollo.",
    indianContext: "Trinitario is the darling of Indian single-origin bean-to-bar craft chocolatiers. The Central Plantation Crops Research Institute (CPCRI) has bred outstanding hybrids like VTLCH-1, VTLCH-2, VTLCH-3, and VTLCH-4. When grown under areca nut, nutmeg, and black pepper vine shade in the rich volcanic red soil of Karnataka and hilly slopes of Kerala, these beans develop amazing signatures of dark raisins, warm cardamom, and bright berry acidity.",
  },
  {
    name: "Nacional (Arriba)",
    origin: "Ecuador (Guayas Basin)",
    flavorProfile: "Exquisite floral aromas (jasmine, orange blossom) paired with black tea and spicy undertones.",
    acidity: "Low",
    bitterness: "Low",
    rarity: "Rare / Highly Prized (~1-2% of global production)",
    roastRecommendation: "Light Roast (110°C - 118°C for 12-18 mins) to protect the hyper-delicate floral terpene aromatics.",
    description: "An ancient, genetically distinct lineage unique to Ecuador. Known for its 'Arriba' floral aroma, Nacional beans produce a highly aromatic, smooth chocolate with minimal bitterness. It is deeply coveted by artisanal chocolatiers.",
    indianContext: "Nacional is an ancient variety endemic to Ecuador's specific river-valley microclimate. Due to strict geographical constraints, local conservation of this gene pool, and specific terroir dependencies, Nacional cocoa is not commercially cultivated in India.",
  },
];

export const BEAN_TO_BAR_STEPS: BeanToBarStep[] = [
  {
    title: "1. Sorting & Cleaning",
    duration: "Manual or Magnetic Sieve",
    target: "100% pure cocoa beans",
    description: "Inspecting raw fermented, dried cocoa beans to remove double-beans, flat beans, twigs, stones, and dust. Foreign particles can ruin expensive machinery and compromise flavor.",
    keyAspects: [
      "Remove double beans (inner core might trap moisture and mold)",
      "Discard flat beans with zero cotyledon mass",
      "Remove twigs, stones, and burlap bag fibers",
    ],
    scienceNote: "Raw beans contain between 6-8% moisture content when shipped. Removing damaged beans prevents off-flavors (mold, vinegar) from corrupting the batch.",
  },
  {
    title: "2. Roasting",
    duration: "15 to 30 minutes",
    temp: "110°C to 140°C",
    target: "Kills pathogens & develops Maillard flavors",
    description: "The critical thermal step where flavor precursors (amino acids and reducing sugars) formed during fermentation react to create the complex chocolate flavor profile. It also sterilizes the bean and loosens the outer husk for winnowing.",
    keyAspects: [
      "Maillard reaction creates hundreds of volatile aroma compounds",
      "Evaporates residual volatile acetic and lactic acids from fermentation",
      "Thermal expansion cracks the crisp shell away from the internal nib",
    ],
    scienceNote: "Slowing down the roasting profile allows low-molecular-weight acids to escape, reducing harsh vinegar notes. High heat develops smoky, roasted coffee-like notes.",
  },
  {
    title: "3. Cracking & Winnowing",
    duration: "Mechanical Cracker + Air Suction",
    target: "Husks < 1.5% by weight (FDA regulation)",
    description: "Cracking the roasted beans into smaller pieces, then using air classification (suction) to blow away the light, fibrous paper-thin husks, leaving behind the heavy, nutrient-dense chocolate nibs.",
    keyAspects: [
      "Nibs are ~50-55% fat (cocoa butter), highly valuable",
      "Husks have zero fat, taste extremely bitter, and damage grinders",
      "High suction must be calibrated to avoid wasting small nib fractions",
    ],
    scienceNote: "Husks are high in silica and indigestible fiber. Failure to winnow properly results in sandy, gritty chocolate and a bitter, woody aftertaste.",
  },
  {
    title: "4. Melanging & Grinding",
    duration: "12 to 24 hours",
    temp: "45°C - 55°C",
    target: "Particle size < 20 microns",
    description: "Coarsely crushed nibs are fed into a stone melanger. The friction generates heat, melting the cocoa butter inside the nibs (which are 50% fat) and turning the solid nibs into a flowing liquid called cocoa liquor. Heavy granite rollers refine the particles over hours.",
    keyAspects: [
      "Solid cocoa and sugar particles are crushed smaller and smaller",
      "Human mouth cannot detect grittiness if particle size is below 20 microns",
      "Sugar is added gradually once the liquor is smooth and flowing",
    ],
    scienceNote: "Cocoa butter (fat) coats the tiny sugar and cocoa solids. Over-grinding below 15 microns dramatically increases viscosity (due to increased surface area), making the chocolate thick and pasty.",
  },
  {
    title: "5. Conching",
    duration: "6 to 48 hours",
    temp: "55°C to 80°C",
    target: "Flavor aeration and chemical smoothing",
    description: "A high-friction, heated aeration process. Continuous agitation in the presence of warm air drives off remaining foul-smelling volatile acids (like acetic acid) and moisture (reducing it to < 1%), while smoothing out the sharp edges of sugar crystals.",
    keyAspects: [
      "Reduces moisture to prevent sugar clumping and high viscosity",
      "Evaporates volatile compounds like ethyl acetate and vinegar aromatics",
      "Distributes cocoa butter evenly to coat every single solid particle",
    ],
    scienceNote: "Water is the enemy of chocolate. Even 1.5% moisture in chocolate causes severe viscosity spikes and clumping because water dissolves sugar, creating sticky syrup droplets that resist flowing in fat.",
  },
  {
    title: "6. Tempering",
    duration: "15 to 30 minutes",
    temp: "Heating, cooling, and minor reheating profiles",
    target: "Form V (Beta 5) crystalline structure",
    description: "The meticulous process of controlling the temperature of molten chocolate to align the fatty acid chains of cocoa butter into the most stable, tightly packed crystal form (Form V). This gives chocolate a glossy shine, a crisp snap, and heat stability.",
    keyAspects: [
      "Cocoa butter fat is polymorphic (6 different crystal structures, Form I to VI)",
      "Form V (Beta 5) melts at 33.8°C, perfect for mouthfeel and snap",
      "Requires melting all crystals, cooling to seed Form IV and V, then reheating to melt Form IV",
    ],
    scienceNote: "Without tempering, chocolate cools into a dull, grey, soft mass that melts on contact with fingers, caused by unstable crystals (Forms I through IV) morphing into Form VI over time, causing fat bloom.",
  },
  {
    title: "7. Molding & Aging",
    duration: "Cooling tunnel (10-15 mins) + 2 weeks cure",
    temp: "10°C - 15°C cooling, 18°C storage",
    target: "Shrinkage and final crystallization",
    description: "Tempered chocolate is poured into polycarbonate molds, vibrated intensely to remove air bubbles, and passed through a cooling chamber. As stable Form V crystals pack together, they shrink, allowing the bar to easily pop out of the mold.",
    keyAspects: [
      "Vibration eliminates trapped micro-bubbles for a clean surface",
      "Contraction during crystallization lets chocolate easily release from mold",
      "Artisanal chocolate develops richer secondary notes after curing for 2 weeks",
    ],
    scienceNote: "Polycarbonate molds are preferred because they have high thermal conductivity and mirror-like surfaces, transfering their smooth finish directly to the cooling chocolate.",
  },
];

export const PANNING_STEPS = [
  {
    stage: "Stage 1: Nut Preparation & Roasting",
    title: "Nut Conditioning",
    description: "Nibs or whole nuts (hazelnuts, almonds, macadamias) must be roasted perfectly to remove moisture, develop crispness, and sterilize. They must then be cooled to room temperature (20°C - 22°C) before panning.",
    science: "Warm nuts will melt the incoming chocolate spray, causing clumping, while damp nuts will trigger moisture-seizure in the chocolate.",
  },
  {
    stage: "Stage 2: Pre-coating / Sealing",
    title: "The Gum Barrier",
    description: "A thin protective barrier is applied to the rotating nuts in the pan, typically using a mixture of Gum Arabic and sugar syrup. This layer is dried thoroughly using warm air.",
    science: "Nuts contain highly mobile oils. The gum arabic barrier prevents these nut oils from migrating outwards into the chocolate shell over time, which would otherwise soften the chocolate and cause rapid fat bloom.",
  },
  {
    stage: "Stage 3: Chocolate Layering (Building)",
    title: "Progressive Coating",
    description: "With the panning drum revolving, tempered chocolate (usually held at 31.5°C) is poured or sprayed in thin, sequential additions. Cold air (13°C - 15°C) is blown directly into the pan to solidify each chocolate layer before the next addition.",
    science: "Centrifugal force and tumbling friction distribute the chocolate perfectly evenly across the spherical surfaces of the tumbling nuts. Continuous tumbling keeps them separated as the fat crystallizes.",
  },
  {
    stage: "Stage 4: Smoothing & Shaping",
    title: "Friction Polish Preparation",
    description: "Once the desired chocolate-to-nut weight ratio is reached (typically 65% chocolate, 35% nut), the cold air is turned off, and the pan continues to rotate. The friction of the chocolates rubbing against each other smooths down ridges.",
    science: "Friction heat melts the microscopic outer peaks of chocolate, distributing them into the troughs, preparing a flawless, micro-smooth surface for the final glaze.",
  },
  {
    stage: "Stage 5: Polishing & Glazing",
    title: "The Brilliant Shine",
    description: "Polishing agents (such as food-grade shellac, carnauba wax, or specialized dextrin-based syrups) are applied in minute quantities. The pan rotates with gentle air until a high, glossy luster is achieved.",
    science: "Polishing agents align flat light-reflective microscopic platelets on the surface. This protective shell seals the chocolate against humidity and fingerprints.",
  },
];

export const TROUBLESHOOTING_GUIDE = [
  {
    defect: "Fat Bloom",
    symptom: "Grey-white, dusty or marbled streaks on the surface. Chocolate feels soft and chalky.",
    cause: "Poor tempering, cooling chocolate too slowly, or exposing finished bars to high ambient temperatures (above 24°C). This allows fat to melt and migrate to the surface, recrystallizing into large, unstable Form VI structures.",
    solution: "Melt down the chocolate, re-temper carefully, ensuring accurate temperature curves and solid Beta V seeding. Store finished chocolate strictly between 16°C and 18°C with stable humidity.",
  },
  {
    defect: "Sugar Bloom",
    symptom: "Rough, dull, white spots on the surface. Unlike fat bloom, this does not melt when touched with a warm finger, and feels sandy.",
    cause: "Moisture condensation on the chocolate (the 'dew point' effect, often caused by taking cold chocolate out of a refrigerator directly into a warm room). Water dissolves the surface sugar; when it evaporates, it leaves behind rough sugar crystals.",
    solution: "Never refrigerate chocolate unless wrapped airtight. If cooled, allow it to warm up fully to room temperature inside its sealed packaging before opening. Keep relative humidity below 50% in your workspace.",
  },
  {
    defect: "Chocolate Seizing",
    symptom: "Molten chocolate suddenly transforms from a smooth, flowing liquid into a stiff, thick, clay-like paste that cannot be poured.",
    cause: "A tiny amount of water (even a single droplet) got into the melting chocolate. The water dissolves sugar into a sticky syrup, which acts as a powerful adhesive, binding the dry cocoa and sugar particles together so they can no longer slide past each other.",
    solution: "Ensure all bowls, spatulas, and molds are 100% dry. Avoid water baths (double boilers) that emit rising steam. To fix seized chocolate, you must add more fat (cocoa butter or oil) or add a large amount of hot water (turning it into a ganache, but it can no longer be tempered into a hard bar).",
  },
  {
    defect: "Thick Viscosity in Melanger",
    symptom: "Chocolate liquor is smooth but moves extremely slowly, forming a pasty mass that the granite rollers cannot circulate properly.",
    cause: "Particle size has been ground too small (under 12 microns), vastly increasing total surface area requiring fat coating; OR moisture content is too high; OR cocoa butter fat percentage is too low.",
    solution: "Add pure melted cocoa butter (usually 1-3% of batch weight) or liquid soy/sunflower lecithin (0.1-0.3%). Lecithin coats sugar particles, dramatically reducing friction and lowering viscosity without needing excessive fat.",
  },
  {
    defect: "Panning: Coated Nuts Clumping",
    symptom: "Nuts stick together, forming large, irregular multi-nut clusters in the revolving pan instead of individual coated spheres.",
    cause: "Chocolate was added too rapidly, or cold air supply was insufficient, causing the chocolate to stay wet and sticky for too long while nuts tumbled together.",
    solution: "Slow down your pouring speed. Add chocolate in very small, measured portions. Ensure the cold air blowing into the pan is between 12°C and 15°C to quickly freeze the chocolate layer. Use a separator paddle if necessary.",
  },
  {
    defect: "Panning: Dull, Non-Glossy Finish",
    symptom: "Finished panned nuts look matte, greyish, or cloudy even after applying polishing glazes.",
    cause: "The chocolate shell was not smoothed properly before applying the glaze; OR there was excess moisture in the panning room; OR glaze was applied when the chocolate was still too cold.",
    solution: "Rotate the pan for 15-20 minutes without air to smooth the chocolate via friction before adding glaze. Ensure room humidity is under 45%. Apply glaze at ambient room temperature (20-22°C) and dry slowly with gentle air.",
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which crystalline form of cocoa butter is the highly desired 'stable' structure that gives tempered chocolate its glossy shine, sharp snap, and clean mold release?",
    options: [
      "Form IV (Beta Prime)",
      "Form V (Beta)",
      "Form VI (Super-Beta)",
      "Form II (Alpha)"
    ],
    correctIndex: 1,
    explanation: "Form V (Beta) crystals are the Holy Grail of chocolate tempering. They have a melting point of ~33.8°C (just below human body temperature), giving chocolate a crisp snap at room temperature and a smooth melt-in-the-mouth feel. Form IV melts too low (soft chocolate), and Form VI only forms after long storage and makes chocolate dull and bloom-covered.",
  },
  {
    id: 2,
    question: "What is the primary physical function of conching in the bean-to-bar process?",
    options: [
      "To mechanically smash cocoa shells and separate them from internal nibs using high-velocity air.",
      "To heat and aerate the chocolate mass to evaporate bitter volatile acids (like acetic acid) and moisture, while rounding the edges of sugar particles.",
      "To mold chocolate bars and force them to shrink so they release from polycarbonate plates.",
      "To hydrolyze starches into simple sugars so that bitter Forastero beans taste sweeter."
    ],
    correctIndex: 1,
    explanation: "Conching is a thermal-mechanical aeration process. It heats the chocolate (often 55°C - 80°C) and continuously shears it. This evaporates unpleasant volatile acids (remnants of bean fermentation, like vinegar-like acetic acid) and moisture (reducing it below 1%), while smoothing out the sharp microscopic edges of sugar crystals, giving the chocolate a velvety texture and refined aroma.",
  },
  {
    id: 3,
    question: "During panning (making coated nuts), why must the nuts be pre-coated/sealed with a Gum Arabic barrier before applying chocolate?",
    options: [
      "To make the chocolate stick better to the slippery outer nut shells.",
      "To seal in moisture so the nuts stay soft and chewy inside the hard chocolate.",
      "To prevent natural nut oils from migrating outwards, which would soften the chocolate shell and cause fat bloom.",
      "To act as an artificial sweetener so you can reduce the amount of sugar in the chocolate batch."
    ],
    correctIndex: 2,
    explanation: "Nuts (especially hazelnuts, peanuts, and almonds) contain liquid oils. If chocolate is applied directly, these oils migrate through the solid chocolate crystal matrix to the surface, disrupting the cocoa butter crystals. This leads to a softened, sticky chocolate shell and rapid onset of greyish fat bloom. The water-soluble Gum Arabic barrier is oil-impenetrable, blocking this migration.",
  },
  {
    id: 4,
    question: "Why is water considered the absolute 'enemy' of molten chocolate during the melting or grinding stage?",
    options: [
      "Water triggers a rapid fermentation of sugars, making the chocolate taste sour and alcoholic.",
      "A tiny drop of water dissolves sugar crystals into micro-syrup droplets, which act as glue and bind cocoa/sugar solids together, causing the chocolate to 'seize' into a thick, unworkable paste.",
      "Water evaporates and rusts the stainless steel granite-stone rollers of the melanger within minutes.",
      "Water alters the chemical formula of cocoa butter, permanently transforming it into dairy fat."
    ],
    correctIndex: 1,
    explanation: "Seizure is a physical phenomenon. Chocolate is a suspension of tiny dry sugar and cocoa solids in fat (cocoa butter). Since fat and water don't mix, a tiny amount of water dissolves some sugar, creating highly sticky syrup droplets. These sticky droplets bond the dry particles together, increasing friction instantly and seizing the liquid chocolate into a thick paste.",
  },
  {
    id: 5,
    question: "If a chocolate batch is extremely thick and pasty in the stone melanger, which additive can be used in tiny quantities (0.1% to 0.3%) to dramatically lower viscosity?",
    options: [
      "Pure water",
      "Liquid Lecithin (Soy or Sunflower)",
      "Powdered sugar",
      "Vanilla extract"
    ],
    correctIndex: 1,
    explanation: "Lecithin is an emulsifier (phospholipid) with both hydrophilic (water-attracting) and lipophilic (fat-attracting) ends. It coats the hydrophilic sugar particles, orienting its fat-loving tails outward. This allows sugar particles to slide past each other in the cocoa butter matrix with minimal friction, reducing viscosity drastically without needing to add expensive extra fat.",
  },
  {
    id: 6,
    question: "Which bean variety is known as the rare 'prince of cocoa', accounting for less than 3% of global output, and famed for light-colored cotyledons and low bitterness?",
    options: [
      "Forastero",
      "Trinitario",
      "Criollo",
      "Nacional (Arriba)"
    ],
    correctIndex: 2,
    explanation: "Criollo is the rarest and most delicate cocoa variety. It lacks the purple pigment (anthocyanins) found in Forastero, resulting in white cotyledons. Criollo beans have very low bitterness and astrigency, yielding complex chocolate with notes of honey, nuts, and red fruits, but they are fragile to grow.",
  },
  {
    id: 7,
    question: "In chocolate tempering, what is the typical correct working temperature range for dark chocolate during the final mold-pouring phase?",
    options: [
      "31°C - 32°C",
      "27°C - 28°C",
      "45°C - 50°C",
      "35°C - 36°C"
    ],
    correctIndex: 0,
    explanation: "The dark chocolate tempering curve is: Melt at 45-50°C to destroy all existing crystal nuclei, cool to 27-28°C to trigger formation of Form IV and Form V seeds, then reheat to 31-32°C. Reheating to 31-32°C melts away the unstable Form IV crystals (melting point ~27°C) while keeping the stable Form V crystals (melting point ~33.8°C) intact and ready to grow.",
  },
  {
    id: 8,
    question: "What is the recommended ratio of chocolate shell to nut center by weight in professional chocolate panning?",
    options: [
      "10% chocolate, 90% nut",
      "35% chocolate, 65% nut",
      "60% to 70% chocolate, 30% to 40% nut",
      "95% chocolate, 5% nut"
    ],
    correctIndex: 2,
    explanation: "To achieve a satisfying bite, crunchy texture, and standard thickness, professional panned nuts target 60-70% chocolate shell and 30-40% nut core by weight. A ratio of 2:1 or 3:1 chocolate-to-nut weight ensures a beautiful round sphere and complete coverage.",
  },
  {
    id: 9,
    question: "What defect causes chocolate to feel sandy on the tongue and display rough white spots that DO NOT melt when touched with a warm finger?",
    options: [
      "Fat Bloom",
      "Sugar Bloom",
      "Moisture Seizure",
      "Polymorphism Failure"
    ],
    correctIndex: 1,
    explanation: "Sugar bloom is caused by condensation (moisture) on the chocolate surface. The moisture dissolves the sugar. When it evaporates, it leaves behind coarse, crystalline sugar deposits. Because sugar has a very high melting point, it will not melt on your skin, resulting in a gritty, sand-like texture.",
  },
  {
    id: 10,
    question: "During roasting, which chemical process is responsible for producing the rich, complex chocolate aromas from fermentation precursors?",
    options: [
      "Lipid oxidation",
      "Saponification",
      "The Maillard reaction",
      "Sugar crystallization"
    ],
    correctIndex: 2,
    explanation: "The Maillard reaction is a chemical reaction between amino acids and reducing sugars under heat. It is the same reaction that browns meat, bakes bread, and roasts coffee, producing hundreds of new heterocyclic compounds that give chocolate its deeply satisfying roasted, nutty, and malty aromas.",
  }
];
