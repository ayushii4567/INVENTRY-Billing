import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Package, 
  Tag, 
  Layers, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Percent,
  Boxes
} from "lucide-react";

export default function ProductList({ 
  token, 
  userRole = "SUPER_ADMIN",
  onSelectProduct, 
  onOpenAddModal, 
  onOpenEditModal, 
  onOpenStatusModal 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const canModify = userRole !== "SALESMAN";

  const DEFAULT_DEMO_PRODUCTS = [
    {
      id: "prd-001",
      productCode: "PRD-000001",
      sku: "STD-ITM-001",
      skuCode: "STD-ITM-001",
      productName: "Standard Item A (Finished Goods)",
      name: "Standard Item A (Finished Goods)",
      companyId: "GRP-FINISHED",
      companyName: "Finished Goods",
      category: "Finished Goods",
      subcategory: "General Standard Items",
      hsnCode: "84713010",
      packagingUnit: "PCS",
      unit: "PCS",
      packSize: "1 Pc",
      mrp: 1200,
      saleRate: 1050,
      purchaseRate: 850,
      taxRate: 18,
      gstRate: 18,
      minimumStock: 50,
      currentStock: 500,
      status: "ACTIVE"
    },
    {
      id: "prd-002",
      productCode: "PRD-000002",
      sku: "TRD-BOX-050",
      skuCode: "TRD-BOX-050",
      productName: "Commercial Pack Box (50 Units)",
      name: "Commercial Pack Box (50 Units)",
      companyId: "GRP-TRADING",
      companyName: "Trading Goods",
      category: "Trading Goods",
      subcategory: "Packaged Commercial Goods",
      hsnCode: "48191010",
      packagingUnit: "BOX",
      unit: "BOX",
      packSize: "50 Units",
      mrp: 2000,
      saleRate: 1750,
      purchaseRate: 1400,
      taxRate: 12,
      gstRate: 12,
      minimumStock: 40,
      currentStock: 350,
      status: "ACTIVE"
    },
    {
      id: "prd-003",
      productCode: "PRD-000003",
      sku: "IND-ASM-101",
      skuCode: "IND-ASM-101",
      productName: "Industrial Assembly Unit Type-1",
      name: "Industrial Assembly Unit Type-1",
      companyId: "GRP-FINISHED",
      companyName: "Finished Goods",
      category: "Finished Goods",
      subcategory: "Assemblies & Modules",
      hsnCode: "85044090",
      packagingUnit: "NOS",
      unit: "NOS",
      packSize: "1 No",
      mrp: 3000,
      saleRate: 2600,
      purchaseRate: 2100,
      taxRate: 18,
      gstRate: 18,
      minimumStock: 25,
      currentStock: 150,
      status: "ACTIVE"
    },
    {
      id: "prd-004",
      productCode: "PRD-000004",
      sku: "HRD-FST-100",
      skuCode: "HRD-FST-100",
      productName: "Hardware Fasteners Assorted Kit",
      name: "Hardware Fasteners Assorted Kit",
      companyId: "GRP-TRADING",
      companyName: "Trading Goods",
      category: "Trading Goods",
      subcategory: "Fasteners & Fixtures",
      hsnCode: "73181500",
      packagingUnit: "SET",
      unit: "SET",
      packSize: "1 Set (100 Pcs)",
      mrp: 320,
      saleRate: 280,
      purchaseRate: 220,
      taxRate: 18,
      gstRate: 18,
      minimumStock: 30,
      currentStock: 200,
      status: "ACTIVE"
    },
    {
      id: "prd-005",
      productCode: "PRD-000005",
      sku: "RAW-MAT-025",
      skuCode: "RAW-MAT-025",
      productName: "Bulk Raw Material Pack 25kg",
      name: "Bulk Raw Material Pack 25kg",
      companyId: "GRP-RAW",
      companyName: "Raw Materials",
      category: "Raw Materials",
      subcategory: "Primary Bulk Input",
      hsnCode: "25010010",
      packagingUnit: "BAG",
      unit: "BAG",
      packSize: "25 Kg",
      mrp: 900,
      saleRate: 800,
      purchaseRate: 650,
      taxRate: 5,
      gstRate: 5,
      minimumStock: 30,
      currentStock: 180,
      status: "ACTIVE"
    },
    {
      id: "prd-006",
      productCode: "PRD-000006",
      sku: "CON-GEN-012",
      skuCode: "CON-GEN-012",
      productName: "General Consumable Pack (Grade A)",
      name: "General Consumable Pack (Grade A)",
      companyId: "GRP-CONSUMABLES",
      companyName: "Consumables",
      category: "Consumables",
      subcategory: "General Operational Supply",
      hsnCode: "38140010",
      packagingUnit: "PKT",
      unit: "PKT",
      packSize: "12 Pkts",
      mrp: 550,
      saleRate: 480,
      purchaseRate: 380,
      taxRate: 18,
      gstRate: 18,
      minimumStock: 50,
      currentStock: 300,
      status: "ACTIVE"
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        companyId: companyFilter,
        category: categoryFilter,
        status: statusFilter
      });

      const response = await fetch(`http://localhost:5005/api/products?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setProducts(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setProducts(DEFAULT_DEMO_PRODUCTS);
        setTotalPages(1);
        setTotalRecords(DEFAULT_DEMO_PRODUCTS.length);
      }
    } catch (err) {
      console.warn("Fetch products fallback to demo catalog:", err);
      setProducts(DEFAULT_DEMO_PRODUCTS);
      setTotalPages(1);
      setTotalRecords(DEFAULT_DEMO_PRODUCTS.length);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [search, companyFilter, categoryFilter, statusFilter, page]);

  const getCompanyBadge = (companyId, companyName) => {
    const id = (companyId || "").toUpperCase();
    const name = (companyName || "").toUpperCase();

    if (id.includes("FINISHED") || name.includes("FINISHED")) {
      return { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
    }
    if (id.includes("TRADING") || name.includes("TRADING")) {
      return { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
    }
    if (id.includes("RAW") || name.includes("RAW")) {
      return { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
    }
    if (id.includes("CONSUMABLE") || name.includes("CONSUMABLE")) {
      return { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "rgba(168, 85, 247, 0.3)" };
    }
    return { bg: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "rgba(14, 165, 233, 0.3)" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header Section */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Product Master
            </h2>
            <span style={{
              background: "var(--badge-brand-bg)",
              color: "var(--primary-400)",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "3px 10px",
              borderRadius: "20px",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}>
              {totalRecords} Stock Items
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Standard stock items catalog with Tally ERP stock groups, HSN codes, and GST rates
          </p>
        </div>

        {/* Action Button: Add Product (Hidden for Salesmen) */}
        {canModify && (
          <button
            onClick={onOpenAddModal}
            className="glow-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)"
            }}
          >
            <Plus size={18} />
            <span>Add Stock Item</span>
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card" style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px"
      }}>
        
        {/* Search Input */}
        <div style={{
          position: "relative",
          flex: "1 1 280px",
          minWidth: "240px"
        }}>
          <Search size={18} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search stock item / SKU / HSN / code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              color: "var(--text-main)",
              borderRadius: "12px",
              padding: "10px 16px 10px 42px",
              fontSize: "0.88rem",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Filters Group */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          
          {/* Stock Group Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Building2 size={16} color="var(--text-dim)" />
            <select
              value={companyFilter}
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-main)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="ALL">All Stock Groups</option>
              <option value="GRP-FINISHED">Finished Goods</option>
              <option value="GRP-TRADING">Trading Goods</option>
              <option value="GRP-RAW">Raw Materials</option>
              <option value="GRP-CONSUMABLES">Consumables</option>
              <option value="GRP-GENERAL">General Goods</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={16} color="var(--text-dim)" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-main)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Finished Goods">Finished Goods</option>
              <option value="Trading Goods">Trading Goods</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Consumables">Consumables</option>
              <option value="General Goods">General Goods</option>
              <option value="Packaging Materials">Packaging Materials</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-card)",
                color: "var(--text-main)",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                outline: "none"
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

        </div>

      </div>

      {/* Table & Content Section */}
      <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
        
        {/* Loading */}
        {loading && (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(99, 102, 241, 0.2)",
              borderTopColor: "var(--primary-400)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto"
            }} />
            <span>Loading Stock Items from Product Master...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: "40px", textAlign: "center", color: "#fca5a5" }}>
            <AlertCircle size={32} style={{ marginBottom: "12px" }} />
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Package size={44} color="var(--text-dim)" style={{ marginBottom: "12px" }} />
            <h4 style={{ color: "var(--text-main)", marginBottom: "6px", fontSize: "1.05rem" }}>No Stock Items In Master</h4>
            <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px auto" }}>
              {search || companyFilter !== "ALL" || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "No products match your filter criteria. Try clearing search filters."
                : "Your product master catalog is empty. Add your first stock item to begin inventory and billing."}
            </p>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
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
                <span>Add Stock Item</span>
              </button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && products.length > 0 && (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1200px" }}>
              <thead>
                <tr>
                  <th style={{ width: "115px", padding: "12px 14px" }}>Item Code</th>
                  <th style={{ width: "125px", padding: "12px 14px" }}>SKU / Part No.</th>
                  <th style={{ minWidth: "200px", padding: "12px 14px" }}>Stock Item Name</th>
                  <th style={{ width: "130px", padding: "12px 14px" }}>Stock Group</th>
                  <th style={{ width: "110px", padding: "12px 14px" }}>Category</th>
                  <th style={{ width: "100px", padding: "12px 14px" }}>HSN Code</th>
                  <th style={{ width: "90px", padding: "12px 14px" }}>UoM</th>
                  <th style={{ width: "95px", padding: "12px 14px", textAlign: "right" }}>MRP</th>
                  <th style={{ width: "95px", padding: "12px 14px", textAlign: "right" }}>Sale Rate</th>
                  <th style={{ width: "70px", padding: "12px 14px", textAlign: "right" }}>GST %</th>
                  <th style={{ width: "85px", padding: "12px 14px", textAlign: "center" }}>Min Stock</th>
                  <th style={{ width: "95px", padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "90px", padding: "12px 14px", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => {
                  const companyStyle = getCompanyBadge(p.companyId, p.companyName);
                  const isActive = p.status === "ACTIVE";

                  return (
                    <tr 
                      key={p.id ? `${p.id}-${p.productCode || idx}` : idx}
                      className="table-row-hover"
                    >
                      {/* Product Code */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: "var(--badge-brand-bg)",
                          color: "var(--primary-400)",
                          fontWeight: "700",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontFamily: "var(--font-mono)"
                        }}>
                          {p.productCode}
                        </span>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: "11px 14px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {p.sku}
                      </td>

                      {/* Product Name */}
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontWeight: "600", color: "var(--text-main)", lineHeight: 1.35 }}>
                          {p.productName}
                        </div>
                        {p.subcategory && (
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {p.subcategory}
                          </div>
                        )}
                      </td>

                      {/* Stock Group */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: companyStyle.bg,
                          color: companyStyle.color,
                          border: `1px solid ${companyStyle.border}`,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.74rem",
                          fontWeight: "700",
                          display: "inline-block",
                          whiteSpace: "nowrap"
                        }}>
                          {p.companyName || "Finished Goods"}
                        </span>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "11px 14px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {p.category}
                      </td>

                      {/* HSN Code */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          color: "var(--text-dim)",
                          background: "var(--bg-input)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-card)"
                        }}>
                          {p.hsnCode || "84713010"}
                        </span>
                      </td>

                      {/* Unit / Pack Size */}
                      <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{p.unit}</span>
                        {p.packSize && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                            ({p.packSize})
                          </span>
                        )}
                      </td>

                      {/* MRP */}
                      <td style={{ padding: "11px 14px", textAlign: "right", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontWeight: "500" }}>
                        ₹{(p.mrp || 0).toFixed(2)}
                      </td>

                      {/* Sale Rate */}
                      <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", color: "#10b981", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        ₹{(p.saleRate || 0).toFixed(2)}
                      </td>

                      {/* Tax Rate */}
                      <td style={{ padding: "11px 14px", textAlign: "right", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {p.taxRate || p.gstRate || 0}%
                      </td>

                      {/* Min Stock */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: "var(--bg-input)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-card)"
                        }}>
                          {p.minimumStock}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{
                          background: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: isActive ? "#059669" : "#dc2626",
                          border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
                          padding: "3px 9px",
                          borderRadius: "20px",
                          fontSize: "0.73rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          whiteSpace: "nowrap"
                        }}>
                          <span style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: isActive ? "#10b981" : "#ef4444"
                          }} />
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "11px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          
                          {/* View Details */}
                          <button
                            onClick={() => onSelectProduct(p)}
                            title="View Product Details"
                            style={{
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-card)",
                              color: "var(--text-muted)",
                              padding: "6px",
                              borderRadius: "7px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Product (Permitted roles only) */}
                          {canModify && (
                            <button
                              onClick={() => onOpenEditModal(p)}
                              title="Edit Product"
                              style={{
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-card)",
                                color: "var(--text-muted)",
                                padding: "6px",
                                borderRadius: "7px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <Edit3 size={15} />
                            </button>
                          )}

                          {/* Status Toggle (Permitted roles only) */}
                          {canModify && (
                            <button
                              onClick={() => onOpenStatusModal(p)}
                              title={isActive ? "Deactivate Product" : "Activate Product"}
                              style={{
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-card)",
                                color: isActive ? "#f87171" : "#34d399",
                                padding: "6px",
                                borderRadius: "7px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s ease"
                              }}
                            >
                              {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && !error && products.length > 0 && (
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            background: "var(--table-header-bg)"
          }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Showing <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{products.length}</span> of <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{totalRecords}</span> products • Page {page} of {totalPages}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  color: page <= 1 ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ChevronLeft size={15} />
                <span>Prev</span>
              </button>

              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", padding: "0 8px" }}>
                {page} / {totalPages}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  color: page >= totalPages ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
