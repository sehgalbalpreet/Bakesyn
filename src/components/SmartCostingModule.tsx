import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Clock, 
  ChevronRight, 
  Send, 
  RefreshCw, 
  PieChart as PieIcon, 
  Info,
  Scale,
  Percent,
  Layers,
  Coins,
  Zap,
  Building2,
  Cpu,
  Sliders,
  ChevronDown,
  ChevronUp,
  Settings2,
  Fan,
  Check,
  HelpCircle,
  Activity
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";

// Types matching the firebase blueprint representation
interface Ingredient {
  id: string;
  name: string;
  category: "beans" | "sugar" | "cocoa_butter" | "inclusions" | "packaging";
  costPerKg: number; // For packaging, it's cost per unit
  userId: string;
  updatedAt: string;
}

interface RecipeIngredient {
  ingredientId: string;
  name: string;
  category: string;
  ratio: number; // percentage (0 to 100)
}

interface Recipe {
  id: string;
  name: string;
  cocoaPercentage: number;
  ingredients: RecipeIngredient[];
  lossFactor: number; // percentage of weight lost during processing (e.g. sorting/winnowing/moisture)
  barWeightGrams: number; // Finished weight of individual bar
  packagingCostPerUnit: number;
  userId: string;
  updatedAt: string;
}

interface CostingRun {
  id: string;
  recipeId: string;
  recipeName: string;
  batchSizeKg: number;
  hourlyLaborRate: number;
  laborHoursNeeded: number;
  overheadFixed: number; // allocation of rent, power, utilities
  wholesaleMarkup: number; // % markup over total cost
  retailMarkup: number; // % markup over wholesale or total cost
  totalCost: number;
  costPerBar: number;
  wholesalePrice: number;
  retailPrice: number;
  totalRevenue: number;
  totalProfit: number;
  userId: string;
  createdAt: string;
}

// Error handling helper in accordance with firebase-integration guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sensible defaults in Indian Rupees (₹)
const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: "def-bean-malabar", name: "Organic Malabar Cocoa Beans", category: "beans", costPerKg: 550.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-bean-idukki", name: "Idukki Hills Single Estate Cocoa Beans", category: "beans", costPerKg: 650.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-sugar-cane", name: "Refined Organic Cane Sugar", category: "sugar", costPerKg: 60.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-butter-pure", name: "Cold-Pressed Pure Cocoa Butter", category: "cocoa_butter", costPerKg: 950.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-inc-hazel", name: "Roasted Piedmont Hazelnuts", category: "inclusions", costPerKg: 1200.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-inc-seasalt", name: "Maldon Sea Salt Flakes", category: "inclusions", costPerKg: 1500.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-pkg-foil", name: "Artisanal Foil Wrapper", category: "packaging", costPerKg: 5.00, userId: "default", updatedAt: new Date().toISOString() },
  { id: "def-pkg-box", name: "Recycled Kraft Chocolate Box", category: "packaging", costPerKg: 25.00, userId: "default", updatedAt: new Date().toISOString() },
];

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: "def-rec-70dark",
    name: "70% Single Origin Malabar Dark",
    cocoaPercentage: 70,
    ingredients: [
      { ingredientId: "def-bean-malabar", name: "Organic Malabar Cocoa Beans", category: "beans", ratio: 65 },
      { ingredientId: "def-butter-pure", name: "Cold-Pressed Pure Cocoa Butter", category: "cocoa_butter", ratio: 5 },
      { ingredientId: "def-sugar-cane", name: "Refined Organic Cane Sugar", category: "sugar", ratio: 30 }
    ],
    lossFactor: 22, // 22% winnowing and sorting loss
    barWeightGrams: 70,
    packagingCostPerUnit: 15.00,
    userId: "default",
    updatedAt: new Date().toISOString()
  },
  {
    id: "def-rec-milk-hazel",
    name: "55% Dark Milk with Hazelnuts",
    cocoaPercentage: 55,
    ingredients: [
      { ingredientId: "def-bean-idukki", name: "Idukki Hills Single Estate Cocoa Beans", category: "beans", ratio: 45 },
      { ingredientId: "def-butter-pure", name: "Cold-Pressed Pure Cocoa Butter", category: "cocoa_butter", ratio: 10 },
      { ingredientId: "def-sugar-cane", name: "Refined Organic Cane Sugar", category: "sugar", ratio: 30 },
      { ingredientId: "def-inc-hazel", name: "Roasted Piedmont Hazelnuts", category: "inclusions", ratio: 15 }
    ],
    lossFactor: 15,
    barWeightGrams: 80,
    packagingCostPerUnit: 18.00,
    userId: "default",
    updatedAt: new Date().toISOString()
  }
];

// Electricity & Commercial Power Tariffs
interface ElectricityTariff {
  id: string;
  name: string;
  stateOrRegion: string;
  loadTier: string;
  ratePerKwh: number;
  description: string;
}

const ELECTRICITY_TARIFF_PRESETS: ElectricityTariff[] = [
  {
    id: "chd_lt_20kw",
    name: "Chandigarh – Small Workshop (≤ 20 kW)",
    stateOrRegion: "Chandigarh (U.T.)",
    loadTier: "Connected Load ≤ 20 kW (LT Non-Domestic)",
    ratePerKwh: 5.5,
    description: "Standard domestic/small commercial tariff slab for micro chocolate studios & workshops."
  },
  {
    id: "chd_gt_20kw",
    name: "Chandigarh – Commercial Facility (> 20 kW)",
    stateOrRegion: "Chandigarh (U.T.)",
    loadTier: "Connected Load > 20 kW (Medium Supply / Industrial)",
    ratePerKwh: 10.0,
    description: "Commercial tariff slab for units with multiple panning lines and central 3-phase HVAC."
  },
  {
    id: "punjab_lt_20kw",
    name: "Punjab (PSPCL) – Small Non-Residential (≤ 20 kW)",
    stateOrRegion: "Punjab",
    loadTier: "Load ≤ 20 kW (NRS)",
    ratePerKwh: 6.5,
    description: "Punjab State Power Corporation tariff for small confectionery labs."
  },
  {
    id: "punjab_gt_20kw",
    name: "Punjab (PSPCL) – Medium Supply (> 20 kW)",
    stateOrRegion: "Punjab",
    loadTier: "Load > 20 kW (MS / Industrial)",
    ratePerKwh: 8.2,
    description: "Punjab medium supply 3-phase commercial rate."
  },
  {
    id: "delhi_lt_10kw",
    name: "Delhi (BSES/TPDDL) – Small Commercial (≤ 10 kW)",
    stateOrRegion: "Delhi NCR",
    loadTier: "Non-Domestic ≤ 10 kW",
    ratePerKwh: 6.0,
    description: "Delhi commercial tariff for small production studios."
  },
  {
    id: "delhi_gt_10kw",
    name: "Delhi (BSES/TPDDL) – Commercial (> 10 kW)",
    stateOrRegion: "Delhi NCR",
    loadTier: "Non-Domestic > 10 kW",
    ratePerKwh: 8.5,
    description: "Delhi commercial slab for scaled confectionery facilities."
  },
  {
    id: "mh_commercial",
    name: "Maharashtra (MSEDCL) – Commercial LT",
    stateOrRegion: "Maharashtra",
    loadTier: "LT-II Commercial",
    ratePerKwh: 11.5,
    description: "Standard commercial tariff for Mumbai / Pune confectionery kitchens."
  },
  {
    id: "ka_commercial",
    name: "Karnataka (BESCOM) – LT-3 Commercial",
    stateOrRegion: "Karnataka",
    loadTier: "LT-3 Commercial",
    ratePerKwh: 8.5,
    description: "Bangalore / Karnataka commercial rate for food manufacturing."
  },
  {
    id: "tn_commercial",
    name: "Tamil Nadu (TANGEDCO) – Commercial",
    stateOrRegion: "Tamil Nadu",
    loadTier: "Commercial Tariff V",
    ratePerKwh: 9.5,
    description: "Tamil Nadu commercial rate for bean-to-bar chocolate workshops."
  },
  {
    id: "gj_commercial",
    name: "Gujarat (UGVCL/DGVCL) – Commercial",
    stateOrRegion: "Gujarat",
    loadTier: "Commercial LTMD",
    ratePerKwh: 7.5,
    description: "Gujarat industrial & commercial tariff."
  },
  {
    id: "us_commercial",
    name: "USA Commercial (Average Grid)",
    stateOrRegion: "United States",
    loadTier: "Commercial Standard",
    ratePerKwh: 0.15,
    description: "US commercial electric rate average ($0.15/kWh)."
  },
  {
    id: "eu_commercial",
    name: "European Union Commercial",
    stateOrRegion: "Europe",
    loadTier: "Commercial Standard",
    ratePerKwh: 0.26,
    description: "EU commercial electric rate average (€0.26/kWh)."
  },
  {
    id: "custom",
    name: "Custom Tariff Rate",
    stateOrRegion: "Custom",
    loadTier: "Custom Entry",
    ratePerKwh: 8.0,
    description: "Enter your exact utility electricity bill rate per kWh."
  }
];

interface FacilityPreset {
  id: string;
  name: string;
  machinesCount: number;
  machinePowerKw: number;
  acTonnage: number; // in Tonnes (1 Ton ~ 1.1 kW draw)
  hasDehumidifier: boolean;
  dehumidifierKw: number;
  description: string;
}

const FACILITY_PRESETS: FacilityPreset[] = [
  {
    id: "setup_2m_1ac",
    name: "2 Panning Machines + 1× 1.5 Ton AC",
    machinesCount: 2,
    machinePowerKw: 1.2,
    acTonnage: 1.5,
    hasDehumidifier: false,
    dehumidifierKw: 0.8,
    description: "Small artisan workshop running 2 panning drums cooled by one 1.5 Ton split AC."
  },
  {
    id: "setup_4m_2ac",
    name: "4 Panning Machines + 2× 1.5 Ton AC + Dehumidifier",
    machinesCount: 4,
    machinePowerKw: 1.2,
    acTonnage: 3.0,
    hasDehumidifier: true,
    dehumidifierKw: 0.8,
    description: "Boutique confectionery studio with 4 drums, dual AC, and active humidity regulation."
  },
  {
    id: "setup_6m_5ton",
    name: "6 Panning Machines + 1× 5 Ton Central AC + Dehumidifier",
    machinesCount: 6,
    machinePowerKw: 1.5,
    acTonnage: 5.0,
    hasDehumidifier: true,
    dehumidifierKw: 1.2,
    description: "Commercial factory line running 6 heavy panning drums with 5 Ton ductable climate control."
  },
  {
    id: "setup_custom",
    name: "Custom Equipment & HVAC Setup",
    machinesCount: 2,
    machinePowerKw: 1.2,
    acTonnage: 1.5,
    hasDehumidifier: false,
    dehumidifierKw: 0.8,
    description: "Customize your active machine count, motor wattage, and air conditioning tonnage."
  }
];

export type AdvisorDomain = "chocolate_costing" | "panning_costing" | "recipe_formulator";

