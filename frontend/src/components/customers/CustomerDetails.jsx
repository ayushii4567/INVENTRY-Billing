import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Store, 
  Phone, 
  MapPin, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  FileText, 
  ShoppingBag, 
  Coins, 
  Clock, 
  Edit3, 
  ShieldAlert,
  Layers,
  Sparkles
} from "lucide-react";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import PartyLedger from "../ledger/PartyLedger";

export default function CustomerDetails({ customer, token, onBack, onOpenEditModal, onOpenStatusModal }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (activeTab === "orders" && customer?.id) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError("");
        try {
          const authToken = token || localStorage.getItem("erp_token") || localStorage.getItem("distributor_token");
          const res = await fetch(`http://localhost:5005/api/customers/${customer.id}/orders`, {
            headers: { "Authorization": `Bearer ${authToken}` }
          });
          const json = await res.json();
          if (res.ok && json.success) {
            setCustomerOrders(json.data || []);
          } else {
            setOrdersError(json.message || "Failed to load customer orders");
          }
        } catch (err) {
          console.error("Fetch customer orders error:", err);
          setOrdersError("Unable to connect to orders service");
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, customer?.id, token]);

  if (!customer) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700" }}>● ACTIVE</span>;
      case "BLOCKED":
        return <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700" }}>● BLOCKED</span>;
      case "ON_HOLD":
        return <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700" }}>● ON HOLD</span>;
      default:
        return <span style={{ background: "rgba(100, 116, 139, 0.15)", color: "#64748b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "700" }}>● {status}</span>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Back Button & Actions Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            color: "var(--text-main)",
            padding: "8px 16px",
            borderRadius: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.88rem",
            fontWeight: "600"
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Customers List</span>
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => onOpenEditModal(customer)}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-card)",
              color: "var(--primary-400)",
              padding: "8px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => onOpenStatusModal(customer)}
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#f59e0b",
              padding: "8px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: "600"
            }}
          >
            <ShieldAlert size={16} />
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner Card */}
      <div className="glass-card" style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                {customer.shopName}
              </h1>
              {getStatusBadge(customer.status)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              <span>Code: <strong style={{ color: "var(--primary-400)" }}>{customer.customerCode}</strong></span>
              <span>•</span>
              <span>Owner: <strong style={{ color: "var(--text-main)" }}>{customer.ownerName || "N/A"}</strong></span>
              <span>•</span>
              <span>Mobile: <strong style={{ color: "var(--text-main)" }}>{customer.mobile}</strong></span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "14px",
              padding: "12px 20px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Credit Limit</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#10b981" }}>{formatCurrency(customer.creditLimit)}</div>
            </div>

            <div style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "14px",
              padding: "12px 20px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Opening Balance</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)" }}>{formatCurrency(customer.openingBalance)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "1px solid var(--border-card)",
        paddingBottom: "4px"
      }}>
        {[
          { id: "overview", label: "Master Overview", icon: Store },
          { id: "orders", label: "Orders", icon: ShoppingBag },
          { id: "ledger", label: "Party Ledger", icon: Layers },
          { id: "bills", label: "Bills & Invoices", icon: FileText, placeholder: true },
          { id: "payments", label: "Payments", icon: Coins, placeholder: true }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? "var(--badge-brand-bg)" : "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--primary-400)" : "2px solid transparent",
                color: isActive ? "var(--primary-400)" : "var(--text-muted)",
                padding: "10px 18px",
                borderRadius: "10px 10px 0 0",
                fontSize: "0.88rem",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <IconComp size={16} />
              <span>{tab.label}</span>
              {tab.placeholder && (
                <span style={{ fontSize: "0.68rem", opacity: 0.6, background: "var(--bg-input)", padding: "1px 6px", borderRadius: "6px" }}>Next</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* Outlet Details Card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", borderBottom: "1px solid var(--border-card)", paddingBottom: "10px" }}>
              Outlet Address & Beat Location
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.9rem" }}>
              <div>
                <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "block" }}>Full Address</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{customer.address}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "block" }}>Route / Beat</span>
                  <span style={{ color: "var(--primary-400)", fontWeight: "700" }}>{customer.routeName} ({customer.routeId})</span>
                </div>

                <div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "block" }}>Area Zone</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{customer.areaName} ({customer.areaId})</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "block" }}>Assigned Field Salesman</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{customer.salesmanName}</span>
                </div>

                <div>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", display: "block" }}>Payment Terms</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{customer.paymentTerms}</span>
                </div>
              </div>

              {customer.notes && (
                <div style={{ background: "var(--bg-input)", padding: "12px 16px", borderRadius: "12px" }}>
                  <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block", marginBottom: "2px" }}>Notes / Remarks</span>
                  <span style={{ color: "var(--text-sub)", fontSize: "0.85rem" }}>{customer.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Metadata Card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", borderBottom: "1px solid var(--border-card)", paddingBottom: "10px" }}>
              Audit & Record Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "0.88rem" }}>
              <div>
                <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>Created By</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{customer.createdBy}</span>
              </div>

              <div>
                <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>Created Date</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{new Date(customer.createdAt).toLocaleString()}</span>
              </div>

              <div>
                <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>Last Updated By</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{customer.updatedBy}</span>
              </div>

              <div>
                <span style={{ color: "var(--text-dim)", fontSize: "0.78rem", display: "block" }}>Last Updated Timestamp</span>
                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{new Date(customer.updatedAt).toLocaleString()}</span>
              </div>

              {customer.statusReason && (
                <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: "12px", borderRadius: "10px", color: "#fca5a5" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", display: "block" }}>Status Exception Reason</span>
                  <span style={{ fontSize: "0.82rem" }}>{customer.statusReason}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Orders Tab View */}
      {activeTab === "orders" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Order History for {customer.shopName}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                All booked sales orders from territory sales beats
              </p>
            </div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
              Total Orders: {customerOrders.length}
            </span>
          </div>

          {ordersLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading order history...
            </div>
          ) : ordersError ? (
            <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "#f87171", borderRadius: "10px", fontSize: "0.85rem" }}>
              {ordersError}
            </div>
          ) : customerOrders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              No orders booked for this outlet yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-card)", textAlign: "left", color: "var(--text-dim)" }}>
                    <th style={{ padding: "10px 12px" }}>Order No</th>
                    <th style={{ padding: "10px 12px" }}>Date</th>
                    <th style={{ padding: "10px 12px" }}>Salesman</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Items</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Grand Total</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map(ord => (
                    <tr key={ord.id} style={{ borderBottom: "1px solid var(--border-card)" }}>
                      <td style={{ padding: "12px", fontWeight: "700", fontFamily: "monospace", color: "var(--primary-400)" }}>
                        {ord.orderNumber}
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-muted)" }}>
                        {new Date(ord.orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px", color: "var(--text-main)" }}>
                        {ord.salesmanSnapshot?.salesmanName || "Field Salesman"}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", color: "var(--text-sub)" }}>
                        {ord.pricingSummary?.totalLines || ord.items?.length || 0} lines ({ord.pricingSummary?.totalQuantity || 0} units)
                      </td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: "800", color: "var(--text-main)" }}>
                        ₹{(ord.pricingSummary?.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <OrderStatusBadge status={ord.orderStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customer Ledger Statement */}
      {activeTab === "ledger" && (
        <PartyLedger
          token={token}
          initialPartyType="CUSTOMER"
          initialPartyId={customer.id || customer._id}
          embedded={true}
        />
      )}

      {/* Future Module Tab Placeholders */}
      {activeTab !== "overview" && activeTab !== "orders" && activeTab !== "ledger" && (
        <div className="glass-card" style={{ padding: "60px", textAlign: "center" }}>
          <Sparkles size={40} color="var(--primary-400)" style={{ marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
            {activeTab.toUpperCase()} Module Integration
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "500px", margin: "0 auto" }}>
            This customer's live transaction history, bills, and ledger balances will automatically populate when the {activeTab.toUpperCase()} module is built in upcoming steps.
          </p>
        </div>
      )}

    </div>
  );
}
