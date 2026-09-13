import React, { useState } from "react";
import { COCOA_VARIETIES } from "../data";
import { CocoaVariety } from "../types";
import { Coffee, Compass, Sparkles, Award, MapPin, Trees, Droplets, Flame, Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SensoryTastingLab from "./SensoryTastingLab";
// @ts-ignore
import cocoaComparisonImg from "../assets/images/cocoa_bean_comparison_1782989925072.jpg";

interface IndianStateOrigin {
  name: string;
  share: string;
  climate: string;
  intercropping: string;
  flavorProfile: string;
  roastRecommendation: string;
  description: string;
}

const INDIAN_ORIGINS: IndianStateOrigin[] = [
  {
    name: "Andhra Pradesh",
    share: "~45% of India's production",
    climate: "Hot & Semi-Arid, relying on Godavari delta irrigation",
    intercropping: "Intercropped with Coconut and Oil Palm canopies",
    flavorProfile: "Mild, creamy, low acidity with sweet caramel, warm wood, and soft nutty notes.",
    roastRecommendation: "Medium-Light (122°C - 126°C for 22 minutes) to bring out sweet creamy milk-chocolate notes.",
    description: "Andhra Pradesh leads Indian cocoa volume. Due to irrigated farming and rich alluvial soils, the beans grow exceptionally large, plump, and consistent. The low natural acidity makes it highly prized for smooth, traditional milk chocolate profiles."
  },
  {
    name: "Kerala",
    share: "~35% of India's production",
    climate: "Humid tropical monsoon with organic-rich hilly soils",
    intercropping: "Nutmeg, Rubber, Coconut, and black pepper vines",
    flavorProfile: "Expressive red fruit acidity, raisins, mild spices (clove/cinnamon), and deep chocolatey notes.",
    roastRecommendation: "Gentle Roasting (118°C - 122°C for 18-20 minutes) to retain the complex spicy-fruity volatile esters.",
    description: "Kerala is the historical home of Indian cocoa, grown primarily along the fertile foothills of the Western Ghats (Idukki and Wayanad). The rich forest soils, high organic matter, and shade from nutmeg and spice trees infuse the beans with unmatched earthy-spicy and fruity complexity."
  },
  {
    name: "Karnataka",
    share: "~12% of India's production",
    climate: "Sub-tropical forest elevation with red volcanic soils",
    intercropping: "Areca nut palm, coffee, and cardamom canopies",
    flavorProfile: "Balanced, bright citrus acidity, sweet honey undertones, and light dried-berry notes.",
    roastRecommendation: "Medium Roasting (124°C - 128°C for 20-24 minutes) to structure and balance the delicate citrus with chocolate tones.",
    description: "Grown in high-altitude shade conditions, primarily in the Dakshina Kannada and Malnad districts. The cool nights and well-drained volcanic-red soils allow for a slow pod-ripening cycle, concentrating natural sugars and contributing to a highly aromatic, honeyed, citrus-forward fine flavor profile."
  },
  {
    name: "Tamil Nadu",
    share: "~8% of India's production",
    climate: "Tropical windward climate with advanced drip irrigation",
    intercropping: "Coconut groves, bananas, and dry-canopy foliage",
    flavorProfile: "Tangy fruit forward, green tea notes, earthy dry herbs, and hints of toasted malt.",
    roastRecommendation: "Balanced Roasting (120°C - 124°C for 20 minutes) to suppress herbal green notes while promoting bright malty flavors.",
    description: "Tamil Nadu's cocoa sector, centered around the windy Pollachi plains and Coimbatore district, is a showcase of precision agriculture. Through well-managed state-of-the-art drip networks and strict modern fermentation box cascades, their beans yield clean, tangy, and highly consistent craft-chocolate batches."
  }
];

function VarietyDetailContent({ variety, isDarkTheme }: { variety: CocoaVariety; isDarkTheme: boolean }) {
  return (
    <div className="space-y-4">
      {/* Primary Origins */}
      <div className={`border-b pb-3 border-dashed ${isDarkTheme ? "border-amber-900/40" : "border-gray-200"}`}>
        <span className={`text-[10px] uppercase tracking-wider font-mono ${isDarkTheme ? "text-amber-300 font-bold" : "text-amber-900/70 font-bold"}`}>Primary Origins</span>
        <p className={`text-sm mt-0.5 font-semibold ${isDarkTheme ? "text-amber-100" : "text-gray-800"}`}>{variety.origin}</p>
        <span className={`text-[11px] mt-1 block font-mono ${isDarkTheme ? "text-amber-300/90 font-medium" : "text-amber-800 font-medium"}`}>Rarity: {variety.rarity}</span>
      </div>

      {/* Sensory Flavor Profile */}
      <div>
        <h5 className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDarkTheme ? "text-amber-300 font-bold" : "text-amber-900/70 font-bold"}`}>Sensory Flavor Profile</h5>
        <p className={`text-base mt-1 font-sans font-medium leading-relaxed ${isDarkTheme ? "text-amber-50" : "text-gray-800"}`}>{variety.flavorProfile}</p>
      </div>

      {/* Acidity & Bitterness */}
      <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-xl border ${isDarkTheme ? "bg-amber-900/30 border-amber-900/40" : "bg-gray-50 border-gray-200"}`}>
        <div>
          <span className={`text-[10px] uppercase tracking-wider font-mono block ${isDarkTheme ? "text-amber-300/75 font-semibold" : "text-amber-900/60 font-semibold"}`}>Acidity Level</span>
          <p className={`font-semibold text-sm mt-0.5 ${isDarkTheme ? "text-amber-100" : "text-gray-800"}`}>{variety.acidity}</p>
        </div>
        <div>
          <span className={`text-[10px] uppercase tracking-wider font-mono block ${isDarkTheme ? "text-amber-300/75 font-semibold" : "text-amber-900/60 font-semibold"}`}>Bitterness & Astringency</span>
          <p className={`font-semibold text-sm mt-0.5 ${isDarkTheme ? "text-amber-100" : "text-gray-800"}`}>{variety.bitterness}</p>
        </div>
      </div>

      {/* Artisanal Roasting Recommendation */}
      <div>
        <h5 className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDarkTheme ? "text-amber-300 font-bold" : "text-amber-900/70 font-bold"}`}>Artisanal Roasting Recommendation</h5>
        <div className={`mt-2 p-3 rounded-xl flex items-center gap-3 border ${
          isDarkTheme 
            ? "bg-amber-900/40 border-amber-800/50 text-amber-50" 
            : "bg-amber-50/50 border-amber-200 text-amber-950"
        }`}>
          <Sparkles className={`w-5 h-5 flex-shrink-0 ${isDarkTheme ? "text-amber-300" : "text-amber-700"}`} />
          <p className="text-sm font-medium leading-relaxed">{variety.roastRecommendation}</p>
        </div>
      </div>

      {/* Genetics & Cultivation Notes */}
      <div>
        <h5 className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDarkTheme ? "text-amber-300 font-bold" : "text-amber-900/70 font-bold"}`}>Genetics & Cultivation Notes</h5>
        <p className={`text-sm mt-1 leading-relaxed ${isDarkTheme ? "text-amber-100/90" : "text-gray-700"}`}>{variety.description}</p>
      </div>

      {/* Indian Cultivation Profile */}
      {variety.indianContext && (
        <div className={`pt-3 border-t space-y-2 ${isDarkTheme ? "border-amber-900/40" : "border-gray-200"}`} id="variety-indian-context">
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isDarkTheme
              ? "bg-emerald-950/60 text-emerald-300 border-emerald-900/40"
              : "bg-emerald-50 text-emerald-800 border-emerald-200/40"
          }`}>
            <span className="text-xs">🇮🇳</span> Indian Cultivation Profile
          </div>
          <p className={`text-xs rounded-xl p-3 leading-relaxed font-sans font-medium border ${
            isDarkTheme
              ? "bg-emerald-950/30 text-emerald-100/95 border-emerald-900/30"
              : "bg-emerald-50/20 text-gray-700 border-emerald-150"
          }`}>
            {variety.indianContext}
          </p>
        </div>
      )}
    </div>
  );
}

function StateDetailContent({ state, isDarkTheme }: { state: IndianStateOrigin; isDarkTheme: boolean }) {
  return (
    <div className="space-y-4 text-left">
      {/* Core Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isDarkTheme 
            ? "bg-amber-950/40 border-amber-900/40 text-amber-100" 
            : "bg-white border-gray-200 text-gray-800"
        }`}>
          <span className={`text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1 ${
            isDarkTheme ? "text-amber-300" : "text-amber-900/70"
          }`}>
            <Droplets className="w-3.5 h-3.5 text-blue-500" /> Climate & Microclimate
          </span>
          <p className="text-xs font-semibold leading-relaxed">{state.climate}</p>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isDarkTheme 
            ? "bg-amber-950/40 border-amber-900/40 text-amber-100" 
            : "bg-white border-gray-200 text-gray-800"
        }`}>
          <span className={`text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1 ${
            isDarkTheme ? "text-amber-300" : "text-amber-900/70"
          }`}>
            <Trees className="w-3.5 h-3.5 text-emerald-600" /> Intercropping Partners
          </span>
          <p className="text-xs font-semibold leading-relaxed">{state.intercropping}</p>
        </div>
      </div>

      {/* Flavor description */}
      <div className="space-y-1">
        <span className={`text-[10px] font-extrabold uppercase tracking-widest font-mono block ${
          isDarkTheme ? "text-amber-300" : "text-amber-900"
        }`}>
          Sensory Flavor Attributes
        </span>
        <p className={`text-sm font-semibold p-3 rounded-xl border leading-relaxed ${
          isDarkTheme 
            ? "bg-amber-900/30 border-amber-900/30 text-amber-50" 
            : "bg-amber-50/50 border-amber-200 text-gray-900"
        }`}>
          ✨ {state.flavorProfile}
        </p>
      </div>

      {/* Roasting Specifications */}
      <div className={`border p-4 rounded-xl space-y-3 ${
        isDarkTheme 
          ? "bg-amber-900/20 border-amber-800/30 text-amber-50" 
          : "bg-gray-50 border-gray-200 text-gray-800"
      }`}>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-800 animate-pulse" />
          <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
            isDarkTheme ? "text-amber-200" : "text-gray-950"
          }`}>
            Master Roaster Parameters (For Reference)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className={`text-[10px] block font-mono ${isDarkTheme ? "text-amber-300" : "text-amber-900/70 font-semibold"}`}>RECOMMENDED TEMP</span>
            <strong className={`${isDarkTheme ? "text-amber-200" : "text-amber-950"}`}>
              {state.roastRecommendation.split(" (")[1]?.split(")")[0] || state.roastRecommendation.split("(")[0]}
            </strong>
          </div>
          <div>
            <span className={`text-[10px] block font-mono ${isDarkTheme ? "text-amber-300" : "text-amber-900/70 font-semibold"}`}>ROASTING DURATION</span>
            <strong className={`font-mono ${isDarkTheme ? "text-amber-200" : "text-amber-950"}`}>
              {state.roastRecommendation.match(/\d+-\d+\s+minutes|\d+\s+minutes/i)?.[0] || "20-22 mins"}
            </strong>
          </div>
        </div>
        <div className={`border-t pt-2.5 ${isDarkTheme ? "border-amber-900/30" : "border-gray-200"}`}>
          <span className={`text-[9px] font-bold block ${isDarkTheme ? "text-amber-300" : "text-gray-500"}`}>ROAST PROFILE RATIONALE</span>
          <p className={`text-xs leading-relaxed font-sans ${isDarkTheme ? "text-amber-100/90" : "text-gray-750"}`}>
            {state.roastRecommendation}
          </p>
        </div>
      </div>

      {/* Geographics Bio */}
      <div>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest font-mono block ${
          isDarkTheme ? "text-amber-300" : "text-gray-400"
        }`}>
          Terroir & Ecosystem Characteristics
        </span>
        <p className={`text-xs leading-relaxed mt-1 ${isDarkTheme ? "text-amber-200/80" : "text-gray-600"}`}>
          {state.description}
        </p>
      </div>
    </div>
  );
}

export default function SourcingModule() {
  const [selectedVariety, setSelectedVariety] = useState<CocoaVariety | null>(null);
  const [expandedVarietyName, setExpandedVarietyName] = useState<string | null>(null);
  const [selectedIndiaState, setSelectedIndiaState] = useState<IndianStateOrigin | null>(null);
  const [expandedIndiaStateName, setExpandedIndiaStateName] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"origins" | "sensory">("origins");

  return (
    <div className="space-y-8" id="sourcing-module-container">
      {/* Intro Banner */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col md:flex-row gap-6 items-start" id="sourcing-intro-banner">
        <div className="bg-amber-100 p-3 rounded-xl text-amber-800" id="sourcing-icon-container">
          <Coffee className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-amber-950 font-sans">Module 1: Terroir, Genetics & Post-Harvest Processing</h3>
          <p className="text-amber-900 text-sm leading-relaxed">
            Great chocolate doesn't begin in the melanger—it begins in the tropical forest. Cocoa flavors are determined by three key pillars: <strong>Genetics</strong>, <strong>Terroir</strong> (soil, humidity, shade), and <strong>Fermentation</strong>. Learn how fine flavor beans differ from bulk commodity beans, and how to roast each variety to preserve their volatile aromatics.
          </p>
        </div>
      </div>

      {/* Sub-tab Selection Bar */}
      <div className="flex border-b border-gray-100 pb-px gap-4 md:gap-6" id="sourcing-sub-tabs">
        <button
          onClick={() => setActiveSubTab("origins")}
          className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "origins"
              ? "border-amber-950 text-amber-950"
              : "border-transparent text-gray-400 hover:text-gray-650"
          }`}
        >
          🌍 Cocoa Origins & Terroir
        </button>
        <button
          onClick={() => setActiveSubTab("sensory")}
          className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "sensory"
              ? "border-amber-950 text-amber-950"
              : "border-transparent text-gray-400 hover:text-gray-650"
          }`}
        >
          🔬 Interactive Tasting Lab & Flavor Wheel
        </button>
      </div>

      {activeSubTab === "origins" ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="sourcing-grid">
        {/* Genetics / Varieties Sidebar */}
        <div className="space-y-4" id="varieties-sidebar">
          <h4 className="font-bold text-gray-800 text-sm tracking-wider uppercase flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-700" /> Cocoa Varieties (Genetics)
          </h4>
          <div className="space-y-3" id="varieties-list">
            {COCOA_VARIETIES.map((variety) => {
              const isSelected = selectedVariety?.name === variety.name;
              const isExpanded = expandedVarietyName === variety.name;
              return (
                <div
                  key={variety.name}
                  className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-amber-950 text-amber-50 border-amber-950 shadow-md"
                      : "bg-white text-gray-700 border-gray-100 hover:border-amber-200 hover:bg-amber-50/50"
                  }`}
                >
                  <button
                    type="button"
                    id={`variety-btn-${variety.name.toLowerCase()}`}
                    onClick={() => {
                      if (isExpanded) {
                        setSelectedVariety(null);
                        setExpandedVarietyName(null);
                      } else {
                        setSelectedVariety(variety);
                        setExpandedVarietyName(variety.name);
                      }
                    }}
                    className="w-full text-left p-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold text-base font-sans ${isExpanded ? "text-amber-50" : "text-gray-950"}`}>{variety.name}</span>
                      <div className="flex items-center gap-2">
                        {variety.name === "Criollo" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isExpanded ? "bg-amber-800/40 text-amber-200" : "bg-amber-800/20 text-amber-600"}`}>
                            Ultra-Premium
                          </span>
                        )}
                        {variety.name === "Nacional (Arriba)" && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isExpanded ? "bg-amber-800/40 text-amber-200" : "bg-amber-800/20 text-amber-600"}`}>
                            Highly Prized
                          </span>
                        )}
                        <span className="lg:hidden text-amber-600">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${isExpanded ? "text-amber-200/80" : "text-gray-500"}`}>{variety.flavorProfile}</p>
                  </button>

                  {/* Accordion Details Panel (Mobile view only) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="px-4 pb-5 pt-4 border-t space-y-4 bg-black/20 border-amber-900/40">
                          <VarietyDetailContent variety={variety} isDarkTheme={true} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Variety Detail Card (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 animate-fade-in" id="variety-detail-panel">
          {selectedVariety ? (
            <>
              <div className="border-b border-gray-100 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-sans flex items-center gap-2">
                    {selectedVariety.name} <span className="text-xs font-normal text-amber-700 font-mono">({selectedVariety.rarity})</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    <strong>Primary Origins:</strong> {selectedVariety.origin}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Sensory Flavor Profile</h5>
                  <p className="text-gray-800 text-base mt-1 font-sans font-medium">{selectedVariety.flavorProfile}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-gray-500 font-mono">Acidity Level</span>
                    <p className="font-semibold text-gray-800">{selectedVariety.acidity}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-mono">Bitterness & Astringency</span>
                    <p className="font-semibold text-gray-800">{selectedVariety.bitterness}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Artisanal Roasting Recommendation</h5>
                  <div className="mt-2 bg-amber-50/50 border border-amber-100 p-3 rounded-lg flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-950 font-medium">{selectedVariety.roastRecommendation}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Genetics & Cultivation Notes</h5>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{selectedVariety.description}</p>
                </div>

                {selectedVariety.indianContext && (
                  <div className="pt-4 border-t border-gray-100/80 space-y-2.5" id="variety-indian-context">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100/40">
                      <span className="text-xs">🇮🇳</span> Indian Cultivation Profile
                    </div>
                    <p className="text-xs text-gray-700 bg-emerald-50/15 border border-emerald-100/30 rounded-xl p-3.5 leading-relaxed font-sans font-medium">
                      {selectedVariety.indianContext}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-850">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">No Variety Selected</h4>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Select a cocoa variety from the list to explore its detailed genetics, terroir, and roasting parameters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visual Identification & Cut-Test Guide */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="visual-identification-guide">
        <div className="border-b border-gray-100 pb-4">
          <h4 className="font-bold text-gray-950 text-lg flex items-center gap-2 font-sans">
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-900">
              <Compass className="w-5 h-5" />
            </span>
            Bean Identification & Cut-Test Visual Comparison
          </h4>
          <p className="text-xs text-gray-500 mt-1 font-sans">
            Planters and craft chocolatiers use external pod traits and the physical <strong>Cut Test</strong> to accurately verify genetic quality and fermentation profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Photographic Comparison Image */}
          <div className="xl:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 aspect-[16/9] md:aspect-[16/10] xl:aspect-[16/9]" id="photographic-container">
              <img
                src={cocoaComparisonImg}
                alt="Photographic Comparison of Criollo, Forastero, and Trinitario Cocoa Pods and Beans"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-medium px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider">
                🔬 Photographic Identification Guide
              </div>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans text-center">
              Visual comparison of full pods and internal cotyledons. Forastero seeds are deep purple, Criollo is pale white, and Trinitario exhibits intermediate marbled shades.
            </p>
          </div>

          {/* Interactive Metric Breakdown */}
          <div className="xl:col-span-7 space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100" id="comparison-table-wrapper">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-3 font-mono font-bold text-gray-400 uppercase tracking-wider text-[10px]">Trait / Metric</th>
                    <th className="p-3 font-bold text-amber-950">Criollo</th>
                    <th className="p-3 font-bold text-gray-950">Forastero</th>
                    <th className="p-3 font-bold text-amber-800">Trinitario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  <tr>
                    <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Pod Shape</td>
                    <td className="p-3 text-gray-700 font-medium">Elongated, deeply ridged, pointed tip</td>
                    <td className="p-3 text-gray-700 font-medium">Rounder, smooth shell, shallow furrows</td>
                    <td className="p-3 text-gray-700 font-medium">Highly variable (inherited traits mix)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Pod Texture</td>
                    <td className="p-3 text-gray-700 font-medium">Rough, bumpy, thin-walled, soft husk</td>
                    <td className="p-3 text-gray-700 font-medium">Smooth, woody, thick-walled, hard shell</td>
                    <td className="p-3 text-gray-700 font-medium">Medium-rough to smooth, moderately thick</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Seed Shape</td>
                    <td className="p-3 text-gray-700 font-medium">Round, thick, plump, almost spherical</td>
                    <td className="p-3 text-gray-700 font-medium">Flat, oval, compact seeds</td>
                    <td className="p-3 text-gray-700 font-medium">Plump, moderately flat to round</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Cotyledon Color</td>
                    <td className="p-3 text-gray-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-100 border border-stone-300"></span>
                        White to pale, translucent pink
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-950"></span>
                        Deep purple to dark violet
                      </span>
                    </td>
                    <td className="p-3 text-gray-700 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
                        Highly variable marbled violet/mauve
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-500 bg-gray-50/50">Astringency</td>
                    <td className="p-3 text-gray-700 font-medium">Very low, smooth, buttery mouthfeel</td>
                    <td className="p-3 text-gray-700 font-medium">High, heavy in tannins, bitter-forward</td>
                    <td className="p-3 text-gray-700 font-medium">Moderate, well-rounded and balanced</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50/25 border border-amber-100/50 rounded-xl p-4 space-y-2.5" id="cut-test-explanation">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono block">🔬 How to Execute the Cut Test</span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                To evaluate a batch, slice <strong>50-100 fermented & dried beans lengthwise</strong> down the middle. Look for the following identification cues:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-[11px] space-y-1">
                  <span className="font-bold text-gray-950 block font-sans">1. Fissured Wrinkles</span>
                  <p className="text-gray-500 leading-normal">Fully fermented beans have internal open ridges (fissures). A tight, solid interior indicates poor fermentation.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-[11px] space-y-1">
                  <span className="font-bold text-gray-950 block font-sans">2. Color Evolution</span>
                  <p className="text-gray-500 leading-normal">Well-fermented Forastero shifts from bright violet to warm brown. Slate-grey beans indicate unfermented, highly astringent seeds.</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100 text-[11px] space-y-1">
                  <span className="font-bold text-gray-950 block font-sans">3. Purity Checklist</span>
                  <p className="text-gray-500 leading-normal">White seeds in a Trinitario farm indicate Criollo ancestral genetics—highly prized for craft, single-origin batches.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indian Cocoa Terroir Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6" id="indian-terroir-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h4 className="font-bold text-gray-950 text-lg flex items-center gap-2 font-sans">
              <MapPin className="w-5 h-5 text-amber-800" /> Indian Fine Cocoa Origins & Terroir
            </h4>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              India has emerged as an exciting territory for high-quality, fine-flavor single-origin craft chocolate.
            </p>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            4 Major Sourcing States
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left States Tabs List */}
          <div className="space-y-2.5" id="india-states-list">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono block">Select Sourcing State</span>
            {INDIAN_ORIGINS.map((state) => {
              const isSelected = selectedIndiaState?.name === state.name;
              const isExpanded = expandedIndiaStateName === state.name;
              return (
                <div
                  key={state.name}
                  className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-amber-950 text-amber-50 border-amber-950 shadow"
                      : "bg-gray-50 text-gray-700 border-gray-100 hover:border-amber-200 hover:bg-amber-50/20"
                  }`}
                >
                  <button
                    type="button"
                    id={`state-tab-${state.name.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => {
                      if (isExpanded) {
                        setSelectedIndiaState(null);
                        setExpandedIndiaStateName(null);
                      } else {
                        setSelectedIndiaState(state);
                        setExpandedIndiaStateName(state.name);
                      }
                    }}
                    className="w-full text-left p-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-sm font-sans ${isExpanded ? "text-amber-50" : "text-gray-900"}`}>{state.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          isExpanded ? "bg-amber-900/40 text-amber-200" : "bg-gray-200/60 text-gray-600"
                        }`}>
                          {state.name === "Andhra Pradesh" ? "Leader" : state.name === "Kerala" ? "Pioneer" : "Premium"}
                        </span>
                        <span className="lg:hidden text-amber-600">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] block mt-1 font-mono ${isExpanded ? "text-amber-200/80" : "text-gray-500"}`}>{state.share}</span>
                  </button>

                  {/* Accordion Details Panel (Mobile view only) */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="px-4 pb-5 pt-4 border-t space-y-4 bg-black/20 border-amber-900/40">
                          <StateDetailContent state={state} isDarkTheme={true} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Detailed Terroir Card */}
          <div className="hidden lg:block lg:col-span-2 bg-amber-50/10 border border-amber-100/30 rounded-2xl p-5 md:p-6 space-y-5 animate-fade-in" id="india-terroir-detail-panel">
            {selectedIndiaState ? (
              <>
                {/* Header info */}
                <div className="flex justify-between items-start gap-4 flex-wrap border-b border-gray-100/50 pb-3">
                  <div>
                    <h5 className="text-xl font-bold text-gray-950 font-sans">{selectedIndiaState.name}</h5>
                    <span className="text-[10px] text-amber-800 font-bold uppercase font-mono tracking-wide">{selectedIndiaState.share}</span>
                  </div>
                </div>

                {/* Core Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Climate & Microclimate
                    </span>
                    <p className="text-xs font-semibold text-gray-800">{selectedIndiaState.climate}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider flex items-center gap-1">
                      <Trees className="w-3.5 h-3.5 text-emerald-600" /> Intercropping Partners
                    </span>
                    <p className="text-xs font-semibold text-gray-800">{selectedIndiaState.intercropping}</p>
                  </div>
                </div>

                {/* Flavor description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest font-mono">Sensory Flavor Attributes</span>
                  <p className="text-sm font-semibold text-gray-900 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 font-medium">
                    ✨ {selectedIndiaState.flavorProfile}
                  </p>
                </div>

                {/* Roasting Specifications (No need to note it down!) */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-800 animate-pulse" />
                    <span className="text-xs font-bold text-gray-950 uppercase tracking-wider font-mono">Master Roaster Parameters (For Reference)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-mono">RECOMMENDED TEMP</span>
                      <strong className="text-amber-950">{selectedIndiaState.roastRecommendation.split(" (")[1]?.split(")")[0] || selectedIndiaState.roastRecommendation.split("(")[0]}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-mono">ROASTING DURATION</span>
                      <strong className="text-amber-950 font-mono">{selectedIndiaState.roastRecommendation.match(/\d+-\d+\s+minutes|\d+\s+minutes/i)?.[0] || "20-22 mins"}</strong>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-2.5">
                    <span className="text-[9px] font-bold text-gray-500 block">ROAST PROFILE RATIONALE</span>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">{selectedIndiaState.roastRecommendation}</p>
                  </div>
                </div>

                {/* Geographics Bio */}
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono block">Terroir & Ecosystem Characteristics</span>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">{selectedIndiaState.description}</p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-800">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">No State Selected</h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Select an Indian sourcing state from the list to explore its climate, intercropping, and sensory roast attributes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Harvest Infographic */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6" id="post-harvest-info">
        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2 font-sans">
          <Award className="w-5 h-5 text-amber-700" /> The Golden Rule of Cocoa Quality: Fermentation & Drying
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 bg-amber-50/20 p-5 rounded-xl border border-amber-50">
            <h5 className="font-bold text-amber-950 text-sm">1. Fermentation (3-7 Days)</h5>
            <p className="text-gray-600 text-xs leading-relaxed">
              When pods are harvested, the beans are piled in sweating boxes covered with banana leaves. Microorganisms consume the sugary white pulp, producing heat (up to 50°C), alcohol, and eventually acetic acid.
            </p>
            <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4 font-medium">
              <li>Lactic and acetic acids penetrate the seed, killing the germ and bursting cell walls.</li>
              <li>Enzymatic reactions break down complex proteins into peptides and free amino acids.</li>
              <li>Sucrose converts into glucose and fructose—the key chemical flavor precursors for roasting.</li>
            </ul>
          </div>
          <div className="space-y-3 bg-amber-50/20 p-5 rounded-xl border border-amber-50">
            <h5 className="font-bold text-amber-950 text-sm">2. Solar Drying (5-10 Days)</h5>
            <p className="text-gray-600 text-xs leading-relaxed">
              Wet beans are spread out on raised drying beds under the sun. Moisture must be brought down from 60% to exactly <strong>6.5% - 7%</strong>. Too fast, and the acids trap inside; too slow, and mold develops.
            </p>
            <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4 font-medium">
              <li>Gentle sun exposure allows acetic acid (vinegar smell) to evaporate away.</li>
              <li>Polyphenol oxidases continue converting bitter tannins, turning cotyledons brown.</li>
              <li>Prepares the beans for safe maritime shipping without mold or spoilage.</li>
            </ul>
          </div>
        </div>
      </div>
      </>
      ) : (
        <SensoryTastingLab />
      )}
    </div>
  );
}
