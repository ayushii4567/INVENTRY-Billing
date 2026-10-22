import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Package
} from "lucide-react";
import { TripStatusBadge } from "./TripStatusBadge";
import CreateTripModal from "./CreateTripModal";

export default function DeliveryTripList({ token, user, onSelectTrip, onOpenCreate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const qParams = new URLSearchParams({
        page: String(page),
        limit: "20"
      });
      if (statusFilter !== "ALL") qParams.append("status", statusFilter);
      if (search.trim()) qParams.append("search", search.trim());

      const res = await fetch(`http://localhost:5005/api/delivery/trips?${qParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTrips(json.data || []);
        setTotalPages(json.totalPages || 1);
      } else {
        setError(json.message || "Failed to load delivery trips.");
      }
    } catch (err) {
      console.error("fetchTrips error:", err);
      setError("Unable to connect to delivery trip service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, page, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTrips();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

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

      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: "20px 28px",
        background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.25)",
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
            background: "rgba(99, 102, 241, 0.15)",
            color: "var(--primary-400)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(99, 102, 241, 0.3)"
          }}>
            <Truck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
              Delivery Trips & Dispatch
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Track vehicle delivery trips, driver assignments, and customer drop completion
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchTrips}
            className="btn-secondary"
            style={{ padding: "10px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={16} />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", background: "var(--bg-secondary)", padding: "4px", borderRadius: "10px" }}>
          {[
            { id: "ALL", label: "All Trips" },
            { id: "READY", label: "Ready" },
            { id: "DISPATCHED", label: "Dispatched" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "COMPLETED", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(1); }}
              style={{
                background: statusFilter === tab.id ? "var(--badge-brand-bg)" : "transparent",
                color: statusFilter === tab.id ? "var(--primary-400)" : "var(--text-muted)",
                border: "none",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ minWidth: "280px", position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trip #, vehicle, driver, route..."
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: "10px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
        </form>
      </div>

      {/* Trips Table */}
      <div className="erp-table-container">
        <table className="erp-table" style={{ minWidth: "1050px" }}>
          <thead>
            <tr>
              <th style={{ minWidth: "140px" }}>Trip Number</th>
              <th style={{ minWidth: "160px" }}>Vehicle & Driver</th>
              <th style={{ minWidth: "150px" }}>Route / Beat</th>
              <th style={{ minWidth: "140px" }}>Date & Time</th>
              <th style={{ minWidth: "180px" }}>Deliveries Progress</th>
              <th style={{ minWidth: "130px", textAlign: "right" }}>Cargo Value</th>
              <th style={{ minWidth: "120px", textAlign: "center" }}>Status</th>
              <th style={{ minWidth: "90px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "50px", textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ width: "32px", height: "32px", border: "3px solid rgba(99, 102, 241, 0.2)", borderTopColor: "var(--primary-400)", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                  <p>Loading delivery trips...</p>
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                  <Truck size={40} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>No Delivery Trips Found</div>
                  <p style={{ fontSize: "0.82rem", margin: "6px auto 16px" }}>
                    No trips match the active filter. Click "Plan New Trip" to create a delivery run.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                    style={{ padding: "8px 18px", fontSize: "0.82rem" }}
                  >
                    + Plan First Delivery Trip
                  </button>
                </td>
              </tr>
            ) : (
              trips.map((trip) => {
                const total = trip.totalBills || trip.deliveries?.length || 0;
                const delivered = trip.deliveredBills || trip.deliveries?.filter((d) => d.status === "DELIVERED").length || 0;
                const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;

                return (
                  <tr key={trip.id || trip.tripNumber}>
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "800", color: "var(--text-main)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem" }}>
                        {trip.tripNumber}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {total} Customer Drops
                      </div>
                    </td>

                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)", whiteSpace: "nowrap" }}>
                        {trip.vehicleNumber}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        👤 {trip.driverName}
                      </div>
                    </td>

                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} />
                        {trip.routeName || "Route Beat"}
                      </span>
                    </td>

                    <td style={{ padding: "11px 14px", color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      <div>{new Date(trip.tripDate).toLocaleDateString("en-IN")}</div>
                      {trip.dispatchTime && (
                        <div style={{ fontSize: "0.72rem", color: "#0ea5e9" }}>
                          Dispatched: {new Date(trip.dispatchTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "11px 14px", width: "170px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)" }}>
                          {delivered}/{total} Delivered
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>{percent}%</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: percent === 100 ? "#10b981" : "var(--primary-500)",
                          borderRadius: "4px"
                        }} />
                      </div>
                    </td>

                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "800", color: "#34d399", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      ₹{Number(trip.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <TripStatusBadge status={trip.status} />
                    </td>

                    <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => onSelectTrip(trip)}
                        className="btn-secondary"
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <span>View</span>
                        <ArrowRight size={13} />
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
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            fetchTrips();
          }}
        />
      )}
    </div>
  );
}
