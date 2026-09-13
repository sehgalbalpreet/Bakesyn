import React, { useState } from "react";
import { PANNING_STEPS } from "../data";
import { downloadAcademicGuidebook } from "../utils/guidebookGenerator";
import {
  RotateCw,
  Nut,
  Layers,
  Snowflake,
  Shield,
  Play,
  Pause,
  Compass,
  HelpCircle,
  Flame,
  Clock,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  BookOpen
} from "lucide-react";

interface NutRoastSpec {
  name: string;
  temp: string;
  time: string;
  moisture: string;
  peeling: string;
  oilRisk: string;
  description: string;
}

interface SugarPanningStep {
  stage: string;
  title: string;
  description: string;
  science: string;
}

const SUGAR_PANNING_STEPS: SugarPanningStep[] = [
  {
    stage: "Stage 1: Almond Roasting & Sealing",
    title: "Almond Conditioning & Gum Pre-Coat",
    description: "Dry-roast raw sweet almonds at 150°C for 20 minutes. Cool fully to 22°C. Apply 2 coats of a 33% Gum Arabic solution and blow warm dry air to build a robust, oil-impenetrable glazed outer barrier.",
    science: "Almond skins contain micro-pores and natural fats. The gum arabic pre-coat seal completely blocks almond oils from migrating outwards, preventing yellow grease staining or color-patchiness on the pastel sugar shell."
  },
  {
    stage: "Stage 2: Sugar Grossing & Building",
    title: "The Hard Sugar Shell",
    description: "Apply a highly concentrated, hot sugar syrup (75% sucrose solids, held at 70°C). With the drum rotating, drizzle the syrup sequentially over the tumbling bed. Blow high-flow hot, dry air (35°C - 40°C) after each pour to evaporate water, forcing the sucrose to rapidly crystallize into a white, dense, crunchy shell.",
    science: "Slow grossing with hot, supersaturated sugar syrup yields highly ordered sucrose crystals. Water is expelled through warm air ventilation, forcing the sucrose molecules to bind tightly into a crisp candy shell."
  },
  {
    stage: "Stage 3: Coloring & Opaque Layering",
    title: "Opaque White & Colored Pastels",
    description: "Prepare a colored, flavored sugar syrup (66% sucrose, 28.5% water, 3.5% glucose syrup, 1% Titanium Dioxide opacifier, natural vanilla extract, and pastel food coloring). Apply 4-6 thin, delicate coats to build uniform opaque pigment across every almond.",
    science: "Titanium Dioxide acts as a white opacifier. It masks the dark brown almond background, allowing pastel dyes (pink, sky blue, lavender) to appear perfectly uniform without looking translucent, dark, or muddy."
  },
  {
    stage: "Stage 4: Smoothing & Glazing",
    title: "Glassy Carnauba Buffing",
    description: "Smooth the colored sugar shell under high tumbling friction with no blowing air. Apply a tiny trace of micronized Carnauba wax powder (0.05% of almond weight) directly into the spinning drum. Let the almonds spin and buff against each other for 15 minutes.",
    science: "Continuous friction aligns the flat micro-platelets of Carnauba wax, forming an incredibly thin, hydrophobic, crystalline film that reflects light evenly to yield a mirror-like high gloss."
  }
];

const CHOCOLATE_SUGAR_PANNING_STEPS: SugarPanningStep[] = [
  {
    stage: "Stage 1: Pre-Coat / Gumming",
    title: "Sealing the Chocolate Core",
    description: "Load cold chocolate-panned almond centers into the pan. Keep blowing air OFF and pan at 20–28 RPM. Apply 10–15 ml of 40% Gum Arabic solution (prepared at 60°C) per kg of centers. Tumble for 60–90 seconds until tacky. Turn COOL AIR on (strict ceiling of 18–21°C) and tumble until dry. Repeat for a 2nd coat.",
    science: "The cool air ceiling of 18-21°C ensures the underlying chocolate core remains completely inert and solid. The dual Gum Arabic layer locks in the chocolate's natural oils and cocoa butter, preventing oil migration which would otherwise ruin the sugar outer shell."
  },
  {
    stage: "Stage 2: Opaque White Base",
    title: "Masking the Chocolate Background",
    description: "Prepare a 70° Brix base syrup (700g sucrose, 35g glucose 42 DE, 315g water). Blend 1–2% clean-label opacifier (Rice Starch or Calcium Carbonate). Turn air OFF, add 8–12 ml/kg of syrup, and let spread for 60 seconds. Turn air ON (18–21°C) to dry. Repeat for 5 to 8 coats until the chocolate core is completely white and hidden.",
    science: "The opacifier particles (calcium carbonate or rice starch) scatter light to mask the dark brown color of the underlying chocolate. The strict ceiling of 18-21°C prevents chocolate softening during crystallization."
  },
  {
    stage: "Stage 3: Color Application",
    title: "Building the Pastel Color Layer",
    description: "Mix water-soluble color directly into the remaining 70° Brix syrup at 30–35°C. Apply 3 to 5 coats using the standard cycle: Air OFF → Drizzle syrup → Let spread 60 seconds → Cool air ON → Dry completely. Maintain room environment of 18–20°C and RH < 45%.",
    science: "Water-soluble color dyes are suspended uniformly in the dehydrating sugar crystal matrix. Keeping the syrup at a mild 30-35°C prevents thermal shock to the underlying chocolate while promoting uniform dye distribution."
  },
  {
    stage: "Stage 4: Porcelain Smooth-Out",
    title: "Porcelain-Matte Self-Burnishing",
    description: "For the final 1–2 coats, dilute the remaining colored syrup slightly with water to 60–62° Brix. Apply the charge and turn the air COMPLETELY OFF. Let the pieces tumble and self-burnish against one another for 4–5 minutes until dry.",
    science: "Diluting the syrup slows down crystallization, allowing the syrup to flow perfectly flat. Turning the air off relies on pure physical friction (self-burnishing) to yield a flawless, smooth, velvet-like porcelain-matte finish without wax glazing."
  }
];

interface ColorPreset {
  name: string;
  dye: string;
  hex: string;
  borderHex: string;
  description: string;
  textClass: string;
}

const COLOR_PRESETS: Record<string, ColorPreset> = {
  pink: {
    name: "Classic Pastel Pink",
    dye: "Beetroot Extract / Carmine (0.15% dry weight)",
    hex: "#fbcfe8", // bg-pink-200
    borderHex: "#f472b6", // border-pink-400
    description: "The traditional wedding and celebration color for Jordan Almonds. Offers a warm, romantic blush.",
    textClass: "text-pink-700"
  },
  blue: {
    name: "Baby Sky Blue",
    dye: "Spirulina Blue Extract (0.20% dry weight)",
    hex: "#bae6fd", // bg-sky-200
    borderHex: "#38bdf8", // border-sky-400
    description: "Perfect pastel sky hue. Utilizes natural spirulina pigments which are heat-sensitive (must dry below 40°C).",
    textClass: "text-sky-700"
  },
  green: {
    name: "Sweet Mint Green",
    dye: "Chlorophyllin / Matcha Extract (0.12% dry weight)",
    hex: "#bbf7d0", // bg-green-200
    borderHex: "#4ade80", // border-green-400
    description: "Cool, fresh pastel green. Provides a vibrant spring color profile suitable for botanical gift favors.",
    textClass: "text-green-700"
  },
  lavender: {
    name: "Royal Lilac Lavender",
    dye: "Red Cabbage Anthocyanin + Spirulina (0.25% dry weight)",
    hex: "#e9d5ff", // bg-purple-200
    borderHex: "#c084fc", // border-purple-400
    description: "An elegant, soft purple. Represents premium confectionery crafting.",
    textClass: "text-purple-700"
  },
  white: {
    name: "Glacier Opaque White",
    dye: "Pure Titanium Dioxide / Calcium Carbonate (1.00% dry weight)",
    hex: "#f8fafc", // bg-slate-50
    borderHex: "#cbd5e1", // border-slate-300
    description: "The stark, pure matte white. Acts as the neutral baseline before any color dye is introduced.",
    textClass: "text-slate-700"
  }
};

