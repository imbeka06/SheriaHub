"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password, role: "STUDENT" });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
      <div className="panel" style={{ width: "100%", maxWidth: "400px", padding: "32px" }}>
        <div className="brand" style={{ marginBottom: "24px", justifyContent: "center" }}>
          <div className="brand-mark" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>§</div>
          <div className="brand-name" style={{ color: "var(--ink)" }}>SheriaHub</div>
        </div>
        
        <h2 style={{ textAlign: "center", font: "24px Georgia,serif", marginBottom: "8px" }}>
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>
        <p style={{ textAlign: "center", color: "var(--slate)", fontSize: "13px", marginBottom: "24px" }}>
          {isLogin ? "Enter your credentials to access your workspace." : "Start your legal intelligence journey today."}
        </p>

        {error && <div style={{ background: "#f0e3e3", color: "#8a3535", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--slate)", marginBottom: "4px", display: "block" }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--silver)" }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--slate)", marginBottom: "4px", display: "block" }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--silver)" }} />
          </div>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--slate)", marginBottom: "4px", display: "block" }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--silver)" }} />
          </div>
          
          <button type="submit" className="primary" style={{ marginTop: "8px", padding: "12px" }}>
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--slate)", marginTop: "24px" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: "bold", cursor: "pointer" }}>
            {isLogin ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}