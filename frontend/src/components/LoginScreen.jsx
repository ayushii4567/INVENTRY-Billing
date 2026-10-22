import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Eye, 
  EyeOff, 
  Zap, 
  Building2,
  Boxes,
  FileText,
  PackagePlus,
  BookOpen,
  Compass,
  CheckCircle2
} from "lucide-react";
import "./LoginScreen.css";

const SOFTWARE_HIGHLIGHTS = [
  {
    title: "Sales Invoices & Billing (F8)",
    desc: "Instant GST invoices, thermal receipt print, item scheme calculations & payment terms.",
    icon: FileText,
    color: "#4f46e5",
    bg: "rgba(79, 70, 229, 0.1)"
  },
  {
    title: "Purchase Inward (F9)",
    desc: "Manufacturer inward bills with automatic inventory stock updates & batch management.",
    icon: PackagePlus,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)"
  },
  {
    title: "Party Ledger & Statement (F4)",
    desc: "Complete double-entry Dr/Cr running balances for retail customers & suppliers.",
    icon: BookOpen,
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.1)"
  },
  {
    title: "Beats, Routes & Logistics",
    desc: "Multi-area beat management, salesman allocation & real-time delivery collections.",
    icon: Compass,
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.1)"
  }
];

export default function LoginScreen({ onLogin, isLoading, errorMessage }) {
  const [emailOrMobile, setEmailOrMobile] = useState("owner@distributorerp.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailOrMobile.trim()) return;
    onLogin({ 
      emailOrMobile: emailOrMobile.trim(), 
      password,
      rememberMe
    });
  };

  const handleQuickDemoLogin = () => {
    setEmailOrMobile("owner@distributorerp.com");
    setPassword("password123");
    onLogin({ 
      emailOrMobile: "owner@distributorerp.com", 
      password: "password123",
      rememberMe: true
    });
  };

  return (
    <div className="login-page-container">
      <div className="login-layout-grid">
        
        {/* Left Column: Brand Hero & Software Capabilities */}
        <div className="login-hero-panel">
          <div>
            <div className="hero-brand-badge">
              <Sparkles size={14} />
              <span>Enterprise Distributor ERP</span>
            </div>

            <h1 className="hero-brand-title" style={{ marginTop: "14px" }}>
              DISTRIBUTOR <span>ERP</span>
            </h1>

            <p className="hero-brand-desc" style={{ marginTop: "12px" }}>
              Enterprise billing, inventory tracking, and Tally Prime accounting workstation built for high-velocity FMCG distribution.
            </p>
          </div>

          {/* Software Modules Blueprint Showcase */}
          <div className="hero-roles-overview">
            {SOFTWARE_HIGHLIGHTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="hero-role-pill">
                  <div 
                    className="hero-role-icon-box"
                    style={{ background: item.bg, color: item.color }}
                  >
                    <Icon size={19} />
                  </div>
                  <div className="hero-role-info">
                    <div className="hero-role-title">
                      <span>{item.title}</span>
                    </div>
                    <div className="hero-role-subtitle">
                      {item.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Security Badges */}
          <div className="hero-trust-badges">
            <div className="hero-trust-item">
              <ShieldCheck size={16} color="#10b981" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle2 size={16} color="#3b82f6" />
              <span>MongoDB Atlas Connected</span>
            </div>
            <div className="hero-trust-item">
              <Building2 size={16} color="#6366f1" />
              <span>Tally Prime Engine v2.4</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Enterprise Sign In Card */}
        <div className="login-auth-card">
          
          {/* Card Header */}
          <div className="card-header-section" style={{ textAlign: "left" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
              marginBottom: "14px"
            }}>
              <Boxes size={22} />
            </div>
            <h2 className="card-main-title">Sign In to Workstation</h2>
            <p className="card-sub-title">
              Enter your authorized credentials to access your business workstation.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="auth-error-banner" style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#dc2626",
              fontSize: "0.82rem",
              fontWeight: "600",
              marginBottom: "16px"
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form-body">
            
            {/* Email or Username */}
            <div className="form-field-group">
              <label className="form-field-label">Email or Username</label>
              <div className="form-input-container">
                <Mail size={17} className="input-field-icon" />
                <input
                  type="text"
                  required
                  value={emailOrMobile}
                  onChange={(e) => setEmailOrMobile(e.target.value)}
                  placeholder="e.g. owner@distributorerp.com"
                  className="auth-text-input"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-field-group">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label className="form-field-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => alert("Default demo password is: password123")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--primary-600, #4f46e5)",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  Need Help?
                </button>
              </div>
              <div className="form-input-container">
                <Lock size={17} className="input-field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="auth-text-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "var(--text-muted, #475569)",
              marginTop: "4px"
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#4f46e5", cursor: "pointer", width: "15px", height: "15px" }}
                />
                <span>Remember this workstation</span>
              </label>
              <span style={{ color: "var(--text-dim, #94a3b8)", fontSize: "0.74rem" }}>
                v2.4 Enterprise
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.92rem",
                fontWeight: "700",
                cursor: isLoading ? "wait" : "pointer",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                transition: "all 0.18s ease",
                marginTop: "12px"
              }}
            >
              <span>{isLoading ? "Authenticating Workstation..." : "Sign In to ERP Workstation"}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick 1-Click Demo Login Bar */}
          <div style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-card, #e2e8f0)",
            textAlign: "center"
          }}>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px dashed rgba(79, 70, 229, 0.35)",
                background: "rgba(79, 70, 229, 0.04)",
                color: "#4338ca",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.16s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79, 70, 229, 0.08)";
                e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(79, 70, 229, 0.04)";
                e.currentTarget.style.borderColor = "rgba(79, 70, 229, 0.35)";
              }}
              title="Instant Login as Rajesh Sharma (Owner / Super Admin)"
            >
              <Zap size={15} color="#4f46e5" />
              <span>⚡ 1-Click Demo Access (Rajesh Sharma • Owner)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
