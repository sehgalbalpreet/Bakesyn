import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Sparkles,
  Info,
  Shield,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Wrench,
  Utensils,
  ChevronRight,
  TrendingUp,
  Plus,
  Trash2,
  Save,
  Brain,
  FolderHeart,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy } from "firebase/firestore";

interface Recipe {
  id: string;
  name: string;
  subtitle: string;
  shelfLife: string;
  targetAw: number;
  targetPh: number;
  barriers: string[];
  equipment: string[];
  temperatures: {
    stage: string;
    value: string;
    explanation: string;
  }[];
  ingredients: {
    name: string;
    weight: number; // in grams
    purpose: string;
  }[];
  method: string[];
  scienceSecret: string;
}

const FAVORITE_RECIPES: Recipe[] = [
  {
    id: "classic-ganache",
    name: "Classic Silk Dark Chocolate Ganache",
    subtitle: "The gold standard of confectionery emulsions, balanced for high stability",
    shelfLife: "3 Months (Refrigerated or Dark Cool Cupboard)",
    targetAw: 0.84,
    targetPh: 5.4,
    barriers: [
      "Low Water Activity (Trimoline water-binding)",
      "Emulsification integrity (Immersion-blended fat-in-water suspension)",
      "Cocoa polyphenols (Natural antioxidants)",
    ],
    equipment: [
      "High-shear immersion blender (essential for particle reduction)",
      "Digital probe thermometer (accuracy to 0.1°C)",
      "Heavy-bottomed saucepan",
      "Disposable piping bags",
      "Digital precision kitchen scale (0.1g resolution)",
    ],
    temperatures: [
      { stage: "Cream Boiling", value: "100°C", explanation: "Sterilizes the liquid dairy, destroys active spores, and dissolves crystalline sugars." },
      { stage: "Chocolate Melting", value: "45°C", explanation: "Melts all pre-existing cocoa butter crystal structures to prepare for fresh suspension." },
      { stage: "Emulsification Window", value: "35°C - 40°C", explanation: "Perfect temperature range to shear fats without destroying cream proteins. Prevents fat separation." },
      { stage: "Shell Piping Temp", value: "28°C - 30°C", explanation: "Critical limit. If piped above 31°C, the ganache will melt your tempered chocolate shells, causing pinhole leaks." },
    ],
    ingredients: [
      { name: "54% Couverture Dark Chocolate (callets)", weight: 450, purpose: "Structure, cocoa fat solids, and rich cocoa solids" },
      { name: "35% Fat Fresh Dairy Whipping Cream", weight: 350, purpose: "Liquid phase and fat suspension medium" },
      { name: "Trimoline (Invert Sugar)", weight: 100, purpose: "High-efficacy humectant. Binds free water, lowering Water Activity (a_w)" },
      { name: "Unsalted Butter (softened at room temp)", weight: 80, purpose: "Provides velvet melt-in-the-mouth feel and additional solid fats" },
      { name: "Sorbitol Powder (Optional)", weight: 20, purpose: "Crystalline polyol that further reduces water activity" },
    ],
    method: [
      "Weigh all ingredients precisely. Chop chocolate if using block form and place in a tall, narrow plastic beaker.",
      "In a heavy saucepan, bring the heavy cream and Trimoline to a full rolling boil (100°C). Pour over the melted/chopped chocolate.",
      "Let the mixture rest untouched for 60 seconds to allow the chocolate callets to absorb the heat evenly.",
      "Insert the immersion blender fully, tapping it against the bottom of the beaker to release trapped air bubbles. Blend on medium speed, keeping the blade submerged to avoid whipping air into the ganache.",
      "Once a shiny elastic core begins to form (emulsion center), slowly introduce the softened unsalted butter pieces while continuing to blend.",
      "Monitor the temperature. Once the ganache drops to exactly 29°C, transfer it into a piping bag and pipe immediately into pre-cast chocolate shells. Allow to crystallize for 24 hours at 16°C-18°C before sealing.",
    ],
    scienceSecret: "Invert sugar is 20% more hygroscopic than sucrose. Its glucose and fructose molecules actively lock onto free water molecules, preventing mold and wild yeast from utilizing that water to reproduce.",
  },
  {
    id: "salted-caramel",
    name: "Fleur de Sel Confectionery Caramel",
    subtitle: "A smooth, non-crystallizing fluid caramel engineered for long ambient storage",
    shelfLife: "6 Months (Ambient Room Temperature)",
    targetAw: 0.78,
    targetPh: 5.1,
    barriers: [
      "Ultra-high osmotic pressure (high dissolved sugar solids concentration)",
      "High thermal exposure during sugar boiling",
      "Low water-bearing ingredient content",
    ],
    equipment: [
      "Deep copper or stainless steel pan (for hot caramel boiling)",
      "High-temperature digital probe thermometer (up to 200°C)",
      "Silicone spatula (heat-resistant up to 250°C)",
      "Hand immersion blender",
    ],
    temperatures: [
      { stage: "Dry Sugar Caramelization", value: "170°C - 180°C", explanation: "Creates complex melanoidins, caramelan compounds, and intense browned flavor." },
      { stage: "De-glazing Cream", value: "105°C", explanation: "Cream is added slowly to avoid violent boiling, driving off excess water vapor." },
      { stage: "Final Cooking Temp", value: "112°C - 115°C", explanation: "Defines the final moisture content. Cooking to 115°C ensures water content is low enough to prevent spoilage." },
      { stage: "Piping Temp", value: "26°C - 28°C", explanation: "Piped cool to protect chocolate shells and prevent expansion/retraction issues." },
    ],
    ingredients: [
      { name: "White Granulated Caster Sugar", weight: 380, purpose: "Base structure and caramelization solids" },
      { name: "35% Fat Whipping Cream (heated)", weight: 320, purpose: "Liquid fat phase and dairy proteins" },
      { name: "Glucose Syrup (40 DE)", weight: 180, purpose: "Prevents recrystallization of sucrose and lowers water activity" },
      { name: "Unsalted Butter (diced)", weight: 110, purpose: "Richness and texture control" },
      { name: "Fleur de Sel (Flaky Sea Salt)", weight: 8, purpose: "Flavor enhancement and shelf stability boost" },
      { name: "Pure Vanilla Extract", weight: 2, purpose: "Premium natural aromatics" },
    ],
    method: [
      "In a deep saucepan, combine sugar and glucose syrup. Cook over medium-high heat without stirring, gently swirling the pan as the sugar melts.",
      "Heat the cream separately in another pot until simmering. Do not boil it off.",
      "Once the sugar caramelizes to a deep, warm amber color (approximately 175°C), immediately remove from heat.",
      "Slowly pour the warm cream into the hot sugar in stages. The mixture will steam and bubble vigorously. Stir constantly with a heat-resistant spatula.",
      "Return the pan to the stove and cook the caramel until the temperature reaches exactly 112°C. This boils out exact quantities of excess moisture.",
      "Remove from heat, let cool to 70°C, then stir in the sea salt and diced butter. Blend with an immersion blender for 2 minutes to homogenize the fat.",
      "Allow to cool to 27°C before piping into pre-cast chocolate shells.",
    ],
    scienceSecret: "At 112°C, the water-to-sugar ratio is tightly optimized. The remaining water molecules are completely surrounded by dissolved sugars, leaving zero 'free water' for bacterial transport.",
  },
  {
    id: "raspberry-gel",
    name: "Soft Raspberry Acid Fruit Gel",
    subtitle: "A vibrant, zesty fruit layer that utilizes high acidity and pectin cross-linking",
    shelfLife: "12 Months (Hygienically sealed in dark shells)",
    targetAw: 0.74,
    targetPh: 3.3,
    barriers: [
      "Ultra-low pH (highly inhospitable to pathogenic bacteria)",
      "High solids content (Pectin gelation locks free moisture)",
      "Citric acid activation barrier",
    ],
    equipment: [
      "Digital pocket pH meter (calibrated)",
      "Heavy-bottomed boiling pan",
      "Piping bags",
      "Whisk and silicone scraper",
    ],
    temperatures: [
      { stage: "Purée Warm-up", value: "40°C", explanation: "Optimal temperature to whisk in pectin-sugar mixtures without creating lumps." },
      { stage: "Pectin Activation Boil", value: "103°C", explanation: "Boils off excess water and fully hydrates the pectin chain molecules." },
      { stage: "Piping Temp", value: "30°C - 35°C", explanation: "Must be piped before it cools below 30°C and starts setting/gelating inside the bag." },
    ],
    ingredients: [
      { name: "Seedless Raspberry Fruit Purée", weight: 400, purpose: "Vibrant flavor, color, natural citric acid" },
      { name: "Caster Sugar (divided)", weight: 350, purpose: "Solids builder and water binder" },
      { name: "Glucose Syrup (43 DE)", weight: 150, purpose: "Anti-crystallization and water activity reducer" },
      { name: "Yellow Apple Pectin (Slow-set)", weight: 12, purpose: "Structural gelling agent" },
      { name: "Citric Acid Solution (50% water/acid ratio)", weight: 8, purpose: "Drops pH to activate pectin and inhibit microbial life" },
    ],
    method: [
      "Premix 50g of the caster sugar with the yellow pectin powder in a small dry bowl to prevent clumping.",
      "In a saucepan, heat the raspberry purée to 40°C. Whisk in the sugar-pectin mixture slowly.",
      "Bring the purée to a boil. Once boiling, add the remaining 300g of sugar and glucose syrup.",
      "Boil the mixture vigorously, stirring constantly, until it reaches exactly 103°C on a digital thermometer (refractometer target: 62° Brix).",
      "Remove from heat. Immediately stir in the citric acid solution. The pH will drop instantly to ~3.3, triggering rapid gelation.",
      "Cool slightly to 35°C, transfer into a piping bag, and pipe immediately as a base layer in molded chocolates. Allow to set for 4 hours.",
    ],
    scienceSecret: "Bacteria like E. coli and Salmonella are completely halted at pH levels below 4.0. The high acidity breaks down microbial cellular membranes, making the gel self-preserving for over a year.",
  },
  {
    id: "hazelnut-gianduja",
    name: "Crispy Hazelnut Gianduja & Feuilletine",
    subtitle: "An exquisite Italian classic completely devoid of water, offering absolute stability",
    shelfLife: "12 Months (Highly stable at room temperature)",
    targetAw: 0.35,
    targetPh: 6.2,
    barriers: [
      "Near-zero moisture content (No water activity)",
      "Cocoa butter solid crystallization structure",
      "Nut oil fat barriers",
    ],
    equipment: [
      "Chocolate tempering machine or marble slab",
      "Food processor (if grinding raw nuts)",
      "Mixing bowls and offset spatula",
    ],
    temperatures: [
      { stage: "Roasting Nuts", value: "150°C", explanation: "Roasts off internal moisture and develops rich, deep nut oils." },
      { stage: "Chocolate Tempered Blend", value: "29°C - 30°C", explanation: "Allows cocoa butter crystals to seed correctly inside the nut fat mixture." },
      { stage: "Setting Room Temp", value: "16°C - 18°C", explanation: "Slow crystallization ensures high contraction and shiny finished chocolate." },
    ],
    ingredients: [
      { name: "Roasted Hazelnut Paste (100% pure)", weight: 350, purpose: "Nut flavor, fat, and fluid texture" },
      { name: "32% Milk Chocolate (tempered)", weight: 350, purpose: "Chocolate base, sweetness, and structure" },
      { name: "Praliné Paste (60% caramelized hazelnut)", weight: 150, purpose: "Caramelized nut base and depth" },
      { name: "Dehydrated Biscuit Flakes (Feuilletine)", weight: 120, purpose: "Addictive crispy texture" },
      { name: "Cocoa Butter (melted)", weight: 30, purpose: "Increases snap and speeds solidification crystallization" },
    ],
    method: [
      "In a clean dry bowl, combine the pure hazelnut paste and the sweet caramelized praliné paste.",
      "Melt and temper the milk chocolate and the extra cocoa butter together to exactly 29.5°C.",
      "Pour the tempered chocolate blend directly into the hazelnut paste. Stir gently with a spatula until fully unified.",
      "Check the temperature. Ensure the mixture is hovering around 28°C-29°C.",
      "Fold in the crispy feuilletine flakes carefully so they do not break down into dust. The moisture-free environment ensures they remain completely crispy.",
      "Pipe or scoop the gianduja mixture into prepared chocolate shells or spread onto a frame to cut into beautiful bonbons. Let set at 16°C.",
    ],
    scienceSecret: "Without water, there is no transport medium for enzymes or microbial cells to undergo metabolic processes. This makes fat-based fillings thermodynamically stable against bacterial spoilage.",
  },
  {
    id: "passion-fruit",
    name: "Zesty Passion Fruit White Ganache",
    subtitle: "A luxurious tropical filling balancing creamy butterfat with sharp, acidic juice solids",
    shelfLife: "3 Months (Store in a cool, dark location)",
    targetAw: 0.83,
    targetPh: 4.2,
    barriers: [
      "Natural fruit fruit-acids (lowering pH to ~4.2)",
      "High sugar solids (White chocolate sucrose + Glucose syrup)",
      "Complete airtight chocolate enrobing",
    ],
    equipment: [
      "Immersion blender (crucial for emulsion crystallization)",
      "Digital probe thermometer",
      "Saucepan",
      "Piping bag",
    ],
    temperatures: [
      { stage: "Passion Fruit Boiling", value: "95°C", explanation: "Concentrates the fruit juice and pasteurizes the active enzymes." },
      { stage: "White Chocolate Melting", value: "40°C", explanation: "White chocolate contains high milk fats which melt at low heat." },
      { stage: "Emulsification blend", value: "34°C - 36°C", explanation: "The sweet spot where cocoa butter begins to form a tight network around fruit liquids." },
      { stage: "Piping limit", value: "27°C - 28°C", explanation: "Protects delicate, thin-walled white chocolate shells from melting." },
    ],
    ingredients: [
      { name: "34% Velvet White Chocolate", weight: 500, purpose: "Cocoa butter fat, milk solids, and base sweetness" },
      { name: "Pure strained Passion Fruit Juice", weight: 220, purpose: "Aromatic acid, tartness, water phase" },
      { name: "Liquid Glucose Syrup (43 DE)", weight: 140, purpose: "Inhibits sugar recrystallization and binds free moisture" },
      { name: "Unsalted Grass-fed Butter (softened)", weight: 110, purpose: "Smoothness and fat emulsion matrix" },
      { name: "Citric Acid Solution (optional)", weight: 3, purpose: "Sharpens acidity and acts as an additional microbial barrier" },
    ],
    method: [
      "Melt the white chocolate callets gently to 40°C in a plastic bowl.",
      "In a saucepan, bring the pure passion fruit juice and liquid glucose syrup to a boil. Let boil for 15 seconds to pasteurize.",
      "Pour the hot juice mixture over the melted white chocolate in three separate additions, stirring vigorously with a rubber spatula in circular motions from the center outwards to create a glossy emulsion.",
      "Once the mixture cools slightly to 40°C, insert the immersion blender and add the soft unsalted butter cubes.",
      "Blend thoroughly until perfectly smooth and uniform. Add the citric acid solution if a sharper bite and lower pH is desired.",
      "Let cool to 28°C, fill into piping bags, and pipe into chocolate shells. Leave to cure for 18 hours.",
    ],
    scienceSecret: "White chocolate has zero natural polyphenols (unlike dark chocolate) to act as natural preservatives. Thus, we utilize passion fruit's high concentration of natural citric acid to lower pH and block microbial reproduction.",
  },
];

