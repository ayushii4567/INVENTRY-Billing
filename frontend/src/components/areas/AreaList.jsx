import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Route as RouteIcon
} from "lucide-react";

export default function AreaList({ 
  token, 
  userRole = "SUPER_ADMIN", 
  onOpenAddModal, 
  onOpenEditModal, 
  onToggleStatus 
}) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const canModify = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(userRole);

  const fetchAreas = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        status: statusFilter
      });

      const response = await fetch(`http://localhost:5005/api/areas?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setAreas(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setError(json.message || "Failed to load areas.");
      }
    } catch (err) {
      console.error("Fetch areas error:", err);
      setError("Unable to connect to Area Master API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAreas();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, statusFilter, page]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Area Master
            </h2>
            <span style={{
              background: "var(--badge-brand-bg)",
              color: "var(--primary-400)",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}>
              {totalRecords} Territories
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Distribution zones, wholesale sectors, and market boundaries in Raipur
          </p>
        </div>

        {canModify && (
          <button
            onClick={onOpenAddModal}
            className="glow-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)"
            }}
          >
            <Plus size={18} />
            <span>Add Area</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="glass-card" style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px"
      }}>
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: "240px" }}>
          <Search size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search area name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              color: "var(--text-main)",
              borderRadius: "12px",
              padding: "10px 16px 10px 42px",
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              color: "var(--text-main)",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "0.85rem",
              outline: "none"
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading && (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--primary-400)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto"
            }} />
            <span>Loading Areas...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: "40px", textAlign: "center", color: "#fca5a5" }}>
            <AlertCircle size={32} style={{ marginBottom: "12px" }} />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && areas.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <MapPin size={44} color="var(--text-dim)" style={{ marginBottom: "12px" }} />
            <h4 style={{ color: "var(--text-main)", marginBottom: "6px", fontSize: "1.05rem" }}>No Operational Areas Defined</h4>
            <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px auto" }}>
              {search || statusFilter !== "ALL"
                ? "No operational areas match your filter criteria. Try resetting search filters."
                : "No delivery areas found. Create your first operational territory or city cluster to begin mapping beats."}
            </p>
            {onOpenAddModal && canModify && (
              <button
                onClick={onOpenAddModal}
                style={{
                  background: "var(--primary-600)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Plus size={16} />
                <span>Create Area</span>
              </button>
            )}
          </div>
        )}

        {!loading && !error && areas.length > 0 && (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "800px" }}>
              <thead>
                <tr>
                  <th style={{ width: "120px", padding: "12px 14px" }}>Area Code</th>
                  <th style={{ width: "220px", padding: "12px 14px" }}>Area Name</th>
                  <th style={{ minWidth: "220px", padding: "12px 14px" }}>Description</th>
                  <th style={{ width: "110px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "100px", padding: "12px 14px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((a) => {
                  const isActive = a.status === "ACTIVE";
                  return (
                    <tr key={a.id} className="table-row-hover">
                      <td style={{ padding: "11px 14px", fontWeight: "700", color: "var(--primary-400)", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: "var(--badge-brand-bg)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontFamily: "var(--font-mono)"
                        }}>
                          {a.areaCode}
                        </span>
                      </td>

                      <td style={{ padding: "11px 14px", fontWeight: "600", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <MapPin size={15} color="var(--primary-400)" />
                          <span>{a.areaName}</span>
                        </div>
                      </td>

                      <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        {a.description || "—"}
                      </td>

                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: isActive ? "#059669" : "#dc2626",
                          border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                          padding: "3px 9px",
                          borderRadius: "20px",
                          fontSize: "0.73rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isActive ? "#10b981" : "#ef4444" }} />
                          {a.status}
                        </span>
                      </td>

                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        {canModify && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            <button
                              onClick={() => onOpenEditModal(a)}
                              title="Edit Area"
                              style={{
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-card)",
                                color: "var(--text-muted)",
                                padding: "5px 8px",
                                borderRadius: "7px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => onToggleStatus(a)}
                              title={isActive ? "Deactivate Area" : "Activate Area"}
                              style={{
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-card)",
                                color: isActive ? "#f87171" : "#059669",
                                padding: "5px 8px",
                                borderRadius: "7px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              {isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && areas.length > 0 && (
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            background: "var(--table-header-bg)"
          }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Showing <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{areas.length}</span> of <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{totalRecords}</span> territories
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  color: page <= 1 ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  cursor: page <= 1 ? "not-allowed" : "pointer"
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  color: page >= totalPages ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  cursor: page >= totalPages ? "not-allowed" : "pointer"
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
