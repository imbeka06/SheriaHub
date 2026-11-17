"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../components/AuthScreen";

// Fallback Mock Data (used if user details are missing)
const defaultRoleData = {
  student: { name: "Student User", init: "SU", roleLabel: "Student", context: "Student Portal", greeting: "Good afternoon.", sub: "A little progress today is a stronger argument tomorrow." },
  lecturer: { name: "Lecturer User", init: "LU", roleLabel: "Lecturer", context: "Lecturer Portal", greeting: "Good afternoon.", sub: "Manage your marking queue, delegate tasks, and monitor cohort progress." },
  researcher: { name: "Researcher User", init: "RU", roleLabel: "Researcher", context: "Researcher Portal", greeting: "Good afternoon.", sub: "Review your active projects, literature matrix, and authority watchlist." },
  admin: { name: "System Admin", init: "AD", roleLabel: "Admin", context: "Admin Console", greeting: "System Administrator.", sub: "Institutional compliance, user provisioning, and system health overview." }
};

export default function Home() {
  const { user, loading, logout } = useAuth(); // Added logout
  
  const [activeRole, setActiveRole] = useState<"student" | "lecturer" | "researcher" | "admin">("student");
  const [activePage, setActivePage] = useState("overview");
  const [activeTab, setActiveTab] = useState("tab-planner");

  // Pomodoro State
  const [timer, setTimer] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Sync logged-in user's role with the dashboard view
  useEffect(() => {
    if (user) {
      setActiveRole(user.role.toLowerCase() as "student" | "lecturer" | "researcher" | "admin");
    }
  }, [user]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      showToast("Focus session complete! Take a break.");
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2600);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const switchRole = (role: "student" | "lecturer" | "researcher" | "admin") => {
    setActiveRole(role);
    setActivePage("overview");
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", color: "var(--slate)" }}>Loading SheriaHub...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Generate dynamic user data
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const currentRole = {
    ...defaultRoleData[activeRole],
    name: user.name,
    init: getInitials(user.name),
    greeting: `Good afternoon, ${user.name.split(" ")[0]}.`
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${activePage !== "" ? "" : ""}`}>
        <div className="brand">
          <div className="brand-mark">§</div>
          <div>
            <div className="brand-name">SheriaHub</div>
            <small>Law school, organised.</small>
          </div>
        </div>

        <div className="nav-groups">
          {/* ... (Keep all the nav groups exactly as they are in your current code) ... */}
          {/* STUDENT NAV */}
          {activeRole === "student" && (
            <>
              <div className="nav-group">
                <p className="nav-label">Workspace</p>
                <nav className="nav">
                  <button className={activePage === "overview" ? "active" : ""} onClick={() => setActivePage("overview")}><span className="ico">⌂</span>Overview</button>
                  <button className={activePage === "student-profile" ? "active" : ""} onClick={() => setActivePage("student-profile")}><span className="ico">◔</span>Student Profile</button>
                  <button className={activePage === "learning-studio" ? "active" : ""} onClick={() => setActivePage("learning-studio")}><span className="ico">▦</span>Learning Studio</button>
                  <button className={activePage === "workspace" ? "active" : ""} onClick={() => setActivePage("workspace")}><span className="ico">▣</span>Research Desk</button>
                  <button className={activePage === "library" ? "active" : ""} onClick={() => setActivePage("library")}><span className="ico">▤</span>Legal Library</button>
                  <button className={activePage === "visual-cases" ? "active" : ""} onClick={() => setActivePage("visual-cases")}><span className="ico">⌘</span>Visual Case Maps</button>
                  <button className={activePage === "assistant" ? "active" : ""} onClick={() => setActivePage("assistant")}><span className="ico">◉</span>AI Companion</button>
                </nav>
              </div>
              <div className="nav-group">
                <p className="nav-label">Tools</p>
                <nav className="nav">
                  <button className={activePage === "projects" ? "active" : ""} onClick={() => setActivePage("projects")}><span className="ico">◇</span>Research Projects</button>
                  <button className={activePage === "writing" ? "active" : ""} onClick={() => setActivePage("writing")}><span className="ico">✎</span>Writing Studio</button>
                  <button className={activePage === "advocacy" ? "active" : ""} onClick={() => setActivePage("advocacy")}><span className="ico">⚖</span>Advocacy Lab</button>
                  <button className={activePage === "circles" ? "active" : ""} onClick={() => setActivePage("circles")}><span className="ico">♧</span>Academic Circles</button>
                  <button className={activePage === "updates" ? "active" : ""} onClick={() => setActivePage("updates")}><span className="ico">◷</span>Legal Updates</button>
                  <button className={activePage === "portfolio" ? "active" : ""} onClick={() => setActivePage("portfolio")}><span className="ico">▥</span>My Portfolio</button>
                </nav>
              </div>
            </>
          )}

          {/* LECTURER NAV */}
          {activeRole === "lecturer" && (
            <>
              <div className="nav-group">
                <p className="nav-label">Faculty</p>
                <nav className="nav">
                  <button className={activePage === "overview" ? "active" : ""} onClick={() => setActivePage("overview")}><span className="ico">⌂</span>Overview</button>
                  <button className={activePage === "lecturer-profile" ? "active" : ""} onClick={() => setActivePage("lecturer-profile")}><span className="ico">◔</span>Lecturer Profile</button>
                  <button className={activePage === "lecturer" ? "active" : ""} onClick={() => setActivePage("lecturer")}><span className="ico">▦</span>Lecturer Workspace</button>
                  <button className={activePage === "researcher" ? "active" : ""} onClick={() => setActivePage("researcher")}><span className="ico">✦</span>Researcher Workspace</button>
                </nav>
              </div>
              <div className="nav-group">
                <p className="nav-label">Resources</p>
                <nav className="nav">
                  <button className={activePage === "library" ? "active" : ""} onClick={() => setActivePage("library")}><span className="ico">▤</span>Legal Library</button>
                  <button className={activePage === "circles" ? "active" : ""} onClick={() => setActivePage("circles")}><span className="ico">♧</span>Academic Circles</button>
                </nav>
              </div>
            </>
          )}

          {/* RESEARCHER NAV */}
          {activeRole === "researcher" && (
            <>
              <div className="nav-group">
                <p className="nav-label">Research</p>
                <nav className="nav">
                  <button className={activePage === "overview" ? "active" : ""} onClick={() => setActivePage("overview")}><span className="ico">⌂</span>Overview</button>
                  <button className={activePage === "researcher-profile" ? "active" : ""} onClick={() => setActivePage("researcher-profile")}><span className="ico">◔</span>Researcher Profile</button>
                  <button className={activePage === "learning-studio" ? "active" : ""} onClick={() => setActivePage("learning-studio")}><span className="ico">▦</span>Learning Studio</button>
                  <button className={activePage === "workspace" ? "active" : ""} onClick={() => setActivePage("workspace")}><span className="ico">▣</span>Research Desk</button>
                  <button className={activePage === "library" ? "active" : ""} onClick={() => setActivePage("library")}><span className="ico">▤</span>Legal Library</button>
                  <button className={activePage === "visual-cases" ? "active" : ""} onClick={() => setActivePage("visual-cases")}><span className="ico">⌘</span>Visual Case Maps</button>
                  <button className={activePage === "assistant" ? "active" : ""} onClick={() => setActivePage("assistant")}><span className="ico">◉</span>AI Companion</button>
                </nav>
              </div>
              <div className="nav-group">
                <p className="nav-label">Tools</p>
                <nav className="nav">
                  <button className={activePage === "projects" ? "active" : ""} onClick={() => setActivePage("projects")}><span className="ico">◇</span>Research Projects</button>
                  <button className={activePage === "writing" ? "active" : ""} onClick={() => setActivePage("writing")}><span className="ico">✎</span>Writing Studio</button>
                  <button className={activePage === "updates" ? "active" : ""} onClick={() => setActivePage("updates")}><span className="ico">◷</span>Legal Updates</button>
                </nav>
              </div>
            </>
          )}

          {/* ADMIN NAV */}
          {activeRole === "admin" && (
            <div className="nav-group">
              <p className="nav-label">System</p>
              <nav className="nav">
                <button className={activePage === "overview" ? "active" : ""} onClick={() => setActivePage("overview")}><span className="ico">⌂</span>Admin Overview</button>
                <button className={activePage === "admin-membership" ? "active" : ""} onClick={() => setActivePage("admin-membership")}><span className="ico">⚙</span>Membership &amp; Permissions</button>
                <button className={activePage === "admin-compliance" ? "active" : ""} onClick={() => setActivePage("admin-compliance")}><span className="ico">◷</span>Compliance &amp; Audit</button>
              </nav>
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="dev-credit">Developed by <strong>I&amp;I Solutions</strong></div>
          <div className="profile-mini">
            <div className="avatar">{currentRole.init}</div>
            <div>
              <strong style={{ color: "#fff" }}>{currentRole.name}</strong><br />
              <span>{currentRole.roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => {}}>☰</button>
            <div className="search"><input placeholder="Search cases, statutes…" /></div>
          </div>
          <div className="top-actions">
            <div className="role-switcher">
              <button className={activeRole === "student" ? "active" : ""} onClick={() => switchRole("student")}>Student</button>
              <button className={activeRole === "lecturer" ? "active" : ""} onClick={() => switchRole("lecturer")}>Lecturer</button>
              <button className={activeRole === "researcher" ? "active" : ""} onClick={() => switchRole("researcher")}>Researcher</button>
              <button className={activeRole === "admin" ? "active" : ""} onClick={() => switchRole("admin")}>Admin</button>
            </div>
            <button onClick={logout} className="pill-btn" style={{ border: "none", background: "transparent", color: "var(--slate)", cursor: "pointer", marginLeft: "10px" }}>Log out</button>
            <div className="avatar" style={{ marginLeft: "10px" }}>{currentRole.init}</div>
          </div>
        </header>

        <div className="content">
            {/* ... (Keep ALL the page content sections from your current code exactly as they are) ... */}
            {/* Just make sure the `activeRole` and `activePage` conditions are exactly the same as before. */}
            {activePage === "overview" && (
                <section className="page active">
                    {/* ... Your existing overview code ... */}
                    <div className="welcome">
                        <div>
                        <div className="eyebrow">{currentRole.context}</div>
                        <h1>{currentRole.greeting}</h1>
                        <p>{currentRole.sub}</p>
                        </div>
                    </div>
                    {/* (Paste the rest of your role-specific overview content here) */}
                </section>
            )}
            {/* (Paste the rest of your pages here) */}
        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toastMsg ? "show" : ""}`}>
        {toastMsg}
      </div>
    </div>
  );
}