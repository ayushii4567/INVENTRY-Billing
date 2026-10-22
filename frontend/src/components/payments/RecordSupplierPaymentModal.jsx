import React, { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Banknote, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function RecordSupplierPaymentModal({ 
  token, 
  preselectedSupplier = null, 
  isOpen = true, 
  onClose, 
  onSuccess 
}) {
  if (!isOpen) return null;

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    preselectedSupplier?._id || preselectedSupplier?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("BANK_TRANSFER");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load suppliers if not preselected
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("http://localhost:5005/api/suppliers", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setSuppliers(json.data);
          if (!selectedSupplierId && json.data.length > 0) {
            setSelectedSupplierId(json.data[0]._id || json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    };
    fetchSuppliers();
  }, [token]);

  const selectedSupplier = suppliers.find(
    s => (s._id || s.id) === selectedSupplierId
  ) || preselectedSupplier;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    if (!selectedSupplierId) {
      setError("Please select a supplier to pay.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        supplierId: selectedSupplierId,
        amount: numAmount,
        paymentMode,
        paymentDate,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await fetch("http://localhost:5005/api/payments/supplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        if (onSuccess) {
          onSuccess(json.message || `Payment of ₹${numAmount.toLocaleString("en-IN")} recorded successfully.`);
        }
        onClose();
      } else {
        setError(json.message || "Failed to record supplier payment voucher.");
      }
    } catch (err) {
      console.error("Record supplier payment error:", err);
      setError("Network error: Could not reach the accounting server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(10, 15, 29, 0.7)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100,
      padding: "16px"
    }}>
      <div className="glass-card" style={{
        maxWidth: "520px",
        width: "100%",
        padding: "24px",
        borderRadius: "16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)" }}>
                Supplier Payment Voucher (F5)
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Debit: Sundry Creditor | Credit: Bank/Cash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "0.82rem",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Supplier Selector */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              Supplier / Creditor Account *
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="erp-input"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", fontWeight: "600" }}
              required
            >
              <option value="">Select Supplier...</option>
              {suppliers.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} (Payable: ₹{Number(s.currentBalance || 0).toLocaleString("en-IN")})
                </option>
              ))}
            </select>
            {selectedSupplier && (
              <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "#f59e0b", fontWeight: "600" }}>
                Current Outstanding Payable: ₹{Number(selectedSupplier.currentBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {/* Payment Amount */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              Amount Paid (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="erp-input"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "800", fontFamily: "var(--font-mono)" }}
              required
            />
          </div>

          {/* Mode & Date Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="erp-input"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px" }}
              >
                <option value="BANK_TRANSFER">Bank NEFT/RTGS/IMPS</option>
                <option value="UPI">UPI Direct</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash in Hand</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="erp-input"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px" }}
              />
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              UTR / Cheque / Bank Ref No.
            </label>
            <input
              type="text"
              placeholder="e.g. UTR123456789 or CHQ-00213"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="erp-input"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px" }}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
              Narration / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Being payment towards bill #PB-2026-001"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="erp-input"
              style={{ width: "100%", padding: "10px 12px", borderRadius: "10px" }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: "10px 18px", borderRadius: "10px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "10px 22px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                fontWeight: "700"
              }}
              disabled={loading}
            >
              {loading ? "Recording..." : "Post Payment Voucher (Dr: Creditor)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
