import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import KpiGrid from "./KpiGrid";
import SalesChart from "./SalesChart";
import CollectionSummary from "./CollectionSummary";
import ExceptionPanel from "./ExceptionPanel";
import RecentActivity from "./RecentActivity";
import CustomerList from "../customers/CustomerList";
import AddCustomerModal from "../customers/AddCustomerModal";
import EditCustomerModal from "../customers/EditCustomerModal";
import StatusChangeModal from "../customers/StatusChangeModal";
import CustomerDetails from "../customers/CustomerDetails";
import ProductList from "../products/ProductList";
import AddProductModal from "../products/AddProductModal";
import EditProductModal from "../products/EditProductModal";
import ProductDetails from "../products/ProductDetails";
import ProductStatusModal from "../products/ProductStatusModal";
import AreaList from "../areas/AreaList";
import AreaModal from "../areas/AreaModal";
import RouteList from "../routes/RouteList";
import RouteModal from "../routes/RouteModal";
import SalesmanList from "../salesmen/SalesmanList";
import SalesmanModal from "../salesmen/SalesmanModal";
import SalesmanRouteAssignModal from "../salesmen/SalesmanRouteAssignModal";
import CustomerAssignmentManager from "../assignments/CustomerAssignmentManager";
import AssignCustomerModal from "../assignments/AssignCustomerModal";
import AssignmentHistoryModal from "../assignments/AssignmentHistoryModal";
import OrderList from "../orders/OrderList";
import OrderDetails from "../orders/OrderDetails";
import CreateOrder from "../orders/CreateOrder";
import BillList from "../billing/BillList";
import BillDetails from "../billing/BillDetails";
import PaymentList from "../payments/PaymentList";
import PaymentDetails from "../payments/PaymentDetails";
import UnmatchedQueue from "../payments/UnmatchedQueue";
import ExceptionDashboard from "../exceptions/ExceptionDashboard";
import ExceptionDetails from "../exceptions/ExceptionDetails";
import ApprovalDashboard from "../approvals/ApprovalDashboard";
import ApprovalDetails from "../approvals/ApprovalDetails";
import ExecutiveReports from "../reports/ExecutiveReports";
import DayBookView from "../reports/DayBookView";
import TrialBalanceView from "../reports/TrialBalanceView";
import ProfitLossView from "../reports/ProfitLossView";
import BalanceSheetView from "../reports/BalanceSheetView";
import InventoryDashboard from "../inventory/InventoryDashboard";
import DeliveryDashboard from "../delivery/DeliveryDashboard";
import SchemeList from "../schemes/SchemeList";
import SupplierList from "../suppliers/SupplierList";
import PurchaseList from "../purchases/PurchaseList";
import PartyLedger from "../ledger/PartyLedger";
import DemoGuide from "../demo/DemoGuide";
import SettingsView from "../settings/SettingsView";
import { AlertCircle, RefreshCw, Layers, Sparkles } from "lucide-react";

const VALID_TABS = [
  "overview",
  "sales-customers",
  "sales-products",
  "sales-areas",
  "sales-routes",
  "sales-salesmen",
  "sales-assignments",
  "sales-orders",
  "sales-bills",
  "col-payments",
  "supplier-payments",
  "col-unmatched",
  "col-upi",
  "col-cash",
  "col-cheques",
  "col-recon",
  "inventory",
  "delivery",
  "daybook",
  "trial-balance",
  "profit-loss",
  "balance-sheet",
  "settings",
  "exceptions",
  "approvals",
  "suppliers",
  "purchases",
  "ledger",
  "reports",
  "sales-schemes",
  "demo-guide"
];

