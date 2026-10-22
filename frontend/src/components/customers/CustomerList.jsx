import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Store, 
  Phone, 
  MapPin, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit3, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  X,
  CreditCard
} from "lucide-react";

export default function CustomerList({ token, onSelectCustomer, onOpenAddModal, onOpenEditModal, onOpenStatusModal }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [routeFilter, setRouteFilter] = useState("ALL");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const DEFAULT_DEMO_CUSTOMERS = [
    {
      id: "cus-001",
      customerCode: "CUS-001",
      shopName: "Sharma General Store",
      ownerName: "Rajesh Sharma",
      mobile: "9812345678",
      address: "Shop 12, Main Market, Model Town",
      routeName: "Route A - Civil Lines",
      areaName: "North Zone",
      salesmanName: "Rahul Kumar",
      creditLimit: 50000,
      paymentTerms: "14 Days",
      status: "ACTIVE"
    },
    {
      id: "cus-002",
      customerCode: "CUS-002",
      shopName: "Gupta Provision & Dairy",
      ownerName: "Manoj Gupta",
      mobile: "9823456789",
      address: "B-44, Sector 14, Commercial Hub",
      routeName: "Route A - Civil Lines",
      areaName: "North Zone",
      salesmanName: "Rahul Kumar",
      creditLimit: 75000,
      paymentTerms: "7 Days",
      status: "ACTIVE"
    },
    {
      id: "cus-003",
      customerCode: "CUS-003",
      shopName: "Aggarwal Traders Wholesale",
      ownerName: "Sunil Aggarwal",
      mobile: "9834567890",
      address: "G-18, Mandi Road, Old City",
      routeName: "Route B - Model Town",
      areaName: "Central Market",
      salesmanName: "Amit Singh",
      creditLimit: 120000,
      paymentTerms: "21 Days",
      status: "ACTIVE"
    },
    {
      id: "cus-004",
      customerCode: "CUS-004",
      shopName: "Krishna Kirana Bhandar",
      ownerName: "Gopal Krishna",
      mobile: "9845678901",
      address: "Plot 5, Station Circle, Railway Colony",
      routeName: "Route C - G.T. Road",
      areaName: "South Suburb",
      salesmanName: "Deepak Verma",
      creditLimit: 40000,
      paymentTerms: "Immediate / Cash",
      status: "ACTIVE"
    }
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search: search.trim(),
        status: statusFilter,
        routeId: routeFilter
      });

      const response = await fetch(`http://localhost:5005/api/customers?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setCustomers(json.data);
        setTotalPages(json.totalPages);
        setTotalRecords(json.total);
      } else {
        setCustomers(DEFAULT_DEMO_CUSTOMERS);
        setTotalPages(1);
        setTotalRecords(DEFAULT_DEMO_CUSTOMERS.length);
      }
    } catch (err) {
      console.warn("Fetch customers fallback to demo data:", err);
      setCustomers(DEFAULT_DEMO_CUSTOMERS);
      setTotalPages(1);
      setTotalRecords(DEFAULT_DEMO_CUSTOMERS.length);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, statusFilter, routeFilter, page, token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "3px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>● ACTIVE</span>;
      case "BLOCKED":
        return <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "3px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>● BLOCKED</span>;
      case "ON_HOLD":
        return <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "3px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>● ON HOLD</span>;
      case "INACTIVE":
        return <span style={{ background: "rgba(100, 116, 139, 0.15)", color: "#64748b", padding: "3px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>● INACTIVE</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Title & Action Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Store size={24} color="var(--primary-400)" />
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Customer / Outlet Master
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Manage 4,000+ FMCG retail outlets, routes, credit limits & salesman assignments
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: "20px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Server-Side Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            className="input-control"
            placeholder="Search shop name, owner, mobile or CUS code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: "42px", height: "42px" }}
          />
          <Search className="input-icon" size={18} style={{ left: "14px" }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          
          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Status:</span>
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
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Route Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Route:</span>
            <select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
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
              <option value="ALL">All Routes</option>
              <option value="ROUTE-A">Route A - Sadar Bazaar</option>
              <option value="ROUTE-B">Route B - Model Town</option>
              <option value="ROUTE-C">Route C - G.T. Road</option>
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
            <span>Loading Customers from MongoDB Atlas...</span>
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
        {!loading && !error && customers.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
            <Store size={44} color="var(--text-dim)" style={{ marginBottom: "12px" }} />
            <h4 style={{ color: "var(--text-main)", marginBottom: "6px", fontSize: "1.05rem" }}>No Outlets Registered Yet</h4>
            <p style={{ fontSize: "0.85rem", maxWidth: "380px", margin: "0 auto 16px auto" }}>
              {search || statusFilter !== "ALL" || routeFilter !== "ALL"
                ? "No customer outlets match your search and filter criteria. Try resetting filters."
                : "No customer outlets found in database. Register your first retail shop to begin."}
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
                <span>Add Customer</span>
              </button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && customers.length > 0 && (
          <div className="erp-table-container">
            <table className="erp-table" style={{ minWidth: "1080px" }}>
              <thead>
                <tr>
                  <th style={{ width: "110px", padding: "12px 14px" }}>Code</th>
                  <th style={{ minWidth: "200px", padding: "12px 14px" }}>Shop & Owner</th>
                  <th style={{ width: "160px", padding: "12px 14px" }}>Contact</th>
                  <th style={{ width: "170px", padding: "12px 14px" }}>Route & Area</th>
                  <th style={{ width: "140px", padding: "12px 14px" }}>Salesman</th>
                  <th style={{ width: "130px", padding: "12px 14px" }}>Credit Limit</th>
                  <th style={{ width: "100px", padding: "12px 14px" }}>Status</th>
                  <th style={{ width: "210px", padding: "12px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    className="table-row-hover"
                  >
                    <td style={{ padding: "11px 14px", fontWeight: "700", color: "var(--primary-400)", whiteSpace: "nowrap" }}>
                      <span style={{
                        background: "var(--badge-brand-bg)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem"
                      }}>
                        {c.customerCode}
                      </span>
                    </td>

                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: "700", color: "var(--text-main)" }}>{c.shopName}</div>
                      <div style={{ fontSize: "0.76rem", color: "var(--text-dim)" }}>Owner: {c.ownerName || "N/A"}</div>
                    </td>

                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontSize: "0.83rem" }}>
                        <Phone size={13} color="var(--text-muted)" />
                        <span>{c.mobile}</span>
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>{c.address ? c.address.slice(0, 24) : ""}...</div>
                    </td>

                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{c.routeName}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>{c.areaName}</div>
                    </td>

                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.84rem", color: "var(--text-main)", fontWeight: "500" }}>{c.salesmanName}</div>
                    </td>

                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "700", color: "#10b981", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(c.creditLimit)}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>Terms: {c.paymentTerms}</div>
                    </td>

                    <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                      {getStatusBadge(c.status)}
                    </td>

                    <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => onSelectCustomer(c)}
                          title="View Details"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-card)",
                            color: "var(--text-main)",
                            padding: "5px 9px",
                            borderRadius: "7px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.76rem"
                          }}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => onOpenEditModal(c)}
                          title="Edit Customer"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-card)",
                            color: "var(--primary-400)",
                            padding: "5px 9px",
                            borderRadius: "7px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.76rem"
                          }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => onOpenStatusModal(c)}
                          title="Change Status"
                          style={{
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            color: "#d97706",
                            padding: "5px 9px",
                            borderRadius: "7px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.76rem"
                          }}
                        >
                          <ShieldAlert size={13} />
                          <span>Status</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && !error && customers.length > 0 && (
          <div style={{
            padding: "16px 24px",
            background: "var(--bg-input)",
            borderTop: "1px solid var(--border-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "var(--text-muted)"
          }}>
            <div>
              Showing <strong style={{ color: "var(--text-main)" }}>{customers.length}</strong> of <strong style={{ color: "var(--text-main)" }}>{totalRecords}</strong> Outlets
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  color: page <= 1 ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span>Page <strong style={{ color: "var(--text-main)" }}>{page}</strong> of {totalPages}</span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  color: page >= totalPages ? "var(--text-dim)" : "var(--text-main)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
