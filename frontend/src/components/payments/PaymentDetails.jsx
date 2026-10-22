import React, { useState } from "react";
import { 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Store, 
  UserCheck, 
  Calendar, 
  Link as LinkIcon, 
  XCircle, 
  AlertTriangle,
  Receipt,
  Clock
} from "lucide-react";
import { PaymentStatusBadge, PaymentModeBadge } from "./PaymentStatusBadge";

export default function PaymentDetails({ 
  payment, 
  token, 
  user, 
  onBack, 
  onPaymentUpdated,
  onOpenMapModal,
  onOpenIdentifyModal 
}) {
  const [currentPayment, setCurrentPayment] = useState(payment);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const format = (num) => `₹${Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const isOwnerOrFinance = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(user?.role);
  const isUnmatched = currentPayment.status === "UNMATCHED";
  const isCancelled = currentPayment.status === "CANCELLED";
  const canMap = !isCancelled && !isUnmatched && Number(currentPayment.unmappedAmount) > 0 && isOwnerOrFinance;

  const handlePrint = () => {
    window.print();
  };

  const handleCancelPayment = async () => {
    if (!cancelReason.trim()) {
      setError("Please specify a cancellation reason.");
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5005/api/payments/${currentPayment.id || currentPayment.paymentNumber}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason.trim() })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setSuccessMsg(json.message);
        setCurrentPayment(json.data);
        setShowCancelDialog(false);
        if (onPaymentUpdated) onPaymentUpdated(json.data);
      } else {
        setError(json.message || "Failed to cancel payment.");
      }
    } catch (err) {
      console.error("Cancel payment error:", err);
      setError("Network error while cancelling payment.");
    } finally {
      setCancelling(false);
    }
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
          <span>Back to Payments</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isUnmatched && isOwnerOrFinance && (
            <button
              onClick={() => onOpenIdentifyModal && onOpenIdentifyModal(currentPayment)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                color: "#ffffff",
                border: "none",
                padding: "8px 18px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)"
              }}
            >
              <Store size={15} />
              <span>Identify Customer</span>
            </button>
          )}

          {canMap && (
            <button
              onClick={() => onOpenMapModal && onOpenMapModal(currentPayment)}
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
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)"
              }}
            >
              <LinkIcon size={15} />
              <span>Map to Invoices</span>
            </button>
          )}

          {!isCancelled && isOwnerOrFinance && (
            <button
              onClick={() => setShowCancelDialog(true)}
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
              <span>Cancel Payment</span>
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
            <span>Print Receipt</span>
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

      {/* Unmatched Warning Banner */}
      {isUnmatched && (
        <div className="glass-card" style={{
          padding: "16px 22px",
          borderRadius: "14px",
          background: "linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="#f87171" />
            <div>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: "#f87171" }}>
                ⚠ UNMATCHED UPI PAYMENT IN SUSPENSE QUEUE
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Received from <strong>{currentPayment.payerName || "Unknown Payer"}</strong> without retail outlet code. Identify customer to map to invoices.
              </div>
            </div>
          </div>
          {isOwnerOrFinance && (
            <button
              onClick={() => onOpenIdentifyModal && onOpenIdentifyModal(currentPayment)}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Identify Customer Now
            </button>
          )}
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="glass-card" style={{
          padding: "16px 22px",
          borderRadius: "14px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <XCircle size={22} color="#f87171" />
          <div>
            <div style={{ fontSize: "1rem", fontWeight: "800", color: "#f87171" }}>
              PAYMENT ENTRY VOIDED / CANCELLED
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Reason: <strong>{currentPayment.cancelReason || "No reason specified"}</strong>
              {currentPayment.cancelledAt && <span> • Cancelled on {new Date(currentPayment.cancelledAt).toLocaleString("en-IN")}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Main Printable Payment Voucher Sheet */}
      <div 
        className="glass-card receipt-sheet"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)"
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px"
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
              Official Payment Voucher
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-main)", margin: "0 0 4px 0" }}>
              DISTRIBUTOR ERP
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
              Industrial Area Phase II, Indore • Phone: +91 98260 12345 • Authorized Distributor
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--primary-400)", fontFamily: "monospace" }}>
              {currentPayment.paymentNumber}
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "6px" }}>
              <PaymentModeBadge mode={currentPayment.paymentMode} />
              <PaymentStatusBadge status={currentPayment.status} />
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Date: <strong style={{ color: "var(--text-main)" }}>{new Date(currentPayment.paymentDate || currentPayment.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Transaction Info Grid */}
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
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
              Customer / Retail Outlet
            </div>
            {currentPayment.customerName ? (
              <>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)" }}>
                  {currentPayment.customerName}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px", fontFamily: "monospace" }}>
                  Code: {currentPayment.customerCode}
                </div>
              </>
            ) : (
              <div style={{ color: "#f87171", fontWeight: "700", fontSize: "0.95rem" }}>
                ⚠ Unidentified Retailer (In Suspense)
              </div>
            )}
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px" }}>
              Payer Name: <strong style={{ color: "var(--text-main)" }}>{currentPayment.payerName || "Direct Counter"}</strong>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
              Transaction & Custody Info
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
              Collected By: <strong>{currentPayment.salesmanName || "Office Collection / Direct"}</strong>
            </div>
            {currentPayment.upiReference && (
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                UPI Ref: <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{currentPayment.upiReference}</strong>
              </div>
            )}
            {currentPayment.chequeNumber && (
              <>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  Cheque No: <strong style={{ color: "var(--text-main)", fontFamily: "monospace" }}>{currentPayment.chequeNumber}</strong>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Bank: <strong style={{ color: "var(--text-main)" }}>{currentPayment.chequeBank}</strong>
                </div>
              </>
            )}
            {currentPayment.notes && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px", fontStyle: "italic" }}>
                "{currentPayment.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "28px"
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Received</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--text-main)", fontFamily: "monospace", marginTop: "4px" }}>
              {format(currentPayment.amount)}
            </div>
          </div>

          <div style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.75rem", color: "#10b981", textTransform: "uppercase", fontWeight: "700" }}>Mapped to Invoices</div>
            <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#10b981", fontFamily: "monospace", marginTop: "4px" }}>
              {format(currentPayment.mappedAmount)}
            </div>
          </div>

          <div style={{
            background: Number(currentPayment.unmappedAmount) > 0 ? "rgba(245, 158, 11, 0.08)" : "var(--bg-secondary)",
            border: `1px solid ${Number(currentPayment.unmappedAmount) > 0 ? "rgba(245, 158, 11, 0.25)" : "var(--border-color)"}`,
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "0.75rem", color: Number(currentPayment.unmappedAmount) > 0 ? "#f59e0b" : "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
              Unmapped Balance
            </div>
            <div style={{
              fontSize: "1.3rem",
              fontWeight: "900",
              color: Number(currentPayment.unmappedAmount) > 0 ? "#f59e0b" : "var(--text-muted)",
              fontFamily: "monospace",
              marginTop: "4px"
            }}>
              {format(currentPayment.unmappedAmount)}
            </div>
          </div>
        </div>

        {/* Invoice Allocations Table */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px" }}>
            Invoice Allocations ({currentPayment.billMappings?.length || 0})
          </h4>

          {(!currentPayment.billMappings || currentPayment.billMappings.length === 0) ? (
            <div style={{
              padding: "24px",
              textAlign: "center",
              background: "var(--bg-secondary)",
              borderRadius: "10px",
              border: "1px dashed var(--border-color)",
              color: "var(--text-muted)",
              fontSize: "0.85rem"
            }}>
              No invoices have been mapped against this payment yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", textAlign: "left" }}>
                    <th style={{ padding: "10px 14px", width: "40px", textAlign: "center" }}>#</th>
                    <th style={{ padding: "10px 14px" }}>Invoice Number</th>
                    <th style={{ padding: "10px 14px" }}>Mapped Date</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Allocated Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayment.billMappings.map((bm, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-main)" }}>
                      <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td style={{ padding: "12px 14px", fontWeight: "700", fontFamily: "monospace", color: "var(--primary-400)" }}>
                        {bm.billNumber}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)" }}>
                        {new Date(bm.allocatedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "800", color: "#10b981", fontFamily: "monospace" }}>
                        {format(bm.allocatedAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Signature */}
        <div style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingTop: "20px"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Authorized Counter Collector
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "40px" }}>
              For <strong>DISTRIBUTOR ERP</strong>
            </div>
            <div style={{ borderTop: "1px solid var(--border-color)", width: "160px", textAlign: "center", paddingTop: "4px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Cashier / Finance Sign
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Dialog */}
      {showCancelDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "460px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
          }}>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 10px 0" }}>
              Cancel Payment Entry
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
              Please provide a valid audit reason to cancel payment <strong style={{ color: "var(--primary-400)", fontFamily: "monospace" }}>{currentPayment.paymentNumber}</strong>.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Cheque bounce / Disputed duplicate UPI entry"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                outline: "none",
                marginBottom: "16px",
                resize: "none"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCancelPayment}
                disabled={cancelling}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: cancelling ? "not-allowed" : "pointer"
                }}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .receipt-sheet, .receipt-sheet * { visibility: visible; }
          .receipt-sheet {
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
