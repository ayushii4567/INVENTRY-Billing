import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Edit3, 
  Receipt, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Banknote
} from "lucide-react";
import AddSupplierModal from "./AddSupplierModal";
import RecordSupplierPaymentModal from "../payments/RecordSupplierPaymentModal";

export default function SupplierList({ 
  token, 
  onSelectSupplier, 
  onCreatePurchaseForSupplier, 
  onViewSupplierLedger 
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingSupplier, setPayingSupplier] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`http://localhost:5005/api/suppliers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuppliers(json.data || []);
      } else {
        setError(json.message || "Failed to load suppliers");
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      setError("Unable to connect to suppliers service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, statusFilter, token]);

  const totalPayable = suppliers.reduce((sum, s) => sum + (Number(s.currentBalance) || 0), 0);
  const activeCount = suppliers.filter((s) => s.status === "ACTIVE").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "#10b981",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "14px",
          fontWeight: "700",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
          zIndex: 2000
        }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Top Header Card */}
      <div className="glass-card" style={{
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Building2 size={24} color="var(--primary-400)" />
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Suppliers Master (Sundry Creditors)
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
            Manage manufacturing companies, distributors, and purchase credit accounts
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => {
              setPayingSupplier(null);
              setIsPayModalOpen(true);
            }}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              color: "#ef4444",
              borderColor: "rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)"
            }}
            title="Record Supplier Payment Voucher (F5)"
          >
            <Banknote size={18} />
            <span>Pay Supplier (F5)</span>
          </button>

          <button
            onClick={() => {
              setEditingSupplier(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
          >
            <Plus size={18} />
            <span>+ Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "18px 22px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
            Total Suppliers
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
            {suppliers.length}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#10b981", marginTop: "4px" }}>
            ● {activeCount} Active accounts
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px 22px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
            Total Payables (Amount We Owe)
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>
            ₹{totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Sundry Creditors balance
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search suppliers by name, code, contact, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: "36px" }}
          />
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "ACTIVE", "INACTIVE"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "var(--badge-brand-bg)" : "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: statusFilter === st ? "var(--primary-400)" : "var(--text-muted)",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: statusFilter === st ? "700" : "500",
                cursor: "pointer"
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={fetchSuppliers}
          className="btn-secondary"
          style={{ padding: "8px 14px" }}
          title="Refresh suppliers"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading Suppliers...
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
            ⚠️ {error}
          </div>
        ) : suppliers.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            <Building2 size={40} style={{ opacity: 0.4, marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Suppliers Found</p>
            <p style={{ margin: "4px 0 16px", fontSize: "0.85rem" }}>Add your first manufacturer / company account to record inward purchases.</p>
            <button
              onClick={() => {
                setEditingSupplier(null);
                setIsAddModalOpen(true);
              }}
              className="btn-primary"
            >
              + Add First Supplier
            </button>
          </div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1080px" }}>
              <thead>
                <tr>
                  <th style={{ width: "100px", padding: "12px 14px" }}>Code</th>
                  <th style={{ minWidth: "220px", padding: "12px 14px" }}>Supplier Name</th>
                  <th style={{ width: "160px", padding: "12px 14px" }}>Contact Person</th>
                  <th style={{ width: "160px", padding: "12px 14px" }}>GSTIN</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "center" }}>Credit Terms</th>
                  <th style={{ width: "150px", padding: "12px 14px", textAlign: "right" }}>Balance Payable</th>
                  <th style={{ width: "110px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "220px", padding: "12px 14px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr
                    key={s.id || s._id}
                    className="table-row-hover"
                  >
                    <td style={{ padding: "11px 14px", fontWeight: "700", color: "var(--primary-400)", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: "var(--badge-brand-bg)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem"
                      }}>
                        {s.supplierCode}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{s.supplierName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.city || "Raipur"}, {s.state || "Chhattisgarh"}</div>
                    </td>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ color: "var(--text-main)", fontWeight: "500" }}>{s.contactPerson || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.mobile}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontSize: "0.80rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {s.gstin || "URP (Unregistered)"}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: "var(--bg-input)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-card)"
                      }}>
                        {s.creditDays || 30} Days
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", color: (s.currentBalance > 0) ? "#f59e0b" : "var(--text-main)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      ₹{(s.currentBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: s.status === "ACTIVE" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: s.status === "ACTIVE" ? "#059669" : "#dc2626",
                        border: `1px solid ${s.status === "ACTIVE" ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                        padding: "3px 9px",
                        borderRadius: "20px",
                        fontSize: "0.73rem",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px"
                      }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: s.status === "ACTIVE" ? "#10b981" : "#ef4444"
                        }} />
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <button
                          onClick={() => {
                            setEditingSupplier(s);
                            setIsAddModalOpen(true);
                          }}
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-card)",
                            color: "var(--primary-400)",
                            cursor: "pointer",
                            padding: "5px 8px",
                            borderRadius: "7px",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Edit Supplier"
                        >
                          <Edit3 size={14} />
                        </button>

                        {onCreatePurchaseForSupplier && (
                          <button
                            onClick={() => onCreatePurchaseForSupplier(s)}
                            style={{
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.25)",
                              color: "var(--primary-500)",
                              padding: "4px 8px",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            title="Record Inward Purchase Bill"
                          >
                            + Purchase Bill
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPayingSupplier(s);
                            setIsPayModalOpen(true);
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            padding: "4px 8px",
                            borderRadius: "7px",
                            fontSize: "0.74rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                          title="Record Supplier Payment (F5)"
                        >
                          Pay
                        </button>

                        {onViewSupplierLedger && (
                          <button
                            onClick={() => onViewSupplierLedger(s)}
                            style={{
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-card)",
                              color: "var(--text-muted)",
                              padding: "4px 8px",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            title="View Supplier Ledger"
                          >
                            Ledger
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddModalOpen && (
        <AddSupplierModal
          token={token}
          initialSupplier={editingSupplier}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchSuppliers();
          }}
        />
      )}

      {/* Supplier Payment Modal (F5) */}
      {isPayModalOpen && (
        <RecordSupplierPaymentModal
          token={token}
          preselectedSupplier={payingSupplier}
          onClose={() => setIsPayModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchSuppliers();
          }}
        />
      )}
    </div>
  );
}
