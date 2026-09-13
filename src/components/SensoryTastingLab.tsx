import React, { useState, useEffect } from "react";
import { Coffee, Award, Compass, Sparkles, BookOpen, Layers, Check, RefreshCw } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

interface FlavorCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  textColor: string;
  borderColor: string;
  lightBg: string;
  descriptors: string[];
  scientificOrigin: string;
  indianTerroirNote: string;
}

const FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: "fruity",
    name: "Fruity",
    emoji: "🍓",
    color: "#f472b6", // Tailwind pink-400
    textColor: "text-pink-900",
    borderColor: "border-pink-200",
    lightBg: "bg-pink-50/40",
    descriptors: ["berry", "tropical", "raisin", "plum", "cherry"],
    scientificOrigin: "Produced during anaerobic fermentation by specific yeast strains (e.g., Saccharomyces cerevisiae) converting simple pulp sugars into aromatic fruit esters (like isoamyl acetate) which diffuse directly into the cotyledons.",
    indianTerroirNote: "Highly pronounced in Kerala (Idukki hills) Trinitario varieties and high-elevation organic crops in Karnataka where fermentation is carefully extended in cedar boxes."
  },
  {
    id: "spicy",
    name: "Spicy",
    emoji: "🌶️",
    color: "#f87171", // Tailwind red-400
    textColor: "text-red-900",
    borderColor: "border-red-200",
    lightBg: "bg-red-50/40",
    descriptors: ["licorice", "nutmeg", "cinnamon", "pepper", "vanilla"],
    scientificOrigin: "Synthesized during secondary drying phase and bean aging. Complex organic phenols and essential terpenes are absorbed from surrounding intercropped flora during cultivation and slow drying.",
    indianTerroirNote: "An exquisite signature of Western Ghats (Kerala, Wayanad) micro-lots. Growing chocolate directly underneath black pepper vines, cardamom plants, and nutmeg canopies infuses the soil and surrounding air with these warm, spicy notes."
  },
  {
    id: "fudgy",
    name: "Fudgy",
    emoji: "🍫",
    color: "#b45309", // Tailwind amber-700
    textColor: "text-amber-950",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50/30",
    descriptors: ["milk", "molasses", "brownie", "cocoa", "butter"],
    scientificOrigin: "The standard cocoa baseline. Highly dependent on efficient protein-to-amino-acid breakdown during peak fermentation (Days 3-4), followed by structural Maillard reactions during roasting.",
    indianTerroirNote: "The robust soul of Andhra Pradesh (Godavari delta) and Tamil Nadu (Pollachi) Forastero clones. Under coconut canopies, these plump beans develop a thick, buttery, and classic brownie-fudge core with low bitterness."
  },
  {
    id: "earthy",
    name: "Earthy",
    emoji: "🌿",
    color: "#78716c", // Tailwind stone-500
    textColor: "text-stone-900",
    borderColor: "border-stone-200",
    lightBg: "bg-stone-50/40",
    descriptors: ["hay", "wood", "mushroom", "moss", "leather"],
    scientificOrigin: "Formed primarily during slow solar drying on raised bamboo or wooden beds. The interaction of atmospheric humidity with residual seed coat moisture can yield earthy forest floor volatiles.",
    indianTerroirNote: "A rustic characteristic common in traditional smallholder estates in Kerala. If sun-drying is delayed by monsoon moisture, it develops deep woody, tobacco, and herbal undercurrents prized in European dark chocolate bars."
  },
  {
    id: "floral",
    name: "Floral",
    emoji: "🌸",
    color: "#c084fc", // Tailwind purple-400
    textColor: "text-purple-900",
    borderColor: "border-purple-200",
    lightBg: "bg-purple-50/40",
    descriptors: ["rose", "orange", "lavender", "jasmine", "hibiscus"],
    scientificOrigin: "Highly volatile linalool and geraniol monoterpenes. These aromatic compounds are extremely heat-sensitive and easily lost if roasting exceeds 120°C or conching is overly aggressive.",
    indianTerroirNote: "Extremely rare! Can only be coaxed out of hand-sorted Criollo micro-lots in Kerala or light-roasted high-altitude Karnataka Trinitario beans (VTLCH clones)."
  },
  {
    id: "roasty",
    name: "Roasty",
    emoji: "☕",
    color: "#78716c", // Dark warm gray
    textColor: "text-gray-950",
    borderColor: "border-gray-200",
    lightBg: "bg-gray-50/50",
    descriptors: ["hickory", "smoke", "caramel", "tabacco", "coffee"],
    scientificOrigin: "Pyrazines and furans generated during the high-temperature roasting phase. When reducing sugars and amino acids undergo non-enzymatic browning (Maillard reaction) at 125°C-135°C.",
    indianTerroirNote: "Masterfully adjusted by Tamil Nadu bean-to-bar roasters. Deep roasting is used on sturdier, high-fat Forastero beans to clear astringency and bring out a satisfying caramelized coffee snap."
  },
  {
    id: "tangy",
    name: "Tangy",
    emoji: "🍋",
    color: "#facc15", // Tailwind yellow-400
    textColor: "text-yellow-950",
    borderColor: "border-yellow-200",
    lightBg: "bg-yellow-50/30",
    descriptors: ["lemon", "lime", "apple", "peach", "balsamic"],
    scientificOrigin: "Caused by volatile acetic acid (vinegar) and non-volatile lactic acid produced by bacteria during the aerobic stage of fermentation. A balanced tang adds brightness and depth.",
    indianTerroirNote: "A signature profile of Kerala's organic estates. While industrial brands conch aggressively to drive out all acidity, craft chocolatiers light-conch these beans to preserve a vibrant, bright fruity-vinegar tang."
  },
  {
    id: "nutty",
    name: "Nutty",
    emoji: "🥜",
    color: "#d97706", // Tailwind amber-600
    textColor: "text-amber-900",
    borderColor: "border-amber-200",
    lightBg: "bg-amber-50/20",
    descriptors: ["hazelnut", "peanut", "almond", "coconut", "walnut"],
    scientificOrigin: "Alkylpyrazines synthesized from free amino acids and sugars during early roasting. These molecules reside mostly inside the fat-rich cocoa butter globules of the seed.",
    indianTerroirNote: "Characteristic of Karnataka's areca nut and Andhra Pradesh's palm-shaded plantations. The root networks of intercropped trees and organic soil composition yields toasted almond and coconut husks hints."
  }
];

