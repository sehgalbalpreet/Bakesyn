import React, { useState, useEffect } from "react";
import SourcingModule from "./components/SourcingModule";
import BeanToBarModule from "./components/BeanToBarModule";
import TemperingSimulator from "./components/TemperingSimulator";
import BatchCalculator from "./components/BatchCalculator";
import PanningModule from "./components/PanningModule";
import TroubleshootingModule from "./components/TroubleshootingModule";
import AssessmentModule from "./components/AssessmentModule";
import AiTutorModule from "./components/AiTutorModule";
import AuthPortal from "./components/AuthPortal";
import AdminPortal from "./components/AdminPortal";
import SmartCostingModule from "./components/SmartCostingModule";
import RecipeBookModule from "./components/RecipeBookModule";
import Logo from "./components/Logo";
import { downloadAcademicGuidebook } from "./utils/guidebookGenerator";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { ModuleId } from "./types";
import {
  BookOpen,
  Coffee,
  RotateCw,
  Flame,
  Calculator,
  Layers,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Award,
  LogOut,
  User as UserIcon,
  Shield,
  Coins,
  ArrowRight,
} from "lucide-react";

interface CourseModule {
  id: ModuleId;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  category: "Theory & Sourcing" | "Interactive Labs" | "Techniques & Math" | "Administrative Operations";
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<ModuleId>("sourcing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    sourcing: true,
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time snapshot listener on the student's Firestore document
        const docRef = doc(db, "students", currentUser.uid);
        unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setStudentData(docSnap.data());
          } else {
            setStudentData(null);
          }
          setAuthLoading(false);
        }, (err) => {
          console.error("Error loading student status:", err);
          setAuthLoading(false);
        });
      } else {
        setStudentData(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const baseModules: CourseModule[] = [
    {
      id: "sourcing",
      title: "1. Cocoa Origins & Sourcing",
      shortDesc: "Fermentation, Terroir, and Bean Genetics.",
      icon: <Coffee className="w-4 h-4" />,
      category: "Theory & Sourcing",
    },
    {
      id: "beanToBar",
      title: "2. The Bean-to-Bar Process",
      shortDesc: "From sorting, roasting, winnowing to conching.",
      icon: <RotateCw className="w-4 h-4" />,
      category: "Theory & Sourcing",
    },
    {
      id: "tempering",
      title: "3. Interactive Tempering Lab",
      shortDesc: "Polymorphism & Stable Form V Chemistry.",
      icon: <Flame className="w-4 h-4" />,
      category: "Interactive Labs",
    },
    {
      id: "calculator",
      title: "4. Formulation Calculator",
      shortDesc: "Stone-melanger ratios & panning weights.",
      icon: <Calculator className="w-4 h-4" />,
      category: "Techniques & Math",
    },
    {
      id: "panning",
      title: "5. Coated Nuts Panning",
      shortDesc: "Gum barriers, progressive builds & shellac polish.",
      icon: <Layers className="w-4 h-4" />,
      category: "Theory & Sourcing",
    },
    {
      id: "troubleshooting",
      title: "6. Troubleshooting Defects",
      shortDesc: "Bloom, moisture seizures & clumping guides.",
      icon: <AlertTriangle className="w-4 h-4" />,
      category: "Techniques & Math",
    },
    {
      id: "quiz",
      title: "7. Academy Knowledge Exam",
      shortDesc: "Test your chemistry & techniques knowledge.",
      icon: <HelpCircle className="w-4 h-4" />,
      category: "Interactive Labs",
    },
    {
      id: "tutor",
      title: "8. AI Chocolatier Tutor",
      shortDesc: "Real-time custom consulting & recipe ideas.",
      icon: <Sparkles className="w-4 h-4" />,
      category: "Interactive Labs",
    },
    {
      id: "costing",
      title: "9. Smart Costing & Margins",
      shortDesc: "Formulations, ingredient shrinkage, and margin advisors.",
      icon: <Coins className="w-4 h-4 text-amber-850" />,
      category: "Techniques & Math",
    },
    {
      id: "recipebook",
      title: "10. Confectionery Recipe Lab",
      shortDesc: "Filling shelf-life calculator & food safety science.",
      icon: <BookOpen className="w-4 h-4 text-amber-850" />,
      category: "Interactive Labs",
    },
  ];

  const modules = [...baseModules];
  if (user?.email === "sehgalbalpreet@gmail.com") {
    modules.push({
      id: "admin",
      title: "🛠️ Admin: Student Registry",
      shortDesc: "Revoke sharing credentials, block access, and monitor logs.",
      icon: <Shield className="w-4 h-4 text-rose-500 animate-pulse" />,
      category: "Administrative Operations",
    });
  }

  const handleModuleSelect = (id: ModuleId) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
    setCompletedModules((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const getModuleCategoryColor = (category: string) => {
    switch (category) {
      case "Theory & Sourcing":
        return "bg-amber-50 text-amber-800 border-amber-100/40";
      case "Interactive Labs":
        return "bg-cyan-50 text-cyan-800 border-cyan-100/40";
      case "Techniques & Math":
        return "bg-emerald-50 text-emerald-800 border-emerald-100/40";
      case "Administrative Operations":
        return "bg-red-50 text-red-800 border-red-100/40";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-950/5 flex flex-col items-center justify-center p-6 font-sans" id="auth-loading-screen">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-950/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-950 border-t-transparent animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 font-mono uppercase tracking-widest">Chocolatier Academy</h3>
            <p className="text-xs text-gray-500 font-medium">Securing academic workspace connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal onAuthSuccess={() => {}} />;
  }

  // Admin bypass
  const isAdminUser = user?.email === "sehgalbalpreet@gmail.com";

  // Student Approval Check
  const isApproved = studentData?.approved === true || isAdminUser;

  if (user && !isApproved) {
    return (
      <div className="min-h-screen bg-amber-950/10 flex items-center justify-center p-4 md:p-8 font-sans" id="pending-approval-screen">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-amber-100/50 overflow-hidden shadow-amber-950/5" id="pending-card">
          <div className="bg-amber-950 text-amber-50 px-6 py-8 text-center relative" id="pending-header">
            <div className="absolute top-4 right-4 bg-amber-900/40 text-amber-200 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-800/30">
              Awaiting Approval
            </div>
            <div className="bg-amber-900 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-100">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-black font-sans tracking-tight">Pending Admission</h2>
            <p className="text-xs text-amber-200/80 mt-1 font-sans">
              Chocolatier Academy Masterclass Portal
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-gray-950">Enrollment Review in Progress</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Hello, <strong className="text-gray-900">{studentData?.fullName || user.displayName || user.email?.split("@")[0]}</strong>.
                Your academic profile has been registered successfully. To access the classes, simulator labs, and recipe cost calculators, your account must be authorized.
              </p>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 text-left space-y-1 text-xs">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[9px] font-mono block">Why is this required?</span>
              <p className="text-gray-700 font-medium font-sans">
                This is a private academic space. Professor Balpreet Sehgal verifies and approves each enrolled student manually to maintain premium content integrity.
              </p>
            </div>

            <div className="text-[11px] text-gray-500 font-sans space-y-1">
              <p>For immediate activation or enrollment inquiries, please reach out directly:</p>
              <p className="font-mono text-gray-950 font-bold bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100 inline-block">
                sehgalbalpreet@gmail.com
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSignOut}
                className="w-full py-3 bg-gray-950 hover:bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all"
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Honor Code / Credential Sharing Blockade
  if (studentData?.suspended) {
    return (
      <div className="min-h-screen bg-red-950/10 flex items-center justify-center p-4 md:p-8 font-sans" id="suspended-access-screen">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-red-100/50 overflow-hidden" id="suspended-card">
          <div className="bg-red-900 text-red-50 px-6 py-8 text-center relative" id="suspended-header">
            <div className="absolute top-4 right-4 bg-red-950/40 text-red-200 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-800/30">
              Access Restricted
            </div>
            <div className="bg-red-950 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-red-100">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-black font-display tracking-tight">Access Suspended</h2>
            <p className="text-xs text-red-200/80 mt-1 font-sans">
              Academy Credential Protection Protocol
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-gray-950">Credential Sharing Infraction</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Hello, <strong className="text-gray-900">{studentData.fullName || user.displayName || user.email?.split("@")[0]}</strong>.
                Your enrollment access has been temporarily restricted due to security flags (such as potential link sharing or concurrent connections).
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-left space-y-1 text-xs">
              <span className="font-bold text-red-900 uppercase tracking-wider text-[9px] font-mono block">Classroom Protection Policy</span>
              <p className="text-gray-700 font-medium font-sans">
                To prevent student materials and projects from being leaked or distributed to external parties, sharing access keys or links is strictly forbidden under the honor code.
              </p>
            </div>

            <p className="text-xs text-gray-500 font-sans">
              To appeal or request a credential reset, please contact Professor Balpreet Sehgal directly at <strong className="text-gray-950 font-mono">sehgalbalpreet@gmail.com</strong>.
            </p>

            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-gray-950 hover:bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all"
            >
              Sign Out of Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalCompleted = Object.keys(completedModules).length;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans text-gray-800" id="masterclass-app-root">
      {/* Top Premium Sticky Header Banner */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4 md:flex-nowrap">
          <div className="flex items-center gap-4">
            <Logo iconSize={44} textColorClass="text-amber-950" variant="horizontal" />
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold font-mono px-2 py-0.5 rounded-full uppercase">Academy Masterclass</span>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Sourcing, Bean-to-Bar & Confectionery Panning</p>
            </div>
          </div>

          {/* Academic progress bar */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-mono block">Academy Progress</span>
              <span className="text-xs font-bold text-gray-700">{totalCompleted} / {modules.length} Modules Visited</span>
            </div>
            <div className="w-32 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100/60">
              <div
                className="h-full bg-amber-950 transition-all duration-300"
                style={{ width: `${(totalCompleted / modules.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Student authorization badge & Log out */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            <div className="flex items-center gap-2 bg-amber-50/60 border border-amber-100/50 px-3 py-1.5 rounded-xl text-xs">
              <UserIcon className="w-3.5 h-3.5 text-amber-850" />
              <div className="text-left leading-none">
                <span className="text-[8px] text-gray-400 uppercase tracking-widest font-mono block">Student Profile</span>
                <span className="font-bold text-amber-950 font-sans block truncate max-w-[120px]" title={user.displayName || user.email || "Student"}>
                  {user.displayName || user.email?.split("@")[0] || "Student"}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-2.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
              title="Sign Out of Classroom"
              id="student-signout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-amber-950 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main layout container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6" id="academy-body-layout">
        {/* Navigation Sidebar */}
        <aside
          className={`md:w-80 flex-shrink-0 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-6 ${
            mobileMenuOpen ? "fixed inset-0 z-30 pt-24" : "hidden md:block"
          }`}
          id="sidebar-nav-container"
        >
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest font-mono">Curriculum Syllabus</h3>
            <p className="text-[11px] text-gray-500">Work through the interactive theory & simulation labs below:</p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-250px)]" id="curriculum-item-list">
            {modules.map((m) => {
              const isActive = activeModule === m.id;
              const isCompleted = completedModules[m.id];

              return (
                <button
                  key={m.id}
                  id={`syllabus-btn-${m.id}`}
                  onClick={() => handleModuleSelect(m.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                    isActive
                      ? "bg-amber-950 text-amber-50 border-amber-950 shadow-md scale-[1.01]"
                      : "bg-white text-gray-700 border-gray-100 hover:border-amber-200 hover:bg-amber-50/40"
                  }`}
                >
                  {/* Category Pill side bar */}
                  <span className={`absolute top-0 right-0 h-1.5 w-12 rounded-bl-lg ${
                    m.category === "Theory & Sourcing" ? "bg-amber-800/40" : m.category === "Interactive Labs" ? "bg-cyan-500/40" : "bg-emerald-500/40"
                  }`} />

                  <div className={`p-2.5 rounded-xl ${isActive ? "bg-amber-900/50 text-amber-200" : "bg-gray-100/80 text-gray-600"} flex-shrink-0`}>
                    {m.icon}
                  </div>

                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs tracking-tight leading-snug font-sans">{m.title}</span>
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] opacity-80 leading-normal line-clamp-2">{m.shortDesc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Core competency box */}
          <div className="bg-amber-50/40 border border-amber-100/40 p-4 rounded-2xl space-y-2" id="certified-competency-box">
            <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5 font-display">
              <Award className="w-4 h-4 text-amber-800" /> Certificate Readiness
            </h4>
            <p className="text-[10px] text-amber-900 leading-normal font-sans">
              Review theory chapters, practice temperature seeding on the <strong>tempering lab</strong>, compute ingredient batches, and score over 80% on the <strong>Academy exam</strong> to clear curriculum prerequisites.
            </p>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 bg-transparent flex flex-col gap-6" id="academy-main-viewport">
          {/* Active Module Title Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="view-title-banner">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
                  getModuleCategoryColor(modules.find((m) => m.id === activeModule)?.category || "")
                }`}>
                  {modules.find((m) => m.id === activeModule)?.category}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-950 mt-1 font-sans">
                {modules.find((m) => m.id === activeModule)?.title.includes(". ")
                  ? modules.find((m) => m.id === activeModule)?.title.split(". ")[1]
                  : modules.find((m) => m.id === activeModule)?.title}
              </h2>
            </div>
            <p className="text-xs text-gray-400 max-w-sm md:text-right">
              {modules.find((m) => m.id === activeModule)?.shortDesc}
            </p>
          </div>
 
          {/* Loaded Component Router */}
          <div className="min-h-[400px]" id="component-viewport">
            {activeModule === "sourcing" && <SourcingModule />}
            {activeModule === "beanToBar" && <BeanToBarModule />}
            {activeModule === "tempering" && <TemperingSimulator />}
            {activeModule === "calculator" && <BatchCalculator />}
            {activeModule === "panning" && <PanningModule />}
            {activeModule === "troubleshooting" && <TroubleshootingModule />}
            {activeModule === "quiz" && <AssessmentModule />}
            {activeModule === "tutor" && <AiTutorModule />}
            {activeModule === "costing" && <SmartCostingModule />}
            {activeModule === "recipebook" && <RecipeBookModule />}
            {activeModule === "admin" && <AdminPortal />}
          </div>

          {/* Global Study Guidebook & PDF Download Banner - available at bottom of each section */}
          {activeModule !== "admin" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 shadow-xs" id="academic-study-book-bottom-banner">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-950 text-amber-50 rounded-2xl shadow-none flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                    Artisan Chocolatier Study Manual <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">Offline Compendium</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed max-w-2xl font-sans">
                    Download the complete offline companion containing chemical tempering profiles, interactive calculators, standard operating procedures, and dynamic costing sheets optimized for printing or PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadAcademicGuidebook(10, "classic_white", "coated")}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer shadow-xs shrink-0 uppercase tracking-wider font-mono"
              >
                <span>Download Study Book</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modern, unobtrusive elegant page footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white py-4 text-center text-[10px] text-gray-400 font-mono" id="main-footer">
        © 2026 Chocolatier Academy Masterclass. High-Performance Molecular Confectionery and Craft Chocolate Formulation.
      </footer>
    </div>
  );
}
