import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Printer, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  Building2,
  CheckCircle2,
  Receipt,
  Coins
} from "lucide-react";

export default function PartyLedger({ 
  token, 
  initialPartyType = "CUSTOMER", 
  initialPartyId = null,
  embedded = false 
}) {
  const [partyType, setPartyType] = useState(initialPartyType); // "CUSTOMER" or "SUPPLIER"
  const [selectedPartyId, setSelectedPartyId] = useState(initialPartyId || "");
  const [partyList, setPartyList] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState("ALL"); // "ALL", "THIS_MONTH", "LAST_30"

  // Ledger state
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [error, setError] = useState("");

  // 1. Load Customers or Suppliers for dropdown
  useEffect(() => {
    if (embedded && initialPartyId) {
      setSelectedPartyId(initialPartyId);
      return;
    }

    const fetchPartyList = async () => {
      setLoadingParties(true);
      try {
        const endpoint = partyType === "CUSTOMER" 
          ? "http://localhost:5005/api/customers?limit=200" 
          : "http://localhost:5005/api/suppliers?limit=200";
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.success) {
          const list = json.data || [];
          setPartyList(list);
          if (!selectedPartyId && list.length > 0) {
            setSelectedPartyId(list[0].id || list[0]._id);
          }
        }
      } catch (err) {
        console.error("Fetch parties error:", err);
      } finally {
        setLoadingParties(false);
      }
    };

    fetchPartyList();
  }, [partyType, token, embedded, initialPartyId]);

  // Handle Preset Dates
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const today = now.toISOString().slice(0, 10);
      setStartDate(firstDay);
      setEndDate(today);
    } else if (preset === "LAST_30") {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const today = now.toISOString().slice(0, 10);
      setStartDate(past30);
      setEndDate(today);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  // 2. Fetch Ledger Statement
  const fetchLedger = async () => {
    if (!selectedPartyId) return;

    setLoadingLedger(true);
    setError("");

    try {
      const typeRoute = partyType === "CUSTOMER" ? "customer" : "supplier";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`http://localhost:5005/api/ledger/${typeRoute}/${selectedPartyId}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setLedgerData(json.data);
      } else {
        setError(json.message || "Failed to load ledger statement");
      }
    } catch (err) {
      console.error("Fetch ledger error:", err);
      setError("Unable to connect to ledger server");
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (selectedPartyId) {
      fetchLedger();
    }
  }, [selectedPartyId, partyType, startDate, endDate, token]);

  const handlePrint = () => {
    window.print();
  };

  const formatINR = (val) => {
    return `₹${Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header Card (Hidden if embedded) */}
      {!embedded && (
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
              <BookOpen size={26} color="var(--primary-400)" />
              <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                Party Ledger & Statement of Accounts
              </h1>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
              Chronological statement with running balance, sales bills, receipt vouchers, and net due
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px" }}
              title="Print Statement"
            >
              <Printer size={16} />
              <span>Print Statement</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Party Type, Party Selector, Date Range */}
      <div className="glass-card" style={{ padding: "18px 22px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
        {!embedded && (
          <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: "10px", padding: "3px" }}>
            <button
              type="button"
              onClick={() => {
                setPartyType("CUSTOMER");
                setSelectedPartyId("");
              }}
              style={{
                background: partyType === "CUSTOMER" ? "var(--badge-brand-bg)" : "transparent",
                color: partyType === "CUSTOMER" ? "var(--primary-400)" : "var(--text-muted)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: partyType === "CUSTOMER" ? "700" : "500",
                cursor: "pointer"
              }}
            >
              Customer Ledger
            </button>
            <button
              type="button"
              onClick={() => {
                setPartyType("SUPPLIER");
                setSelectedPartyId("");
              }}
              style={{
                background: partyType === "SUPPLIER" ? "var(--badge-brand-bg)" : "transparent",
                color: partyType === "SUPPLIER" ? "var(--primary-400)" : "var(--text-muted)",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: partyType === "SUPPLIER" ? "700" : "500",
                cursor: "pointer"
              }}
            >
              Supplier Ledger
            </button>
          </div>
        )}

        {/* Party Selector */}
        {!embedded && (
          <div style={{ flex: 1, minWidth: "260px" }}>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="input-control"
              style={{ padding: "9px 12px", fontSize: "0.86rem", fontWeight: "600" }}
            >
              <option value="">-- Choose {partyType === "CUSTOMER" ? "Customer / Retailer" : "Supplier / Company"} --</option>
              {partyList.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.shopName || p.supplierName} ({p.customerCode || p.supplierCode}) — {p.mobile}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Presets */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "ALL", label: "All Time" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "LAST_30", label: "Last 30 Days" }
          ].map((dp) => (
            <button
              key={dp.id}
              onClick={() => handlePresetChange(dp.id)}
              style={{
                background: datePreset === dp.id ? "var(--badge-brand-bg)" : "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: datePreset === dp.id ? "var(--primary-400)" : "var(--text-muted)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: datePreset === dp.id ? "700" : "500",
                cursor: "pointer"
              }}
            >
              {dp.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setDatePreset("CUSTOM");
            }}
            className="input-control"
            style={{ padding: "6px 10px", fontSize: "0.8rem", width: "135px" }}
          />
          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setDatePreset("CUSTOM");
            }}
            className="input-control"
            style={{ padding: "6px 10px", fontSize: "0.8rem", width: "135px" }}
          />
        </div>

        <button
          onClick={fetchLedger}
          className="btn-secondary"
          style={{ padding: "8px 12px" }}
          title="Refresh Statement"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Ledger Content Area */}
      {loadingLedger ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading live ledger statement from database...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
          ⚠️ {error}
        </div>
      ) : !ledgerData ? (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
          Please select an account to generate the Party Ledger.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Party Info Card */}
          <div className="glass-card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{
                  background: partyType === "CUSTOMER" ? "rgba(99, 102, 241, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: partyType === "CUSTOMER" ? "var(--primary-400)" : "#10b981",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "800"
                }}>
                  {partyType === "CUSTOMER" ? "SUNDRY DEBTOR" : "SUNDRY CREDITOR"}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {ledgerData.partyInfo?.code}
                </span>
              </div>

              <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-main)", margin: "2px 0 6px" }}>
                {ledgerData.partyInfo?.name}
              </h2>

              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <span>Contact: <strong style={{ color: "var(--text-main)" }}>{ledgerData.partyInfo?.ownerName || ledgerData.partyInfo?.contactPerson || "Proprietor"}</strong></span>
                <span>•</span>
                <span>Mobile: <strong style={{ color: "var(--text-main)" }}>{ledgerData.partyInfo?.mobile || "N/A"}</strong></span>
                <span>•</span>
                <span>GSTIN: <strong style={{ color: "var(--text-main)" }}>{ledgerData.partyInfo?.gstin || "URP (Unregistered)"}</strong></span>
              </div>
            </div>

            {/* Quick Summary Statement Pill */}
            <div style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "14px",
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "right"
            }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Current Closing Balance
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: "900", color: (ledgerData.closingBalance > 0) ? "#f59e0b" : "#10b981", marginTop: "2px" }}>
                {formatINR(ledgerData.closingBalance)} <span style={{ fontSize: "0.9rem" }}>{ledgerData.closingBalanceType}</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", marginTop: "2px" }}>
                {partyType === "CUSTOMER" ? "Amount to receive from customer" : "Amount to pay to supplier"}
              </div>
            </div>
          </div>

          {/* 4 Financial KPI Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px" }}>
            <div className="glass-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Opening Balance
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                {formatINR(ledgerData.openingBalance)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Initial ledger balance
              </div>
            </div>

            <div className="glass-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Total Billed (Debit)
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#6366f1", marginTop: "4px" }}>
                {formatINR(ledgerData.totalDebit)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Tax Invoices generated
              </div>
            </div>

            <div className="glass-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Total Paid / Received (Credit)
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                {formatINR(ledgerData.totalCredit)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Cash / UPI / Cheque cleared
              </div>
            </div>

            <div className="glass-card" style={{ padding: "16px 20px", borderLeft: "3px solid #f59e0b" }}>
              <div style={{ fontSize: "0.74rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                Net Closing Due
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>
                {formatINR(ledgerData.closingBalance)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Net Outstanding balance
              </div>
            </div>
          </div>

          {/* Chronological Ledger Register Table */}
          <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-main)" }}>
                Statement of Account Transactions ({ledgerData.entries?.length || 0})
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Opening Balance: {formatINR(ledgerData.openingBalance)}
              </span>
            </div>

            {ledgerData.entries?.length === 0 ? (
              <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                No transactions recorded in this date range.
              </div>
            ) : (
              <div className="erp-table-container">
                <table className="erp-table" style={{ minWidth: "1000px" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "120px", padding: "12px 14px" }}>Date</th>
                      <th style={{ width: "140px", padding: "12px 14px", textAlign: "center" }}>Voucher Type</th>
                      <th style={{ width: "140px", padding: "12px 14px" }}>Voucher #</th>
                      <th style={{ minWidth: "240px", padding: "12px 14px" }}>Particulars / Description</th>
                      <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Debit (Dr ₹)</th>
                      <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Credit (Cr ₹)</th>
                      <th style={{ width: "160px", padding: "12px 14px", textAlign: "right" }}>Running Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Opening Balance Row */}
                    <tr style={{ background: "rgba(0, 0, 0, 0.01)" }}>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>—</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{ background: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border-card)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700" }}>
                          OPENING
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>—</td>
                      <td style={{ padding: "10px 14px", fontWeight: "600", color: "var(--text-muted)" }}>Opening Balance Brought Forward</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>—</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--text-muted)", whiteSpace: "nowrap" }}>—</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "700", color: "var(--text-main)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {formatINR(ledgerData.openingBalance)}
                      </td>
                    </tr>

                    {/* Transaction Rows */}
                    {ledgerData.entries.map((tx, idx) => {
                      const isDebit = tx.debit > 0;
                      return (
                        <tr
                          key={idx}
                          className="table-row-hover"
                        >
                          <td style={{ padding: "11px 14px", color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                            {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                            <span style={{
                              background: tx.voucherType === "SALE_INVOICE" 
                                ? "rgba(99, 102, 241, 0.12)" 
                                : tx.voucherType === "RECEIPT"
                                ? "rgba(16, 185, 129, 0.12)"
                                : tx.voucherType === "PURCHASE_BILL"
                                ? "rgba(245, 158, 11, 0.12)"
                                : "rgba(59, 130, 246, 0.12)",
                              color: tx.voucherType === "SALE_INVOICE" 
                                ? "var(--primary-500)" 
                                : tx.voucherType === "RECEIPT"
                                ? "#059669"
                                : tx.voucherType === "PURCHASE_BILL"
                                ? "#d97706"
                                : "#2563eb",
                              border: `1px solid ${tx.voucherType === "SALE_INVOICE" 
                                ? "rgba(99, 102, 241, 0.25)" 
                                : tx.voucherType === "RECEIPT"
                                ? "rgba(16, 185, 129, 0.25)"
                                : tx.voucherType === "PURCHASE_BILL"
                                ? "rgba(245, 158, 11, 0.25)"
                                : "rgba(59, 130, 246, 0.25)"}`,
                              padding: "3px 8px",
                              borderRadius: "7px",
                              fontSize: "0.72rem",
                              fontWeight: "700"
                            }}>
                              {tx.voucherLabel || tx.voucherType}
                            </span>
                          </td>
                          <td style={{ padding: "11px 14px", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                            {tx.voucherNumber}
                          </td>
                          <td style={{ padding: "11px 14px", color: "var(--text-main)" }}>
                            {tx.particulars}
                          </td>
                          <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: isDebit ? "700" : "400", color: isDebit ? "var(--text-main)" : "var(--text-dim)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {tx.debit > 0 ? formatINR(tx.debit) : "—"}
                          </td>
                          <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: tx.credit > 0 ? "700" : "400", color: tx.credit > 0 ? "#10b981" : "var(--text-dim)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {tx.credit > 0 ? formatINR(tx.credit) : "—"}
                          </td>
                          <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", color: (tx.runningBalance > 0) ? "#f59e0b" : "#10b981", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                            {formatINR(tx.runningBalance)} <span style={{ fontSize: "0.74rem" }}>{tx.balanceType}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--table-header-bg)", borderTop: "2px solid var(--border-card)", fontWeight: "700" }}>
                      <td colSpan="4" style={{ padding: "12px 14px", textAlign: "right", color: "var(--text-main)" }}>
                        Total Period Flow / Closing Balance:
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#4f46e5", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {formatINR(ledgerData.totalDebit)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#10b981", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {formatINR(ledgerData.totalCredit)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontSize: "0.95rem", color: "#f59e0b", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {formatINR(ledgerData.closingBalance)} {ledgerData.closingBalanceType}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