interface TastingSample {
  id: string;
  name: string;
  origin: string;
  percentage: string;
  description: string;
  profile: Record<string, number>; // value 1-5 for each category
  palateTip: string;
}

const TASTING_SAMPLES: TastingSample[] = [
  {
    id: "idukki-hills",
    name: "Idukki Hills Single Estate",
    origin: "Idukki District, Kerala",
    percentage: "72% Dark Chocolate",
    description: "An incredibly expressive single-origin bar grown in the shade of cardamom and nutmeg trees.",
    profile: {
      fruity: 5,
      spicy: 4,
      fudgy: 3,
      earthy: 2,
      floral: 2,
      roasty: 2,
      tangy: 4,
      nutty: 2
    },
    palateTip: "Focus on the initial tartness. You should feel a bright, raisin-like berry acidity (Fruity/Tangy), which slowly rolls into a warm cinnamon and nutmeg finish (Spicy)."
  },
  {
    id: "godavari-basin",
    name: "Godavari Delta Coconut Shaded",
    origin: "East Godavari, Andhra Pradesh",
    percentage: "70% Dark Chocolate",
    description: "Crafted from sturdy, plump Forastero beans irrigated with Godavari water under heavy coconut canopies.",
    profile: {
      fruity: 2,
      spicy: 2,
      fudgy: 5,
      earthy: 2,
      floral: 1,
      roasty: 4,
      tangy: 2,
      nutty: 4
    },
    palateTip: "Take a small piece and let it melt slowly on your tongue without chewing. Note the absolute lack of bitter pucker. The dominant sensation is rich chocolate cake batter (Fudgy) paired with toasted hazelnut (Nutty)."
  },
  {
    id: "malnad-elevation",
    name: "Malnad High-Altitude Reserve",
    origin: "Dakshina Kannada, Karnataka",
    percentage: "80% Dark Chocolate",
    description: "Ultra-dark, slow-ripened organic beans grown at higher elevations under areca palm shade.",
    profile: {
      fruity: 3,
      spicy: 3,
      fudgy: 4,
      earthy: 3,
      floral: 4,
      roasty: 3,
      tangy: 4,
      nutty: 3
    },
    palateTip: "With 80% cocoa solids, expect a robust body, but look beneath the intensity for delicate monoterpene aromatics. You will detect jasmine flower tea (Floral) and green-apple brightness (Tangy)."
  }
];