export default function PanningModule() {
  const [panningMode, setPanningMode] = useState<"chocolate" | "sugar">("chocolate");
  const [sugarPanningSubMode, setSugarPanningSubMode] = useState<"jordan" | "chocolate-coated">("jordan");
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [selectedNutRoast, setSelectedNutRoast] = useState<string>("hazelnut");
  const [shineMethod, setShineMethod] = useState<"shellac" | "vegan">("shellac");
  const [almondBatchKg, setAlmondBatchKg] = useState<number>(2);
  const [selectedColor, setSelectedColor] = useState<string>("pink");
  const [useInvertSyrup, setUseInvertSyrup] = useState<boolean>(false);

  const stageIcons = [
    <Nut className="w-5 h-5 text-amber-700" key="nut" />,
    <Shield className="w-5 h-5 text-amber-700" key="shield" />,
    <Layers className="w-5 h-5 text-amber-700" key="layers" />,
    <RotateCw className="w-5 h-5 text-amber-700" key="rotate" />,
    <Snowflake className="w-5 h-5 text-amber-700" key="snowflake" />,
  ];

  const currentStep =
    panningMode === "chocolate"
      ? PANNING_STEPS[activeStage]
      : sugarPanningSubMode === "jordan"
      ? SUGAR_PANNING_STEPS[activeStage]
      : CHOCOLATE_SUGAR_PANNING_STEPS[activeStage];

  const nutRoastDatabase: Record<string, NutRoastSpec> = {
    hazelnut: {
      name: "Hazelnuts (Filberts)",
      temp: "140°C - 150°C (284°F - 302°F)",
      time: "15 - 20 minutes",
      moisture: "< 1.5% target",
      peeling: "Mandatory skin removal. Friction-rub roasted nuts to peel. Loose papery skins will detach in the pan, causing bumpy, uneven chocolate coverage.",
      oilRisk: "High. Hazelnut oil (oleic/linoleic acids) migrates rapidly, which will soften the chocolate unless the Stage 2 gum barrier is applied perfectly.",
      description: "Mild, buttery profile. Roasting must be gentle to prevent oil sweating on the surface before sealing."
    },
    almond: {
      name: "Sweet Almonds",
      temp: "150°C - 160°C (302°F - 320°F)",
      time: "18 - 25 minutes",
      moisture: "< 1.5% target",
      peeling: "Keep skin intact. Ensure almond skins have no deep cracks or fragments. Raw dust must be sifted away before coating.",
      oilRisk: "Medium. Almond fat is more stable than hazelnut, but a seal is still crucial to prevent fat bloom.",
      description: "Crisp, woody bite. Requires deep core roasting for maximum snap inside the chocolate dragée."
    },
    macadamia: {
      name: "Queensland Macadamias",
      temp: "130°C - 140°C (266°F - 284°F)",
      time: "12 - 15 minutes",
      moisture: "< 1.2% target",
      peeling: "No skin. Clean smooth white surface.",
      oilRisk: "Extremely High. Macadamias contain up to 75% fat. Requires a dual-layer Gum Arabic pre-coat to completely lock in oils.",
      description: "Delicate, rich creaminess. High sensitivity to scorching; requires low-temperature roasting to avoid burning volatile fats."
    },
    pistachio: {
      name: "Green Pistachios",
      temp: "120°C - 130°C (248°F - 266°F)",
      time: "10 - 15 minutes",
      moisture: "< 1.5% target",
      peeling: "Gently brush papery skins. Leave green outer layer for contrast.",
      oilRisk: "Medium. High chlorophyll content; sensitive to light oxidation.",
      description: "Savory, nutty, vibrant green flavor. Roasting is kept minimal to retain the gorgeous emerald internal coloration."
    }
  };

  const activeNutSpec = nutRoastDatabase[selectedNutRoast];

  return (
    <div className="space-y-8" id="panning-module-container">
      {/* Intro Box */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col md:flex-row gap-6 items-start" id="panning-intro">
        <div className="bg-amber-100 p-3 rounded-xl text-amber-800" id="panning-icon-container">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-amber-950 font-sans">Module 5: The Art of Professional Panning</h3>
          <p className="text-amber-900 text-sm leading-relaxed">
            Panning (or dragée making) is the ancient method of building thin, uniform coats of chocolate or crystalline sugar around a crunchy nut center using a revolving drum. Mastering panning requires perfect control over room humidity, air temperature, and crystallization chemistry.
          </p>
        </div>
      </div>

      {/* Panning Mode Selection Tabs */}
      <div className="flex bg-amber-50/50 border border-amber-100/60 p-1.5 rounded-2xl max-w-lg mx-auto" id="panning-mode-selector">
        <button
          onClick={() => {
            setPanningMode("chocolate");
            setActiveStage(0);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            panningMode === "chocolate"
              ? "bg-amber-950 text-amber-50 shadow-sm font-black"
              : "text-amber-900/75 hover:text-amber-950 hover:bg-amber-100/30"
          }`}
        >
          <Nut className="w-4 h-4" />
          <span>Artisanal Chocolate Panning</span>
        </button>
        <button
          onClick={() => {
            setPanningMode("sugar");
            setActiveStage(0);
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            panningMode === "sugar"
              ? "bg-amber-950 text-amber-50 shadow-sm font-black"
              : "text-amber-900/75 hover:text-amber-950 hover:bg-amber-100/30"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Sugar Syrup Panning</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="panning-grid">
        {/* Left column: Product Image Showcase */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center space-y-6 text-center" id="drum-visualizer-panel">
          <div className="space-y-1 w-full">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">Confectionery Showcase</span>
            <h4 className="text-base font-extrabold text-gray-950 font-sans">
              {panningMode === "chocolate" 
                ? "Artisanal Chocolate Dragées" 
                : (sugarPanningSubMode === "jordan" 
                  ? "Classic Jordan Almonds" 
                  : "Chocolate Sugar-Shell Almonds")}
            </h4>
          </div>

          {/* Product Image Wrapper */}
          <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border border-amber-100 shadow-md group">
            <img
              src={
                panningMode === "chocolate"
                  ? "/src/assets/images/chocolate_panned_1783242002648.jpg"
                  : sugarPanningSubMode === "jordan"
                  ? "/src/assets/images/jordan_almonds_1783242018323.jpg"
                  : "/src/assets/images/chocolate_coated_sugar_1783242031558.jpg"
              }
              alt={
                panningMode === "chocolate"
                  ? "Artisanal Chocolate Panned Dragées"
                  : sugarPanningSubMode === "jordan"
                  ? "Classic Jordan Almonds"
                  : "Chocolate-Coated Almonds with Sugar Coating"
              }
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Soft decorative overlay label */}
            <div className="absolute bottom-2 right-2 bg-amber-950/80 text-amber-100 text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md backdrop-blur-xs">
              {panningMode === "chocolate" ? "Glossy Polish" : sugarPanningSubMode === "jordan" ? "Porcelain Matte" : "Crisp Coating"}
            </div>
          </div>

          {/* Technical Specifications Grid */}
          <div className="w-full space-y-3">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono block text-left">Scientific Profile</span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/30 text-xs">
                <span className="text-[9px] text-amber-900 font-mono uppercase font-semibold block">Core Material</span>
                <span className="font-bold text-gray-950 block mt-0.5">
                  {panningMode === "chocolate" 
                    ? "Dry Roasted Nuts" 
                    : (sugarPanningSubMode === "jordan" ? "Sweet Almond Core" : "Chocolate-Panned Almond")}
                </span>
              </div>
              <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/30 text-xs">
                <span className="text-[9px] text-amber-900 font-mono uppercase font-semibold block">Primary Coating</span>
                <span className="font-bold text-gray-950 block mt-0.5">
                  {panningMode === "chocolate" 
                    ? "Premium Tempered Chocolate" 
                    : (sugarPanningSubMode === "jordan" ? "Crystalline Sucrose" : "Sucrose Shell (70° Brix)")}
                </span>
              </div>
              <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/30 text-xs col-span-2">
                <span className="text-[9px] text-amber-900 font-mono uppercase font-semibold block">Characteristic Texture & Snap</span>
                <span className="font-bold text-gray-950 block mt-0.5">
                  {panningMode === "chocolate" 
                    ? "Firm chocolate snap with rich melting mouthfeel" 
                    : (sugarPanningSubMode === "jordan" ? "Very hard, traditional candy-shell crunch" : "Crispy sugar crust paired with soft, rich chocolate")}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 italic leading-normal px-2">
            {panningMode === "chocolate"
              ? "Industrial panning utilizes massive copper or stainless-steel bowls to revolve the nut beds continuously at 20-28 RPM while tempered chocolate is drizzled."
              : "Sugar panning requires building up hundreds of incredibly thin, micro-crystalline syrup layers with warm dehumidifying air blasts."}
          </div>
        </div>

        {/* Right column: Step selection and interactive content details */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between" id="panning-steps-panel">
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-700" />
              {panningMode === "chocolate" 
                ? "Professional Chocolate Panning Process" 
                : (sugarPanningSubMode === "jordan" 
                  ? "Traditional Jordan Almond Sugar Coating" 
                  : "Chocolate-Coated Almond Sugar Shelling")}
            </h4>

            {panningMode === "sugar" && (
              <div className="grid grid-cols-2 bg-amber-50/40 p-1 rounded-xl border border-amber-100/60" id="sugar-sub-mode-tabs">
                <button
                  onClick={() => {
                    setSugarPanningSubMode("jordan");
                    setActiveStage(0);
                  }}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    sugarPanningSubMode === "jordan"
                      ? "bg-amber-950 text-amber-50 shadow-xs"
                      : "text-amber-900/70 hover:text-amber-950 hover:bg-amber-100/20"
                  }`}
                >
                  Classic Jordan Almonds
                </button>
                <button
                  onClick={() => {
                    setSugarPanningSubMode("chocolate-coated");
                    setActiveStage(0);
                  }}
                  className={`py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    sugarPanningSubMode === "chocolate-coated"
                      ? "bg-amber-950 text-amber-50 shadow-xs"
                      : "text-amber-900/70 hover:text-amber-950 hover:bg-amber-100/20"
                  }`}
                >
                  Chocolate-Coated with Sugar Shell
                </button>
              </div>
            )}

            {/* Steps tabs list */}
            <div className={`grid ${panningMode === "chocolate" ? "grid-cols-5" : "grid-cols-4"} gap-1.5`} id="panning-tab-list">
              {(panningMode === "chocolate" 
                ? PANNING_STEPS 
                : (sugarPanningSubMode === "jordan" ? SUGAR_PANNING_STEPS : CHOCOLATE_SUGAR_PANNING_STEPS)
              ).map((s, idx) => (
                <button
                  key={idx}
                  id={`panning-step-btn-${idx}`}
                  onClick={() => setActiveStage(idx)}
                  className={`py-2 rounded-xl text-[10px] font-bold text-center border cursor-pointer transition-all duration-200 ${
                    activeStage === idx
                      ? "bg-amber-950 text-amber-50 border-amber-950"
                      : "bg-gray-50 text-gray-600 border-gray-100 hover:border-amber-200"
                  }`}
                >
                  Stage {idx + 1}
                </button>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="space-y-4 pt-3 border-t border-gray-50" id="current-panning-step">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl">
                  {panningMode === "chocolate" ? stageIcons[activeStage] : (
                    activeStage === 0 ? <Nut className="w-5 h-5 text-amber-700" /> :
                    activeStage === 1 ? <Layers className="w-5 h-5 text-amber-700" /> :
                    activeStage === 2 ? <Sparkles className="w-5 h-5 text-amber-700 animate-pulse" /> :
                    <RotateCw className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold uppercase font-mono tracking-wider">{currentStep.stage}</span>
                  <h3 className="text-lg font-bold text-gray-900">{currentStep.title}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-xs leading-relaxed">{currentStep.description}</p>
            </div>
          </div>

          {/* Science section */}
          <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-50 flex gap-3 items-start" id="panning-science-card">
            <HelpCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">Critical Panning Science</h5>
              <p className="text-xs text-amber-900 leading-normal font-sans">{currentStep.science}</p>
            </div>
          </div>
        </div>
      </div>

       {/* STAGE-SPECIFIC DYNAMIC REFERENCE MANUALS (Perfect so they don't have to note it down!) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6" id="panning-specifications-references">
        {panningMode === "chocolate" ? (
          <>
            {activeStage === 0 && (
              <div className="space-y-6 animate-fade-in" id="stage1-reference-block">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Nut className="w-5 h-5 text-amber-950" />
                  <div>
                    <h4 className="text-base font-extrabold text-gray-950">Nut Roasting Reference Guide</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Quick parameters for perfect crispness, sterilization, & dry cores</p>
                  </div>
                </div>

                {/* Interactive Nut Selector Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(nutRoastDatabase).map((key) => {
                    const isSel = selectedNutRoast === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedNutRoast(key)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSel
                            ? "bg-amber-950 border-amber-950 text-amber-50 shadow"
                            : "bg-gray-50 border-gray-100 text-gray-800 hover:bg-amber-50"
                        }`}
                      >
                        <span className="text-xs font-bold block">{nutRoastDatabase[key].name}</span>
                        <span className="text-[10px] opacity-70 font-mono block mt-1">{nutRoastDatabase[key].temp.split(" (")[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Nut Specs Display */}
                <div className="bg-amber-50/20 border border-amber-100/50 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-4 border-r border-gray-100/80 pr-4">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono">Core Parameters</span>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-800" />
                        <div>
                          <span className="text-[9px] text-gray-400 block font-mono">ROAST TEMPERATURE</span>
                          <span className="text-xs font-bold text-gray-950">{activeNutSpec.temp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-800" />
                        <div>
                          <span className="text-[9px] text-gray-400 block font-mono">ROASTING DURATION</span>
                          <span className="text-xs font-bold text-gray-950">{activeNutSpec.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-amber-800" />
                        <div>
                          <span className="text-[9px] text-gray-400 block font-mono">MOISTURE THRESHOLD</span>
                          <span className="text-xs font-bold text-emerald-800 font-mono">{activeNutSpec.moisture}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Preparation & Migration Chemistry</span>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-600 block">Skin & Shell Separation Guidelines:</span>
                        <p className="text-xs text-gray-700 leading-relaxed mt-0.5">{activeNutSpec.peeling}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-950 block">High-Fat Oil Migration Threat:</span>
                        <p className="text-xs text-amber-900 leading-relaxed mt-0.5">{activeNutSpec.oilRisk}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master checklist */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">🚨 Golden Rules of Nut Conditioning</span>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                    <li><strong>Strict Room Temperature:</strong> Never pour chocolate over nuts that are still warm from the oven. Nuts must be fully cooled to 20°C - 22°C (68°F - 72°F) or the chocolate will instantly melt and seize.</li>
                    <li><strong>Absolute Dryness:</strong> Roasting must reduce the nut moisture below 1.5% to yield a crisp internal crunch and prevent water activity from degrading the cocoa solids structure.</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveStage(1);
                      document.getElementById("panning-specifications-references")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                  >
                    Proceed to Stage 2: Gum Arabic Seal <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeStage === 1 && (
              <div className="space-y-6 animate-fade-in" id="stage2-reference-block">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Shield className="w-5 h-5 text-amber-950" />
                  <div>
                    <h4 className="text-base font-extrabold text-gray-950">Stage 2 Formula: Gum Arabic Oil-Seal Barrier</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Critical layer to prevent nut-oil migration and long-term chocolate softening</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50/30 border border-amber-100/40 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Ingredients & Ratios</span>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="font-semibold text-gray-700">Gum Arabic Powder</span>
                        <span className="font-mono font-bold text-amber-950">33.0%</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="font-semibold text-gray-700">Demineralized Warm Water</span>
                        <span className="font-mono font-bold text-amber-950">67.0%</span>
                      </div>
                      <div className="flex justify-between pb-1.5">
                        <span className="font-semibold text-gray-700">Total Pre-Seal Syrup</span>
                        <span className="font-mono font-bold text-amber-950">100.0%</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-amber-100/50">
                      <span className="text-[9px] font-bold text-amber-800 uppercase block font-mono">Proportions for 1kg of Nuts</span>
                      <span className="text-xs text-gray-600">Apply approx. <strong>15ml - 20ml</strong> of this syrup in 2 sequential coats.</span>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Instructions for Application</span>
                    <ol className="text-xs text-gray-700 space-y-2 list-decimal pl-5 leading-relaxed">
                      <li><strong>Preparation:</strong> Heat water to exactly 60°C (140°F). Slowly rain in the Gum Arabic powder while mixing with a high-shear whisk. Strain through a fine-mesh sieve to catch undissolved clusters. Let rest for 2 hours so air bubbles dissipate.</li>
                      <li><strong>First Application:</strong> With the drum rotating and the nuts loaded, drizzle the Gum Arabic syrup over the moving bed. Allow it to roll for 2-3 minutes to thoroughly wet every nut surface.</li>
                      <li><strong>Air Drying:</strong> Blow dry air at 30°C - 35°C (86°F - 95°F) directly into the pan. Dry until the nuts lose their sticky look, sound loud/dry tumbling, and slide freely.</li>
                      <li><strong>Second Coat:</strong> Repeat steps 2 and 3. This builds a robust, cross-linked gum matrix that prevents liquid nut fats (which stay fluid even at room temp) from seeping into your cocoa butter shell.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveStage(2);
                      document.getElementById("panning-specifications-references")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                  >
                    Proceed to Stage 3: Chocolate Layering <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeStage === 2 && (
              <div className="space-y-6 animate-fade-in" id="stage3-reference-block">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Layers className="w-5 h-5 text-amber-950" />
                  <div>
                    <h4 className="text-base font-extrabold text-gray-950">Stage 3 Reference: Progressive Coating Specs</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Mathematical ratios and air cooling parameters for building dragées</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-3">
                    <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">Core Specifications</span>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Pouring Temp (Dark)</span>
                        <strong className="text-amber-950">31.5°C (88.7°F)</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Pouring Temp (Milk)</span>
                        <strong className="text-amber-950">29.5°C (85.1°F)</strong>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Blowing Air Temp</span>
                        <strong className="text-cyan-800">13°C - 15°C</strong>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span>Typical Mass Ratio</span>
                        <strong className="text-gray-900">65% Chocolate / 35% Nut</strong>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">The Layering Technique</span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Drizzle chocolate in thin, continuous streams onto the crest of the rolling nut pile. Avoid pouring directly onto the stainless steel drum. Let the chocolate spread evenly across all nuts before turning on the cold air (13°C - 15°C) to lock the crystals in.
                    </p>
                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/50 text-xs text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-800" />
                      <span><strong>Important:</strong> Ensure the incoming chocolate is well-tempered (Beta V crystals). If you pour untempered chocolate, it will cool slowly, causing extreme stickiness, flat sides, and massive clumping.</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveStage(3);
                      document.getElementById("panning-specifications-references")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                  >
                    Proceed to Stage 4: Smoothing Specs <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeStage === 3 && (
              <div className="space-y-6 animate-fade-in" id="stage4-reference-block">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <RotateCw className="w-5 h-5 text-amber-950" />
                  <div>
                    <h4 className="text-base font-extrabold text-gray-950">Stage 4 Reference: Smoothing Parameters</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Removing ridges and prepping for mirror gloss</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
                  <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-700 tracking-wider font-mono">Friction Process Checklist</span>
                    <ul className="space-y-2 list-disc pl-4">
                      <li><strong>Turn off air supply completely:</strong> Warm or cold air must be cut off.</li>
                      <li><strong>Maintain low speed:</strong> Rotate at approx. 18-24 RPM.</li>
                      <li><strong>Target duration:</strong> 15 to 25 minutes.</li>
                      <li><strong>Result:</strong> Microscopic peaks melt and fill the gaps, leaving the shell completely round, smooth, and satin-finished.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 bg-amber-50/20 p-5 rounded-2xl border border-amber-100/50 text-amber-950">
                    <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider font-mono">Why This Stage is Unskippable</span>
                    <p className="leading-relaxed">
                      If the dragée surface is even slightly rough or has micro-ridges, the polishing glazes added in Stage 5 will accumulate unevenly inside the troughs. This results in white patches and a hazy, dull look instead of a sharp, reflective shine.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setActiveStage(4);
                      document.getElementById("panning-specifications-references")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                  >
                    Proceed to Stage 5: Gloss Polishing <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeStage === 4 && (
              <div className="space-y-6 animate-fade-in" id="stage5-reference-block">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-950" />
                    <div>
                      <h4 className="text-base font-extrabold text-gray-950">Master Shining & Glazing Recipes</h4>
                      <p className="text-[10px] text-gray-400 font-medium font-sans">Compare formulations with and without shellac (vegan option)</p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200" id="shine-method-toggles">
                    <button
                      onClick={() => setShineMethod("shellac")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        shineMethod === "shellac"
                          ? "bg-amber-950 text-amber-50 shadow-sm"
                          : "text-gray-600 hover:text-amber-950"
                      }`}
                    >
                      Gum Arabic + Shellac
                    </button>
                    <button
                      onClick={() => setShineMethod("vegan")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        shineMethod === "vegan"
                          ? "bg-amber-950 text-amber-50 shadow-sm"
                          : "text-gray-600 hover:text-amber-950"
                      }`}
                    >
                      Shellac-Free (Vegan)
                    </button>
                  </div>
                </div>

                {/* Shine Recipes Details */}
                {shineMethod === "shellac" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recipe-shellac-container">
                    {/* Formulas Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-amber-50/40 border border-amber-100/60 p-5 rounded-2xl space-y-4">
                        <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">1. Gum Arabic Shine Base</span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Gum Arabic Powder</span>
                            <strong className="font-mono text-gray-950">30%</strong>
                          </div>
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Granulated Sugar (Sucrose)</span>
                            <strong className="font-mono text-gray-950">30%</strong>
                          </div>
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Glucose Syrup (43DE)</span>
                            <strong className="font-mono text-gray-950">10%</strong>
                          </div>
                          <div className="flex justify-between pb-1">
                            <span className="text-gray-600">Water</span>
                            <strong className="font-mono text-gray-950">30%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-4">
                        <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">2. Shellac Gloss Glaze</span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-600">Dewaxed Shellac (Food-Grade)</span>
                            <strong className="font-mono text-gray-950">15%</strong>
                          </div>
                          <div className="flex justify-between pb-1">
                            <span className="text-gray-600">96% Food Ethanol / Carrier</span>
                            <strong className="font-mono text-gray-950">85%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Application Steps Column */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Two-Step Application Protocol</span>
                      
                      <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-amber-950 text-amber-50 text-[10px] font-bold flex items-center justify-center">1</div>
                          <h5 className="font-bold text-gray-950">The Satin Shine Base:</h5>
                          <p className="mt-1 text-gray-600">
                            Boil sugar and water, stir in glucose, then cool slightly to 60°C and whisk in the gum arabic. Filter and cool to room temperature (20°C - 22°C). Apply 1-2 doses of this syrup (approx. 2-3ml per kg of dragées) inside the spinning pan. Turn on warm dry air (26°C - 28°C) until dried. Repeat once. This provides the foundation gloss.
                          </p>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-amber-950 text-amber-50 text-[10px] font-bold flex items-center justify-center">2</div>
                          <h5 className="font-bold text-gray-950">The Shellac Gloss (Seal & Protect):</h5>
                          <p className="mt-1 text-gray-600">
                            <strong>Turn off all blowing air completely.</strong> Spray a very fine, measured mist of the shellac glaze (1.5ml per kg of dragée). Let the pan rotate for 3 minutes to rub and spread the glaze evenly. Turn on gentle, cold dry air (15°C - 17°C) to evaporate the alcohol. The dragées will instantly transition to a mirror-like, glossy shine that resists fingerprints and moisture!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recipe-vegan-container">
                    {/* Vegan Formula Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-emerald-50/40 border border-emerald-100/50 p-5 rounded-2xl space-y-4">
                        <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest font-mono block flex items-center gap-1">
                          🌱 Organic Vegan Polish Glaze
                        </span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Organic Tapioca Dextrin</span>
                            <strong className="font-mono text-emerald-950">25%</strong>
                          </div>
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Gum Arabic Powder</span>
                            <strong className="font-mono text-emerald-950">15%</strong>
                          </div>
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Granulated Sugar (Sucrose)</span>
                            <strong className="font-mono text-emerald-950">15%</strong>
                          </div>
                          <div className="flex justify-between border-b border-gray-100/50 pb-1">
                            <span className="text-gray-600">Organic Glucose Syrup</span>
                            <strong className="font-mono text-emerald-950">5%</strong>
                          </div>
                          <div className="flex justify-between pb-1">
                            <span className="text-gray-600">Demineralized Water</span>
                            <strong className="font-mono text-emerald-950">40%</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-normal">
                        <strong>Why it works:</strong> Organic Tapioca Dextrin mimics the glassy film-forming attributes of shellac, while Gum Arabic builds body and prevents the glaze layer from fracturing under physical friction.
                      </div>
                    </div>

                    {/* Vegan Process Column */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest font-mono block">Slow-Cure Cold Application Method</span>
                      
                      <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-emerald-800 text-emerald-50 text-[10px] font-bold flex items-center justify-center">1</div>
                          <h5 className="font-bold text-gray-950">Preparation:</h5>
                          <p className="mt-1 text-gray-600">
                            Heat the demineralized water to 80°C (176°F). Slowly whisk in the tapioca dextrin and sugar. Once completely dissolved, add the gum arabic and glucose syrup. Simmer gently for 5 minutes, then cool fully to 22°C (71.6°F) and filter through a fine screen.
                          </p>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-emerald-800 text-emerald-50 text-[10px] font-bold flex items-center justify-center">2</div>
                          <h5 className="font-bold text-gray-950">Cold Mist Application:</h5>
                          <p className="mt-1 text-gray-600">
                            Apply the vegan glaze in 2-3 very thin, misty doses (approx. 2ml per kg of chocolate). <strong>The drying must be slow!</strong> Turn on very gentle, dry, cool air (14°C - 16°C with relative humidity below 40%). High humidity or rapid heating will cause sugar recrystallization, leaving dull white rings.
                          </p>
                        </div>

                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-emerald-800 text-emerald-50 text-[10px] font-bold flex items-center justify-center">3</div>
                          <h5 className="font-bold text-gray-950">Carnauba Buffing:</h5>
                          <p className="mt-1 text-gray-600">
                            Once the glaze is dry but slightly tacky to the touch, add a tiny trace of micronized <strong>Carnauba wax powder</strong> (0.05% of batch weight). Let the pan spin at medium speed (24 RPM) for 15 minutes. The physical friction of the spheres sliding past each other buffs the carnauba platelets, producing an elegant, brilliant shine without shellac!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* JORDAN ALMOND SUGAR PANNING INTERACTIVE CALCULATOR AND DYNAMIC SOP */
          <div className="space-y-6 animate-fade-in" id="sugar-reference-dashboard">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                <div>
                  <h4 className="text-base font-extrabold text-gray-950">
                    {sugarPanningSubMode === "jordan" ? "Jordan Almond Sugar-Coating Lab" : "Chocolate Sugar-Shelling Lab"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {sugarPanningSubMode === "jordan" 
                      ? "Formulation calculator & SOP for coating raw roasted sweet almonds" 
                      : "Formulation calculator & SOP for coating chocolate-panned centers with a crisp shell"}
                  </p>
                </div>
              </div>

              {/* Environmental indicators */}
              <div className="flex items-center gap-2.5 bg-amber-50/50 border border-amber-100 px-3 py-1.5 rounded-xl text-[11px] font-mono text-amber-950">
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Room: 18-20°C
                </span>
                <span className="text-amber-200">|</span>
                <span className="font-bold">Humidity: &lt;45% RH</span>
              </div>
            </div>

            {/* Interactive Batch Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sugar-calculator-controls">
              {/* Batch Settings Panel */}
              <div className="lg:col-span-4 bg-gray-50 border border-gray-100 p-5 rounded-3xl space-y-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block">Batch Parameters</span>
                
                {/* Batch weight input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-gray-700 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-amber-900" /> {sugarPanningSubMode === "jordan" ? "Almond Core Weight" : "Chocolate Core Weight"}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        max="1000"
                        step="0.5"
                        value={almondBatchKg}
                        onChange={(e) => setAlmondBatchKg(Math.max(0.1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-white border border-gray-200 rounded focus:outline-none focus:border-amber-950"
                      />
                      <span className="font-mono text-xs font-bold text-gray-500">kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="100.0"
                    step="0.5"
                    value={almondBatchKg > 100 ? 100 : almondBatchKg}
                    onChange={(e) => setAlmondBatchKg(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-gray-400">
                    <span>0.5 kg</span>
                    <span>50.0 kg</span>
                    <span>100.0 kg</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {[1.0, 5.0, 30.0, 50.0].map((w) => (
                      <button
                        key={w}
                        onClick={() => setAlmondBatchKg(w)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          almondBatchKg === w
                            ? "bg-amber-950 text-amber-50 border-amber-950 shadow-sm"
                            : "bg-white text-gray-650 border-gray-200 hover:border-amber-900"
                        }`}
                      >
                        {w.toFixed(0)} kg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Syrup type toggles */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Syrup Stabilizer</label>
                  <div className="flex bg-gray-200/50 p-1 rounded-xl border border-gray-200/40">
                    <button
                      onClick={() => setUseInvertSyrup(false)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        !useInvertSyrup
                          ? "bg-amber-950 text-amber-50 shadow-xs"
                          : "text-gray-600 hover:text-amber-950"
                      }`}
                    >
                      Glucose 42 DE
                    </button>
                    <button
                      onClick={() => setUseInvertSyrup(true)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        useInvertSyrup
                          ? "bg-amber-950 text-amber-50 shadow-xs"
                          : "text-gray-600 hover:text-amber-950"
                      }`}
                    >
                      Invert Sugar
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 italic leading-snug">
                    {useInvertSyrup 
                      ? "Invert sugar gives a tighter, crisper matrix, but requires absolute room humidity controls under 45% RH."
                      : "Standard Glucose Syrup prevents sucrose crystallization in transit, yielding a durable satin chew."}
                  </p>
                </div>

                {/* Color Palette Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" /> Pastel Shade Palette
                  </label>
                  <div className="flex gap-2 justify-between">
                    {Object.keys(COLOR_PRESETS).map((colKey) => {
                      const col = COLOR_PRESETS[colKey];
                      const isSel = selectedColor === colKey;
                      return (
                        <button
                          key={colKey}
                          onClick={() => setSelectedColor(colKey)}
                          title={col.name}
                          style={{ backgroundColor: col.hex }}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center relative shadow-xs ${
                            isSel ? "scale-110 border-amber-950" : "border-gray-200/60 hover:scale-105"
                          }`}
                        >
                          {isSel && (
                            <div className="w-1.5 h-1.5 bg-amber-950 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-2 bg-white border border-gray-100 rounded-xl text-[10px] leading-normal">
                    <strong className={COLOR_PRESETS[selectedColor].textClass}>{COLOR_PRESETS[selectedColor].name}:</strong>{" "}
                    <span className="text-gray-500 font-medium">{COLOR_PRESETS[selectedColor].description}</span>
                  </div>
                </div>
              </div>

              {/* Master Recipe Scaling Output */}
              <div className="lg:col-span-8 bg-amber-50/10 border border-amber-100/50 p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest font-mono block">Scaled Master Formulation</span>
                    <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md font-bold font-mono">
                      {sugarPanningSubMode === "chocolate-coated" ? "70° Brix Shell" : "75° Brix Shell"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => downloadAcademicGuidebook(almondBatchKg, selectedColor, sugarPanningSubMode)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-950 text-amber-50 rounded-xl font-bold text-[10px] hover:bg-amber-900 cursor-pointer shadow-xs transition-all tracking-wide uppercase font-mono"
                    title="Download offline-ready study book and interactive scaling tool"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Download PDF/HTML Study Book
                  </button>
                </div>

                {sugarPanningSubMode === "chocolate-coated" ? (
                  /* Precise math logic and exact template formatting as requested */
                  <div className="bg-white border border-amber-100/60 p-5 rounded-2xl shadow-2xs space-y-4">
                    <div className="text-xs font-bold text-gray-500 font-mono pb-2 border-b border-gray-100">
                      RECIPE OUTPUT ({almondBatchKg.toFixed(1)} kg Core)
                    </div>
                    <ul className="space-y-4 text-xs text-gray-800 font-sans leading-relaxed">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-950 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-gray-900 font-medium">Core Centers:</span>{" "}
                          <strong className="font-mono text-amber-950 text-sm">
                            {(almondBatchKg * 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} g
                          </strong>
                          <p className="text-[10px] text-gray-400 mt-0.5">Chocolate-panned almond centers loaded directly into the panning drum</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-gray-900 font-medium">Pre-Coat Solution:</span>{" "}
                          <strong className="font-mono text-amber-950">
                            {Math.round(almondBatchKg * 6)} g
                          </strong>{" "}
                          Gum Arabic Powder +{" "}
                          <strong className="font-mono text-amber-950">
                            {Math.round(almondBatchKg * 9)} g
                          </strong>{" "}
                          Warm Water
                          <p className="text-[10px] text-gray-400 mt-0.5">Dissolved at 60°C to create an oil and fat-impermeable sealant shield</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-gray-900 font-medium">Engrossing Base Syrup:</span>{" "}
                          <strong className="font-mono text-amber-950">
                            {Math.round(almondBatchKg * 266).toLocaleString()} g
                          </strong>{" "}
                          Sucrose +{" "}
                          <strong className="font-mono text-amber-950">
                            {Math.round(almondBatchKg * 14).toLocaleString()} g
                          </strong>{" "}
                          Glucose +{" "}
                          <strong className="font-mono text-amber-950">
                            {Math.round(almondBatchKg * 120).toLocaleString()} g
                          </strong>{" "}
                          Water (Total Cooked Weight:{" "}
                          <strong className="font-mono text-amber-950 bg-amber-50 px-1.5 py-0.5 rounded">
                            {Math.round(almondBatchKg * 400).toLocaleString()} g
                          </strong>
                          )
                          <p className="text-[10px] text-gray-400 mt-0.5">Yields a crisp 25% dry sugar solids shell relative to the core centers</p>
                        </div>
                      </li>
                    </ul>

                    {/* Literal text breakdown matching user request exactly */}
                    <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/50 space-y-1.5">
                      <span className="text-[9px] font-extrabold text-amber-900 uppercase tracking-wider font-mono block">Standard Recipe Sheet</span>
                      <pre className="text-[10px] font-mono text-amber-950 whitespace-pre-wrap leading-relaxed">
{`- Core Centers: ${(almondBatchKg * 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} g
- Pre-Coat Solution: ${Math.round(almondBatchKg * 6)} g Gum Arabic Powder + ${Math.round(almondBatchKg * 9)} g Warm Water
- Engrossing Base Syrup: ${Math.round(almondBatchKg * 266).toLocaleString()} g Sucrose + ${Math.round(almondBatchKg * 14).toLocaleString()} g Glucose + ${Math.round(almondBatchKg * 120).toLocaleString()} g Water (Total Cooked Weight: ${Math.round(almondBatchKg * 400).toLocaleString()} g)`}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Beautiful nested hierarchy for Classic Jordan Almonds to clarify the single base syrup preparation */
                  <div className="bg-white border border-amber-100/60 p-5 rounded-2xl shadow-2xs space-y-4">
                    <div className="text-xs font-bold text-gray-500 font-mono pb-2 border-b border-gray-100 flex justify-between">
                      <span>RECIPE HIERARCHY ({almondBatchKg.toFixed(1)} kg Core)</span>
                      <span className="text-[10px] text-gray-400 font-normal">No double-cooking required</span>
                    </div>

                    <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
                      {/* Core */}
                      <div className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-950 mt-1.5 shrink-0" />
                        <div>
                          <strong className="text-gray-900">Phase 0: Roasted Almond Core:</strong>{" "}
                          <span className="font-mono text-amber-950 font-bold bg-amber-50/50 px-1.5 py-0.5 rounded">
                            {Math.round(almondBatchKg * 1000).toLocaleString()} g
                          </span>
                        </div>
                      </div>

                      {/* Phase 1 */}
                      <div className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                        <div>
                          <strong className="text-gray-900">Phase 1: Pre-Coat Seal:</strong>{" "}
                          <span className="font-mono text-gray-600">
                            {Math.round(almondBatchKg * 30)} g Gum Arabic + {Math.round(almondBatchKg * 60)} g Warm Water
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">Seals the raw almond skin to prevent natural oils from seeping into the shell</p>
                        </div>
                      </div>

                      {/* Phase 2: Cooked once, then divided */}
                      <div className="flex items-start gap-3 border-l-2 border-amber-200/50 pl-3 ml-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div className="space-y-2 w-full">
                          <div>
                            <strong className="text-gray-900">Phase 2: Master Base Syrup (Cooked Once):</strong>{" "}
                            <span className="font-mono font-bold text-amber-950">
                              {Math.round(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + 235)).toLocaleString()} g
                            </span>
                            <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                              {Math.round(almondBatchKg * 700).toLocaleString()}g Sucrose + {Math.round(almondBatchKg * (useInvertSyrup ? 40 : 35))}g {useInvertSyrup ? "Invert" : "Glucose"} + {Math.round(almondBatchKg * 235).toLocaleString()}g Water
                            </div>
                            <p className="text-[10px] text-amber-900 italic font-semibold mt-1">
                              💡 Prepare this master syrup batch first, then divide it into two portions:
                            </p>
                          </div>

                          {/* Nested Sub-Portions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-wider font-mono block">Portion A: Opaque Base (60%)</span>
                              <span className="font-mono text-gray-800 font-bold block mt-1">
                                {Math.round(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + 235) * 0.6).toLocaleString()} g Syrup
                              </span>
                              <span className="text-[10px] text-amber-950 font-bold block mt-0.5">
                                + {Math.round(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + 235) * 0.6 * 0.01).toLocaleString()} g Titanium Dioxide
                              </span>
                              <p className="text-[9px] text-gray-400 mt-1 leading-normal">Used for initial grossing to hide the brown color of the almond core.</p>
                            </div>

                            <div className="bg-amber-50/35 p-2.5 rounded-xl border border-amber-100/50">
                              <span className="text-[9px] font-extrabold text-amber-900 uppercase tracking-wider font-mono block">Portion B: Colored Syrup (40%)</span>
                              <span className="font-mono text-gray-800 font-bold block mt-1">
                                {Math.round(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + 235) * 0.4).toLocaleString()} g Syrup
                              </span>
                              <span className="text-[10px] text-amber-900 font-bold block mt-0.5">
                                + {(almondBatchKg * 1000 * (selectedColor === "pink" ? 0.0015 : selectedColor === "blue" ? 0.0020 : selectedColor === "green" ? 0.0012 : selectedColor === "lavender" ? 0.0025 : 0.0100)).toFixed(1)} g Botanical Dye
                              </span>
                              <p className="text-[9px] text-gray-400 mt-1 leading-normal">Used in Phase 3 to build the vibrant, decorative outer candy color.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ladle Charge Guide (Per Coat) */}
                <div className="bg-amber-950/5 border border-amber-950/10 p-4 rounded-2xl space-y-3" id="ladle-charge-guide-card">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-900" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                      Ladle Charge Guide (Per Coat)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    When working with <strong className="font-mono text-gray-950">{almondBatchKg.toFixed(1)} kg</strong> of mass in the pan, throwing too much syrup in at once will cause instant clumping or melt your chocolate. Keep your ladle additions tightly calibrated to these dynamically scaled parameters:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-amber-900/10 p-2.5 rounded-xl">
                      <span className="text-[9px] font-extrabold text-amber-900 uppercase font-mono block">First 3 Coats (Foundation)</span>
                      <span className="text-base font-bold text-gray-950 font-mono block mt-1">
                        {Math.round(60 * (almondBatchKg / 10))}–{Math.round(80 * (almondBatchKg / 10))} g <span className="text-xs font-normal text-gray-500">/ charge</span>
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        Highly controlled application while the gum barrier is stabilizing over the centers.
                      </p>
                    </div>
                    <div className="bg-white border border-amber-900/10 p-2.5 rounded-xl">
                      <span className="text-[9px] font-extrabold text-amber-900 uppercase font-mono block">Middle Coats (Weight Building)</span>
                      <span className="text-base font-bold text-gray-950 font-mono block mt-1">
                        {Math.round(100 * (almondBatchKg / 10))}–{Math.round(130 * (almondBatchKg / 10))} g <span className="text-xs font-normal text-gray-500">/ charge</span>
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        Scale up as total surface area grows and tumbling pieces gain rolling momentum.
                      </p>
                    </div>
                    <div className="bg-white border border-amber-900/10 p-2.5 rounded-xl">
                      <span className="text-[9px] font-extrabold text-amber-900 uppercase font-mono block">Final 2 Coats (Smooth-Out)</span>
                      <span className="text-base font-bold text-gray-950 font-mono block mt-1">
                        {Math.round(50 * (almondBatchKg / 10))}–{Math.round(60 * (almondBatchKg / 10))} g <span className="text-xs font-normal text-gray-500">/ charge</span>
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        Dilute colored syrup slightly with water; apply with blowing air completely turned off.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Handbook & PDF Download Callout */}
                <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4" id="academic-offline-handbook-banner">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-950 text-amber-50 rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Artisan Panning Interactive Study Handbook
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-normal mt-0.5 max-w-md">
                        <strong>Student is studying offline without internet?</strong> Download the complete, self-contained educational workbook. Features step-by-step SOP guides, troubleshooting logs, and a <strong>fully interactive offline recipe calculator</strong> optimized for printing and PDF generation.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadAcademicGuidebook(almondBatchKg, selectedColor, sugarPanningSubMode)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all shrink-0 uppercase font-mono tracking-wider"
                  >
                    Download Study Book (PDF/HTML) <ArrowRight className="w-4 h-4 animate-pulse" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stage-by-Stage Detailed Specifications and SOP Checklist */}
            <div className="pt-4 border-t border-gray-100" id="sugar-stage-sop-block">
              {activeStage === 0 && (
                <div className="space-y-4 animate-fade-in" id="sugar-stage1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-950" />
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-950">Phase 1: Pre-Coat / Gumming Protocol</h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {sugarPanningSubMode === "jordan" 
                          ? "Builds a sealant film directly on the roasted almond core to prevent nut oil migration" 
                          : "Builds an oil-impermeable barrier directly over the chocolate core"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">SOP Formulation Specs</span>
                      <div className="space-y-2 text-xs text-gray-600 font-sans">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Gum Solution Ratio</span>
                          <strong className="text-gray-900">
                            {sugarPanningSubMode === "jordan" ? "33% Gum Arabic Solution" : "40% Gum Arabic Solution"}
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Dry Gum Arabic Powder</span>
                          <strong className="text-amber-950 font-mono">
                            {(almondBatchKg * (sugarPanningSubMode === "jordan" ? 30 : 40)).toFixed(1)} g
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Warm Water (60°C)</span>
                          <strong className="text-amber-950 font-mono">{(almondBatchKg * 60).toFixed(1)} g</strong>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Application Dose</span>
                          <strong className="text-amber-950 font-mono">{(almondBatchKg * 10).toFixed(0)} - {(almondBatchKg * 15).toFixed(0)} ml / coat</strong>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3 text-xs text-gray-600 leading-relaxed">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Step-by-Step SOP Checklist</span>
                      <ul className="space-y-2 pl-4 list-decimal">
                        <li>
                          <strong>Load Centers:</strong> Load {(almondBatchKg * 1000).toFixed(0)} g of{" "}
                          {sugarPanningSubMode === "jordan" ? "dry-roasted, cooled sweet almonds" : "chocolate-panned almond centers"}{" "}
                          into the panning drum. Rotate at 20–28 RPM with the <strong>air turned off</strong>.
                        </li>
                        <li>
                          <strong>Prepare Solution:</strong> Dissolve {(almondBatchKg * (sugarPanningSubMode === "jordan" ? 30 : 40)).toFixed(1)}g of Gum Arabic Powder in {(almondBatchKg * 60).toFixed(1)}g of warm demineralized water (60°C) until smooth. Filter to catch bubbles and aggregates.
                        </li>
                        <li><strong>Apply Charge:</strong> Slowly drizzle {(almondBatchKg * 12).toFixed(0)} ml of the solution directly onto the tumbling centers. Let roll for 60–90 seconds to build uniform wetness.</li>
                        <li>
                          <strong>Dehumidifying Air:</strong> Turn the <strong>air on</strong> (for Jordan Almonds, warm air at 30°C is perfect; for chocolate cores, use cool air at 18-21°C). Dry completely until the almonds roll with a loud, crisp click-clack and show a satin, non-sticky coating.
                        </li>
                        <li><strong>Apply 2nd Coat:</strong> Repeat steps 3 and 4 once. This forms a cross-linked gum matrix that seals the core and prevents oil or chocolate bleed-through.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setActiveStage(1);
                        document.getElementById("sugar-stage-sop-block")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                    >
                      {sugarPanningSubMode === "jordan" ? "Proceed to Phase 2: Sugar Grossing" : "Proceed to Phase 2: Opaque Grossing"} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeStage === 1 && (
                <div className="space-y-4 animate-fade-in" id="sugar-stage2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-950" />
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-950">
                        {sugarPanningSubMode === "jordan" ? "Phase 2: Grossing / Build-Up (75° Brix)" : "Phase 2: Opaque White Base Grossing (60% Syrup)"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {sugarPanningSubMode === "jordan" 
                          ? "Builds a solid, thick, hard-panned crystalline sugar shell directly over the almond core" 
                          : "Builds the white crystalline foundation to hide the dark chocolate core"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">Opaque Syrup Allocation</span>
                      <div className="space-y-2 text-xs text-gray-600 font-sans">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Base Syrup ({sugarPanningSubMode === "jordan" ? "75° Brix" : "70° Brix"})</span>
                          <strong className="text-gray-900">
                            {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315))).toFixed(1)} g
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Opaque Base Portion (60%)</span>
                          <strong className="text-amber-950 font-mono">
                            {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.6).toFixed(1)} g
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>{sugarPanningSubMode === "jordan" ? "Titanium Dioxide (1.0%)" : "Rice Starch (1.5%)"}</span>
                          <strong className="text-amber-950 font-mono">
                            {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.6 * (sugarPanningSubMode === "jordan" ? 0.010 : 0.015)).toFixed(1)} g
                          </strong>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Ladle Size per Charge</span>
                          <strong className="text-amber-950 font-mono">{(almondBatchKg * 8).toFixed(0)} - {(almondBatchKg * 12).toFixed(0)} ml / charge</strong>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3 text-xs text-gray-600 leading-relaxed">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Step-by-Step SOP Checklist</span>
                      <ul className="space-y-2 pl-4 list-decimal">
                        <li>
                          <strong>Prepare base syrup:</strong> Heat sucrose, water, and glucose (or invert alternative) to dissolve. Keep syrup warm at 70°C.
                        </li>
                        <li>
                          <strong>Opaque Blend:</strong> Separate the 60% opaque portion ({(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.6).toFixed(0)}g) and whisk in {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.6 * (sugarPanningSubMode === "jordan" ? 0.010 : 0.015)).toFixed(1)}g of {sugarPanningSubMode === "jordan" ? "Titanium Dioxide whitening opacifier" : "Rice Starch or Calcium Carbonate opacifier"}.
                        </li>
                        <li><strong>Apply Charge:</strong> Turn air **off**, drizzle a {(almondBatchKg * 10).toFixed(0)} ml ladle of the opaque syrup over the rolling almond bed. Let spread for 60 seconds to coat all faces.</li>
                        <li>
                          <strong>Crystallization:</strong> Turn blowing air **on** ({sugarPanningSubMode === "jordan" ? "Hot air at 38°C to dry rapidly and crystallize" : "Cool air with strict ceiling of 18–21°C to keep chocolate core solid"}). Dry completely until white sugar dust appears on the back drum wall.
                        </li>
                        <li>
                          <strong>Build Shell Thickness:</strong> {sugarPanningSubMode === "jordan" 
                            ? "Repeat this cycle for 15 to 25 coats. Build a solid, heavy crystalline shell until the almond weight has increased by approximately 50-60%."
                            : "Repeat this cycle for 5 to 8 coats. Once the dark chocolate core is fully masked beneath a solid white shell, proceed to the color phase."}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setActiveStage(2);
                        document.getElementById("sugar-stage-sop-block")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                    >
                      Proceed to Phase 3: Color Application <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeStage === 2 && (
                <div className="space-y-4 animate-fade-in" id="sugar-stage3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-950" />
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-950">Phase 3: Color & Smooth-Out (40% Syrup)</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Layers uniform botanical pastel pigments and self-burnishes to a flawless matte</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">Color Syrup Recipe</span>
                      <div className="space-y-2 text-xs text-gray-600 font-sans">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Colored Syrup Portion (40%)</span>
                          <strong className="text-amber-950 font-mono">
                            {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.4).toFixed(1)} g
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Active Dye Presets</span>
                          <strong className={COLOR_PRESETS[selectedColor].textClass}>{COLOR_PRESETS[selectedColor].name}</strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Botanical Dye (Scaled)</span>
                          <strong className="text-amber-950 font-mono">
                            {(almondBatchKg * 1000 * (selectedColor === "pink" ? 0.0015 : selectedColor === "blue" ? 0.0020 : selectedColor === "green" ? 0.0012 : selectedColor === "lavender" ? 0.0025 : 0.0100)).toFixed(2)} g
                          </strong>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Natural Source</span>
                          <span className="text-[10px] text-gray-500 font-medium">{COLOR_PRESETS[selectedColor].dye.split(" (")[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3 text-xs text-gray-600 leading-relaxed">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Step-by-Step SOP Checklist</span>
                      <ul className="space-y-2 pl-4 list-decimal">
                        <li>
                          <strong>Dye Blending:</strong> Mix {(almondBatchKg * 1000 * (selectedColor === "pink" ? 0.0015 : selectedColor === "blue" ? 0.0020 : selectedColor === "green" ? 0.0012 : selectedColor === "lavender" ? 0.0025 : 0.0100)).toFixed(2)}g of your selected botanical dye directly into the {(almondBatchKg * (700 + (useInvertSyrup ? 40 : 35) + (sugarPanningSubMode === "jordan" ? 235 : 315)) * 0.4).toFixed(0)}g colored syrup portion. Hold syrup temperature at 30–35°C.
                        </li>
                        <li>
                          <strong>Apply Color Coats:</strong> Apply 3 to 5 coats using the standard cycle: Turn **Air off**, apply syrup charge, let spread for 60 seconds, turn **Air on** ({sugarPanningSubMode === "jordan" ? "warm air at 30°C" : "cool air at 18-20°C"}), dry completely.
                        </li>
                        <li>
                          <strong>The Final Smooth-out:</strong> For the last 1–2 coats, dilute the remaining colored syrup slightly with water to 60–62° Brix.
                        </li>
                        <li><strong>Self-Burnishing:</strong> Apply this final charge and turn the blowing air **completely off**. Let the almonds tumble and burnish against one another for 4–5 minutes until the shell turns into a flawless porcelain-matte finish.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setActiveStage(3);
                        document.getElementById("sugar-stage-sop-block")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-950 text-amber-50 rounded-xl font-bold text-xs hover:bg-amber-900 cursor-pointer shadow-xs transition-all"
                    >
                      Proceed to Phase 4: Wax Buffing <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeStage === 3 && (
                <div className="space-y-4 animate-fade-in" id="sugar-stage4">
                  <div className="flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-amber-950" />
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-950">Phase 4: Carnauba Wax Buffing & Glazing</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Develops a protective, hydrophobic crystalline mirror polish</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-3">
                      <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest font-mono block">Buffing Specifications</span>
                      <div className="space-y-2 text-xs text-gray-600 font-sans">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Wax Ratio</span>
                          <strong className="text-gray-900">0.05% of almond weight</strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Micronized Carnauba Wax</span>
                          <strong className="text-emerald-800 font-mono">{(almondBatchKg * 0.5).toFixed(2)} g</strong>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                          <span>Air Setting</span>
                          <strong className="text-red-800 uppercase font-mono">Strictly OFF</strong>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Tumbling Time</span>
                          <strong className="text-gray-900">15 - 20 minutes</strong>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-3 text-xs text-gray-600 leading-relaxed">
                      <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono block">Step-by-Step SOP Checklist</span>
                      <ul className="space-y-2 pl-4 list-decimal">
                        <li><strong>Ensure Dryness:</strong> Verify the sugar shell is completely dry, smooth, and room-cooled.</li>
                        <li><strong>Cut Off Blowing Air:</strong> Ensure both warm and cold blowing air are completely shut off. The process requires friction alone.</li>
                        <li><strong>Add Carnauba:</strong> Sprinkle {(almondBatchKg * 0.5).toFixed(2)} g of micronized Carnauba wax powder directly over the tumbling almonds.</li>
                        <li><strong>Physical Buffing:</strong> Run the drum rotating continuously at 24-28 RPM. Let the almonds tumble and friction-rub against one another for 15 minutes.</li>
                        <li><strong>Mirror Reflection:</strong> As the flat carnauba wax platelets align and polish, watch the porcelain matte shells transition into a bright, glassy high gloss!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
