import React, { useState } from "react";
import { X, Truck, User, Phone, AlertCircle, Check } from "lucide-react";

export default function VehicleModal({ vehicle = null, token, onClose, onSuccess }) {
  const isEditing = !!vehicle;
  const [vehicleNumber, setVehicleNumber] = useState(vehicle?.vehicleNumber || "");
  const [vehicleType, setVehicleType] = useState(vehicle?.vehicleType || "Mini Truck");
  const [capacity, setCapacity] = useState(vehicle?.capacity || "2500 KG");
  const [driverName, setDriverName] = useState(vehicle?.driverName || "");
  const [driverMobile, setDriverMobile] = useState(vehicle?.driverMobile || "");
  const [status, setStatus] = useState(vehicle?.status || "AVAILABLE");
  const [notes, setNotes] = useState(vehicle?.notes || "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) {
      setError("Vehicle registration number is required.");
      return;
    }
    if (!driverName.trim()) {
      setError("Driver name is required.");
      return;
    }
    if (!driverMobile.trim()) {
      setError("Driver mobile number is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const url = isEditing
        ? `http://localhost:5005/api/vehicles/${vehicle.id || vehicle.vehicleNumber}`
        : "http://localhost:5005/api/vehicles";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleNumber: vehicleNumber.toUpperCase().trim(),
          vehicleType,
          capacity,
          driverName: driverName.trim(),
          driverMobile: driverMobile.trim(),
          status,
          notes: notes.trim()
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onSuccess(json.message || (isEditing ? "Vehicle updated!" : "Vehicle registered!"));
        onClose();
      } else {
        setError(json.message || "Failed to save vehicle.");
      }
    } catch (err) {
      console.error("Save vehicle error:", err);
      setError("Network error saving vehicle details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 1200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "520px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.7)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--table-header-bg)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--primary-600)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Truck size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                {isEditing ? "Edit Vehicle Details" : "Register Fleet Vehicle"}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                Distribution transport fleet management
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Vehicle Number (Registration) *
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. CG04AB1234"
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Vehicle Type *
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              >
                <option value="Mini Truck">Mini Truck</option>
                <option value="Delivery Van">Delivery Van</option>
                <option value="Truck">Truck</option>
                <option value="Three Wheeler Cargo">Three Wheeler Cargo</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Load Capacity *
              </label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 2500 KG"
                required
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ON_TRIP">ON_TRIP</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Driver Name *
              </label>
              <div style={{ position: "relative" }}>
                <User size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 32px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                Driver Mobile *
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={driverMobile}
                  onChange={(e) => setDriverMobile(e.target.value)}
                  placeholder="e.g. 9826101122"
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 32px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
              Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned to Sadar Bazaar beat"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.82rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "0.82rem" }}
            >
              {submitting ? "Saving..." : isEditing ? "Update Vehicle" : "Register Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
