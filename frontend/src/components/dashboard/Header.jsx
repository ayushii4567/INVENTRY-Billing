import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  LogOut, 
  Building2, 
  Bell,
  Menu,
  ChevronDown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export default function Header({ 
  user, 
  onLogout, 
  searchQuery, 
  setSearchQuery, 
  onToggleSidebar,
  activeTab,
  onNavigateTab
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getTabLabel = (tab) => {
    switch (tab) {
      case "overview": return { label: "Executive Overview", category: "Core Dashboard" };
      case "sales-bills": return { label: "Sales Invoices & Billing", category: "Transactions (F8)" };
      case "purchases": return { label: "Purchase Inward Register", category: "Transactions (F9)" };
      case "sales-orders": return { label: "Sales Orders Register", category: "Transactions" };
      case "ledger": return { label: "Party Ledger & Statement", category: "Accounts & Ledger (F4)" };
      case "daybook": return { label: "Day Book (Daily Transaction Register)", category: "Transactions (F5)" };
      case "trial-balance": return { label: "Trial Balance (Balanced Statement)", category: "Financial Statements" };
      case "profit-loss": return { label: "Profit & Loss Account (COGS & Margins)", category: "Financial Statements" };
      case "balance-sheet": return { label: "Balance Sheet (Assets & Liabilities)", category: "Financial Statements" };
      case "inventory": return { label: "Warehouse Stock & Adjustments", category: "Inventory" };
      case "delivery": return { label: "Delivery Fleet & Runsheet Dispatch", category: "Logistics" };
      case "sales-customers": return { label: "Customers Master (Sundry Debtors)", category: "Masters" };
      case "suppliers": return { label: "Suppliers Master (Sundry Creditors)", category: "Masters" };
      case "col-payments": return { label: "Payment Collections & Receipts", category: "Finance" };
      case "col-unmatched": return { label: "UPI Suspense & Unmatched Queue", category: "Finance" };
      case "sales-products": return { label: "Product & Inventory Catalog", category: "Inventory" };
      case "sales-schemes": return { label: "FMCG Schemes & Promotions", category: "Masters" };
      case "sales-routes": return { label: "Routes & Beats Master", category: "Logistics" };
      case "sales-areas": return { label: "Areas & Territory Master", category: "Logistics" };
      case "sales-salesmen": return { label: "Salesmen Field Force", category: "Workforce" };
      case "sales-assignments": return { label: "Beat Customer Assignments", category: "Logistics" };
      case "reports": return { label: "Executive Reports & Audit", category: "Intelligence" };
      default: return { label: "Enterprise Command Center", category: "Workstation" };
    }
  };

  const currentTabInfo = getTabLabel(activeTab);

  // User initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const userName = user?.name || "Rajesh Sharma";
  const userRole = user?.roleLabel || "Owner / Super Admin";
  const companyName = user?.company || "Distributor ERP";

  return (
    <header style={{
      background: "var(--header-bg, #ffffff)",
      borderBottom: "1px solid var(--border-card, #e2e8f0)",
      padding: "10px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 80,
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)"
    }}>
      <style>{`
        .header-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 320px;
          max-width: 100%;
        }
        .header-search-input {
          width: 100%;
          height: 38px;
          padding: 0 54px 0 36px;
          border-radius: 8px;
          border: 1px solid var(--border-card, #e2e8f0);
          background: var(--bg-dark, #f8fafc);
          color: var(--text-main, #0f172a);
          font-size: 0.84rem;
          transition: all 0.18s ease;
        }
        .header-search-input:focus {
          background: #ffffff;
          border-color: var(--primary-500, #4f46e5);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          outline: none;
        }
        .header-shortcut-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-card, #e2e8f0);
          background: var(--bg-surface, #ffffff);
          color: var(--text-muted, #475569);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .header-shortcut-pill:hover {
          background: var(--bg-card-hover, #f1f5f9);
          color: var(--primary-600, #4338ca);
          border-color: rgba(79, 70, 229, 0.3);
        }
        .header-shortcut-pill kbd {
          background: var(--bg-dark, #f1f5f9);
          border: 1px solid var(--border-card, #e2e8f0);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-dim, #64748b);
        }
        @media (max-width: 1024px) {
          .header-shortcuts-group {
            display: none !important;
          }
          .header-company-badge {
            display: none !important;
          }
          .header-search-wrap {
            width: 220px;
          }
        }
        @media (max-width: 768px) {
          .header-context-title {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Left Group: Mobile Menu + Context Breadcrumb + Search ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
        
        {/* Mobile Hamburger Toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mobile-nav-toggle-btn"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid var(--border-card, #e2e8f0)",
              background: "#ffffff",
              color: "var(--text-main, #0f172a)",
              cursor: "pointer"
            }}
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Current Module Breadcrumb / Title */}
        <div className="header-context-title" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            fontSize: "0.68rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--primary-500, #4f46e5)",
            lineHeight: 1.1
          }}>
            {currentTabInfo.category}
          </div>
          <div style={{
            fontSize: "0.98rem",
            fontWeight: "800",
            color: "var(--text-main, #0f172a)",
            lineHeight: 1.2
          }}>
            {currentTabInfo.label}
          </div>
        </div>

        {/* Universal Quick Search */}
        <div className="header-search-wrap">
          <Search 
            size={16} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              color: "var(--text-dim, #94a3b8)", 
              pointerEvents: "none" 
            }} 
          />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search Outlets, Bills, Items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd style={{
            position: "absolute",
            right: "10px",
            fontSize: "0.65rem",
            fontWeight: "700",
            color: "var(--text-dim, #94a3b8)",
            background: "#ffffff",
            border: "1px solid var(--border-card, #e2e8f0)",
            borderRadius: "4px",
            padding: "2px 5px",
            pointerEvents: "none"
          }}>
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* ── Right Group: Tally Shortcuts + Company Info + Profile ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        
        {/* Tally Quick Nav Pills (Desktop only) */}
        {onNavigateTab && (
          <div className="header-shortcuts-group" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button 
              onClick={() => onNavigateTab("sales-bills")}
              className="header-shortcut-pill"
              title="Open Sales Invoices (F8)"
            >
              <kbd>F8</kbd>
              <span>Sales</span>
            </button>

            <button 
              onClick={() => onNavigateTab("purchases")}
              className="header-shortcut-pill"
              title="Open Purchase Inward Register (F9)"
            >
              <kbd>F9</kbd>
              <span>Purchase</span>
            </button>

            <button 
              onClick={() => onNavigateTab("ledger")}
              className="header-shortcut-pill"
              title="Open Party Ledger Statement (F4)"
            >
              <kbd>F4</kbd>
              <span>Ledger</span>
            </button>
          </div>
        )}

        {/* Company & Financial Year Tag */}
        <div className="header-company-badge" style={{
          background: "var(--bg-dark, #f8fafc)",
          border: "1px solid var(--border-card, #e2e8f0)",
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "0.78rem",
          color: "var(--text-muted, #475569)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ 
            width: "7px", 
            height: "7px", 
            borderRadius: "50%", 
            background: "#10b981", 
            display: "inline-block" 
          }} />
          <span style={{ fontWeight: "700", color: "var(--text-main, #0f172a)" }}>
            Distributor ERP
          </span>
          <span style={{ color: "var(--text-dim, #94a3b8)" }}>•</span>
          <span style={{ color: "var(--text-dim, #64748b)", fontWeight: "600" }}>
            FY 2026-27
          </span>
        </div>

        {/* Notifications Button */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              background: notificationsOpen ? "rgba(79, 70, 229, 0.08)" : "var(--bg-surface, #ffffff)",
              border: "1px solid var(--border-card, #e2e8f0)",
              color: notificationsOpen ? "var(--primary-600, #4338ca)" : "var(--text-muted, #475569)",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.16s ease"
            }}
            title="Notifications"
          >
            <Bell size={16} />
            <span style={{
              position: "absolute",
              top: "7px",
              right: "7px",
              width: "7px",
              height: "7px",
              background: "#10b981",
              borderRadius: "50%",
              border: "1.5px solid #ffffff"
            }} />
          </button>

          {/* Simple Notification Dropdown */}
          {notificationsOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "280px",
              background: "#ffffff",
              border: "1px solid var(--border-card, #e2e8f0)",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              padding: "12px",
              zIndex: 100
            }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                System Activity
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ padding: "6px 8px", background: "var(--bg-dark)", borderRadius: "6px" }}>
                  <strong>F9 Inward Sync</strong>: 2 Purchase vouchers successfully posted to inventory.
                </div>
                <div style={{ padding: "6px 8px", background: "var(--bg-dark)", borderRadius: "6px" }}>
                  <strong>Ledger Engine</strong>: All Party Dr/Cr running balances up to date.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Unified User Profile & Account Dropdown ── */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 8px 4px 4px",
              borderRadius: "10px",
              border: "1px solid",
              borderColor: isProfileOpen ? "rgba(79, 70, 229, 0.4)" : "var(--border-card, #e2e8f0)",
              background: isProfileOpen ? "rgba(79, 70, 229, 0.04)" : "var(--bg-surface, #ffffff)",
              cursor: "pointer",
              transition: "all 0.16s ease"
            }}
            title="User Profile & Settings"
          >
            {/* Avatar Pill */}
            <div style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "0.75rem",
              fontWeight: "700",
              flexShrink: 0
            }}>
              {getUserInitials(userName)}
            </div>

            {/* User Name & Role (hidden on mobile) */}
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-main, #0f172a)" }}>
                {userName.split(" ")[0]}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--primary-600, #4338ca)", fontWeight: "600" }}>
                Owner
              </div>
            </div>

            <ChevronDown 
              size={14} 
              style={{ 
                color: "var(--text-dim, #64748b)",
                transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.18s ease"
              }} 
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "240px",
              background: "#ffffff",
              border: "1px solid var(--border-card, #e2e8f0)",
              borderRadius: "12px",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              zIndex: 100
            }}>
              {/* Account Identity */}
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "var(--text-main, #0f172a)" }}>
                  {userName}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>
                  {companyName}
                </div>
                <div style={{
                  display: "inline-block",
                  marginTop: "6px",
                  fontSize: "0.66rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: "rgba(79, 70, 229, 0.1)",
                  color: "#4338ca"
                }}>
                  {userRole}
                </div>
              </div>

              {/* Status Section */}
              <div style={{
                borderTop: "1px solid var(--border-card, #e2e8f0)",
                borderBottom: "1px solid var(--border-card, #e2e8f0)",
                padding: "8px 0",
                fontSize: "0.74rem",
                color: "var(--text-muted, #64748b)",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Status:</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>● Online</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Engine:</span>
                  <span style={{ fontWeight: "600", color: "var(--text-main)" }}>Tally Prime v2.4</span>
                </div>
              </div>

              {/* Logout Option */}
              {onLogout && (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="btn-logout"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontWeight: "600"
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout System</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