const PRESET_INGREDIENTS = [
  { name: "35% Fat Whipping Cream", category: "water_bearing", purpose: "Liquid phase & fat suspension medium" },
  { name: "Trimoline (Invert Sugar)", category: "sugar_humectant", purpose: "Strong humectant. Binds free water, lowering Aw" },
  { name: "Glucose Syrup (43 DE)", category: "sugar_humectant", purpose: "Inhibits sugar recrystallization" },
  { name: "White Caster Sugar", category: "sugar_humectant", purpose: "Dissolved solids and base sweetness" },
  { name: "Sorbitol Powder", category: "sugar_humectant", purpose: "Active polyol water-binder" },
  { name: "54% Couverture Dark Chocolate", category: "solid_fat_cocoa", purpose: "Structure, cocoa fats, and chocolate solids" },
  { name: "34% Velvet White Chocolate", category: "solid_fat_cocoa", purpose: "Milk fat solids and structure" },
  { name: "Unsalted Butter (Softened)", category: "solid_fat_cocoa", purpose: "Provides velvet mouthfeel & solid fats" },
  { name: "Pure Cocoa Butter (Melted)", category: "solid_fat_cocoa", purpose: "Speeds up solid crystallization" },
  { name: "Raspberry Fruit Purée", category: "water_bearing", purpose: "Water phase, fruit acids, and flavor" },
  { name: "Citric Acid Solution (50%)", category: "other", purpose: "Drops pH to activate pectin & preserve" },
  { name: "Roasted Hazelnut Paste", category: "solid_fat_cocoa", purpose: "Stable nut fats and hazelnut flavor" },
];

