import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Route as RouteIcon,
  Phone,
  Mail,
  Calendar,
  Layers
} from "lucide-react";

export default function SalesmanList({ 
  token, 
  userRole = "SUPER_ADMIN", 
  onOpenAddModal, 
  onOpenEditModal, 
  onOpenRouteAssignModal,
  onToggleStatus 
}) {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const canModify = ["SUPER_ADMIN", "ADMIN", "SALES_MANAGER"].includes(userRole);

  const fetchSalesmen = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        status: statusFilter
      });

      const response = await fetch(`http://localhost:5005/api/salesmen?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setSalesmen(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setError(json.message || "Failed to load salesmen.");
      }
    } catch (err) {
      console.error("Fetch salesmen error:", err);
      setError("Unable to connect to Salesman API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSalesmen();
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
              Salesman & DSR Master
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
              {totalRecords} Field Reps
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
            Field sales team roster, employee credentials, and active route assignments
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
            <span>Add Salesman</span>
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
          flex: "1 1 280px",
          minWidth: "240px"
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
            placeholder="Search by code, name, mobile, employee ID..."
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
                Code / Emp ID
              </th>
              <th style={{ minWidth: "200px", padding: "12px 14px" }}>
                Sales Representative
              </th>
              <th style={{ width: "160px", padding: "12px 14px" }}>
                Contact Info
              </th>
              <th style={{ width: "220px", padding: "12px 14px" }}>
                Assigned Beats
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
                  <td colSpan={canModify ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading field sales representatives...
                  </td>
                </tr>
              ) : salesmen.length === 0 ? (
                <tr>
                  <td colSpan={canModify ? 6 : 5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No salesmen found.
                  </td>
                </tr>
              ) : (
                salesmen.map((sm) => (
                  <tr 
                    key={sm.id} 
                    style={{ 
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background 0.15s ease"
                    }}
                  >
                    {/* Code & Emp */}
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.875rem", fontFamily: "monospace", fontWeight: "700", color: "var(--primary-400)" }}>
                        {sm.salesmanCode}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Emp: {sm.employeeCode}
                      </div>
                    </td>

                    {/* Name */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))",
                          color: "var(--primary-400)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "0.9rem",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          flexShrink: 0
                        }}>
                          {sm.name ? sm.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem" }}>
                            {sm.name}
                          </span>
                          {sm.userId && (
                            <span style={{
                              marginLeft: "8px",
                              fontSize: "0.7rem",
                              background: "rgba(16, 185, 129, 0.1)",
                              color: "#34d399",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: "600"
                            }}>
                              Auth Linked
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)" }}>
                          <Phone size={13} style={{ color: "var(--primary-400)" }} />
                          <span>{sm.mobile}</span>
                        </div>
                        {sm.email && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Mail size={13} />
                            <span>{sm.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Assigned Beats */}
                    <td style={{ padding: "11px 14px" }}>
                      {sm.assignedRoutes && sm.assignedRoutes.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "240px" }}>
                          {sm.assignedRoutes.map((rt) => (
                            <span 
                              key={rt.id} 
                              style={{
                                fontSize: "0.75rem",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                background: "rgba(99, 102, 241, 0.1)",
                                color: "var(--primary-300)",
                                border: "1px solid rgba(99, 102, 241, 0.25)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <RouteIcon size={12} />
                              <span>{rt.routeName}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          No beats allocated
                        </span>
                      )}
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
                        background: sm.status === "ACTIVE" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: sm.status === "ACTIVE" ? "#34d399" : "#f87171",
                        border: `1px solid ${sm.status === "ACTIVE" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
                      }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: sm.status === "ACTIVE" ? "#10b981" : "#ef4444"
                        }} />
                        {sm.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {canModify && (
                      <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => onOpenRouteAssignModal(sm)}
                            title="Assign / Reallocate Routes"
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              background: "rgba(99, 102, 241, 0.1)",
                              color: "var(--primary-400)",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Layers size={14} />
                            <span>Beats</span>
                          </button>

                          <button
                            onClick={() => onOpenEditModal(sm)}
                            title="Edit Salesman"
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
                            onClick={() => onToggleStatus(sm)}
                            title={sm.status === "ACTIVE" ? "Deactivate Salesman" : "Activate Salesman"}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "none",
                              background: sm.status === "ACTIVE" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                              color: sm.status === "ACTIVE" ? "#f87171" : "#34d399",
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {sm.status === "ACTIVE" ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            <span>{sm.status === "ACTIVE" ? "Disable" : "Enable"}</span>
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
            Showing {salesmen.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} field reps
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
