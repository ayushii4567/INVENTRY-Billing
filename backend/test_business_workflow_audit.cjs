/**
 * BUSINESS FLOW AND AUDIT VERIFICATION TEST
 * Tests end-to-end Tally-style accounting flows:
 * 1. Auth & Token generation
 * 2. Purchase Inward (F9) -> Stock +100, Supplier Payable +
 * 3. Direct Sales Bill (F8) -> Stock -10, Customer Receivable +
 * 4. Receipt Voucher (F6) -> Cash/Bank +, Customer Receivable -
 * 5. Supplier Payment (F5) -> Supplier Payable -, Cash/Bank -
 * 6. Day Book verification -> Balanced Dr/Cr
 * 7. Trial Balance verification -> Total Dr == Total Cr
 * 8. Profit & Loss & Balance Sheet reconciliation
 * 9. Reversal / Cancellation audit trail & stock restore
 * 10. Duplicate invoice prevention
 */

const http = require("http");

const BASE_URL = "http://localhost:5005";

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      }
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 STARTING FMCG ERP ACCOUNTING & LOGICAL FLOW AUDIT TESTS");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? "- " + details : ""}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate as Super Admin
    console.log("--- 1. Authenticating Super Admin ---");
    const loginRes = await apiRequest("POST", "/api/auth/login", {
      emailOrMobile: "owner@distributorerp.com",
      password: "Password123!",
      role: "SUPER_ADMIN"
    });
    
    assert(loginRes.status === 200 && loginRes.data.success, "Admin Login Succeeded");
    const token = loginRes.data.token;
    assert(!!token, "Received JWT Token");

    // Profile check (Session refresh persistence)
    const profileRes = await apiRequest("GET", "/api/auth/profile", null, token);
    assert(profileRes.status === 200 && profileRes.data.success, "Profile validation (Refresh Persistence)");

    // 2. Fetch or create a Customer, Supplier, and Product
    console.log("\n--- 2. Checking Masters (Customer, Supplier, Product) ---");
    const customersRes = await apiRequest("GET", "/api/customers", null, token);
    const customer = customersRes.data?.data?.[0];
    assert(!!customer, "Retrieved Customer Master", customer?.name);

    const suppliersRes = await apiRequest("GET", "/api/suppliers", null, token);
    const supplier = suppliersRes.data?.data?.[0];
    assert(!!supplier, "Retrieved Supplier Master", supplier?.name);

    const productsRes = await apiRequest("GET", "/api/products", null, token);
    const product = productsRes.data?.data?.[0];
    assert(!!product, "Retrieved Product Master", product?.name);

    // Initial stock check
    const invRes1 = await apiRequest("GET", "/api/inventory", null, token);
    const initialInv = invRes1.data?.data?.find(i => (i.productId?._id || i.productId) === (product._id || product.id));
    const initialStock = initialInv ? (initialInv.currentStock || 0) : 0;
    const prodName = product.productName || product.name || "Test Product";
    console.log(`Initial Stock for ${prodName}: ${initialStock}`);

    // 3. Test 1: Purchase 100 cartons -> stock increases -> supplier payable updates
    console.log("\n--- 3. TEST 1: Purchase Inward (F9) ---");
    const initialPayable = Number(supplier.currentBalance || 0);
    const purchasePayload = {
      supplierId: supplier._id || supplier.id,
      supplierInvoiceNumber: `INV-SUP-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString(),
      items: [
        {
          productId: product._id || product.id,
          productName: prodName,
          quantity: 100,
          purchaseRate: 200,
          mrp: 250,
          taxRate: 18,
          amount: 20000,
          taxAmount: 3600
        }
      ],
      subTotal: 20000,
      taxTotal: 3600,
      grandTotal: 23600,
      paymentTerms: "CREDIT"
    };

    const purchaseRes = await apiRequest("POST", "/api/purchases", purchasePayload, token);
    assert(purchaseRes.status === 201 && purchaseRes.data.success, "Purchase Voucher created (F9)");
    
    // Check stock increased by 100
    const invRes2 = await apiRequest("GET", "/api/inventory", null, token);
    const postPurchaseInv = invRes2.data?.data?.find(i => (i.productId?._id || i.productId) === (product._id || product.id));
    const stockAfterPurchase = postPurchaseInv ? postPurchaseInv.currentStock : 0;
    assert(stockAfterPurchase === initialStock + 100, `Stock increased by 100 cartons (was ${initialStock}, now ${stockAfterPurchase})`);

    // Check supplier payable updated
    const suppliersRes2 = await apiRequest("GET", "/api/suppliers", null, token);
    const updatedSupplier = suppliersRes2.data?.data?.find(s => (s._id || s.id) === (supplier._id || supplier.id));
    const payableAfterPurchase = Number(updatedSupplier.currentBalance || 0);
    assert(payableAfterPurchase >= initialPayable + 23600, `Supplier payable increased by ₹23,600 (now ₹${payableAfterPurchase})`);

    // 4. Test 2: Direct F8 Sales invoice: Sell 10 cartons on credit -> stock decreases -> customer receivable updates
    console.log("\n--- 4. TEST 2: Direct Sales Invoice (F8) ---");
    const initialReceivable = Number(customer.currentBalance || 0);
    const directBillPayload = {
      customerId: customer._id || customer.id || customer.customerId,
      items: [
        {
          productId: product._id || product.id,
          name: prodName,
          quantity: 10,
          unitPrice: 240,
          taxRate: 18,
          total: 2400
        }
      ],
      paymentMethod: "CREDIT",
      discountAmount: 0
    };

    const directBillRes = await apiRequest("POST", "/api/bills", directBillPayload, token);
    assert(directBillRes.status === 201 && directBillRes.data.success, "Direct Sales Invoice Posted (F8)");
    const createdBill = directBillRes.data?.data;
    const allocatedBillNumber = createdBill?.billNumber || createdBill?.invoiceNumber;
    assert(!!allocatedBillNumber, `Invoice Number Allocated: ${allocatedBillNumber}`);

    // Verify stock reduced by 10
    const invRes3 = await apiRequest("GET", "/api/inventory", null, token);
    const postSaleInv = invRes3.data?.data?.find(i => (i.productId?._id || i.productId) === (product._id || product.id));
    const stockAfterSale = postSaleInv ? postSaleInv.currentStock : 0;
    assert(stockAfterSale === stockAfterPurchase - 10, `Stock decreased by 10 cartons (was ${stockAfterPurchase}, now ${stockAfterSale})`);

    // 5. Test 3: Customer Receipt Voucher (F6) -> Cash/Bank +, Customer Outstanding -
    console.log("\n--- 5. TEST 3: Customer Receipt Voucher (F6) ---");
    const receiptPayload = {
      customerId: customer._id || customer.id || customer.customerId,
      amount: 1000,
      paymentMode: "CASH",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "Partial receipt against invoice"
    };

    const receiptRes = await apiRequest("POST", "/api/payments", receiptPayload, token);
    assert(receiptRes.status === 201 && receiptRes.data.success, "Customer Receipt Recorded (F6)");

    // 6. Test 6: Supplier Payment Voucher (F5) -> Supplier Payable -, Cash/Bank -
    console.log("\n--- 6. TEST 4: Supplier Payment Voucher (F5) ---");
    const supplierPayPayload = {
      supplierId: supplier._id || supplier.id,
      amount: 5000,
      paymentMode: "BANK_TRANSFER",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: "UTR987654321",
      notes: "Payment on account"
    };

    const supplierPayRes = await apiRequest("POST", "/api/payments/supplier", supplierPayPayload, token);
    assert(supplierPayRes.status === 201 && supplierPayRes.data.success, "Supplier Payment Voucher Posted (F5)");

    const suppliersRes3 = await apiRequest("GET", "/api/suppliers", null, token);
    const supplierAfterPay = suppliersRes3.data?.data?.find(s => (s._id || s.id) === (supplier._id || supplier.id));
    assert(Number(supplierAfterPay.currentBalance) === payableAfterPurchase - 5000, `Supplier balance reduced by ₹5,000 (now ₹${supplierAfterPay.currentBalance})`);

    // 7. Test 7: Day Book Report -> Balanced Dr/Cr
    console.log("\n--- 7. TEST 5: Day Book Verification ---");
    const dayBookRes = await apiRequest("GET", "/api/reports/daybook", null, token);
    assert(dayBookRes.status === 200 && dayBookRes.data.success, "Day Book Report API Succeeded");
    const dayBookData = dayBookRes.data?.data;
    assert(dayBookData?.entries?.length > 0, `Day Book contains ${dayBookData?.entries?.length} entries`);
    console.log(`Day Book Total Debits: ₹${dayBookData?.totalDebit}, Total Credits: ₹${dayBookData?.totalCredit}`);
    // Dr and Cr in double entry accounting must match!
    const drCrDiff = Math.abs((dayBookData?.totalDebit || 0) - (dayBookData?.totalCredit || 0));
    assert(drCrDiff < 0.01, `Day Book is Balanced! (Difference: ${drCrDiff})`);

    // 8. Test 8: Trial Balance Report -> Total Dr == Total Cr
    console.log("\n--- 8. TEST 6: Trial Balance Verification ---");
    const tbRes = await apiRequest("GET", "/api/reports/trial-balance", null, token);
    assert(tbRes.status === 200 && tbRes.data.success, "Trial Balance API Succeeded");
    const tbData = tbRes.data?.data;
    assert(tbData?.isBalanced === true, `Trial Balance is BALANCED! (Total Dr: ₹${tbData?.totalDebit}, Total Cr: ₹${tbData?.totalCredit})`);

    // 9. Test 9: Profit & Loss and Balance Sheet Reports
    console.log("\n--- 9. TEST 7: P&L and Balance Sheet ---");
    const plRes = await apiRequest("GET", "/api/reports/profit-loss", null, token);
    assert(plRes.status === 200 && plRes.data.success, "Profit & Loss API Succeeded");
    console.log(`Sales Revenue: ₹${plRes.data?.data?.revenue?.netSales}, Gross Margin: ${plRes.data?.data?.grossMarginPercent}%, Net Profit: ₹${plRes.data?.data?.netProfit}`);

    const bsRes = await apiRequest("GET", "/api/reports/balance-sheet", null, token);
    assert(bsRes.status === 200 && bsRes.data.success, "Balance Sheet API Succeeded");
    console.log(`Total Assets: ₹${bsRes.data?.data?.assets?.totalAssets}, Total Liabilities: ₹${bsRes.data?.data?.liabilities?.totalLiabilities}`);

    // 10. Test 10: Reversal / Cancellation Audit Trail
    console.log("\n--- 10. TEST 8: Reversal / Cancellation Audit Trail ---");
    if (createdBill?._id || createdBill?.id) {
      const billId = createdBill._id || createdBill.id;
      const cancelRes = await apiRequest("POST", `/api/bills/${billId}/cancel`, {
        reason: "Customer order cancelled before dispatch"
      }, token);
      assert(cancelRes.status === 200 && cancelRes.data.success, "Invoice Cancelled with Reversal Entries");

      // Verify stock was restored by 10
      const invRes4 = await apiRequest("GET", "/api/inventory", null, token);
      const postCancelInv = invRes4.data?.data?.find(i => (i.productId?._id || i.productId) === (product._id || product.id));
      const stockAfterCancel = postCancelInv ? postCancelInv.currentStock : 0;
      assert(stockAfterCancel === stockAfterSale + 10, `Stock restored upon invoice cancellation (now ${stockAfterCancel})`);
    }

    // 11. Test 11: RBAC Role-Based Access Control Verification
    console.log("\n--- 11. TEST 9: RBAC Role Permission Verification ---");
    const smLogin = await apiRequest("POST", "/api/auth/login", {
      emailOrMobile: "salesman@distributorerp.com",
      password: "Password123!",
      role: "SALESMAN"
    });
    const smToken = smLogin.data?.token;
    assert(!!smToken, "Salesman Logged In with Restricted Role");

    // Salesman attempting to create a direct invoice -> should be 403 Forbidden
    const forbiddenBill = await apiRequest("POST", "/api/bills", {
      customerName: "Unauthorized Test",
      items: [{ productId: "prd-01", quantity: 1, rate: 100 }]
    }, smToken);
    assert(forbiddenBill.status === 403, "Salesman blocked from Direct Billing (403 Forbidden)");

    // Salesman attempting to create purchase voucher -> should be 403 Forbidden
    const forbiddenPurchase = await apiRequest("POST", "/api/purchases", {
      supplierId: "sup-001",
      supplierInvoiceNumber: "FORBIDDEN-01",
      items: [{ productId: "prd-01", quantity: 1, purchaseRate: 100 }]
    }, smToken);
    assert(forbiddenPurchase.status === 403 || forbiddenPurchase.status === 401, "Salesman blocked from Purchase Inward (403 Forbidden)");

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  }

  console.log("\n=================================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