const getInitialActiveTab = () => {
  try {
    const hash = window.location.hash.replace(/^#\/?/, "").trim();
    if (hash && VALID_TABS.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem("erp_active_tab");
    if (saved && VALID_TABS.includes(saved)) {
      return saved;
    }
  } catch (err) {
    console.warn("Could not read initial active tab:", err);
  }
  return "overview";
};

export default function OwnerDashboard({ user, onLogout, token }) {
  const [activeTab, setActiveTab] = useState(getInitialActiveTab);

  // Synchronize activeTab with URL hash and localStorage
  useEffect(() => {
    try {
      localStorage.setItem("erp_active_tab", activeTab);
      const currentHash = window.location.hash.replace(/^#\/?/, "").trim();
      if (currentHash !== activeTab) {
        window.history.replaceState(null, "", `#${activeTab}`);
      }
    } catch (e) {
      console.warn("Could not sync active tab to URL:", e);
    }
  }, [activeTab]);

  // Listen for browser Back / Forward or hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "").trim();
      if (hash && VALID_TABS.includes(hash) && hash !== activeTab) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Customer details state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [statusTargetCustomer, setStatusTargetCustomer] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modals & Product details state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusTargetProduct, setStatusTargetProduct] = useState(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Step 5: Area Modals
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  // Step 5: Route Modals
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Step 5: Salesman Modals
  const [isAddSalesmanModalOpen, setIsAddSalesmanModalOpen] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState(null);
  const [routeAssignSalesman, setRouteAssignSalesman] = useState(null);

  // Step 5: Assignment Modals
  const [assigningCustomer, setAssigningCustomer] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);

  // Step 6: Orders state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // Step 7: Billing & Invoices state
  const [selectedBill, setSelectedBill] = useState(null);

  // Step 8: Payments & Reconciliation state
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Step 11: Exception & Approval state
  const [selectedException, setSelectedException] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Suppliers, Purchases & Ledger state
  const [selectedSupplierForPurchase, setSelectedSupplierForPurchase] = useState(null);
  const [ledgerTarget, setLedgerTarget] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const DEFAULT_OWNER_METRICS = {
    network: {
      totalOutlets: 40,
      activeSalesmen: 3,
      activeRoutes: 4
    },
    summary: {
      todaysSales: 1485200,
      todaysSalesTrend: "+12.4%",
      todaysCollection: 1140000,
      todaysCollectionTrend: "+8.2%",
      todaysBillsCount: 684,
      totalCustomers: 4000,
      activeCustomers: 3850,
      activeRoutes: 24,
      totalProducts: 240
    },
    sales: {
      weeklyTrend: [
        { day: "Sat", sales: 1120000 },
        { day: "Sun", sales: 850000 },
        { day: "Mon", sales: 1340000 },
        { day: "Tue", sales: 1420000 },
        { day: "Wed", sales: 1290000 },
        { day: "Thu", sales: 1560000 },
        { day: "Fri", sales: 1485200 }
      ]
    },
    salesData: {
      weeklyTrend: [
        { day: "Sat", sales: 1120000 },
        { day: "Sun", sales: 850000 },
        { day: "Mon", sales: 1340000 },
        { day: "Tue", sales: 1420000 },
        { day: "Wed", sales: 1290000 },
        { day: "Thu", sales: 1560000 },
        { day: "Fri", sales: 1485200 }
      ]
    },
    collections: {
      total: 1140000,
      breakdown: [
        { mode: "UPI", percentage: 45, color: "#6366f1" },
        { mode: "CASH", percentage: 35, color: "#10b981" },
        { mode: "CHEQUE", percentage: 20, color: "#3b82f6" }
      ]
    },
    recentActivity: [
      { id: 1, type: "bill", action: "Tax Invoice INV-2026-000684 generated for Sharma General Store", user: "Rajesh Sharma", time: "10 mins ago" },
      { id: 2, type: "payment", action: "Cash collection ₹18,450 recorded from Gupta Provision", user: "Rahul Kumar", time: "25 mins ago" },
      { id: 3, type: "order", action: "Order ORD-000842 submitted by Rahul Kumar (Route A)", user: "Rahul Kumar", time: "40 mins ago" },
      { id: 4, type: "reconcile", action: "UPI transaction matched and cleared against bill", user: "Rajesh Sharma", time: "1 hr ago" }
    ],
    exceptions: [
      {
        id: "exc-01",
        title: "Credit Limit Exceeded by 14%",
        description: "Sharma General Store exceeded assigned ₹50,000 credit threshold.",
        severity: "HIGH",
        severityColor: "#ef4444",
        amount: 57200,
        actionText: "Review Exception"
      },
      {
        id: "exc-02",
        title: "Unmatched UPI Remittance",
        description: "UPI credit of ₹12,500 received without customer reference in narration.",
        severity: "MEDIUM",
        severityColor: "#f59e0b",
        amount: 12500,
        actionText: "Identify Customer"
      }
    ]
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5005/api/dashboard/owner", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setDashboardData(json.data);
      } else {
        setDashboardData(DEFAULT_OWNER_METRICS);
      }
    } catch (err) {
      console.warn("Dashboard API fetch timed out, loading demo metrics:", err);
      setDashboardData(DEFAULT_OWNER_METRICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Tally Keyboard Shortcut Integration: F8 (Sales), F9 (Purchases), F4 (Ledger)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"], input[type="search"]');
        if (searchInput) searchInput.focus();
        return;
      }

      if (e.key === "F8") {
        e.preventDefault();
        setActiveTab("sales-bills");
        showToast("Switched to Sales Invoices & Billing (F8)");
      } else if (e.key === "F9") {
        e.preventDefault();
        setActiveTab("purchases");
        showToast("Switched to Purchase Inward Voucher (F9)");
      } else if (e.key === "F4" && !isInput) {
        e.preventDefault();
        setActiveTab("ledger");
        showToast("Switched to Party Ledger / Statement of Accounts (F4)");
      } else if (e.key === "F6" && !isInput) {
        e.preventDefault();
        setActiveTab("col-payments");
        showToast("Switched to Collections / Receipts Voucher (F6)");
      } else if (e.key === "F7" && !isInput) {
        e.preventDefault();
        setActiveTab("daybook");
        showToast("Switched to Accounting Day Book (F7)");
      } else if (e.key === "F5" && !isInput) {
        e.preventDefault();
        setActiveTab("supplier-payments");
        showToast("Switched to Supplier Payment Voucher (F5)");
      } else if (e.altKey && e.key === "F5") {
        e.preventDefault();
        setActiveTab("supplier-payments");
        showToast("Switched to Supplier Payment Voucher (Alt+F5)");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-dark)" }}>
      {/* Unified Owner Sidebar */}
      <Sidebar 
        user={user}
        activeTab={activeTab} 
        onTabSelect={(tab) => {
          setActiveTab(tab);
          setSelectedCustomer(null);
          setSelectedOrder(null);
          setSelectedBill(null);
          setSelectedPayment(null);
          setSelectedException(null);
          setSelectedApproval(null);
        }} 
        onLogout={onLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", minWidth: 0, overflow: "hidden" }}>
        
        {/* Owner Header */}
        <Header 
          user={user} 
          onLogout={onLogout} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activeTab={activeTab}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Toast Feedback Banner */}
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

        {/* Dashboard Body - Isolated Scroll Pane */}
        <main 
          className="dashboard-main-content"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "24px",
            minHeight: 0
          }}
        >
          
          {/* CUSTOMER MASTER VIEW */}
          {activeTab === "sales-customers" ? (
            selectedCustomer ? (
              <CustomerDetails 
                customer={selectedCustomer} 
                token={token}
                onBack={() => setSelectedCustomer(null)}
                onOpenEditModal={(c) => setEditingCustomer(c)}
                onOpenStatusModal={(c) => setStatusTargetCustomer(c)}
              />
            ) : (
              <CustomerList
                token={token}
                onSelectCustomer={(c) => setSelectedCustomer(c)}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenEditModal={(c) => setEditingCustomer(c)}
                onOpenStatusModal={(c) => setStatusTargetCustomer(c)}
              />
            )
          ) : activeTab === "sales-products" ? (
            /* PRODUCT MASTER VIEW */
            selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                userRole={user.role}
                onBack={() => setSelectedProduct(null)}
                onOpenEditModal={(p) => setEditingProduct(p)}
                onOpenStatusModal={(p) => setStatusTargetProduct(p)}
              />
            ) : (
              <ProductList
                token={token}
                userRole={user.role}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onOpenAddModal={() => setIsAddProductModalOpen(true)}
                onOpenEditModal={(p) => setEditingProduct(p)}
                onOpenStatusModal={(p) => setStatusTargetProduct(p)}
              />
            )
          ) : activeTab === "sales-areas" ? (
            /* AREA MASTER VIEW */
            <AreaList
              token={token}
              userRole={user.role}
              onOpenAddModal={() => {
                setEditingArea(null);
                setIsAddAreaModalOpen(true);
              }}
              onOpenEditModal={(ar) => {
                setEditingArea(ar);
                setIsAddAreaModalOpen(true);
              }}
              onToggleStatus={async (ar) => {
                const newStatus = ar.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                try {
                  const res = await fetch(`http://localhost:5005/api/areas/${ar.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ status: newStatus })
                  });
                  const json = await res.json();
                  if (json.success) showToast(json.message);
                } catch (e) { console.error(e); }
              }}
            />
          ) : activeTab === "sales-routes" ? (
            /* ROUTE / BEAT MASTER VIEW */
            <RouteList
              token={token}
              userRole={user.role}
              onOpenAddModal={() => {
                setEditingRoute(null);
                setIsAddRouteModalOpen(true);
              }}
              onOpenEditModal={(rt) => {
                setEditingRoute(rt);
                setIsAddRouteModalOpen(true);
              }}
              onToggleStatus={async (rt) => {
                const newStatus = rt.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                try {
                  const res = await fetch(`http://localhost:5005/api/routes/${rt.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ status: newStatus })
                  });
                  const json = await res.json();
                  if (json.success) showToast(json.message);
                } catch (e) { console.error(e); }
              }}
            />
          ) : activeTab === "sales-salesmen" ? (
            /* SALESMAN & DSR MASTER VIEW */
            <SalesmanList
              token={token}
              userRole={user.role}
              onOpenAddModal={() => {
                setEditingSalesman(null);
                setIsAddSalesmanModalOpen(true);
              }}
              onOpenEditModal={(sm) => {
                setEditingSalesman(sm);
                setIsAddSalesmanModalOpen(true);
              }}
              onOpenRouteAssignModal={(sm) => {
                setRouteAssignSalesman(sm);
              }}
              onToggleStatus={async (sm) => {
                const newStatus = sm.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                try {
                  const res = await fetch(`http://localhost:5005/api/salesmen/${sm.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ status: newStatus })
                  });
                  const json = await res.json();
                  if (json.success) showToast(json.message);
                } catch (e) { console.error(e); }
              }}
            />
          ) : activeTab === "sales-assignments" ? (
            /* CUSTOMER BEAT & SALESMAN ASSIGNMENT VIEW */
            <CustomerAssignmentManager
              token={token}
              userRole={user.role}
              onOpenAssignModal={(cus) => setAssigningCustomer(cus)}
              onOpenHistoryModal={(cus) => setHistoryCustomer(cus)}
            />
          ) : activeTab === "sales-orders" ? (
            /* SALES ORDERS MANAGEMENT VIEW */
            selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                orderId={selectedOrder.id || selectedOrder._id}
                token={token}
                user={user}
                userRole={user.role}
                onBack={() => setSelectedOrder(null)}
                onStatusUpdated={() => {
                  showToast("Order status successfully updated");
                }}
                onViewBill={(bill) => {
                  setSelectedBill(bill);
                  setActiveTab("sales-bills");
                  showToast(`Viewing generated invoice ${bill.billNumber}`);
                }}
              />
            ) : (
              <OrderList
                token={token}
                user={user}
                userRole={user.role}
                onSelectOrder={(ord) => setSelectedOrder(ord)}
                onOpenCreate={() => setIsCreateOrderOpen(true)}
                onViewBill={(bill) => {
                  setSelectedBill(bill);
                  setActiveTab("sales-bills");
                  showToast(`Viewing generated invoice ${bill.billNumber}`);
                }}
              />
            )
          ) : activeTab === "sales-bills" ? (
            /* BILLING & INVOICE MANAGEMENT VIEW */
            selectedBill ? (
              <BillDetails
                bill={selectedBill}
                token={token}
                user={user}
                onBack={() => setSelectedBill(null)}
                onBillUpdated={(updated) => {
                  setSelectedBill(updated);
                  showToast("Invoice updated successfully");
                }}
              />
            ) : (
              <BillList
                token={token}
                user={user}
                onSelectBill={(b) => setSelectedBill(b)}
                onOpenGenerate={() => {
                  setActiveTab("sales-orders");
                  showToast("Select a confirmed/submitted order to generate a bill");
                }}
              />
            )
          ) : activeTab === "col-payments" || activeTab === "supplier-payments" ? (
            /* STEP 8: PAYMENT COLLECTIONS & SUPPLIER VOUCHERS */
            selectedPayment ? (
              <PaymentDetails
                payment={selectedPayment}
                token={token}
                user={user}
                onBack={() => setSelectedPayment(null)}
                onPaymentUpdated={(updated) => {
                  setSelectedPayment(updated);
                  showToast("Payment voucher updated");
                }}
                onNavigateToBills={() => {
                  setActiveTab("sales-bills");
                  showToast("Opening Invoices Master");
                }}
              />
            ) : (
              <PaymentList
                token={token}
                user={user}
                initialPaymentType={activeTab === "supplier-payments" ? "SUPPLIER_PAYMENT" : "ALL"}
                onSelectPayment={(p) => setSelectedPayment(p)}
              />
            )
          ) : activeTab === "col-unmatched" || activeTab === "col-upi" ? (
            /* STEP 8: UPI SUSPENSE QUEUE */
            selectedPayment ? (
              <PaymentDetails
                payment={selectedPayment}
                token={token}
                user={user}
                onBack={() => setSelectedPayment(null)}
                onPaymentUpdated={(updated) => {
                  setSelectedPayment(updated);
                  showToast("Payment voucher updated");
                }}
                onNavigateToBills={() => {
                  setActiveTab("sales-bills");
                  showToast("Opening Invoices Master");
                }}
              />
            ) : (
              <UnmatchedQueue
                token={token}
                user={user}
                onSelectPayment={(p) => setSelectedPayment(p)}
                onOpenAllPayments={() => setActiveTab("col-payments")}
              />
            )
          ) : activeTab === "col-cash" ? (
            /* CASH TALLY VIEW */
            <PaymentList
              token={token}
              user={user}
              initialModeFilter="CASH"
              onSelectPayment={(p) => setSelectedPayment(p)}
            />
          ) : activeTab === "col-cheques" ? (
            /* CHEQUES VAULT VIEW */
            <PaymentList
              token={token}
              user={user}
              initialModeFilter="CHEQUE"
              onSelectPayment={(p) => setSelectedPayment(p)}
            />
          ) : activeTab === "col-recon" ? (
            /* RECONCILIATION SUMMARY VIEW */
            <PaymentList
              token={token}
              user={user}
              onSelectPayment={(p) => setSelectedPayment(p)}
            />
          ) : activeTab === "exceptions" ? (
            /* STEP 11: OWNER EXCEPTION CONTROL CENTER */
            selectedException ? (
              <ExceptionDetails
                exception={selectedException}
                token={token}
                user={user}
                onBack={() => setSelectedException(null)}
                onExceptionUpdated={(updated) => setSelectedException(updated)}
              />
            ) : (
              <ExceptionDashboard
                token={token}
                user={user}
                onSelectException={(exc) => setSelectedException(exc)}
                onNavigateToApprovals={() => setActiveTab("approvals")}
              />
            )
          ) : activeTab === "approvals" ? (
            /* STEP 11: OWNER APPROVAL QUEUE */
            selectedApproval ? (
              <ApprovalDetails
                approval={selectedApproval}
                token={token}
                user={user}
                onBack={() => setSelectedApproval(null)}
                onApprovalUpdated={(updated) => setSelectedApproval(updated)}
              />
            ) : (
              <ApprovalDashboard
                token={token}
                user={user}
                onSelectApproval={(apr) => setSelectedApproval(apr)}
              />
            )
          ) : activeTab === "suppliers" ? (
            /* TALLY SUNDRY CREDITORS (SUPPLIERS MASTER) */
            <SupplierList
              token={token}
              onCreatePurchaseForSupplier={(sup) => {
                setSelectedSupplierForPurchase(sup);
                setActiveTab("purchases");
              }}
              onViewSupplierLedger={(sup) => {
                setLedgerTarget({ type: "SUPPLIER", id: sup.id || sup._id });
                setActiveTab("ledger");
              }}
            />
          ) : activeTab === "purchases" ? (
            /* TALLY F9 INWARD PURCHASE VOUCHERS */
            <PurchaseList
              token={token}
              initialSupplier={selectedSupplierForPurchase}
            />
          ) : activeTab === "ledger" ? (
            /* TALLY STATEMENT OF ACCOUNTS & PARTY LEDGER */
            <PartyLedger
              token={token}
              initialPartyType={ledgerTarget?.type || "CUSTOMER"}
              initialPartyId={ledgerTarget?.id || null}
            />
          ) : activeTab === "inventory" ? (
            /* WAREHOUSE INVENTORY & STOCK MOVEMENTS */
            <InventoryDashboard
              token={token}
              user={user}
              onSelectProduct={() => setActiveTab("sales-products")}
              onViewAllStock={() => setActiveTab("sales-products")}
              onViewMovements={() => {}}
            />
          ) : activeTab === "delivery" ? (
            /* DELIVERY FLEET & RUNSHEET DISPATCH */
            <DeliveryDashboard
              token={token}
              user={user}
              onNavigate={(t) => setActiveTab(t)}
              onSelectTrip={() => {}}
            />
          ) : activeTab === "daybook" ? (
            /* TALLY DAY BOOK (DAILY TRANSACTION AUDIT) */
            <DayBookView token={token} />
          ) : activeTab === "trial-balance" ? (
            /* TALLY TRIAL BALANCE (BALANCED STATEMENT) */
            <TrialBalanceView token={token} />
          ) : activeTab === "profit-loss" ? (
            /* TALLY PROFIT & LOSS ACCOUNT */
            <ProfitLossView token={token} />
          ) : activeTab === "balance-sheet" ? (
            /* TALLY BALANCE SHEET */
            <BalanceSheetView token={token} />
          ) : activeTab === "reports" ? (
            /* STEP 12: EXECUTIVE REPORTS & BUSINESS ANALYTICS */
            <ExecutiveReports
              token={token}
              user={user}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === "settings" ? (
            /* ERP & ACCOUNTING SETTINGS */
            <SettingsView token={token} user={user} />
          ) : activeTab === "sales-schemes" ? (
            /* STEP 13: FMCG SCHEMES & TRADE PROMOTIONS MASTER */
            <SchemeList token={token} userRole={user.role} />
          ) : activeTab === "demo-guide" ? (
            /* STEP 14: INTERACTIVE FMCG DEMO GUIDE */
            <DemoGuide
              onNavigateTab={(tab) => {
                setActiveTab(tab);
              }}
              onClose={() => setActiveTab("overview")}
            />
          ) : (
            /* OVERVIEW / DASHBOARD VIEW */
            <>
              {loading && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "100px 20px"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid rgba(99, 102, 241, 0.2)",
                    borderTopColor: "var(--primary-400)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "20px"
                  }} />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    Connecting to MongoDB Atlas & Loading Owner Command Center...
                  </p>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {!loading && error && (
                <div className="glass-card" style={{
                  padding: "40px",
                  textAlign: "center",
                  maxWidth: "600px",
                  margin: "60px auto",
                  border: "1px solid rgba(239, 68, 68, 0.3)"
                }}>
                  <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "1.3rem", color: "#fca5a5", marginBottom: "8px" }}>
                    Authentication / Authorization Error
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
                    {error}
                  </p>
                  <button className="btn-primary" onClick={fetchDashboardData}>
                    <RefreshCw size={16} />
                    <span>Retry Connection</span>
                  </button>
                </div>
              )}

              {!loading && !error && dashboardData && (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  
                  {/* Top Welcome & Network Overview Banner */}
                  <div className="glass-card" style={{
                    padding: "20px 24px",
                    background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.1) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}>
                    <div>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--primary-400)",
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        marginBottom: "6px"
                      }}>
                        <Sparkles size={16} />
                        EXECUTIVE CONTROL TOWER
                      </div>
                      <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "4px" }}>
                        Owner Command Center
                      </h1>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Real-time operational & financial control center for <strong style={{ color: "var(--text-main)" }}>Distributor ERP</strong>
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>

                      <div style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "14px",
                        padding: "12px 20px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Outlets</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)" }}>{dashboardData?.network?.totalOutlets ?? dashboardData?.summary?.totalCustomers ?? 40}</div>
                      </div>

                      <div style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "14px",
                        padding: "12px 20px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Salesmen</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary-400)" }}>{dashboardData?.network?.activeSalesmen ?? 3}</div>
                      </div>

                      <div style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-card)",
                        borderRadius: "14px",
                        padding: "12px 20px",
                        textAlign: "center"
                      }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Beats / Routes</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#10b981" }}>{dashboardData?.network?.activeRoutes ?? 4}</div>
                      </div>
                    </div>
                  </div>

                  {/* 6 Core KPI Grid Cards */}
                  <KpiGrid summary={dashboardData?.summary || {}} />

                  {/* Sales Chart & Collection Breakdown Grid */}
                  <div className="responsive-split-grid">
                    <SalesChart salesData={dashboardData?.sales || dashboardData?.salesData || { weeklyTrend: [] }} />
                    <CollectionSummary collections={dashboardData?.collections || { total: 0, breakdown: [] }} />
                  </div>

                  {/* Recent Activity Feed */}
                  <div>
                    <RecentActivity activityList={dashboardData.recentActivity} />
                  </div>

                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCustomerModal 
          token={token}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          token={token}
          onClose={() => setEditingCustomer(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {statusTargetCustomer && (
        <StatusChangeModal
          customer={statusTargetCustomer}
          token={token}
          onClose={() => setStatusTargetCustomer(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Product Modals */}
      {isAddProductModalOpen && (
        <AddProductModal 
          token={token}
          onClose={() => setIsAddProductModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          token={token}
          onClose={() => setEditingProduct(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {statusTargetProduct && (
        <ProductStatusModal
          product={statusTargetProduct}
          token={token}
          onClose={() => setStatusTargetProduct(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Step 5: Area Modals */}
      {(isAddAreaModalOpen || editingArea) && (
        <AreaModal
          token={token}
          area={editingArea}
          onClose={() => {
            setIsAddAreaModalOpen(false);
            setEditingArea(null);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Step 5: Route Modals */}
      {(isAddRouteModalOpen || editingRoute) && (
        <RouteModal
          token={token}
          route={editingRoute}
          onClose={() => {
            setIsAddRouteModalOpen(false);
            setEditingRoute(null);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Step 5: Salesman Modals */}
      {(isAddSalesmanModalOpen || editingSalesman) && (
        <SalesmanModal
          token={token}
          salesman={editingSalesman}
          onClose={() => {
            setIsAddSalesmanModalOpen(false);
            setEditingSalesman(null);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {routeAssignSalesman && (
        <SalesmanRouteAssignModal
          token={token}
          salesman={routeAssignSalesman}
          onClose={() => setRouteAssignSalesman(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {/* Step 5: Customer Assignment Modals */}
      {assigningCustomer && (
        <AssignCustomerModal
          token={token}
          customer={assigningCustomer}
          onClose={() => setAssigningCustomer(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      {historyCustomer && (
        <AssignmentHistoryModal
          token={token}
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
        />
      )}

      {/* Step 6: Create Order Modal */}
      {isCreateOrderOpen && (
        <CreateOrder
          token={token}
          user={user}
          onClose={() => setIsCreateOrderOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            setIsCreateOrderOpen(false);
          }}
        />
      )}

    </div>
  );
}
