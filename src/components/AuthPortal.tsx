import React, { useState } from "react";
import Logo from "./Logo";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

interface AuthPortalProps {
  onAuthSuccess: () => void;
}

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please specify your student email address.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      let errorMsg = "Unable to process password reset. Please check your network connection.";
      if (err.code === "auth/invalid-email") {
        errorMsg = "Invalid email format.";
      } else if (err.code === "auth/user-not-found") {
        errorMsg = "This student email is not enrolled in our system.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Log in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          // Log/Update login timestamp
          await setDoc(doc(db, "students", userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: email.toLowerCase(),
            fullName: userCredential.user.displayName || email.split("@")[0],
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        }
        onAuthSuccess();
      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: fullName,
          });

          // Check if there is an existing student record with this email that is approved (invited/pre-approved)
          let isPreApproved = false;
          try {
            const q = query(collection(db, "students"), where("email", "==", email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            for (const docSnap of querySnapshot.docs) {
              const data = docSnap.data();
              if (data.approved === true) {
                isPreApproved = true;
              }
              // If it's an invite placeholder, delete it to clean up
              if (docSnap.id.startsWith("invited-")) {
                await deleteDoc(doc(db, "students", docSnap.id));
              }
            }
          } catch (e) {
            console.error("Error looking up pre-approval status:", e);
          }

          // Write registration log to Firestore
          await setDoc(doc(db, "students", userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: email.toLowerCase(),
            fullName: fullName,
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            suspended: false,
            approved: isPreApproved,
          });
        }
        setRegisteredSuccess(true);
        setTimeout(() => {
          onAuthSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let errorMsg = "Authentication failed. Please check your credentials.";
      if (err.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered. Please log in instead.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Invalid email format.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Password is too weak. Make it at least 6 characters.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errorMsg = "Invalid email or password. Please try again.";
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-950/10 flex items-center justify-center p-4 md:p-8 font-sans" id="auth-portal-container">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden" id="auth-card">
        {/* Decorative Top Accent Banner */}
        <div className="bg-amber-950 text-amber-50 px-6 py-8 text-center relative" id="auth-header-accent">
          <div className="absolute top-4 right-4 bg-amber-900/40 text-amber-200 text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-800/30">
            Secure Academy Portal
          </div>
          <div className="flex justify-center mb-4">
            <Logo iconSize={72} textColorClass="text-amber-50" variant="vertical" />
          </div>
          <p className="text-xs text-amber-200/80 mt-1 font-sans">
            Please log in or register to access student curriculum modules
          </p>
        </div>

        {/* Auth Forms */}
        <div className="p-6 md:p-8 space-y-6">
          {registeredSuccess ? (
            <div className="text-center py-8 space-y-4 animate-fade-in" id="success-registration-screen">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">Registration Complete!</h3>
                <p className="text-xs text-gray-500 mt-1">Unlocking syllabus dashboard. Welcome to the Masterclass.</p>
              </div>
            </div>
          ) : isForgotPassword ? (
            <div className="space-y-6 animate-fade-in" id="forgot-password-screen">
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider font-mono flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                      setError("");
                    }}
                    className="p-1 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-950 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  Reset Password
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your registered student email address. We will verify your ID and trigger a safe password recovery link to your inbox.
                </p>
              </div>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-950 space-y-2 text-center" id="reset-success-alert">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-bold block uppercase tracking-wider text-[9px] text-emerald-900 font-mono">Link Dispatched</span>
                    <p className="leading-relaxed font-sans font-semibold">
                      An email password-reset link has been dispatched to:
                    </p>
                    <p className="font-mono text-xs font-bold text-emerald-950 break-all bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                      {email}
                    </p>
                    <p className="text-[10px] text-gray-500 font-sans mt-2">
                      Please check your spam or junk folder if it does not arrive within a few minutes.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4" id="reset-form">
                  {error && (
                    <div className="bg-red-50 border border-red-100 p-3.5 rounded-2xl text-xs text-red-950 flex items-start gap-2.5" id="reset-error-alert">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-[9px] text-red-900 font-mono">Reset Failed</span>
                        <p className="mt-0.5 leading-relaxed font-sans font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5" id="reset-email-input-group">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Student Email</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="name@academy.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-950 rounded-full animate-spin" />
                    ) : (
                      "Issue Reset Instructions"
                    )}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSent(false);
                  setError("");
                }}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-100 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100" id="auth-tab-selector">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    isLogin
                      ? "bg-amber-950 text-amber-50 shadow-sm"
                      : "text-gray-500 hover:text-amber-950"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className={`flex-1 text-center py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    !isLogin
                      ? "bg-amber-950 text-amber-50 shadow-sm"
                      : "text-gray-500 hover:text-amber-950"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Alert Box */}
              {error && (
                <div className="bg-red-50 border border-red-100 p-3.5 rounded-2xl text-xs text-red-950 flex items-start gap-2.5" id="auth-error-alert">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[9px] text-red-900 font-mono">Authentication Alert</span>
                    <p className="mt-0.5 leading-relaxed font-sans font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAuth} className="space-y-4" id="auth-form-fields">
                {!isLogin && (
                  <div className="space-y-1.5" id="fullname-input-group">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Full Name</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Jean-Pierre"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5" id="email-input-group">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Student Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      placeholder="name@academy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5" id="password-input-group">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError("");
                        }}
                        className="text-[9px] text-amber-900 hover:text-amber-950 font-extrabold font-mono uppercase tracking-wider hover:underline focus:outline-none"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1.5" id="confirm-password-input-group">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-amber-200 border-t-amber-950 rounded-full animate-spin" />
                  ) : isLogin ? (
                    "Authorize Classroom Access"
                  ) : (
                    "Register Student ID"
                  )}
                </button>
              </form>

              {/* Safety Warning */}
              <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/30 space-y-1" id="security-notice-footer">
                <span className="text-[9px] font-bold text-amber-900 uppercase tracking-wider font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" /> Academic Access Policy
                </span>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Each student must hold an individual registered account to verify their lab participation and grade histories. Sharing credentials violates the Academy honor code.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
