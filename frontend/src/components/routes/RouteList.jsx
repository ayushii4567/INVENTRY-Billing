import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Route as RouteIcon, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Calendar,
  Filter
} from "lucide-react";

const DAY_LABELS = {
  MON: "M",
  TUE: "Tu",
  WED: "W",
  THU: "Th",
  FRI: "F",
  SAT: "Sa",
  SUN: "Su"
};

export default function RouteList({ 
  token, 
  userRole = "SUPER_ADMIN", 
  onOpenAddModal, 
  onOpenEditModal, 
  onToggleStatus 
}) {
  const [routes, setRoutes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const canModify = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(userRole);

  // Load area options for filter
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch("http://localhost:5005/api/areas?status=ACTIVE&limit=100", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setAreas(json.data);
        }
      } catch (e) {
        console.error("Error loading areas for filter:", e);
      }
    };
    fetchAreas();
  }, [token]);

  const fetchRoutes = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        status: statusFilter,
        areaId: areaFilter
      });

      const response = await fetch(`http://localhost:5005/api/routes?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setRoutes(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setError(json.message || "Failed to load routes.");
      }
    } catch (err) {
      console.error("Fetch routes error:", err);
      setError("Unable to connect to Route Master API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRoutes();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, areaFilter, statusFilter, page]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Route & Beat Master
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
              {totalRecords} Beats
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
            Define field sales delivery beats, scheduled visit days, and area allocations
          </p>
        </div>

        {canModify && (
          <button
            onClick={onOpenAddModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--primary-600)",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "0.875rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              transition: "all 0.2s ease"
            }}
          >
            <Plus size={18} />
            <span>Add Route / Beat</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{
        padding: "16px 20px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)"
      }}>
        {/* Search */}
        <div style={{
          position: "relative",
          flex: "1 1 240px",
          minWidth: "220px"
        }}>
          <Search size={18} style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)"
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by route code, beat name, area..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 42px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.875rem",
              outline: "none"
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Area Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={16} style={{ color: "var(--text-muted)" }} />
            <select
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="ALL">All Territories</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.areaName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-main)",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          padding: "14px 18px",
          borderRadius: "10px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="erp-table-container">
        <table className="erp-table" style={{ minWidth: "980px" }}>
          <thead>
            <tr>
              <th style={{ width: "120px", padding: "12px 14px" }}>
                Beat Code
              </th>
              <th style={{ minWidth: "200px", padding: "12px 14px" }}>
                Route / Beat Name
              </th>
              <th style={{ width: "180px", padding: "12px 14px" }}>
                Territory / Area
              </th>
              <th style={{ width: "210px", padding: "12px 14px" }}>
                Visit Days
              </th>
              <th style={{ width: "70px", padding: "12px 14px" }}>
                Seq
              </th>
              <th style={{ width: "110px", padding: "12px 14px" }}>
                Status
              </th>
              {canModify && (
                <th style={{ width: "210px", padding: "12px 14px", textAlign: "right" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canModify ? 7 : 6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading routes & beats...
                  </td>
                </tr>
              ) : routes.length === 0 ? (
                <tr>
                  <td colSpan={canModify ? 7 : 6} style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                    <RouteIcon size={44} color="var(--text-dim)" style={{ marginBottom: "12px" }} />
                    <h4 style={{ color: "var(--text-main)", marginBottom: "6px", fontSize: "1.05rem" }}>No Beat Routes Configured</h4>
                    <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px auto" }}>
                      {search || areaFilter !== "ALL" || statusFilter !== "ALL"
                        ? "No beat routes match your filter criteria. Try resetting search filters."
                        : "No beat routes found. Create a route to start scheduling salesman visits and customer deliveries."}
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
                        <span>Create Route</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                routes.map((rt) => (
                  <tr 
                    key={rt.id} 
                    style={{ 
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background 0.15s ease"
                    }}
                  >
                    {/* Code */}
                    <td style={{ padding: "11px 14px", fontSize: "0.85rem", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--primary-400)", whiteSpace: "nowrap" }}>
                      {rt.routeCode}
                    </td>

                    {/* Name */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "rgba(99, 102, 241, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary-400)",
                          flexShrink: 0
                        }}>
                          <RouteIcon size={16} />
                        </div>
                        <span style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.9rem" }}>
                          {rt.routeName}
                        </span>
                      </div>
                    </td>

                    {/* Area */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontSize: "0.85rem" }}>
                        <MapPin size={14} style={{ color: "var(--text-muted)" }} />
                        <span>{rt.areaName || "Unassigned Territory"}</span>
                      </div>
                    </td>

                    {/* Visit Days */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => {
                          const isActive = Array.isArray(rt.visitDays) && rt.visitDays.includes(day);
                          return (
                            <span 
                              key={day}
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: isActive ? "var(--primary-600)" : "var(--bg-secondary)",
                                color: isActive ? "#ffffff" : "var(--text-muted)",
                                border: isActive ? "none" : "1px solid var(--border-color)"
                              }}
                              title={day}
                            >
                              {DAY_LABELS[day]}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Sequence */}
                    <td style={{ padding: "16px 18px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      #{rt.sequence || 0}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: rt.status === "ACTIVE" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: rt.status === "ACTIVE" ? "#34d399" : "#f87171",
                        border: `1px solid ${rt.status === "ACTIVE" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
                      }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: rt.status === "ACTIVE" ? "#10b981" : "#ef4444"
                        }} />
                        {rt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {canModify && (
                      <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => onOpenEditModal(rt)}
                            title="Edit Route"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid var(--border-color)",
                              background: "var(--bg-secondary)",
                              color: "var(--text-main)",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => onToggleStatus(rt)}
                            title={rt.status === "ACTIVE" ? "Deactivate Route" : "Activate Route"}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "none",
                              background: rt.status === "ACTIVE" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                              color: rt.status === "ACTIVE" ? "#f87171" : "#34d399",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {rt.status === "ACTIVE" ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            <span>{rt.status === "ACTIVE" ? "Disable" : "Enable"}</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--table-header-bg)",
          fontSize: "0.85rem",
          color: "var(--text-muted)"
        }}>
          <div>
            Showing {routes.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} routes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: page <= 1 ? "transparent" : "var(--bg-secondary)",
                color: page <= 1 ? "var(--border-color)" : "var(--text-main)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span>Page {page} of {totalPages || 1}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: page >= totalPages ? "transparent" : "var(--bg-secondary)",
                color: page >= totalPages ? "var(--border-color)" : "var(--text-main)",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
  );
}
