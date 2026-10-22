// backend/test_isolated_accounting_scenario.mjs
// Isolated Numerical Reconciliation Test for Senior Accounting ERP Auditor

import {
  getTrialBalanceReport,
  getProfitAndLossReport,
  getBalanceSheetReport,
  getDayBookReport
} from "./src/services/accounting.service.js";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

async function runScenario() {
  console.log("===============================================================================");
  console.log("       SENIOR ACCOUNTING ERP AUDIT: ISOLATED NUMERICAL RECONCILIATION TEST      ");
  console.log("===============================================================================\n");

  // Step 1: Query baseline
  const tb = await getTrialBalanceReport();
  const pl = await getProfitAndLossReport();
  const bs = await getBalanceSheetReport();
  const db = await getDayBookReport();

  console.log("1. REPORTED ACTUAL VALUES:");
  console.log(`   - Day Book Voucher Count : ${db.totalVouchers}`);
  console.log(`   - Day Book Total Debit   : ₹${db.totalDebit}`);
  console.log(`   - Day Book Total Credit  : ₹${db.totalCredit}`);
  console.log(`   - Day Book Balanced      : ${db.isBalanced}`);
  console.log("");
  console.log(`   - Trial Balance Total Dr : ₹${tb.totalDebit}`);
  console.log(`   - Trial Balance Total Cr : ₹${tb.totalCredit}`);
  console.log(`   - Trial Balance Balanced : ${tb.isBalanced}`);
  console.log("");
  console.log(`   - P&L Net Sales Revenue  : ₹${pl.revenue.netSales}`);
  console.log(`   - P&L Purchases          : ₹${pl.cogs.purchases}`);
  console.log(`   - P&L Opening Stock      : ₹${pl.cogs.openingStock}`);
  console.log(`   - P&L Closing Stock      : ₹${pl.cogs.closingStock}`);
  console.log(`   - P&L COGS               : ₹${pl.cogs.costOfGoodsSold}`);
  console.log(`   - P&L Gross Profit       : ₹${pl.grossProfit}`);
  console.log(`   - P&L Net Profit         : ₹${pl.netProfit}`);
  console.log("");
  console.log(`   - Balance Sheet Assets   : ₹${bs.assets.totalAssets}`);
  console.log(`   - B/S Liabilities        : ₹${bs.liabilities.totalLiabilities}`);
  console.log(`   - B/S Owner Equity       : ₹${bs.equity.totalEquity}`);
  console.log(`   - B/S Liabilities+Equity : ₹${bs.totalLiabilitiesAndEquity}`);
  console.log(`   - B/S Equation Balanced  : ${bs.isBalanced} (Discrepancy: ₹${bs.discrepancy})`);
  console.log("");

  // Step 2: Verification of Fundamental Accounting Equation
  const calculatedLiabilitiesAndEquity = round2(bs.liabilities.totalLiabilities + bs.equity.totalEquity);
  const equationHolds = Math.abs(bs.assets.totalAssets - calculatedLiabilitiesAndEquity) < 0.01;

  console.log("2. MATHEMATICAL PROOF OF EQUATION:");
  console.log(`   Assets (₹${bs.assets.totalAssets}) = Liabilities (₹${bs.liabilities.totalLiabilities}) + Equity (₹${bs.equity.totalEquity})`);
  console.log(`   Calculated Sum of Liabilities + Equity: ₹${calculatedLiabilitiesAndEquity}`);
  console.log(`   Equation Verified: ${equationHolds ? "PASS (100% Exact Match)" : "FAIL"}`);

  if (!tb.isBalanced || !equationHolds) {
    process.exit(1);
  }

  console.log("\n===============================================================================");
  console.log("                      AUDIT VERIFICATION STATUS: PASSED                        ");
  console.log("===============================================================================");
}

runScenario().catch((err) => {
  console.error("Audit Execution Error:", err);
  process.exit(1);
});
