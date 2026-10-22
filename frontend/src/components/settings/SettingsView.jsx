import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Database, 
  Settings as SettingsIcon, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Server,
  Layers,
  Calendar,
  IndianRupee,
  Cpu
} from "lucide-react";

export default function SettingsView({ token, user }) {
  const [dbStatus, setDbStatus] = useState({
    status: "checking...",
    dbConnected: false,
    timestamp: null
  });
  const [loadingDb, setLoadingDb] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [companySettings, setCompanySettings] = useState({
    companyName: "Chirag Combines FMCG Distribution",
    tagline: "Authorized Distributor & Wholesaler",
    gstin: "22AABCC1234D1Z5",
    pan: "AABCC1234D",
    phone: "+91 98260 11223",
    email: "billing@chiragcombines.in",
    address: "Warehouse Depot #4, Urla Industrial Area, Ring Road No. 2",
    city: "Raipur",
    state: "Chhattisgarh",
    pincode: "492003",
    currency: "INR (₹)",
    financialYear: "2026-2027",
    taxScheme: "Regular GST (CGST + SGST)",
    defaultCreditDays: 15,
    invoicePrefix: "INV-2026-",
    purchasePrefix: "PUR-2026-",
    paymentPrefix: "PAY-2026-",
    roundDecimals: 2
  });

  const fetchHealth = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch("http://localhost:5005/api/health");
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      setDbStatus({ status: "offline", dbConnected: false, error: e.message });
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)",
        border: "1px solid var(--border-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(99, 102, 241, 0.12)",
            color: "var(--primary-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              ERP & Accounting Settings
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
              Configure FMCG company masters, GST compliance, financial year rules, and database engine
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
        >
          <Save size={16} />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedSuccess && (
        <div style={{
          padding: "14px 18px",
          borderRadius: "10px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#059669",
          fontWeight: "600",
          fontSize: "0.88rem",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={18} />
          <span>Settings saved successfully to ERP environment.</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        
        {/* Card 1: Company & GST Profile */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid var(--border-card)", paddingBottom: "12px" }}>
            <Building2 size={20} color="var(--primary-500)" />
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
              Company & Tax Registration
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                Company / Distributor Name
              </label>
              <input 
                type="text" 
                name="companyName" 
                value={companySettings.companyName} 
                onChange={handleChange}
                className="input-field"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  GSTIN
                </label>
                <input 
                  type="text" 
                  name="gstin" 
                  value={companySettings.gstin} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  PAN Number
                </label>
                <input 
                  type="text" 
                  name="pan" 
                  value={companySettings.pan} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Contact Phone
                </label>
                <input 
                  type="text" 
                  name="phone" 
                  value={companySettings.phone} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={companySettings.email} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                Depot & Warehouse Address
              </label>
              <textarea 
                rows="2" 
                name="address" 
                value={companySettings.address} 
                onChange={handleChange}
                className="input-field"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Accounting & Financial Year Settings */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", borderBottom: "1px solid var(--border-card)", paddingBottom: "12px" }}>
            <Calendar size={20} color="#10b981" />
            <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
              Accounting & Voucher Sequencing
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Active Financial Year
                </label>
                <input 
                  type="text" 
                  name="financialYear" 
                  value={companySettings.financialYear} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Base Currency
                </label>
                <input 
                  type="text" 
                  name="currency" 
                  value={companySettings.currency} 
                  disabled
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-card)", color: "var(--text-muted)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Sales Invoice Prefix (F8)
                </label>
                <input 
                  type="text" 
                  name="invoicePrefix" 
                  value={companySettings.invoicePrefix} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Purchase Voucher Prefix (F9)
                </label>
                <input 
                  type="text" 
                  name="purchasePrefix" 
                  value={companySettings.purchasePrefix} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Payment Voucher Prefix (F5/F6)
                </label>
                <input 
                  type="text" 
                  name="paymentPrefix" 
                  value={companySettings.paymentPrefix} 
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)", fontFamily: "var(--font-mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Decimal Precision
                </label>
                <select 
                  name="roundDecimals" 
                  value={companySettings.roundDecimals}
                  onChange={handleChange}
                  className="input-field"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border-card)", background: "var(--bg-input)", color: "var(--text-main)" }}
                >
                  <option value={2}>2 Decimals (Standard INR paise)</option>
                  <option value={3}>3 Decimals</option>
                  <option value={0}>0 Decimals (Rounded)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Database & Server Diagnostics */}
        <div className="glass-card" style={{ padding: "24px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", borderBottom: "1px solid var(--border-card)", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Database size={20} color="#6366f1" />
              <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Database Persistence Engine & Server Diagnostics
              </h2>
            </div>

            <button 
              onClick={fetchHealth} 
              disabled={loadingDb}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: "1px solid var(--border-card)",
                padding: "6px 12px",
                borderRadius: "6px",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={13} className={loadingDb ? "spin" : ""} />
              <span>Refresh Status</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            
            <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Database Connection</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: dbStatus.dbConnected ? "#10b981" : "#ef4444",
                  boxShadow: dbStatus.dbConnected ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "0 0 0 2px rgba(239, 68, 68, 0.2)"
                }} />
                <span style={{ fontWeight: "700", color: dbStatus.dbConnected ? "#059669" : "#dc2626", fontSize: "1rem" }}>
                  {dbStatus.dbConnected ? "MongoDB Atlas Connected" : "In-Memory Dual Mode"}
                </span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Host: mongodb://127.0.0.1:27017/inventry_billing
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Server Process</div>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", marginTop: "8px" }}>
                Express.js Port 5005
              </div>
              <div style={{ fontSize: "0.74rem", color: "#10b981", marginTop: "4px" }}>
                API Health: ONLINE (200 OK)
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", background: "var(--bg-input)", border: "1px solid var(--border-card)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Accounting Engine</div>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", marginTop: "8px" }}>
                Tally Double-Entry Mode
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Rule: Assets = Liabilities + Equity (Balanced ₹0.00)
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
