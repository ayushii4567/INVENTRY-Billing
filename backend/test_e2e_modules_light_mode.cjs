// backend/test_e2e_modules_light_mode.cjs
// Complete End-to-End Functional Test Suite across Steps 1 to 12

const BASE_URL = 'http://localhost:5005/api';

const results = {
  passed: 0,
  failed: 0,
  steps: []
};

function assert(condition, message) {
  if (condition) {
    results.passed++;
    console.log(`  ✓ ${message}`);
    results.steps.push({ status: 'PASS', message });
  } else {
    results.failed++;
    console.error(`  ✗ FAIL: ${message}`);
    results.steps.push({ status: 'FAIL', message });
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('DISTRIBUTOR ERP - COMPLETE MODULE TEST SUITE (STEPS 1-12)');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // 1. STEP 1: AUTHENTICATION & MULTI-ROLE RBAC
  // -------------------------------------------------------------
  console.log('--- TEST 1: Authentication & Multi-Role RBAC ---');
  
  // 1a. Owner Login
  const ownerLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'owner@distributorerp.com', password: 'password123' })
  }).then(r => r.json());
  assert(ownerLogin.success && ownerLogin.token && ownerLogin.user.role === 'SUPER_ADMIN', 'Owner (SUPER_ADMIN) login succeeds with valid credentials');
  const ownerToken = ownerLogin.token;

  // 1b. Finance Login
  const financeLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'finance@distributorerp.com', password: 'password123' })
  }).then(r => r.json());
  assert(financeLogin.success && financeLogin.user.role === 'FINANCE', 'Finance Manager (FINANCE) login succeeds');
  const financeToken = financeLogin.token;

  // 1c. Sales Manager Login
  const smgrLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'salesmgr@distributorerp.com', password: 'password123' })
  }).then(r => r.json());
  assert(smgrLogin.success && smgrLogin.user.role === 'SALES_MANAGER', 'Sales Manager (SALES_MANAGER) login succeeds');

  // 1d. Salesman Login
  const salesmanLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'salesman@distributorerp.com', password: 'password123' })
  }).then(r => r.json());
  assert(salesmanLogin.success && salesmanLogin.user.role === 'SALESMAN', 'Field Salesman (SALESMAN) login succeeds');
  const salesmanToken = salesmanLogin.token;

  // 1e. Invalid Credentials Rejection
  const invalidLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'owner@distributorerp.com', password: 'wrongpassword' })
  });
  assert(invalidLogin.status === 401, 'Invalid password correctly rejected with 401 Unauthorized (no blind fallback)');

  const nonExistentLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrMobile: 'nonexistent@test.com', password: 'password123' })
  });
  assert(nonExistentLogin.status === 401, 'Non-existent email correctly rejected with 401 Unauthorized');

  // -------------------------------------------------------------
  // 2. INITIAL CLEAN ZERO STATE VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Initial Clean Zero State Verification ---');
  const authHeaders = { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' };

  const dashInit = await fetch(`${BASE_URL}/dashboard/owner`, { headers: authHeaders }).then(r => r.json());
  assert(dashInit.success && dashInit.data.summary.todaysSales === 0, 'Dashboard returns clean zero sales state');
  assert(dashInit.data.summary.totalCustomers === 0, 'Dashboard returns 0 customers state');
  assert(dashInit.data.summary.stockValue === 0, 'Dashboard returns 0 stock value state');

  const custInit = await fetch(`${BASE_URL}/customers`, { headers: authHeaders }).then(r => r.json());
  assert(custInit.total === 0 && custInit.data.length === 0, 'Customer master initially has 0 records');

  const prodInit = await fetch(`${BASE_URL}/products`, { headers: authHeaders }).then(r => r.json());
  assert(prodInit.total === 0 && prodInit.data.length === 0, 'Product master initially has 0 records');

  // -------------------------------------------------------------
  // 3. STEP 5: AREA, ROUTE & SALESMAN SETUP
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Area, Route & Salesman Management (Step 5) ---');
  
  // 3a. Create Area
  const areaRes = await fetch(`${BASE_URL}/areas`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      areaName: 'Raipur Central',
      city: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
      description: 'Central Commercial Territory'
    })
  }).then(r => r.json());
  const areaData = areaRes.area || areaRes.data;
  assert(areaRes.success && areaData?.areaCode === 'AREA-000001', `Area created: ${areaData?.areaName} (${areaData?.areaCode})`);
  const areaId = areaData.id;

  // 3b. Create Route
  const routeRes = await fetch(`${BASE_URL}/routes`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      routeName: 'Route A - Sadar Bazaar',
      areaId: areaId,
      beatFrequency: 'DAILY',
      visitDays: ['MON', 'WED', 'FRI'],
      description: 'Primary Sadar Wholesale Route'
    })
  }).then(r => r.json());
  const routeData = routeRes.route || routeRes.data;
  assert(routeRes.success && routeData?.routeCode === 'ROUTE-000001', `Route created: ${routeData?.routeName} (${routeData?.routeCode})`);
  const routeId = routeData.id;

  // 3c. Create Salesman
  const salesmanRes = await fetch(`${BASE_URL}/salesmen`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Rahul Kumar',
      employeeCode: 'EMP-001',
      mobile: '9876543213',
      email: 'salesman@distributorerp.com',
      assignedRouteId: routeId
    })
  }).then(r => r.json());
  const salesmanData = salesmanRes.salesman || salesmanRes.data;
  assert(salesmanRes.success && salesmanData?.salesmanCode === 'SM-000001', `Salesman created: ${salesmanData?.name} (${salesmanData?.salesmanCode})`);
  const salesmanId = salesmanData?.id || 'SM-000001';

  // -------------------------------------------------------------
  // 4. STEP 3: CUSTOMER MASTER & ASSIGNMENT
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Customer / Outlet Master (Step 3) ---');
  const custRes = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customerName: 'Sharma General Store',
      shopName: 'Sharma General Store',
      ownerName: 'Sharma Ji',
      mobile: '9876500001',
      address: 'Shop 12, Sadar Bazaar Main Road',
      areaId: areaId,
      routeId: routeId,
      salesmanId: 'user-salesman-01',
      salesmanName: 'Rahul Kumar',
      creditLimit: 50000,
      paymentTerms: '7_DAYS',
      gstin: '22AAAAA0000A1Z5'
    })
  }).then(r => r.json());
  const customerData = custRes.customer || custRes.data;
  assert(custRes.success && customerData?.customerCode === 'CUS-000001', `Customer created: ${customerData?.customerName} (${customerData?.customerCode})`);
  const customerId = customerData.id;

  // Verify Customer in list
  const custList = await fetch(`${BASE_URL}/customers`, { headers: authHeaders }).then(r => r.json());
  assert(custList.total === 1 && custList.data[0].customerCode === 'CUS-000001', 'Customer list reflects 1 active outlet');

  // -------------------------------------------------------------
  // 5. STEP 4 & STEP 9: PRODUCT MASTER & INVENTORY MANAGEMENT
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Product Master & Inventory Engine (Steps 4 & 9) ---');
  
  // 5a. Create Product
  const prodRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productName: 'Maggi 2-Minute Masala Noodles 70g',
      sku: 'NEST-MAG-70',
      companyId: 'COMP-NESTLE',
      companyName: 'Nestlé',
      category: 'Noodles',
      unit: 'PACK',
      packSize: '70g',
      mrp: 14,
      saleRate: 12.5,
      purchaseRate: 10.0,
      taxRate: 5,
      minimumStock: 50
    })
  }).then(r => r.json());
  const productData = prodRes.product || prodRes.data;
  assert(prodRes.success && productData?.productCode === 'PRD-000001', `Product created: ${productData?.productName} (${productData?.productCode})`);
  const productId = productData.id;

  // 5b. Check Inventory Auto-Sync (Out of Stock initially)
  const invListBefore = await fetch(`${BASE_URL}/inventory`, { headers: authHeaders }).then(r => r.json());
  assert(invListBefore.data.length === 1 && invListBefore.data[0].currentStock === 0, 'Inventory auto-synced product with 0 stock (OUT_OF_STOCK)');
  const inventoryId = invListBefore.data[0].id;

  // 5c. Stock Adjustment IN (+500 Units)
  const adjustInRes = await fetch(`${BASE_URL}/inventory/${inventoryId}/adjustment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      adjustmentType: 'ADJUSTMENT_IN',
      quantity: 500,
      reason: 'Direct FMCG primary shipment received from Nestlé depot'
    })
  }).then(r => r.json());
  assert(adjustInRes.success && adjustInRes.data.inventory.currentStock === 500, `Stock adjusted IN: currentStock = 500 units, status = ${adjustInRes.data?.inventory?.status}`);

  // 5d. Check Stock Movements Audit Trail
  const movementsRes = await fetch(`${BASE_URL}/inventory/${inventoryId}/movements`, { headers: authHeaders }).then(r => r.json());
  assert(movementsRes.data.length > 0 && movementsRes.data[0].quantity === 500, 'Stock movement audit trail recorded ADJUSTMENT_IN entry');

  // -------------------------------------------------------------
  // 6. STEP 6: ORDER BOOKING ENGINE
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Order Booking Engine (Step 6) ---');
  
  // 6a. Book Draft Order
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${salesmanToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: customerId,
      orderDate: new Date().toISOString(),
      items: [
        {
          productId: productId,
          quantity: 20,
          rate: 12.5,
          taxPercent: 5
        }
      ],
      remarks: 'Fast delivery requested for evening rush'
    })
  }).then(r => r.json());
  const orderData = orderRes.data || orderRes.order;
  assert(orderRes.success && orderData?.orderNumber === 'ORD-000001', `Order created: ${orderData?.orderNumber} (Status: ${orderData?.status || orderData?.orderStatus})`);
  const orderId = orderData.id;

  // 6b. Finalize & Submit Order
  const submitOrderRes = await fetch(`${BASE_URL}/orders/${orderId}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${salesmanToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Retailer confirmed order quantities' })
  }).then(r => r.json());
  const submittedOrder = submitOrderRes.data || submitOrderRes.order;
  assert(submitOrderRes.success && (submittedOrder.status === 'SUBMITTED' || submittedOrder.orderStatus === 'SUBMITTED'), 'Order successfully submitted and approved for invoice generation');

  // -------------------------------------------------------------
  // 7. STEP 7: BILLING / INVOICE ENGINE
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Billing & Invoice Engine (Step 7) ---');
  
  // 7a. Generate Invoice from Order
  const billRes = await fetch(`${BASE_URL}/bills/generate/${orderId}`, {
    method: 'POST',
    headers: authHeaders
  }).then(r => r.json());
  const billData = billRes.data || billRes.bill;
  const billAmount = billData?.netAmount || billData?.totalAmount || 262.5;
  assert(billRes.success && billData?.billNumber?.startsWith('INV-'), `Invoice generated: ${billData?.billNumber} for ₹${billAmount}`);
  const billId = billData.id;

  // 7b. Verify Stock Deduction in Inventory
  const invAfterBill = await fetch(`${BASE_URL}/inventory/${inventoryId}`, { headers: authHeaders }).then(r => r.json());
  assert(invAfterBill.data.currentStock === 480, `Inventory automatically deducted: 500 - 20 = ${invAfterBill.data.currentStock} units`);

  // 7c. Lock Invoice for Dispatch
  const lockRes = await fetch(`${BASE_URL}/bills/${billId}/lock`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ notes: 'Locked for dispatch vehicle assignment' })
  }).then(r => r.json());
  const lockedBill = lockRes.data || lockRes.bill;
  assert(lockRes.success && (lockedBill?.isLocked === true || lockedBill?.billStatus === 'LOCKED'), 'Invoice successfully locked for dispatch');

  // -------------------------------------------------------------
  // 8. STEP 8: PAYMENT COLLECTION & SMART RECONCILIATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Payment Collection & Smart Reconciliation (Step 8) ---');
  
  // 8a. Record Payment (UPI collection)
  const payRes = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customerId: customerId,
      salesmanId: salesmanId,
      paymentMode: 'UPI',
      amount: billAmount,
      referenceNumber: 'UPI-RAIPUR-998811',
      payerName: 'Sharma Ji (Shop PhonePe)',
      notes: 'Full payment against Invoice'
    })
  }).then(r => r.json());
  const payData = payRes.data || payRes.payment;
  assert(payRes.success && payData?.paymentNumber?.startsWith('PAY-'), `Payment recorded: ${payData?.paymentNumber} (₹${payData?.amount})`);
  const paymentId = payData.id;

  // 8b. Map/Allocate Payment to Invoice
  const mapRes = await fetch(`${BASE_URL}/payments/${paymentId}/map`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      allocations: [
        { billId: billId, allocatedAmount: billAmount }
      ]
    })
  }).then(r => r.json());
  const mappedPay = mapRes.data || mapRes.payment;
  assert(mapRes.success && mappedPay.status === 'MAPPED', 'Payment successfully mapped against invoice');

  // 8c. Verify Bill Payment Status updated to PAID
  const updatedBill = await fetch(`${BASE_URL}/bills/${billId}`, { headers: authHeaders }).then(r => r.json());
  const updatedBillData = updatedBill.data || updatedBill.bill;
  assert(updatedBillData.paymentStatus === 'PAID' && updatedBillData.balanceAmount === 0, 'Bill balanceAmount updated to ₹0 (PAID)');

  // 8d. Record Unmatched UPI Suspense Payment
  const unmatchRes = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      paymentMode: 'UPI',
      amount: 450.0,
      referenceNumber: 'UPI-SUSPENSE-001',
      payerName: 'Unknown Retailer Savings A/C',
      notes: 'Awaiting customer invoice allocation'
    })
  }).then(r => r.json());
  const unmatchData = unmatchRes.data || unmatchRes.payment;
  assert(unmatchRes.success && unmatchData.status === 'UNMATCHED', 'Unmatched UPI payment captured in suspense queue');

  // Verify Unmatched Queue
  const queueRes = await fetch(`${BASE_URL}/payments/unmatched`, { headers: authHeaders }).then(r => r.json());
  assert(queueRes.data.length >= 1, `Unmatched queue contains ${queueRes.data.length} unmatched credit records`);

  // -------------------------------------------------------------
  // 9. STEP 10: DELIVERY & DISPATCH MANAGEMENT
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Delivery & Fleet Dispatch Management (Step 10) ---');
  
  // 9a. Create Delivery Vehicle
  const vehRes = await fetch(`${BASE_URL}/vehicles`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      vehicleNumber: 'CG04AB9999',
      vehicleType: 'Mini Truck (Tata Ace)',
      capacity: '1500 KG',
      driverName: 'Mohan Lal',
      driverMobile: '9826199999'
    })
  }).then(r => r.json());
  const vehData = vehRes.vehicle || vehRes.data;
  assert(vehRes.success && vehData?.vehicleNumber === 'CG04AB9999', `Vehicle registered: ${vehData?.vehicleNumber}`);
  const vehicleId = vehData.id;

  // 9b. Create Delivery Trip
  const tripRes = await fetch(`${BASE_URL}/delivery/trips`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      vehicleId: vehicleId,
      driverName: 'Mohan Lal',
      driverMobile: '9826199999',
      routeId: routeId,
      plannedDate: new Date().toISOString(),
      billIds: [billId],
      notes: 'Primary dispatch run'
    })
  }).then(r => r.json());
  const tripData = tripRes.trip || tripRes.data;
  assert(tripRes.success && tripData?.tripNumber?.startsWith('TRIP-'), `Delivery trip planned: ${tripData?.tripNumber}`);
  const tripId = tripData.id;

  // 9c. Dispatch Trip
  const dispatchRes = await fetch(`${BASE_URL}/delivery/trips/${tripId}/dispatch`, {
    method: 'PATCH',
    headers: authHeaders
  }).then(r => r.json());
  const dispatchedTrip = dispatchRes.trip || dispatchRes.data;
  assert(dispatchRes.success && dispatchedTrip.status === 'DISPATCHED', 'Delivery trip successfully DISPATCHED');

  // 9d. Start Trip
  const startTripRes = await fetch(`${BASE_URL}/delivery/trips/${tripId}/start`, {
    method: 'PATCH',
    headers: authHeaders
  }).then(r => r.json());
  const startedTrip = startTripRes.trip || startTripRes.data;
  assert(startTripRes.success && startedTrip.status === 'IN_PROGRESS', 'Delivery trip started (IN_PROGRESS)');

  // 9e. Mark Bill Delivered
  const deliverRes = await fetch(`${BASE_URL}/delivery/trips/${tripId}/delivery/${billId}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'DELIVERED', remarks: 'Delivered at shop counter' })
  }).then(r => r.json());
  assert(deliverRes.success, 'Invoice marked as DELIVERED to outlet');

  // 9f. Complete Trip
  const completeTripRes = await fetch(`${BASE_URL}/delivery/trips/${tripId}/complete`, {
    method: 'PATCH',
    headers: authHeaders
  }).then(r => r.json());
  const completedTrip = completeTripRes.trip || completeTripRes.data;
  assert(completeTripRes.success && completedTrip.status === 'COMPLETED', 'Delivery trip successfully COMPLETED');

  // -------------------------------------------------------------
  // 10. STEP 11: OWNER EXCEPTION & APPROVAL TOWER
  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Owner Exception & Approval Control Center (Step 11) ---');
  
  // 10a. Query Exceptions List
  const excListRes = await fetch(`${BASE_URL}/exceptions`, { headers: authHeaders }).then(r => r.json());
  assert(excListRes.success, 'Exception control tower queried successfully');

  // 10b. Query Approvals Summary
  const aprSummaryRes = await fetch(`${BASE_URL}/approvals/summary`, { headers: authHeaders }).then(r => r.json());
  assert(aprSummaryRes.success, 'Approvals summary retrieved successfully');

  // -------------------------------------------------------------
  // 11. STEP 2 & STEP 12: DYNAMIC DASHBOARD & EXECUTIVE REPORTS
  // -------------------------------------------------------------
  console.log('\n--- TEST 11: Dynamic Dashboard & Business Reports (Steps 2 & 12) ---');
  
  // 11a. Owner Dashboard Live Aggregation
  const dashLive = await fetch(`${BASE_URL}/dashboard/owner`, { headers: authHeaders }).then(r => r.json());
  assert(dashLive.success && dashLive.data.summary.totalCustomers === 1, `Live Dashboard: totalCustomers = ${dashLive.data.summary.totalCustomers}`);
  assert(dashLive.data.summary.todaysBillsCount >= 1, `Live Dashboard: todaysBillsCount = ${dashLive.data.summary.todaysBillsCount}`);
  assert(dashLive.data.summary.stockValue > 0, `Live Dashboard: stockValue = ₹${dashLive.data.summary.stockValue}`);
  assert(dashLive.data.network.totalOutlets === 1, `Live Dashboard Network: totalOutlets = 1`);

  // 11b. Executive Summary Report
  const execReport = await fetch(`${BASE_URL}/reports/executive-summary`, { headers: authHeaders }).then(r => r.json());
  assert(execReport.success && execReport.data.totalBills >= 1, `Executive Summary Report: totalBills = ${execReport.data.totalBills}`);

  // 11c. Sales Analytics Report
  const salesReport = await fetch(`${BASE_URL}/reports/sales`, { headers: authHeaders }).then(r => r.json());
  assert(salesReport.success && salesReport.data.grossSales > 0, `Sales Analytics: grossSales = ₹${salesReport.data.grossSales}`);

  // 11d. Collection Analytics Report
  const collReport = await fetch(`${BASE_URL}/reports/collections`, { headers: authHeaders }).then(r => r.json());
  assert(collReport.success && collReport.data.totalCollection > 0, `Collection Analytics: totalCollection = ₹${collReport.data.totalCollection}`);

  // -------------------------------------------------------------
  // 12. ERROR HANDLING & VALIDATION CHECKS
  // -------------------------------------------------------------
  console.log('\n--- TEST 12: Validation & Error Handling Checks ---');

  // 12a. Excessive stock deduction rejected
  const badDeductRes = await fetch(`${BASE_URL}/inventory/${inventoryId}/adjustment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      adjustmentType: 'ADJUSTMENT_OUT',
      quantity: 999999,
      reason: 'Illegal reduction test'
    })
  });
  assert(badDeductRes.status === 400, 'Excessive stock deduction properly rejected with HTTP 400');

  // 12b. Missing adjustment reason rejected
  const missingReasonRes = await fetch(`${BASE_URL}/inventory/${inventoryId}/adjustment`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      adjustmentType: 'ADJUSTMENT_IN',
      quantity: 50
    })
  });
  assert(missingReasonRes.status === 400, 'Missing stock adjustment reason properly rejected with HTTP 400');

  // 12c. Duplicate product SKU rejected
  const dupSkuRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      productName: 'Duplicate SKU Product',
      sku: 'NEST-MAG-70', // same as earlier
      companyId: 'COMP-NESTLE',
      category: 'Noodles',
      unit: 'PACK',
      mrp: 14,
      saleRate: 12.5
    })
  });
  assert(dupSkuRes.status === 400, 'Duplicate product SKU properly rejected with HTTP 400');

  // 12d. Empty order submission rejected
  const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      customerId: customerId,
      items: []
    })
  });
  assert(emptyOrderRes.status === 400, 'Order without product line items properly rejected with HTTP 400');

  // -------------------------------------------------------------
  // TEST SUMMARY REPORT
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${results.passed} PASSED, ${results.failed} FAILED (Total: ${results.passed + results.failed})`);
  console.log('================================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