export default function SensoryTastingLab() {
  const [selectedCat, setSelectedCat] = useState<FlavorCategory>(FLAVOR_CATEGORIES[0]);
  
  // Tasting challenge state
  const [activeSample, setActiveSample] = useState<TastingSample>(TASTING_SAMPLES[0]);
  const [studentSliders, setStudentSliders] = useState<Record<string, number>>({
    fruity: 3,
    spicy: 3,
    fudgy: 3,
    earthy: 3,
    floral: 3,
    roasty: 3,
    tangy: 3,
    nutty: 3
  });
  const [matchResult, setMatchResult] = useState<{
    score: number;
    headComment: string;
    unlocked: boolean;
  } | null>(null);
  
  const [updatingDb, setUpdatingDb] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set default slider values based on midpoints on load or sample change
  const handleSampleSelect = (sample: TastingSample) => {
    setActiveSample(sample);
    setMatchResult(null);
    setSuccessMsg(null);
    setStudentSliders({
      fruity: 3,
      spicy: 3,
      fudgy: 3,
      earthy: 3,
      floral: 3,
      roasty: 3,
      tangy: 3,
      nutty: 3
    });
  };

  const handleSliderChange = (catId: string, val: number) => {
    setStudentSliders((prev) => ({
      ...prev,
      [catId]: val
    }));
  };

  const evaluatePalate = async () => {
    let totalDiff = 0;
    const categoriesKeys = Object.keys(studentSliders);
    
    categoriesKeys.forEach((key) => {
      const actual = activeSample.profile[key] || 0;
      const student = studentSliders[key];
      totalDiff += Math.abs(actual - student);
    });

    // Maximum difference per slider is 4 (from 1 to 5). Total max diff is 32.
    // Calculate a percentage score
    const maxDiff = 32;
    const percentage = Math.round(((maxDiff - totalDiff) / maxDiff) * 100);
    
    let comment = "";
    let unlocked = false;

    if (percentage >= 90) {
      comment = "Sensational! Your palate is incredibly sharp and fully calibrated to professional bean-to-bar standards. You accurately pinpointed the volatile esters and organic acid nodes!";
      unlocked = true;
    } else if (percentage >= 80) {
      comment = "Excellent palate calibration! You correctly mapped the core profile of this single origin. Your sensory training is highly effective.";
      unlocked = true;
    } else if (percentage >= 65) {
      comment = "A decent attempt, but your palate is slightly over-sensitive or under-sensitive to certain compounds. Try letting the chocolate fully coat your tongue before swallowing, and breathe out through your nose (retro-nasal olfaction).";
    } else {
      comment = "Your palate mapping is currently uncalibrated. Make sure you don't drink coffee or eat spicy food before a tasting session. Focus closely on distinguishing acidic 'tang' from bitter 'roast'. Let's reset and try again!";
    }

    setMatchResult({
      score: percentage,
      headComment: comment,
      unlocked
    });

    if (unlocked && auth.currentUser) {
      setUpdatingDb(true);
      try {
        const studentRef = doc(db, "students", auth.currentUser.uid);
        await updateDoc(studentRef, {
          completedLabs: arrayUnion("Sensory Palate Calibration"),
          palateScores: arrayUnion({
            sampleId: activeSample.id,
            score: percentage,
            timestamp: new Date().toISOString()
          })
        });
        setSuccessMsg("🎉 Palate Certification updated successfully in your Student Record!");
      } catch (err) {
        console.error("Error updating student record:", err);
      } finally {
        setUpdatingDb(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="sensory-lab-container">
      {/* Intro section */}
      <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start" id="sensory-intro">
        <div className="bg-amber-950 text-amber-50 p-3 rounded-xl flex-shrink-0" id="sensory-icon">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-amber-950 font-sans">Module 1.5: Sensory Tasting & Palate Calibration</h3>
          <p className="text-amber-900 text-sm leading-relaxed">
            Tasting high-end craft chocolate is a holistic sensory discipline. Flavors represent a chemical dialogue between <strong>Cacao Pulp Chemistry</strong> (which fuels fermentation) and volatile compounds unlocked during <strong>roasting and conching</strong>. Use this interactive lab to study the organic compounds and train your palate to professional levels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Chemical Pulp Breakdown */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="pulp-chemistry-panel">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest font-mono">Pulp Composition Analysis</span>
            <h4 className="font-bold text-gray-950 text-lg font-sans">What is inside Cacao Pulp?</h4>
            <p className="text-xs text-gray-400 mt-1">The sweet mucilage surrounding raw seeds is the critical chemical engine for fermentation.</p>
          </div>

          <div className="space-y-5">
            {/* Pulp Component list */}
            <div className="space-y-3.5">
              <div className="bg-blue-50/20 border border-blue-100/40 p-3.5 rounded-xl flex items-start gap-3">
                <span className="text-xl">💧</span>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-950 text-sm">Water Content</span>
                    <span className="font-mono font-bold text-blue-800 text-sm">70% to 85%</span>
                  </div>
                  <p className="text-gray-600 leading-normal">Responsible for the fresh, succulent juice. Dissolves sucrose and provides the early medium for wild yeasts to start multiplying.</p>
                </div>
              </div>

              <div className="bg-amber-50/35 border border-amber-100/40 p-3.5 rounded-xl flex items-start gap-3">
                <span className="text-xl">🍬</span>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-950 text-sm">Natural Sugars</span>
                    <span className="font-mono font-bold text-amber-800 text-sm">10% to 15%</span>
                  </div>
                  <p className="text-gray-600 leading-normal">Primary sucrose, glucose, and fructose. Act as the vital <strong>fermentation feedstock</strong> consumed by yeasts to generate ethanol and carbon dioxide.</p>
                </div>
              </div>

              <div className="bg-emerald-50/20 border border-emerald-100/40 p-3.5 rounded-xl flex items-start gap-3">
                <span className="text-xl">🧪</span>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950 text-sm">Organic Acids</span>
                    <span className="font-mono font-bold text-emerald-800 text-sm">1% to 3%</span>
                  </div>
                  <p className="text-gray-600 leading-normal">High in citric acid. Lowers pulp pH to ~3.5 initially, keeping putrefactive bacteria at bay and giving fresh beans a tart, citrusy flavor balance.</p>
                </div>
              </div>

              <div className="bg-purple-50/20 border border-purple-100/40 p-3.5 rounded-xl flex items-start gap-3">
                <span className="text-xl">🍇</span>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-950 text-sm">Aromatic Esters</span>
                    <span className="font-mono font-bold text-purple-800 text-xs">Trace Compounds</span>
                  </div>
                  <p className="text-gray-600 leading-normal">Linalool, hexyl acetate, and sweet terpenes. Directly responsible for the floral, honeyed, and tropical pineapple fruit notes of raw beans.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-950/5 border border-amber-950/10 p-4 rounded-xl text-xs space-y-2">
              <span className="font-bold text-amber-950 uppercase tracking-wider text-[9px] font-mono block">The Fermentation Bridge</span>
              <p className="text-gray-700 leading-relaxed">
                As yeasts consume sugars, they produce warmth. When temperature hits 40°C-50°C and ethanol turns into acetic acid, the seed cell walls collapse, releasing enzymes. These enzymes convert bitter seed storage proteins into flavor-precursor peptides—the exact building blocks that roast into fine chocolate aromatics.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Flavor Wheel Explorer */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="flavor-wheel-explorer-panel">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest font-mono">Interactive Tasting Guide</span>
            <h4 className="font-bold text-gray-950 text-lg font-sans">The Cocoa Flavor Wheel</h4>
            <p className="text-xs text-gray-400 mt-1">Select a category on the wheel or listed below to explore its origin, chemical synthesis, and regional Indian occurrences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual SVG Wheel representation */}
            <div className="flex justify-center" id="svg-wheel-container">
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-md">
                  {/* Outer circle decoration */}
                  <circle cx="160" cy="160" r="150" fill="none" stroke="#f3f4f6" strokeWidth="2" />
                  
                  {/* Draw 8 sectors of 45 degrees */}
                  {FLAVOR_CATEGORIES.map((cat, idx) => {
                    const startAngle = idx * 45 - 22.5; // Offset to center the top slice
                    const endAngle = (idx + 1) * 45 - 22.5;
                    const rad = Math.PI / 180;
                    
                    const rOuter = 135;
                    const rInner = 50;
                    
                    // Coordinates outer
                    const x1_o = 160 + rOuter * Math.cos(startAngle * rad);
                    const y1_o = 160 + rOuter * Math.sin(startAngle * rad);
                    const x2_o = 160 + rOuter * Math.cos(endAngle * rad);
                    const y2_o = 160 + rOuter * Math.sin(endAngle * rad);
                    
                    // Coordinates inner
                    const x1_i = 160 + rInner * Math.cos(startAngle * rad);
                    const y1_i = 160 + rInner * Math.sin(startAngle * rad);
                    const x2_i = 160 + rInner * Math.cos(endAngle * rad);
                    const y2_i = 160 + rInner * Math.sin(endAngle * rad);
                    
                    const isSelected = selectedCat.id === cat.id;
                    
                    // Path d parameter for donut wedge
                    const pathD = `
                      M ${x1_i} ${y1_i}
                      L ${x1_o} ${y1_o}
                      A ${rOuter} ${rOuter} 0 0 1 ${x2_o} ${y2_o}
                      L ${x2_i} ${y2_i}
                      A ${rInner} ${rInner} 0 0 0 ${x1_i} ${y1_i}
                      Z
                    `;
                    
                    // Center angle for text labels
                    const textAngle = startAngle + 22.5;
                    const rText = 92;
                    const textX = 160 + rText * Math.cos(textAngle * rad);
                    const textY = 160 + rText * Math.sin(textAngle * rad);
                    
                    return (
                      <g 
                        key={cat.id} 
                        className="cursor-pointer transition-all duration-300 group"
                        onClick={() => setSelectedCat(cat)}
                      >
                        <path
                          d={pathD}
                          fill={cat.color}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? "4" : "1.5"}
                          opacity={isSelected ? "1" : "0.75"}
                          className="hover:opacity-100 transition-opacity"
                        />
                        <text
                          x={textX}
                          y={textY + 3}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow-md select-none tracking-tight"
                        >
                          {cat.emoji} {cat.name}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Center donut hole with logo */}
                  <circle cx="160" cy="160" r="45" fill="#fcfbf7" stroke="#e5e7eb" strokeWidth="2" />
                  <g className="pointer-events-none select-none">
                    <circle cx="160" cy="160" r="32" fill="#582f0e" opacity="0.06" />
                    <text x="160" y="156" textAnchor="middle" fill="#582f0e" fontSize="9" fontWeight="900" fontFamily="monospace" letterSpacing="0.05em">COCOA</text>
                    <text x="160" y="167" textAnchor="middle" fill="#582f0e" fontSize="9" fontWeight="900" fontFamily="monospace" letterSpacing="0.05em">WHEEL</text>
                    <circle cx="160" cy="177" r="2.5" fill="#582f0e" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Quick List Selector */}
            <div className="grid grid-cols-2 gap-2" id="wheel-quick-selector">
              {FLAVOR_CATEGORIES.map((cat) => {
                const isSelected = selectedCat.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-amber-950 text-amber-50 border-amber-950 shadow-sm font-extrabold"
                        : "bg-gray-50 text-gray-700 border-gray-100 hover:border-amber-200"
                    }`}
                  >
                    <span className="text-sm">{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details of selected category */}
          <div className={`p-5 rounded-2xl border transition-all ${selectedCat.lightBg} ${selectedCat.borderColor}`} id="selected-flavor-details">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedCat.emoji}</span>
                <h5 className={`font-extrabold text-base ${selectedCat.textColor}`}>{selectedCat.name} Family Notes</h5>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selectedCat.descriptors.map((desc) => (
                  <span
                    key={desc}
                    className="bg-white/80 border border-white px-2 py-0.5 rounded-lg text-[10px] font-mono text-gray-700 uppercase"
                  >
                    {desc}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="space-y-0.5">
                <span className="font-extrabold text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Chemical / Scientific Synthesis</span>
                <p className="text-gray-700 font-medium">{selectedCat.scientificOrigin}</p>
              </div>
              <div className="border-t border-gray-100/55 pt-2.5 space-y-0.5">
                <span className="font-extrabold text-[10px] text-amber-900 font-mono uppercase tracking-wider block flex items-center gap-1">
                  🇮🇳 Indian Terroir & Canopy Influence
                </span>
                <p className="text-gray-800 font-bold">{selectedCat.indianTerroirNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasting Palate Calibration Game */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="palate-calibration-panel">
        <div className="border-b border-gray-100 pb-4 flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h4 className="font-bold text-gray-950 text-lg flex items-center gap-2 font-sans">
              <Award className="w-5 h-5 text-amber-800 animate-pulse" /> Palate Seeding Training (Tasting Challenge)
            </h4>
            <p className="text-xs text-gray-400 mt-1">Taste your virtual single-origin sample and adjust the sliders to map its organic compounds correctly.</p>
          </div>
          <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-2xl">
            {TASTING_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleSelect(sample)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSample.id === sample.id
                    ? "bg-amber-950 text-amber-50 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {sample.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Active Sample details */}
          <div className="xl:col-span-4 space-y-4">
            <div className="bg-amber-50/15 border border-amber-100/20 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                  {activeSample.percentage}
                </span>
                <h5 className="font-bold text-gray-950 text-base font-sans mt-1">{activeSample.name}</h5>
                <span className="text-[10px] text-gray-400 font-mono block">Origin: {activeSample.origin}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium">{activeSample.description}</p>

              <div className="bg-white p-3.5 rounded-xl border border-gray-50 text-[11px] leading-relaxed space-y-1.5">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-700" /> Professional Palate Tip:
                </span>
                <p className="text-gray-600 italic">"{activeSample.palateTip}"</p>
              </div>
            </div>

            {matchResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                matchResult.unlocked 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                  : "bg-red-50 border-red-200 text-red-950"
              }`} id="calibration-result-card">
                <div className="flex justify-between items-center">
                  <span className="font-bold font-mono text-[10px] uppercase tracking-wider">Tasting Palate Score:</span>
                  <span className={`text-base font-black px-2.5 py-0.5 rounded-full font-mono ${
                    matchResult.unlocked ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"
                  }`}>
                    {matchResult.score}% Match
                  </span>
                </div>
                <p className="leading-relaxed font-sans">{matchResult.headComment}</p>
                
                {successMsg && (
                  <p className="text-[11px] font-bold text-emerald-800 bg-white/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                    {successMsg}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interactive sliders */}
          <div className="xl:col-span-8 bg-gray-50/50 border border-gray-100 rounded-3xl p-5 md:p-6 space-y-5" id="interactive-palate-sliders">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest font-mono block">2. Set Taste Intensities (1 to 5 Stars)</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FLAVOR_CATEGORIES.map((cat) => {
                const currentVal = studentSliders[cat.id] || 3;
                return (
                  <div key={cat.id} className="bg-white p-3 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 font-sans">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-mono font-bold text-amber-800">{currentVal} Stars</span>
                    </div>
                    
                    {/* Input range */}
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={currentVal}
                      onChange={(e) => handleSliderChange(cat.id, parseInt(e.target.value))}
                      className="w-full accent-amber-950 cursor-pointer h-1.5 bg-gray-100 rounded-lg appearance-none"
                    />
                    
                    {/* Quick description indicator */}
                    <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                      <span>Low</span>
                      <span>Moderate</span>
                      <span>Intense</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-4 flex gap-3 items-center justify-between flex-wrap">
              <p className="text-[11px] text-gray-400 max-w-sm">
                Take your time to virtually inhale, melt, and map the profile. Matching within 80% marks this session complete.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSampleSelect(activeSample)}
                  className="px-4 py-2 bg-white text-gray-600 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={evaluatePalate}
                  disabled={updatingDb}
                  className="px-6 py-2 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  {updatingDb ? "Recording..." : "Check Palate Match"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