export default function SmartCostingModule() {
  const [activeTab, setActiveTab] = useState<"inventory" | "recipes" | "pricing" | "advisor">("pricing");
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP" | "JPY">(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return (saved as any) || "INR";
  });

  useEffect(() => {
    localStorage.setItem("chocolate_currency", currency);
  }, [currency]);

  const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥"
  };

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const [pricingSubTab, setPricingSubTab] = useState<"beantobar" | "panning">("beantobar");

  // Panning Costing State
  const [panningBatchSize, setPanningBatchSize] = useState<number>(5); // 2, 5, or 10 kg
  const [panningRawNutCost, setPanningRawNutCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 9.0 : 650;
  });
  const [panningRoastingCost, setPanningRoastingCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 0.75 : 50;
  });
  const [panningMiscCost, setPanningMiscCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 3.0 : 200;
  });
  const [panningElectricityCost, setPanningElectricityCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 2.0 : 150;
  });
  const [panningLaborRate, setPanningLaborRate] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 15.0 : 250;
  });
  const [panningLaborHours, setPanningLaborHours] = useState<number>(4);
  const [panningChocCost, setPanningChocCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 8.0 : 550;
  });
  const [panningNutRatio, setPanningNutRatio] = useState<number>(40); // default 40% nuts, 60% chocolate
  const [panningMargin, setPanningMargin] = useState<number>(60); // 60% margin

  // Smart Facility Electricity & Regional Tariff States
  const [selectedTariffId, setSelectedTariffId] = useState<string>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? "us_commercial" : "chd_lt_20kw";
  });
  const [customTariffRate, setCustomTariffRate] = useState<number>(8.0);
  const [selectedFacilityPresetId, setSelectedFacilityPresetId] = useState<string>("setup_2m_1ac");
  const [facilityMachineCount, setFacilityMachineCount] = useState<number>(2);
  const [panningDrumPowerKw, setPanningDrumPowerKw] = useState<number>(1.2);
  const [facilityAcTonnage, setFacilityAcTonnage] = useState<number>(1.5);
  const [facilityHasDehumidifier, setFacilityHasDehumidifier] = useState<boolean>(false);
  const [facilityDehumidifierKw, setFacilityDehumidifierKw] = useState<number>(0.8);
  const [powerCalculatorOpen, setPowerCalculatorOpen] = useState<boolean>(false);
  const [autoSyncElectricity, setAutoSyncElectricity] = useState<boolean>(false);

  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(DEFAULT_RECIPES);
  const [costingRuns, setCostingRuns] = useState<CostingRun[]>([]);

  // Add Ingredient Form state
  const [newIngName, setNewIngName] = useState("");
  const [newIngCategory, setNewIngCategory] = useState<Ingredient["category"]>("beans");
  const [newIngCost, setNewIngCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 8.0 : 500;
  });
  const [ingActionFeedback, setIngActionFeedback] = useState<string | null>(null);

  // Add Recipe Form state
  const [recipeName, setRecipeName] = useState("");
  const [recipeBarWeight, setRecipeBarWeight] = useState<number>(70);
  const [recipeLossFactor, setRecipeLossFactor] = useState<number>(20);
  const [recipePkgCost, setRecipePkgCost] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 0.6 : 15;
  });
  const [recipeIngsList, setRecipeIngsList] = useState<RecipeIngredient[]>([]);
  const [currentIngSelection, setCurrentIngSelection] = useState("");
  const [currentIngRatio, setCurrentIngRatio] = useState<number>(10);
  const [recipeFeedback, setRecipeFeedback] = useState<string | null>(null);

  // Active Costing State
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(DEFAULT_RECIPES[0].id);
  const [batchSizeKg, setBatchSizeKg] = useState<number>(10); // 10 kg standard micro-batch
  const [hourlyLaborRate, setHourlyLaborRate] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 15 : 250;
  });
  const [laborHours, setLaborHours] = useState<number>(8); // hours to process batch
  const [overheadFixed, setOverheadFixed] = useState<number>(() => {
    const saved = localStorage.getItem("chocolate_currency");
    return saved === "USD" || saved === "EUR" || saved === "GBP" ? 120 : 5000;
  });
  const [wholesaleMarkup, setWholesaleMarkup] = useState<number>(50); // 50% wholesale markup over cost
  const [retailMarkup, setRetailMarkup] = useState<number>(100); // 100% markup (MSRP) over wholesale (keystone)

  // AI Advisor state - Multi-Domain Specialty Advisor (Chocolate Bar Costing, Panning & Dragées, Recipe Formulator)
  const [advisorDomain, setAdvisorDomain] = useState<AdvisorDomain>("chocolate_costing");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Dedicated Chat Threads per Domain
  const [chocolateChat, setChocolateChat] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "🍫 Welcome to the Bean-to-Bar Chocolate Costing & Financial Advisor! I am specialized in analyzing single-origin bean shrinkage/winnowing, conching overheads, packaging economics, and wholesale vs. retail margin structures based on your active batch configuration."
    }
  ]);
  const [panningChat, setPanningChat] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "🥜 Welcome to the Panning & Dragée Business Advisor! I specialize in chocolate-enrobed nuts, panning drum throughput, roasting moisture shrinkage, shared HVAC/AC utility load allocation, and confectionery retail pricing strategy."
    }
  ]);
  const [recipeChat, setRecipeChat] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "🥣 Welcome to the Chocolate Recipe & Formulation Advisor! I specialize in bean blend ratios, total fat content, viscosity tuning, sugar-to-cocoa balances, milk solids adjustments, and rheological formulation troubleshooting."
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle currency scaling for interactive costing sliders
  const prevCurrencyRef = useRef(currency);
  useEffect(() => {
    if (prevCurrencyRef.current !== currency) {
      if (currency === "INR" && prevCurrencyRef.current !== "INR") {
        // Switched to INR
        setHourlyLaborRate(prev => Math.round(prev * 75 < 50 ? 250 : Math.min(prev * 75, 1500)));
        setOverheadFixed(prev => Math.round(prev * 75 < 500 ? 5000 : Math.min(prev * 75, 25000)));
        setNewIngCost(prev => Math.round(prev * 75 < 50 ? 500 : Math.min(prev * 75, 1500)));
        setRecipePkgCost(prev => Math.round(prev * 75 < 5 ? 15 : Math.min(prev * 75, 200)));
        
        // Scale Panning states
        setPanningRawNutCost(prev => Math.round(prev * 75));
        setPanningRoastingCost(prev => Math.round(prev * 75));
        setPanningMiscCost(prev => Math.round(prev * 75));
        setPanningElectricityCost(prev => Math.round(prev * 75));
        setPanningLaborRate(prev => Math.round(prev * 75));
        setPanningChocCost(prev => Math.round(prev * 75));
      } else if (currency !== "INR" && prevCurrencyRef.current === "INR") {
        // Switched from INR
        setHourlyLaborRate(prev => Math.round(prev / 75 < 5 ? 15 : Math.min(prev / 75, 100)));
        setOverheadFixed(prev => Math.round(prev / 75 < 10 ? 120 : Math.min(prev / 75, 1000)));
        setNewIngCost(prev => Math.round(prev / 75 < 1 ? 8 : Math.min(prev / 75, 50)));
        setRecipePkgCost(prev => Math.round(prev / 75 < 0.2 ? 0.6 : Math.min(prev / 75, 10)));
        
        // Scale Panning states
        setPanningRawNutCost(prev => Math.round(prev / 75));
        setPanningRoastingCost(prev => Math.round(prev / 75));
        setPanningMiscCost(prev => Math.round(prev / 75));
        setPanningElectricityCost(prev => Math.round(prev / 75));
        setPanningLaborRate(prev => Math.round(prev / 75));
        setPanningChocCost(prev => Math.round(prev / 75));
      }
      prevCurrencyRef.current = currency;
    }
  }, [currency]);

  // Reset all recipes & ingredients in local/Firestore to beautiful Indian Rupee (₹) standards
  const handleResetToRupeeDefaults = async () => {
    if (!window.confirm("This will reset your chocolate ingredients and recipes to standard Indian Rupee (₹) benchmarks in the system. Do you want to proceed?")) {
      return;
    }
    
    const user = auth.currentUser;
    const uid = user ? user.uid : "offline-user";

    // Update state currency and presets
    setCurrency("INR");
    setHourlyLaborRate(250);
    setOverheadFixed(5000);
    setBatchSizeKg(10);
    setNewIngCost(500);
    setRecipePkgCost(15);

    // Reset panning costing defaults
    setPanningRawNutCost(650);
    setPanningRoastingCost(50);
    setPanningMiscCost(200);
    setPanningElectricityCost(150);
    setPanningLaborRate(250);
    setPanningLaborHours(4);
    setPanningChocCost(550);
    setPanningNutRatio(40);
    setPanningMargin(60);

    if (user) {
      try {
        // Query existing ingredients for the user
        const qIngs = query(collection(db, "ingredients"), where("userId", "==", user.uid));
        const snapIngs = await getDocs(qIngs);
        const deletePromises = snapIngs.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Query existing recipes for the user
        const qRecs = query(collection(db, "recipes"), where("userId", "==", user.uid));
        const snapRecs = await getDocs(qRecs);
        const deleteRecPromises = snapRecs.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteRecPromises);

        // Batch write new defaults
        const newIngs = DEFAULT_INGREDIENTS.map(i => ({ ...i, userId: user.uid }));
        const writeIngPromises = newIngs.map(i => setDoc(doc(db, "ingredients", i.id), i));
        await Promise.all(writeIngPromises);

        const newRecs = DEFAULT_RECIPES.map(r => ({ ...r, userId: user.uid }));
        const writeRecPromises = newRecs.map(r => setDoc(doc(db, "recipes", r.id), r));
        await Promise.all(writeRecPromises);

        setRecipeFeedback("Reset and initialized Indian Rupee (₹) recipe benchmarks in Cloud!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "reset-rupee-defaults");
      }
    } else {
      // Local Reset
      setIngredients(DEFAULT_INGREDIENTS.map(i => ({ ...i, userId: uid })));
      setRecipes(DEFAULT_RECIPES.map(r => ({ ...r, userId: uid })));
      setRecipeFeedback("Reset and initialized Indian Rupee (₹) recipe benchmarks locally!");
    }
    
    setTimeout(() => setRecipeFeedback(null), 4000);
  };

  // Synchronize Firestore data based on authenticated user
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to Ingredients
    const qIngredients = query(collection(db, "ingredients"), where("userId", "==", user.uid));
    const unsubIngs = onSnapshot(qIngredients, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Ingredient[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Ingredient);
        });
        setIngredients(loaded);
      } else {
        // If empty in cloud, initialize with defaults
        setIngredients(DEFAULT_INGREDIENTS.map(i => ({ ...i, userId: user.uid })));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "ingredients");
    });

    // Listen to Recipes
    const qRecipes = query(collection(db, "recipes"), where("userId", "==", user.uid));
    const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Recipe[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        setRecipes(loaded);
        if (loaded.length > 0 && !loaded.some(r => r.id === selectedRecipeId)) {
          setSelectedRecipeId(loaded[0].id);
        }
      } else {
        setRecipes(DEFAULT_RECIPES.map(r => ({ ...r, userId: user.uid })));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "recipes");
    });

    // Listen to Costing Runs
    const qRuns = query(collection(db, "costingRuns"), where("userId", "==", user.uid));
    const unsubRuns = onSnapshot(qRuns, (snapshot) => {
      const loaded: CostingRun[] = [];
      snapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() } as CostingRun);
      });
      // Sort runs by date descending
      loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCostingRuns(loaded);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "costingRuns");
    });

    return () => {
      unsubIngs();
      unsubRecipes();
      unsubRuns();
    };
  }, []);

  // Save ingredient
  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const user = auth.currentUser;
    const uid = user ? user.uid : "offline-user";
    const newId = `ing-${Date.now()}`;

    const newIng: Ingredient = {
      id: newId,
      name: newIngName.trim(),
      category: newIngCategory,
      costPerKg: Number(newIngCost),
      userId: uid,
      updatedAt: new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "ingredients", newId), newIng);
        setIngActionFeedback("Ingredient added to cloud inventory!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `ingredients/${newId}`);
      }
    } else {
      setIngredients(prev => [...prev, newIng]);
      setIngActionFeedback("Ingredient added locally!");
    }

    setNewIngName("");
    setNewIngCost(currency === "INR" ? 500 : 8.0);
    setTimeout(() => setIngActionFeedback(null), 3000);
  };

  // Delete ingredient
  const handleDeleteIngredient = async (id: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteDoc(doc(db, "ingredients", id));
        setIngActionFeedback("Ingredient removed!");
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `ingredients/${id}`);
      }
    } else {
      setIngredients(prev => prev.filter(i => i.id !== id));
      setIngActionFeedback("Ingredient removed locally!");
    }
    setTimeout(() => setIngActionFeedback(null), 3000);
  };

  // Handle adding ingredient into Recipe Builder
  const handleAddIngToRecipe = () => {
    if (!currentIngSelection) return;
    const selected = ingredients.find(i => i.id === currentIngSelection);
    if (!selected) return;

    if (recipeIngsList.some(r => r.ingredientId === selected.id)) {
      setRecipeFeedback("Ingredient already added to recipe!");
      return;
    }

    const item: RecipeIngredient = {
      ingredientId: selected.id,
      name: selected.name,
      category: selected.category,
      ratio: Number(currentIngRatio)
    };

    setRecipeIngsList(prev => [...prev, item]);
    setRecipeFeedback(null);
  };

  const removeIngFromRecipeList = (ingId: string) => {
    setRecipeIngsList(prev => prev.filter(i => i.ingredientId !== ingId));
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      setRecipeFeedback("Please specify a recipe name.");
      return;
    }

    const totalRatio = recipeIngsList.reduce((acc, curr) => acc + curr.ratio, 0);
    if (Math.abs(totalRatio - 100) > 0.01) {
      setRecipeFeedback(`Ratios must sum to exactly 100%. Current total: ${totalRatio}%`);
      return;
    }

    const cocoaPct = recipeIngsList
      .filter(i => i.category === "beans" || i.category === "cocoa_butter")
      .reduce((acc, curr) => acc + curr.ratio, 0);

    const user = auth.currentUser;
    const uid = user ? user.uid : "offline-user";
    const recipeId = `recipe-${Date.now()}`;

    const newRecipe: Recipe = {
      id: recipeId,
      name: recipeName.trim(),
      cocoaPercentage: cocoaPct,
      ingredients: recipeIngsList,
      lossFactor: Number(recipeLossFactor),
      barWeightGrams: Number(recipeBarWeight),
      packagingCostPerUnit: Number(recipePkgCost),
      userId: uid,
      updatedAt: new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "recipes", recipeId), newRecipe);
        setRecipeFeedback("Recipe saved successfully to cloud!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `recipes/${recipeId}`);
      }
    } else {
      setRecipes(prev => [...prev, newRecipe]);
      setRecipeFeedback("Recipe saved locally!");
    }

    setRecipeName("");
    setRecipeIngsList([]);
    setTimeout(() => setRecipeFeedback(null), 3000);
  };

  // Perform Costing Calculation
  const getActiveRecipe = () => {
    return recipes.find(r => r.id === selectedRecipeId) || recipes[0];
  };

  const computeRecipeCosting = () => {
    const recipe = getActiveRecipe();
    if (!recipe) return null;

    // 1. Calculate ingredient raw cost per kg of raw chocolate input
    let rawIngredientCostPerKg = 0;
    const itemizedDetails = recipe.ingredients.map(ri => {
      // Find latest price from inventory
      const matchingInv = ingredients.find(i => i.id === ri.ingredientId) || 
                          DEFAULT_INGREDIENTS.find(i => i.name === ri.name);
      const costPerKg = matchingInv ? matchingInv.costPerKg : 8.0;
      const proportionalCost = (ri.ratio / 100) * costPerKg;
      rawIngredientCostPerKg += proportionalCost;
      
      return {
        ...ri,
        costPerKg,
        proportionalCost
      };
    });

    // 2. Adjust for production yield loss/shrinkage (melanging waste, sorting, moisture)
    // Yield factor = (100 - lossFactor) %
    // Cost per finished kg of chocolate = rawIngredientCostPerKg / (yield factor)
    const yieldFactor = (100 - recipe.lossFactor) / 100;
    const finishedChocolateCostPerKg = yieldFactor > 0 ? rawIngredientCostPerKg / yieldFactor : rawIngredientCostPerKg;

    // 3. Chocolate raw cost per bar of weight
    const barWeightKg = recipe.barWeightGrams / 1000;
    const chocolateCostPerBar = finishedChocolateCostPerKg * barWeightKg;

    // 4. Packaging + Base COGS
    const cogsPerBar = chocolateCostPerBar + recipe.packagingCostPerUnit;

    // 5. Batch specific computations
    const rawBatchCost = finishedChocolateCostPerKg * batchSizeKg;
    const laborCost = laborHours * hourlyLaborRate;
    const totalBatchCost = rawBatchCost + laborCost + overheadFixed;
    
    const barsFromBatch = Math.floor((batchSizeKg * 1000) / recipe.barWeightGrams);
    const actualTotalCostPerBar = barsFromBatch > 0 ? totalBatchCost / barsFromBatch : 0;

    // Markup Pricing Strategy
    const wholesalePrice = actualTotalCostPerBar * (1 + wholesaleMarkup / 100);
    const retailPrice = wholesalePrice * (1 + retailMarkup / 100);

    // Batch Economics Summary
    const totalRevenueWholesale = barsFromBatch * wholesalePrice;
    const totalProfitWholesale = totalRevenueWholesale - totalBatchCost;
    const totalRevenueRetail = barsFromBatch * retailPrice;
    const totalProfitRetail = totalRevenueRetail - totalBatchCost;

    return {
      recipe,
      itemizedDetails,
      rawIngredientCostPerKg,
      finishedChocolateCostPerKg,
      chocolateCostPerBar,
      cogsPerBar,
      barsFromBatch,
      rawBatchCost,
      laborCost,
      totalBatchCost,
      actualTotalCostPerBar,
      wholesalePrice,
      retailPrice,
      totalRevenueWholesale,
      totalProfitWholesale,
      totalRevenueRetail,
      totalProfitRetail
    };
  };

  const costing = computeRecipeCosting();

  // Calculate Panning Costing with 10% moisture loss, roasting, electricity, misc costs, margins
  const computePanningCosting = () => {
    // 1. Core nut weight and raw nut weight with 10% moisture loss
    const nutWeightNeeded = panningBatchSize * (panningNutRatio / 100); // kg roasted nuts needed
    const rawNutWeightNeeded = nutWeightNeeded / 0.9; // kg raw nuts needed to get the roasted weight (10% moisture loss)
    
    // Costs
    const rawNutCostForBatch = rawNutWeightNeeded * panningRawNutCost;
    const roastingCostForBatch = rawNutWeightNeeded * panningRoastingCost;
    const totalNutCostForBatch = rawNutCostForBatch + roastingCostForBatch;
    
    // Effective roasted nut cost per kg
    const effectiveRoastedNutCostPerKg = (panningRawNutCost + panningRoastingCost) / 0.9;

    // 2. Chocolate shell
    const chocWeightNeeded = panningBatchSize * (1 - panningNutRatio / 100);
    const chocCostForBatch = chocWeightNeeded * panningChocCost;

    // 3. Labor, electricity, misc
    const laborCostForBatch = panningLaborHours * panningLaborRate;
    const electricityCostForBatch = panningElectricityCost;
    const miscCostForBatch = panningMiscCost;

    // 4. Total Production Cost
    const totalProductionCost = totalNutCostForBatch + chocCostForBatch + laborCostForBatch + electricityCostForBatch + miscCostForBatch;
    const costPerKg = totalProductionCost / panningBatchSize;

    // 5. Margin and Selling Cost
    // Selling Price per kg = Cost per kg / (1 - Margin/100)
    const sellingPricePerKg = panningMargin < 100 ? costPerKg / (1 - panningMargin / 100) : costPerKg;
    const totalSellingPrice = sellingPricePerKg * panningBatchSize;
    const grossProfit = totalSellingPrice - totalProductionCost;

    return {
      nutWeightNeeded,
      rawNutWeightNeeded,
      rawNutCostForBatch,
      roastingCostForBatch,
      totalNutCostForBatch,
      effectiveRoastedNutCostPerKg,
      chocWeightNeeded,
      chocCostForBatch,
      laborCostForBatch,
      electricityCostForBatch,
      miscCostForBatch,
      totalProductionCost,
      costPerKg,
      sellingPricePerKg,
      totalSellingPrice,
      grossProfit
    };
  };

  const panningCosting = computePanningCosting();

  // Compute Smart Facility Power & Electricity Breakdown
  const computeSmartElectricity = () => {
    const tariffObj = ELECTRICITY_TARIFF_PRESETS.find(p => p.id === selectedTariffId) || ELECTRICITY_TARIFF_PRESETS[0];
    const tariffRate = selectedTariffId === "custom" ? customTariffRate : tariffObj.ratePerKwh;

    // Room HVAC Draw (1 Ton AC ~ 1.1 kW real-world power draw)
    const acPowerDrawKw = facilityAcTonnage * 1.1;
    const dehumPowerDrawKw = facilityHasDehumidifier ? facilityDehumidifierKw : 0;
    const totalRoomHvacKw = acPowerDrawKw + dehumPowerDrawKw;

    // Facility machine allocation: each active panning machine absorbs its equal share of room climate control
    const machinesCount = Math.max(1, facilityMachineCount);
    const allocatedHvacPerMachineKw = totalRoomHvacKw / machinesCount;

    // Total effective electric load per batch machine
    const effectivePowerPerBatchKw = panningDrumPowerKw + allocatedHvacPerMachineKw;

    // Total energy consumption for the panning run (kWh / units)
    const batchEnergyKwh = effectivePowerPerBatchKw * panningLaborHours;

    // Total cost in current currency
    const calculatedBatchPowerCost = batchEnergyKwh * tariffRate;
    const powerCostPerHour = panningLaborHours > 0 ? calculatedBatchPowerCost / panningLaborHours : 0;
    const powerCostPerKg = panningBatchSize > 0 ? calculatedBatchPowerCost / panningBatchSize : 0;

    // Total facility simultaneous load (all machines + HVAC)
    const totalFacilityConnectedLoadKw = (panningDrumPowerKw * machinesCount) + totalRoomHvacKw;

    return {
      tariffObj,
      tariffRate,
      acPowerDrawKw,
      dehumPowerDrawKw,
      totalRoomHvacKw,
      machinesCount,
      allocatedHvacPerMachineKw,
      effectivePowerPerBatchKw,
      batchEnergyKwh,
      calculatedBatchPowerCost,
      powerCostPerHour,
      powerCostPerKg,
      totalFacilityConnectedLoadKw
    };
  };

  const smartPower = computeSmartElectricity();

  // Keep panning electricity cost in sync when auto-sync is enabled
  useEffect(() => {
    if (autoSyncElectricity) {
      setPanningElectricityCost(Number(smartPower.calculatedBatchPowerCost.toFixed(2)));
    }
  }, [
    autoSyncElectricity,
    smartPower.calculatedBatchPowerCost
  ]);

  // Save Costing Run
  const handleSaveCostingRun = async () => {
    if (!costing) return;
    const user = auth.currentUser;
    const uid = user ? user.uid : "offline-user";
    const runId = `run-${Date.now()}`;

    const newRun: CostingRun = {
      id: runId,
      recipeId: costing.recipe.id,
      recipeName: costing.recipe.name,
      batchSizeKg: batchSizeKg,
      hourlyLaborRate: hourlyLaborRate,
      laborHoursNeeded: laborHours,
      overheadFixed: overheadFixed,
      wholesaleMarkup: wholesaleMarkup,
      retailMarkup: retailMarkup,
      totalCost: costing.totalBatchCost,
      costPerBar: costing.actualTotalCostPerBar,
      wholesalePrice: costing.wholesalePrice,
      retailPrice: costing.retailPrice,
      totalRevenue: costing.totalRevenueRetail,
      totalProfit: costing.totalProfitRetail,
      userId: uid,
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        await setDoc(doc(db, "costingRuns", runId), newRun);
        alert("Batch costing configuration saved to history database!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `costingRuns/${runId}`);
      }
    } else {
      setCostingRuns(prev => [newRun, ...prev]);
      alert("Costing batch saved locally!");
    }
  };

  // AI Multi-Domain Advisor Logic
  const handleAskAIAdvisor = async (customQuery?: string) => {
    const textToAsk = customQuery || aiQuery;
    if (!textToAsk.trim() || aiLoading) return;

    const currentChat = advisorDomain === "chocolate_costing" 
      ? chocolateChat 
      : advisorDomain === "panning_costing" 
      ? panningChat 
      : recipeChat;

    const setTargetChat = advisorDomain === "chocolate_costing"
      ? setChocolateChat
      : advisorDomain === "panning_costing"
      ? setPanningChat
      : setRecipeChat;

    setTargetChat(prev => [...prev, { role: "user", text: textToAsk }]);
    setAiQuery("");
    setAiLoading(true);

    try {
      let promptMessage = "";

      if (advisorDomain === "chocolate_costing") {
        const recipeStats = costing ? `
Active Chocolate Bar Recipe: ${costing.recipe.name}
- Cocoa Percentage: ${costing.recipe.cocoaPercentage}%
- Bar Size: ${costing.recipe.barWeightGrams}g
- Process loss shrinkage: ${costing.recipe.lossFactor}%
- Packaging cost/bar: ${currencySymbol}${costing.recipe.packagingCostPerUnit.toFixed(2)}
- Raw Ingredient Blend Cost per kg: ${currencySymbol}${costing.rawIngredientCostPerKg.toFixed(2)}
- Finished Chocolate Cost per kg: ${currencySymbol}${costing.finishedChocolateCostPerKg.toFixed(2)}
- Combined Raw Ingredients COGS per bar: ${currencySymbol}${costing.cogsPerBar.toFixed(2)}

Active Batch Formulation Config:
- Batch Size: ${batchSizeKg} kg
- Target yield: ${costing.barsFromBatch} bars
- Direct Labor cost: ${currencySymbol}${costing.laborCost.toFixed(2)} (${laborHours} hrs at ${currencySymbol}${hourlyLaborRate}/hr)
- Allocated fixed overheads: ${currencySymbol}${overheadFixed.toFixed(2)}
- Actual combined total cost per bar: ${currencySymbol}${costing.actualTotalCostPerBar.toFixed(2)}
- Requested Markups: Wholesale ${wholesaleMarkup}%, Retail ${retailMarkup}%
- Targeted prices: Wholesale ${currencySymbol}${costing.wholesalePrice.toFixed(2)}, Retail MSRP ${currencySymbol}${costing.retailPrice.toFixed(2)}
- Total batch profit (Retail standard): ${currencySymbol}${costing.totalProfitRetail.toFixed(2)}
` : "No active bean-to-bar recipe loaded.";

        promptMessage = `ACT AS AN EXPERT BEAN-TO-BAR CHOCOLATE FINANCIAL & BUSINESS STRATEGIST. Provide precise, actionable financial and operational guidance in currency ${currency} (${currencySymbol}) for this artisan chocolate bar manufacturing scenario:\n${recipeStats}\n\nClient Question: ${textToAsk}`;
      } else if (advisorDomain === "panning_costing") {
        const panningStats = `
Active Panning & Dragée Batch Configuration:
- Finished Dragée Batch Size: ${panningBatchSize} kg
- Formulation Ratio: ${panningNutRatio}% Roasted Nuts / ${100 - panningNutRatio}% Chocolate Coating
- Raw Nuts Cost: ${currencySymbol}${panningRawNutCost}/kg (10% Moisture roasting loss) -> Effective Roasted Cost: ${currencySymbol}${panningCosting.effectiveRoastedNutCostPerKg.toFixed(2)}/kg
- Custom Roasting Cost: ${currencySymbol}${panningRoastingCost}/kg raw nuts
- Chocolate Coating Cost: ${currencySymbol}${panningChocCost}/kg
- Labor Runtime: ${panningLaborHours} hrs at ${currencySymbol}${panningLaborRate}/hr (= ${currencySymbol}${panningCosting.laborCostForBatch.toFixed(2)})
- Electricity Utility Cost: ${currencySymbol}${panningCosting.electricityCostForBatch.toFixed(2)} [Tariff: ${smartPower.tariffObj.name} @ ${currencySymbol}${smartPower.tariffRate}/kWh, Setup: ${facilityMachineCount} Machines + ${facilityAcTonnage}T AC, Effective Draw: ${smartPower.effectivePowerPerBatchKw.toFixed(2)} kW]
- Miscellaneous Overhead: ${currencySymbol}${panningCosting.miscCostForBatch.toFixed(2)}
- Total Production Cost: ${currencySymbol}${panningCosting.totalProductionCost.toFixed(2)} (${currencySymbol}${panningCosting.costPerKg.toFixed(2)}/kg finished)
- Target Gross Margin: ${panningMargin}%
- Recommended Selling Price: ${currencySymbol}${panningCosting.totalSellingPrice.toFixed(2)} (${currencySymbol}${panningCosting.sellingPricePerKg.toFixed(2)}/kg)
- Expected Batch Gross Profit: ${currencySymbol}${panningCosting.grossProfit.toFixed(2)}
`;

        promptMessage = `ACT AS AN EXPERT CONFECTIONERY PANNING & DRAGÉE BUSINESS ADVISOR. Analyze this chocolate panning / enrobed nut manufacturing and costing setup in currency ${currency} (${currencySymbol}):\n${panningStats}\n\nClient Question: ${textToAsk}`;
      } else {
        // Recipe Formulator Domain
        const currentRecipeDetails = costing ? `
Current Active Formula: ${costing.recipe.name} (${costing.recipe.cocoaPercentage}% Cocoa)
- Target Bar Size: ${costing.recipe.barWeightGrams}g
- Yield Loss / Shrinkage: ${costing.recipe.lossFactor}%
- Formula Ingredients:
${costing.recipe.ingredients.map(i => `  • ${i.name} (${i.category}): ${i.ratio}% @ ${currencySymbol}${i.costPerKg}/kg`).join("\n")}
- Formula Raw Blend Cost: ${currencySymbol}${costing.rawIngredientCostPerKg.toFixed(2)}/kg
- Finished Chocolate Base Cost: ${currencySymbol}${costing.finishedChocolateCostPerKg.toFixed(2)}/kg

All Available Sourcing Materials in Inventory:
${ingredients.map(ing => `  • ${ing.name} (${ing.category}): ${currencySymbol}${ing.costPerKg.toFixed(2)}/${ing.category === "packaging" ? "unit" : "kg"}`).join("\n")}
` : "No active recipe loaded.";

        promptMessage = `ACT AS A MASTER CHOCOLATE R&D CHEF AND FORMULATION SCIENTIST. Analyze recipe ratios, fat/cocoa solids balance, sugar sweetness curves, mouthfeel, rheology/viscosity, and cost optimization in ${currency} (${currencySymbol}):\n${currentRecipeDetails}\n\nFormulation Question: ${textToAsk}`;
      }

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: promptMessage,
          history: currentChat.map(c => ({
            role: c.role === "assistant" ? "assistant" : "user",
            content: c.text
          }))
        }),
      });

      if (!res.ok) throw new Error("Advisor service returned status error");
      const data = await res.json();

      setTargetChat(prev => [...prev, { role: "assistant", text: data.text }]);
    } catch (error) {
      console.error("AI advisor communication failure:", error);
      setTargetChat(prev => [...prev, { role: "assistant", text: "Error: My connection to the academy's business database is unstable. Please check your network and try consulting again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const domainAdvisorPrompts: Record<AdvisorDomain, { title: string; subtitle: string; prompts: string[] }> = {
    chocolate_costing: {
      title: "🍫 Chocolate Bar Costing & Margins",
      subtitle: "Bean-to-bar shrinkage, labor allocation, packaging, wholesale vs retail margins",
      prompts: [
        "How can I reduce winnowing and roasting shrinkage from 20% down to standard levels?",
        "Suggest pricing adjustments to achieve a 60% gross profit margin on my 70g craft bars.",
        "Compare the viability of high-volume wholesale versus boutique direct-to-consumer (DTC) pricing.",
        "My labor cost is too high for 10kg micro-batches. How should I scale batch sizes to optimize overheads?"
      ]
    },
    panning_costing: {
      title: "🥜 Panning & Dragée Economics",
      subtitle: "Nut roasting shrinkage, chocolate coating ratio, machine HVAC load, dragée margins",
      prompts: [
        "How does changing the nut-to-chocolate ratio from 40:60 to 50:50 impact my cost per kg?",
        "How do I optimize utility power costs when scaling from 2 to 4 panning drums?",
        "What is the ideal retail pricing per 100g pouch of chocolate-coated roasted almonds?",
        "How can I minimize chocolate runoff or drum wall residue waste during panning?"
      ]
    },
    recipe_formulator: {
      title: "🥣 Recipe Formulator & R&D Science",
      subtitle: "Cocoa percentages, cocoa butter fat balance, sugar sweetness curves, viscosity & texture",
      prompts: [
        "How much cocoa butter should I add to a 72% dark chocolate for smooth fluid tempering?",
        "How can I substitute refined sugar with organic coconut sugar without destroying melt-in-mouth mouthfeel?",
        "What is the ideal cocoa solids to milk fat ratio for a premium 55% dark milk bar?",
        "How can I balance recipe cost by blending fine-flavor Criollo with high-yield Forastero beans?"
      ]
    }
  };

  const activeChatList = advisorDomain === "chocolate_costing"
    ? chocolateChat
    : advisorDomain === "panning_costing"
    ? panningChat
    : recipeChat;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatList, aiLoading, advisorDomain]);

  return (
    <div className="space-y-8" id="smart-costing-module">
      
      {/* Sub tabs selector */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 pb-2 sm:pb-0 gap-4" id="costing-tabs-header">
        <div className="flex flex-wrap gap-4 md:gap-6">
          <button
            onClick={() => setActiveTab("pricing")}
            className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pricing"
                ? "border-amber-950 text-amber-950"
                : "border-transparent text-gray-400 hover:text-gray-650"
            }`}
          >
            📊 Batch Costing & Pricing
          </button>
          <button
            onClick={() => setActiveTab("recipes")}
            className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "recipes"
                ? "border-amber-950 text-amber-950"
                : "border-transparent text-gray-400 hover:text-gray-650"
            }`}
          >
            🥣 Recipe Formulator
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "border-amber-950 text-amber-950"
                : "border-transparent text-gray-400 hover:text-gray-650"
            }`}
          >
            📦 Ingredient Price Inventory
          </button>
          <button
            onClick={() => setActiveTab("advisor")}
            className={`pb-3 px-1 md:px-2 font-bold text-xs md:text-sm tracking-wide transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "advisor"
                ? "border-amber-950 text-amber-950"
                : "border-transparent text-gray-400 hover:text-gray-650"
            }`}
          >
            💡 Smart Advisor (AI)
          </button>
        </div>

        {/* Currency selection & Defaults Reset */}
        <div className="flex items-center gap-3 mb-2 sm:mb-0" id="currency-selector-box">
          <button
            onClick={handleResetToRupeeDefaults}
            className="flex items-center gap-1.5 bg-amber-950 text-white hover:bg-amber-900 active:bg-amber-950 transition-all text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
            title="Reset active and saved cloud recipes & ingredients to Indian Rupee (₹) benchmarks"
          >
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            <span>Set Rupee Defaults</span>
          </button>

          <div className="flex items-center gap-2 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-100/40">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Currency:</span>
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "INR" | "USD" | "EUR" | "GBP" | "JPY")}
              className="bg-white border border-amber-200/60 rounded-lg px-2 py-0.5 text-xs font-semibold text-amber-950 focus:outline-none focus:border-amber-950 cursor-pointer"
            >
              <option value="INR">🇮🇳 INR ({CURRENCY_SYMBOLS.INR})</option>
              <option value="USD">🇺🇸 USD ({CURRENCY_SYMBOLS.USD})</option>
              <option value="EUR">🇪🇺 EUR ({CURRENCY_SYMBOLS.EUR})</option>
              <option value="GBP">🇬🇧 GBP ({CURRENCY_SYMBOLS.GBP})</option>
              <option value="JPY">🇯🇵 JPY ({CURRENCY_SYMBOLS.JPY})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. BATCH COSTING & PRICING TAB */}
      {activeTab === "pricing" && costing && (
        <div className="space-y-6" id="costing-pricing-container">
          
          {/* Sub Tab Selector for Bean-to-Bar vs Panning Costing */}
          <div className="flex bg-amber-50/50 p-1 rounded-2xl border border-amber-100/40 max-w-lg mb-2">
            <button
              onClick={() => setPricingSubTab("beantobar")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                pricingSubTab === "beantobar"
                  ? "bg-amber-950 text-amber-50 shadow-sm"
                  : "text-gray-500 hover:text-amber-950"
              }`}
            >
              🍫 Bean-to-Bar Chocolate Costing
            </button>
            <button
              onClick={() => setPricingSubTab("panning")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                pricingSubTab === "panning"
                  ? "bg-amber-950 text-amber-50 shadow-sm"
                  : "text-gray-500 hover:text-amber-950"
              }`}
            >
              🥜 Coated Nuts Panning Costing
            </button>
          </div>

          {pricingSubTab === "beantobar" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="pricing-grid">
            
            {/* Inputs Panel */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="pricing-inputs-box">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-800" /> Batch Sizing & Overheads
                </h4>
                <p className="text-[11px] text-gray-400">Calibrate direct labor hours, wages, and fixed utilities to calculate batch margins.</p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Recipe Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700" htmlFor="run-recipe-select">Active Formula Recipe</label>
                  <select
                    id="run-recipe-select"
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-amber-950"
                  >
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.cocoaPercentage}% Cocoa)</option>
                    ))}
                  </select>
                </div>

                {/* Batch Size (kg) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                    <label htmlFor="run-batch-size">Batch Chocolate Size</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        id="run-batch-size-number"
                        min="0.1"
                        max="5000"
                        step="0.5"
                        value={batchSizeKg}
                        onChange={(e) => setBatchSizeKg(Math.max(0.1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                      />
                      <span className="font-mono text-xs font-bold text-gray-500">kg</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="run-batch-size"
                    min="1"
                    max="500"
                    step="1"
                    value={batchSizeKg > 500 ? 500 : batchSizeKg}
                    onChange={(e) => setBatchSizeKg(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Hourly Labor Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                    <label htmlFor="run-labor-rate">Direct Wage Rate ({currencySymbol}/hr)</label>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs font-bold text-gray-500">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step={currency === "INR" ? "10" : "1"}
                        value={hourlyLaborRate}
                        onChange={(e) => setHourlyLaborRate(Math.max(0, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                      />
                      <span className="font-mono text-xs font-bold text-gray-500">/hr</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="run-labor-rate"
                    min={currency === "INR" ? "50" : "5"}
                    max={currency === "INR" ? "1500" : "100"}
                    step={currency === "INR" ? "10" : "1"}
                    value={hourlyLaborRate}
                    onChange={(e) => setHourlyLaborRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Labor Hours Needed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                    <label htmlFor="run-labor-hours">Total Processing Labor (Hours)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={laborHours}
                        onChange={(e) => setLaborHours(Math.max(0.1, Number(e.target.value)))}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                      />
                      <span className="font-mono text-xs font-bold text-gray-500">hrs</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    id="run-labor-hours"
                    min="1"
                    max="48"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Overhead allocation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700 items-center">
                    <label htmlFor="run-overhead">Fixed Overhead Allocation ({currencySymbol})</label>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs font-bold text-gray-500">{currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        step={currency === "INR" ? "100" : "10"}
                        value={overheadFixed}
                        onChange={(e) => setOverheadFixed(Math.max(0, Number(e.target.value)))}
                        className="w-24 px-2 py-1 text-right text-xs font-mono font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded focus:outline-none focus:border-amber-950"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    id="run-overhead"
                    min="0"
                    max={currency === "INR" ? "25000" : "1000"}
                    step={currency === "INR" ? "100" : "10"}
                    value={overheadFixed}
                    onChange={(e) => setOverheadFixed(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-950"
                  />
                </div>

                {/* Markups */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700" htmlFor="run-ws-markup">Wholesale Markup (%)</label>
                    <input
                      type="number"
                      id="run-ws-markup"
                      value={wholesaleMarkup}
                      onChange={(e) => setWholesaleMarkup(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700" htmlFor="run-ret-markup">Retail Markup (%)</label>
                    <input
                      type="number"
                      id="run-ret-markup"
                      value={retailMarkup}
                      onChange={(e) => setRetailMarkup(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveCostingRun}
                  className="w-full py-2.5 bg-amber-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Costing Configuration
                </button>
              </div>
            </div>

            {/* Financial Dashboard Center */}
            <div className="lg:col-span-2 space-y-6" id="pricing-results-panel">
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="financial-metrics">
                
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Raw COGS / Bar</span>
                  <p className="text-xl font-black text-gray-950 font-mono">{currencySymbol}{costing.cogsPerBar.toFixed(2)}</p>
                  <span className="text-[9px] text-gray-500 block">Ingredients & Foil Box</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Cost / Bar</span>
                  <p className="text-xl font-black text-amber-950 font-mono">{currencySymbol}{costing.actualTotalCostPerBar.toFixed(2)}</p>
                  <span className="text-[9px] text-emerald-600 block">Includes Wage & Utilities</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Wholesale Price</span>
                  <p className="text-xl font-black text-blue-900 font-mono">{currencySymbol}{costing.wholesalePrice.toFixed(2)}</p>
                  <span className="text-[9px] text-blue-600 block">At {wholesaleMarkup}% target markup</span>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Retail MSRP Price</span>
                  <p className="text-xl font-black text-emerald-950 font-mono">{currencySymbol}{costing.retailPrice.toFixed(2)}</p>
                  <span className="text-[9px] text-emerald-700 block">At {retailMarkup}% retail markup</span>
                </div>
              </div>

              {/* Economic Detailed Analysis */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="batch-breakdowns">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Batch Economics Summary
                  </h4>
                  <span className="text-[11px] font-bold font-mono bg-amber-50 text-amber-950 px-2.5 py-0.5 rounded-full">
                    Estimated Yield: {costing.barsFromBatch} bars ({batchSizeKg} kg finished)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ledger */}
                  <div className="space-y-3" id="ledger-costing">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Cost Ledger Breakdown</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500 font-medium">Ingredients (weighted mixture)</span>
                        <span className="font-mono font-bold text-gray-700">{currencySymbol}{costing.rawBatchCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500 font-medium">Direct Labor Cost</span>
                        <span className="font-mono font-bold text-gray-700">{currencySymbol}{costing.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-1">
                        <span className="text-gray-500 font-medium">Fixed Allocated Overheads</span>
                        <span className="font-mono font-bold text-gray-700">{currencySymbol}{overheadFixed.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-gray-950 pt-1">
                        <span>Total Batch Production Cost</span>
                        <span className="font-mono">{currencySymbol}{costing.totalBatchCost.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/40 text-[11px] leading-relaxed text-amber-950">
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-800 flex-shrink-0 mt-0.5" />
                        <p>
                          <strong>Yield Loss Impact:</strong> The recipe's <strong>{costing.recipe.lossFactor}%</strong> winnowing/moisture loss increases the cost of finished chocolate raw material from <strong>{currencySymbol}{costing.rawIngredientCostPerKg.toFixed(2)}/kg</strong> up to <strong>{currencySymbol}{costing.finishedChocolateCostPerKg.toFixed(2)}/kg</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Margins Bar Visualization (SVG) */}
                  <div className="space-y-4" id="margin-visuals">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block font-sans">Margin Distribution Analysis</span>
                    
                    {/* SVG Graphic represent wholesale and retail share */}
                    <div className="relative pt-2">
                      <div className="text-[10px] font-extrabold text-gray-600 mb-1 flex justify-between">
                        <span>Wholesale Economics</span>
                        <span className="font-mono text-emerald-700">Gross Margin: {((1 - costing.actualTotalCostPerBar / costing.wholesalePrice) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-5 bg-gray-100 rounded-lg overflow-hidden flex">
                        <div className="bg-amber-950 h-full flex items-center justify-center text-[9px] text-amber-100 font-mono font-bold" style={{ width: `${(costing.actualTotalCostPerBar / costing.wholesalePrice) * 100}%` }}>
                          Cost: {((costing.actualTotalCostPerBar / costing.wholesalePrice) * 100).toFixed(0)}%
                        </div>
                        <div className="bg-emerald-600 h-full flex items-center justify-center text-[9px] text-emerald-50 font-mono font-bold" style={{ width: `${(1 - costing.actualTotalCostPerBar / costing.wholesalePrice) * 100}%` }}>
                          Profit: {((1 - costing.actualTotalCostPerBar / costing.wholesalePrice) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="relative pt-2">
                      <div className="text-[10px] font-extrabold text-gray-600 mb-1 flex justify-between">
                        <span>Boutique Retail (MSRP) Economics</span>
                        <span className="font-mono text-emerald-800">Gross Margin: {((1 - costing.actualTotalCostPerBar / costing.retailPrice) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-5 bg-gray-100 rounded-lg overflow-hidden flex">
                        <div className="bg-amber-950 h-full flex items-center justify-center text-[9px] text-amber-100 font-mono font-bold" style={{ width: `${(costing.actualTotalCostPerBar / costing.retailPrice) * 100}%` }}>
                          Cost: {((costing.actualTotalCostPerBar / costing.retailPrice) * 100).toFixed(0)}%
                        </div>
                        <div className="bg-emerald-800 h-full flex items-center justify-center text-[9px] text-emerald-50 font-mono font-bold" style={{ width: `${(1 - costing.actualTotalCostPerBar / costing.retailPrice) * 100}%` }}>
                          Profit: {((1 - costing.actualTotalCostPerBar / costing.retailPrice) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                      <div className="bg-emerald-50/40 p-2 rounded-xl border border-emerald-100/30 text-emerald-950">
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider block text-emerald-800">Wholesale Batch Profit</span>
                        <span className="font-mono font-bold text-sm block">{currencySymbol}{costing.totalProfitWholesale.toFixed(2)}</span>
                      </div>
                      <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/50 text-emerald-950">
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider block text-emerald-900">Retail Batch Profit</span>
                        <span className="font-mono font-bold text-sm block">{currencySymbol}{costing.totalProfitRetail.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Costing Runs Saved History */}
              {costingRuns.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4" id="saved-runs-history">
                  <h4 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider font-mono">Saved Batch Costing Runs</h4>
                  <div className="divide-y divide-gray-50 max-h-40 overflow-y-auto pr-2" id="history-runs-list">
                    {costingRuns.map(run => (
                      <div key={run.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-800">{run.recipeName}</p>
                          <span className="text-[10px] text-gray-400 font-mono">Batch Size: {run.batchSizeKg} kg | Created: {new Date(run.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-amber-950">Cost/Bar: {currencySymbol}{run.costPerBar.toFixed(2)}</p>
                          <span className="text-[9px] text-emerald-700 font-bold block">Profit/Batch: {currencySymbol}{run.totalProfit.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Link to Chocolate Costing Advisor */}
              <div className="bg-gradient-to-r from-amber-900 to-amber-950 rounded-2xl p-4 text-amber-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs">Want an audit on this chocolate bar margin?</h5>
                    <p className="text-[10px] text-amber-200/80">Consult the specialized Chocolate Bar Costing Advisor on winnowing shrinkage and markups.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdvisorDomain("chocolate_costing");
                    setActiveTab("advisor");
                  }}
                  className="bg-amber-100 hover:bg-white text-amber-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  Consult Advisor →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 🥜 GOURMET COATED NUTS PANNING COSTING SIMULATOR */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="panning-pricing-grid">
              {/* Inputs Panel */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6" id="panning-inputs-box">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-950 text-sm flex items-center gap-1.5 font-sans">
                    <Calculator className="w-4 h-4 text-amber-800" /> Panning Formulation & Sizing
                  </h4>
                  <p className="text-[11px] text-gray-400">Specify batch sizing, roasting, labor, utilities, and raw ingredient prices.</p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Batch Sizing Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Select or Enter Target Batch Size</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[2, 5, 10, 30, 50].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setPanningBatchSize(size)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                            panningBatchSize === size
                              ? "bg-amber-950 text-amber-50 border-amber-950 shadow-sm font-bold"
                              : "bg-white text-gray-650 border-gray-200 hover:border-amber-900"
                          }`}
                        >
                          {size}k
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <input
                        type="number"
                        min="0.1"
                        max="10000"
                        step="0.5"
                        value={panningBatchSize}
                        onChange={(e) => setPanningBatchSize(Math.max(0.1, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                        placeholder="Custom kg"
                      />
                      <span className="text-xs text-gray-500 font-bold whitespace-nowrap">kg Batch</span>
                    </div>
                  </div>

                  {/* Raw Nut cost */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Raw Nuts Purchase Cost ({currencySymbol}/kg)</label>
                    <input
                      type="number"
                      value={panningRawNutCost}
                      onChange={(e) => setPanningRawNutCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                    />
                  </div>

                  {/* Roasting cost */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Roasting Processing Cost ({currencySymbol}/kg raw)</label>
                    <input
                      type="number"
                      value={panningRoastingCost}
                      onChange={(e) => setPanningRoastingCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                    />
                  </div>

                  {/* Academic Moisture loss warning */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                    <Info className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Shrinkage Formula:</strong> Includes a strict academic <strong>10% roasting moisture loss</strong>. Effective cost of roasted nuts rises to: <span className="font-bold text-amber-950">{currencySymbol}{panningCosting.effectiveRoastedNutCostPerKg.toFixed(2)} / kg</span>.
                    </div>
                  </div>

                  {/* Chocolate Coating Cost */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Chocolate Coating Base Cost ({currencySymbol}/kg)</label>
                    <input
                      type="number"
                      value={panningChocCost}
                      onChange={(e) => setPanningChocCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                    />
                  </div>

                  {/* Nut Center & Chocolate Ratio Input (Direct Typing & Presets) */}
                  <div className="space-y-2.5 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100/60" id="nut-chocolate-ratio-section">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <label className="text-xs font-extrabold text-amber-950 block font-sans">
                        Nut & Chocolate Formulation Ratio
                      </label>
                      <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-50 px-2 py-0.5 rounded-md inline-block self-start sm:self-auto">
                        {panningNutRatio}% Nut : {(100 - panningNutRatio).toFixed(1).replace(/\.0$/, "")}% Choc
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-tight">
                      Type the exact percentage or weight ratio of roasted nut centers and chocolate coating.
                    </p>

                    {/* Quick Standard Confectionery Ratio Presets */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-amber-900/70 uppercase tracking-wider font-mono block">Quick Standard Ratios:</span>
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { nut: 30, choc: 70, label: "30 : 70" },
                          { nut: 35, choc: 65, label: "35 : 65" },
                          { nut: 40, choc: 60, label: "40 : 60" },
                          { nut: 45, choc: 55, label: "45 : 55" },
                          { nut: 50, choc: 50, label: "50 : 50" },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setPanningNutRatio(preset.nut)}
                            className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer text-center ${
                              panningNutRatio === preset.nut
                                ? "bg-amber-950 text-white border-amber-950 shadow-xs"
                                : "bg-white text-gray-650 border-gray-200 hover:border-amber-900 hover:text-amber-950"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct Write Number Inputs for Nut % and Chocolate % */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <label htmlFor="input-nut-ratio-percent">🥜 Roasted Nut (%)</label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            id="input-nut-ratio-percent"
                            min="5"
                            max="95"
                            step="0.5"
                            value={panningNutRatio}
                            onChange={(e) => {
                              const val = Math.min(95, Math.max(5, Number(e.target.value)));
                              setPanningNutRatio(val);
                            }}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-950 focus:border-amber-950 pr-7"
                            placeholder="e.g. 40"
                          />
                          <span className="absolute right-2.5 text-xs font-bold text-gray-400 font-mono">%</span>
                        </div>
                        <span className="text-[10px] text-amber-900 font-mono block">
                          = {(panningBatchSize * (panningNutRatio / 100)).toFixed(2)} kg in batch
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
                          <label htmlFor="input-choc-ratio-percent">🍫 Chocolate (%)</label>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            id="input-choc-ratio-percent"
                            min="5"
                            max="95"
                            step="0.5"
                            value={Number((100 - panningNutRatio).toFixed(1))}
                            onChange={(e) => {
                              const chocVal = Math.min(95, Math.max(5, Number(e.target.value)));
                              setPanningNutRatio(Number((100 - chocVal).toFixed(1)));
                            }}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-950 focus:border-amber-950 pr-7"
                            placeholder="e.g. 60"
                          />
                          <span className="absolute right-2.5 text-xs font-bold text-gray-400 font-mono">%</span>
                        </div>
                        <span className="text-[10px] text-amber-900 font-mono block">
                          = {(panningBatchSize * ((100 - panningNutRatio) / 100)).toFixed(2)} kg in batch
                        </span>
                      </div>
                    </div>

                    {/* Proportional visual distribution bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden flex shadow-inner border border-amber-200/50">
                        <div
                          className="bg-amber-800 h-full transition-all duration-200 flex items-center justify-center text-[8px] font-mono font-bold text-amber-100"
                          style={{ width: `${panningNutRatio}%` }}
                          title={`Nut Center: ${panningNutRatio}%`}
                        />
                        <div
                          className="bg-amber-950 h-full transition-all duration-200 flex items-center justify-center text-[8px] font-mono font-bold text-amber-200"
                          style={{ width: `${100 - panningNutRatio}%` }}
                          title={`Chocolate Coating: ${100 - panningNutRatio}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-gray-500 font-semibold px-0.5">
                        <span className="text-amber-800">🥜 Nut: {(panningBatchSize * (panningNutRatio / 100)).toFixed(2)} kg ({panningNutRatio}%)</span>
                        <span className="text-amber-950">🍫 Choc: {(panningBatchSize * ((100 - panningNutRatio) / 100)).toFixed(2)} kg ({(100 - panningNutRatio).toFixed(1).replace(/\.0$/, "")}%)</span>
                      </div>
                    </div>

                    {/* Optional Slider for fine-tuning */}
                    <div className="pt-1">
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="1"
                        value={panningNutRatio}
                        onChange={(e) => setPanningNutRatio(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-950"
                        title="Fine-tune ratio"
                      />
                    </div>
                  </div>

                  {/* Direct Labor and Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Labor Wage ({currencySymbol}/hr)</label>
                      <input
                        type="number"
                        value={panningLaborRate}
                        onChange={(e) => setPanningLaborRate(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Labor Hours</label>
                      <input
                        type="number"
                        value={panningLaborHours}
                        onChange={(e) => setPanningLaborHours(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                      />
                    </div>
                  </div>

                  {/* Electricity & Smart Power Estimator */}
                  <div className="space-y-2 bg-amber-50/30 p-3 rounded-2xl border border-amber-200/60" id="electricity-cost-section">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-900" />
                        <label className="text-xs font-bold text-amber-950 block">Batch Electricity Cost</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPowerCalculatorOpen(!powerCalculatorOpen)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                          powerCalculatorOpen 
                            ? "bg-amber-950 text-white border-amber-950 shadow-xs" 
                            : "bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
                        }`}
                      >
                        <Sliders className="w-2.5 h-2.5" />
                        <span>{powerCalculatorOpen ? "Hide Estimator" : "⚡ Smart Tariff & Power Calculator"}</span>
                        {powerCalculatorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs font-bold text-gray-500 font-mono">{currencySymbol}</span>
                        <input
                          type="number"
                          id="panning-electricity-input"
                          min="0"
                          step={currency === "INR" ? "1" : "0.1"}
                          value={panningElectricityCost}
                          onChange={(e) => setPanningElectricityCost(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-white border border-amber-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-amber-950 focus:outline-none focus:border-amber-950"
                          placeholder="Cost for batch"
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono flex flex-col leading-tight">
                        <span>= {currencySymbol}{(panningLaborHours > 0 ? (panningElectricityCost / panningLaborHours) : 0).toFixed(2)}/hr</span>
                        <span>= {currencySymbol}{(panningBatchSize > 0 ? (panningElectricityCost / panningBatchSize) : 0).toFixed(2)}/kg dragées</span>
                      </div>
                    </div>

                    {/* Quick Active Tariff / Facility summary indicator */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-amber-900 bg-white/80 px-2 py-1 rounded-lg border border-amber-100">
                      <span className="truncate">
                        ⚡ Rate: <strong>{smartPower.tariffObj.stateOrRegion}</strong> ({currencySymbol}{smartPower.tariffRate}/kWh)
                      </span>
                      <span className="font-semibold text-amber-950">
                        {facilityMachineCount}M + {facilityAcTonnage}T AC ({smartPower.effectivePowerPerBatchKw.toFixed(2)} kW)
                      </span>
                    </div>

                    {/* Expandable Smart Facility Power & Regional Tariff Calculator */}
                    {powerCalculatorOpen && (
                      <div className="mt-2 pt-2.5 border-t border-amber-200/70 space-y-3">
                        {/* Step 1: Regional Commercial Tariff & Load Category */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-800" />
                              1. Regional Electricity Tariff & Load Slab
                            </label>
                            <span className="text-[10px] font-mono font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded">
                              {currencySymbol}{smartPower.tariffRate.toFixed(2)} / kWh
                            </span>
                          </div>

                          <select
                            value={selectedTariffId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setSelectedTariffId(newId);
                              const tObj = ELECTRICITY_TARIFF_PRESETS.find(p => p.id === newId);
                              if (tObj && newId !== "custom") {
                                setCustomTariffRate(tObj.ratePerKwh);
                              }
                            }}
                            className="w-full bg-white border border-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-sans font-semibold text-gray-800 focus:outline-none focus:border-amber-950"
                          >
                            <optgroup label="Chandigarh (U.T.) Commercial Slabs">
                              <option value="chd_lt_20kw">Chandigarh – Small Workshop (≤ 20 kW Load) @ ₹5.50/kWh</option>
                              <option value="chd_gt_20kw">{"Chandigarh – Medium/Large Supply (> 20 kW Load) @ ₹10.00/kWh"}</option>
                            </optgroup>
                            <optgroup label="Punjab Commercial Slabs">
                              <option value="punjab_lt_20kw">Punjab (PSPCL) – Small Non-Residential (≤ 20 kW) @ ₹6.50/kWh</option>
                              <option value="punjab_gt_20kw">{"Punjab (PSPCL) – Medium Supply (> 20 kW) @ ₹8.20/kWh"}</option>
                            </optgroup>
                            <optgroup label="Other Indian Commercial Tariffs">
                              <option value="delhi_lt_10kw">Delhi (BSES/TPDDL) – Small Unit (≤ 10 kW) @ ₹6.00/kWh</option>
                              <option value="delhi_gt_10kw">{"Delhi (BSES/TPDDL) – Commercial (> 10 kW) @ ₹8.50/kWh"}</option>
                              <option value="mh_commercial">Maharashtra (MSEDCL) – Commercial LT @ ₹11.50/kWh</option>
                              <option value="ka_commercial">Karnataka (BESCOM) – LT-3 Commercial @ ₹8.50/kWh</option>
                              <option value="tn_commercial">Tamil Nadu (TANGEDCO) – Commercial @ ₹9.50/kWh</option>
                              <option value="gj_commercial">Gujarat (UGVCL/DGVCL) – Commercial @ ₹7.50/kWh</option>
                            </optgroup>
                            <optgroup label="International Grid Averages">
                              <option value="us_commercial">USA Commercial Grid Average @ $0.15/kWh</option>
                              <option value="eu_commercial">European Union Commercial Average @ €0.26/kWh</option>
                            </optgroup>
                            <optgroup label="Custom Utility Rate">
                              <option value="custom">Custom Tariff Rate Entry</option>
                            </optgroup>
                          </select>

                          {selectedTariffId === "custom" && (
                            <div className="flex items-center gap-2 pt-1">
                              <label className="text-[10px] font-bold text-gray-600">Enter Tariff ({currencySymbol}/kWh):</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={customTariffRate}
                                onChange={(e) => setCustomTariffRate(Math.max(0, Number(e.target.value)))}
                                className="w-24 bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-amber-950 focus:outline-none"
                              />
                            </div>
                          )}

                          <p className="text-[9.5px] text-amber-900/80 leading-tight">
                            {smartPower.tariffObj.description}
                          </p>
                        </div>

                        {/* Step 2: Workshop / Factory Facility Configuration */}
                        <div className="space-y-2 pt-1 border-t border-amber-200/40">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-amber-800" />
                              2. Facility Scale & Shared HVAC Climate Setup
                            </label>
                          </div>

                          {/* Preset Buttons */}
                          <div className="grid grid-cols-3 gap-1">
                            {FACILITY_PRESETS.filter(p => p.id !== "setup_custom").map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFacilityPresetId(preset.id);
                                  setFacilityMachineCount(preset.machinesCount);
                                  setPanningDrumPowerKw(preset.machinePowerKw);
                                  setFacilityAcTonnage(preset.acTonnage);
                                  setFacilityHasDehumidifier(preset.hasDehumidifier);
                                  setFacilityDehumidifierKw(preset.dehumidifierKw);
                                }}
                                className={`p-1.5 rounded-lg text-[9.5px] font-mono leading-tight border transition-all text-left cursor-pointer ${
                                  selectedFacilityPresetId === preset.id
                                    ? "bg-amber-950 text-white border-amber-950 shadow-xs"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-amber-900"
                                }`}
                              >
                                <div className="font-bold font-sans">{preset.name.split("+")[0]}</div>
                                <div className="text-[8px] opacity-80">{preset.name.split("+")[1]}</div>
                              </button>
                            ))}
                          </div>

                          {/* Detailed Equipment Tuning Grid */}
                          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/70 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <label className="font-bold text-gray-700 block">Active Panning Machines</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={facilityMachineCount}
                                    onChange={(e) => {
                                      setSelectedFacilityPresetId("setup_custom");
                                      setFacilityMachineCount(Math.max(1, Number(e.target.value)));
                                    }}
                                    className="w-14 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 font-mono font-bold text-amber-950 text-center"
                                  />
                                  <span className="text-[9px] text-gray-500">running units</span>
                                </div>
                              </div>

                              <div>
                                <label className="font-bold text-gray-700 block">Drum Motor + Blower</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0.2"
                                    max="10"
                                    value={panningDrumPowerKw}
                                    onChange={(e) => {
                                      setSelectedFacilityPresetId("setup_custom");
                                      setPanningDrumPowerKw(Math.max(0.2, Number(e.target.value)));
                                    }}
                                    className="w-14 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 font-mono font-bold text-amber-950 text-center"
                                  />
                                  <span className="text-[9px] text-gray-500">kW / machine</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-gray-100">
                              <div>
                                <label className="font-bold text-gray-700 block">Room Air Conditioner (AC)</label>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="50"
                                    value={facilityAcTonnage}
                                    onChange={(e) => {
                                      setSelectedFacilityPresetId("setup_custom");
                                      setFacilityAcTonnage(Math.max(0, Number(e.target.value)));
                                    }}
                                    className="w-14 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 font-mono font-bold text-amber-950 text-center"
                                  />
                                  <span className="text-[9px] text-gray-500">Ton ({smartPower.acPowerDrawKw.toFixed(2)} kW)</span>
                                </div>
                              </div>

                              <div>
                                <label className="font-bold text-gray-700 block">Industrial Dehumidifier</label>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <input
                                    type="checkbox"
                                    id="dehum-check"
                                    checked={facilityHasDehumidifier}
                                    onChange={(e) => {
                                      setSelectedFacilityPresetId("setup_custom");
                                      setFacilityHasDehumidifier(e.target.checked);
                                    }}
                                    className="rounded border-gray-300 text-amber-950 focus:ring-amber-950"
                                  />
                                  <label htmlFor="dehum-check" className="text-[9.5px] font-semibold text-gray-700 cursor-pointer">
                                    {facilityHasDehumidifier ? "Enabled (+0.8 kW)" : "None"}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Step 3: Calculation Breakdown & Mathematical Proof */}
                        <div className="bg-amber-950 text-amber-50 p-3 rounded-xl space-y-2 font-mono text-[10px] shadow-sm">
                          <div className="flex justify-between items-center text-amber-200 border-b border-amber-800/80 pb-1 font-sans font-bold">
                            <span>⚡ Engineering Load Allocation Formula:</span>
                            <span className="text-[9px] font-mono text-amber-300">
                              Total Room Load: {smartPower.totalFacilityConnectedLoadKw.toFixed(2)} kW
                            </span>
                          </div>

                          <div className="space-y-1 text-[9.5px] leading-snug">
                            <div className="flex justify-between">
                              <span className="text-amber-300">1. Direct Panning Machine Motor:</span>
                              <span>{panningDrumPowerKw.toFixed(2)} kW</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-300">
                                2. Shared HVAC ({facilityAcTonnage}T AC {facilityHasDehumidifier ? "+ Dehum" : ""}) ÷ {facilityMachineCount} machines:
                              </span>
                              <span>+{smartPower.allocatedHvacPerMachineKw.toFixed(2)} kW / batch</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-amber-800/60 pt-0.5 text-amber-100">
                              <span>Effective Power per Active Batch:</span>
                              <span>= {smartPower.effectivePowerPerBatchKw.toFixed(2)} kW</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-300">Energy Consumed ({panningLaborHours} hrs runtime):</span>
                              <span>= {smartPower.batchEnergyKwh.toFixed(2)} kWh (Units)</span>
                            </div>
                            <div className="flex justify-between font-bold text-amber-300 text-xs border-t border-amber-800 pt-1">
                              <span>Calculated Batch Power Cost:</span>
                              <span>{currencySymbol}{smartPower.calculatedBatchPowerCost.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Quick Comparison between ≤20kW and >20kW slabs for Chandigarh/Punjab */}
                          {selectedTariffId.startsWith("chd_") && (
                            <div className="bg-amber-900/50 p-2 rounded-lg text-[9px] text-amber-200 leading-tight">
                              💡 <strong>Chandigarh Slab Comparison:</strong>
                              <div className="mt-0.5">
                                • At Small Workshop rate (≤ 20kW @ ₹5.50): <strong>₹{(smartPower.batchEnergyKwh * 5.5).toFixed(2)}</strong>
                              </div>
                              <div>
                                • At Commercial rate (&gt; 20kW @ ₹10.00): <strong>₹{(smartPower.batchEnergyKwh * 10.0).toFixed(2)}</strong> (+₹{((smartPower.batchEnergyKwh * 10.0) - (smartPower.batchEnergyKwh * 5.5)).toFixed(2)}/batch)
                              </div>
                            </div>
                          )}

                          {/* Apply to Batch Cost Button */}
                          <div className="pt-1 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPanningElectricityCost(Number(smartPower.calculatedBatchPowerCost.toFixed(2)));
                              }}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-amber-950 py-1.5 px-3 rounded-lg font-sans font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Apply {currencySymbol}{smartPower.calculatedBatchPowerCost.toFixed(2)} to Batch
                            </button>
                            <label className="flex items-center gap-1 text-[9px] font-sans text-amber-200 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={autoSyncElectricity}
                                onChange={(e) => setAutoSyncElectricity(e.target.checked)}
                                className="rounded border-amber-700 text-amber-500 focus:ring-0"
                              />
                              Auto-sync
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Miscellaneous Cost */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Miscellaneous Cost ({currencySymbol})</label>
                    <input
                      type="number"
                      value={panningMiscCost}
                      onChange={(e) => setPanningMiscCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                    />
                  </div>

                  {/* Target Margin */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Target Gross Margin (%)</label>
                    <input
                      type="number"
                      value={panningMargin}
                      onChange={(e) => setPanningMargin(Math.max(0, Math.min(99, Number(e.target.value))))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-950 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Dashboard Center */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Roasted Nut Cost</span>
                    <p className="text-xl font-black text-gray-950 font-mono">{currencySymbol}{panningCosting.effectiveRoastedNutCostPerKg.toFixed(2)}<span className="text-[11px] font-normal text-gray-400">/kg</span></p>
                    <span className="text-[9px] text-gray-500 block">Moisture loss adjusted</span>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Raw Nut Weight</span>
                    <p className="text-xl font-black text-gray-950 font-mono">{panningCosting.rawNutWeightNeeded.toFixed(2)} kg</p>
                    <span className="text-[9px] text-amber-800 block font-bold">For {panningCosting.nutWeightNeeded.toFixed(2)} kg roasted</span>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Production Cost</span>
                    <p className="text-xl font-black text-amber-950 font-mono">{currencySymbol}{panningCosting.totalProductionCost.toFixed(2)}</p>
                    <span className="text-[9px] text-emerald-600 block">Nuts + Roasting + Labor + Power</span>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cost of Selling</span>
                    <p className="text-xl font-black text-emerald-950 font-mono">{currencySymbol}{panningCosting.totalSellingPrice.toFixed(2)}</p>
                    <span className="text-[9px] text-emerald-700 block">Whole batch at {panningMargin}% margin</span>
                  </div>
                </div>

                {/* Economics Detailed analysis */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-1.5 font-sans">
                      <TrendingUp className="w-4 h-4 text-emerald-600" /> Panning Business Economics
                    </h4>
                    <span className="text-[11px] font-bold font-mono bg-amber-50 text-amber-950 px-2.5 py-0.5 rounded-full">
                      Total Output: {panningBatchSize} kg finished
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ledger */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block font-sans">Cost Ledger Breakdown</span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Raw Nuts Cost ({panningCosting.rawNutWeightNeeded.toFixed(2)} kg)</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.rawNutCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Roasting Cost ({panningCosting.rawNutWeightNeeded.toFixed(2)} kg raw)</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.roastingCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1 font-semibold text-amber-900 bg-amber-50/20 px-1.5 py-0.5 rounded">
                          <span className="font-medium">Roasted Nuts subtotal</span>
                          <span className="font-mono">{currencySymbol}{panningCosting.totalNutCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Chocolate Coating ({panningCosting.chocWeightNeeded.toFixed(2)} kg at {currencySymbol}{panningChocCost}/kg)</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.chocCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Direct Processing Labor ({panningLaborHours} hrs)</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.laborCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Electricity Processing Cost</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.electricityCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Miscellaneous Expenses</span>
                          <span className="font-mono font-bold text-gray-700">{currencySymbol}{panningCosting.miscCostForBatch.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-gray-950 pt-2 border-t border-gray-100">
                          <span>Total Production Cost</span>
                          <span className="font-mono text-amber-950">{currencySymbol}{panningCosting.totalProductionCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Margins & Economics Selling */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block font-sans">Margin &amp; Pricing Analysis</span>
                      
                      {/* Visual Progress bar for Cost vs Profit */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-extrabold text-gray-600 flex justify-between">
                          <span>Margin Distribution</span>
                          <span className="font-mono text-emerald-800 font-bold">Gross Margin: {panningMargin}%</span>
                        </div>
                        <div className="w-full h-5 bg-gray-100 rounded-lg overflow-hidden flex text-[9px] font-mono font-bold text-center">
                          <div className="bg-amber-950 text-amber-100 h-full flex items-center justify-center font-bold" style={{ width: `${100 - panningMargin}%` }}>
                            Cost: {100 - panningMargin}%
                          </div>
                          <div className="bg-emerald-600 text-emerald-50 h-full flex items-center justify-center font-bold" style={{ width: `${panningMargin}%` }}>
                            Profit: {panningMargin}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs pt-1">
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium">Production Cost / kg</span>
                          <span className="font-mono font-bold text-gray-800">{currencySymbol}{panningCosting.costPerKg.toFixed(2)} / kg</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1">
                          <span className="text-gray-500 font-medium text-emerald-950">Suggested Selling Price / kg</span>
                          <span className="font-mono font-bold text-emerald-800">{currencySymbol}{panningCosting.sellingPricePerKg.toFixed(2)} / kg</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-1 font-bold text-sm text-gray-950 pt-1">
                          <span>Selling Cost (Total batch value)</span>
                          <span className="font-mono text-emerald-700">{currencySymbol}{panningCosting.totalSellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-150 text-emerald-950 space-y-1">
                          <span className="text-[9px] font-bold font-mono uppercase tracking-wider block text-emerald-800">Estimated Batch Profit</span>
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-black text-lg text-emerald-900">{currencySymbol}{panningCosting.grossProfit.toFixed(2)}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                              {((panningCosting.totalSellingPrice / panningCosting.totalProductionCost - 1) * 100).toFixed(0)}% Markup
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Link to Panning & Dragée Advisor */}
                <div className="bg-gradient-to-r from-emerald-950 to-amber-950 rounded-2xl p-4 text-emerald-50 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">Need guidance on nut ratios, electricity load, or retail packaging?</h5>
                      <p className="text-[10px] text-emerald-200/80">Consult the specialized Panning & Dragée Business Advisor on power tariffs, roasting shrinkage, and bulk margins.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAdvisorDomain("panning_costing");
                      setActiveTab("advisor");
                    }}
                    className="bg-emerald-100 hover:bg-white text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  >
                    Consult Panning Advisor →
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. RECIPE BUILDER TAB */}
      {activeTab === "recipes" && (
        <div className="space-y-6" id="recipes-tab-container">
          <div className="bg-gradient-to-r from-amber-900 to-amber-950 rounded-2xl p-4 text-amber-50 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h5 className="font-bold text-xs">Formulating a complex chocolate blend?</h5>
                <p className="text-[10px] text-amber-200/80">Ask the Recipe Formulator Advisor about total fat %, sugar balances, viscosity rheology, and substitute ingredients.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAdvisorDomain("recipe_formulator");
                setActiveTab("advisor");
              }}
              className="bg-amber-100 hover:bg-white text-amber-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              Consult Recipe Advisor →
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="recipes-tab-grid">
          
          {/* Creator form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5" id="recipe-creator-box">
            <div className="space-y-1">
              <h4 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-800" /> Professional Recipe Formulator
              </h4>
              <p className="text-[11px] text-gray-400">Design custom chocolate blends. Ingredients must total exactly 100%.</p>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" htmlFor="recipe-name-input">Recipe Title</label>
                <input
                  type="text"
                  id="recipe-name-input"
                  placeholder="e.g. 72% Malabar Dark with Sea Salt"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700" htmlFor="recipe-weight-input">Target Bar (g)</label>
                  <input
                    type="number"
                    id="recipe-weight-input"
                    value={recipeBarWeight}
                    onChange={(e) => setRecipeBarWeight(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700" htmlFor="recipe-loss-input">Yield Loss/Shrink (%)</label>
                  <input
                    type="number"
                    id="recipe-loss-input"
                    value={recipeLossFactor}
                    onChange={(e) => setRecipeLossFactor(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" htmlFor="recipe-packaging-input">Packaging cost per single bar ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.05"
                  id="recipe-packaging-input"
                  value={recipePkgCost}
                  onChange={(e) => setRecipePkgCost(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                />
              </div>

              <div className="bg-amber-50/30 p-3 rounded-2xl border border-amber-100/40 space-y-3">
                <span className="text-[10px] font-bold font-mono text-amber-950 uppercase block">Add Ingredient to Blend</span>
                <div className="space-y-2">
                  <select
                    value={currentIngSelection}
                    onChange={(e) => setCurrentIngSelection(e.target.value)}
                    className="w-full bg-white border border-amber-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">-- Choose Ingredient --</option>
                    {ingredients.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({currencySymbol}{i.costPerKg.toFixed(2)}/kg)</option>
                    ))}
                  </select>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold text-gray-600" htmlFor="recipe-ing-pct-input">Ratio:</label>
                      <input
                        type="number"
                        id="recipe-ing-pct-input"
                        min="1"
                        max="100"
                        value={currentIngRatio}
                        onChange={(e) => setCurrentIngRatio(Number(e.target.value))}
                        className="w-16 bg-white border border-amber-100 rounded-lg px-2 py-1 text-xs text-center"
                      />
                      <span className="text-xs font-bold text-gray-500">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddIngToRecipe}
                      className="px-3 py-1.5 bg-amber-950 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-amber-900 transition-all cursor-pointer"
                    >
                      Add to Blend
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Formula Recipe
              </button>
            </form>
          </div>

          {/* Current Recipe Formulation list & saved list */}
          <div className="lg:col-span-2 space-y-6" id="recipe-list-panels">
            {/* Blend Ingredients List */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h4 className="font-extrabold text-gray-950 text-sm">Blend Formulation Ratios</h4>
                <span className={`text-xs font-bold font-mono px-3 py-0.5 rounded-full ${
                  recipeIngsList.reduce((acc, c) => acc + c.ratio, 0) === 100 
                    ? "bg-emerald-50 text-emerald-800" 
                    : "bg-red-50 text-red-800"
                }`}>
                  Current Sum: {recipeIngsList.reduce((acc, c) => acc + c.ratio, 0)}% / 100%
                </span>
              </div>

              {recipeFeedback && (
                <div className="bg-amber-50 text-amber-900 border border-amber-100 p-3 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {recipeFeedback}
                </div>
              )}

              {recipeIngsList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">Select ingredients from the panel on the left to design your chocolate recipe.</p>
              ) : (
                <div className="space-y-2.5" id="recipe-ing-table">
                  {recipeIngsList.map(item => (
                    <div key={item.ingredientId} className="flex justify-between items-center text-xs p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-800 block">{item.name}</span>
                        <span className="text-[9px] uppercase font-mono font-bold text-gray-400">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded">{item.ratio}%</span>
                        <button
                          type="button"
                          onClick={() => removeIngFromRecipeList(item.ingredientId)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Recipes Database list */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-gray-950 text-xs uppercase tracking-wider font-mono">Your Saved Formulas ({recipes.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map(rec => (
                  <div key={rec.id} className="border border-gray-100 rounded-2xl p-4 space-y-2 relative hover:border-amber-900/30 transition-all">
                    <span className="absolute top-3 right-3 text-[9px] font-bold font-mono bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full uppercase">
                      {rec.cocoaPercentage}% Cocoa
                    </span>
                    <h5 className="font-bold text-gray-900 text-xs">{rec.name}</h5>
                    <div className="text-[10px] text-gray-500 space-y-1">
                      <p>Bar Sizing: <strong>{rec.barWeightGrams}g</strong> | Packaging: <strong>{currencySymbol}{rec.packagingCostPerUnit.toFixed(2)}</strong></p>
                      <div className="flex flex-wrap gap-1">
                        {rec.ingredients.map(ing => (
                          <span key={ing.ingredientId} className="bg-gray-100 text-[9px] text-gray-600 px-1.5 py-0.5 rounded font-mono">
                            {ing.name.split(" ")[0]} ({ing.ratio}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* 3. INGREDIENT INVENTORY TAB */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="inventory-tab-grid">
          
          {/* Add Ingredient Form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5" id="ing-form-container">
            <div className="space-y-1">
              <h4 className="font-bold text-gray-950 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" /> New Raw Material
              </h4>
              <p className="text-[11px] text-gray-400">Add custom cocoa beans, sugar, inclusions, or specific foil wrappers with their standard price/kg.</p>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" htmlFor="ing-name-input">Material Title</label>
                <input
                  type="text"
                  id="ing-name-input"
                  placeholder="e.g. Criollo Beans (Peru Sourcing)"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" htmlFor="ing-category-select">Sourcing Category</label>
                <select
                  id="ing-category-select"
                  value={newIngCategory}
                  onChange={(e) => setNewIngCategory(e.target.value as Ingredient["category"])}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none focus:border-amber-950"
                >
                  <option value="beans">🌍 Cocoa Beans (Primary)</option>
                  <option value="sugar">🍯 Sugar / Sweeteners</option>
                  <option value="cocoa_butter">🧈 Pure Cocoa Butter</option>
                  <option value="inclusions">🍓 Inclusions (Nuts, Salt, Fruit)</option>
                  <option value="packaging">✉️ Packaging Materials (Box/Foil)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" htmlFor="ing-cost-input">
                  Cost {newIngCategory === "packaging" ? `per Single Wrapper (${currencySymbol})` : `per Kilogram (${currencySymbol}/Kg)`}
                </label>
                <input
                  type="number"
                  step="0.05"
                  id="ing-cost-input"
                  value={newIngCost}
                  onChange={(e) => setNewIngCost(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-950"
                />
              </div>

              {ingActionFeedback && (
                <div className="bg-amber-50 text-amber-900 p-2.5 rounded-xl text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {ingActionFeedback}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-900 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Save to Inventory
              </button>
            </form>
          </div>

          {/* Sourcing inventory display */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4" id="inventory-list-container">
            <h4 className="font-extrabold text-gray-950 text-sm flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <Package className="w-4 h-4 text-amber-800" /> Active Sourcing Cost Database
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="inv-cards-grid">
              {ingredients.map(ing => (
                <div key={ing.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex justify-between items-center hover:border-amber-900/10 transition-all">
                  <div>
                    <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-100">
                      {ing.category === "beans" ? "Beans" : ing.category === "sugar" ? "Sugar" : ing.category === "cocoa_butter" ? "Butter" : ing.category === "inclusions" ? "Inclusion" : "Packaging"}
                    </span>
                    <p className="font-bold text-gray-900 text-xs mt-1.5">{ing.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono font-black text-amber-950 text-xs">
                      {currencySymbol}{ing.costPerKg.toFixed(2)}<span className="text-[9px] text-gray-400 font-sans">{ing.category === "packaging" ? "/unit" : "/kg"}</span>
                    </p>
                    <button
                      onClick={() => handleDeleteIngredient(ing.id)}
                      className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Sourcing Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. SMART BUSINESS ADVISOR TAB - SEPARATE SPECIALTY DOMAINS */}
      {activeTab === "advisor" && (
        <div className="space-y-6" id="ai-advisor-container">
          
          {/* Domain Segmented Control */}
          <div className="bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/80 flex flex-col md:flex-row gap-1.5 shadow-xs">
            <button
              onClick={() => setAdvisorDomain("chocolate_costing")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                advisorDomain === "chocolate_costing"
                  ? "bg-amber-950 text-white shadow-sm ring-1 ring-amber-900"
                  : "bg-white/70 text-gray-700 hover:bg-white hover:text-amber-950"
              }`}
            >
              <span className="text-base">🍫</span>
              <div className="text-left">
                <div className="font-bold font-sans">Chocolate Costing Advisor</div>
                <div className="text-[9.5px] opacity-75 font-normal">Bars, Winnowing, COGS & Margins</div>
              </div>
            </button>

            <button
              onClick={() => setAdvisorDomain("panning_costing")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                advisorDomain === "panning_costing"
                  ? "bg-amber-950 text-white shadow-sm ring-1 ring-amber-900"
                  : "bg-white/70 text-gray-700 hover:bg-white hover:text-amber-950"
              }`}
            >
              <span className="text-base">🥜</span>
              <div className="text-left">
                <div className="font-bold font-sans">Panning & Dragée Advisor</div>
                <div className="text-[9.5px] opacity-75 font-normal">Nut Shrinkage, Drums, HVAC & Tariffs</div>
              </div>
            </button>

            <button
              onClick={() => setAdvisorDomain("recipe_formulator")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                advisorDomain === "recipe_formulator"
                  ? "bg-amber-950 text-white shadow-sm ring-1 ring-amber-900"
                  : "bg-white/70 text-gray-700 hover:bg-white hover:text-amber-950"
              }`}
            >
              <span className="text-base">🥣</span>
              <div className="text-left">
                <div className="font-bold font-sans">Recipe Formulator Advisor</div>
                <div className="text-[9.5px] opacity-75 font-normal">Fat balance, Viscosity & Blend Science</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="ai-advisor-grid">
            
            {/* Prompts Suggestions sidebar */}
            <div className="lg:col-span-1 bg-amber-50/50 border border-amber-100/50 rounded-3xl p-5 space-y-4 h-max" id="advisor-suggestions">
              <div>
                <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  {advisorDomain === "chocolate_costing" 
                    ? "Chocolate Financial Prompts"
                    : advisorDomain === "panning_costing"
                    ? "Panning Economics Prompts"
                    : "Formulation Science Prompts"}
                </h4>
                <p className="text-[10px] text-amber-900/80 mt-1 leading-snug">
                  Click any verified query below to consult with your specialized domain advisor:
                </p>
              </div>

              <div className="space-y-2" id="advisor-prompt-list">
                {domainAdvisorPrompts[advisorDomain].prompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleAskAIAdvisor(prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-amber-100 hover:border-amber-950 text-[11px] text-amber-950 leading-snug cursor-pointer font-medium hover:bg-amber-50 transition-all duration-150 shadow-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Context Summary Tag */}
              <div className="bg-white/90 p-3 rounded-2xl border border-amber-200/60 text-[10px] space-y-1.5 font-mono text-amber-950">
                <span className="font-bold font-sans text-amber-900 block text-[10.5px] border-b border-amber-100 pb-1">
                  📡 Live Context Fed to AI:
                </span>
                {advisorDomain === "chocolate_costing" && (
                  <>
                    <div>• Recipe: <strong>{costing?.recipe.name || "Default 70%"}</strong></div>
                    <div>• Batch: <strong>{batchSizeKg} kg ({costing?.barsFromBatch} bars)</strong></div>
                    <div>• COGS/bar: <strong>{currencySymbol}{costing?.actualTotalCostPerBar.toFixed(2)}</strong></div>
                    <div>• Wholesale Margin: <strong>{((1 - (costing?.actualTotalCostPerBar || 1) / (costing?.wholesalePrice || 1)) * 100).toFixed(0)}%</strong></div>
                  </>
                )}
                {advisorDomain === "panning_costing" && (
                  <>
                    <div>• Batch Size: <strong>{panningBatchSize} kg Dragées</strong></div>
                    <div>• Ratio: <strong>{panningNutRatio}% Nuts / {100 - panningNutRatio}% Choc</strong></div>
                    <div>• Tariff: <strong>{smartPower.tariffObj.stateOrRegion} ({currencySymbol}{smartPower.tariffRate}/kWh)</strong></div>
                    <div>• Power Draw: <strong>{smartPower.effectivePowerPerBatchKw.toFixed(2)} kW</strong></div>
                    <div>• Cost/kg: <strong>{currencySymbol}{panningCosting.costPerKg.toFixed(2)}</strong></div>
                  </>
                )}
                {advisorDomain === "recipe_formulator" && (
                  <>
                    <div>• Formula: <strong>{costing?.recipe.name || "Custom Blend"}</strong></div>
                    <div>• Cocoa %: <strong>{costing?.recipe.cocoaPercentage}%</strong></div>
                    <div>• Ingredients: <strong>{costing?.recipe.ingredients.length} materials</strong></div>
                    <div>• Raw Blend: <strong>{currencySymbol}{costing?.rawIngredientCostPerKg.toFixed(2)}/kg</strong></div>
                  </>
                )}
              </div>
            </div>

            {/* Advisor Chat box */}
            <div className="lg:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col h-[580px]" id="advisor-chat-interface">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-800 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-sm">
                      {domainAdvisorPrompts[advisorDomain].title}
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      {domainAdvisorPrompts[advisorDomain].subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                    {advisorDomain === "chocolate_costing" ? "🍫 Bar Costing Engine" : advisorDomain === "panning_costing" ? "🥜 Panning Engine" : "🥣 R&D Formulation Engine"}
                  </span>
                </div>
              </div>

              {/* Chats messages box */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs" id="chat-scroller">
                {activeChatList.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div className={`p-3 rounded-2xl leading-relaxed font-sans ${
                      msg.role === "user" 
                        ? "bg-amber-950 text-amber-50" 
                        : "bg-gray-50 text-gray-800 border border-gray-100"
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px] bg-gray-50 p-2.5 rounded-xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-900" /> Domain Consultant is auditing variables...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input box */}
              <div className="border-t border-gray-100 pt-4 flex gap-2">
                <input
                  type="text"
                  placeholder={
                    advisorDomain === "chocolate_costing"
                      ? "Ask about shrinkage loss, wholesale vs retail markups, labor scaling..."
                      : advisorDomain === "panning_costing"
                      ? "Ask about nut-to-choc ratios, HVAC electricity, roasting shrinkage..."
                      : "Ask about cocoa butter balance, sugar substitute mouthfeel, viscosity tuning..."
                  }
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAIAdvisor()}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-950"
                />
                <button
                  onClick={() => handleAskAIAdvisor()}
                  disabled={aiLoading}
                  className="p-2.5 bg-amber-950 text-amber-100 rounded-xl hover:bg-amber-900 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
