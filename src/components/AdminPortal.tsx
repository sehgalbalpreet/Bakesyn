import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Mail,
  User,
  AlertCircle,
  Download,
  Lock,
  Database,
  Globe,
  RefreshCw,
  Settings2,
  ExternalLink,
} from "lucide-react";

interface StudentData {
  uid: string;
  email: string;
  fullName: string;
  registeredAt?: string;
  lastLogin?: string;
  suspended?: boolean;
  approved?: boolean;
}

export default function AdminPortal() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [newFullName, setNewFullName] = useState<string>("");
  const [addError, setAddError] = useState<string>("");
  const [addSuccess, setAddSuccess] = useState<string>("");

  // WordPress API Integration States
  const [activeTab, setActiveTab] = useState<"registry" | "wordpress">("registry");
  const [wpUrl, setWpUrl] = useState<string>("https://www.kreativechocolates.com");
  const [wpUsername, setWpUsername] = useState<string>("");
  const [wpAppPassword, setWpAppPassword] = useState<string>("");
  const [syncType, setSyncType] = useState<"users" | "woocommerce">("users");
  const [useSimulation, setUseSimulation] = useState<boolean>(true);

  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string; siteTitle?: string; siteUrl?: string; warning?: string } | null>(null);
  const [syncedWPStudents, setSyncedWPStudents] = useState<any[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<string>("");
  const [syncError, setSyncError] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "wordpress"));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.wpUrl) setWpUrl(data.wpUrl);
          if (data.wpUsername) setWpUsername(data.wpUsername);
          if (data.wpAppPassword) setWpAppPassword(data.wpAppPassword);
          if (data.syncType) setSyncType(data.syncType);
          if (data.useSimulation !== undefined) setUseSimulation(data.useSimulation);
        }
      } catch (err) {
        console.error("Error loading WP settings:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // Realtime listen to students collection
    const studentsRef = collection(db, "students");
    const unsubscribe = onSnapshot(studentsRef, (querySnapshot) => {
      const list: StudentData[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ uid: doc.id, ...doc.data() } as StudentData);
      });
      // Sort: registeredAt desc
      list.sort((a, b) => {
        const dateA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
        const dateB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
        return dateB - dateA;
      });
      setStudents(list);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to students:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSuspension = async (studentId: string, currentSuspension: boolean) => {
    try {
      const studentDocRef = doc(db, "students", studentId);
      await updateDoc(studentDocRef, {
        suspended: !currentSuspension,
      });
    } catch (err) {
      console.error("Error updating suspension state:", err);
    }
  };

  const toggleApproval = async (studentId: string, currentApproval: boolean) => {
    try {
      const studentDocRef = doc(db, "students", studentId);
      await updateDoc(studentDocRef, {
        approved: !currentApproval,
      });
    } catch (err) {
      console.error("Error updating approval state:", err);
    }
  };

  const deleteStudentDoc = async (studentId: string) => {
    if (!window.confirm("Are you absolutely sure you want to remove this student? They will lose access immediately.")) {
      return;
    }
    try {
      const studentDocRef = doc(db, "students", studentId);
      await deleteDoc(studentDocRef);
    } catch (err) {
      console.error("Error deleting student document:", err);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    setSyncError("");
    setSyncSuccess("");
    try {
      // Auto-save settings in Firestore
      await setDoc(doc(db, "settings", "wordpress"), {
        wpUrl,
        wpUsername,
        wpAppPassword,
        syncType,
        useSimulation,
        updatedAt: new Date().toISOString()
      });

      const response = await fetch("/api/wordpress/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wpUrl,
          wpUsername,
          wpAppPassword,
          useSimulation,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to WordPress");
      }
      setTestResult({
        success: data.success,
        message: data.message,
        siteTitle: data.siteTitle,
        siteUrl: data.siteUrl,
        warning: data.warning,
      });
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: err.message || "An unexpected error occurred while testing connection."
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncStudents = async () => {
    setSyncing(true);
    setSyncError("");
    setSyncSuccess("");
    setSyncedWPStudents([]);
    try {
      // Auto-save settings in Firestore
      await setDoc(doc(db, "settings", "wordpress"), {
        wpUrl,
        wpUsername,
        wpAppPassword,
        syncType,
        useSimulation,
        updatedAt: new Date().toISOString()
      });

      const response = await fetch("/api/wordpress/sync-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wpUrl,
          wpUsername,
          wpAppPassword,
          useSimulation,
          syncType,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sync students from WordPress");
      }
      setSyncedWPStudents(data.students || []);
      setSyncSuccess(`Successfully fetched ${data.syncedCount} student profiles from ${data.source}!`);
      if (data.warning) {
        setSyncError(data.warning);
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || "An unexpected error occurred during sync.");
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkImport = async () => {
    if (syncedWPStudents.length === 0) return;
    setImporting(true);
    setSyncError("");
    setSyncSuccess("");
    try {
      let count = 0;
      for (const student of syncedWPStudents) {
        const studentId = `wp-${student.wpUserId}`;
        await setDoc(doc(db, "students", studentId), {
          uid: studentId,
          email: student.email.toLowerCase(),
          fullName: student.fullName,
          registeredAt: new Date().toISOString(),
          lastLogin: "Never (Synced from WordPress)",
          suspended: false,
          approved: true, // Auto-approved!
          courseName: student.courseName || "WordPress Enrolled Student",
          isWordPressSynced: true,
        });
        count++;
      }
      setSyncSuccess(`Successfully imported and pre-authorized ${count} students from your WordPress site! They can now log in using their WordPress emails and get instant class access.`);
      setSyncedWPStudents([]);
    } catch (err: any) {
      console.error(err);
      setSyncError("Failed to import/approve students: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleCreateStudentPlaceholder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    if (!newEmail || !newFullName) {
      setAddError("Please fill out both email and full name.");
      return;
    }

    try {
      // Create a student placeholder document
      const tempId = "invited-" + Math.random().toString(36).substring(2, 9);
      await setDoc(doc(db, "students", tempId), {
        uid: tempId,
        email: newEmail.trim().toLowerCase(),
        fullName: newFullName.trim(),
        registeredAt: new Date().toISOString(),
        lastLogin: "Never (Invited)",
        suspended: false,
        approved: true,
      });
      setAddSuccess(`Successfully invited ${newFullName}!`);
      setNewEmail("");
      setNewFullName("");
      setTimeout(() => setShowAddModal(false), 1500);
    } catch (err: any) {
      setAddError("Failed to add invitation: " + err.message);
    }
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(term) ||
      student.email?.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    const headers = "Name,Email,Registered Date,Last Login,Status\n";
    const rows = students.map((s) => {
      const status = s.suspended ? "Suspended" : "Active";
      return `"${s.fullName || 'N/A'}","${s.email}","${s.registeredAt || 'N/A'}","${s.lastLogin || 'N/A'}","${status}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `chocolatier_student_registry_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="space-y-8" id="admin-registry-module">
      {/* Header Banner */}
      <div className="bg-amber-950 text-amber-50 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden" id="admin-hero">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-amber-50" />
        </div>
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-900/50 text-amber-200 text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full border border-amber-800/40">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Executive Academy Panel
          </div>
          <h3 className="text-2xl font-black font-sans">Student Authentication Registry</h3>
          <p className="text-sm text-amber-200/80 leading-relaxed font-sans">
            Welcome, Administrator. Monitor enrolled students, manage honor-code status, revoke credentials, and prevent link sharing of your exclusive masterclass curriculum.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 mb-6" id="admin-tabs">
        <button
          onClick={() => setActiveTab("registry")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === "registry"
              ? "border-amber-950 text-amber-950 font-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Student Registry
        </button>
        <button
          onClick={() => setActiveTab("wordpress")}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === "wordpress"
              ? "border-amber-950 text-amber-950 font-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <Globe className="w-4 h-4" /> WordPress API Sync
        </button>
      </div>

      {activeTab === "registry" && (
        <>
          {/* Overview Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-stats-widgets">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-950 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Total Students</span>
            <strong className="text-2xl text-gray-950 block">{students.length}</strong>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Approved & Active</span>
            <strong className="text-2xl text-emerald-800 block">
              {students.filter((s) => s.approved && !s.suspended).length}
            </strong>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Pending Approval</span>
            <strong className="text-2xl text-amber-700 block">
              {students.filter((s) => !s.approved && !s.suspended).length}
            </strong>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-800 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Suspended / Flagged</span>
            <strong className="text-2xl text-red-700 block">
              {students.filter((s) => s.suspended).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4" id="admin-controls-card">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Academic Invitation
            </button>
            <button
              onClick={exportCSV}
              title="Download Registry as CSV"
              className="p-2.5 text-gray-500 hover:text-amber-950 bg-gray-50 hover:bg-amber-50 rounded-xl border border-gray-100 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Invited add form modal overlay */}
        {showAddModal && (
          <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-xl space-y-4" id="invitation-form">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> Create Academic Reservation
              </h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError("");
                  setAddSuccess("");
                }}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer font-mono"
              >
                [Cancel]
              </button>
            </div>

            {addError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">{addError}</p>
            )}
            {addSuccess && (
              <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">{addSuccess}</p>
            )}

            <form onSubmit={handleCreateStudentPlaceholder} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Student Full Name"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-100 rounded-lg focus:outline-none"
              />
              <input
                type="email"
                placeholder="student@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-100 rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold py-2.5 rounded-lg transition-all cursor-pointer"
              >
                Issue Access Invitation
              </button>
            </form>
          </div>
        )}

        {/* Student list grid/table */}
        {loading ? (
          <div className="text-center py-12" id="admin-table-loader">
            <div className="w-8 h-8 border-2 border-amber-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 mt-2 font-mono">Synchronizing students with Google Firestore...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl" id="admin-empty-table">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500">No students match your query</p>
            <p className="text-[10px] text-gray-400">Add a student or adjust filters to view matching profiles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100" id="student-registry-table-wrapper">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[9px] font-mono border-b border-gray-100">
                  <th className="p-4">Student Profile</th>
                  <th className="p-4">Contact Email</th>
                  <th className="p-4">Joined & Seen</th>
                  <th className="p-4">Academy Admission</th>
                  <th className="p-4">Sharing Defense Status</th>
                  <th className="p-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  const dateStr = student.registeredAt
                    ? new Date(student.registeredAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unknown";

                  const lastLoginStr = student.lastLogin
                    ? student.lastLogin.includes("Never")
                      ? student.lastLogin
                      : new Date(student.lastLogin).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                    : "Unknown";

                  return (
                    <tr
                      key={student.uid}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        student.suspended ? "bg-red-50/10" : ""
                      }`}
                    >
                      <td className="p-4 font-bold text-gray-900 font-sans">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                            student.suspended ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {student.fullName?.substring(0, 2).toUpperCase() || "ST"}
                          </div>
                          <div>
                            <span className="block">{student.fullName || "Unnamed Student"}</span>
                            <span className="text-[9px] font-mono font-normal text-gray-400">UID: {student.uid}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{student.email}</td>
                      <td className="p-4 text-gray-400 font-mono">
                        <span className="block font-semibold text-gray-700">{dateStr}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-300" /> Seen: {lastLoginStr}
                        </span>
                      </td>
                      <td className="p-4">
                        {student.approved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold font-mono px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-extrabold font-mono px-2 py-0.5 rounded animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {student.suspended ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 border border-red-100 text-red-700 font-extrabold font-mono px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> RESTRICTED / SUSPENDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold font-mono px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> SECURE ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => toggleApproval(student.uid, !!student.approved)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                            student.approved
                              ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                          title={student.approved ? "Revoke classroom access" : "Approve student admission"}
                        >
                          {student.approved ? "Revoke Access" : "Approve Student"}
                        </button>
                        <button
                          onClick={() => toggleSuspension(student.uid, !!student.suspended)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all ${
                            student.suspended
                              ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          }`}
                          title={student.suspended ? "Authorize classroom access" : "Flag and restrict sharing infractions"}
                        >
                          {student.suspended ? "Unflag & Restore" : "Suspend Account"}
                        </button>
                        <button
                          onClick={() => deleteStudentDoc(student.uid)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center"
                          title="Purge reservation record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

      {/* WordPress API Sync Tab Content */}
      {activeTab === "wordpress" && (
        <div className="space-y-6" id="wordpress-api-sync-panel">
          {/* WordPress Connection Configuration Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2.5 bg-amber-50 text-amber-950 rounded-xl">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-950 font-sans">WordPress REST API Credentials</h4>
                <p className="text-[11px] text-gray-500 font-sans">
                  Configure connection keys to securely fetch and synchronize student databases from <strong>www.kreativechocolates.com</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-950 block uppercase tracking-wider text-[10px] font-mono">WordPress Website URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder="https://www.kreativechocolates.com"
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Include the full protocol: https://</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-950 block uppercase tracking-wider text-[10px] font-mono">Authentication Mode</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUseSimulation(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      !useSimulation
                        ? "bg-amber-950 border-amber-950 text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Live REST API
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseSimulation(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border cursor-pointer transition-all ${
                      useSimulation
                        ? "bg-amber-950 border-amber-950 text-white animate-pulse"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Simulator Mode (Test)
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Use Simulator Mode for a quick, functional demonstration without setting up live API keys.</p>
              </div>
            </div>

            {!useSimulation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-950 block uppercase tracking-wider text-[10px] font-mono">WP Administrator Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={wpUsername}
                      onChange={(e) => setWpUsername(e.target.value)}
                      placeholder="e.g. balpreet_admin"
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-950 block uppercase tracking-wider text-[10px] font-mono">WordPress Application Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={wpAppPassword}
                      onChange={(e) => setWpAppPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-950 focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Generate this in WordPress: <strong>Users &rarr; Profile &rarr; Application Passwords</strong> (unspaced 16-character key).
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2 border-t border-gray-50">
              <div className="space-y-1.5">
                <label className="font-extrabold text-gray-950 block uppercase tracking-wider text-[10px] font-mono">Synchronization Target</label>
                <div className="flex gap-4 items-center pt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="syncType"
                      checked={syncType === "users"}
                      onChange={() => setSyncType("users")}
                      className="accent-amber-950"
                    />
                    WP User Registry (Default Users)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="syncType"
                      checked={syncType === "woocommerce"}
                      onChange={() => setSyncType("woocommerce")}
                      className="accent-amber-950"
                    />
                    WooCommerce Customers (Subscribers/Purchasers)
                  </label>
                </div>
              </div>

              <div className="flex items-end justify-end gap-3 pt-3 md:pt-0">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {testingConnection ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  Test WP Connection
                </button>

                <button
                  type="button"
                  onClick={handleSyncStudents}
                  disabled={syncing}
                  className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {syncing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Fetch Students
                </button>
              </div>
            </div>

            {/* Test Connection Result Alert */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  testResult.success
                    ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                    : "bg-red-50/50 border-red-100 text-red-950"
                }`}
                id="connection-test-result"
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-extrabold uppercase tracking-wider text-[10px]">
                    {testResult.success ? "WordPress Server Reachable" : "WordPress Connection Failed"}
                  </p>
                  <p className="font-sans leading-relaxed">{testResult.message}</p>
                  {testResult.siteTitle && (
                    <p className="text-[10px] text-emerald-700 font-mono">
                      Target App: <strong>{testResult.siteTitle}</strong> &mdash; URL: <a href={testResult.siteUrl} target="_blank" rel="noreferrer" className="underline">{testResult.siteUrl}</a>
                    </p>
                  )}
                  {testResult.warning && (
                    <p className="text-[10px] text-amber-700 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {testResult.warning}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Synced Students Results List */}
          {syncedWPStudents.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4" id="synced-results-section">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-50 pb-4">
                <div>
                  <h4 className="text-sm font-black text-gray-950 font-sans">Fetched Enrollees ({syncedWPStudents.length})</h4>
                  <p className="text-[11px] text-gray-500 font-sans">
                    The following students have active profiles on <strong>{wpUrl}</strong>. Preview their academic permissions before bulk pre-authorizing.
                  </p>
                </div>
                <button
                  onClick={handleBulkImport}
                  disabled={importing}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 self-start sm:self-center shadow-md shadow-emerald-600/10"
                >
                  {importing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  Bulk Approve & Import All
                </button>
              </div>

              {syncSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium font-sans">
                  {syncSuccess}
                </div>
              )}

              <div className="overflow-x-auto border border-gray-50 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[9px] font-mono border-b border-gray-100">
                      <th className="p-4">WordPress ID</th>
                      <th className="p-4">Student Profile Name</th>
                      <th className="p-4">Enrollment Email Address</th>
                      <th className="p-4">Associated Course/Role</th>
                      <th className="p-4 text-right">Academic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-sans">
                    {syncedWPStudents.map((student) => {
                      const isPreExisting = students.some(
                        (s) => s.email.toLowerCase() === student.email.toLowerCase()
                      );

                      return (
                        <tr key={student.wpUserId} className="hover:bg-gray-50/50 transition-all">
                          <td className="p-4 font-mono text-[10px] text-gray-400">#{student.wpUserId}</td>
                          <td className="p-4 font-extrabold text-gray-950">{student.fullName}</td>
                          <td className="p-4 font-mono text-gray-500">{student.email}</td>
                          <td className="p-4 text-gray-500">
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50/50 border border-amber-100/30 text-amber-900 font-medium px-2 py-0.5 rounded font-sans">
                              {student.courseName}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {isPreExisting ? (
                              <span className="inline-flex items-center gap-1 text-[9px] bg-gray-100 text-gray-500 font-extrabold font-mono px-2 py-0.5 rounded">
                                ALREADY IN PORTAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold font-mono px-2 py-0.5 rounded animate-pulse">
                                READY TO IMPORT
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {syncSuccess && !syncedWPStudents.length && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 p-5 rounded-2xl text-xs space-y-1">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-800">Operation Successful</p>
              <p className="font-sans leading-relaxed">{syncSuccess}</p>
            </div>
          )}

          {syncError && (
            <div className="bg-amber-50 border border-amber-100 text-amber-950 p-5 rounded-2xl text-xs space-y-1">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">Sync Notice</p>
              <p className="font-sans leading-relaxed">{syncError}</p>
            </div>
          )}

          {/* WordPress API Connection Instruction Guide */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-gray-950 font-sans flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-amber-800" /> Developer Handshake Guide & Setup
            </h4>
            <div className="text-xs text-gray-600 leading-relaxed font-sans space-y-4">
              <p>
                To enable a secure handshake between this standalone Masterclass React app and your central <strong>kreativechocolates.com</strong> WordPress backend, please follow these step-by-step credentials setups:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="bg-amber-950 text-amber-50 w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[10px] mb-2 font-mono">1</span>
                  <strong className="text-gray-900 block font-semibold text-xs">Verify HTTPS is Active</strong>
                  <p className="text-[11px] text-gray-500">
                    Ensure your WordPress site uses an SSL certificate (https://). Application Passwords are automatically rejected by WordPress over insecure http connections.
                  </p>
                </div>
                <div className="space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="bg-amber-950 text-amber-50 w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[10px] mb-2 font-mono">2</span>
                  <strong className="text-gray-900 block font-semibold text-xs">Generate App Password</strong>
                  <p className="text-[11px] text-gray-500">
                    Log in as Administrator on WordPress, navigate to <strong>Users &rarr; Profile</strong>, scroll down to <strong>Application Passwords</strong>, input "Chocolatier Portal", and click "Add New". Copy the 16-character key.
                  </p>
                </div>
                <div className="space-y-1 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="bg-amber-950 text-amber-50 w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[10px] mb-2 font-mono">3</span>
                  <strong className="text-gray-900 block font-semibold text-xs">Activate WooCommerce API (Optional)</strong>
                  <p className="text-[11px] text-gray-500">
                    If syncing WooCommerce customers, make sure REST API is enabled in WooCommerce Settings &rarr; Advanced &rarr; REST API. Generate Consumer Keys with Read-only access permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Best Practices */}
      <div className="bg-amber-50/20 border border-amber-100 p-5 rounded-2xl space-y-3" id="admin-infraction-guidelines">
        <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-widest font-mono flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-800 animate-pulse" /> Anti-Credential Leak Defense Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed font-sans">
          <div className="space-y-1">
            <strong className="text-gray-900 block font-semibold">How suspension works:</strong>
            <p>
              When you suspend a student, Firestore triggers a real-time snapshot listener on their browser. Their session is instantly revoked, forcing open the restricted screen with your email address for appeal inquiries.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-gray-900 block font-semibold">Pre-register Students:</strong>
            <p>
              Use the "Add Academic Invitation" reservation above to white-list or invite students. Once registered under their specified email, any unauthorized signups can be audited and purged immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