const parseMarkdown = (text: string | null) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, index) => {
    // Heading 3
    if (line.startsWith("### ")) {
      return (
        <h4 key={index} className="text-xs font-black text-amber-900 mt-4 mb-2 uppercase font-mono tracking-wider">
          {line.replace("### ", "")}
        </h4>
      );
    }
    // Heading 2 / 1
    if (line.startsWith("## ") || line.startsWith("# ")) {
      return (
        <h3 key={index} className="text-sm font-black text-gray-950 mt-5 mb-2 border-b border-amber-100 pb-1 font-sans">
          {line.replace(/^(#+\s)/, "")}
        </h3>
      );
    }
    // Bold matches **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let parts = [];
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-extrabold text-gray-950">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    // List item
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <li key={index} className="list-disc list-inside ml-4 text-[11px] text-gray-700 leading-relaxed font-sans py-0.5">
          {parts.length > 0 ? parts : line.replace(/^[-*]\s/, "")}
        </li>
      );
    }

    // Blank line
    if (!line.trim()) {
      return <div key={index} className="h-1.5" />;
    }

    // Normal paragraph
    return (
      <p key={index} className="text-[11px] text-gray-600 leading-relaxed font-sans mb-1">
        {parts.length > 0 ? parts : line}
      </p>
    );
  });
};

