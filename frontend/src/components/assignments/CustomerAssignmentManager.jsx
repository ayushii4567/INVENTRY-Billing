import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Route as RouteIcon, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  History,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Store
} from "lucide-react";

export default function CustomerAssignmentManager({ 
  token, 
  userRole = "SUPER_ADMIN", 
  onOpenAssignModal, 
  onOpenHistoryModal 
}) {
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [salesmanFilter, setSalesmanFilter] = useState("ALL");
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const canModify = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(userRole);

  // Load dropdown filter options
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [areasRes, routesRes, salesmenRes] = await Promise.all([
          fetch("http://localhost:5005/api/areas?status=ACTIVE&limit=100", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://localhost:5005/api/routes?status=ACTIVE&limit=100", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("http://localhost:5005/api/salesmen?status=ACTIVE&limit=100", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        const [areasJson, routesJson, salesmenJson] = await Promise.all([
          areasRes.json(),
          routesRes.json(),
          salesmenRes.json()
        ]);

        if (areasJson.success) setAreas(areasJson.data);
        if (routesJson.success) setRoutes(routesJson.data);
        if (salesmenJson.success) setSalesmen(salesmenJson.data);
      } catch (e) {
        console.error("Error loading lookups:", e);
      }
    };

    fetchLookups();
  }, [token]);

  const fetchAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        areaId: areaFilter,
        routeId: routeFilter,
        salesmanId: salesmanFilter,
        unassignedOnly: unassignedOnly ? "true" : "false"
      });

      const response = await fetch(`http://localhost:5005/api/assignments/customers?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setCustomers(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setError(json.message || "Failed to load customer assignments.");
      }
    } catch (err) {
      console.error("Fetch assignments error:", err);
      setError("Unable to connect to Customer Assignment API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAssignments();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, areaFilter, routeFilter, salesmanFilter, unassignedOnly, page]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Customer Beat & Salesman Assignment Engine
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
              {totalRecords} Outlets
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
            Real-time outlet mapping to delivery beats, territorial areas, and field representatives with full audit logs
          </p>
        </div>

        {/* Quick toggle for Unassigned accounts */}
        <button
          onClick={() => {
            setUnassignedOnly(prev => !prev);
            setPage(1);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: unassignedOnly ? "rgba(239, 68, 68, 0.15)" : "var(--bg-secondary)",
            color: unassignedOnly ? "#f87171" : "var(--text-muted)",
            border: unassignedOnly ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border-color)",
            padding: "9px 16px",
            borderRadius: "10px",
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <AlertTriangle size={16} />
          <span>{unassignedOnly ? "Showing Unassigned Only" : "Show Unassigned Outlets"}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{
        padding: "16px 20px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)"
      }}>
        {/* Search */}
        <div style={{
          position: "relative",
          flex: "1 1 240px",
          minWidth: "200px"
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
            placeholder="Search outlet, owner, code, mobile..."
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Area Filter */}
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
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Territories</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.areaName}</option>
            ))}
          </select>

          {/* Route Filter */}
          <select
            value={routeFilter}
            onChange={(e) => {
              setRouteFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Beats</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.routeName}</option>
            ))}
          </select>

          {/* Salesman Filter */}
          <select
            value={salesmanFilter}
            onChange={(e) => {
              setSalesmanFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "9px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Salesmen</option>
            {salesmen.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.salesmanCode})</option>
            ))}
          </select>
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
        <table className="erp-table" style={{ minWidth: "1000px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "240px" }}>Outlet Details</th>
              <th style={{ minWidth: "160px" }}>Territory / Area</th>
              <th style={{ minWidth: "160px" }}>Delivery Beat / Route</th>
              <th style={{ minWidth: "180px" }}>Assigned Representative</th>
              <th style={{ minWidth: "140px", textAlign: "center" }}>Assignment Status</th>
              <th style={{ minWidth: "120px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading customer beat assignments...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No outlets match the selected assignment filters.
                  </td>
                </tr>
              ) : (
                customers.map((cus) => {
                  const isUnassigned = !cus.salesmanId || !cus.routeId;
                  return (
                    <tr 
                      key={cus.id} 
                      style={{ 
                        background: isUnassigned ? "rgba(239, 68, 68, 0.04)" : undefined
                      }}
                    >
                      {/* Outlet */}
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: isUnassigned ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)",
                            color: isUnassigned ? "#f87171" : "var(--primary-400)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <Store size={16} />
                          </div>
                          <div>
                            <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                              {cus.shopName}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px", whiteSpace: "nowrap" }}>
                              <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{cus.customerCode}</span>
                              <span>•</span>
                              <span>{cus.ownerName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Area */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontSize: "0.82rem" }}>
                          <MapPin size={13} style={{ color: "var(--text-muted)" }} />
                          <span>{cus.areaName || "Unassigned"}</span>
                        </div>
                      </td>

                      {/* Route */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        {cus.routeId ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontSize: "0.82rem" }}>
                            <RouteIcon size={13} style={{ color: "var(--primary-400)" }} />
                            <span>{cus.routeName || cus.routeId}</span>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#f87171",
                            fontWeight: "600"
                          }}>
                            No Beat
                          </span>
                        )}
                      </td>

                      {/* Salesman */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        {cus.salesmanId ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "rgba(99, 102, 241, 0.15)",
                              color: "var(--primary-400)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.72rem",
                              fontWeight: "700"
                            }}>
                              {cus.salesmanName ? cus.salesmanName.charAt(0) : "S"}
                            </div>
                            <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--text-main)" }}>
                              {cus.salesmanName || cus.salesmanId}
                            </span>
                          </div>
                        ) : (
                          <span style={{
                            fontSize: "0.72rem",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#f87171",
                            fontWeight: "600"
                          }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "3px 9px",
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          background: isUnassigned ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                          color: isUnassigned ? "#f87171" : "#34d399",
                          border: `1px solid ${isUnassigned ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.25)"}`
                        }}>
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: isUnassigned ? "#ef4444" : "#10b981"
                          }} />
                          {isUnassigned ? "Action Needed" : "Active Allocation"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                          {canModify && (
                            <button
                              onClick={() => onOpenAssignModal(cus)}
                              title="Reassign Beat or Salesman"
                              className="btn-secondary"
                              style={{
                                padding: "5px 10px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <ArrowRightLeft size={13} />
                              <span>Reassign</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenHistoryModal(cus)}
                            title="View Assignment Audit History"
                            className="btn-secondary"
                            style={{
                              padding: "5px 10px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <History size={13} />
                            <span>Audit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            Showing {customers.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} outlets
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
