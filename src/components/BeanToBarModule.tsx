import React, { useState } from "react";
import { BEAN_TO_BAR_STEPS } from "../data";
import { Flame, Beaker, RotateCw, Layers, Shield, ChevronRight, ChevronLeft, RefreshCw, Zap } from "lucide-react";

export default function BeanToBarModule() {
  const [currentStep, setCurrentStep] = useState(0);

  const stepIcons = [
    <Shield className="w-5 h-5 text-amber-700" key="shield" />,
    <Flame className="w-5 h-5 text-amber-700" key="flame" />,
    <Zap className="w-5 h-5 text-amber-700" key="zap" />,
    <RotateCw className="w-5 h-5 text-amber-700" key="rotate" />,
    <RefreshCw className="w-5 h-5 text-amber-700" key="refresh" />,
    <Beaker className="w-5 h-5 text-amber-700" key="beaker" />,
    <Layers className="w-5 h-5 text-amber-700" key="layers" />,
  ];

  const step = BEAN_TO_BAR_STEPS[currentStep];

  return (
    <div className="space-y-8" id="bean-to-bar-module-container">
      {/* Step Tracker Visual List */}
      <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex flex-wrap justify-between gap-2 overflow-x-auto" id="step-timeline">
        {BEAN_TO_BAR_STEPS.map((s, idx) => (
          <button
            key={s.title}
            id={`timeline-step-btn-${idx}`}
            onClick={() => setCurrentStep(idx)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer text-xs font-semibold ${
              currentStep === idx
                ? "bg-amber-950 text-amber-50 shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-amber-50"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] text-amber-900 font-bold font-mono">
              {idx + 1}
            </span>
            <span className="whitespace-nowrap">{s.title.split(". ")[1]}</span>
          </button>
        ))}
      </div>

      {/* Main Step Detail Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-5 gap-8" id="step-details-grid">
        {/* Left column: Step Number and quick metadata */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between" id="step-metadata-column">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-2xl">
                {stepIcons[currentStep]}
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">Process Step {currentStep + 1} of 7</span>
                <h3 className="text-xl font-extrabold text-gray-950 font-sans">{step.title}</h3>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-50 space-y-3">
            <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">Factory Metrics</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Target Timing</span>
                <span className="text-xs font-bold text-amber-950">{step.duration}</span>
              </div>
              {step.temp && (
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Operational Temp</span>
                  <span className="text-xs font-bold text-amber-950">{step.temp}</span>
                </div>
              )}
              {step.target && (
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Critical Target Quality</span>
                  <span className="text-xs font-bold text-amber-950">{step.target}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Science & Checklist */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between" id="step-science-column">
          <div className="space-y-5">
            <div>
              <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase mb-3">Chocolatier Checklist & SOPs</h4>
              <div className="space-y-3" id="sop-checklist">
                {step.keyAspects.map((aspect, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center flex-shrink-0 font-mono">
                      ✓
                    </span>
                    <p className="text-xs text-gray-700 leading-normal">{aspect}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l-4 border-amber-600 pl-4 py-1 bg-amber-50/10 rounded-r-xl" id="science-note-card">
              <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono flex items-center gap-1">
                🔬 The Science Behind It
              </h5>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed font-sans">{step.scienceNote}</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100" id="step-navigation">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentStep === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-amber-900 hover:bg-amber-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>
            <div className="text-xs font-bold text-gray-400 font-mono">
              Step {currentStep + 1} / 7
            </div>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(BEAN_TO_BAR_STEPS.length - 1, prev + 1))}
              disabled={currentStep === BEAN_TO_BAR_STEPS.length - 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                currentStep === BEAN_TO_BAR_STEPS.length - 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "bg-amber-950 text-amber-50 hover:bg-amber-900 shadow-sm"
              }`}
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
