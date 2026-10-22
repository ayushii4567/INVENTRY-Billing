import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Check, 
  Truck, 
  RefreshCw, 
  Store, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Clock,
  AlertCircle
} from "lucide-react";
import CreateTripModal from "./CreateTripModal";

export default function ReadyForDispatch({ token, user, onTripCreated, onViewTrips }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchReadyBills = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5005/api/delivery/ready-bills", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBills(json.data || []);
      } else {
        setError(json.message || "Failed to load ready bills.");
      }
    } catch (err) {
      console.error("fetchReadyBills error:", err);
      setError("Unable to connect to delivery service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyBills();
  }, [token]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      b.billNumber.toLowerCase().includes(q) ||
      (b.customer?.customerName && b.customer.customerName.toLowerCase().includes(q)) ||
      (b.customer?.routeName && b.customer.routeName.toLowerCase().includes(q));

    const matchRoute =
      routeFilter === "ALL" ||
      b.customer?.routeId === routeFilter ||
      b.customer?.routeName?.toLowerCase().includes(routeFilter.toLowerCase());

    return matchSearch && matchRoute;
  });

  // Extract unique routes
  const routes = Array.from(
    new Set(bills.map((b) => b.customer?.routeName).filter(Boolean))
  );

  // Checkbox helpers
  const allFilteredIds = filteredBills.map((b) => b.id || b.billNumber);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedBillIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBillIds([]);
    } else {
      setSelectedBillIds(allFilteredIds);
    }
  };

  const toggleBill = (billId) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    );
  };

  const selectedBills = bills.filter((b) => selectedBillIds.includes(b.id || b.billNumber));
  const selectedTotalAmount = selectedBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
          fontSize: "0.9rem",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
          zIndex: 2000
        }}>
          ✓ {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: "20px 28px",
        background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.08) 100%)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            background: "rgba(245, 158, 11, 0.15)",
            color: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(245, 158, 11, 0.3)"
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Ready for Dispatch Queue
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Locked FMCG invoices awaiting delivery vehicle assignment & route trip creation
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchReadyBills}
            className="btn-secondary"
            style={{ padding: "10px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              if (selectedBillIds.length === 0) {
                // select all filtered by default if none selected
                setSelectedBillIds(filteredBills.slice(0, 5).map((b) => b.id || b.billNumber));
              }
              setIsCreateModalOpen(true);
            }}
            className="btn-primary"
            style={{
              padding: "10px 20px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#ffffff"
            }}
          >
            <Truck size={16} />
            <span>+ Create Delivery Trip {selectedBillIds.length > 0 ? `(${selectedBillIds.length})` : ""}</span>
          </button>
        </div>
      </div>

      {/* Sticky Selection Toolbar (Active when bills are selected) */}
      {selectedBillIds.length > 0 && (
        <div className="glass-card" style={{
          padding: "14px 24px",
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--primary-400)" }}>
              ✓ {selectedBillIds.length} Bills Selected for Trip
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
            <span style={{ fontSize: "0.88rem", fontWeight: "800", color: "#34d399" }}>
              Total Invoice Value: ₹{selectedTotalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setSelectedBillIds([])}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: "6px 12px"
              }}
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Truck size={14} />
              <span>Batch into Delivery Trip</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, outlet name, route..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          >
            <option value="ALL">All Routes / Beats</option>
            {routes.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="erp-table-container">
        <table className="erp-table" style={{ minWidth: "1050px" }}>
          <thead>
            <tr>
              <th style={{ width: "42px", minWidth: "42px", padding: "12px 10px" }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ minWidth: "140px" }}>Invoice #</th>
              <th style={{ minWidth: "220px" }}>Customer / Retail Outlet</th>
              <th style={{ minWidth: "140px" }}>Route / Beat</th>
              <th style={{ minWidth: "120px" }}>Bill Date</th>
              <th style={{ minWidth: "120px", textAlign: "right" }}>Amount</th>
              <th style={{ minWidth: "110px", textAlign: "center" }}>Payment</th>
              <th style={{ minWidth: "110px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ width: "32px", height: "32px", border: "3px solid rgba(245, 158, 11, 0.2)", borderTopColor: "#f59e0b", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                  <p>Scanning locked bills ready for dispatch...</p>
                </td>
              </tr>
            ) : filteredBills.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  <Package size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Bills Waiting for Dispatch</div>
                  <p style={{ fontSize: "0.82rem", maxWidth: "450px", margin: "6px auto 16px" }}>
                    All current invoices are already assigned to delivery trips or completed. Create and lock new bills from Order Booking to stage for dispatch.
                  </p>
                  {onViewTrips && (
                    <button onClick={onViewTrips} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                      View Active Delivery Trips →
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredBills.map((b) => {
                const bId = b.id || b.billNumber;
                const isSelected = selectedBillIds.includes(bId);
                return (
                  <tr
                    key={bId}
                    style={{
                      background: isSelected ? "rgba(99, 102, 241, 0.08)" : undefined
                    }}
                  >
                    <td style={{ padding: "11px 10px", width: "42px" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBill(bId)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "700", color: "var(--primary-400)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem" }}>
                        {b.billNumber}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Ref: {b.orderNumber}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                        {b.customer?.customerName || "Customer"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "240px" }}>
                        {b.customer?.address || "Address"}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} />
                        {b.customer?.routeName || "Route A"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {b.billDate ? new Date(b.billDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "800", color: "#34d399", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      ₹{Number(b.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        background: b.paymentStatus === "PAID" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                        color: b.paymentStatus === "PAID" ? "#10b981" : "#f59e0b"
                      }}>
                        {b.paymentStatus || "UNPAID"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          setSelectedBillIds([bId]);
                          setIsCreateModalOpen(true);
                        }}
                        className="btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          borderRadius: "8px"
                        }}
                      >
                        Plan Trip →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Trip Modal */}
      {isCreateModalOpen && (
        <CreateTripModal
          token={token}
          preselectedBills={selectedBills}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            setSelectedBillIds([]);
            fetchReadyBills();
            if (onTripCreated) onTripCreated();
          }}
        />
      )}
    </div>
  );
}
