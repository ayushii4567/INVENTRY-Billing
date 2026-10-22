import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { ApprovalStatusBadge, ApprovalTypeBadge } from "./ApprovalStatusBadge";

export default function ApprovalList({ token, onSelectApproval, initialStatusFilter = "ALL" }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (moduleFilter !== "ALL") params.append("module", moduleFilter);

      const res = await fetch(`http://localhost:5005/api/approvals?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setApprovals(json.data.approvals || []);
      }
    } catch (err) {
      console.error("Failed to fetch approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [token, statusFilter, typeFilter, moduleFilter]);

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      {/* Header Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        {/* Status Filter Buttons */}
        <div style={{ display: "flex", background: "var(--bg-input)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-card)" }}>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "var(--badge-brand-bg)" : "transparent",
                color: statusFilter === st ? "var(--primary-400)" : "var(--text-muted)",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-main)",
              fontSize: "0.8rem"
            }}
          >
            <option value="ALL">All Request Types</option>
            <option value="BILL_AMENDMENT">Bill Amendment</option>
            <option value="PAYMENT_CANCELLATION">Payment Cancel</option>
            <option value="STOCK_ADJUSTMENT">Stock Adjustment</option>
            <option value="CUSTOMER_CREDIT_OVERRIDE">Credit Override</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-main)",
              fontSize: "0.8rem"
            }}
          >
            <option value="ALL">All Modules</option>
            <option value="BILLING">Billing</option>
            <option value="PAYMENTS">Payments</option>
            <option value="ORDERS">Orders</option>
          </select>

          <button
            onClick={fetchApprovals}
            title="Refresh Approvals"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "8px",
              color: "var(--text-muted)",
              padding: "7px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          Loading approval requests...
        </div>
      ) : approvals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Requests Found</p>
          <p style={{ fontSize: "0.82rem" }}>All pending approval requests have been reviewed.</p>
        </div>
      ) : (
        <div className="erp-table-container">
          <table className="erp-table" style={{ minWidth: "980px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "180px" }}>Approval # & Title</th>
                <th style={{ minWidth: "120px" }}>Type</th>
                <th style={{ minWidth: "110px" }}>Module</th>
                <th style={{ minWidth: "140px" }}>Requested By</th>
                <th style={{ minWidth: "200px" }}>Reason</th>
                <th style={{ minWidth: "130px" }}>Submitted Date</th>
                <th style={{ minWidth: "110px" }}>Status</th>
                <th style={{ minWidth: "90px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((apr) => (
                <tr
                  key={apr.id || apr._id}
                  style={{
                    cursor: "pointer"
                  }}
                  onClick={() => onSelectApproval(apr)}
                >
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: "700", color: "var(--text-main)", marginBottom: "2px" }}>
                      {apr.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--primary-400)", fontFamily: "var(--font-mono, monospace)" }}>
                      {apr.approvalNumber}
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <ApprovalTypeBadge type={apr.approvalType} />
                  </td>

                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "var(--bg-input)",
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}
                    >
                      {apr.module}
                    </span>
                  </td>

                  <td style={{ padding: "11px 14px", color: "var(--text-main)", fontWeight: "600", whiteSpace: "nowrap" }}>
                    {apr.requestedByName}
                  </td>

                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {apr.reason}
                  </td>

                  <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                    {new Date(apr.requestedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>

                  <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                    <ApprovalStatusBadge status={apr.status} />
                  </td>

                  <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApproval(apr);
                      }}
                      className="btn-secondary"
                      style={{
                        padding: "5px 12px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <span>{apr.status === "PENDING" ? "Decide" : "View"}</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
