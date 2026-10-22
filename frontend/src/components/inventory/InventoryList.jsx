import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Sliders, 
  Package, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { InventoryStatusBadge } from "./InventoryStatusBadge";
import StockAdjustmentModal from "./StockAdjustmentModal";

export default function InventoryList({
  token,
  user,
  onSelectInventory,
  initialStatusFilter = "ALL"
}) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState(initialStatusFilter);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Active adjustment modal
  const [adjustingItem, setAdjustingItem] = useState(null);

  const canAdjustStock = ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(user?.role);

  const fetchInventory = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        companyId,
        category,
        status
      });

      const response = await fetch(`http://localhost:5005/api/inventory?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setInventory(json.data || []);
        setTotalPages(json.totalPages || 1);
        setTotalRecords(json.total || 0);
      } else {
        setError(json.message || "Failed to load inventory stock list.");
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
      setError("Unable to connect to inventory server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, companyId, category, status, page]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast Alert */}
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

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--primary-600)", fontSize: "0.82rem", fontWeight: "800", marginBottom: "4px" }}>
            <Package size={16} />
            PHYSICAL INVENTORY TRACKING
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em", margin: 0 }}>
            Stock Master & Inventory Register
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time physical on-hand inventory, available stock to promise, and threshold monitoring.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            color: "var(--text-main)",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "0.82rem",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} color="var(--primary-500)" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Input */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Product Name, Code, SKU, Category, or Brand..."
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

          {/* Stock Group Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Stock Group:</span>
            {[
              { id: "ALL", label: "All Groups" },
              { id: "GRP-FINISHED", label: "Finished Goods" },
              { id: "GRP-TRADING", label: "Trading Goods" },
              { id: "GRP-RAW", label: "Raw Materials" },
              { id: "GRP-CONSUMABLES", label: "Consumables" }
            ].map((co) => (
              <button
                key={co.id}
                onClick={() => {
                  setCompanyId(co.id);
                  setPage(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: companyId === co.id ? "1px solid var(--primary-500)" : "1px solid var(--border-card)",
                  background: companyId === co.id ? "var(--primary-500)" : "var(--bg-card)",
                  color: companyId === co.id ? "#ffffff" : "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {co.label}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Status:</span>
            {[
              { id: "ALL", label: "All" },
              { id: "IN_STOCK", label: "In Stock" },
              { id: "LOW_STOCK", label: "Low Stock" },
              { id: "OUT_OF_STOCK", label: "Out of Stock" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatus(st.id);
                  setPage(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: status === st.id ? "1px solid var(--text-main)" : "1px solid var(--border-card)",
                  background: status === st.id ? "var(--text-main)" : "var(--bg-card)",
                  color: status === st.id ? "#ffffff" : "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                {st.label}
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
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--primary-500)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite"
            }} />
            <p style={{ fontSize: "0.9rem", fontWeight: "600" }}>Loading inventory records...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            <AlertCircle size={36} color="#ef4444" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: "700", fontSize: "0.95rem" }}>{error}</p>
            <button
              onClick={fetchInventory}
              className="btn-primary"
              style={{ marginTop: "14px", padding: "6px 16px", fontSize: "0.8rem" }}
            >
              Retry
            </button>
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Package size={44} style={{ margin: "0 auto 12px", color: "var(--text-dim)" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", margin: "0 0 6px" }}>No Stock Inventory Records</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto" }}>
              {search || companyId !== "ALL" || category !== "ALL" || status !== "ALL"
                ? "No inventory matches your active filter criteria. Try resetting filters."
                : "No products in warehouse inventory. Once items are registered in Product Master, stock levels will track here."}
            </p>
          </div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1050px" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: "220px", padding: "12px 14px" }}>Product Details</th>
                  <th style={{ width: "160px", padding: "12px 14px" }}>Stock Group & Category</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "right" }}>Current Stock</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "right" }}>Available</th>
                  <th style={{ width: "100px", padding: "12px 14px", textAlign: "right" }}>Min Stock</th>
                  <th style={{ width: "120px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "130px", padding: "12px 14px" }}>Last Movement</th>
                  <th style={{ width: "130px", padding: "12px 14px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.id || item._id}
                    onClick={() => onSelectInventory && onSelectInventory(item)}
                    style={{ cursor: "pointer" }}
                    className="table-row-hover"
                  >
                    {/* Product Name, SKU & Code */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.86rem" }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "2px", whiteSpace: "nowrap" }}>
                        {item.productCode} {item.sku ? `• ${item.sku}` : ""}
                      </div>
                    </td>

                    {/* Brand & Category */}
                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{item.companyName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.category}</div>
                    </td>

                    {/* Current Stock */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: "700", color: "var(--text-main)", fontSize: "0.90rem", whiteSpace: "nowrap" }}>
                      {(item.currentStock || 0).toLocaleString("en-IN")}{" "}
                      <span style={{ fontSize: "0.74rem", fontWeight: "normal", color: "var(--text-muted)" }}>{item.unit || "Units"}</span>
                    </td>

                    {/* Available Stock */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "0.90rem", whiteSpace: "nowrap" }}>
                      <span style={{ color: item.availableStock <= 0 ? "#dc2626" : "#059669" }}>
                        {(item.availableStock || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Minimum Stock */}
                    <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.84rem", whiteSpace: "nowrap" }}>
                      {item.minimumStock || 0}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                      <InventoryStatusBadge status={item.status} />
                    </td>

                    {/* Last Movement */}
                    <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {item.lastMovementAt ? new Date(item.lastMovementAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      }) : "-"}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                        <button
                          onClick={() => onSelectInventory && onSelectInventory(item)}
                          title="View Details"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-card)",
                            color: "var(--text-muted)",
                            padding: "5px 8px",
                            borderRadius: "7px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Eye size={14} />
                        </button>

                        {canAdjustStock && (
                          <button
                            onClick={() => setAdjustingItem(item)}
                            title="Manual Stock Adjustment"
                            style={{
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.25)",
                              color: "var(--primary-600)",
                              padding: "4px 8px",
                              borderRadius: "7px",
                              fontSize: "0.74rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Sliders size={12} />
                            <span>Adjust</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && inventory.length > 0 && (
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
              <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{totalRecords}</span> items
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

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <StockAdjustmentModal
          isOpen={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          inventory={adjustingItem}
          token={token}
          user={user}
          onSuccess={(result) => {
            showToast(`Adjusted stock for ${result.inventory.productName}! New stock: ${result.inventory.currentStock}`);
            setAdjustingItem(null);
            fetchInventory();
          }}
        />
      )}
    </div>
  );
}
