import React, { useState } from "react";
import { 
  ArrowLeft, 
  Package, 
  Building2, 
  Tag, 
  Layers, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Boxes, 
  Truck, 
  FileCheck2, 
  RotateCcw,
  Sparkles,
  Percent,
  Clock,
  ShieldCheck,
  Info
} from "lucide-react";

export default function ProductDetails({ 
  product, 
  onBack, 
  onOpenEditModal, 
  onOpenStatusModal, 
  userRole = "SUPER_ADMIN" 
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview");

  const canModify = userRole !== "SALESMAN";
  const isActive = product.status === "ACTIVE";

  const getCompanyBadge = (companyId, companyName) => {
    const id = (companyId || "").toUpperCase();
    const name = (companyName || "").toUpperCase();

    if (id.includes("FINISHED") || name.includes("FINISHED")) {
      return { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
    }
    if (id.includes("TRADING") || name.includes("TRADING")) {
      return { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
    }
    if (id.includes("RAW") || name.includes("RAW")) {
      return { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    }
    if (id.includes("CONSUMABLE") || name.includes("CONSUMABLE")) {
      return { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
    }
    return { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "rgba(14, 165, 233, 0.3)" };
  };

  const companyStyle = getCompanyBadge(product.companyId, product.companyName);

  // Margin calculation (for informative display)
  const marginAmt = product.saleRate - product.purchaseRate;
  const marginPercent = product.saleRate > 0 ? ((marginAmt / product.saleRate) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            color: "var(--text-main)",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Product List</span>
        </button>

        {canModify && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => onOpenEditModal(product)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-main)",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <Edit3 size={15} />
              <span>Edit Product</span>
            </button>

            <button
              onClick={() => onOpenStatusModal(product)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: isActive ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                border: `1px solid ${isActive ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                color: isActive ? "#f87171" : "#34d399",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {isActive ? (
                <>
                  <AlertTriangle size={15} />
                  <span>Deactivate Product</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Activate Product</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="glass-card" style={{ padding: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)"
            }}>
              <Package size={32} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
                  {product.productName}
                </h2>
                <span style={{
                  background: companyStyle.bg,
                  color: companyStyle.color,
                  border: `1px solid ${companyStyle.border}`,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700"
                }}>
                  {product.companyName}
                </span>
                <span style={{
                  background: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: isActive ? "#34d399" : "#f87171",
                  border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isActive ? "#10b981" : "#ef4444" }} />
                  {product.status}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "0.85rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "monospace", color: "var(--primary-400)", fontWeight: "700" }}>
                  Code: {product.productCode}
                </span>
                <span>•</span>
                <span style={{ fontFamily: "monospace" }}>SKU: {product.sku}</span>
                <span>•</span>
                <span style={{ fontFamily: "monospace", color: "var(--text-main)" }}>HSN: {product.hsnCode || "84713010"}</span>
                <span>•</span>
                <span>Category: {product.category}</span>
                {product.subcategory && (
                  <>
                    <span>•</span>
                    <span>{product.subcategory}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-card)",
            borderRadius: "14px",
            padding: "16px 24px",
            textAlign: "right"
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Standard Sale Rate
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#10b981" }}>
              ₹{product.saleRate.toFixed(2)}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", textDecoration: product.mrp > product.saleRate ? "line-through" : "none" }}>
              MRP: ₹{product.mrp.toFixed(2)} ({product.unit})
            </div>
          </div>

        </div>
      </div>

      {/* Future-Module Tab Bar */}
      <div style={{
        display: "flex",
        gap: "6px",
        background: "var(--bg-card)",
        padding: "6px",
        borderRadius: "14px",
        border: "1px solid var(--border-card)",
        overflowX: "auto"
      }}>
        {[
          { id: "overview", label: "Product Overview", icon: Info },
          { id: "orders", label: "Order History", icon: Package, badge: "Phase 6" },
          { id: "bills", label: "Billing & Invoices", icon: FileCheck2, badge: "Phase 7" },
          { id: "returns", label: "Returns / Replacements", icon: RotateCcw, badge: "Phase 8" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: isSelected ? "var(--badge-brand-bg)" : "transparent",
                color: isSelected ? "var(--primary-400)" : "var(--text-muted)",
                fontWeight: isSelected ? "700" : "500",
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: "0.68rem",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  background: "var(--bg-input)",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border-card)"
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeSubTab === "overview" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* Left Column: Commercial Specs & Pricing */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Tag size={18} color="var(--primary-400)" />
              <span>Commercial & Pricing Structure</span>
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Maximum Retail Price (MRP)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>₹{product.mrp.toFixed(2)}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Purchase / Inward Rate</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)" }}>₹{product.purchaseRate.toFixed(2)}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Distributor Sale Rate</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#10b981" }}>₹{product.saleRate.toFixed(2)}</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Applicable Tax (GST)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary-400)" }}>{product.taxRate}%</div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Gross Unit Margin</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: marginAmt >= 0 ? "#10b981" : "#f87171" }}>
                  ₹{marginAmt.toFixed(2)} ({marginPercent}%)
                </div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Default Scheme Discount</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>{product.discount}%</div>
              </div>
            </div>

            {product.description && (
              <div style={{ marginTop: "20px", padding: "14px", background: "var(--bg-input)", borderRadius: "12px", border: "1px solid var(--border-card)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "600" }}>Description / Catalog Notes</div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: 1.5, margin: 0 }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Packaging, Inventory & Audit Specs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Packaging & Tracking Flags */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Package size={18} color="var(--primary-400)" />
                <span>Packaging & Product Rules</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-card)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Unit of Measurement:</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{product.unit}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-card)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Pack Size Specification:</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>{product.packSize || "Standard"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-card)" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Batch Tracking Enabled:</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: product.batchTracking ? "#10b981" : "var(--text-dim)" }}>
                    {product.batchTracking ? "✓ YES (Active)" : "✗ NO"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Expiry Tracking Enabled:</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: product.expiryTracking ? "#10b981" : "var(--text-dim)" }}>
                    {product.expiryTracking ? "✓ YES (Active)" : "✗ NO"}
                  </span>
                </div>
              </div>
            </div>

            {/* Audit Metadata */}
            <div className="glass-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div>Created By: <strong style={{ color: "var(--text-main)" }}>{product.createdBy || "system"}</strong> on {new Date(product.createdAt).toLocaleString()}</div>
                <div>Last Updated By: <strong style={{ color: "var(--text-main)" }}>{product.updatedBy || "system"}</strong> on {new Date(product.updatedAt).toLocaleString()}</div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Future Module Placeholder */
        <div className="glass-card" style={{ padding: "80px 40px", textAlign: "center", color: "var(--text-muted)" }}>
          <Package size={48} color="var(--text-dim)" style={{ marginBottom: "16px" }} />
          <h3 style={{ color: "var(--text-main)", marginBottom: "8px", fontSize: "1.2rem" }}>
            {activeSubTab.toUpperCase()} Module Integration
          </h3>
          <p style={{ maxWidth: "480px", margin: "0 auto", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Order history and invoice transactions for this SKU are synchronized with real-time billing. Historical transaction integrity is guaranteed.
          </p>
          <div style={{
            display: "inline-block",
            marginTop: "20px",
            background: "var(--badge-brand-bg)",
            color: "var(--primary-400)",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: "700",
            border: "1px solid rgba(99, 102, 241, 0.3)"
          }}>
            Status: Architecture Ready
          </div>
        </div>
      )}

    </div>
  );
}
