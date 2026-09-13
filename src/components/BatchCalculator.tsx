import React, { useState } from "react";
import { Calculator, Award, RotateCcw, AlertCircle, RefreshCw, Nut, BookOpen, ListChecks, FileText } from "lucide-react";

export default function BatchCalculator() {
  // Bean to Bar states
  const [batchSize, setBatchSize] = useState<number>(1000); // grams
  const [cocoaPercent, setCocoaPercent] = useState<number>(70); // %
  const [addedButter, setAddedButter] = useState<number>(5); // % of total batch
  const [milkPercent, setMilkPercent] = useState<number>(0); // % of total batch (for milk chocolate)

  // Sub-tabs for Bean to Bar
  const [btbTab, setBtbTab] = useState<"quantity" | "pricing">("quantity");

  // Bean to Bar Prices (₹ per kg)
  const [nibsPrice, setNibsPrice] = useState<number>(600);
  const [butterPrice, setButterPrice] = useState<number>(950);
  const [sugarPrice, setSugarPrice] = useState<number>(60);
  const [milkPrice, setMilkPrice] = useState<number>(450);
  const [lecithinPrice, setLecithinPrice] = useState<number>(400);
  const [vanillaPrice, setVanillaPrice] = useState<number>(12000); // Vanilla is premium!

  // Panning states
  const [nutWeight, setNutWeight] = useState<number>(300); // grams
  const [chocolateRatio, setChocolateRatio] = useState<number>(65); // % of total finished weight
  const [panningTab, setPanningTab] = useState<"specs" | "recipe" | "sop">("specs");

  // Calculations for Bean to Bar
  const totalMass = batchSize;
  const lecithinGrams = Number((totalMass * 0.003).toFixed(1)); // 0.3%
  const vanillaGrams = Number((totalMass * 0.0005).toFixed(1)); // 0.05%

  // Ensure cocoa% is larger than added butter
  const actualNibsGrams = Math.max(0, Number((totalMass * (cocoaPercent / 100) - totalMass * (addedButter / 100)).toFixed(1)));
  const butterGrams = Number((totalMass * (addedButter / 100)).toFixed(1));
  const milkGrams = Number((totalMass * (milkPercent / 100)).toFixed(1));

  // Sugar is the rest
  const sugarPercent = Math.max(0, 100 - cocoaPercent - milkPercent);
  const sugarGrams = Number((totalMass * (sugarPercent / 100)).toFixed(1));

  // Individual ingredient weights in kg
  const nibsKg = actualNibsGrams / 1000;
  const butterKg = butterGrams / 1000;
  const sugarKg = sugarGrams / 1000;
  const milkKg = milkGrams / 1000;
  const lecithinKg = lecithinGrams / 1000;
  const vanillaKg = vanillaGrams / 1000;

  // Individual cost calculations
  const nibsCost = nibsKg * nibsPrice;
  const butterCost = butterKg * butterPrice;
  const sugarCost = sugarKg * sugarPrice;
  const milkCost = milkKg * milkPrice;
  const lecithinCost = lecithinKg * lecithinPrice;
  const vanillaCost = vanillaKg * vanillaPrice;

  const totalCost = nibsCost + butterCost + sugarCost + (milkPercent > 0 ? milkCost : 0) + lecithinCost + vanillaCost;
  const costPerKg = batchSize > 0 ? (totalCost / batchSize) * 1000 : 0;

  // Calculations for Panning
  // If nut is (100 - chocolateRatio)%, then total batch = nutWeight / (1 - chocolateRatio/100)
  const panningTotalWeight = Math.round(nutWeight / (1 - chocolateRatio / 100));
  const panningChocolateWeight = Math.round(panningTotalWeight - nutWeight);
  const gumArabicGrams = Number((nutWeight * 0.04).toFixed(1)); // 4% weight for sealing
  const sealingWaterGrams = Number((gumArabicGrams * 1.5).toFixed(1)); // 1.5x gum arabic weight
  const glazeGrams = Number((panningTotalWeight * 0.002).toFixed(1)); // 0.2% polishing glaze

  // Validate percentages
  const isPercentError = cocoaPercent + milkPercent > 100;

  return (
    <div className="space-y-8" id="batch-calculator-container">
      {/* Tab select style - single screen dual bento grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="calculator-bento-grid">
        {/* Bean-to-Bar Batch Formulator */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6" id="bean-to-bar-calc-panel">
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-gray-950 font-sans flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-800" /> Bean-to-Bar Batch Formulator
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              Calibrate your solid ingredients ratios, manage ingredient prices, and calculate the total cost of your stone-melanger batch.
            </p>

            {/* Separate Tabs for Quantity & Pricing */}
            <div className="flex border-b border-gray-100 gap-4 pt-2">
              <button
                onClick={() => setBtbTab("quantity")}
                id="tab-btb-quantity"
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  btbTab === "quantity"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Raw Ingredients Quantity
              </button>
              <button
                onClick={() => setBtbTab("pricing")}
                id="tab-btb-pricing"
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  btbTab === "pricing"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Ingredient Prices & Costing
              </button>
            </div>

            {btbTab === "quantity" ? (
              <div className="space-y-4 pt-2" id="btb-quantity-inputs">
                {/* Batch Size */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                    <label htmlFor="batch-size-input">Total Batch Weight</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        id="batch-size-input-number"
                        min="10"
                        max="1000000"
                        step="50"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Math.max(10, Number(e.target.value)))}
                        className="w-24 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                      />
                      <span className="text-gray-500 font-bold">g</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="batch-size-input"
                    min="100"
                    max="100000"
                    step="100"
                    value={batchSize > 100000 ? 100000 : batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                    Equivalent to {(batchSize / 1000).toFixed(2)} kg
                  </span>
                </div>

                {/* Cocoa Percent */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <label htmlFor="cocoa-percent-input">Cocoa Core (%) <span className="font-normal text-gray-400 font-sans">(Nibs + Extra Butter)</span></label>
                    <span className="font-mono text-amber-800">{cocoaPercent} %</span>
                  </div>
                  <input
                    type="range"
                    id="cocoa-percent-input"
                    min="30"
                    max="100"
                    step="1"
                    value={cocoaPercent}
                    onChange={(e) => {
                      const nextVal = Number(e.target.value);
                      setCocoaPercent(nextVal);
                      if (nextVal + milkPercent > 100) {
                        setMilkPercent(100 - nextVal);
                      }
                    }}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Added Cocoa Butter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <label htmlFor="added-butter-input">Extra Added Cocoa Butter (%) <span className="font-normal text-gray-400 font-sans">(For fluidity)</span></label>
                    <span className="font-mono text-amber-800">{addedButter} %</span>
                  </div>
                  <input
                    type="range"
                    id="added-butter-input"
                    min="0"
                    max="15"
                    step="0.5"
                    value={addedButter}
                    onChange={(e) => setAddedButter(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Milk Powder % (for Milk Chocolate) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <label htmlFor="milk-percent-input">Milk Powder Solids (%) <span className="font-normal text-gray-400 font-sans">(Set to 0% for dark)</span></label>
                    <span className="font-mono text-amber-800">{milkPercent} %</span>
                  </div>
                  <input
                    type="range"
                    id="milk-percent-input"
                    min="0"
                    max="35"
                    step="1"
                    value={milkPercent}
                    onChange={(e) => {
                      const nextVal = Number(e.target.value);
                      setMilkPercent(nextVal);
                      if (cocoaPercent + nextVal > 100) {
                        setCocoaPercent(100 - nextVal);
                      }
                    }}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2" id="btb-pricing-inputs">
                <span className="text-[10px] text-gray-400 block font-mono">
                  Set raw ingredient prices per kilogram (₹/kg) to compute manufacturing costing:
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Cocoa Nibs Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 block">Cocoa Nibs (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={nibsPrice}
                      onChange={(e) => setNibsPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 bg-amber-50/30 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                  </div>

                  {/* Cocoa Butter Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 block">Cocoa Butter (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={butterPrice}
                      onChange={(e) => setButterPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 bg-amber-50/30 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                  </div>

                  {/* Refined Sugar Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 block">Cane Sugar (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={sugarPrice}
                      onChange={(e) => setSugarPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 bg-amber-50/30 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                  </div>

                  {/* Milk Powder Price */}
                  <div className="space-y-1">
                    <label className={`text-[11px] font-bold block ${milkPercent > 0 ? "text-gray-700" : "text-gray-400"}`}>Milk Powder (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={milkPercent === 0}
                      value={milkPrice}
                      onChange={(e) => setMilkPrice(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded focus:outline-none focus:border-amber-950 ${
                        milkPercent > 0 ? "text-amber-950 bg-amber-50/30 border-amber-200" : "text-gray-400 bg-gray-50 border-gray-150"
                      }`}
                    />
                  </div>

                  {/* Lecithin Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 block">Lecithin (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={lecithinPrice}
                      onChange={(e) => setLecithinPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 bg-amber-50/30 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                  </div>

                  {/* Vanilla/Flavor Price */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-700 block">Flavor/Vanilla (₹/kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={vanillaPrice}
                      onChange={(e) => setVanillaPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 bg-amber-50/30 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recipe Outputs */}
          <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">
              {btbTab === "quantity" ? "Charging Formula Recipe" : "Batch Ingredient Costing"}
            </h4>
            
            {isPercentError ? (
              <div className="text-xs text-red-700 flex items-center gap-1.5 font-sans" id="percent-warning">
                <AlertCircle className="w-4 h-4" /> Percentages exceed 100%! Adjust parameters.
              </div>
            ) : (
              btbTab === "quantity" ? (
                <div className="space-y-2.5 text-xs text-amber-950 font-sans" id="charging-table">
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Cocoa Nibs (Roasted)</span>
                    <span className="font-mono font-bold text-sm">{actualNibsGrams} g <span className="text-[10px] text-gray-400">({(cocoaPercent - addedButter).toFixed(1)}%)</span></span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Pure Cocoa Butter</span>
                    <span className="font-mono font-bold text-sm">{butterGrams} g <span className="text-[10px] text-gray-400">({addedButter}%)</span></span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Refined Cane Sugar</span>
                    <span className="font-mono font-bold text-sm">{sugarGrams} g <span className="text-[10px] text-gray-400">({sugarPercent}%)</span></span>
                  </div>
                  {milkPercent > 0 && (
                    <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                      <span className="font-semibold">Full Cream Milk Powder</span>
                      <span className="font-mono font-bold text-sm">{milkGrams} g <span className="text-[10px] text-gray-400">({milkPercent}%)</span></span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Lecithin <span className="font-normal text-gray-500 font-sans">(Added in last 2 hrs)</span></span>
                    <span className="font-mono font-bold text-sm">{lecithinGrams} g <span className="text-[10px] text-gray-400">(0.3%)</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Vanilla Bean Planifolia</span>
                    <span className="font-mono font-bold text-sm">{vanillaGrams} g <span className="text-[10px] text-gray-400">(0.05%)</span></span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-amber-950 font-sans" id="costing-table">
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Cocoa Nibs (Roasted)</span>
                    <span className="font-mono font-bold text-sm">₹{nibsCost.toFixed(2)} <span className="text-[10px] text-gray-400">({actualNibsGrams}g)</span></span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Pure Cocoa Butter</span>
                    <span className="font-mono font-bold text-sm">₹{butterCost.toFixed(2)} <span className="text-[10px] text-gray-400">({butterGrams}g)</span></span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Refined Cane Sugar</span>
                    <span className="font-mono font-bold text-sm">₹{sugarCost.toFixed(2)} <span className="text-[10px] text-gray-400">({sugarGrams}g)</span></span>
                  </div>
                  {milkPercent > 0 && (
                    <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                      <span className="font-semibold">Full Cream Milk Powder</span>
                      <span className="font-mono font-bold text-sm">₹{milkCost.toFixed(2)} <span className="text-[10px] text-gray-400">({milkGrams}g)</span></span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Lecithin</span>
                    <span className="font-mono font-bold text-sm">₹{lecithinCost.toFixed(2)} <span className="text-[10px] text-gray-400">({lecithinGrams}g)</span></span>
                  </div>
                  <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                    <span className="font-semibold">Flavor/Vanilla</span>
                    <span className="font-mono font-bold text-sm">₹{vanillaCost.toFixed(2)} <span className="text-[10px] text-gray-400">({vanillaGrams}g)</span></span>
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-2 border-t border-amber-200 space-y-1.5">
                    <div className="flex justify-between font-bold text-amber-950">
                      <span>Total Batch Raw Cost:</span>
                      <span className="font-mono text-sm">₹{totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-amber-900/80">
                      <span>Effective Cost per kg:</span>
                      <span className="font-mono">₹{costPerKg.toFixed(2)} / kg</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-sans italic pt-0.5 border-t border-dashed border-amber-200/50">
                      <span>Material cost for standard 70g bar:</span>
                      <span>₹{((totalCost / batchSize) * 70).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Panning & Coated Nuts Calculator */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6" id="panning-calc-panel">
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-gray-950 font-sans flex items-center gap-2">
              <Nut className="w-5 h-5 text-amber-800" /> Coated Nuts (Panning) Calculator
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              Panning requires precise ratios of center nuclei to chocolate coatings. Standard confectionery ratios range from 60% to 70% chocolate layer thickness.
            </p>

            <div className="space-y-4 pt-2">
              {/* Nut weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                  <label htmlFor="nut-weight-input">Raw Roasted Nuts Center weight</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      id="nut-weight-input-number"
                      min="10"
                      max="1000000"
                      step="50"
                      value={nutWeight}
                      onChange={(e) => setNutWeight(Math.max(10, Number(e.target.value)))}
                      className="w-24 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                    />
                    <span className="text-gray-500 font-bold">g</span>
                  </div>
                </div>
                <input
                  type="range"
                  id="nut-weight-input"
                  min="50"
                  max="100000"
                  step="100"
                  value={nutWeight > 100000 ? 100000 : nutWeight}
                  onChange={(e) => setNutWeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                  Equivalent to {(nutWeight / 1000).toFixed(2)} kg
                </span>
              </div>

              {/* Chocolate & Nut Coating Ratio */}
              <div className="space-y-2 bg-amber-50/40 p-3 rounded-2xl border border-amber-100/60">
                <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                  <label htmlFor="chocolate-ratio-input">Nut & Chocolate Formulation Ratio</label>
                  <span className="font-mono text-amber-900 font-bold text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    {100 - chocolateRatio}% Nut : {chocolateRatio}% Choc
                  </span>
                </div>

                {/* Quick Ratio Presets */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { nut: 40, choc: 60, label: "40 : 60" },
                    { nut: 35, choc: 65, label: "35 : 65" },
                    { nut: 30, choc: 70, label: "30 : 70" },
                    { nut: 25, choc: 75, label: "25 : 75" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setChocolateRatio(preset.choc)}
                      className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer text-center ${
                        chocolateRatio === preset.choc
                          ? "bg-amber-950 text-white border-amber-950 shadow-xs"
                          : "bg-white text-gray-650 border-gray-200 hover:border-amber-900 hover:text-amber-950"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Direct Number Inputs for Nut % and Chocolate % */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 block">🥜 Nut Ratio (%)</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="10"
                        max="80"
                        step="1"
                        value={100 - chocolateRatio}
                        onChange={(e) => {
                          const nutVal = Math.min(80, Math.max(10, Number(e.target.value)));
                          setChocolateRatio(100 - nutVal);
                        }}
                        className="w-full bg-white border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:border-amber-950 pr-6"
                      />
                      <span className="absolute right-2 text-xs font-bold text-gray-400 font-mono">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 block">🍫 Chocolate Shell (%)</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        id="chocolate-ratio-number"
                        min="20"
                        max="90"
                        step="1"
                        value={chocolateRatio}
                        onChange={(e) => setChocolateRatio(Math.min(90, Math.max(20, Number(e.target.value))))}
                        className="w-full bg-white border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:border-amber-950 pr-6"
                      />
                      <span className="absolute right-2 text-xs font-bold text-gray-400 font-mono">%</span>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  id="chocolate-ratio-input"
                  min="20"
                  max="90"
                  step="1"
                  value={chocolateRatio}
                  onChange={(e) => setChocolateRatio(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-950 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Panning Outputs */}
          <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-100 pb-2.5 gap-2" id="panning-tabs-header">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Panning Lab Workbench
              </h4>
              <div className="flex bg-amber-100/50 p-0.5 rounded-lg border border-amber-200">
                <button
                  type="button"
                  onClick={() => setPanningTab("specs")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                    panningTab === "specs"
                      ? "bg-amber-950 text-white shadow-sm"
                      : "text-amber-900 hover:bg-amber-200/50"
                  }`}
                >
                  Batch Specs
                </button>
                <button
                  type="button"
                  onClick={() => setPanningTab("recipe")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                    panningTab === "recipe"
                      ? "bg-amber-950 text-white shadow-sm"
                      : "text-amber-900 hover:bg-amber-200/50"
                  }`}
                >
                  Recipe
                </button>
                <button
                  type="button"
                  onClick={() => setPanningTab("sop")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                    panningTab === "sop"
                      ? "bg-amber-950 text-white shadow-sm"
                      : "text-amber-900 hover:bg-amber-200/50"
                  }`}
                >
                  SOP Steps
                </button>
              </div>
            </div>

            {panningTab === "specs" && (
              <div className="space-y-2.5 text-xs text-amber-950 font-sans" id="panning-spec-table">
                <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                  <span className="font-semibold">Nuts Nuclei (hazelnut/almond)</span>
                  <span className="font-mono font-bold text-sm">{nutWeight} g <span className="text-[10px] text-gray-400">({100 - chocolateRatio}%)</span></span>
                </div>
                <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                  <span className="font-semibold">Tempered Chocolate Shell mass</span>
                  <span className="font-mono font-bold text-sm">{panningChocolateWeight} g <span className="text-[10px] text-gray-400">({chocolateRatio}%)</span></span>
                </div>
                <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                  <span className="font-semibold">Gum Arabic (For sealing syrup)</span>
                  <span className="font-mono font-bold text-sm">{gumArabicGrams} g <span className="text-[10px] text-gray-400">(4% nut mass)</span></span>
                </div>
                <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                  <span className="font-semibold">Distilled Water (For syrup dissolution)</span>
                  <span className="font-mono font-bold text-sm">{sealingWaterGrams} g</span>
                </div>
                <div className="flex justify-between border-b border-amber-100/40 pb-1.5">
                  <span className="font-semibold">Polishing Glaze agent (Shellac/Dextrin)</span>
                  <span className="font-mono font-bold text-sm">{glazeGrams} g <span className="text-[10px] text-gray-400">(0.2% total mass)</span></span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-amber-900 border-t border-amber-200">
                  <span>Finished Confectionery Batch Weight</span>
                  <span className="font-mono text-sm">{panningTotalWeight} g</span>
                </div>
              </div>
            )}

            {panningTab === "recipe" && (
              <div className="space-y-3 text-xs text-amber-950 font-sans" id="panning-recipe-table">
                <div className="bg-white/60 p-3 rounded-xl border border-amber-150/50 space-y-1.5">
                  <span className="font-bold text-amber-950 font-mono block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Part A: Nuclei Preparation
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    Take <strong className="font-mono text-amber-900">{nutWeight} g</strong> of raw centers (almonds or hazelnuts). Dry-roast in a single layer at <strong className="text-amber-900">150°C for 20 minutes</strong>. Cool completely to <strong className="text-amber-900">22°C</strong> before loading into the pan.
                  </p>
                </div>

                <div className="bg-white/60 p-3 rounded-xl border border-amber-150/50 space-y-1.5">
                  <span className="font-bold text-amber-950 font-mono block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Part B: Gum Arabic Pre-Coat (Sealing Solution)
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    Dissolve <strong className="font-mono text-amber-900">{gumArabicGrams} g</strong> of Gum Arabic powder in <strong className="font-mono text-amber-900">{sealingWaterGrams} g</strong> of warm distilled water (held at 60°C). Stir thoroughly until transparent. Set aside.
                  </p>
                </div>

                <div className="bg-white/60 p-3 rounded-xl border border-amber-150/50 space-y-1.5">
                  <span className="font-bold text-amber-950 font-mono block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Part C: Chocolate Coating Charge
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    Prepare and temper exactly <strong className="font-mono text-amber-900">{panningChocolateWeight} g</strong> of chocolate. For dark chocolate, hold at <strong className="text-amber-900">31.5°C</strong>. For milk chocolate, hold at <strong className="text-amber-900">29.5°C</strong>.
                  </p>
                </div>

                <div className="bg-white/60 p-3 rounded-xl border border-amber-150/50 space-y-1.5">
                  <span className="font-bold text-amber-950 font-mono block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Part D: Burnishing & Finishing Glaze
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    Have exactly <strong className="font-mono text-amber-900">{glazeGrams} g</strong> of high-gloss polishing glaze (Shellac, Capol, or liquid Dextrin) ready for the final buffing stage.
                  </p>
                </div>
              </div>
            )}

            {panningTab === "sop" && (
              <div className="space-y-3 text-xs text-amber-950 font-sans" id="panning-sop-steps">
                <div className="relative border-l border-amber-200/60 pl-4 ml-2 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 bg-amber-800 text-amber-50 text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
                    <h5 className="font-bold text-amber-950 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> Sealing & Gum Pre-Coat
                    </h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      Turn the panning drum to 24–28 RPM. Drizzle the warm gum solution over the tumbling almonds. Blow dry, warm air (38°C) until a glassy protective shell forms. This seals the almond oil and prevents it from turning the chocolate rancid or causing grey spots.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 bg-amber-800 text-amber-50 text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
                    <h5 className="font-bold text-amber-950 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> Chocolate Grossing (Coating)
                    </h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      Ensure the chocolate room is cold (16°C–18°C). Drizzle small, steady streams of tempered chocolate (<strong className="font-mono text-amber-900">{panningChocolateWeight} g</strong>) on the tumbling bed in batches of 15–25g. Blow cool dry air (15°C) to set each coat. Maintain pan speed at 20–22 RPM.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 bg-amber-800 text-amber-50 text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                    <h5 className="font-bold text-amber-950 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> Friction Self-Burnishing
                    </h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      Once all chocolate is applied, turn the cooling air completely OFF. Let the chocolate coated nuts roll and tumble against each other. High surface-to-surface friction self-burnishes the chocolate, smoothing out ridges and creating a flawless, satin matte sheen.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[21px] top-0 bg-amber-800 text-amber-50 text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">4</span>
                    <h5 className="font-bold text-amber-950 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <ListChecks className="w-3 h-3" /> Glaze Curing & Sealing
                    </h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      Add the polishing agent (<strong className="font-mono text-amber-900">{glazeGrams} g</strong>) and tumble for 15 minutes without blowing air. Turn on a light, dry air flow to fully cure the glaze into a high-gloss, protective, moisture-proof shell.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
