import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  Package, 
  Users, 
  Coins, 
  Compass,
  BarChart3,
  ChevronDown, 
  LogOut,
  X,
  PackagePlus,
  Building2,
  BookOpen,
  Boxes,
  Zap,
  Activity,
  Calendar,
  Scale,
  TrendingUp,
  Landmark,
  Truck,
  ShieldAlert,
  Settings,
  Receipt,
  CreditCard,
  Briefcase
} from "lucide-react";

export default function Sidebar({ 
  user,
  activeTab, 
  onTabSelect, 
  onLogout,
  isOpen = false,
  onClose
}) {
  const isMasterTab = [
    "sales-customers", 
    "suppliers", 
    "sales-products"
  ].includes(activeTab);

  const isDistributionTab = [
    "sales-orders", 
    "sales-schemes", 
    "sales-routes", 
    "sales-areas", 
    "sales-salesmen", 
    "sales-assignments",
    "delivery",
    "exceptions",
    "approvals",
    "reports"
  ].includes(activeTab);

  const [mastersExpanded, setMastersExpanded] = useState(isMasterTab);
  const [distributionExpanded, setDistributionExpanded] = useState(isDistributionTab);

  // Auto-expand accordion if user lands on sub-tab
  useEffect(() => {
    if (isMasterTab) setMastersExpanded(true);
    if (isDistributionTab) setDistributionExpanded(true);
  }, [activeTab]);

  const isTabActive = (tabId) => activeTab === tabId;

  const handleTabClick = (tabId) => {
    onTabSelect(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside 
        className={`sidebar-responsive-aside ${isOpen ? "open" : ""}`}
        style={{
          width: "256px",
          minWidth: "256px",
          maxWidth: "256px",
          background: "var(--bg-card, #ffffff)",
          borderRight: "1px solid var(--border-card, #e2e8f0)",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          zIndex: 90,
          userSelect: "none"
        }}
      >
        <style>{`
          .sidebar-nav-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
          }
          .sidebar-nav-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-nav-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-nav-scroll::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.28);
            border-radius: 4px;
          }
          .sidebar-nav-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.5);
          }

          .sidebar-item-btn {
            display: flex;
            align-items: center;
            gap: 9px;
            width: 100%;
            padding: 6.5px 10px;
            border-radius: 7px;
            border: 1px solid transparent;
            background: transparent;
            color: var(--text-muted, #475569);
            font-size: 0.81rem;
            font-weight: 500;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease-in-out;
            position: relative;
            line-height: 1.25;
          }

          .sidebar-item-btn:hover {
            background: var(--bg-card-hover, #f8fafc);
            color: var(--text-main, #0f172a);
          }

          .sidebar-item-btn.active {
            background: rgba(79, 70, 229, 0.08);
            border-color: rgba(79, 70, 229, 0.18);
            color: var(--primary-600, #4338ca);
            font-weight: 600;
          }

          .sidebar-item-btn.active .sidebar-icon-wrap {
            color: var(--primary-500, #4f46e5);
          }

          .sidebar-sub-btn {
            display: flex;
            align-items: center;
            justifyContent: space-between;
            width: 100%;
            padding: 5px 8px;
            border-radius: 6px;
            border: none;
            background: transparent;
            color: var(--text-dim, #64748b);
            font-size: 0.77rem;
            font-weight: 500;
            cursor: pointer;
            text-align: left;
            transition: all 0.14s ease;
            line-height: 1.2;
          }

          .sidebar-sub-btn:hover {
            background: var(--bg-card-hover, #f1f5f9);
            color: var(--text-main, #0f172a);
            padding-left: 11px;
          }

          .sidebar-sub-btn.active {
            background: rgba(79, 70, 229, 0.08);
            color: var(--primary-600, #4338ca);
            font-weight: 600;
          }

          .sidebar-kbd {
            font-family: var(--font-mono, monospace);
            font-size: 0.62rem;
            font-weight: 700;
            line-height: 1;
            padding: 2px 5px;
            border-radius: 4px;
            background: var(--bg-dark, #f1f5f9);
            border: 1px solid var(--border-card, #e2e8f0);
            color: var(--text-dim, #64748b);
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
            margin-left: auto;
          }

          .sidebar-item-btn.active .sidebar-kbd {
            background: #ffffff;
            border-color: rgba(79, 70, 229, 0.35);
            color: var(--primary-600, #4338ca);
          }

          .sidebar-tag {
            font-size: 0.62rem;
            font-weight: 700;
            padding: 1.5px 5px;
            border-radius: 4px;
            margin-left: auto;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }

          .tag-debtor {
            background: rgba(59, 130, 246, 0.1);
            color: #2563eb;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }

          .tag-creditor {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }
        `}</style>

        {/* ── 1. Top Brand Header (flex-shrink: 0, ALWAYS LOCKED AT TOP) ── */}
        <div style={{
          padding: "13px 16px",
          borderBottom: "1px solid var(--border-card, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#ffffff",
          flexShrink: 0
        }}>
          {/* Logo Mark */}
          <div style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 3px 8px rgba(79, 70, 229, 0.25)",
            flexShrink: 0
          }}>
            <Boxes size={18} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: "0.9rem", 
              fontWeight: "800", 
              color: "var(--text-main, #0f172a)", 
              letterSpacing: "-0.01em", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              lineHeight: 1.2
            }}>
              DISTRIBUTOR ERP
            </div>
            <div style={{ 
              fontSize: "0.68rem", 
              color: "var(--text-muted, #64748b)", 
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "1px"
            }}>
              <span style={{ 
                width: "5px", 
                height: "5px", 
                borderRadius: "50%", 
                background: "#10b981", 
                display: "inline-block" 
              }} />
              <span>Tally Prime Billing Engine</span>
            </div>
          </div>

          {/* Close button for Mobile Drawer (Hidden on Desktop) */}
          {onClose && (
            <button
              onClick={onClose}
              className="mobile-nav-toggle-btn"
              style={{
                width: "28px",
                height: "28px",
                padding: 0,
                borderRadius: "6px",
                border: "1px solid var(--border-card, #e2e8f0)",
                background: "transparent",
                color: "var(--text-dim, #64748b)",
                cursor: "pointer"
              }}
              title="Close navigation"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── 2. Scrollable Middle Navigation (flex: 1, minHeight: 0) ── */}
        <div 
          className="sidebar-nav-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "8px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "1px"
          }}
        >

          {/* 1. DASHBOARD */}
          <div style={{ padding: "4px 8px 2px 8px" }}>
            <span style={{
              fontSize: "0.64rem",
              fontWeight: "700",
              letterSpacing: "0.06em",
              color: "var(--text-dim, #94a3b8)",
              textTransform: "uppercase"
            }}>
              Main Menu
            </span>
          </div>

          <button
            onClick={() => handleTabClick("overview")}
            className={`sidebar-item-btn ${isTabActive("overview") ? "active" : ""}`}
            title="Overview & Command Center"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <LayoutDashboard size={16} />
            </div>
            <span>Dashboard</span>
          </button>

          {/* 2. MASTERS ACCORDION (Customers / Debtors, Suppliers / Creditors, Stock Items / Products) */}
          <div>
            <button
              onClick={() => setMastersExpanded(!mastersExpanded)}
              className="sidebar-item-btn"
              style={{
                justifyContent: "space-between",
                background: isMasterTab ? "rgba(79, 70, 229, 0.05)" : "transparent"
              }}
              title="Masters (Debtors, Creditors, Stock Items)"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <Compass size={16} style={{ color: isMasterTab ? "var(--primary-500, #4f46e5)" : "inherit" }} />
                <span>Masters</span>
              </div>
              <ChevronDown 
                size={14} 
                style={{ 
                  transform: mastersExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.18s ease"
                }} 
              />
            </button>

            {mastersExpanded && (
              <div style={{
                marginLeft: "18px",
                paddingLeft: "8px",
                borderLeft: "1.5px solid var(--border-card, #e2e8f0)",
                marginTop: "2px",
                marginBottom: "3px",
                display: "flex",
                flexDirection: "column",
                gap: "1px"
              }}>
                <button
                  onClick={() => handleTabClick("sales-customers")}
                  className={`sidebar-sub-btn ${isTabActive("sales-customers") ? "active" : ""}`}
                  title="Retail Outlets & Sundry Debtors"
                >
                  <span>Customers (Debtors)</span>
                </button>
                <button
                  onClick={() => handleTabClick("suppliers")}
                  className={`sidebar-sub-btn ${isTabActive("suppliers") ? "active" : ""}`}
                  title="Distributors & Sundry Creditors"
                >
                  <span>Suppliers (Creditors)</span>
                </button>
                <button
                  onClick={() => handleTabClick("sales-products")}
                  className={`sidebar-sub-btn ${isTabActive("sales-products") ? "active" : ""}`}
                  title="Product Items & HSN Tax Masters"
                >
                  <span>Stock Items Master</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. SALES (F8) */}
          <button
            onClick={() => handleTabClick("sales-bills")}
            className={`sidebar-item-btn ${isTabActive("sales-bills") ? "active" : ""}`}
            title="Sales Invoices & Billing (Tally F8)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <FileText size={16} />
            </div>
            <span>Sales</span>
            <kbd className="sidebar-kbd">F8</kbd>
          </button>

          {/* 4. PURCHASE (F9) */}
          <button
            onClick={() => handleTabClick("purchases")}
            className={`sidebar-item-btn ${isTabActive("purchases") ? "active" : ""}`}
            title="Purchase Inward Vouchers (Tally F9)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <PackagePlus size={16} />
            </div>
            <span>Purchase</span>
            <kbd className="sidebar-kbd">F9</kbd>
          </button>

          {/* 5. RECEIPT (F6) */}
          <button
            onClick={() => handleTabClick("col-payments")}
            className={`sidebar-item-btn ${isTabActive("col-payments") ? "active" : ""}`}
            title="Customer Payment Receipts & Collections (Tally F6)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Receipt size={16} />
            </div>
            <span>Receipt</span>
            <kbd className="sidebar-kbd">F6</kbd>
          </button>

          {/* 6. PAYMENT (F5) */}
          <button
            onClick={() => handleTabClick("supplier-payments")}
            className={`sidebar-item-btn ${isTabActive("supplier-payments") ? "active" : ""}`}
            title="Supplier Payments & Cash-Bank Outflow (Tally F5)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <CreditCard size={16} />
            </div>
            <span>Payment</span>
            <kbd className="sidebar-kbd">F5</kbd>
          </button>

          {/* 7. PARTY LEDGER */}
          <button
            onClick={() => handleTabClick("ledger")}
            className={`sidebar-item-btn ${isTabActive("ledger") ? "active" : ""}`}
            title="Statement of Accounts (Dr/Cr Running Ledger - F4)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <BookOpen size={16} />
            </div>
            <span>Party Ledger</span>
            <kbd className="sidebar-kbd">F4</kbd>
          </button>

          {/* 8. INVENTORY */}
          <button
            onClick={() => handleTabClick("inventory")}
            className={`sidebar-item-btn ${isTabActive("inventory") ? "active" : ""}`}
            title="Warehouse Stock Levels & Movements"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Boxes size={16} />
            </div>
            <span>Inventory</span>
          </button>

          {/* 9. DAY BOOK */}
          <button
            onClick={() => handleTabClick("daybook")}
            className={`sidebar-item-btn ${isTabActive("daybook") ? "active" : ""}`}
            title="Daily Transaction Register (Day Book)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Calendar size={16} />
            </div>
            <span>Day Book</span>
          </button>

          {/* 10. TRIAL BALANCE */}
          <button
            onClick={() => handleTabClick("trial-balance")}
            className={`sidebar-item-btn ${isTabActive("trial-balance") ? "active" : ""}`}
            title="Trial Balance (Balanced Debit vs Credit Statement)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Scale size={16} />
            </div>
            <span>Trial Balance</span>
          </button>

          {/* 11. PROFIT & LOSS */}
          <button
            onClick={() => handleTabClick("profit-loss")}
            className={`sidebar-item-btn ${isTabActive("profit-loss") ? "active" : ""}`}
            title="Profit & Loss Account (Revenue, COGS, Margins)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <TrendingUp size={16} />
            </div>
            <span>Profit & Loss</span>
          </button>

          {/* 12. BALANCE SHEET */}
          <button
            onClick={() => handleTabClick("balance-sheet")}
            className={`sidebar-item-btn ${isTabActive("balance-sheet") ? "active" : ""}`}
            title="Balance Sheet (Assets = Liabilities + Equity)"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Landmark size={16} />
            </div>
            <span>Balance Sheet</span>
          </button>

          {/* 13. SETTINGS */}
          <button
            onClick={() => handleTabClick("settings")}
            className={`sidebar-item-btn ${isTabActive("settings") ? "active" : ""}`}
            title="Company Profile, GST & Database Engine Settings"
          >
            <div className="sidebar-icon-wrap" style={{ display: "flex", alignItems: "center" }}>
              <Settings size={16} />
            </div>
            <span>Settings</span>
          </button>

          {/* ── OPTIONAL DISTRIBUTION SECTION (FMCG OPERATIONS) ── */}
          <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-card, #e2e8f0)", paddingTop: "8px" }}>
            <button
              onClick={() => setDistributionExpanded(!distributionExpanded)}
              className="sidebar-item-btn"
              style={{
                justifyContent: "space-between",
                background: isDistributionTab ? "rgba(79, 70, 229, 0.05)" : "transparent"
              }}
              title="FMCG Distribution, Salesmen, Delivery & Field Operations"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <Briefcase size={16} style={{ color: isDistributionTab ? "var(--primary-500, #4f46e5)" : "inherit" }} />
                <span style={{ fontWeight: "700" }}>Distribution</span>
              </div>
              <ChevronDown 
                size={14} 
                style={{ 
                  transform: distributionExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.18s ease"
                }} 
              />
            </button>

            {distributionExpanded && (
              <div style={{
                marginLeft: "18px",
                paddingLeft: "8px",
                borderLeft: "1.5px solid var(--border-card, #e2e8f0)",
                marginTop: "2px",
                marginBottom: "3px",
                display: "flex",
                flexDirection: "column",
                gap: "1px"
              }}>
                <button
                  onClick={() => handleTabClick("sales-orders")}
                  className={`sidebar-sub-btn ${isTabActive("sales-orders") ? "active" : ""}`}
                  title="Field Salesman Booked Orders"
                >
                  <span>Sales Orders</span>
                </button>
                <button
                  onClick={() => handleTabClick("sales-schemes")}
                  className={`sidebar-sub-btn ${isTabActive("sales-schemes") ? "active" : ""}`}
                  title="Trade Schemes & Discounts"
                >
                  <span>Schemes Master</span>
                </button>
                <button
                  onClick={() => handleTabClick("sales-salesmen")}
                  className={`sidebar-sub-btn ${isTabActive("sales-salesmen") ? "active" : ""}`}
                  title="Field Salesmen & Order Bookers"
                >
                  <span>Salesmen Master</span>
                </button>
                <button
                  onClick={() => handleTabClick("sales-routes")}
                  className={`sidebar-sub-btn ${isTabActive("sales-routes") ? "active" : ""}`}
                  title="Routes & Beat Plan"
                >
                  <span>Routes & Beats</span>
                </button>
                <button
                  onClick={() => handleTabClick("sales-assignments")}
                  className={`sidebar-sub-btn ${isTabActive("sales-assignments") ? "active" : ""}`}
                  title="Beat Assignments to Salesmen"
                >
                  <span>Beat Assignments</span>
                </button>
                <button
                  onClick={() => handleTabClick("delivery")}
                  className={`sidebar-sub-btn ${isTabActive("delivery") ? "active" : ""}`}
                  title="Delivery Fleet, Dispatch & Runsheets"
                >
                  <span>Delivery & Fleet</span>
                </button>
                <button
                  onClick={() => handleTabClick("exceptions")}
                  className={`sidebar-sub-btn ${isTabActive("exceptions") ? "active" : ""}`}
                  title="Exception Control Tower"
                >
                  <span>Exceptions Tower</span>
                </button>
                <button
                  onClick={() => handleTabClick("reports")}
                  className={`sidebar-sub-btn ${isTabActive("reports") ? "active" : ""}`}
                  title="Executive Analytics & Sales Reports"
                >
                  <span>Executive Reports</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── 3. Bottom Status Bar (flex-shrink: 0, ALWAYS LOCKED AT BOTTOM) ── */}
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--border-card, #e2e8f0)",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          flexShrink: 0
        }}>
          {/* Workstation Status Badge */}
          <div style={{
            background: "var(--bg-card-hover, #f8fafc)",
            border: "1px solid var(--border-card, #e2e8f0)",
            borderRadius: "7px",
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                display: "inline-block"
              }} />
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-main, #0f172a)" }}>
                  Tally Prime Engine
                </div>
                <div style={{ fontSize: "0.64rem", color: "var(--text-dim, #64748b)" }}>
                  Atlas Cloud Connected
                </div>
              </div>
            </div>
            <span style={{
              fontSize: "0.62rem",
              fontWeight: "700",
              color: "#059669",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              padding: "1.5px 5px",
              borderRadius: "4px"
            }}>
              LIVE
            </span>
          </div>

          {/* Quick Shortcuts Info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.65rem",
            color: "var(--text-dim, #94a3b8)",
            padding: "0 2px"
          }}>
            <span>Keys:</span>
            <span>
              <strong style={{ color: "var(--text-muted)" }}>F8</strong> Sales • <strong style={{ color: "var(--text-muted)" }}>F9</strong> Purchase • <strong style={{ color: "var(--text-muted)" }}>F4</strong> Ledger
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}
