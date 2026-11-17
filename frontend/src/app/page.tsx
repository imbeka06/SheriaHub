"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthScreen from "../components/AuthScreen";

// --- MOCK DATA ---
const roleData = {
  student: { name: "Sebastian Juma", init: "SJ", roleLabel: "Student", context: "Student Portal", greeting: "Good afternoon, Sebastian.", sub: "A little progress today is a stronger argument tomorrow." },
  lecturer: { name: "Dr. Ochieng", init: "DO", roleLabel: "Lecturer", context: "Lecturer Portal", greeting: "Good afternoon, Dr. Ochieng.", sub: "Manage your marking queue, delegate tasks, and monitor cohort progress." },
  researcher: { name: "Dr. Wanjiku", init: "DW", roleLabel: "Researcher", context: "Researcher Portal", greeting: "Good afternoon, Dr. Wanjiku.", sub: "Review your active projects, literature matrix, and authority watchlist." },
  admin: { name: "System Admin", init: "AD", roleLabel: "Admin", context: "Admin Console", greeting: "System Administrator.", sub: "Institutional compliance, user provisioning, and system health overview." }
};

export default function Home() {
  // 1. ALL HOOKS MUST GO AT THE TOP
  const { user, loading } = useAuth();
  
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

  // 2. HELPER FUNCTIONS
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

  const currentRole = roleData[activeRole];

  // 3. EARLY RETURNS (MUST BE BELOW ALL HOOKS)
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", color: "var(--slate)" }}>
        Loading SheriaHub...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // 4. MAIN DASHBOARD RENDER
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
            <div className="avatar" style={{ marginLeft: "10px" }}>{currentRole.init}</div>
          </div>
        </header>

        <div className="content">
          
          {/* ================= OVERVIEW DASHBOARD ================= */}
          {activePage === "overview" && (
            <section className="page active">
              <div className="welcome">
                <div>
                  <div className="eyebrow">{currentRole.context}</div>
                  <h1>{currentRole.greeting}</h1>
                  <p>{currentRole.sub}</p>
                </div>
              </div>

              {activeRole === "student" && (
                <>
                  <div className="stats">
                    <div className="stat"><div className="stat-top">Study time today</div><strong>2h 35m</strong><small>+35 min from yesterday</small></div>
                    <div className="stat"><div className="stat-top">Cases reviewed</div><strong>08</strong><small>4 more to reach goal</small></div>
                    <div className="stat"><div className="stat-top">Study streak</div><strong>06 days</strong><small>Consistency is building</small></div>
                    <div className="stat"><div className="stat-top">Flashcards due</div><strong>24</strong><small>Across 3 law units</small></div>
                  </div>
                  <div className="grid-main">
                    <div className="panel">
                      <div className="panel-head"><h2>Today's schedule</h2></div>
                      <div className="task"><span>Constitutional Law — Reading block</span><strong>09:00 AM</strong></div>
                      <div className="task"><span>Evidence Law — Case review</span><strong>11:00 AM</strong></div>
                      <div className="task"><span>Moot court practice</span><strong>02:30 PM</strong></div>
                    </div>
                    <div className="panel">
                      <div className="panel-head"><h2>Revision Queue</h2><span className="tag urgent">24 due</span></div>
                      <div className="task"><span>Constitutional Law</span><strong>09 cards</strong></div>
                      <div className="task"><span>Law of Evidence</span><strong>08 cards</strong></div>
                      <button className="primary" style={{ width: "100%", marginTop: "10px" }} onClick={() => setActivePage("learning-studio")}>Go to Learning Studio →</button>
                    </div>
                  </div>
                </>
              )}

              {activeRole === "lecturer" && (
                <>
                  <div className="stats">
                    <div className="stat"><div className="stat-top">Active Courses</div><strong>03</strong><small>Constitutional · Evidence · Contract</small></div>
                    <div className="stat"><div className="stat-top">Cohorts</div><strong>05</strong><small>LLB Year 2 &amp; 3</small></div>
                    <div className="stat"><div className="stat-top">Submissions to Mark</div><strong>17</strong><small>Evidence CAT · due Friday</small></div>
                    <div className="stat"><div className="stat-top">Delegated Tasks</div><strong>04</strong><small>Assigned to TA</small></div>
                  </div>
                  <div className="grid-main">
                    <div className="panel">
                      <div className="panel-head"><h2>Courses &amp; Cohorts</h2></div>
                      <div className="task"><span>Constitutional Law · LLB Year 3</span><span className="tag">Reading list shared</span></div>
                      <div className="task"><span>Law of Evidence · LLB Year 2</span><span className="tag urgent">Marking · 17</span></div>
                    </div>
                    <div className="panel">
                      <div className="panel-head"><h2>Assessment Pipeline</h2></div>
                      <div className="task"><span>Evidence CAT · rubric marking</span><span className="tag urgent">Due Fri</span></div>
                      <div className="task"><span>Moot skeleton · feedback</span><span className="tag">Due Mon</span></div>
                      <button className="primary" style={{ width: "100%", marginTop: "10px" }} onClick={() => setActivePage("lecturer")}>Open Marking Queue →</button>
                    </div>
                  </div>
                </>
              )}

              {activeRole === "researcher" && (
                <>
                  <div className="stats">
                    <div className="stat"><div className="stat-top">Active Projects</div><strong>04</strong><small>2 drafting · 2 researching</small></div>
                    <div className="stat"><div className="stat-top">Saved Authorities</div><strong>146</strong><small>Across all projects</small></div>
                    <div className="stat"><div className="stat-top">New Authorities</div><strong>12</strong><small>This week on watchlist</small></div>
                    <div className="stat"><div className="stat-top">Open Questions</div><strong>08</strong><small>Awaiting verification</small></div>
                  </div>
                  <div className="grid-main">
                    <div className="panel">
                      <div className="panel-head"><h2>Active Research Projects</h2></div>
                      <div className="task"><span>Judicial review of administrative action</span><span className="tag">Drafting</span></div>
                      <div className="task"><span>Devolution &amp; county fiscal autonomy</span><span className="tag">Researching</span></div>
                    </div>
                    <div className="panel">
                      <div className="panel-head"><h2>Authority Watchlist</h2></div>
                      <div className="task"><span>Supreme Court · 4 new decisions</span><span className="tag good">Verified</span></div>
                      <div className="task"><span>Civil Procedure (Amendment) Rules</span><span className="tag good">Official</span></div>
                      <button className="primary" style={{ width: "100%", marginTop: "10px" }} onClick={() => setActivePage("researcher-profile")}>Open Research Matrix →</button>
                    </div>
                  </div>
                </>
              )}

              {activeRole === "admin" && (
                <>
                  <div className="stats">
                    <div className="stat"><div className="stat-top">Active Users</div><strong>1,284</strong><small>Across 2 institutions</small></div>
                    <div className="stat"><div className="stat-top">Courses Live</div><strong>42</strong><small>LLB · KSL CLE · PG</small></div>
                    <div className="stat"><div className="stat-top">Pending Permissions</div><strong>06</strong><small>2 librarian requests</small></div>
                    <div className="stat"><div className="stat-top">Audit Events (24h)</div><strong>318</strong><small>All within policy</small></div>
                  </div>
                  <div className="grid-main">
                    <div className="panel">
                      <div className="panel-head"><h2>Membership &amp; Permissions</h2></div>
                      <div className="task"><span>New students · LLB Year 1</span><strong>128 pending</strong></div>
                      <div className="task"><span>Librarian access requests</span><strong>02</strong></div>
                      <button className="primary" style={{ width: "100%", marginTop: "10px" }} onClick={() => setActivePage("admin-membership")}>Manage Users →</button>
                    </div>
                    <div className="panel">
                      <div className="panel-head"><h2>System Health</h2></div>
                      <div className="task"><span>Database Sync</span><span className="tag good">Healthy</span></div>
                      <div className="task"><span>Kenya DPA Compliance</span><span className="tag good">Active</span></div>
                      <button className="primary" style={{ width: "100%", marginTop: "10px" }} onClick={() => setActivePage("admin-compliance")}>View Audit Logs →</button>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* ================= SEPARATED PROFILES ================= */}
          {activePage === "student-profile" && (
            <section className="page active">
              <div className="eyebrow">Student Workspace</div>
              <h1 className="page-title">Student Profile</h1>
              <p className="page-desc">Manage your academic identity, view your current standing, and control your data privacy.</p>
              <div className="mock-area" style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                  <div className="avatar lg">SJ</div>
                  <div><strong style={{ font: "18px Georgia,serif" }}>Sebastian Juma</strong><p style={{ margin: "2px 0", color: "var(--slate)", fontSize: "11.5px" }}>LLB · University of Nairobi · Year 3</p><span className="trust-badge verified">Verified institution</span></div>
                </div>
                <div className="sk-grid">
                  <div className="sk-card"><h4>Programme &amp; stage</h4><p>LLB · Year 3 · Semester 2. KSL CLE scheduled for next intake.</p></div>
                  <div className="sk-card"><h4>Courses &amp; units</h4><p>Constitutional Law · Evidence · Civil Procedure · Contract II · Jurisprudence.</p></div>
                  <div className="sk-card"><h4>Research interests</h4><p>Constitutional review · judicial independence · digital evidence.</p></div>
                  <div className="sk-card"><h4>Academic goals</h4><p>Complete third-year moots · build a portfolio of two publishable case notes.</p></div>
                  <div className="sk-card"><h4>Learning preferences</h4><p>Serif reading mode · step-by-step explanations · spaced repetition first.</p></div>
                  <div className="sk-card"><h4>Privacy &amp; data controls</h4><p>Voice recording: explicit consent only · notes private by default · export or delete from Profile.</p></div>
                </div>
              </div>
            </section>
          )}

          {activePage === "researcher-profile" && (
            <section className="page active">
              <div className="eyebrow">Advanced Research Workspace</div>
              <h1 className="page-title">Researcher Profile</h1>
              <p className="page-desc">Organise literature, methodology, and authority monitoring for advanced legal research.</p>
              <div className="mock-area" style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                  <div className="avatar lg">DW</div>
                  <div><strong style={{ font: "18px Georgia,serif" }}>Dr. Wanjiku</strong><p style={{ margin: "2px 0", color: "var(--slate)", fontSize: "11.5px" }}>Postgraduate Researcher · Constitutional Law</p><span className="trust-badge verified">Verified Scholar</span></div>
                </div>
                <h3>Literature Matrix</h3>
                <div className="task"><span>Doctrinal Review</span><span className="tag">Reviewed</span></div>
                <div className="task"><span>Comparative Analysis · Kenya / Uganda / South Africa</span><span className="tag">In progress</span></div>
                <div className="task"><span>Legislative history · 12 amendments</span><span className="tag good">Complete</span></div>
                <button className="primary" style={{ marginTop: "15px" }} onClick={() => showToast("Opening Citation Manager")}>Open Citation Manager</button>
              </div>
            </section>
          )}

          {/* ================= LEARNING STUDIO ================= */}
          {activePage === "learning-studio" && (
            <section className="page active">
              <div className="eyebrow">My Academic Portfolio</div>
              <h1 className="page-title">Learning Studio</h1>
              <p className="page-desc">Track your progress, maintain your streaks, and focus with the Pomodoro technique.</p>

              <div className="kuse-dashboard" style={{ marginTop: "20px" }}>
                <div className="quote-banner">"Learning never exhausts the mind." — Leonardo da Vinci</div>
                <div className="kuse-stats">
                  <div className="k-stat purple"><h2>24</h2><span>Total Topics</span></div>
                  <div className="k-stat pink"><h2>08</h2><span>Completed</span></div>
                  <div className="k-stat blue"><h2>2.5h</h2><span>Study Hours</span></div>
                  <div className="k-stat green"><h2>33%</h2><span>Completion Rate</span></div>
                </div>
                <div className="streak-banner"><span>🔥</span> 7 Day Streak</div>
                <div className="kuse-row">
                  <div className="weekly-calendar">
                    <h3>Weekly Calendar</h3>
                    <div className="calendar-grid">
                      <div className="cal-day"><small>Sun</small>18</div>
                      <div className="cal-day"><small>Mon</small>19</div>
                      <div className="cal-day"><small>Tue</small>20</div>
                      <div className="cal-day today"><small>Wed</small>21</div>
                      <div className="cal-day"><small>Thu</small>22</div>
                      <div className="cal-day"><small>Fri</small>23</div>
                      <div className="cal-day"><small>Sat</small>24</div>
                    </div>
                  </div>
                  <div className="pomodoro-box">
                    <h4>Focus Session</h4>
                    <div className="timer-display">{formatTime(timer)}</div>
                    <div className="timer-controls">
                      <button onClick={() => setIsRunning(true)}>▶ Start</button>
                      <button onClick={() => setIsRunning(false)}>⏸ Pause</button>
                      <button onClick={() => { setIsRunning(false); setTimer(1500); }}>↻ Reset</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-row">
                <button className={activeTab === "tab-planner" ? "active" : ""} onClick={() => setActiveTab("tab-planner")}>Planner</button>
                <button className={activeTab === "tab-flash" ? "active" : ""} onClick={() => setActiveTab("tab-flash")}>Flashcards</button>
                <button className={activeTab === "tab-assess" ? "active" : ""} onClick={() => setActiveTab("tab-assess")}>Assessments</button>
                <button className={activeTab === "tab-media" ? "active" : ""} onClick={() => setActiveTab("tab-media")}>Study Media</button>
              </div>

              <div className={`tab-panel ${activeTab === "tab-planner" ? "active" : ""}`}>
                <div className="mock-area">
                  <h3>Upcoming Academic Milestones</h3>
                  <div className="task"><span>Evidence Law · CAT revision</span><span className="tag urgent">In 4 days</span></div>
                  <div className="task"><span>Moot skeleton argument submission</span><span className="tag">In 9 days</span></div>
                  <div className="task"><span>Constitutional Law · reading target</span><span className="tag">Today</span></div>
                </div>
              </div>

              <div className={`tab-panel ${activeTab === "tab-flash" ? "active" : ""}`}>
                <div className="mock-area">
                  <div className="eyebrow">Card 1 of 24 · Constitutional Law</div>
                  <h3 style={{ marginTop: "12px" }}>What is the principle of constitutional supremacy?</h3>
                  <p style={{ padding: "14px", background: "var(--accent-soft)", borderRadius: "10px", color: "#3d556b" }}>The Constitution is the supreme law of the Republic and binds all persons and all State organs at both levels of government (Article 2(1)).</p>
                  <button className="primary" onClick={() => showToast("Marked for another review.")}>Reveal answer</button>
                </div>
              </div>

              <div className={`tab-panel ${activeTab === "tab-assess" ? "active" : ""}`}>
                <div className="mock-area">
                  <h3>Start a practice session</h3>
                  <select className="mock-input"><option>Constitutional Law</option><option>Law of Evidence</option></select>
                  <select className="mock-input"><option>Problem question · 30 minutes</option><option>Case note · 20 minutes</option></select>
                  <button className="primary" onClick={() => showToast("Practice session selected.")}>Create practice session →</button>
                </div>
              </div>

              <div className={`tab-panel ${activeTab === "tab-media" ? "active" : ""}`}>
                <div className="mock-area">
                  <h3>Study Media</h3>
                  <div className="media-player">
                    <button className="play" onClick={() => showToast("Soundscape toggled.")}>▶</button>
                    <div><strong>Nairobi Library Ambience</strong><small>Offline soundscape · Ready to play</small></div>
                    <div className="wave">▂ ▄ ▆ ▃ ▅ ▂</div>
                  </div>
                  <input className="mock-input" placeholder="Paste a YouTube video or playlist URL" style={{ marginTop: "10px" }} />
                  <button className="pill-btn" onClick={() => showToast("YouTube embedding pending.")}>Add YouTube media</button>
                </div>
              </div>
            </section>
          )}

          {/* ================= SHARED TOOLS ================= */}
          {activePage === "workspace" && (
            <section className="page active">
              <div className="eyebrow">Pillar 3 · Advanced legal research workspace</div>
              <h1 className="page-title">Research Desk</h1>
              <p className="page-desc">A resizable, collapsible three-panel workspace: navigator, document canvas, and intelligence assistant.</p>
              <div className="workspace-grid">
                <aside className="workspace-pane">
                  <h3>Navigator</h3>
                  <div className="doc-line active"><span>▸ Main judgment.pdf</span><span className="trust-badge upload">Upload</span></div>
                  <div className="doc-line"><span>Constitution of Kenya, 2010</span><span className="trust-badge official">Official</span></div>
                </aside>
                <article className="workspace-pane">
                  <h3>Document canvas</h3>
                  <p><b>1.</b> This panel is the reading surface. Text selection should allow highlighting, annotation, and saving a citation directly to the research notebook.</p>
                </article>
                <aside className="workspace-pane">
                  <h3>Intelligence assistant</h3>
                  <p><span className="mode-badge">Research</span></p>
                  <p>Article 165 confers the High Court supervisory jurisdiction over subordinate courts and tribunals.</p>
                  <button className="pill-btn" onClick={() => setActivePage("assistant")}>Ask AI Companion</button>
                </aside>
              </div>
            </section>
          )}

          {activePage === "library" && (
            <section className="page active">
              <div className="eyebrow">Pillar 3 · Case &amp; statute library</div>
              <h1 className="page-title">Legal Library</h1>
              <p className="page-desc">Browse Kenyan judgments, legislation and personal study materials with clear trust labels on every source.</p>
              <div className="module-hero"><div className="eyebrow">Case collection</div><h2>Find the authority behind the argument.</h2><p>Browse landmark decisions by court, subject, year or citation.</p></div>
              <div className="mock-area">
                <h3>Recently added</h3>
                <div className="case-row"><div><strong>Constitution of Kenya, 2010</strong></div><span className="trust-badge official">Official source</span></div>
                <div className="case-row"><div><strong>Owners of the Motor Vessel "Lillian S" v Caltex</strong></div><span className="trust-badge verified">Verified</span></div>
              </div>
            </section>
          )}

          {activePage === "visual-cases" && (
            <section className="page active">
              <div className="eyebrow">Pillar 1 · Visual jurisprudence explorer</div>
              <h1 className="page-title">Visual Case Maps</h1>
              <p className="page-desc">Map parties, facts, issues, rules, reasoning, authorities and orders. Relationship labels must always be evidence-backed.</p>
              <div className="mock-area">
                <h3>Illustrative structure</h3>
                <div className="case-map">
                  <svg className="map-lines" viewBox="0 0 700 300" preserveAspectRatio="none" aria-hidden="true">
                    <line x1="110" y1="65" x2="350" y2="140"/><line x1="590" y1="65" x2="350" y2="140"/>
                    <line x1="110" y1="245" x2="350" y2="140"/><line x1="590" y1="245" x2="350" y2="140"/>
                  </svg>
                  <div className="map-node n1">Parties &amp; facts<small>Who · what happened</small></div>
                  <div className="map-node n2">Legal issues<small>Questions for determination</small></div>
                  <div className="map-node main-node">Court's reasoning<small>Rules · application</small></div>
                  <div className="map-node n3">Authorities<small>Statutes · precedents</small></div>
                  <div className="map-node n4">Decision &amp; orders<small>Ratio · disposition</small></div>
                </div>
              </div>
            </section>
          )}

          {activePage === "assistant" && (
            <section className="page active">
              <div className="eyebrow">Pillar 2 · Hybrid AI legal companion</div>
              <h1 className="page-title">AI Companion</h1>
              <p className="page-desc">Four assistance modes: <span className="mode-badge">Learn</span> <span className="mode-badge">Research</span> <span className="mode-badge">Feedback</span> <span className="mode-badge">Drafting</span>.</p>
              <div className="workspace-grid">
                <aside className="workspace-pane">
                  <h3>Choose a mode</h3>
                  <div className="doc-line active">Research Tutor</div><div className="doc-line">Academic Supervisor</div><div className="doc-line">Moot Coach</div>
                </aside>
                <div className="workspace-pane">
                  <div className="avatar-stage">
                    <div className="ai-avatar">§</div>
                    <strong style={{ font: "19px Georgia,serif" }}>Your Legal Companion</strong>
                    <p>Ask a question, discuss a case, or rehearse your submissions.</p>
                    <button className="primary" onClick={() => showToast("Voice session requires backend AI.")}>● Start voice session</button>
                  </div>
                  <input className="mock-input" placeholder="Ask about a case, doctrine or statute…" />
                  <button className="primary" onClick={() => showToast("AI responses require backend connection.")}>Send question →</button>
                </div>
                <aside className="workspace-pane">
                  <h3>Session context</h3>
                  <p><b>Current subject</b><br />Constitutional Law</p>
                </aside>
              </div>
            </section>
          )}

          {activePage === "projects" && (
            <section className="page active">
              <div className="eyebrow">Supporting module · Research notebook</div>
              <h1 className="page-title">Research Projects</h1>
              <p className="page-desc">Organise research questions, source collections, saved authorities, notes, argument maps and drafts by project.</p>
              <div className="feature-strip">
                <div className="feature-mini"><strong>Judicial review of administrative action</strong><p>Status: drafting · 24 sources · 6 notes · argument map started.</p></div>
                <div className="feature-mini"><strong>Devolution &amp; county fiscal autonomy</strong><p>Status: researching · 41 sources · 3 open questions.</p></div>
              </div>
            </section>
          )}

          {activePage === "writing" && (
            <section className="page active">
              <div className="eyebrow">Supporting module · Writing &amp; drafting</div>
              <h1 className="page-title">Writing Studio</h1>
              <p className="page-desc">Structured drafting for IRAC/ILAC answers, case briefs, moot skeleton arguments, memoranda and verified pleadings.</p>
              <div className="mock-area">
                <h3>Start a new draft</h3>
                <select className="mock-input"><option>IRAC / ILAC problem answer</option><option>Case brief</option></select>
                <input className="mock-input" placeholder="Draft title or legal issue" />
                <textarea className="mock-input" rows={5} placeholder="Begin with the issue…"></textarea>
                <button className="primary" onClick={() => showToast("Draft saved locally.")}>Save draft</button>
              </div>
            </section>
          )}

          {activePage === "advocacy" && (
            <section className="page active">
              <div className="eyebrow">Pillar 4 · Advocacy simulation lab</div>
              <h1 className="page-title">Advocacy Lab</h1>
              <p className="page-desc">Virtual Kenyan courtroom practice. Feedback scores are learning indicators, not predictions of real courtroom performance.</p>
              <div className="mock-area">
                <h3>Choose your practice setting</h3>
                <div className="tier-grid">
                  <button className="tier-card">Supreme Court<small>Appeals · constitutional</small></button>
                  <button className="tier-card active">High Court<small>Judicial review · divisions</small></button>
                </div>
                <button className="primary" onClick={() => showToast("Simulation requires backend AI.")}>Begin practice session →</button>
              </div>
            </section>
          )}

          {activePage === "circles" && (
            <section className="page active">
              <div className="eyebrow">Pillar 7 · Academic collaboration</div>
              <h1 className="page-title">Academic Circles</h1>
              <p className="page-desc">Study groups, reading circles, shared briefs, moot practice rooms, and lecturer-led seminars.</p>
              <div className="mock-area"><h3>Your circles</h3><p>No study circles yet. This is where your group spaces will appear.</p></div>
            </section>
          )}

          {activePage === "updates" && (
            <section className="page active">
              <div className="eyebrow">Pillar 6 · Kenyan legal intelligence monitor</div>
              <h1 className="page-title">Legal Updates</h1>
              <p className="page-desc">Follow new decisions, legislative changes and court practice directions.</p>
              <div className="mock-area"><h3>Your legal watchlist</h3>
                <div className="task"><span>Constitutional &amp; human rights decisions</span><span className="tag">Following</span></div>
                <div className="task"><span>Civil Procedure amendments</span><span className="tag">Following</span></div>
              </div>
            </section>
          )}

          {activePage === "portfolio" && (
            <section className="page active">
              <div className="eyebrow">Supporting module · Academic portfolio</div>
              <h1 className="page-title">My Portfolio</h1>
              <p className="page-desc">Curate research projects, case briefs, writing samples, completed courses, assessment outcomes, advocacy sessions and milestones.</p>
              <div className="feature-strip">
                <div className="feature-mini"><strong>Research projects</strong><p>4 active · 2 completed · 1 published as a student note.</p></div>
                <div className="feature-mini"><strong>Case briefs</strong><p>26 written · 8 reviewed by a peer circle.</p></div>
              </div>
            </section>
          )}

          {/* ================= LECTURER PAGES ================= */}
          {activePage === "lecturer-profile" && (
            <section className="page active">
              <div className="eyebrow">Faculty Workspace</div>
              <h1 className="page-title">Lecturer Profile</h1>
              <p className="page-desc">Manage your teaching schedule, marking queues, and delegated tasks to Teaching Assistants.</p>
              <div className="grid-main" style={{ marginTop: "20px" }}>
                <div className="panel">
                  <div className="panel-head"><h2>Delegated Tasks</h2></div>
                  <div className="task"><span>Evidence CAT · Graded by TA John</span><span className="tag good">Complete</span></div>
                  <div className="task"><span>Constitutional Essays · Graded by TA Mary</span><span className="tag">In progress</span></div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Marking Status</h2></div>
                  <div className="task"><span>Evidence CAT (17 left)</span><button className="primary">Open Rubric</button></div>
                </div>
              </div>
            </section>
          )}

          {activePage === "lecturer" && (
            <section className="page active">
              <div className="eyebrow">Supporting module · Lecturer workspace</div>
              <h1 className="page-title">Lecturer Workspace</h1>
              <p className="page-desc">Course management, reading lists, rubrics, assessment marking, cohort insights — without exposing private student notes.</p>
              <div className="mock-area">
                <h3>Courses &amp; cohorts</h3>
                <div className="task"><span>Constitutional Law · LLB Year 3</span><span className="tag good">Reading list shared</span></div>
                <div className="task"><span>Law of Evidence · LLB Year 2</span><span className="tag urgent">17 submissions to mark</span></div>
                <button className="primary" style={{ marginTop: "10px" }} onClick={() => showToast("Rubric requires backend connection.")}>Open marking queue</button>
              </div>
            </section>
          )}

          {activePage === "researcher" && (
            <section className="page active">
              <div className="eyebrow">Supporting module · Researcher workspace</div>
              <h1 className="page-title">Researcher Workspace</h1>
              <p className="page-desc">Research question development, source comparison, notebooks, citation management, methodology organisation and authority monitoring.</p>
              <div className="mock-area">
                <h3>Methodology &amp; source collections</h3>
                <div className="task"><span>Doctrinal · 41 sources</span><span className="tag">Reviewed</span></div>
                <div className="task"><span>Comparative · Kenya / Uganda / South Africa</span><span className="tag">In progress</span></div>
                <div className="task"><span>Legislative history · 12 amendments</span><span className="tag good">Complete</span></div>
              </div>
            </section>
          )}

          {/* ================= ADMIN PAGES ================= */}
          {activePage === "admin-membership" && (
            <section className="page active">
              <div className="eyebrow">Administration</div>
              <h1 className="page-title">Membership &amp; Permissions</h1>
              <p className="page-desc">Manage institutional access and role-based access control (RBAC).</p>
              <div className="mock-area">
                <h3>Institutional controls</h3>
                <div className="task"><span>LLB Year 1 · Pending approval</span><span className="tag urgent">128</span></div>
                <div className="task"><span>Librarian access requests</span><span className="tag">02</span></div>
                <div className="task"><span>Role updates (RBAC)</span><span className="tag">04</span></div>
              </div>
            </section>
          )}

          {activePage === "admin-compliance" && (
            <section className="page active">
              <div className="eyebrow">Administration</div>
              <h1 className="page-title">Compliance &amp; Audit</h1>
              <p className="page-desc">System health, encryption status, and Kenya Data Protection Act compliance.</p>
              <div className="mock-area">
                <div className="task"><span>Encryption (Transit &amp; Rest)</span><span className="tag good">Active</span></div>
                <div className="task"><span>Voice Recording Consent Logs</span><span className="tag good">Verified</span></div>
                <div className="task"><span>Audit Log Retention (90 days)</span><span className="tag">Healthy</span></div>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toastMsg ? "show" : ""}`}>
        {toastMsg}
      </div>
    </div>
  );
}