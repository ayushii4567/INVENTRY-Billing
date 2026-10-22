const API_BASE = "http://127.0.0.1:5005";

async function runDemoTest() {
  console.log("==================================================================");
  console.log("DISTRIBUTOR ERP — CLIENT DEMO FLOW TEST");
  console.log("==================================================================\n");

  let ownerToken = "";
  let salesmanToken = "";
  let sharmaCustomerId = "";
  let maggiProductId = "";
  let kitkatProductId = "";
  let createdOrderId = "";
  let orderNumber = "";

  // 1. Owner Login
  console.log("STEP 1: OWNER LOGIN");
  const ownerLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrMobile: "owner@distributorerp.com", password: "Password123!", role: "SUPER_ADMIN" })
  });
  const ownerLoginData = await ownerLoginRes.json();
  if (!ownerLoginRes.ok || !ownerLoginData.token) {
    throw new Error("Owner login failed: " + JSON.stringify(ownerLoginData));
  }
  ownerToken = ownerLoginData.token;
  console.log(`✓ Owner logged in: ${ownerLoginData.user.name} (${ownerLoginData.user.role})`);

  // 2. Owner Command Center
  console.log("\nSTEP 2: OWNER COMMAND CENTER DASHBOARD");
  const dashRes = await fetch(`${API_BASE}/api/dashboard/owner`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const dashData = await dashRes.json();
  if (!dashRes.ok) throw new Error("Dashboard fetch failed: " + JSON.stringify(dashData));
  console.log(`✓ Today's Sales: ₹${dashData.data.summary?.todaysSales}`);
  console.log(`✓ Today's Collection: ₹${dashData.data.summary?.todaysCollection}`);
  console.log(`✓ Total Outstanding: ₹${dashData.data.summary?.totalOutstanding}`);
  console.log(`✓ Today's Bills: ${dashData.data.summary?.todaysBillsCount}`);
  console.log(`✓ Stock Value: ₹${dashData.data.summary?.stockValue}`);
  console.log(`✓ Sales Trend items: ${dashData.data.sales?.weeklyTrend?.length || 0}`);
  console.log(`✓ Cash/UPI/Cheque Breakdown: Cash ₹${dashData.data.collections?.cash?.amount}, UPI ₹${dashData.data.collections?.upi?.amount}, Cheque ₹${dashData.data.collections?.cheque?.amount}`);
  console.log(`✓ Alerts/Exceptions count: ${dashData.data.exceptions?.length || 0}`);

  // 3. Customer Master Demo
  console.log("\nSTEP 3: CUSTOMER MASTER DEMO");
  const custRes = await fetch(`${API_BASE}/api/customers?limit=10&search=Sharma`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const custData = await custRes.json();
  if (!custRes.ok) throw new Error("Customers fetch failed: " + JSON.stringify(custData));
  const sharma = custData.data.find(c => c.shopName.includes("Sharma"));
  if (!sharma) throw new Error("Sharma General Store not found in search");
  sharmaCustomerId = sharma.id || sharma._id;
  console.log(`✓ Found Customer: "${sharma.shopName}" | Owner: ${sharma.ownerName} | Mobile: ${sharma.mobile} | Route: ${sharma.routeName} | Salesman: ${sharma.salesmanName} | Credit Limit: ₹${sharma.creditLimit}`);

  // 4. Product Master Demo
  console.log("\nSTEP 4: PRODUCT MASTER DEMO");
  const prodRes = await fetch(`${API_BASE}/api/products?limit=50`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const prodData = await prodRes.json();
  if (!prodRes.ok) throw new Error("Products fetch failed: " + JSON.stringify(prodData));
  const brands = [...new Set(prodData.data.map(p => p.brand || p.companyName))];
  console.log(`✓ Loaded ${prodData.data.length} Products across Brands: ${brands.join(", ")}`);
  
  const maggi = prodData.data.find(p => p.productName.toLowerCase().includes("maggi")) || prodData.data[0];
  const kitkat = prodData.data.find(p => p.productName.toLowerCase().includes("kitkat")) || prodData.data[1];
  if (!maggi || !kitkat) throw new Error("Products not found in master");
  maggiProductId = maggi.id || maggi._id;
  kitkatProductId = kitkat.id || kitkat._id;
  console.log(`✓ Demo Item 1: ${maggi.productName} | SKU: ${maggi.sku} | MRP: ₹${maggi.mrp} | Rate: ₹${maggi.baseSaleRate || maggi.saleRate} | GST: ${maggi.taxRate}%`);
  console.log(`✓ Demo Item 2: ${kitkat.productName} | SKU: ${kitkat.sku} | MRP: ₹${kitkat.mrp} | Rate: ₹${kitkat.baseSaleRate || kitkat.saleRate} | GST: ${kitkat.taxRate}%`);

  // 5. Salesman & Route Master Demo
  console.log("\nSTEP 5: SALESMAN & ROUTE MASTER DEMO");
  const smRes = await fetch(`${API_BASE}/api/salesmen`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const smData = await smRes.json();
  const rahul = smData.data.find(s => s.name?.includes("Rahul"));
  console.log(`✓ Found Salesman: ${rahul.name} (${rahul.employeeCode}) | Mobile: ${rahul.mobile} | Assigned Routes: ${rahul.assignedRouteIds?.length || 0}`);

  // 6. Salesman Login (Rahul Kumar)
  console.log("\nSTEP 6: SALESMAN LOGIN (RAHUL KUMAR)");
  const smLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrMobile: "salesman@distributorerp.com", password: "Password123!", role: "SALESMAN" })
  });
  const smLoginData = await smLoginRes.json();
  if (!smLoginRes.ok || !smLoginData.token) throw new Error("Salesman login failed: " + JSON.stringify(smLoginData));
  salesmanToken = smLoginData.token;
  console.log(`✓ Salesman logged in: ${smLoginData.user.name} (${smLoginData.user.role})`);

  // 7. My Route & My Customers
  console.log("\nSTEP 7: MY ROUTE & MY CUSTOMERS (SCOPED TO RAHUL)");
  const myCustRes = await fetch(`${API_BASE}/api/customers?limit=100`, {
    headers: { Authorization: `Bearer ${salesmanToken}` }
  });
  const myCustData = await myCustRes.json();
  if (!myCustRes.ok) throw new Error("My customers fetch failed: " + JSON.stringify(myCustData));
  console.log(`✓ Rahul's Assigned Outlets (${myCustData.data.length} outlets):`);
  myCustData.data.forEach(c => {
    console.log(`   - ${c.shopName} (${c.customerCode}) | Beat: ${c.routeName} | Balance: ₹${c.currentBalance || c.outstandingBalance || 0}`);
  });

  // 8. Simple Book Order
  console.log("\nSTEP 8: SIMPLE BOOK ORDER (MAGGI x20, KITKAT x10)");
  const createOrderPayload = {
    customerId: sharmaCustomerId,
    items: [
      { productId: maggiProductId, quantity: 20 },
      { productId: kitkatProductId, quantity: 10 }
    ],
    notes: "Demo order from Rahul Kumar"
  };

  const createOrderRes = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${salesmanToken}`
    },
    body: JSON.stringify(createOrderPayload)
  });
  const createOrderData = await createOrderRes.json();
  if (!createOrderRes.ok || !createOrderData.success) {
    throw new Error("Order booking failed: " + JSON.stringify(createOrderData));
  }
  createdOrderId = createOrderData.data.id || createOrderData.data._id;
  orderNumber = createOrderData.data.orderNumber;
  console.log(`✓ Order Created as DRAFT: ${orderNumber}`);
  console.log(`   - Subtotal: ₹${createOrderData.data.pricingSummary.grossSubtotal.toFixed(2)}`);
  console.log(`   - Total GST: ₹${createOrderData.data.pricingSummary.totalTax.toFixed(2)}`);
  console.log(`   - Grand Total: ₹${createOrderData.data.pricingSummary.grandTotal.toFixed(2)}`);

  // Submit Order
  console.log("\nSTEP 9: SUBMIT ORDER");
  const submitRes = await fetch(`${API_BASE}/api/orders/${createdOrderId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${salesmanToken}`
    }
  });
  const submitData = await submitRes.json();
  if (!submitRes.ok || !submitData.success) {
    throw new Error("Order submission failed: " + JSON.stringify(submitData));
  }
  console.log(`✓ ORDER SUBMITTED SUCCESSFULLY!`);
  console.log(`   - Order Number: ${submitData.data.orderNumber}`);
  console.log(`   - Customer: ${submitData.data.customer.shopName}`);
  console.log(`   - Items: ${submitData.data.pricingSummary.totalItems} line items (${submitData.data.pricingSummary.totalQuantity} units)`);
  console.log(`   - Grand Total: ₹${submitData.data.pricingSummary.grandTotal.toFixed(2)}`);
  console.log(`   - Status: ${submitData.data.status}`);
  console.log(`   - Date/Time: ${new Date(submitData.data.submittedAt || submitData.data.updatedAt).toLocaleString("en-IN")}`);

  // 10. Owner View of Order
  console.log("\nSTEP 10: OWNER VIEW OF ORDER (SALES -> ORDERS)");
  const ownerOrdersRes = await fetch(`${API_BASE}/api/orders?limit=10`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const ownerOrdersData = await ownerOrdersRes.json();
  if (!ownerOrdersRes.ok) throw new Error("Owner orders fetch failed: " + JSON.stringify(ownerOrdersData));
  
  const latestOrder = ownerOrdersData.data[0];
  console.log(`✓ Owner instantly sees the latest order at top of list:`);
  console.log(`   - Order #: ${latestOrder.orderNumber}`);
  console.log(`   - Date: ${new Date(latestOrder.orderDate || latestOrder.createdAt).toLocaleDateString("en-IN")}`);
  console.log(`   - Customer: ${latestOrder.customer.shopName}`);
  console.log(`   - Salesman: ${latestOrder.salesman.salesmanName}`);
  console.log(`   - Route: ${latestOrder.route.routeName}`);
  console.log(`   - Items: ${latestOrder.pricingSummary.totalItems} items`);
  console.log(`   - Grand Total: ₹${latestOrder.pricingSummary.grandTotal.toFixed(2)}`);
  console.log(`   - Status: ${latestOrder.status}`);

  if (latestOrder.orderNumber !== orderNumber) {
    throw new Error(`Expected latest order ${orderNumber} but got ${latestOrder.orderNumber}`);
  }

  // Owner detail view
  const detailRes = await fetch(`${API_BASE}/api/orders/${createdOrderId}`, {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const detailData = await detailRes.json();
  if (!detailRes.ok) throw new Error("Order detail fetch failed: " + JSON.stringify(detailData));
  console.log(`✓ Owner opened full order details:`);
  detailData.data.items.forEach((item, idx) => {
    console.log(`     [${idx+1}] ${item.productName} | Qty: ${item.quantity} | Rate: ₹${item.saleRate} | GST: ${item.taxRate}% (₹${item.taxAmount?.toFixed(2)}) | Line Total: ₹${item.lineTotal?.toFixed(2)}`);
  });

  console.log("\n==================================================================");
  console.log(">>> DEMO FLOW VERIFICATION COMPLETE: ALL 10 STEPS PASSED 100% <<<");
  console.log("==================================================================");
}

runDemoTest().catch(err => {
  console.error("\n❌ DEMO TEST ERROR:", err);
  process.exit(1);
});
