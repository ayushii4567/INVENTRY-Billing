// frontend/src/components/reports/ExecutiveReports.jsx
import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Clock, 
  Receipt, 
  Users, 
  AlertTriangle,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import ReportKpiCard from "./ReportKpiCard";
import SalesAnalytics from "./SalesAnalytics";
import CollectionAnalytics from "./CollectionAnalytics";
import TopCustomersReport from "./TopCustomersReport";
import TopProductsReport from "./TopProductsReport";
import SalesmanPerformanceReport from "./SalesmanPerformanceReport";
import ExceptionSummaryReport from "./ExceptionSummaryReport";

export default function ExecutiveReports({ token, user, onNavigateTab }) {
  const [dateRange, setDateRange] = useState("today"); // "today", "last7days", "thismonth"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Report States
  const [summaryData, setSummaryData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [collectionsData, setCollectionsData] = useState(null);
  const [topCustomersData, setTopCustomersData] = useState(null);
  const [topProductsData, setTopProductsData] = useState(null);
  const [salesmenData, setSalesmenData] = useState(null);
  const [exceptionsData, setExceptionsData] = useState(null);

  const fetchAllReports = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    try {
      const [
        summaryRes,
        salesRes,
        collRes,
        custRes,
        prodRes,
        salesmenRes,
        excRes
      ] = await Promise.all([
        fetch(`http://localhost:5005/api/reports/executive-summary?dateRange=${dateRange}`, { headers }),
        fetch(`http://localhost:5005/api/reports/sales?dateRange=${dateRange}`, { headers }),
        fetch(`http://localhost:5005/api/reports/collections?dateRange=${dateRange}`, { headers }),
        fetch(`http://localhost:5005/api/reports/top-customers`, { headers }),
        fetch(`http://localhost:5005/api/reports/top-products`, { headers }),
        fetch(`http://localhost:5005/api/reports/salesmen`, { headers }),
        fetch(`http://localhost:5005/api/reports/exceptions`, { headers })
      ]);

      const [
        summaryJson,
        salesJson,
        collJson,
        custJson,
        prodJson,
        salesmenJson,
        excJson
      ] = await Promise.all([
        summaryRes.json(),
        salesRes.json(),
        collRes.json(),
        custRes.json(),
        prodRes.json(),
        salesmenRes.json(),
        excRes.json()
      ]);

      if (summaryJson.success) setSummaryData(summaryJson.data);
      if (salesJson.success) setSalesData(salesJson.data);
      if (collJson.success) setCollectionsData(collJson.data);
      if (custJson.success) setTopCustomersData(custJson.data);
      if (prodJson.success) setTopProductsData(prodJson.data);
      if (salesmenJson.success) setSalesmenData(salesmenJson.data);
      if (excJson.success) setExceptionsData(excJson.data);
    } catch (err) {
      console.error("Error fetching executive reports:", err);
      setError("Unable to load report data. Please ensure the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner Header */}
      <div className="glass-card" style={{ padding: "24px", borderRadius: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--text-main)", margin: 0, letterSpacing: "-0.02em" }}>
                  EXECUTIVE BUSINESS REPORTS
                </h1>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  Distributor ERP • Complete Commercial & Field Analytics
                </span>
              </div>
            </div>
          </div>

          {/* Date Range Selector & Refresh Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "12px",
              padding: "4px",
              gap: "4px"
            }}>
              <button
                onClick={() => setDateRange("today")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: dateRange === "today" ? "var(--primary-400)" : "transparent",
                  color: dateRange === "today" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange("last7days")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: dateRange === "last7days" ? "var(--primary-400)" : "transparent",
                  color: dateRange === "last7days" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange("thismonth")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  background: dateRange === "thismonth" ? "var(--primary-400)" : "transparent",
                  color: dateRange === "thismonth" ? "#ffffff" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}
              >
                This Month
              </button>
            </div>

            <button
              onClick={() => fetchAllReports(true)}
              disabled={refreshing}
              className="btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={14} className={refreshing ? "spin-icon" : ""} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(99, 102, 241, 0.2)",
            borderTopColor: "var(--primary-400)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "16px"
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", fontWeight: "600" }}>
            Aggregating Commercial & Surveillance Intelligence...
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error Fallback */}
      {!loading && error && (
        <div className="glass-card" style={{ padding: "30px", textAlign: "center", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
          <AlertTriangle size={42} color="#ef4444" style={{ marginBottom: "12px" }} />
          <h3 style={{ color: "#ef4444", marginBottom: "8px" }}>Unable to load report data</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{error}</p>
          <button className="btn-primary" onClick={() => fetchAllReports()}>
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Report Sections */}
      {!loading && !error && summaryData && (
        <>
          {/* SECTION 1 — EXECUTIVE SUMMARY (6 KPI CARDS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <ReportKpiCard
              title={dateRange === "today" ? "Today's Sales" : dateRange === "last7days" ? "7-Day Sales" : "Monthly Sales"}
              value={formatCurrency(summaryData.totalSales)}
              subtitle={`Avg ticket: ${formatCurrency(summaryData.averageBillValue)}`}
              icon={DollarSign}
              color="#6366f1"
              trend={`${summaryData.salesTrend} vs previous`}
              isPositive={true}
            />

            <ReportKpiCard
              title={dateRange === "today" ? "Today's Collection" : dateRange === "last7days" ? "7-Day Collection" : "Monthly Collection"}
              value={formatCurrency(summaryData.totalCollection)}
              subtitle="Reconciliation: 95.2% mapped"
              icon={CreditCard}
              color="#10b981"
              trend={`${summaryData.collectionTrend} vs target`}
              isPositive={true}
            />

            <ReportKpiCard
              title="Average Ticket"
              value={formatCurrency(summaryData.averageBillValue || 1640)}
              subtitle="Per invoice average"
              icon={Receipt}
              color="#0ea5e9"
              trend="+4.8% growth"
              isPositive={true}
            />

            <ReportKpiCard
              title="Total Bills"
              value={summaryData.totalBills.toLocaleString("en-IN")}
              subtitle={`Daily capacity: ${summaryData.billsCapacity || 700}`}
              icon={Receipt}
              color="#3b82f6"
              trend="97.7% dispatch rate"
              isPositive={true}
            />

            <ReportKpiCard
              title="Active Customers"
              value={summaryData.activeCustomers.toLocaleString("en-IN")}
              subtitle="Total network: 4,120 outlets"
              icon={Users}
              color="#8b5cf6"
              trend="94.4% active"
              isPositive={true}
            />

            <ReportKpiCard
              title="Critical Exceptions"
              value={summaryData.criticalExceptions}
              subtitle="Requires owner attention"
              icon={AlertTriangle}
              color="#f59e0b"
              trend="Surveillance active"
              isPositive={false}
              onClick={() => onNavigateTab && onNavigateTab("exceptions")}
            />
          </div>

          {/* SECTION 2 & 3 — SALES ANALYTICS & COLLECTION ANALYTICS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
            <SalesAnalytics data={salesData} dateRange={dateRange} />
            <CollectionAnalytics data={collectionsData} />
          </div>

          {/* SECTION 4 & 5 — TOP CUSTOMERS & TOP PRODUCTS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "20px" }}>
            <TopCustomersReport data={topCustomersData} />
            <TopProductsReport data={topProductsData} />
          </div>

          {/* SECTION 7 — SALESMAN PERFORMANCE */}
          <SalesmanPerformanceReport data={salesmenData} />

          {/* SECTION 8 — EXCEPTION SUMMARY */}
          <ExceptionSummaryReport
            data={exceptionsData}
            onNavigateExceptions={() => onNavigateTab && onNavigateTab("exceptions")}
          />
        </>
      )}
    </div>
  );
}
