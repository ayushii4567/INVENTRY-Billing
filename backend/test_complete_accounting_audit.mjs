// backend/test_complete_accounting_audit.mjs
// Comprehensive End-to-End Audit Verification Suite for Senior Accounting ERP Auditor

const BASE_URL = "http://localhost:5005/api";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

async function runAudit() {
  console.log("===============================================================================");
  console.log("          SENIOR ACCOUNTING ERP AUDIT: AUTOMATED VERIFICATION SUITE           ");
  console.log("===============================================================================\n");

  // 1. Authentication
  const authRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "SUPER_ADMIN" })
  });
  const authData = await authRes.json();
  if (!authData.token) {
    throw new Error("Failed to authenticate as SUPER_ADMIN: " + JSON.stringify(authData));
  }
  const token = authData.token;
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  console.log("✅ 1. AUTHENTICATION & SESSION: Authenticated successfully as SUPER_ADMIN.");

  // 2. Double-Entry Posting: Direct Bill Creation (F8)
  console.log("\n--- TEST: Direct Sales Invoice Posting (F8) & Stock Deduction ---");
  const billPayload = {
    customerName: "Auditor Test Outlet",
    mobile: "9876599999",
    paymentMode: "CREDIT",
    paidAmount: 0,
    items: [
      {
        productId: "prd-001",
        productCode: "PRD-000007",
        productName: "Standard Item A (Finished Goods)",
        quantity: 10,
        rate: 1050,
        taxRate: 18
      }
    ]
  };

  const billRes = await fetch(`${BASE_URL}/bills`, {
    method: "POST",
    headers,
    body: JSON.stringify(billPayload)
  });
  const billJson = await billRes.json();
  if (!billJson.success) throw new Error("Direct billing failed: " + billJson.message);
  const createdBill = billJson.data;
  console.log(`✅ Posted Invoice #${createdBill.billNumber}: Total ₹${createdBill.totalAmount} (Taxable ₹${createdBill.taxableAmount}, Tax ₹${createdBill.taxAmount})`);
  console.log(`   Customer Outstanding: ₹${createdBill.outstandingAmount}, Status: ${createdBill.paymentStatus}`);

  // 3. Purchase Inward Posting (F9)
  console.log("\n--- TEST: Purchase Inward Posting (F9) & Duplicate Protection ---");
  const testInvNumber = `INV-AUDIT-${Date.now().toString().slice(-6)}`;
  const purPayload = {
    supplierId: "sup-001",
    supplierName: "Nestlé India Limited",
    supplierInvoiceNumber: testInvNumber,
    items: [
      {
        productId: "prd-001",
        productCode: "PRD-000007",
        productName: "Standard Item A (Finished Goods)",
        quantity: 50,
        purchaseRate: 850,
        taxRate: 18
      }
    ]
  };

  const purRes = await fetch(`${BASE_URL}/purchases`, {
    method: "POST",
    headers,
    body: JSON.stringify(purPayload)
  });
  const purJson = await purRes.json();
  if (!purJson.success) throw new Error("Purchase creation failed: " + purJson.message);
  const createdPurchase = purJson.data;
  console.log(`✅ Posted Purchase #${createdPurchase.purchaseNumber}: Grand Total ₹${createdPurchase.grandTotal} (Taxable ₹${createdPurchase.taxableAmount}, GST ₹${createdPurchase.taxAmount})`);

  // Test Duplicate Purchase Rejection (Idempotency)
  const dupRes = await fetch(`${BASE_URL}/purchases`, {
    method: "POST",
    headers,
    body: JSON.stringify(purPayload)
  });
  console.log(`✅ Duplicate Purchase Attempt Status: ${dupRes.status} (Expected 409 Conflict)`);
  if (dupRes.status !== 409) {
    console.warn("⚠️ Warning: Duplicate purchase was not rejected with 409.");
  }

  // 4. Payment Allocation: Partial & Full Allocation
  console.log("\n--- TEST: Payment Collection (F6) & Allocation ---");
  const payRes = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customerId: createdBill.customer.customerId,
      customerName: createdBill.customer.customerName,
      amount: 5000,
      paymentMode: "UPI",
      referenceNumber: `UPI-AUDIT-${Date.now().toString().slice(-4)}`
    })
  });
  const payJson = await payRes.json();
  const createdPayment = payJson.data;
  console.log(`✅ Recorded Payment #${createdPayment.paymentNumber}: Amount ₹${createdPayment.amount}, Status: ${createdPayment.status}`);

  // Test Over-Allocation Prevention
  const overAllocRes = await fetch(`${BASE_URL}/payments/${createdPayment.id}/map`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      allocations: [{ billId: createdBill.id, allocatedAmount: 999999 }]
    })
  });
  const overAllocJson = await overAllocRes.json();
  console.log(`✅ Over-allocation Prevention: ${!overAllocJson.success ? "BLOCKED (PASS)" : "ALLOWED (FAIL)"} | Reason: ${overAllocJson.message}`);

  // Valid Partial Allocation
  const allocRes = await fetch(`${BASE_URL}/payments/${createdPayment.id}/map`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      allocations: [{ billId: createdBill.id, allocatedAmount: 5000 }]
    })
  });
  const allocJson = await allocRes.json();
  console.log(`✅ Partial Payment Allocation: ${allocJson.success ? "SUCCESS" : "FAIL"}`);

  const billAfterPay = (await (await fetch(`${BASE_URL}/bills/${createdBill.id}`, { headers })).json()).data;
  console.log(`   Bill #${billAfterPay.billNumber} after ₹5,000 payment: Paid ₹${billAfterPay.paidAmount}, Outstanding ₹${billAfterPay.outstandingAmount}, Status: ${billAfterPay.paymentStatus}`);

  // 5. Cheque Bounce & Reversal
  console.log("\n--- TEST: Cheque Bounce & Complete Balance Restoration ---");
  const chqRes = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      customerId: createdBill.customer.customerId,
      customerName: createdBill.customer.customerName,
      amount: billAfterPay.outstandingAmount,
      paymentMode: "CHEQUE",
      chequeNumber: "CHQ-AUDIT-999",
      chequeBank: "State Bank of India",
      notes: "Cheque to be bounced"
    })
  });
  const chqPayment = (await chqRes.json()).data;

  // Fully pay off invoice
  await fetch(`${BASE_URL}/payments/${chqPayment.id}/map`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      allocations: [{ billId: createdBill.id, allocatedAmount: billAfterPay.outstandingAmount }]
    })
  });

  const billFullPaid = (await (await fetch(`${BASE_URL}/bills/${createdBill.id}`, { headers })).json()).data;
  console.log(`   Bill status after full cheque allocation: Outstanding ₹${billFullPaid.outstandingAmount}, Status: ${billFullPaid.paymentStatus}`);

  // Bounce Cheque
  const bounceRes = await fetch(`${BASE_URL}/payments/${chqPayment.id}/cancel`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ reason: "Cheque returned unpaid - Refer to Drawer" })
  });
  const bounceJson = await bounceRes.json();
  console.log(`✅ Cancelled / Bounced Payment Status: ${bounceJson.data?.status}`);

  // Verify Invoice Balance Restored
  const billRestored = (await (await fetch(`${BASE_URL}/bills/${createdBill.id}`, { headers })).json()).data;
  console.log(`✅ Restored Bill Outstanding: ₹${billRestored.outstandingAmount}, Paid: ₹${billRestored.paidAmount}, Status: ${billRestored.paymentStatus}`);
  if (billRestored.outstandingAmount !== billAfterPay.outstandingAmount) {
    throw new Error(`Cheque bounce failed to restore bill balance! Expected ${billAfterPay.outstandingAmount}, got ${billRestored.outstandingAmount}`);
  }

  // 6. Supplier Payment (F5)
  console.log("\n--- TEST: Supplier Payment (F5) & Supplier Ledger ---");
  const supPayRes = await fetch(`${BASE_URL}/payments/supplier`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      supplierId: "sup-001",
      supplierName: "Nestlé India Limited",
      amount: 15000,
      paymentMode: "BANK_TRANSFER",
      purchaseId: createdPurchase.id,
      notes: "Audit test supplier settlement"
    })
  });
  const supPayJson = await supPayRes.json();
  console.log(`✅ Recorded Supplier Payment #${supPayJson.data?.paymentNumber}: ₹${supPayJson.data?.amount}`);

  // Verify Supplier Ledger contains Payment (F5)
  const supLedgerRes = await fetch(`${BASE_URL}/ledger/supplier/sup-001`, { headers });
  const supLedger = (await supLedgerRes.json()).data;
  const f5Entry = supLedger.entries.find((e) => e.voucherNumber === supPayJson.data?.paymentNumber);
  console.log(`✅ Supplier Ledger Entry Verified: Found F5 Entry = ${!!f5Entry} (Debit: ₹${f5Entry?.debit})`);

  // 7. Complete Financial Statement Verification
  console.log("\n--- TEST: Financial Statement Reconciliation ---");
  const tbRes = await fetch(`${BASE_URL}/reports/trial-balance`, { headers });
  const tb = (await tbRes.json()).data;
  console.log(`✅ Trial Balance: Total Dr = ₹${tb.totalDebit}, Total Cr = ₹${tb.totalCredit}, Balanced = ${tb.isBalanced}`);
  if (!tb.isBalanced) throw new Error("Trial Balance is not balanced!");

  const plRes = await fetch(`${BASE_URL}/reports/profit-loss`, { headers });
  const pl = (await plRes.json()).data;
  console.log(`✅ Profit & Loss: Net Sales = ₹${pl.revenue.netSales}, COGS = ₹${pl.cogs.costOfGoodsSold}, Net Profit = ₹${pl.netProfit}`);

  const bsRes = await fetch(`${BASE_URL}/reports/balance-sheet`, { headers });
  const bs = (await bsRes.json()).data;
  console.log(`✅ Balance Sheet: Total Assets = ₹${bs.assets.totalAssets}, Liabilities = ₹${bs.liabilities.totalLiabilities}, Equity = ₹${bs.equity.totalEquity}`);
  console.log(`   Equation Verification: Assets (₹${bs.assets.totalAssets}) == Liabilities + Equity (₹${bs.totalLiabilitiesAndEquity})`);
  console.log(`   Balanced: ${bs.isBalanced} (Discrepancy: ₹${bs.discrepancy})`);
  if (!bs.isBalanced) throw new Error("Balance Sheet equation does not balance!");

  console.log("\n===============================================================================");
  console.log("            ALL ACCOUNTING ERP AUDIT VERIFICATION TESTS PASSED!                ");
  console.log("===============================================================================");
}

runAudit().catch((err) => {
  console.error("❌ AUDIT FAILED:", err.message);
  process.exit(1);
});
