import React, { useState, useEffect } from "react";
import { 
  PackagePlus, 
  Search, 
  Plus, 
  Calendar, 
  Eye, 
  RefreshCw, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import CreatePurchaseModal from "./CreatePurchaseModal";
import PurchaseDetailsModal from "./PurchaseDetailsModal";

export default function PurchaseList({ token, onOpenCreatePurchase, initialSupplier = null }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const fetchPurchases = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (paymentStatus !== "ALL") params.append("paymentStatus", paymentStatus);

      const res = await fetch(`http://localhost:5005/api/purchases?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPurchases(json.data || []);
      } else {
        setError(json.message || "Failed to load purchases");
      }
    } catch (err) {
      console.error("Fetch purchases error:", err);
      setError("Unable to connect to purchases service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [search, paymentStatus, token]);

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);
  const totalBalanceDue = purchases.reduce((sum, p) => sum + (Number(p.balanceAmount) || 0), 0);

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

      {/* Top Banner */}
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
            <PackagePlus size={26} color="#10b981" />
            <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Purchase Inward Register (Tally F9)
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
            Record manufacturer goods receipts, purchase invoices & track inventory stock additions
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
        >
          <Plus size={18} />
          <span>New Purchase Inward (F9)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ 
          padding: "20px 24px", 
          borderTop: "3px solid #10b981",
          background: "linear-gradient(180deg, rgba(16, 185, 129, 0.02) 0%, #ffffff 100%)"
        }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-dim, #64748b)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.03em" }}>
            Total Inward Purchases
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)", marginTop: "6px" }}>
            ₹{totalPurchasesAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.76rem", color: "#059669", fontWeight: "600", marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
            <span>{purchases.length} Vouchers recorded & in stock</span>
          </div>
        </div>

        <div className="glass-card" style={{ 
          padding: "20px 24px", 
          borderTop: "3px solid #f59e0b",
          background: "linear-gradient(180deg, rgba(245, 158, 11, 0.02) 0%, #ffffff 100%)"
        }}>
          <div style={{ fontSize: "0.74rem", color: "var(--text-dim, #64748b)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.03em" }}>
            Supplier Balance Due
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#d97706", marginTop: "6px" }}>
            ₹{totalBalanceDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Pending payable amount to creditors
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search by Voucher #, Supplier Inv #, Supplier Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control"
            style={{ paddingLeft: "36px" }}
          />
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["ALL", "UNPAID", "PARTIAL", "PAID"].map((st) => (
            <button
              key={st}
              onClick={() => setPaymentStatus(st)}
              style={{
                background: paymentStatus === st ? "var(--badge-brand-bg)" : "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: paymentStatus === st ? "var(--primary-400)" : "var(--text-muted)",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: paymentStatus === st ? "700" : "500",
                cursor: "pointer"
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={fetchPurchases}
          className="btn-secondary"
          style={{ padding: "8px 14px" }}
          title="Refresh purchase vouchers"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Purchases Table */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading Purchase Vouchers...
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
            ⚠️ {error}
          </div>
        ) : purchases.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            <PackagePlus size={44} style={{ opacity: 0.4, marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Purchase Inwards Recorded</p>
            <p style={{ margin: "4px 0 16px", fontSize: "0.85rem" }}>Create your first F9 purchase inward bill to add stock to inventory.</p>
            <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
              + New Purchase Inward (F9)
            </button>
          </div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1080px" }}>
              <thead>
                <tr>
                  <th style={{ width: "120px", padding: "12px 14px" }}>Voucher #</th>
                  <th style={{ width: "120px", padding: "12px 14px" }}>Date</th>
                  <th style={{ minWidth: "220px", padding: "12px 14px" }}>Supplier (Vendor)</th>
                  <th style={{ width: "140px", padding: "12px 14px" }}>Supplier Inv #</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "center" }}>Items Inward</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Grand Total</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Balance Due</th>
                  <th style={{ width: "110px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "90px", padding: "12px 14px", textAlign: "center" }}>View</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p.id || p._id}
                    className="table-row-hover"
                  >
                    <td style={{ padding: "11px 14px", fontWeight: "700", color: "#10b981", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem"
                      }}>
                        {p.purchaseNumber}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {new Date(p.purchaseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{p.supplierName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{p.supplierCode}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontSize: "0.80rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {p.supplierInvoiceNumber}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: "700", color: "#10b981", whiteSpace: "nowrap" }}>
                      +{p.items?.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)} PCS
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", color: "var(--text-main)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      ₹{(p.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", color: (p.balanceAmount > 0) ? "#f59e0b" : "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      ₹{(p.balanceAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: p.paymentStatus === "PAID" ? "rgba(16, 185, 129, 0.12)" : p.paymentStatus === "PARTIAL" ? "rgba(245, 158, 11, 0.12)" : "rgba(239, 68, 68, 0.12)",
                        color: p.paymentStatus === "PAID" ? "#059669" : p.paymentStatus === "PARTIAL" ? "#d97706" : "#dc2626",
                        border: `1px solid ${p.paymentStatus === "PAID" ? "rgba(16, 185, 129, 0.25)" : p.paymentStatus === "PARTIAL" ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
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
                          background: p.paymentStatus === "PAID" ? "#10b981" : p.paymentStatus === "PARTIAL" ? "#f59e0b" : "#ef4444"
                        }} />
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setSelectedPurchase(p)}
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-card)",
                          color: "var(--primary-400)",
                          padding: "5px 10px",
                          borderRadius: "7px",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Purchase Modal */}
      {isCreateOpen && (
        <CreatePurchaseModal
          token={token}
          initialSupplier={initialSupplier}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchPurchases();
          }}
        />
      )}

      {/* View Purchase Details Modal */}
      {selectedPurchase && (
        <PurchaseDetailsModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
}
