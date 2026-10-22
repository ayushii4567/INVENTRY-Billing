// frontend/src/components/demo/DemoGuide.jsx
import React from "react";
import { 
  Sparkles, 
  LayoutDashboard, 
  Store, 
  Package, 
  MapPin, 
  ShoppingBag, 
  Receipt, 
  Coins, 
  QrCode, 
  AlertTriangle, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Building2,
  Users
} from "lucide-react";

export default function DemoGuide({ onNavigateTab, onClose, isModal = false }) {
  const steps = [
    {
      step: 1,
      title: "Owner Command Center",
      badge: "Step 1 • Complete Control",
      badgeColor: "#6366f1",
      icon: LayoutDashboard,
      description: "Start at the central surveillance command tower. Monitor today's sales (₹14.85L), collections (₹11.40L), active bills (684), and real-time exceptions.",
      actions: [
        { label: "OPEN COMMAND CENTER", tab: "overview", primary: true }
      ]
    },
    {
      step: 2,
      title: "Customer & Product Masters",
      badge: "Step 2 • Business Foundation",
      badgeColor: "#10b981",
      icon: Store,
      description: "Explore the retail outlet network (Sharma General Store, Gupta Provision, New Horizon Mart, Sahu Kirana) and multi-brand catalogue across Nestlé, Patanjali, and GSK.",
      actions: [
        { label: "OPEN CUSTOMERS", tab: "sales-customers", primary: true },
        { label: "OPEN PRODUCTS", tab: "sales-products", primary: false }
      ]
    },
    {
      step: 3,
      title: "Routes, Beats & Salesman Allocation",
      badge: "Step 3 • Distribution Structure",
      badgeColor: "#3b82f6",
      icon: MapPin,
      description: "Inspect geographical territory mapping (Raipur Central, Tatibandh) and structured daily beats (Route A - Sadar, Route B - Model Town) allocated to field salesmen.",
      actions: [
        { label: "OPEN ROUTES & BEATS", tab: "sales-routes", primary: true },
        { label: "OPEN BEAT ASSIGNMENTS", tab: "sales-assignments", primary: false }
      ]
    },
    {
      step: 4,
      title: "Salesman Order Booking Engine",
      badge: "Step 4 • Field Sales Flow",
      badgeColor: "#f59e0b",
      icon: ShoppingBag,
      description: "Demonstrate mobile-responsive field order booking with real-time warehouse stock checks, credit limit verification, itemized discounts, and instant subtotal calculations.",
      actions: [
        { label: "OPEN ORDER BOOKING", tab: "sales-orders", primary: true }
      ]
    },
    {
      step: 5,
      title: "Billing & Invoice Engine",
      badge: "Step 5 • Order to Invoice",
      badgeColor: "#8b5cf6",
      icon: Receipt,
      description: "Convert confirmed customer orders into locked FMCG invoices with automatic inventory stock deductions, GST tax calculations, and printable invoice vouchers.",
      actions: [
        { label: "OPEN BILLING & INVOICES", tab: "sales-bills", primary: true }
      ]
    },
    {
      step: 6,
      title: "Payment Collection & Mapping",
      badge: "Step 6 • Multi-Channel Collection",
      badgeColor: "#10b981",
      icon: Coins,
      description: "Record payments via Cash, UPI, and Cheque. Map collected funds directly to outstanding invoices with real-time party ledger updates and zero hard deletion.",
      actions: [
        { label: "OPEN PAYMENT COLLECTIONS", tab: "col-payments", primary: true }
      ]
    },
    {
      step: 7,
      title: "UPI Suspense & Party Identification",
      badge: "Step 7 • Smart Reconciliation",
      badgeColor: "#6366f1",
      icon: QrCode,
      description: "Demonstrate handling unknown UPI credits arriving in the suspense queue. Show how the Owner or Finance team identifies the outlet and allocates funds to pending bills.",
      actions: [
        { label: "OPEN UPI SUSPENSE QUEUE", tab: "col-unmatched", primary: true }
      ]
    },
    {
      step: 8,
      title: "Exception & Approval Control Center",
      badge: "Step 8 • Owner Surveillance",
      badgeColor: "#ef4444",
      icon: AlertTriangle,
      description: "Display automatic surveillance alerts for stockouts (Patanjali Honey), 60+ days overdue bills (Sharma General Store), and side-by-side Before/After approval diffs.",
      actions: [
        { label: "OPEN EXCEPTION CONTROL", tab: "exceptions", primary: true },
        { label: "OPEN APPROVALS QUEUE", tab: "approvals", primary: false }
      ]
    },
    {
      step: 9,
      title: "Executive Reports & Business Insights",
      badge: "Step 9 • Commercial Health",
      badgeColor: "#ec4899",
      icon: FileSpreadsheet,
      description: "Review high-level executive analytics with 7-day revenue trend bars, payment channel mix (Cash 30%, UPI 45%, Cheque 25%), ageing spectrum, and top accounts leaderboard.",
      actions: [
        { label: "OPEN EXECUTIVE REPORTS", tab: "reports", primary: true }
      ]
    }
  ];

  const handleAction = (tab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    if (onClose) {
      onClose();
    }
  };

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Banner Header */}
      <div className="glass-card" style={{
        padding: "28px 32px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        position: "relative"
      }}>
        {isModal && onClose && (
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              cursor: "pointer"
            }}
          >
            <X size={18} />
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            color: "#ffffff",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              CLIENT DEMONSTRATION WORKFLOW
            </div>
            <h1 style={{ fontSize: "1.65rem", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>
              FMCG Distributor ERP • Guided Walkthrough
            </h1>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "800px", lineHeight: 1.6, margin: "12px 0 0 0" }}>
          This guided tour demonstrates how Distributor ERP manages its complete distribution network across <strong style={{ color: "var(--text-main)" }}>Nestlé, Patanjali & GSK</strong>:
          from Salesman Order Booking in the field to Billing, Payment Collections, Exception Surveillance and Owner Business Control.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "16px",
          padding: "10px 16px",
          background: "var(--bg-input)",
          borderRadius: "12px",
          border: "1px solid var(--border-card)",
          fontSize: "0.82rem",
          color: "var(--text-main)"
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>
            <strong>Connected ERP Architecture:</strong> Every step below links directly to live modules with verified test data.
          </span>
        </div>
      </div>

      {/* 9 Interactive Step Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
        {steps.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className="glass-card"
              style={{
                padding: "22px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
                borderLeft: `4px solid ${item.badgeColor}`,
                transition: "all 0.2s ease"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${item.badgeColor}18`,
                      color: item.badgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: item.badgeColor, fontWeight: "800", textTransform: "uppercase" }}>
                        {item.badge}
                      </div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid var(--border-card)" }}>
                {item.actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAction(act.tab)}
                    className={act.primary ? "btn-primary" : "btn-secondary"}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      background: act.primary ? item.badgeColor : undefined
                    }}
                  >
                    <span>{act.label}</span>
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "20px"
        }}>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
