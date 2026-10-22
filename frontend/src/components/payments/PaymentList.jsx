import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Receipt,
  Eye,
  ArrowRightLeft,
  UserCheck,
  XCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { PaymentStatusBadge, PaymentModeBadge } from "./PaymentStatusBadge";
import AddPaymentModal from "./AddPaymentModal";
import MapPaymentModal from "./MapPaymentModal";
import UnmatchedPaymentModal from "./UnmatchedPaymentModal";
import RecordSupplierPaymentModal from "./RecordSupplierPaymentModal";

export default function PaymentList({
  token,
  user,
  onSelectPayment,
  onOpenAddPayment,
  initialModeFilter = "ALL",
  initialStatusFilter = "ALL",
  initialPaymentType = "ALL"
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [paymentMode, setPaymentMode] = useState(initialModeFilter);
  const [status, setStatus] = useState(initialStatusFilter);
  const [paymentType, setPaymentType] = useState(initialPaymentType);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Active Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSupplierPaymentModal, setShowSupplierPaymentModal] = useState(false);
  const [mappingPayment, setMappingPayment] = useState(null);
  const [identifyingPayment, setIdentifyingPayment] = useState(null);
  const [cancellingPayment, setCancellingPayment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalAmount: 0,
    cashAmount: 0,
    upiAmount: 0,
    chequeAmount: 0,
    unmatchedCount: 0,
    unmappedTotal: 0
  });

  const canRecordPayment = ["SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER", "SALESMAN"].includes(user?.role);
  const canMapOrIdentify = ["SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"].includes(user?.role);
  const canCancel = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(user?.role);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        paymentMode,
        status,
        paymentType
      });

      const response = await fetch(`http://localhost:5005/api/payments?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        const data = json.data || [];
        setPayments(data);
        setTotalPages(json.totalPages || 1);
        setTotalRecords(json.total || 0);

        // Calculate quick stats from records
        let tot = 0, cash = 0, upi = 0, chq = 0, unmatch = 0, unmap = 0;
        data.forEach(p => {
          if (p.status !== "CANCELLED") {
            tot += p.amount || 0;
            if (p.paymentMode === "CASH") cash += p.amount || 0;
            if (p.paymentMode === "UPI") upi += p.amount || 0;
            if (p.paymentMode === "CHEQUE") chq += p.amount || 0;
            if (p.status === "UNMATCHED") unmatch += 1;
            unmap += p.unmappedAmount || 0;
          }
        });
        setStats({
          totalAmount: tot,
          cashAmount: cash,
          upiAmount: upi,
          chequeAmount: chq,
          unmatchedCount: unmatch,
          unmappedTotal: unmap
        });
      } else {
        setError(json.message || "Failed to load payment records.");
      }
    } catch (err) {
      console.error("Fetch payments error:", err);
      setError("Unable to connect to Payment API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, paymentMode, status, paymentType, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleCancelPayment = async () => {
    if (!cancellingPayment) return;
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancelling this payment.");
      return;
    }

    setActionLoading(true);
    try {
      const pId = cancellingPayment.id || cancellingPayment._id;
      const response = await fetch(`http://localhost:5005/api/payments/${pId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason.trim() })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showToast(`Payment ${cancellingPayment.paymentNumber} has been voided.`);
        setCancellingPayment(null);
        setCancelReason("");
        fetchPayments();
      } else {
        alert(json.message || "Failed to cancel payment.");
      }
    } catch (err) {
      console.error("Cancel payment error:", err);
      alert("Error contacting payment server.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast alert */}
      {toastMessage && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "12px",
          color: "#059669",
          fontWeight: "600",
          fontSize: "0.88rem"
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Action Button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#059669", fontSize: "0.82rem", fontWeight: "800", marginBottom: "4px" }}>
            <Receipt size={16} />
            PAYMENT SETTLEMENT & CASH RECONCILIATION
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em", margin: 0 }}>
            Payment Collections & Reconciliation
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Track daily cash handovers, digital UPI collections, suspense identification & bill mapping.
          </p>
        </div>

        {canRecordPayment && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setShowSupplierPaymentModal(true)}
              className="btn-secondary"
              style={{
                padding: "10px 18px",
                borderColor: "rgba(239, 68, 68, 0.35)",
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.08)",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              title="Record Supplier Payment Voucher (F5)"
            >
              <CreditCard size={16} />
              <span>Pay Supplier (F5)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Plus size={16} />
              <span>Record Collection (F6)</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Stat Highlights */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "14px"
      }}>
        <div className="glass-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            <span>Total Collections</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={16} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--text-main)", marginTop: "8px" }}>
            ₹{stats.totalAmount.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
            {totalRecords} records tracked
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            <span>Cash Handover</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#059669", marginTop: "8px" }}>
            ₹{stats.cashAmount.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
            Cash collected on beat
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            <span>UPI Direct</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={16} color="#9333ea" />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#9333ea", marginTop: "8px" }}>
            ₹{stats.upiAmount.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px" }}>
            Bank transfer / QR payment
          </div>
        </div>

        <div className="glass-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            <span>Unmatched / Suspense</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HelpCircle size={16} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#d97706", marginTop: "8px" }}>
            {stats.unmatchedCount} Unresolved
          </div>
          <div style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "700", marginTop: "4px" }}>
            Unknown UPI payers
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search bar */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Payment #, Store name, UPI Ref, Cheque #, Payer name..."
              className="input-control"
              style={{
                width: "100%",
                paddingLeft: "42px",
                height: "42px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                borderRadius: "10px",
                color: "var(--text-main)",
                fontSize: "0.88rem"
              }}
            />
            <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          </div>

          {/* Mode Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Mode:</span>
            {["ALL", "CASH", "UPI", "CHEQUE"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setPaymentMode(m);
                  setPage(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: paymentMode === m ? "1px solid #10b981" : "1px solid var(--border-card)",
                  background: paymentMode === m ? "#10b981" : "var(--bg-card)",
                  color: paymentMode === m ? "#ffffff" : "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Status:</span>
            {["ALL", "RECORDED", "PARTIALLY_MAPPED", "MAPPED", "UNMATCHED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: status === st ? "1px solid var(--text-main)" : "1px solid var(--border-card)",
                  background: status === st ? "var(--text-main)" : "var(--bg-card)",
                  color: status === st ? "#ffffff" : "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {st === "PARTIALLY_MAPPED" ? "PARTIAL" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(16, 185, 129, 0.2)",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>Loading payment records...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            <AlertCircle size={36} color="#ef4444" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: "700", fontSize: "0.95rem" }}>{error}</p>
            <button
              onClick={fetchPayments}
              className="btn-primary"
              style={{ marginTop: "14px", padding: "6px 16px", fontSize: "0.8rem" }}
            >
              Retry
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Receipt size={44} style={{ margin: "0 auto 12px", color: "var(--text-dim)" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 6px" }}>No Payment Collections Found</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 16px" }}>
              {search || paymentMode !== "ALL" || status !== "ALL"
                ? "No collections match your filter criteria. Try resetting search filters."
                : "No payment receipts recorded yet. Record Cash, UPI, or Cheque collections to reconcile invoices."}
            </p>
            {onOpenAddPayment && (
              <button
                onClick={onOpenAddPayment}
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.82rem", gap: "8px" }}
              >
                <Plus size={16} />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1150px" }}>
              <thead>
                <tr>
                  <th style={{ width: "140px", padding: "12px 14px" }}>Payment #</th>
                  <th style={{ width: "110px", padding: "12px 14px" }}>Date & Time</th>
                  <th style={{ minWidth: "200px", padding: "12px 14px" }}>Customer / Outlet</th>
                  <th style={{ width: "150px", padding: "12px 14px" }}>Mode & Details</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "right" }}>Amount</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Mapped / Balance</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "150px", padding: "12px 14px" }}>Collected By</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => {
                  const isUnmatched = p.status === "UNMATCHED";
                  const canMap = ["RECORDED", "PARTIALLY_MAPPED"].includes(p.status) && (p.unmappedAmount || 0) > 0;
                  const isCancelled = p.status === "CANCELLED";

                  return (
                    <tr
                      key={p.id || p._id}
                      onClick={() => onSelectPayment && onSelectPayment(p)}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        background: idx % 2 === 0 ? "var(--bg-card)" : "var(--table-row-even)",
                        cursor: "pointer",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-row-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? "var(--bg-card)" : "var(--table-row-even)"}
                    >
                      {/* Payment Number */}
                      <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                        {p.paymentNumber}
                      </td>

                      {/* Date */}
                      <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : "-"}
                      </td>

                      {/* Customer / Supplier Party */}
                      <td style={{ padding: "11px 14px" }}>
                        {p.paymentType === "SUPPLIER_PAYMENT" ? (
                          <div>
                            <div style={{ fontWeight: "800", color: "#dc2626", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Building2 size={14} color="#dc2626" />
                              <span>{p.supplierName || "Supplier"}</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "2px" }}>
                              Creditor Payment (F5) • Ref: {p.referenceNumber || "Direct"}
                            </div>
                          </div>
                        ) : isUnmatched ? (
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            background: "rgba(245, 158, 11, 0.12)",
                            color: "#d97706",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            fontSize: "0.75rem",
                            fontWeight: "800"
                          }}>
                            <HelpCircle size={13} />
                            <span>Unidentified Customer</span>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: "800", color: "var(--text-main)", fontSize: "0.88rem" }}>
                              {p.customer?.storeName || p.customer?.name || p.customerName || "Customer"}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "2px" }}>
                              {p.customer?.ownerName ? `${p.customer.ownerName} • ` : ""}
                              {p.customer?.code || p.customerCode || ""}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Mode & Details */}
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <PaymentModeBadge mode={p.paymentMode} />
                          {p.paymentMode === "UPI" && (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {p.upiReference && <span>Ref: {p.upiReference}</span>}
                              {p.payerName && <span style={{ display: "block", color: "var(--text-dim)" }}>({p.payerName})</span>}
                            </div>
                          )}
                          {p.paymentMode === "CHEQUE" && (
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                              {p.chequeNumber && <span>Chq: #{p.chequeNumber}</span>}
                              {p.chequeBank && <span style={{ display: "block", color: "var(--text-dim)" }}>{p.chequeBank}</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--text-main)", fontSize: "0.92rem", whiteSpace: "nowrap" }}>
                        ₹{(p.amount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Mapped vs Balance */}
                      <td style={{ padding: "11px 14px", textAlign: "right", fontSize: "0.82rem", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                        <div style={{ color: "#059669", fontWeight: "700" }}>
                          ₹{(p.mappedAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.74rem" }}>
                          Bal: ₹{(p.unmappedAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <PaymentStatusBadge status={p.status} />
                      </td>

                      {/* Collected By */}
                      <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{p.salesman?.name || p.collectedBy?.name || "Distributor Desk"}</div>
                        {p.salesman?.code && (
                          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{p.salesman.code}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          {/* View Voucher */}
                          <button
                            onClick={() => onSelectPayment && onSelectPayment(p)}
                            title="View Voucher"
                            style={{
                              background: "transparent",
                              border: "1px solid var(--border-card)",
                              color: "var(--text-muted)",
                              padding: "6px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Map to Bills */}
                          {canMapOrIdentify && canMap && !isCancelled && (
                            <button
                              onClick={() => setMappingPayment(p)}
                              title="Map to Invoices"
                              style={{
                                background: "rgba(16, 185, 129, 0.12)",
                                border: "1px solid rgba(16, 185, 129, 0.25)",
                                color: "#059669",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <ArrowRightLeft size={12} />
                              <span>Map</span>
                            </button>
                          )}

                          {/* Identify Customer */}
                          {canMapOrIdentify && isUnmatched && !isCancelled && (
                            <button
                              onClick={() => setIdentifyingPayment(p)}
                              title="Identify Retailer"
                              style={{
                                background: "rgba(245, 158, 11, 0.12)",
                                border: "1px solid rgba(245, 158, 11, 0.25)",
                                color: "#d97706",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <UserCheck size={12} />
                              <span>Identify</span>
                            </button>
                          )}

                          {/* Cancel Payment */}
                          {canCancel && !isCancelled && (
                            <button
                              onClick={() => setCancellingPayment(p)}
                              title="Cancel / Void Payment"
                              style={{
                                background: "transparent",
                                border: "1px solid var(--border-card)",
                                color: "#dc2626",
                                padding: "6px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && payments.length > 0 && (
          <div style={{
            padding: "16px 20px",
            background: "var(--table-header-bg)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.82rem",
            color: "var(--text-muted)"
          }}>
            <div>
              Showing <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{((page - 1) * limit) + 1}</span> to{" "}
              <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{Math.min(page * limit, totalRecords)}</span> of{" "}
              <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{totalRecords}</span> collections
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-card)",
                  background: "var(--bg-card)",
                  color: "var(--text-main)",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.4 : 1
                }}
              >
                Previous
              </button>
              <span style={{ padding: "0 6px", fontFamily: "monospace", fontWeight: "700" }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-card)",
                  background: "var(--bg-card)",
                  color: "var(--text-main)",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.4 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Collection Modal */}
      {showAddModal && (
        <AddPaymentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          token={token}
          user={user}
          onPaymentCreated={(newP) => {
            showToast(`Collection ${newP.paymentNumber} recorded successfully!`);
            setShowAddModal(false);
            fetchPayments();
          }}
        />
      )}

      {/* Map Payment Modal */}
      {mappingPayment && (
        <MapPaymentModal
          isOpen={!!mappingPayment}
          onClose={() => setMappingPayment(null)}
          token={token}
          user={user}
          payment={mappingPayment}
          onPaymentMapped={(updatedP) => {
            showToast(`Payment ${updatedP.paymentNumber} mapped to open invoices!`);
            setMappingPayment(null);
            fetchPayments();
          }}
        />
      )}

      {/* Identify Customer Modal */}
      {identifyingPayment && (
        <UnmatchedPaymentModal
          isOpen={!!identifyingPayment}
          onClose={() => setIdentifyingPayment(null)}
          token={token}
          user={user}
          payment={identifyingPayment}
          onCustomerIdentified={(updatedP) => {
            showToast(`Customer identified for ${updatedP.paymentNumber}! Ready for invoice mapping.`);
            setIdentifyingPayment(null);
            fetchPayments();
          }}
        />
      )}

      {/* Cancel Payment Confirmation Modal */}
      {cancellingPayment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "var(--modal-overlay)",
          backdropFilter: "blur(4px)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "440px",
            background: "var(--bg-modal)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "var(--shadow-modal)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#dc2626" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>Void / Cancel Payment</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>{cancellingPayment.paymentNumber}</p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to cancel this payment of{" "}
              <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>
                ₹{(cancellingPayment.amount || 0).toLocaleString("en-IN")}
              </strong>
              ? Any mapped bills will have their balances restored.
            </p>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Reason for cancellation <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Duplicate entry, Wrong amount recorded, Retailer cancelled transaction..."
                className="input-control"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => {
                  setCancellingPayment(null);
                  setCancelReason("");
                }}
                style={{
                  padding: "8px 18px",
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-card)",
                  color: "var(--text-main)",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={actionLoading || !cancelReason.trim()}
                onClick={handleCancelPayment}
                style={{
                  padding: "8px 20px",
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  borderRadius: "10px",
                  cursor: (actionLoading || !cancelReason.trim()) ? "not-allowed" : "pointer",
                  opacity: (actionLoading || !cancelReason.trim()) ? 0.5 : 1
                }}
              >
                {actionLoading ? "Cancelling..." : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Payment Voucher Modal (F5) */}
      {showSupplierPaymentModal && (
        <RecordSupplierPaymentModal
          token={token}
          onClose={() => setShowSupplierPaymentModal(false)}
          onSuccess={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(""), 4000);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}
