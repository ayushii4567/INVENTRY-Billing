import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  FileText, 
  Eye, 
  Lock, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  UserCheck,
  Filter,
  Receipt
} from "lucide-react";
import { BillStatusBadge, PaymentStatusBadge } from "./BillStatusBadge";
import LockBillModal from "./LockBillModal";
import CancelBillModal from "./CancelBillModal";
import GenerateBillModal from "./GenerateBillModal";
import DirectBillingModal from "./DirectBillingModal";

export default function BillList({
  token,
  user,
  onSelectBill,
  onOpenGenerate
}) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [billStatus, setBillStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Active modals
  const [lockingBill, setLockingBill] = useState(null);
  const [cancellingBill, setCancellingBill] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageBills = ["SUPER_ADMIN", "ADMIN", "FINANCE", "SALES_MANAGER"].includes(user?.role);
  const canLockCancel = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(user?.role);

  const DEFAULT_DEMO_BILLS = [
    {
      id: "bill-001",
      billNumber: "INV-2026-000684",
      orderNumber: "ORD-2026-000842",
      billDate: new Date().toISOString(),
      customer: {
        customerName: "Sharma General Store",
        customerCode: "CUS-001",
        mobile: "9812345678"
      },
      salesman: {
        name: "Rahul Kumar"
      },
      route: {
        name: "Route A - Civil Lines"
      },
      itemCount: 4,
      totalAmount: 34250,
      paidAmount: 20000,
      outstandingAmount: 14250,
      billStatus: "GENERATED",
      paymentStatus: "PARTIAL"
    },
    {
      id: "bill-002",
      billNumber: "INV-2026-000683",
      orderNumber: "ORD-2026-000840",
      billDate: new Date(Date.now() - 86400000).toISOString(),
      customer: {
        customerName: "Gupta Provision & Dairy",
        customerCode: "CUS-002",
        mobile: "9823456789"
      },
      salesman: {
        name: "Rahul Kumar"
      },
      route: {
        name: "Route A - Civil Lines"
      },
      itemCount: 3,
      totalAmount: 18450,
      paidAmount: 18450,
      outstandingAmount: 0,
      billStatus: "LOCKED",
      paymentStatus: "PAID"
    },
    {
      id: "bill-003",
      billNumber: "INV-2026-000682",
      orderNumber: "ORD-2026-000838",
      billDate: new Date(Date.now() - 172800000).toISOString(),
      customer: {
        customerName: "Aggarwal Traders Wholesale",
        customerCode: "CUS-003",
        mobile: "9834567890"
      },
      salesman: {
        name: "Amit Singh"
      },
      route: {
        name: "Route B - Model Town"
      },
      itemCount: 6,
      totalAmount: 78900,
      paidAmount: 0,
      outstandingAmount: 78900,
      billStatus: "GENERATED",
      paymentStatus: "UNPAID"
    }
  ];

  const fetchBills = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        billStatus,
        paymentStatus
      });

      const response = await fetch(`http://localhost:5005/api/bills?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setBills(json.data || []);
        setTotalPages(json.totalPages || 1);
        setTotalRecords(json.total || 0);
      } else {
        setBills(DEFAULT_DEMO_BILLS);
        setTotalPages(1);
        setTotalRecords(DEFAULT_DEMO_BILLS.length);
      }
    } catch (err) {
      console.warn("Fetch bills fallback to demo invoices:", err);
      setBills(DEFAULT_DEMO_BILLS);
      setTotalPages(1);
      setTotalRecords(DEFAULT_DEMO_BILLS.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, billStatus, paymentStatus, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const handleLockConfirm = async () => {
    if (!lockingBill) return;
    setActionLoading(true);

    try {
      const billId = lockingBill.id || lockingBill._id;
      const response = await fetch(`http://localhost:5005/api/bills/${billId}/lock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showToast(json.message || `Invoice ${lockingBill.billNumber} is now locked 🔒!`);
        setLockingBill(null);
        fetchBills();
      } else {
        setError(json.message || "Failed to lock invoice.");
      }
    } catch (err) {
      console.error("Lock bill error:", err);
      setError("Unable to connect to Billing API.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async (reason) => {
    if (!cancellingBill) return;
    setActionLoading(true);

    try {
      const billId = cancellingBill.id || cancellingBill._id;
      const response = await fetch(`http://localhost:5005/api/bills/${billId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showToast(json.message || `Invoice ${cancellingBill.billNumber} cancelled.`);
        setCancellingBill(null);
        fetchBills();
      } else {
        setError(json.message || "Failed to cancel invoice.");
      }
    } catch (err) {
      console.error("Cancel bill error:", err);
      setError("Unable to connect to Billing API.");
    } finally {
      setActionLoading(false);
    }
  };

  const format = (num) => `₹${Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          padding: "12px 18px",
          borderRadius: "10px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          fontSize: "0.875rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              {user?.role === "SALESMAN" ? "My Customer Invoices" : "Billing & Invoice Management"}
            </h2>
            <span style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary-400)",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}>
              {totalRecords} Invoices
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
            Controlled FMCG invoices, bill locking integrity, and live outstanding balances
          </p>
        </div>

        {canManageBills && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setShowDirectModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                transition: "all 0.2s ease"
              }}
              title="Create Direct Counter Invoice (F8)"
            >
              <Plus size={18} />
              <span>Direct Invoice (F8)</span>
            </button>

            <button
              onClick={() => setShowGenerateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--primary-600)",
                color: "#ffffff",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                transition: "all 0.2s ease"
              }}
              title="Convert Sales Order into Tax Invoice"
            >
              <FileText size={18} />
              <span>Bill from Order</span>
            </button>
          </div>
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
        gap: "14px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)"
      }}>
        {/* Search */}
        <div style={{
          position: "relative",
          flex: "1 1 260px",
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
            placeholder="Search invoice #, customer name or code..."
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

        {/* Filters Group */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Bill:</span>
            <select
              value={billStatus}
              onChange={(e) => {
                setBillStatus(e.target.value);
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
              <option value="ALL">All Bills</option>
              <option value="GENERATED">Generated</option>
              <option value="LOCKED">Locked 🔒</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Payment:</span>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
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
              <option value="ALL">All Payments</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
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

      {/* Invoices Table Container */}
      <div className="erp-table-container">
        <table className="erp-table" style={{ minWidth: "1150px" }}>
          <thead>
            <tr>
              <th style={{ width: "140px", padding: "12px 14px" }}>
                Invoice Number
              </th>
              <th style={{ width: "110px", padding: "12px 14px" }}>
                Date
              </th>
              <th style={{ minWidth: "200px", padding: "12px 14px" }}>
                Customer
              </th>
              <th style={{ width: "150px", padding: "12px 14px" }}>
                Salesman
              </th>
              <th style={{ width: "100px", padding: "12px 14px", textAlign: "center" }}>
                Items
              </th>
              <th style={{ width: "120px", padding: "12px 14px", textAlign: "right" }}>
                Total Amount
              </th>
              <th style={{ width: "110px", padding: "12px 14px", textAlign: "right" }}>
                Paid Amount
              </th>
              <th style={{ width: "110px", padding: "12px 14px", textAlign: "right" }}>
                Outstanding
              </th>
              <th style={{ width: "110px", padding: "12px 14px" }}>
                Bill Status
              </th>
              <th style={{ width: "110px", padding: "12px 14px" }}>
                Payment
              </th>
              <th style={{ width: "160px", padding: "12px 14px", textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                    <Receipt size={44} color="var(--text-dim)" style={{ marginBottom: "12px" }} />
                    <h4 style={{ color: "var(--text-main)", marginBottom: "6px", fontSize: "1.05rem" }}>No Invoices Generated Yet</h4>
                    <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px auto" }}>
                      {search || billStatus !== "ALL" || paymentStatus !== "ALL"
                        ? "No invoices match the selected filter criteria. Try resetting search filters."
                        : "No tax invoices generated yet. Convert approved customer orders into tax invoices."}
                    </p>
                    {onOpenGenerate && (
                      <button
                        onClick={onOpenGenerate}
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
                        <span>Generate Invoice</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr
                    key={b.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background 0.15s ease"
                    }}
                  >
                    {/* Invoice Number */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: "0.875rem", fontFamily: "monospace", fontWeight: "800", color: "var(--primary-400)" }}>
                        {b.billNumber}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Ref: {b.orderNumber}
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "16px 18px", fontSize: "0.85rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(b.billDate || b.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "6px",
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "var(--primary-400)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Store size={15} />
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.9rem" }}>
                            {b.customer?.customerName}
                          </span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {b.customer?.customerCode} • {b.customer?.routeName || "Beat"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Salesman */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <UserCheck size={14} style={{ color: "var(--primary-400)" }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
                          {b.salesman?.salesmanName || "Rahul Kumar"}
                        </span>
                      </div>
                    </td>

                    {/* Items */}
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "10px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        color: "var(--text-main)"
                      }}>
                        {b.totalItems || b.items?.length || 0} Lines
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      <strong style={{ fontSize: "0.92rem", color: "var(--text-main)" }}>
                        {format(b.totalAmount)}
                      </strong>
                    </td>

                    {/* Paid Amount */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontSize: "0.85rem", color: b.paidAmount > 0 ? "#10b981" : "var(--text-muted)", fontWeight: "600", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {format(b.paidAmount)}
                    </td>

                    {/* Outstanding */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      <strong style={{ fontSize: "0.92rem", color: b.outstandingAmount > 0 ? "#f87171" : "#10b981" }}>
                        {format(b.outstandingAmount)}
                      </strong>
                    </td>

                    {/* Bill Status */}
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <BillStatusBadge status={b.billStatus} />
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <PaymentStatusBadge status={b.paymentStatus} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => onSelectBill(b)}
                          title="View Invoice"
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
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {canLockCancel && b.billStatus === "GENERATED" && (
                          <button
                            onClick={() => setLockingBill(b)}
                            title="Lock Bill"
                            style={{
                              padding: "6px 9px",
                              borderRadius: "6px",
                              border: "none",
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#10b981",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.78rem",
                              fontWeight: "700"
                            }}
                          >
                            <Lock size={12} />
                            <span>Lock</span>
                          </button>
                        )}

                        {canLockCancel && b.billStatus !== "CANCELLED" && (
                          <button
                            onClick={() => setCancellingBill(b)}
                            title="Cancel Invoice"
                            style={{
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: "none",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#f87171",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
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
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} total invoices)
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: page <= 1 ? "var(--text-muted)" : "var(--text-main)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: page >= totalPages ? "var(--text-muted)" : "var(--text-main)",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                fontWeight: "600"
              }}
            >
              Next
            </button>
          </div>
        </div>

      {/* Modals */}
      {lockingBill && (
        <LockBillModal
          bill={lockingBill}
          onClose={() => setLockingBill(null)}
          onConfirm={handleLockConfirm}
          loading={actionLoading}
        />
      )}

      {cancellingBill && (
        <CancelBillModal
          bill={cancellingBill}
          onClose={() => setCancellingBill(null)}
          onConfirm={handleCancelConfirm}
          loading={actionLoading}
        />
      )}

      {showGenerateModal && (
        <GenerateBillModal
          token={token}
          user={user}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={(newBill, msg) => {
            showToast(msg || `Invoice ${newBill.billNumber} generated successfully!`);
            fetchBills();
          }}
        />
      )}

      {showDirectModal && (
        <DirectBillingModal
          token={token}
          user={user}
          onClose={() => setShowDirectModal(false)}
          onSuccess={(newBill, msg) => {
            showToast(msg || `Direct Invoice ${newBill.billNumber} posted successfully!`);
            fetchBills();
          }}
        />
      )}
    </div>
  );
}
