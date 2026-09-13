import React, { useState, useEffect } from "react";
import { Beaker, ShieldCheck, Flame, Zap, HelpCircle, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface TempDataPoint {
  time: number;
  temp: number;
  stage: string;
}

export interface TemperingProfile {
  id: "dark" | "milk" | "white";
  name: string;
  emoji: string;
  meltMin: number;
  meltMax: number;
  meltLimit: number;
  coolMin: number;
  coolMax: number;
  coolLimit: number;
  workMin: number;
  workMax: number;
  workLimit: number;
  targetMelt: number;
  targetCool: number;
  targetWork: number;
  description: string;
}

const TEMPERING_PROFILES: Record<"dark" | "milk" | "white", TemperingProfile> = {
  dark: {
    id: "dark",
    name: "Dark Chocolate",
    emoji: "🍫",
    meltMin: 45,
    meltMax: 50,
    meltLimit: 52,
    coolMin: 27,
    coolMax: 28,
    coolLimit: 26,
    workMin: 31,
    workMax: 32.5,
    workLimit: 33.5,
    targetMelt: 45,
    targetCool: 27,
    targetWork: 31.5,
    description: "No milk fats or solids. Requires a higher temperature curve to fully break and reorganize pure cocoa butter crystals."
  },
  milk: {
    id: "milk",
    name: "Milk Chocolate",
    emoji: "🥛",
    meltMin: 42,
    meltMax: 45,
    meltLimit: 48,
    coolMin: 26,
    coolMax: 27,
    coolLimit: 25,
    workMin: 29,
    workMax: 30.5,
    workLimit: 31.5,
    targetMelt: 42,
    targetCool: 26,
    targetWork: 30,
    description: "Contains milk powder. Milk fats (dairy lipids) interfere with cocoa butter crystallization, shifting the tempering curve lower."
  },
  white: {
    id: "white",
    name: "White Chocolate",
    emoji: "🥥",
    meltMin: 40,
    meltMax: 43,
    meltLimit: 45,
    coolMin: 25,
    coolMax: 26,
    coolLimit: 24,
    workMin: 28,
    workMax: 29.5,
    workLimit: 30.5,
    targetMelt: 40,
    targetCool: 25,
    targetWork: 28.5,
    description: "Consists only of cocoa butter, milk solids, and sugar. Lacks cocoa mass completely, making it highly sensitive to heat and prone to scorching at lower temperatures."
  }
};

export default function TemperingSimulator() {
  const [selectedType, setSelectedType] = useState<"dark" | "milk" | "white">("dark");
  const profile = TEMPERING_PROFILES[selectedType];

  const [temp, setTemp] = useState<number>(40); // current temperature
  const [targetTemp, setTargetTemp] = useState<number>(45); // target temperature for current step
  const [step, setStep] = useState<number>(1); // Step 1: Melting, Step 2: Cooling, Step 3: Seed Selection, Step 4: Casting
  const [history, setHistory] = useState<TempDataPoint[]>([{ time: 0, temp: 40, stage: "Melt" }]);
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [isCooling, setIsCooling] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "fail" | null>(null);

  // Auto tick to simulate heat transfer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHeating || isCooling) {
      interval = setInterval(() => {
        setTemp((prev) => {
          let nextTemp = prev;
          if (isHeating) nextTemp = Math.min(prev + 1, 55);
          if (isCooling) nextTemp = Math.max(prev - 1, 20);

          // Add to history
          setHistory((prevHistory) => [
            ...prevHistory,
            {
              time: prevHistory.length,
              temp: nextTemp,
              stage: step === 1 ? "Melt" : step === 2 ? "Cool" : step === 3 ? "Reheat" : "Cast",
            },
          ]);

          return nextTemp;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHeating, isCooling, step]);

  const handleHeat = (state: boolean) => {
    setIsHeating(state);
    if (state) setIsCooling(false);
  };

  const handleCool = (state: boolean) => {
    setIsCooling(state);
    if (state) setIsHeating(false);
  };

  const resetSim = (type: "dark" | "milk" | "white" = selectedType) => {
    const prof = TEMPERING_PROFILES[type];
    const initTemp = type === "dark" ? 40 : type === "milk" ? 36 : 32;
    setTemp(initTemp);
    setTargetTemp(prof.targetMelt);
    setStep(1);
    setHistory([{ time: 0, temp: initTemp, stage: "Melt" }]);
    setIsHeating(false);
    setIsCooling(false);
    setResultMessage(null);
    setResultStatus(null);
  };

  const handleTypeChange = (type: "dark" | "milk" | "white") => {
    setSelectedType(type);
    resetSim(type);
  };

  const advanceStep = () => {
    if (step === 1) {
      // Validate melting
      if (temp >= profile.meltMin && temp <= profile.meltMax) {
        setStep(2);
        setTargetTemp(profile.targetCool);
      } else if (temp > profile.meltLimit) {
        setResultMessage(`Overheated! You scorched the ${profile.name} proteins and fats. Start over.`);
        setResultStatus("fail");
      } else {
        setResultMessage(`Under-melted! Some unstable fat crystal memory still remains. Keep heating to ${profile.meltMin}°C - ${profile.meltMax}°C.`);
        setResultStatus("fail");
      }
    } else if (step === 2) {
      // Validate cooling
      if (temp >= profile.coolMin && temp <= profile.coolMax) {
        setStep(3);
        setTargetTemp(profile.targetWork);
      } else if (temp < profile.coolLimit) {
        setResultMessage(`Over-cooled! Too many unstable crystals (Form I, II, III) have locked in. It's solid clay now!`);
        setResultStatus("fail");
      } else {
        setResultMessage(`Not cooled enough! No crystallization seeds have formed yet. Cool down to ${profile.coolMin}°C - ${profile.coolMax}°C.`);
        setResultStatus("fail");
      }
    } else if (step === 3) {
      // Validate reheating: warm back up to melt Form IV while keeping stable Form V seeds.
      if (temp >= profile.workMin && temp <= profile.workMax) {
        setStep(4);
        setResultMessage(`Perfect! Form IV crystals melted away, leaving an exclusive matrix of stable Form V seeds in your ${profile.name}.`);
        setResultStatus("success");
      } else if (temp > profile.workLimit) {
        setResultMessage(`Over-heated! You went above ${profile.workLimit}°C and melted your stable Form V seeds too! The chocolate is completely un-tempered.`);
        setResultStatus("fail");
      } else {
        setResultMessage(`Under-heated! Unstable Form IV crystals still remain. Your ${profile.name} will bloom.`);
        setResultStatus("fail");
      }
    }
  };

  // Generate SVG path for plotting the heat curve
  const width = 500;
  const height = 180;
  const padding = 25;
  const maxTime = Math.max(80, history.length);
  const minTemp = 20;
  const maxTemp = 55;

  const points = history
    .map((p, idx) => {
      const x = padding + (idx / maxTime) * (width - 2 * padding);
      const y = height - padding - ((p.temp - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(" ");

  // Microscopic crystal visualization description
  let crystalFormLabel = "Amorphous Lipid Fluid (No crystals)";
  let crystalDescription = "Cocoa butter fats are highly heated and slide past each other randomly.";
  let crystalCgColor = "bg-gray-200";

  if (temp > profile.meltMin - 2) {
    crystalFormLabel = "Amorphous Liquid (0% Crystallized)";
    crystalDescription = `Full melt. All fat crystal memory destroyed in your ${profile.name}. Ready for fresh seeding.`;
    crystalCgColor = "bg-amber-100";
  } else if (temp <= profile.meltMin - 2 && temp > profile.workMax + 1) {
    if (step === 3) {
      crystalFormLabel = "Rapid Crystal Decay (Danger!)";
      crystalDescription = "Heat is too high. Even stable Form V seeds are breaking apart into fluid.";
      crystalCgColor = "bg-red-100";
    } else {
      crystalFormLabel = "Amorphous Liquid cooling";
      crystalDescription = "Fats slowing down but no solid crystal seeds have aggregated yet.";
      crystalCgColor = "bg-amber-50";
    }
  } else if (temp <= profile.workMax + 1 && temp >= profile.coolMax + 1) {
    if (step === 3) {
      crystalFormLabel = "Purified Form V Seed Matrix (Stable)";
      crystalDescription = `Perfect arrangement in ${profile.name}. Unstable seeds are melted, leaving highly stable V crystals.`;
      crystalCgColor = "bg-emerald-100 border border-emerald-400";
    } else {
      crystalFormLabel = "Pre-crystal stage";
      crystalDescription = "Approaching solidification limit. Keep cooling to trigger seed nuclei.";
      crystalCgColor = "bg-yellow-50";
    }
  } else if (temp < profile.coolMax + 1 && temp >= profile.coolLimit) {
    crystalFormLabel = "Mixed Seeding (Form IV & V)";
    crystalDescription = "Form V seeds are growing alongside unstable Form IV crystals. Reheating needed.";
    crystalCgColor = "bg-sky-100";
  } else if (temp < profile.coolLimit) {
    crystalFormLabel = "Unstable Polymorphs (Form I, II, III)";
    crystalDescription = "Over-cooled. Massive, chaotic interlocking of unstable fats. Chalky structure.";
    crystalCgColor = "bg-violet-100 border border-violet-400";
  }

  return (
    <div className="space-y-8" id="tempering-simulator-container">
      {/* Intro */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex gap-4 items-start" id="sim-intro">
        <div className="bg-amber-100 p-2.5 rounded-xl text-amber-800 flex-shrink-0">
          <Beaker className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-950 font-sans">Interactive Tempering Laboratory</h4>
          <p className="text-xs text-amber-900 leading-relaxed">
            Chocolate tempering requires a highly specific temperature curve. Different chocolate varieties need adjusted curves due to milk fats interfering with crystallization. Select a profile below and let's start!
          </p>
        </div>
      </div>

      {/* Chocolate Profile Selector */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4" id="chocolate-selector-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
          <div>
            <h4 className="font-bold text-gray-900 text-sm tracking-wide uppercase font-mono">1. Select Chocolate Profile</h4>
            <p className="text-xs text-gray-500 mt-0.5">Observe how cocoa butter vs. dairy lipids affect the temperatures.</p>
          </div>
          <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-2xl self-start sm:self-auto">
            {(Object.keys(TEMPERING_PROFILES) as Array<"dark" | "milk" | "white">).map((type) => {
              const p = TEMPERING_PROFILES[type];
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-950 text-amber-50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="text-xs text-gray-700 bg-amber-50/20 border border-amber-100/30 p-3.5 rounded-2xl leading-relaxed">
          <span className="font-extrabold text-amber-950 uppercase tracking-wider text-[10px] font-mono block mb-1">
            🔬 {profile.name} Chemical Behavior
          </span>
          {profile.description}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="sim-grid">
        {/* Left Side: Thermometer & Controls */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between" id="sim-controls-panel">
          {/* Current Status Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Step {step} of 3: {step === 1 ? "Melting & Clearing" : step === 2 ? "Cooling & Nucleation" : "Reheating & Pruning"}
            </span>
            <h3 className="text-lg font-extrabold text-gray-900 font-sans">
              {step === 1 && `Heat to ${profile.meltMin}°C - ${profile.meltMax}°C`}
              {step === 2 && `Cool down to ${profile.coolMin}°C - ${profile.coolMax}°C`}
              {step === 3 && `Reheat to ${profile.workMin}°C - ${profile.workMax}°C`}
              {step === 4 && "🎉 Success!"}
            </h3>
          </div>

          {/* Thermometer Display */}
          <div className="flex items-center justify-around bg-gray-50/50 p-6 rounded-2xl border border-gray-100" id="thermometer-visual">
            <div className="text-center">
              <span className="text-xs text-gray-500 font-mono block">Current Temperature</span>
              <span className="text-5xl font-black text-gray-900 font-sans tracking-tight">
                {temp}<span className="text-2xl text-amber-800 font-medium">°C</span>
              </span>
            </div>
            {/* Thermometer SVG bar */}
            <div className="relative w-10 h-32 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
              <div
                className="absolute bottom-0 left-0 right-0 bg-red-600 transition-all duration-300 rounded-b-full"
                style={{ height: `${((temp - 20) / (55 - 20)) * 100}%` }}
              />
              {/* Target lines */}
              <div
                className="absolute left-0 right-0 border-t-2 border-emerald-500 opacity-60"
                style={{ bottom: `${((targetTemp - 20) / (55 - 20)) * 100}%` }}
                title={`Target: ${targetTemp}°C`}
              />
            </div>
          </div>

          {/* Control Dials */}
          <div className="space-y-3" id="cooker-switches">
            <div className="flex gap-4">
              <button
                onMouseDown={() => handleHeat(true)}
                onMouseUp={() => handleHeat(false)}
                onMouseLeave={() => handleHeat(false)}
                onTouchStart={() => handleHeat(true)}
                onTouchEnd={() => handleHeat(false)}
                className={`flex-1 py-4 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer select-none transition-all ${
                  isHeating
                    ? "bg-red-600 border-red-600 text-white shadow-md scale-95"
                    : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                }`}
              >
                🔥 Hold to Heat
              </button>
              <button
                onMouseDown={() => handleCool(true)}
                onMouseUp={() => handleCool(false)}
                onMouseLeave={() => handleCool(false)}
                onTouchStart={() => handleCool(true)}
                onTouchEnd={() => handleCool(false)}
                className={`flex-1 py-4 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer select-none transition-all ${
                  isCooling
                    ? "bg-sky-600 border-sky-600 text-white shadow-md scale-95"
                    : "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100"
                }`}
              >
                ❄️ Hold to Cool
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center italic">
              Click and hold to adjust temperature. Watch the thermometer response.
            </p>
          </div>

          {/* Action validation Button */}
          {resultStatus !== "success" && (
            <button
              id="confirm-temp-btn"
              onClick={advanceStep}
              className="w-full py-3 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              Confirm Temperature ({temp}°C)
            </button>
          )}

          {/* Result Messages */}
          {resultMessage && (
            <div
              id="sim-feedback-box"
              className={`p-4 rounded-xl text-xs leading-relaxed flex gap-3 ${
                resultStatus === "success"
                  ? "bg-emerald-50 text-emerald-950 border border-emerald-100"
                  : "bg-red-50 text-red-950 border border-red-100"
              }`}
            >
              {resultStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0" />
              )}
              <div className="space-y-1">
                <span className="font-bold">{resultStatus === "success" ? "Step Cleared!" : "Error in Chemistry!"}</span>
                <p>{resultMessage}</p>
                {resultStatus === "fail" && (
                  <button
                    onClick={() => resetSim()}
                    className="mt-2 text-[10px] font-bold underline text-red-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Lab Equipment
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-4" id="perfect-tempered-success">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-emerald-950">Masterclass Tempered!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Excellent work! Your {profile.name} cools with a premium satin sheen, snaps elegantly, and easily popped out of the polycarbonate mold blocks!
                </p>
              </div>
              <button
                onClick={() => resetSim()}
                className="px-4 py-2 bg-emerald-950 text-emerald-50 rounded-lg text-xs font-bold hover:bg-emerald-900 transition-all cursor-pointer"
              >
                Reset & Try Again
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Crystallization Microscope & Graph */}
        <div className="lg:col-span-7 space-y-6" id="sim-visualization-panel">
          {/* Microscope View */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4" id="microscope-view">
            <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase flex items-center gap-1.5">
              🔬 Microscope Crystal Viewer <span className="text-[10px] text-gray-400 lowercase font-mono">(Simulated 2000x)</span>
            </h4>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Microscope Circle Visual */}
              <div className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-950 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-inner">
                {/* Simulated Crystals floating */}
                {temp > profile.meltMin - 2 && (
                  <div className="absolute inset-0 bg-amber-950/20 flex items-center justify-center">
                    <div className="w-full h-full opacity-30 animate-pulse bg-gradient-to-tr from-amber-800 to-amber-900" />
                    <span className="text-[10px] text-amber-200 font-mono">fully fluid</span>
                  </div>
                )}
                {temp <= profile.meltMin - 2 && temp > profile.workMax + 1 && (
                  <div className="absolute inset-0 flex flex-wrap gap-2 p-4 items-center justify-center opacity-40">
                    <div className="w-2 h-2 rounded bg-amber-400 animate-ping" />
                    <div className="w-3 h-1 bg-amber-400 rotate-12" />
                  </div>
                )}
                {temp < profile.coolMax + 1 && temp >= profile.coolLimit && (
                  <div className="absolute inset-0 grid grid-cols-4 gap-2 p-3">
                    <div className="w-4 h-4 rounded bg-sky-300 transform rotate-45 border border-sky-400 animate-bounce" />
                    <div className="w-3 h-3 rounded bg-emerald-300 transform rotate-12 border border-emerald-400" />
                    <div className="w-4 h-4 rounded bg-sky-300 transform -rotate-12 border border-sky-400" />
                    <div className="w-3 h-3 rounded bg-emerald-300 transform rotate-45 border border-emerald-400" />
                    <span className="absolute bottom-2 left-0 right-0 text-center text-[8px] text-sky-200 font-mono bg-black/60">V & IV Mixed</span>
                  </div>
                )}
                {temp <= profile.workMax + 1 && temp >= profile.coolMax + 1 && step === 3 && (
                  <div className="absolute inset-0 flex flex-wrap gap-3 p-3 items-center justify-center">
                    <div className="w-5 h-5 bg-emerald-400 border border-emerald-600 rounded transform rotate-45 shadow-sm animate-pulse" />
                    <div className="w-5 h-5 bg-emerald-400 border border-emerald-600 rounded transform rotate-45 shadow-sm animate-pulse" />
                    <div className="w-5 h-5 bg-emerald-400 border border-emerald-600 rounded transform rotate-45 shadow-sm animate-pulse" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-emerald-200 font-bold font-mono bg-black/60">Stable Form V</span>
                  </div>
                )}
                {temp < profile.coolLimit && (
                  <div className="absolute inset-0 flex flex-wrap gap-1 p-2 items-center justify-center">
                    <div className="w-2 h-2 bg-violet-400 border border-violet-500 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-violet-400 border border-violet-500 rounded-full" />
                    <div className="w-2 h-2 bg-violet-400 border border-violet-500 rounded-full animate-pulse" />
                    <div className="w-3 h-3 bg-violet-500 border border-violet-600 rounded-full" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-violet-200 font-mono bg-black/60">unstable cluster</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${crystalCgColor} text-gray-800`}>
                  {crystalFormLabel}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed font-sans">{crystalDescription}</p>
              </div>
            </div>
          </div>

          {/* Heating Curve Graph */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4" id="graph-panel">
            <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase">
              📈 Live Temperature Profiler
            </h4>
            <div className="bg-gray-900 rounded-2xl p-4 overflow-hidden border border-gray-800" id="live-canvas-graph">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#374151" strokeDasharray="3,3" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#374151" strokeDasharray="3,3" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#4B5563" />

                {/* Vertical reference lines for target temps */}
                <line
                  x1={padding}
                  y1={height - padding - ((profile.targetMelt - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  x2={width - padding}
                  y2={height - padding - ((profile.targetMelt - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  stroke="#EF4444"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.3"
                />
                <line
                  x1={padding}
                  y1={height - padding - ((profile.targetCool - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  x2={width - padding}
                  y2={height - padding - ((profile.targetCool - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.3"
                />
                <line
                  x1={padding}
                  y1={height - padding - ((profile.targetWork - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  x2={width - padding}
                  y2={height - padding - ((profile.targetWork - minTemp) / (maxTemp - minTemp)) * (height - 2 * padding)}
                  stroke="#10B981"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.3"
                />

                {/* Left labels (Y axis) */}
                <text x={padding - 5} y={padding + 5} fill="#9CA3AF" fontSize="8" textAnchor="end" fontFamily="monospace">55°C</text>
                <text x={padding - 5} y={height / 2 + 3} fill="#9CA3AF" fontSize="8" textAnchor="end" fontFamily="monospace">37.5°C</text>
                <text x={padding - 5} y={height - padding + 2} fill="#9CA3AF" fontSize="8" textAnchor="end" fontFamily="monospace">20°C</text>

                {/* Plot line */}
                {history.length > 1 && (
                  <polyline
                     fill="none"
                     stroke="#F59E0B"
                     strokeWidth="3.5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     points={points}
                  />
                )}

                {/* Labels */}
                <text x={width / 2} y={height - 5} fill="#6B7280" fontSize="8" textAnchor="middle" fontFamily="monospace">Timeline (Duration of heating/cooling)</text>
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row justify-between text-[10px] text-gray-500 font-mono gap-2 px-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Melt target ({profile.meltMin}°C - {profile.meltMax}°C)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Seed target ({profile.coolMin}°C - {profile.coolMax}°C)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Working target ({profile.workMin}°C - {profile.workMax}°C)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
