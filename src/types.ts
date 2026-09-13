export type ModuleId =
  | "sourcing"
  | "beanToBar"
  | "tempering"
  | "calculator"
  | "panning"
  | "troubleshooting"
  | "quiz"
  | "tutor"
  | "costing"
  | "recipebook"
  | "admin";

export interface ChocolateCourseModule {
  id: ModuleId;
  title: string;
  shortDesc: string;
  iconName: string; // lucide icon name
  category: "Bean-to-Bar" | "Technique & Chemistry" | "Panning" | "Interactive Labs";
}

export interface CocoaVariety {
  name: string;
  origin: string;
  flavorProfile: string;
  acidity: string;
  bitterness: string;
  rarity: string;
  roastRecommendation: string;
  description: string;
  indianContext?: string;
}

export interface BeanToBarStep {
  title: string;
  duration: string;
  temp?: string;
  target?: string;
  description: string;
  keyAspects: string[];
  scienceNote: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
