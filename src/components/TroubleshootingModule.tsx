import React, { useState } from "react";
import { TROUBLESHOOTING_GUIDE } from "../data";
import { AlertTriangle, Filter, Eye, RefreshCw, HelpCircle } from "lucide-react";

export default function TroubleshootingModule() {
  const [filterSymptom, setFilterSymptom] = useState<string>("all");

  const symptomsList = [
    { value: "all", label: "All Defects" },
    { value: "surface", label: "Surface Look (Bloom / Dullness)" },
    { value: "texture", label: "Texture & Feel (Sandy / Seized)" },
    { value: "panning", label: "Panning / Coated Nuts defects" },
  ];

  const filteredGuide = TROUBLESHOOTING_GUIDE.filter((item) => {
    if (filterSymptom === "all") return true;
    if (filterSymptom === "surface") {
      return item.defect.includes("Bloom") || item.defect.includes("Finish");
    }
    if (filterSymptom === "texture") {
      return item.defect.includes("Seizing") || item.defect.includes("Viscosity");
    }
    if (filterSymptom === "panning") {
      return item.defect.includes("Panning");
    }
    return true;
  });

  return (
    <div className="space-y-6" id="troubleshooting-module-container">
      {/* Filters header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm" id="troubleshooting-filter-bar">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-800" />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">Filter by Defect Symptom</span>
        </div>
        <div className="flex gap-2 flex-wrap" id="trouble-filter-buttons">
          {symptomsList.map((sym) => (
            <button
              key={sym.value}
              id={`filter-btn-${sym.value}`}
              onClick={() => setFilterSymptom(sym.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filterSymptom === sym.value
                  ? "bg-amber-950 text-amber-50"
                  : "bg-gray-50 text-gray-600 hover:bg-amber-50"
              }`}
            >
              {sym.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Defects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="defects-cards-grid">
        {filteredGuide.map((item) => (
          <div
            key={item.defect}
            id={`defect-${item.defect.toLowerCase().replace(/\s+/g, "-")}`}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-base font-extrabold text-gray-950 font-sans flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-800 flex-shrink-0" /> {item.defect}
                </h4>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                  item.defect.includes("Panning") ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {item.defect.includes("Panning") ? "Panning Technique" : "Bean-to-Bar Chemistry"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Core Symptom
                </span>
                <p className="text-xs text-gray-700 leading-normal">{item.symptom}</p>
              </div>

              <div className="space-y-1 bg-amber-50/20 p-3 rounded-xl border border-amber-50/50">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">🔬 Biological & Chemical Cause</span>
                <p className="text-xs text-amber-950 leading-normal font-sans">{item.cause}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-gray-50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-mono flex items-center gap-1">
                ⚙️ Master Chocolatier Solution
              </span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans font-medium">{item.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
