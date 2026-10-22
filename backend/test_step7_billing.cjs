const API_BASE = "http://127.0.0.1:5005";

async function runStep7BillingTests() {
  console.log("================================================================================");
  console.log("🧪 STARTING STEP 7: BILLING & INVOICE MANAGEMENT COMPREHENSIVE TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  let ownerToken = "";
  let financeToken = "";
  let salesmanToken = "";
  let submittedOrderId = "";
  let submittedOrderNumber = "";

  // --- Phase 1: Authentication & Health ---
  console.log("--- Phase 1: Authentication & Health ---");
  const healthRes = await fetch(`${API_BASE}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.ok && healthData.status === "online", "Health check /api/health");

  const ownerRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrMobile: "owner@distributorerp.com", password: "Password123!", role: "SUPER_ADMIN" })
  });
  const ownerData = await ownerRes.json();
  ownerToken = ownerData.token;
  assert(ownerRes.ok && !!ownerToken, "Owner Login (SUPER_ADMIN)");

  const financeRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrMobile: "finance@distributorerp.com", password: "Password123!", role: "FINANCE" })
  });
  const financeData = await financeRes.json();
  financeToken = financeData.token;
  assert(financeRes.ok && !!financeToken, "Finance Login (FINANCE)");

  const smRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrMobile: "salesman@distributorerp.com", password: "Password123!", role: "SALESMAN" })
  });
  const smData = await smRes.json();
  salesmanToken = smData.token;
  assert(smRes.ok && !!salesmanToken, "Salesman Login (SALESMAN)");

  // --- Phase 2: Order Booking & Submission for Billing ---
  console.log("\n--- Phase 2: Order Booking & Submission ---");
  // Salesman books an order for Sharma General Store
  const custRes = await fetch(`${API_BASE}/api/customers?search=Sharma`, {
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  const custData = await custRes.json();
  const sharmaCust = custData.data.find(c => c.shopName.includes("Sharma"));

  const prodRes = await fetch(`${API_BASE}/api/products?limit=20`, {
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  const prodData = await prodRes.json();
  const maggi = prodData.data.find(p => p.productName.toLowerCase().includes("maggi"));
  const kitkat = prodData.data.find(p => p.productName.toLowerCase().includes("kitkat"));

  const createOrderRes = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${salesmanToken}` },
    body: JSON.stringify({
      customerId: sharmaCust.id || sharmaCust._id,
      items: [
        { productId: maggi.id, quantity: 20 },
        { productId: kitkat.id, quantity: 10 }
      ],
      notes: "Demo order for billing flow"
    })
  });
  const createOrderData = await createOrderRes.json();
  const orderId = createOrderData.data.id || createOrderData.data._id;
  assert(createOrderRes.ok && !!orderId, "Salesman created draft order for billing");

  // Submit order
  const submitRes = await fetch(`${API_BASE}/api/orders/${orderId}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  const submitData = await submitRes.json();
  submittedOrderId = submitData.data.id || submitData.data._id;
  submittedOrderNumber = submitData.data.orderNumber;
  assert(submitRes.ok && submitData.data.status === "SUBMITTED", `Order submitted successfully (${submittedOrderNumber})`);

  // --- Phase 3: Billing RBAC Security ---
  console.log("\n--- Phase 3: Billing RBAC Security ---");
  // Salesman attempts to generate bill -> 403 Forbidden
  const smGenRes = await fetch(`${API_BASE}/api/bills/generate/${submittedOrderId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  assert(smGenRes.status === 403, "RBAC: Salesman cannot generate invoice (HTTP 403 Forbidden)");

  // --- Phase 4: Bill Generation ---
  console.log("\n--- Phase 4: Bill Generation (Order → Invoice) ---");
  // Owner generates bill
  const genRes = await fetch(`${API_BASE}/api/bills/generate/${submittedOrderId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const genData = await genRes.json();
  assert(genRes.status === 201 && genData.success, "Owner generated invoice from submitted order (HTTP 201 Created)");
  
  const generatedBill = genData.data;
  assert(/^INV-\d{4}-\d{6}$/.test(generatedBill.billNumber), `Sequential Invoice Number format validated (${generatedBill.billNumber})`);
  assert(generatedBill.billStatus === "GENERATED", "Initial bill status is GENERATED");
  assert(generatedBill.paymentStatus === "UNPAID", "Initial payment status is UNPAID");
  assert(generatedBill.paidAmount === 0, "Initial paid amount is 0");
  assert(generatedBill.outstandingAmount === generatedBill.totalAmount, "Outstanding equals Total Amount");
  assert(generatedBill.customer?.customerName === sharmaCust.shopName, "Customer snapshot correctly preserved");
  assert(generatedBill.salesman?.salesmanName === "Rahul Kumar", "Salesman snapshot correctly preserved");
  assert(generatedBill.items?.length === 2, "2 line items converted into invoice");

  // Duplicate generation prevention
  const dupGenRes = await fetch(`${API_BASE}/api/bills/generate/${submittedOrderId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(dupGenRes.status === 400, "Anti-Duplicate: Second invoice generation for same order blocked (HTTP 400)");

  // --- Phase 5: Bill Locking ---
  console.log("\n--- Phase 5: Bill Locking System ---");
  const billId = generatedBill.id || generatedBill._id;

  // Salesman attempts to lock -> 403
  const smLockRes = await fetch(`${API_BASE}/api/bills/${billId}/lock`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  assert(smLockRes.status === 403, "RBAC: Salesman cannot lock invoice (HTTP 403 Forbidden)");

  // Owner locks bill
  const lockRes = await fetch(`${API_BASE}/api/bills/${billId}/lock`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const lockData = await lockRes.json();
  assert(lockRes.ok && lockData.data.billStatus === "LOCKED", "Owner locked bill successfully (Status: LOCKED 🔒)");
  assert(!!lockData.data.lockedAt && !!lockData.data.lockedBy, "Bill records lockedAt timestamp and lockedBy auditor");

  // Double lock attempt blocked
  const doubleLockRes = await fetch(`${API_BASE}/api/bills/${billId}/lock`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(doubleLockRes.status === 400, "Integrity: Cannot re-lock an already locked invoice (HTTP 400)");

  // --- Phase 6: Bill Cancellation ---
  console.log("\n--- Phase 6: Bill Cancellation & Non-Deletability ---");
  // Create another bill to test cancellation
  const testCancelBill = genData.data;
  
  // Salesman attempts to cancel -> 403
  const smCancelRes = await fetch(`${API_BASE}/api/bills/${billId}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${salesmanToken}` },
    body: JSON.stringify({ reason: "Unauthorized attempt" })
  });
  assert(smCancelRes.status === 403, "RBAC: Salesman cannot cancel invoices (HTTP 403 Forbidden)");

  // Cancellation requires reason
  const noReasonRes = await fetch(`${API_BASE}/api/bills/${billId}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({ reason: "" })
  });
  assert(noReasonRes.status === 400, "Integrity: Invoice cancellation requires non-empty reason (HTTP 400)");

  // Finance manager cancels with valid reason
  const cancelRes = await fetch(`${API_BASE}/api/bills/${billId}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${financeToken}` },
    body: JSON.stringify({ reason: "Retailer requested delivery postponement and bill reissuance" })
  });
  const cancelData = await cancelRes.json();
  assert(cancelRes.ok && cancelData.data.billStatus === "CANCELLED", "Bill successfully cancelled (Status: CANCELLED)");
  assert(cancelData.data.cancelReason.includes("postponement"), "Cancellation reason recorded accurately");

  // Zero data loss check
  const fetchCancelledRes = await fetch(`${API_BASE}/api/bills/${billId}`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const fetchCancelledData = await fetchCancelledRes.json();
  assert(fetchCancelledRes.ok && fetchCancelledData.data.billNumber === generatedBill.billNumber, "Zero Data Loss: Cancelled invoice remains queryable in audit database");

  // --- Phase 7: List Invoices, Search, Filters & Scoping ---
  console.log("\n--- Phase 7: List Invoices & Scoping ---");
  const ownerBillsRes = await fetch(`${API_BASE}/api/bills`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const ownerBillsData = await ownerBillsRes.json();
  assert(ownerBillsRes.ok && ownerBillsData.data.length >= 10, `Owner sees all distributor bills (Count: ${ownerBillsData.total})`);

  // Search filter test
  const searchRes = await fetch(`${API_BASE}/api/bills?search=Sharma`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const searchData = await searchRes.json();
  assert(searchRes.ok && searchData.data.every(b => b.customer.customerName.includes("Sharma")), "Search by customer name functions correctly");

  // Status filter test
  const lockedRes = await fetch(`${API_BASE}/api/bills?billStatus=LOCKED`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const lockedData = await lockedRes.json();
  assert(lockedRes.ok && lockedData.data.every(b => b.billStatus === "LOCKED"), "Filter by billStatus=LOCKED functions correctly");

  // Payment status filter test
  const unpaidRes = await fetch(`${API_BASE}/api/bills?paymentStatus=UNPAID`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const unpaidData = await unpaidRes.json();
  assert(unpaidRes.ok && unpaidData.data.every(b => b.paymentStatus === "UNPAID"), "Filter by paymentStatus=UNPAID functions correctly");

  // Salesman scoping test
  const smBillsRes = await fetch(`${API_BASE}/api/bills`, {
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  const smBillsData = await smBillsRes.json();
  assert(smBillsRes.ok && smBillsData.data.every(b => b.salesman?.salesmanId === "user-salesman-01" || b.salesman?.userId === "user-salesman-01" || b.salesman?.salesmanCode === "SM-000001"), "Data Scope: Salesman receives only own assigned customer invoices");

  // --- Phase 8: Steps 1-6 Regression ---
  console.log("\n--- Phase 8: Steps 1-6 Regression ---");
  const dashRes = await fetch(`${API_BASE}/api/dashboard/owner`, { headers: { Authorization: `Bearer ${ownerToken}` } });
  assert(dashRes.ok, "Step 2: Owner Command Center Dashboard intact");

  const cListRes = await fetch(`${API_BASE}/api/customers`, { headers: { Authorization: `Bearer ${ownerToken}` } });
  assert(cListRes.ok, "Step 3: Customer Master intact");

  const pListRes = await fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${ownerToken}` } });
  assert(pListRes.ok, "Step 4: Product Master intact");

  const rListRes = await fetch(`${API_BASE}/api/routes`, { headers: { Authorization: `Bearer ${ownerToken}` } });
  assert(rListRes.ok, "Step 5: Routes / Beats Master intact");

  const ordListRes = await fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${ownerToken}` } });
  assert(ordListRes.ok, "Step 6: Orders Engine intact");

  console.log("\n================================================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep7BillingTests().catch(err => {
  console.error("❌ Billing Test Execution Error:", err);
  process.exit(1);
});
