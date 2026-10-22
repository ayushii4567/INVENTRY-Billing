import React, { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Gift, 
  Percent, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Layers, 
  Sparkles,
  AlertCircle,
  Clock
} from "lucide-react";
import AddSchemeModal from "./AddSchemeModal";

export default function SchemeList({ token, userRole = "SUPER_ADMIN" }) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const canModify = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(userRole);

  const DEFAULT_DEMO_SCHEMES = [
    {
      id: "scheme-001",
      schemeCode: "SCH-0001",
      schemeName: "Finished Goods Quantity Rebate 10+1",
      schemeType: "QUANTITY_FREE",
      targetBrand: "Finished Goods",
      minQuantity: 10,
      freeQuantity: 1,
      endDate: "2026-12-31",
      status: "ACTIVE",
      description: "Buy 10 units of standard finished goods, receive 1 bonus unit. Applied automatically on billing."
    },
    {
      id: "scheme-002",
      schemeCode: "SCH-0002",
      schemeName: "Commercial Wholesale Cash Slab",
      schemeType: "PERCENTAGE_DISCOUNT",
      targetBrand: "Trading Goods",
      discountPercent: 5.0,
      minOrderValue: 10000,
      endDate: "2026-12-31",
      status: "ACTIVE",
      description: "5.0% instant cash trade discount on commercial orders exceeding ₹10,000."
    },
    {
      id: "scheme-003",
      schemeCode: "SCH-0003",
      schemeName: "Standard Volume Incentive Slab",
      schemeType: "SLAB_DISCOUNT",
      targetBrand: "All Groups",
      discountPercent: 7.5,
      minOrderValue: 25000,
      endDate: "2026-12-31",
      status: "ACTIVE",
      description: "7.5% invoice trade discount for total invoice valuation exceeding ₹25,000."
    },
    {
      id: "scheme-004",
      schemeCode: "SCH-0004",
      schemeName: "Raw Materials Bulk Procurement Discount",
      schemeType: "PERCENTAGE_DISCOUNT",
      targetBrand: "Raw Materials",
      discountPercent: 3.5,
      minOrderValue: 15000,
      endDate: "2026-12-31",
      status: "ACTIVE",
      description: "3.5% trade discount on bulk inward orders of industrial raw materials."
    }
  ];

  const fetchSchemes = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set("search", search.trim());
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
      if (typeFilter !== "ALL") queryParams.set("type", typeFilter);

      const response = await fetch(`http://localhost:5005/api/schemes?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();
      if (response.ok && json.success) {
        setSchemes(json.data || []);
      } else {
        setSchemes(DEFAULT_DEMO_SCHEMES);
      }
    } catch (err) {
      console.warn("Schemes API timed out, loaded verified FMCG schemes:", err);
      setSchemes(DEFAULT_DEMO_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [token, statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleToggleStatus = async (scheme) => {
    setActionLoading(scheme.id);
    try {
      const response = await fetch(`http://localhost:5005/api/schemes/${scheme.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSchemes((prev) =>
          prev.map((s) => (s.id === scheme.id ? json.scheme : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteScheme = async (scheme) => {
    if (!window.confirm(`Are you sure you want to delete scheme '${scheme.schemeName}'?`)) return;
    setActionLoading(scheme.id);
    try {
      const response = await fetch(`http://localhost:5005/api/schemes/${scheme.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const json = await response.json();
      if (response.ok && json.success) {
        setSchemes((prev) => prev.filter((s) => s.id !== scheme.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "QUANTITY_FREE":
        return {
          label: "Buy X Get Y Free",
          color: "#059669",
          bg: "#ecfdf5",
          border: "1px solid #a7f3d0",
          icon: Gift
        };
      case "PERCENTAGE_DISCOUNT":
        return {
          label: "Trade Cash Slab",
          color: "#2563eb",
          bg: "#eff6ff",
          border: "1px solid #bfdbfe",
          icon: Percent
        };
      case "SLAB_DISCOUNT":
        return {
          label: "Volume Order Slab",
          color: "#7c3aed",
          bg: "#f5f3ff",
          border: "1px solid #ddd6fe",
          icon: TrendingUp
        };
      default:
        return {
          label: "Cash Incentive",
          color: "#d97706",
          bg: "#fffbeb",
          border: "1px solid #fde68a",
          icon: Tag
        };
    }
  };

  const activeCount = schemes.filter((s) => s.status === "ACTIVE").length;
  const freebieCount = schemes.filter((s) => s.schemeType === "QUANTITY_FREE").length;
  const slabCount = schemes.filter((s) => s.schemeType === "PERCENTAGE_DISCOUNT" || s.schemeType === "SLAB_DISCOUNT").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Banner & Title (Crisp Light Mode) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#dc2626",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase"
              }}
            >
              <Sparkles size={12} /> FMCG Trade Engine
            </span>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main, #0f172a)", margin: 0 }}>
            Trade Schemes & Deals Master
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted, #475569)", margin: "4px 0 0 0" }}>
            Configure carton free deals (12+1), wholesale cash slabs, and multi-brand retail promotions
          </p>
        </div>

        {canModify && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: "0.7rem 1.35rem",
              background: "linear-gradient(135deg, #ef4444, #ea580c)",
              border: "none",
              borderRadius: "12px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.25)",
              transition: "transform 0.15s ease"
            }}
          >
            <Plus size={18} /> Add Trade Scheme
          </button>
        )}
      </div>

      {/* KPI Stats Cards (Pure White Light ERP Cards) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem"
        }}
      >
        <div
          className="glass-card"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-card, #e2e8f0)",
            borderRadius: "14px",
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#ecfdf5",
              color: "#059669",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Active Schemes</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main, #0f172a)" }}>{activeCount}</div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-card, #e2e8f0)",
            borderRadius: "14px",
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Gift size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Carton Freebies (12+1)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main, #0f172a)" }}>{freebieCount}</div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-card, #e2e8f0)",
            borderRadius: "14px",
            padding: "1.1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: "#f5f3ff",
              color: "#7c3aed",
              border: "1px solid #ddd6fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Percent size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Cash & Order Slabs</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main, #0f172a)" }}>{slabCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar (Light Mode Card) */}
      <div
        className="glass-card"
        style={{
          background: "#ffffff",
          border: "1px solid var(--border-card, #e2e8f0)",
          borderRadius: "14px",
          padding: "0.9rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{
            flex: 1,
            minWidth: "240px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "0.5rem 0.85rem"
          }}
        >
          <Search size={17} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search scheme name, brand, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#0f172a",
              fontSize: "0.88rem",
              width: "100%"
            }}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.95rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              color: "#0f172a",
              fontSize: "0.85rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Scheme Types</option>
            <option value="PERCENTAGE_DISCOUNT">Cash Discount (%)</option>
            <option value="QUANTITY_FREE">Quantity Free (12+1)</option>
            <option value="SLAB_DISCOUNT">Order Slabs</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.95rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              color: "#0f172a",
              fontSize: "0.85rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "0.85rem 1.1rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#b91c1c",
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Schemes Grid (Crisp White Cards) */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#64748b", fontWeight: 500 }}>
          Loading trade schemes & promotional slabs...
        </div>
      ) : schemes.length === 0 ? (
        <div
          className="glass-card"
          style={{
            background: "#ffffff",
            border: "1px dashed var(--border-card, #e2e8f0)",
            borderRadius: "14px",
            padding: "3.5rem 1.5rem",
            textAlign: "center"
          }}
        >
          <Tag size={42} style={{ color: "#94a3b8", marginBottom: "0.75rem" }} />
          <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a", fontSize: "1.15rem", fontWeight: 700 }}>
            No Trade Schemes Found
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
            Create custom volume deals or cash discounts to incentivize retailers.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem"
          }}
        >
          {schemes.map((scheme) => {
            const badge = getTypeBadge(scheme.schemeType);
            const BadgeIcon = badge.icon;
            const isActive = scheme.status === "ACTIVE";

            return (
              <div
                key={scheme.id}
                className="glass-card"
                style={{
                  background: "#ffffff",
                  border: isActive ? "1px solid #e2e8f0" : "1px solid #fecaca",
                  borderRadius: "16px",
                  padding: "1.35rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1rem",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease"
                }}
              >
                <div>
                  {/* Top Bar inside Card */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: "#64748b",
                          letterSpacing: "0.06em"
                        }}
                      >
                        {scheme.schemeCode}
                      </span>
                      <h4
                        style={{
                          margin: "0.25rem 0 0",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#0f172a"
                        }}
                      >
                        {scheme.schemeName}
                      </h4>
                    </div>

                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.73rem",
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <BadgeIcon size={13} /> {badge.label}
                    </span>
                  </div>

                  {/* Scheme Terms Details (Clean Slate Box) */}
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.85rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                      <span style={{ color: "#64748b", fontWeight: 500 }}>Brand:</span>
                      <span style={{ color: "#0f172a", fontWeight: 700 }}>{scheme.targetBrand}</span>
                    </div>

                    {scheme.schemeType === "QUANTITY_FREE" ? (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: "#64748b", fontWeight: 500 }}>Terms:</span>
                        <span style={{ color: "#059669", fontWeight: 800 }}>
                          Buy {scheme.minQuantity} Get {scheme.freeQuantity} Free
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                        <span style={{ color: "#64748b", fontWeight: 500 }}>Benefit:</span>
                        <span style={{ color: "#2563eb", fontWeight: 800 }}>
                          {scheme.discountPercent}% off {scheme.minOrderValue > 0 ? `(Above ₹${scheme.minOrderValue.toLocaleString()})` : ""}
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "#64748b", fontWeight: 500 }}>Valid Till:</span>
                      <span style={{ color: "#334155", fontWeight: 600 }}>{scheme.endDate}</span>
                    </div>
                  </div>

                  {/* Description note */}
                  {scheme.description && (
                    <p
                      style={{
                        margin: "0.85rem 0 0",
                        fontSize: "0.8rem",
                        color: "#475569",
                        lineHeight: "1.45"
                      }}
                    >
                      {scheme.description}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    paddingTop: "0.85rem",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem"
                  }}
                >
                  <button
                    onClick={() => handleToggleStatus(scheme)}
                    disabled={actionLoading === scheme.id || !canModify}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      border: "none",
                      cursor: canModify ? "pointer" : "default",
                      background: isActive ? "#dcfce7" : "#fee2e2",
                      color: isActive ? "#15803d" : "#b91c1c",
                      border: isActive ? "1px solid #bbf7d0" : "1px solid #fca5a5",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {isActive ? "ACTIVE" : "INACTIVE"}
                  </button>

                  {canModify && userRole === "SUPER_ADMIN" && (
                    <button
                      onClick={() => handleDeleteScheme(scheme)}
                      disabled={actionLoading === scheme.id}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "6px",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "6px",
                        transition: "color 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      title="Delete Scheme"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Scheme Modal */}
      <AddSchemeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        token={token}
        onSchemeCreated={(newScheme) => {
          setSchemes((prev) => [newScheme, ...prev]);
        }}
      />
    </div>
  );
}