export default function RecipeBookModule() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(FAVORITE_RECIPES[0]);

  // Formulation Mode: "sliders" | "ingredients"
  const [formulationMode, setFormulationMode] = useState<"sliders" | "ingredients">("ingredients");

  // Formulation Simulator States
  const [fillingName, setFillingName] = useState<string>("My Craft Ganache");
  const [fillingType, setFillingType] = useState<"ganache" | "caramel" | "fruit_gel" | "fat_based">("ganache");
  const [targetShelfLife, setTargetShelfLife] = useState<"3" | "6" | "12">("3");

  // Custom Ingredients for Batch Builder
  const [customIngredients, setCustomIngredients] = useState<{
    id: string;
    name: string;
    weight: number;
    category: "water_bearing" | "sugar_humectant" | "solid_fat_cocoa" | "other";
    purpose: string;
  }[]>([
    { id: "1", name: "35% Fat Fresh Whipping Cream", weight: 350, category: "water_bearing", purpose: "Liquid phase & fat suspension medium" },
    { id: "2", name: "54% Couverture Dark Chocolate", weight: 450, category: "solid_fat_cocoa", purpose: "Structure and cocoa solids" },
    { id: "3", name: "Trimoline (Invert Sugar)", weight: 100, category: "sugar_humectant", purpose: "Binds free water, lowering Water Activity" },
    { id: "4", name: "Unsalted Butter", weight: 80, category: "solid_fat_cocoa", purpose: "Provides velvet mouthfeel & solid fats" },
  ]);

  // Temporary row state for adding new ingredients
  const [newIngName, setNewIngName] = useState<string>("");
  const [newIngWeight, setNewIngWeight] = useState<number>(100);
  const [newIngCategory, setNewIngCategory] = useState<"water_bearing" | "sugar_humectant" | "solid_fat_cocoa" | "other">("water_bearing");
  const [newIngPurpose, setNewIngPurpose] = useState<string>("");

  // Firestore Saved Recipes State
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // AI Formulation Guide State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Interactive Guided Wizard States
  const [wizardFillingDescription, setWizardFillingDescription] = useState<string>("Banana Filling");
  const [wizardChocolateType, setWizardChocolateType] = useState<string>("White Chocolate");
  const [wizardShelfLife, setWizardShelfLife] = useState<string>("3");
  const [wizardAddAcidSetting, setWizardAddAcidSetting] = useState<string>("let_ai_recommend");
  const [isFormulatingWithAi, setIsFormulatingWithAi] = useState<boolean>(false);
  const [guidedAiFeedback, setGuidedAiFeedback] = useState<string | null>(null);
  const [guidedAiError, setGuidedAiError] = useState<string | null>(null);

  const handleGuidedFormulation = async () => {
    if (!wizardFillingDescription.trim()) {
      setGuidedAiError("Please type what you want to make today (e.g. Banana Filling).");
      return;
    }

    setIsFormulatingWithAi(true);
    setGuidedAiError(null);
    setGuidedAiFeedback(null);

    try {
      const response = await fetch("/api/guided-formulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fillingDescription: wizardFillingDescription,
          chocolateType: wizardChocolateType,
          shelfLife: wizardShelfLife,
          addAcidSetting: wizardAddAcidSetting,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to formulate. Please check if your server is running.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Update the active state in RecipeBookModule with formulated recipe
      setFillingName(wizardFillingDescription);
      setFillingType(data.fillingType || "ganache");
      setTargetShelfLife(data.targetShelfLife || "3");
      setAddAcid(!!data.addAcid);

      if (data.recipe && Array.isArray(data.recipe)) {
        const loadedIngredients = data.recipe.map((ing: any, idx: number) => ({
          id: String(idx + 1),
          name: ing.name,
          weight: ing.weight,
          category: ing.category || "other",
          purpose: ing.purpose || "",
        }));
        setCustomIngredients(loadedIngredients);
      }

      setGuidedAiFeedback(data.explanation);

      setTimeout(() => {
        const el = document.getElementById("guided-ai-formulation-wizard");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      console.error(err);
      setGuidedAiError(err.message || "An unexpected error occurred during formulation.");
    } finally {
      setIsFormulatingWithAi(false);
    }
  };

  // Auth monitoring state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Formulation Component Percentages (Used as fallbacks or when sliders are selected)
  const [waterBearing, setWaterBearing] = useState<number>(30); // cream, milk, fruit juice
  const [sugars, setSugars] = useState<number>(25); // sugar, invert sugar, glucose, sorbitol
  const [fatsSolids, setFatsSolids] = useState<number>(45); // chocolate, cocoa butter, butter, nuts
  const [addAcid, setAddAcid] = useState<boolean>(false); // Citric acid addition toggle

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore recipes
  useEffect(() => {
    if (!currentUser) {
      setSavedRecipes([]);
      return;
    }

    const q = query(
      collection(db, "fillingRecipes"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipesList: any[] = [];
      snapshot.forEach((doc) => {
        recipesList.push({ id: doc.id, ...doc.data() });
      });
      setSavedRecipes(recipesList);
    }, (error) => {
      console.error("Error reading saved recipes:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Derived ingredient compositions
  let activeWaterBearing = waterBearing;
  let activeSugars = sugars;
  let activeFatsSolids = fatsSolids;
  let activeAddAcid = addAcid;

  if (formulationMode === "ingredients") {
    const wWater = customIngredients
      .filter((i) => i.category === "water_bearing")
      .reduce((sum, i) => sum + i.weight, 0);
    const wSugar = customIngredients
      .filter((i) => i.category === "sugar_humectant")
      .reduce((sum, i) => sum + i.weight, 0);
    const wFat = customIngredients
      .filter((i) => i.category === "solid_fat_cocoa")
      .reduce((sum, i) => sum + i.weight, 0);
    const wTotal = wWater + wSugar + wFat;

    if (wTotal > 0) {
      activeWaterBearing = Math.round((wWater / wTotal) * 100);
      activeSugars = Math.round((wSugar / wTotal) * 100);
      activeFatsSolids = Math.round((wFat / wTotal) * 100);
    } else {
      activeWaterBearing = 0;
      activeSugars = 0;
      activeFatsSolids = 0;
    }

    // Toggle activeAddAcid if there is any Citric Acid or other acidic ingredient
    const hasAcid = customIngredients.some(
      (i) => i.name.toLowerCase().includes("acid") || i.purpose.toLowerCase().includes("acid")
    );
    activeAddAcid = hasAcid || addAcid;
  }

  // Calculated food science metrics
  // Pure water activity is 1.0. Sugar-water ratio governs Aw.
  const calculateWaterActivity = (): { aw: number; status: "safe" | "warning" | "danger"; comment: string } => {
    if (fillingType === "fat_based") {
      return {
        aw: 0.35,
        status: "safe",
        comment: "Excellent! Fat-based fillings have near-zero free water. Extremely stable.",
      };
    }

    // Effective free water percentage based on cream, fruit juices
    const effWater = activeWaterBearing * 0.75; // assume water-bearing ingredients are ~75% pure water
    const totalDissolvedSugars = activeSugars;

    if (effWater === 0) {
      return { aw: 0.35, status: "safe", comment: "No water detected! Immune to microbial activity." };
    }

    // Sugar concentration in water phase: S / (S + W)
    const sugarConcentration = totalDissolvedSugars / (totalDissolvedSugars + effWater);
    
    // Base approximation formula
    let calculatedAw = 1.0 - (0.42 * sugarConcentration) - (activeFatsSolids * 0.001);

    // Safeguards
    if (calculatedAw > 0.98) calculatedAw = 0.98;
    if (calculatedAw < 0.65) calculatedAw = 0.65;

    // Determine status based on selected target shelf life
    const roundedAw = Math.round(calculatedAw * 100) / 100;
    
    let status: "safe" | "warning" | "danger" = "safe";
    let comment = "";

    if (targetShelfLife === "12") {
      if (roundedAw <= 0.75) {
        status = "safe";
        comment = "Perfect. Water activity is safe for long-term 12-month storage.";
      } else if (roundedAw <= 0.81) {
        status = "warning";
        comment = "Marginal for 12 months. May develop off-flavors or oil oxidation. Recommend increasing sugar solids.";
      } else {
        status = "danger";
        comment = "High Risk! Active water is too high for 12 months. Yeast/molds will grow. Reduce water-bearing liquids.";
      }
    } else if (targetShelfLife === "6") {
      if (roundedAw <= 0.81) {
        status = "safe";
        comment = "Safe. Free water is sufficiently bound for stable 6-month shelf life.";
      } else if (roundedAw <= 0.86) {
        status = "warning";
        comment = "Slight risk. Mold may develop over 6 months unless perfect enrobing and acidity are maintained.";
      } else {
        status = "danger";
        comment = "Unsafe! High spoilage risk within 6 months. Increase humectants like Trimoline/Glucose.";
      }
    } else {
      // 3 Months
      if (roundedAw <= 0.86) {
        status = "safe";
        comment = "Safe. Water activity complies with standard 3-month preservation limits.";
      } else if (roundedAw <= 0.91) {
        status = "warning";
        comment = "Caution. Spoilage risk exists if kept in warm ambient rooms. Use sorbate or keep refrigerated.";
      } else {
        status = "danger";
        comment = "High Risk. Water activity is too high. Mold will seize the bonbon in weeks.";
      }
    }

    return { aw: roundedAw, status, comment };
  };

  const calculatePh = (): { ph: number; status: "safe" | "neutral" | "danger"; comment: string } => {
    let basePh = 6.2; // default neutral confectionery
    if (fillingType === "fruit_gel") {
      basePh = 3.6;
    } else if (fillingType === "caramel") {
      basePh = 5.6;
    } else if (fillingType === "ganache") {
      basePh = 5.4;
    }

    if (activeAddAcid) {
      basePh -= 1.3; // acid addition drops pH
    }

    const roundedPh = Math.round(basePh * 10) / 10;
    let status: "safe" | "neutral" | "danger" = "neutral";
    let comment = "";

    if (roundedPh <= 4.0) {
      status = "safe";
      comment = "Excellent acidic barrier. Most pathogenic bacteria are completely inactivated here.";
    } else if (roundedPh <= 5.0) {
      status = "neutral";
      comment = "Moderate acidity. Offers a partial hurdle; must be combined with low water activity.";
    } else {
      status = "danger";
      comment = "Low acidity. Highly reliant on low Water Activity (a_w) and fat barriers for shelf safety.";
    }

    return { ph: roundedPh, status, comment };
  };

  const awResult = calculateWaterActivity();
  const phResult = calculatePh();

  const handleSaveRecipe = async () => {
    if (!currentUser) {
      setSaveMessage("Please log in to save your custom formulation!");
      setTimeout(() => setSaveMessage(null), 4000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const recipeId = fillingName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    
    const activeAw = awResult.aw;
    const activePh = phResult.ph;

    const payload = {
      id: recipeId,
      name: fillingName,
      fillingType,
      targetShelfLife,
      waterActivity: activeAw,
      pH: activePh,
      ingredients: formulationMode === "ingredients" 
        ? customIngredients 
        : [
            { name: "Water-Bearing Liquids Group", weight: Math.round(waterBearing * 10), category: "water_bearing", purpose: "Simulated ratio" },
            { name: "Concentrated Sugars Group", weight: Math.round(sugars * 10), category: "sugar_humectant", purpose: "Simulated ratio" },
            { name: "Solid Fats & Cocoa Group", weight: Math.round(fatsSolids * 10), category: "solid_fat_cocoa", purpose: "Simulated ratio" }
          ],
      userId: currentUser.uid,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "fillingRecipes", recipeId), payload);
      setSaveMessage("Formulation saved successfully!");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error("Error saving recipe:", err);
      setSaveMessage("Failed to save formulation.");
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, "fillingRecipes", id));
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  const handleLoadRecipe = (recipe: any) => {
    setFillingName(recipe.name);
    setFillingType(recipe.fillingType);
    setTargetShelfLife(recipe.targetShelfLife);
    
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const hasCategories = recipe.ingredients.some((i: any) => i.category);
      if (hasCategories) {
        setCustomIngredients(recipe.ingredients);
        setFormulationMode("ingredients");
      } else {
        // Fallback
        setFormulationMode("sliders");
        const wWaterObj = recipe.ingredients.find((i: any) => i.name.includes("Water"));
        const wSugarObj = recipe.ingredients.find((i: any) => i.name.includes("Sugar"));
        const wFatObj = recipe.ingredients.find((i: any) => i.name.includes("Fat"));
        if (wWaterObj) setWaterBearing(Math.round(wWaterObj.weight / 10));
        if (wSugarObj) setSugars(Math.round(wSugarObj.weight / 10));
        if (wFatObj) setFatsSolids(Math.round(wFatObj.weight / 10));
      }
    }
    
    const formSection = document.getElementById("formulation-lab-dashboard");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleConsultAiGuide = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiAnalysis(null);

    const activeAw = awResult.aw;
    const activePh = phResult.ph;

    const payload = {
      name: fillingName,
      fillingType,
      targetShelfLife,
      waterActivity: activeAw,
      pH: activePh,
      ingredients: formulationMode === "ingredients" 
        ? customIngredients 
        : [
            { name: "Water-Bearing Liquids Group", weight: Math.round(waterBearing * 10), category: "water_bearing", purpose: "Simulated ratio" },
            { name: "Concentrated Sugars Group", weight: Math.round(sugars * 10), category: "sugar_humectant", purpose: "Simulated ratio" },
            { name: "Solid Fats & Cocoa Group", weight: Math.round(fatsSolids * 10), category: "solid_fat_cocoa", purpose: "Simulated ratio" }
          ],
      addAcid: activeAddAcid
    };

    try {
      const response = await fetch("/api/formulate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      setAiAnalysis(data.text);
    } catch (err: any) {
      console.error("AI formulation guide fetch error:", err);
      setAnalysisError("Could not reach AI guide. Ensure server is online.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngName.trim()) return;
    const newIng = {
      id: Math.random().toString(36).substring(7),
      name: newIngName,
      weight: Number(newIngWeight) || 0,
      category: newIngCategory,
      purpose: newIngPurpose || "Batch structural addition"
    };
    setCustomIngredients([...customIngredients, newIng]);
    setNewIngName("");
    setNewIngWeight(100);
    setNewIngPurpose("");
  };

  const handleSelectPresetIngredient = (preset: any) => {
    setNewIngName(preset.name);
    setNewIngCategory(preset.category as any);
    setNewIngPurpose(preset.purpose);
  };

  const handleRemoveIngredient = (id: string) => {
    setCustomIngredients(customIngredients.filter((i) => i.id !== id));
  };

  const handleNormalizeIngredients = (type: "water" | "sugar" | "fat", value: number) => {
    // Dynamically balance the other two percentages to maintain a perfect 100% total sum
    let currentVal = value;
    if (currentVal < 0) currentVal = 0;
    if (currentVal > 100) currentVal = 100;

    if (type === "water") {
      setWaterBearing(currentVal);
      const remaining = 100 - currentVal;
      // distribute remaining 50/50 or in ratio
      const sumOthers = sugars + fatsSolids || 1;
      setSugars(Math.round((sugars / sumOthers) * remaining));
      setFatsSolids(Math.round((fatsSolids / sumOthers) * remaining));
    } else if (type === "sugar") {
      setSugars(currentVal);
      const remaining = 100 - currentVal;
      const sumOthers = waterBearing + fatsSolids || 1;
      setWaterBearing(Math.round((waterBearing / sumOthers) * remaining));
      setFatsSolids(Math.round((fatsSolids / sumOthers) * remaining));
    } else {
      setFatsSolids(currentVal);
      const remaining = 100 - currentVal;
      const sumOthers = waterBearing + sugars || 1;
      setWaterBearing(Math.round((waterBearing / sumOthers) * remaining));
      setSugars(Math.round((sugars / sumOthers) * remaining));
    }
  };

  return (
    <div className="space-y-8" id="chocolate-recipe-book-section">
      {/* Dynamic Header */}
      <div className="bg-amber-950 text-amber-50 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden" id="recipe-header">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-amber-900 rounded-full opacity-30 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-amber-900/60 text-amber-200 border border-amber-800/40 font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Molecular Confectionery
            </span>
            <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight">
              Chocolate Filling Formulation Lab & Recipe Book
            </h3>
            <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
              Unlock the core chemistry of confectionery physics. Learn how to formulate fillings with safe 
              <strong> Water Activity (a_w)</strong>, <strong>pH levels</strong>, and <strong>Hurdle Barriers</strong> to achieve stable shelf lives up to 12 months ambient.
            </p>
          </div>
          <div className="p-3 bg-amber-900/40 border border-amber-800/30 rounded-2xl flex-shrink-0 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-200" />
            <div className="text-left leading-none">
              <span className="text-[9px] text-amber-300 font-mono block">Curriculum Lab</span>
              <strong className="text-xs font-black text-white block">Active Classroom</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 🧙‍♂️ AI FORMULATION GUIDED WIZARD QUESTIONNAIRE */}
      <div className="bg-gradient-to-br from-violet-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden" id="guided-ai-formulation-wizard">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600 rounded-full opacity-15 blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl translate-y-20 -translate-x-20 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-3 bg-white/10 text-violet-200 rounded-2xl shadow-inner border border-white/10">
              <Brain className="w-6 h-6 animate-pulse text-violet-300" />
            </div>
            <div>
              <span className="text-[10px] bg-violet-500/30 text-violet-200 border border-violet-400/20 font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                Step-by-Step AI Lab Guide
              </span>
              <h4 className="text-base font-black font-sans tracking-tight mt-0.5">
                What do you want to make today?
              </h4>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
              Choose a starter formulation preset below or type a custom filling. Answer a few questions about your chocolate preference and target shelf life, and our AI Food Scientist will formulate a balanced recipe, load it into the Batch Builder below, and guide you through the chemistry of fat and acidity.
            </p>

            {/* Presets / Quick Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-violet-300 font-mono font-bold uppercase tracking-wider block">Starter Ideas:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Banana Filling", desc: "🍌 Fresh Banana Ambient Gel" },
                  { name: "Raspberry Acidic Ganache", desc: "🍓 High-Hurdle Berry Ganache" },
                  { name: "Salted Butter Caramel", desc: "🧂 Salted Caramel Stable Emulsion" },
                  { name: "White Chocolate Matcha", desc: "🍵 Matcha White Chocolate Ganache" }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setWizardFillingDescription(preset.name);
                      if (preset.name.includes("Banana")) {
                        setWizardChocolateType("White Chocolate");
                        setWizardShelfLife("3");
                        setWizardAddAcidSetting("let_ai_recommend");
                      } else if (preset.name.includes("Raspberry")) {
                        setWizardChocolateType("Dark Chocolate");
                        setWizardShelfLife("6");
                        setWizardAddAcidSetting("yes");
                      } else if (preset.name.includes("Caramel")) {
                        setWizardChocolateType("None");
                        setWizardShelfLife("12");
                        setWizardAddAcidSetting("no");
                      } else {
                        setWizardChocolateType("White Chocolate");
                        setWizardShelfLife("3");
                        setWizardAddAcidSetting("let_ai_recommend");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      wizardFillingDescription === preset.name
                        ? "bg-white text-violet-950 border-white shadow-md"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {preset.desc}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1.5">
                <label className="font-extrabold text-violet-200 uppercase tracking-wider text-[10px] font-mono block">
                  1. Desired Filling Description
                </label>
                <input
                  type="text"
                  value={wizardFillingDescription}
                  onChange={(e) => setWizardFillingDescription(e.target.value)}
                  placeholder="e.g. Real Banana Puree Filling or Rich Mango Passion Gel"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-400 focus:bg-white/10 text-white placeholder-white/30 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-violet-200 uppercase tracking-wider text-[10px] font-mono block">
                  2. Which Chocolate Are You Using?
                </label>
                <select
                  value={wizardChocolateType}
                  onChange={(e) => setWizardChocolateType(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-400 focus:bg-white/10 text-white font-sans [&>option]:text-gray-900"
                >
                  <option value="Dark Chocolate">Dark Chocolate (54% - 70% Cacao)</option>
                  <option value="Milk Chocolate">Milk Chocolate (34% - 40% Cacao)</option>
                  <option value="White Chocolate">White Chocolate (30% - 34% Cocoa Butter)</option>
                  <option value="None">No Chocolate (Fat-based paste / Caramel / Pure Fruit)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-violet-200 uppercase tracking-wider text-[10px] font-mono block">
                  3. What Shelf Life Do You Want?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "3", label: "3 Months (Ambient)" },
                    { value: "6", label: "6 Months (Stable)" },
                    { value: "12", label: "12 Months (High Stable)" }
                  ].map((sl) => (
                    <button
                      key={sl.value}
                      type="button"
                      onClick={() => setWizardShelfLife(sl.value)}
                      className={`py-2 rounded-xl text-[10px] font-bold border text-center transition-all cursor-pointer ${
                        wizardShelfLife === sl.value
                          ? "bg-white text-violet-950 border-white shadow-md"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {sl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-violet-200 uppercase tracking-wider text-[10px] font-mono block">
                  4. Acid Hurdle Barrier Control
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "let_ai_recommend", label: "AI Recommend" },
                    { value: "yes", label: "Yes, Add Acid" },
                    { value: "no", label: "No, Skip Acid" }
                  ].map((acid) => (
                    <button
                      key={acid.value}
                      type="button"
                      onClick={() => setWizardAddAcidSetting(acid.value)}
                      className={`py-2 rounded-xl text-[10px] font-bold border text-center transition-all cursor-pointer ${
                        wizardAddAcidSetting === acid.value
                          ? "bg-white text-violet-950 border-white shadow-md"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {acid.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleGuidedFormulation}
                disabled={isFormulatingWithAi}
                className="px-6 py-3 bg-white text-violet-950 hover:bg-violet-50 disabled:opacity-50 transition-all rounded-xl font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isFormulatingWithAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-violet-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Molecular Chemistry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-violet-700" />
                    <span>Formulate Recipe & Load Batch Builder</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Wizard AI Feedback Panel */}
          {guidedAiError && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-2xl text-xs flex gap-2 animate-fadeIn">
              <AlertTriangle className="w-4.5 h-4.5 text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Wizard Setup Error</strong>
                <p className="mt-0.5">{guidedAiError}</p>
              </div>
            </div>
          )}

          {guidedAiFeedback && (
            <div className="bg-white/10 border border-white/15 p-6 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-violet-200 border-b border-white/10 pb-2">
                <Sparkles className="w-4 h-4 animate-bounce text-violet-300" />
                <strong className="text-xs uppercase tracking-wider font-mono text-violet-200">
                  AI Food Scientist Formulation Insight
                </strong>
              </div>
              <div className="space-y-3 font-sans text-slate-200 leading-relaxed text-xs">
                {parseMarkdown(guidedAiFeedback)}
              </div>
              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between text-[10px] text-violet-300 font-mono">
                <span>🧪 INTERACTIVE THERMODYNAMIC BALANCER ACTIVE</span>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-bold px-2 py-1 rounded">
                  ✓ Batch loaded successfully to Batch Builder below! Scroll down to tweak weights.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout: left side formulation solver, right side food science theory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="formulation-lab-dashboard">
        
        {/* Left Side: Interactive Formulation & Shelf Life Solver (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Toggle Formulation Mode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-950 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-950 font-sans">1. Interactive Filling Formulation Solver</h4>
                  <p className="text-[11px] text-gray-500 font-sans">Calibrate and test safe ambient compositions</p>
                </div>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100/80">
                <button
                  type="button"
                  onClick={() => setFormulationMode("ingredients")}
                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all ${
                    formulationMode === "ingredients"
                      ? "bg-white text-amber-950 shadow-xs"
                      : "text-gray-500 hover:text-gray-950"
                  }`}
                >
                  Batch Builder
                </button>
                <button
                  type="button"
                  onClick={() => setFormulationMode("sliders")}
                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all ${
                    formulationMode === "sliders"
                      ? "bg-white text-amber-950 shadow-xs"
                      : "text-gray-500 hover:text-gray-950"
                  }`}
                >
                  Sliders
                </button>
              </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-gray-950 uppercase tracking-wider text-[10px] font-mono">Filling Name</label>
                  <input
                    type="text"
                    value={fillingName}
                    onChange={(e) => setFillingName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-gray-950 uppercase tracking-wider text-[10px] font-mono">Target Shelf Life</label>
                  <select
                    value={targetShelfLife}
                    onChange={(e) => setTargetShelfLife(e.target.value as "3" | "6" | "12")}
                    className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white font-sans"
                  >
                    <option value="3">3 Months (Standard preservation limit)</option>
                    <option value="6">6 Months (Ambient retail benchmark)</option>
                    <option value="12">12 Months (Industrial stable shelf life)</option>
                  </select>
                </div>
              </div>

              {/* Filling Class Selector */}
              <div className="space-y-1">
                <label className="font-extrabold text-gray-950 uppercase tracking-wider text-[10px] font-mono block">Confectionery Filling Class</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "ganache", label: "Dairy Ganache", desc: "Cream + Choc" },
                    { id: "caramel", label: "Soft Caramel", desc: "Cream + Sugars" },
                    { id: "fruit_gel", label: "Acid Fruit Gel", desc: "Fruit Purée + Pectin" },
                    { id: "fat_based", label: "Nuts & Gianduja", desc: "Cocoa Butter/Fats" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFillingType(f.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        fillingType === f.id
                          ? "bg-amber-950 border-amber-950 text-white"
                          : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <strong className="block text-[11px] font-extrabold">{f.label}</strong>
                      <span className={`text-[9px] block ${fillingType === f.id ? "text-amber-200" : "text-gray-400"}`}>{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MODE A: INGREDIENTS BATCH BUILDER */}
              {formulationMode === "ingredients" && fillingType !== "fat_based" && (
                <div className="space-y-4">
                  
                  {/* Preset Quick-Add buttons */}
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-gray-400 uppercase tracking-wider text-[9px] font-mono block">
                      Quick-Select Standard Confectionery Presets
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto p-1 bg-gray-50/50 rounded-xl border border-gray-100">
                      {PRESET_INGREDIENTS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetIngredient(preset)}
                          className="px-2 py-1 bg-white border border-gray-100 text-[10px] text-gray-600 rounded-lg hover:border-amber-950 hover:text-amber-950 cursor-pointer font-medium transition-all"
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Ingredients List */}
                  <div className="space-y-2">
                    <span className="font-extrabold uppercase tracking-widest text-gray-400 font-mono text-[9px] block">
                      Active Batch Ingredients
                    </span>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-100 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-3 py-2">Ingredient</th>
                            <th className="px-3 py-2 text-right">Weight (g)</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                          {customIngredients.map((ing) => (
                            <tr key={ing.id} className="hover:bg-white/40">
                              <td className="px-3 py-2.5">
                                <strong className="text-gray-900 block font-semibold">{ing.name}</strong>
                                <span className="text-[10px] text-gray-400 block max-w-[200px] truncate">{ing.purpose}</span>
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-950">
                                {ing.weight}g
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider font-mono ${
                                  ing.category === "water_bearing"
                                    ? "bg-cyan-50 text-cyan-800 border border-cyan-100/30"
                                    : ing.category === "sugar_humectant"
                                    ? "bg-amber-50 text-amber-800 border border-amber-100/30"
                                    : ing.category === "solid_fat_cocoa"
                                    ? "bg-orange-50 text-orange-800 border border-orange-100/30"
                                    : "bg-gray-50 text-gray-800 border border-gray-100"
                                }`}>
                                  {ing.category === "water_bearing"
                                    ? "💦 Water"
                                    : ing.category === "sugar_humectant"
                                    ? "🍬 Sugar"
                                    : ing.category === "solid_fat_cocoa"
                                    ? "🍫 Fat"
                                    : "🧪 Other"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(ing.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer hover:bg-gray-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {customIngredients.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-center text-gray-400 text-[11px]">
                                Your batch list is empty. Choose presets above or write your own below!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add New Ingredient Form Row */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                    <strong className="text-[10px] font-black uppercase text-gray-950 font-sans block">
                      Add Custom Ingredient to Formulation
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5 space-y-0.5">
                        <span className="text-[8px] font-mono text-gray-400 block uppercase">Ingredient Name</span>
                        <input
                          type="text"
                          placeholder="e.g. Invert Sugar"
                          value={newIngName}
                          onChange={(e) => setNewIngName(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-950"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-0.5">
                        <span className="text-[8px] font-mono text-gray-400 block uppercase">Weight (g)</span>
                        <input
                          type="number"
                          value={newIngWeight}
                          onChange={(e) => setNewIngWeight(parseInt(e.target.value) || 0)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-950 font-mono"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-0.5">
                        <span className="text-[8px] font-mono text-gray-400 block uppercase">Chemical Group</span>
                        <select
                          value={newIngCategory}
                          onChange={(e) => setNewIngCategory(e.target.value as any)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-950"
                        >
                          <option value="water_bearing">💦 Water-Bearing</option>
                          <option value="sugar_humectant">🍬 Sugar/Humectant</option>
                          <option value="solid_fat_cocoa">🍫 Solid Fat/Cocoa</option>
                          <option value="other">🧪 Other/Additives</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Purpose (e.g., binds free water, lowers Aw)"
                          value={newIngPurpose}
                          onChange={(e) => setNewIngPurpose(e.target.value)}
                          className="w-full text-[10px] px-2.5 py-1 bg-white border border-gray-100 rounded-lg focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="bg-amber-950 text-white px-4 py-1.5 text-xs font-black rounded-lg inline-flex items-center gap-1 hover:bg-amber-900 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                  </div>

                  {/* Math Summary Composition */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-500 bg-amber-50/10 p-3 rounded-xl border border-amber-100/20">
                    <span className="font-extrabold text-amber-950">Calculated Composition:</span>
                    <span className="flex gap-3">
                      <span>💦 Liquids: {activeWaterBearing}%</span>
                      <span>🍬 Sugars: {activeSugars}%</span>
                      <span>🍫 Fats: {activeFatsSolids}%</span>
                    </span>
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-100">
                      Total Weight: {customIngredients.reduce((sum, i) => sum + i.weight, 0).toLocaleString()}g
                    </span>
                  </div>
                </div>
              )}

              {/* MODE B: ORIGINAL COMPOSITION SLIDERS */}
              {(formulationMode === "sliders" || fillingType === "fat_based") && (
                <div>
                  {fillingType !== "fat_based" ? (
                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-gray-500 border-b border-gray-100 pb-2">
                        <span>INGREDIENT GROUP COMPOSITION</span>
                        <span className="text-amber-900 font-black">TOTAL: 100%</span>
                      </div>

                      {/* Water Bearing Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-gray-700 text-[11px]">
                          <span className="flex items-center gap-1">💦 Water-Bearing Liquids <span className="text-[10px] font-normal text-gray-400">(Cream, Milk, Fruit Purée)</span></span>
                          <span className="font-mono">{waterBearing}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={waterBearing}
                          onChange={(e) => handleNormalizeIngredients("water", parseInt(e.target.value))}
                          className="w-full accent-amber-950 cursor-pointer"
                        />
                      </div>

                      {/* Sugars Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-gray-700 text-[11px]">
                          <span className="flex items-center gap-1">🍬 Concentrated Sugars <span className="text-[10px] font-normal text-gray-400">(Caster, Invert, Glucose, Sorbitol)</span></span>
                          <span className="font-mono">{sugars}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="70"
                          value={sugars}
                          onChange={(e) => handleNormalizeIngredients("sugar", parseInt(e.target.value))}
                          className="w-full accent-amber-950 cursor-pointer"
                        />
                      </div>

                      {/* Fats & solids Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-bold text-gray-700 text-[11px]">
                          <span className="flex items-center gap-1">🍫 Solid Fats & Cocoa <span className="text-[10px] font-normal text-gray-400">(Chocolate, Butter, Cocoa Butter)</span></span>
                          <span className="font-mono">{fatsSolids}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={fatsSolids}
                          onChange={(e) => handleNormalizeIngredients("fat", parseInt(e.target.value))}
                          className="w-full accent-amber-950 cursor-pointer"
                        />
                      </div>

                      {/* Acid Toggler */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <strong className="text-gray-900 block font-semibold">Incorporate Citric Acid Solution (pH Reduction)</strong>
                          <span className="text-[10px] text-gray-400 block">Dose: 0.8% of total formula to activate pectin or reduce pH against bacteria</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addAcid}
                            onChange={() => setAddAcid(!addAcid)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-amber-950"></div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50/30 border border-amber-100/50 p-4 rounded-2xl text-xs text-amber-950 space-y-2">
                      <p className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
                        <Shield className="w-4 h-4 text-amber-800" /> Fat-Based Formulation Stable
                      </p>
                      <p className="font-sans text-gray-600 leading-relaxed">
                        Giandujas, pralinés, and chocolate nut spreads are naturally safe against water-based microbial deterioration. Since they contain <strong>0% free water</strong>, their calculated water activity is stably under 0.40, which completely inhibits all mold, bacteria, and yeast. No sliders or citric acid solutions are required.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Formulation Storage & AI Consulting Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100" id="formulation-storage-actions">
                <button
                  type="button"
                  onClick={handleSaveRecipe}
                  disabled={isSaving}
                  className="flex-1 bg-amber-950 text-white font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-900 disabled:opacity-50 text-xs transition-all shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving formulation..." : "Save Formulation"}
                </button>
                <button
                  type="button"
                  onClick={handleConsultAiGuide}
                  disabled={isAnalyzing}
                  className="flex-1 bg-violet-950 text-violet-50 font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-violet-900 disabled:opacity-50 text-xs transition-all shadow-xs"
                >
                  <Brain className="w-4 h-4 text-violet-300" />
                  {isAnalyzing ? "AI Guide Analyzing..." : "Consult AI Formulation Guide"}
                </button>
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-xl text-center text-xs font-bold ${
                  saveMessage.includes("success") || saveMessage.includes("saved")
                    ? "bg-emerald-50 text-emerald-850 border border-emerald-100"
                    : "bg-amber-50 text-amber-850 border border-amber-100"
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>

            {/* Calculations Dashboard Outputs */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h5 className="font-extrabold uppercase tracking-wider text-[10px] text-gray-400 font-mono">Formulation Chemistry Diagnostics</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aw Output */}
                <div className={`p-4 rounded-2xl border ${
                  awResult.status === "safe"
                    ? "bg-emerald-50/40 border-emerald-100 text-emerald-950"
                    : awResult.status === "warning"
                    ? "bg-amber-50/40 border-amber-100 text-amber-950"
                    : "bg-red-50/40 border-red-100 text-red-950"
                } space-y-1.5`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider font-mono opacity-80">Water Activity (a_w)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                      awResult.status === "safe"
                        ? "bg-emerald-100/60 border-emerald-200 text-emerald-800"
                        : awResult.status === "warning"
                        ? "bg-amber-100/60 border-amber-200 text-amber-800"
                        : "bg-red-100/60 border-red-200 text-red-800"
                    }`}>
                      {awResult.status === "safe" ? "STABLE" : awResult.status === "warning" ? "CAUTION" : "UNSAFE"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight">{awResult.aw.toFixed(2)}</span>
                    <span className="text-[10px] opacity-75 font-mono">/ 1.00 Max</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans">{awResult.comment}</p>
                </div>

                {/* pH Output */}
                <div className={`p-4 rounded-2xl border ${
                  phResult.status === "safe"
                    ? "bg-emerald-50/40 border-emerald-100 text-emerald-950"
                    : "bg-gray-50 border-gray-100 text-gray-905"
                } space-y-1.5`}>
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider font-mono opacity-80">Acidity Level (pH)</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono border ${
                      phResult.status === "safe"
                        ? "bg-emerald-100/60 border-emerald-200 text-emerald-800"
                        : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}>
                      {phResult.status === "safe" ? "Bacteriostatic" : "Standard"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black font-mono tracking-tight">{phResult.ph.toFixed(1)}</span>
                    <span className="text-[10px] opacity-75 font-mono">pH Units</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600 font-sans">{phResult.comment}</p>
                </div>
              </div>

              {/* Hurdle Safety Scorecard Summary Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                awResult.status === "safe"
                  ? "bg-emerald-950 text-emerald-50 border-emerald-950 shadow-md shadow-emerald-950/10"
                  : "bg-amber-950 text-amber-50 border-amber-950 shadow-md shadow-amber-950/10"
              }`} id="hurdle-safety-scorecard">
                {awResult.status === "safe" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="space-y-1 text-xs">
                  <p className="font-extrabold uppercase tracking-widest text-[9px] font-mono text-amber-200">
                    Formulation Preservative Audit & Hurdles
                  </p>
                  <strong className="text-sm font-sans block">
                    {awResult.status === "safe"
                      ? `✅ Formulation Safe for ${targetShelfLife}-Month Shelf Life!`
                      : `⚠️ Attention Required for ${targetShelfLife}-Month Shelf Life`}
                  </strong>
                  <p className="opacity-80 leading-relaxed font-sans text-[11px]">
                    {awResult.status === "safe"
                      ? `Your ratios of humectants and fats are beautifully configured. With an water activity of ${awResult.aw.toFixed(2)} and standard enrobing hygiene, this recipe is extremely safe against spoilage and mold.`
                      : `Warning: This formulation possesses excessive 'free water' (${activeWaterBearing}%). To achieve a safe ${targetShelfLife}-month ambient shelf life, replace some cream/water with glucose syrup, increase dark chocolate solids, or add citric acid to establish dynamic acidity barriers.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Confectionery Food Science Academy (5 Columns) */}
        <div className="lg:col-span-5 space-y-6" id="food-science-theory-column">
          
          {/* USER PROFILE - SAVED FORMULATIONS */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-3">
              <div className="p-2 bg-amber-50 text-amber-950 rounded-xl">
                <FolderHeart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">My Saved Formulations</h4>
                <p className="text-[10px] text-gray-400 font-sans">Persistent database recipe lab storage</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {!currentUser ? (
                <div className="bg-amber-50/40 border border-amber-100/30 p-4 rounded-2xl text-center space-y-1.5">
                  <p className="text-[11px] font-bold text-amber-950">Profile Not Signed In</p>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Please log in using the Student Auth portal in the navigation header to load, edit, and sync your formulations.
                  </p>
                </div>
              ) : savedRecipes.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-6">
                  No formulations saved yet. Build a custom batch on the left and click "Save Formulation".
                </p>
              ) : (
                <div className="space-y-1.5">
                  {savedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => handleLoadRecipe(recipe)}
                      className="p-3 bg-gray-50 border border-gray-100/80 rounded-xl hover:border-amber-950 cursor-pointer flex justify-between items-center transition-all group animate-fadeIn"
                    >
                      <div className="space-y-0.5">
                        <strong className="text-gray-950 text-[11px] block font-extrabold group-hover:text-amber-950">
                          {recipe.name}
                        </strong>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
                          <span className="uppercase">{recipe.fillingType}</span>
                          <span>•</span>
                          <span>{recipe.targetShelfLife} Months</span>
                          <span>•</span>
                          <span className="text-cyan-800">Aw: {Number(recipe.waterActivity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
              <div className="p-2 bg-amber-50 text-amber-950 rounded-xl">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 font-sans">2. Confectionery Shelf-Life Chemistry</h4>
                <p className="text-[11px] text-gray-500 font-sans">The three pillars of food science safety</p>
              </div>
            </div>

            {/* Science Explanations */}
            <div className="space-y-5 text-xs">
              
              {/* Pillar 1: Water Activity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-cyan-50 text-cyan-800 rounded-full inline-flex items-center justify-center font-bold font-mono text-[10px]">1</span>
                  <h5 className="font-extrabold text-gray-950 text-xs font-sans">Water Activity (a_w) & Hydrophilicity</h5>
                </div>
                <p className="text-gray-600 leading-relaxed font-sans pl-7">
                  Do not confuse total moisture percentage with <strong>Water Activity (a_w)</strong>. Moisture is the total weight of water, whereas Water Activity represents the portion of that water which is "free" or unbound.
                </p>
                <div className="bg-cyan-50/40 border border-cyan-100 p-3 rounded-2xl text-[11px] leading-normal space-y-1 text-cyan-950 pl-7 ml-7">
                  <p className="font-semibold text-cyan-900 font-mono text-[10px] uppercase tracking-wide">Critical Aw Spoilage Limits:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] font-sans">
                    <li><strong>a_w &gt; 0.92</strong>: Active bacteria growth (Salmonella, E. coli).</li>
                    <li><strong>a_w &gt; 0.85</strong>: Mold and yeast multiplication threshold.</li>
                    <li><strong>a_w &le; 0.80</strong>: Safe for 3-6 months ambient storage.</li>
                    <li><strong>a_w &le; 0.75</strong>: Safe for 12 months ambient storage.</li>
                  </ul>
                </div>
              </div>

              {/* Pillar 2: pH Control */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-amber-100 text-amber-900 rounded-full inline-flex items-center justify-center font-bold font-mono text-[10px]">2</span>
                  <h5 className="font-extrabold text-gray-950 text-xs font-sans">The Acidic Defense System (pH)</h5>
                </div>
                <p className="text-gray-600 leading-relaxed font-sans pl-7">
                  Adding acids (like Citric, Malic, or Tartaric acid) drops the filling's pH. When pH is lowered below <strong>4.5</strong>, the environment becomes hostile to bacterial cell metabolism. This represents an invaluable barrier, especially in fruit gels.
                </p>
              </div>

              {/* Pillar 3: Hurdle barriers */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-50 text-emerald-800 rounded-full inline-flex items-center justify-center font-bold font-mono text-[10px]">3</span>
                  <h5 className="font-extrabold text-gray-950 text-xs font-sans">Hurdle Technology (Barriers)</h5>
                </div>
                <p className="text-gray-600 leading-relaxed font-sans pl-7">
                  Instead of relying on single massive preservatives, master chocolatiers use <strong>Hurdle Technology</strong>. By combining multiple mild barriers, we create a path that microorganisms cannot cross.
                </p>
                <div className="grid grid-cols-1 gap-2 pl-7">
                  {[
                    { title: "Water-binding (a_w)", desc: "Trimoline and glucose pull water molecules close." },
                    { title: "Acidity (pH)", desc: "Citric acid additions inhibit pathogenic growth." },
                    { title: "Airtight Shell Enrobing", desc: "A pinhole-free chocolate skin stops oxygen entering." },
                    { title: "Thermal Sanitation", desc: "Boiling cream to 100°C pasteurizes active micro-spores." },
                  ].map((hurdle, i) => (
                    <div key={i} className="flex gap-2 items-start bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900 block font-semibold text-[10px]">{hurdle.title}</strong>
                        <span className="text-[10px] text-gray-500 leading-normal block">{hurdle.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* AI FORMULATION GUIDE RESULTS DRAWER */}
      {(isAnalyzing || aiAnalysis || analysisError) && (
        <div className="bg-white border-2 border-violet-100 rounded-3xl p-6 md:p-8 shadow-md space-y-6 relative overflow-hidden" id="ai-formulation-results-panel">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-50 rounded-full opacity-50 blur-3xl -translate-y-10 translate-x-10" />
          
          <div className="flex items-center justify-between border-b border-violet-50 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-950 text-violet-100 rounded-2xl shadow-sm">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] bg-violet-100 text-violet-850 font-extrabold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                  AI Food Scientist Audit
                </span>
                <h4 className="text-base font-black text-gray-950 font-sans mt-0.5">
                  AI Master Formulation Guide
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setAiAnalysis(null); setAnalysisError(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 bg-white shadow-xs cursor-pointer"
            >
              Close Analysis
            </button>
          </div>

          <div className="relative z-10">
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-950 rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-xs font-bold text-violet-950 animate-pulse font-mono uppercase tracking-widest">
                    Analyzing Molecular Ratios...
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Gemini AI is auditing thermodynamic humectants, water-activity hazards, and pH hurdle barriers.
                  </p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 text-xs flex gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <strong className="block font-bold">Failed to Analyze Formulation</strong>
                  <p className="mt-0.5">{analysisError}</p>
                </div>
              </div>
            )}

            {aiAnalysis && (
              <div className="bg-violet-50/20 border border-violet-100/50 p-6 rounded-2xl space-y-4 max-w-none animate-fadeIn">
                <div className="space-y-3 font-sans text-gray-800 leading-relaxed text-xs">
                  {parseMarkdown(aiAnalysis)}
                </div>
                <div className="pt-4 border-t border-violet-100/30 flex items-center justify-between text-[10px] text-violet-900/60 font-mono">
                  <span>ANALYSIS STATUS: MOLECULAR_VERIFIED</span>
                  <span>PRECISE 1KG CALIBRATION AVAILABLE</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* World's Most Favorite Confectionery Recipes Book (Tabs & Detailed instruction) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6" id="recipes-anthology-panel">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-950 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-950 font-sans">World's Most Favorite Filling Recipes</h4>
              <p className="text-[11px] text-gray-500 font-sans">Learn step-by-step master methodologies with thermal controls and equipment protocols</p>
            </div>
          </div>
          <span className="text-[10px] bg-amber-50 text-amber-950 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono self-start sm:self-center border border-amber-100/30">
            Professional 1KG Batches
          </span>
        </div>

        {/* Recipe Selection Tabs */}
        <div className="flex flex-wrap gap-2" id="recipe-book-tabs">
          {FAVORITE_RECIPES.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`px-4 py-2.5 text-xs font-bold rounded-2xl cursor-pointer border transition-all ${
                selectedRecipe.id === recipe.id
                  ? "bg-amber-950 border-amber-950 text-white shadow-sm"
                  : "bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {recipe.name}
            </button>
          ))}
        </div>

        {/* Selected Recipe Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4" id="recipe-viewing-pane">
          
          {/* Column 1: Ingredients & Specs (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4">
              <div>
                <span className="text-[9px] bg-amber-950 text-amber-50 font-extrabold font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                  SPEC SHEET
                </span>
                <h5 className="text-base font-black text-gray-950 mt-1 font-sans">{selectedRecipe.name}</h5>
                <p className="text-[11px] text-gray-500 font-sans mt-0.5">{selectedRecipe.subtitle}</p>
              </div>

              {/* Specs Badge Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2 rounded-xl border border-gray-100 text-center space-y-0.5">
                  <span className="text-[8px] text-gray-400 font-mono block uppercase">Water Activity</span>
                  <strong className="text-sm font-mono text-cyan-800">{selectedRecipe.targetAw.toFixed(2)}</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100 text-center space-y-0.5">
                  <span className="text-[8px] text-gray-400 font-mono block uppercase">pH Metric</span>
                  <strong className="text-sm font-mono text-amber-900">{selectedRecipe.targetPh.toFixed(1)}</strong>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100 text-center space-y-0.5">
                  <span className="text-[8px] text-gray-400 font-mono block uppercase">Est. Shelf Life</span>
                  <strong className="text-[10px] font-sans font-extrabold text-emerald-800 block leading-tight">{selectedRecipe.shelfLife.split(" ")[0]} Mo</strong>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 font-mono block">Precise 1KG Formulation</span>
                <div className="divide-y divide-gray-100 text-xs">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="py-2 flex justify-between items-start gap-4">
                      <div>
                        <strong className="text-gray-900 block font-semibold">{ing.name}</strong>
                        <span className="text-[10px] text-gray-400 block leading-tight">{ing.purpose}</span>
                      </div>
                      <span className="font-mono font-bold text-gray-950 bg-white border border-gray-100 px-2.5 py-1 rounded-lg">
                        {ing.weight}g
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Batch Weight Marker */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs font-extrabold text-amber-950">
                <span>TOTAL BATCH WEIGHT</span>
                <span className="font-mono bg-amber-100/50 px-2 py-1 rounded-lg">1,000 Grams (1.00 KG)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Preparation Steps & Temperature Boundaries (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Essential Equipment Box */}
            <div className="space-y-2.5 text-xs">
              <span className="font-extrabold uppercase tracking-widest text-gray-400 font-mono block">Essential Equipment Required</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRecipe.equipment.map((equip, i) => (
                  <div key={i} className="flex gap-2 items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                    <Wrench className="w-4 h-4 text-gray-500" />
                    <span className="font-sans font-medium text-gray-700">{equip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Temperatures */}
            <div className="space-y-2.5 text-xs">
              <span className="font-extrabold uppercase tracking-widest text-gray-400 font-mono block flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-amber-800" /> Thermodynamic Controls & Boundaries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRecipe.temperatures.map((temp, i) => (
                  <div key={i} className="bg-amber-50/10 border border-amber-100/50 p-3.5 rounded-2xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-gray-900 font-extrabold text-[11px]">{temp.stage}</strong>
                      <span className="font-mono font-black text-amber-950 bg-amber-100/50 px-2 py-0.5 rounded text-[11px]">
                        {temp.value}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal font-sans">
                      {temp.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Production Method */}
            <div className="space-y-3 text-xs">
              <span className="font-extrabold uppercase tracking-widest text-gray-400 font-mono block">Production Method (Step-by-Step)</span>
              <div className="space-y-3.5">
                {selectedRecipe.method.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start text-xs font-sans leading-relaxed text-gray-600">
                    <span className="bg-amber-950 text-amber-50 w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[10px] font-mono mt-0.5 flex-shrink-0 shadow-xs">
                      {i + 1}
                    </span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Science Secret Bullet */}
            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-950 space-y-1" id="selected-recipe-secret">
              <strong className="text-amber-900 uppercase tracking-widest text-[9px] font-mono block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Food Science Secret
              </strong>
              <p className="font-sans leading-relaxed text-gray-700">
                {selectedRecipe.scienceSecret}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
