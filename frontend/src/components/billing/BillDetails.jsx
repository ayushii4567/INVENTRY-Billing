import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  Lock, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileText,
  DollarSign
} from "lucide-react";
import { BillStatusBadge, PaymentStatusBadge } from "./BillStatusBadge";
import LockBillModal from "./LockBillModal";
import CancelBillModal from "./CancelBillModal";

export default function BillDetails({ 
  bill, 
  token, 
  user, 
  onBack, 
  onBillUpdated 
}) {
  const [currentBill, setCurrentBill] = useState(bill);
  const [lockingBill, setLockingBill] = useState(null);
  const [cancellingBill, setCancellingBill] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const canLockCancel = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(user?.role);
  const isLocked = currentBill.billStatus === "LOCKED";
  const isCancelled = currentBill.billStatus === "CANCELLED";
  const isGenerated = currentBill.billStatus === "GENERATED";

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleRefreshBill = async () => {
    try {
      const res = await fetch(`http://localhost:5005/api/bills/${currentBill.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentBill(json.data);
        if (onBillUpdated) onBillUpdated(json.data);
      }
    } catch (err) {
      console.error("Failed to refresh bill:", err);
    }
  };

  const handleLockBill = async () => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5005/api/bills/${currentBill.id}/lock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showNotification(json.message || "Invoice locked successfully!");
        setLockingBill(null);
        await handleRefreshBill();
      } else {
        setError(json.message || "Failed to lock invoice.");
      }
    } catch (err) {
      console.error("Lock error:", err);
      setError("Network error while locking invoice.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBill = async (reason) => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5005/api/bills/${currentBill.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        showNotification(json.message || "Invoice cancelled successfully.");
        setCancellingBill(null);
        await handleRefreshBill();
      } else {
        setError(json.message || "Failed to cancel invoice.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Network error while cancelling invoice.");
    } finally {
      setActionLoading(false);
    }
  };

  const format = (num) => `₹${Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Action Bar (Hidden during Print) */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isGenerated && canLockCancel && (
            <button
              onClick={() => setLockingBill(currentBill)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
              }}
            >
              <Lock size={15} />
              <span>Lock Bill 🔒</span>
            </button>
          )}

          {!isCancelled && canLockCancel && (
            <button
              onClick={() => setCancellingBill(currentBill)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <XCircle size={15} />
              <span>Cancel Invoice</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="no-print" style={{
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
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="no-print" style={{
          padding: "12px 18px",
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

      {/* Prominent Demo Status Bar */}
      {isLocked && (
        <div className="glass-card" style={{
          padding: "16px 22px",
          borderRadius: "14px",
          background: "linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#10b981",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)"
            }}>
              <Lock size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "#10b981" }}>
                  🔒 BILL LOCKED
                </span>
                <span style={{ fontSize: "0.78rem", padding: "2px 8px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", fontWeight: "700" }}>
                  IMMUTABLE
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Product quantities, rates, customer details and bill totals cannot be modified or deleted.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Payment Status</div>
              <div style={{ fontWeight: "700", color: "var(--text-main)" }}>
                <PaymentStatusBadge status={currentBill.paymentStatus} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Outstanding</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "800", color: currentBill.outstandingAmount > 0 ? "#f87171" : "#10b981" }}>
                {format(currentBill.outstandingAmount)}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="glass-card" style={{
          padding: "16px 22px",
          borderRadius: "14px",
          background: "linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.04) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          display: "flex",
          alignItems: "center",
          gap: "14px"
        }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "#ef4444",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f87171" }}>
              ❌ INVOICE CANCELLED
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Reason: <strong>{currentBill.cancelReason || "No reason specified"}</strong>
              {currentBill.cancelledAt && (
                <span> • Cancelled on {new Date(currentBill.cancelledAt).toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Printable FMCG Tax Invoice Document */}
      <div 
        className="glass-card invoice-sheet" 
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          position: "relative"
        }}
      >
        {/* Invoice Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "24px",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <div style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--primary-400)",
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px"
            }}>
              FMCG Distributor Invoice
            </div>
            <h1 style={{
              fontSize: "1.6rem",
              fontWeight: "900",
              color: "var(--text-main)",
              margin: "0 0 4px 0",
              letterSpacing: "-0.5px"
            }}>
              DISTRIBUTOR ERP
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Authorized FMCG Super Distributor & Wholesale Supply Engine
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
              Industrial Area, Phase II, Indore (M.P.) • Phone: +91 98260 12345 • GSTIN: 23AABCC1234F1Z5
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "1.4rem",
              fontWeight: "900",
              color: "var(--primary-400)",
              fontFamily: "monospace",
              letterSpacing: "1px"
            }}>
              {currentBill.billNumber}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <BillStatusBadge status={currentBill.billStatus} />
              <PaymentStatusBadge status={currentBill.paymentStatus} />
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "8px" }}>
              Date: <strong style={{ color: "var(--text-main)" }}>{new Date(currentBill.createdAt || currentBill.generatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </div>
            {currentBill.orderId && (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Order Ref: <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{currentBill.orderId?.orderNumber || currentBill.orderId}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Sales Information Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px"
        }}>
          {/* Customer Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Store size={18} style={{ color: "var(--primary-400)" }} />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", textTransform: "uppercase", margin: 0 }}>
                Billed To (Customer)
              </h3>
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
              {currentBill.customer?.customerName || currentBill.customerName || "Customer Name"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Code: <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{currentBill.customer?.customerCode || currentBill.customerCode}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Mobile: <strong style={{ color: "var(--text-main)" }}>{currentBill.customer?.mobile || "N/A"}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Address: <span style={{ color: "var(--text-main)" }}>{currentBill.customer?.address || "Registered Address, Indore"}</span>
            </div>
          </div>

          {/* Sales & Route Details */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <UserCheck size={18} style={{ color: "var(--primary-400)" }} />
              <h3 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", textTransform: "uppercase", margin: 0 }}>
                Sales & Beat Assignment
              </h3>
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
              {currentBill.salesman?.salesmanName || currentBill.salesmanName || "Rahul Kumar (Salesman)"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Route / Beat: <strong style={{ color: "var(--text-main)" }}>{currentBill.customer?.routeName || currentBill.customer?.route || "Route 1 - Sarafa Bazaar"}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Area: <strong style={{ color: "var(--text-main)" }}>{currentBill.customer?.areaName || currentBill.customer?.area || "Central Market"}</strong>
            </div>
            {currentBill.lockedAt && (
              <div style={{ fontSize: "0.82rem", color: "#10b981", marginTop: "2px", fontWeight: "600" }}>
                Locked On: {new Date(currentBill.lockedAt).toLocaleString("en-IN")}
              </div>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div style={{ overflowX: "auto", marginBottom: "28px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{
                background: "var(--bg-secondary)",
                borderBottom: "2px solid var(--border-color)",
                color: "var(--text-muted)",
                textAlign: "left"
              }}>
                <th style={{ padding: "12px 14px", width: "40px", textAlign: "center" }}>#</th>
                <th style={{ padding: "12px 14px" }}>Product & Code</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Rate</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>Disc %</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Taxable</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>GST %</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Tax Amt</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentBill.items?.map((item, idx) => (
                <tr key={idx} style={{
                  borderBottom: "1px solid var(--border-color)",
                  color: "var(--text-main)"
                }}>
                  <td style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ fontWeight: "700" }}>{item.productName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {item.productCode}
                    </div>
                  </td>
                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "var(--primary-400)",
                      fontWeight: "700"
                    }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{ padding: "14px", textAlign: "right", fontFamily: "monospace" }}>
                    {format(item.rate)}
                  </td>
                  <td style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)" }}>
                    {item.discount || 0}%
                  </td>
                  <td style={{ padding: "14px", textAlign: "right", fontFamily: "monospace" }}>
                    {format(item.taxableAmount)}
                  </td>
                  <td style={{ padding: "14px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {item.taxRate || 0}%
                    </span>
                  </td>
                  <td style={{ padding: "14px", textAlign: "right", fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {format(item.taxAmount)}
                  </td>
                  <td style={{ padding: "14px", textAlign: "right", fontWeight: "800", color: "var(--text-main)", fontFamily: "monospace" }}>
                    {format(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary & Financial Totals */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "30px",
          alignItems: "flex-start",
          borderTop: "2px solid var(--border-color)",
          paddingTop: "24px"
        }}>
          {/* Terms & Notes */}
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              Terms & Conditions:
            </div>
            <ul style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, paddingLeft: "18px", lineHeight: "1.6" }}>
              <li>Goods once sold will not be taken back or exchanged without prior authorization.</li>
              <li>Disputes are subject to Indore jurisdiction only.</li>
              <li>Payment must be settled within the agreed distributor credit period.</li>
            </ul>

            {currentBill.notes && (
              <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-main)" }}>Notes: </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{currentBill.notes}</span>
              </div>
            )}
          </div>

          {/* Grand Totals Box */}
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Subtotal:</span>
              <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{format(currentBill.subtotal)}</strong>
            </div>

            {currentBill.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", color: "#10b981" }}>
                <span>Discount:</span>
                <strong style={{ fontFamily: "monospace" }}>-{format(currentBill.discountAmount)}</strong>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Tax Amount (GST):</span>
              <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{format(currentBill.taxAmount)}</strong>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px dashed var(--border-color)",
              paddingTop: "12px",
              marginBottom: "12px"
            }}>
              <span style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>Grand Total:</span>
              <span style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--primary-400)", fontFamily: "monospace" }}>
                {format(currentBill.totalAmount)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Paid Amount:</span>
              <strong style={{ color: "#10b981", fontFamily: "monospace" }}>{format(currentBill.paidAmount)}</strong>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "8px",
              fontSize: "0.95rem"
            }}>
              <span style={{ fontWeight: "800", color: "var(--text-main)" }}>Outstanding:</span>
              <strong style={{
                fontFamily: "monospace",
                fontWeight: "900",
                color: currentBill.outstandingAmount > 0 ? "#f87171" : "#10b981"
              }}>
                {format(currentBill.outstandingAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Authorized Signature Footer */}
        <div style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: "20px"
        }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Receiver's Signature & Stamp
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "40px" }}>
              For <strong>DISTRIBUTOR ERP</strong>
            </div>
            <div style={{ borderTop: "1px solid var(--border-color)", width: "180px", textAlign: "center", paddingTop: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {lockingBill && (
        <LockBillModal
          bill={lockingBill}
          onClose={() => setLockingBill(null)}
          onConfirm={handleLockBill}
          loading={actionLoading}
        />
      )}

      {cancellingBill && (
        <CancelBillModal
          bill={cancellingBill}
          onClose={() => setCancellingBill(null)}
          onConfirm={handleCancelBill}
          loading={actionLoading}
        />
      )}

      {/* Print Stylesheet Hook */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .invoice-sheet, .invoice-sheet * {
            visibility: visible;
          }
          .invoice-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
