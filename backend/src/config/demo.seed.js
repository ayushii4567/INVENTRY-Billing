// backend/src/config/demo.seed.js
// Runs on server startup — seeds a rich, comprehensive demo environment for client presentation:
// Areas, Routes, Salesmen, Outlets/Customers, FMCG Products, Inventory, Orders, Bills, Payments, Vehicles, Trips, Exceptions & Approvals

import { createAreaRecord } from "../modules/areas/area.repository.js";
import { createRouteRecord } from "../modules/routes/route.repository.js";
import { createSalesmanRecord } from "../modules/salesmen/salesman.repository.js";
import { createCustomerRecord, findCustomers } from "../modules/customers/customer.repository.js";
import { createProductRecord } from "../modules/products/product.repository.js";
import { findInventoryByProductId, adjustStockRecord } from "../modules/inventory/inventory.repository.js";
import { createOrderRecord, submitOrderRecord } from "../modules/orders/order.repository.js";
import { generateBillFromOrderService, lockBillService } from "../modules/billing/billing.service.js";
import { createPaymentRecord, mapPaymentToBills } from "../modules/payments/payment.repository.js";
import { createVehicleRecord, createTripRecord } from "../modules/delivery/delivery.repository.js";
import { exceptionRepository } from "../modules/exceptions/exception.repository.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { createSupplierRecord } from "../modules/suppliers/supplier.repository.js";
import { createPurchaseVoucher } from "../modules/purchases/purchase.repository.js";

const DEMO_USER = { name: "Rajesh Sharma", role: "SUPER_ADMIN", id: "user-owner-01" };

export async function seedDemoData() {
  try {
    // ── Check & Seed Suppliers (Sundry Creditors) if empty ───────────
    try {
      const supCount = await Supplier.countDocuments();
      if (supCount === 0) {
        console.log("🌱 Seeding FMCG Suppliers & Inward Purchase Vouchers...");
        const sup1 = await createSupplierRecord({
          supplierCode: "SUP-001",
          supplierName: "Nestlé India Limited",
          contactPerson: "Alok Sengupta (Depot Manager)",
          mobile: "9826112233",
          email: "depot.raipur@in.nestle.com",
          address: "Plot 14-16, Urla Industrial Complex",
          city: "Raipur",
          state: "Chhattisgarh",
          pincode: "492003",
          gstin: "22AAACN0142D1Z8",
          openingBalance: 0,
          currentBalance: 84500,
          creditDays: 21
        }, DEMO_USER);

        const sup2 = await createSupplierRecord({
          supplierCode: "SUP-002",
          supplierName: "Patanjali Ayurved Ltd (C&F)",
          contactPerson: "Rameshwar Patidar",
          mobile: "9826334455",
          email: "cnf.chhattisgarh@patanjali.org",
          address: "Transport Nagar, Tatibandh",
          city: "Raipur",
          state: "Chhattisgarh",
          pincode: "492099",
          gstin: "22AABCP7762K1ZU",
          openingBalance: 12500,
          currentBalance: 42000,
          creditDays: 30
        }, DEMO_USER);

        const sup3 = await createSupplierRecord({
          supplierCode: "SUP-003",
          supplierName: "Hindustan Unilever Limited",
          contactPerson: "Virendra Verma",
          mobile: "9826556677",
          email: "depot.cg@unilever.com",
          address: "Bhanpuri Logistics Park",
          city: "Raipur",
          state: "Chhattisgarh",
          pincode: "493221",
          gstin: "22AAACH1234M1Z2",
          openingBalance: 0,
          currentBalance: 0,
          creditDays: 15
        }, DEMO_USER);

        // Find products to associate with sample purchase
        const sampleProducts = await Product.find().limit(3).lean();
        if (sampleProducts.length > 0) {
          await createPurchaseVoucher({
            supplierInvoiceNumber: "INV-NESTLE-2026-9481",
            purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            supplierId: sup1.id || sup1._id.toString(),
            supplierCode: sup1.supplierCode,
            supplierName: sup1.supplierName,
            supplierGstin: sup1.gstin,
            items: sampleProducts.map((p) => ({
              productId: p._id.toString(),
              productCode: p.productCode,
              productName: p.productName,
              sku: p.sku,
              unit: p.unit || "PCS",
              quantity: 200,
              purchaseRate: p.purchaseRate || 15,
              mrp: p.mrp || 25,
              saleRate: p.saleRate || 20,
              discount: 2,
              taxRate: 5
            })),
            paidAmount: 0,
            notes: "Monthly primary stock replenishment from Nestlé Urla warehouse"
          }, DEMO_USER);
        }
      }
    } catch (e) {
      console.warn("Supplier seed warning:", e.message);
    }
    // ── 1. Areas ──────────────────────────────────────────────
    const areaCentral = await createAreaRecord({
      areaName: "Raipur Central",
      city: "Raipur",
      state: "Chhattisgarh",
      pincode: "492001",
      description: "Central Wholesale & Commercial Territory"
    }, DEMO_USER);

    const areaNorth = await createAreaRecord({
      areaName: "Raipur North & Suburbs",
      city: "Raipur",
      state: "Chhattisgarh",
      pincode: "492008",
      description: "Model Town and Highway Commercial Zone"
    }, DEMO_USER);

    // ── 2. Routes ──────────────────────────────────────────────
    const routeA = await createRouteRecord({
      routeName: "Route A - Sadar Bazaar",
      areaId: areaCentral.id,
      areaName: areaCentral.areaName,
      beatFrequency: "DAILY",
      visitDays: ["MON", "WED", "FRI"],
      description: "Primary Sadar Wholesale Route"
    }, DEMO_USER);

    const routeB = await createRouteRecord({
      routeName: "Route B - Model Town",
      areaId: areaNorth.id,
      areaName: areaNorth.areaName,
      beatFrequency: "BIWEEKLY",
      visitDays: ["TUE", "THU", "SAT"],
      description: "High-Volume Supermarket & Grocer Corridor"
    }, DEMO_USER);

    const routeC = await createRouteRecord({
      routeName: "Route C - G.T. Road",
      areaId: areaCentral.id,
      areaName: areaCentral.areaName,
      beatFrequency: "DAILY",
      visitDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
      description: "Mixed Retail & Wholesale Beat"
    }, DEMO_USER);

    // ── 3. Salesmen ───────────────────────────────────────────
    const salesmanRahul = await createSalesmanRecord({
      id: "user-salesman-01",
      name: "Rahul Kumar",
      employeeCode: "EMP-001",
      mobile: "9876543213",
      email: "salesman@distributorerp.com",
      assignedRouteId: routeA.id,
      assignedRouteName: routeA.routeName,
      assignedRouteIds: [routeA.id]
    }, DEMO_USER);

    const salesmanSunil = await createSalesmanRecord({
      name: "Sunil Gupta",
      employeeCode: "EMP-002",
      mobile: "9876543214",
      email: "sunil.gupta@distributorerp.com",
      assignedRouteId: routeB.id,
      assignedRouteName: routeB.routeName
    }, DEMO_USER);

    // Check if customer/product demo data already exists (avoid duplicate customer seeding)
    const existingCustomers = await findCustomers({ page: 1, limit: 1 });
    const prodCount = await Product.countDocuments();
    if (existingCustomers.total > 0 && prodCount > 0) {
      console.log("ℹ️  Customer and Product demo data already present in database.");
      return;
    }

    console.log("🌱 Seeding comprehensive FMCG Distributor ERP demo data...");

    // ── 4. Customers / Retail Outlets ─────────────────────────
    const cust1 = await createCustomerRecord({
      customerName: "Sharma General Store",
      shopName: "Sharma General Store",
      ownerName: "Ramesh Sharma",
      mobile: "9876500001",
      address: "Shop 12, Sadar Bazaar Main Road, Raipur",
      city: "Raipur",
      pincode: "492001",
      areaId: areaCentral.id,
      areaName: areaCentral.areaName,
      routeId: routeA.id,
      routeName: routeA.routeName,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      creditLimit: 50000,
      paymentTerms: "7_DAYS",
      gstin: "22AAAAA0000A1Z5",
      outletType: "GENERAL_TRADE"
    }, DEMO_USER);

    const cust2 = await createCustomerRecord({
      customerName: "Gupta Provision Store",
      shopName: "Gupta Provision Store",
      ownerName: "Suresh Gupta",
      mobile: "9876500002",
      address: "Plot 45, Sadar Grain Market, Raipur",
      city: "Raipur",
      pincode: "492001",
      areaId: areaCentral.id,
      areaName: areaCentral.areaName,
      routeId: routeA.id,
      routeName: routeA.routeName,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      creditLimit: 40000,
      paymentTerms: "15_DAYS",
      gstin: "22BBBBB1111B2Z8",
      outletType: "PROVISION_STORE"
    }, DEMO_USER);

    const cust3 = await createCustomerRecord({
      customerName: "New Horizon Mart",
      shopName: "New Horizon Mart",
      ownerName: "Anil Agrawal",
      mobile: "9876500003",
      address: "Commercial Center, Sector 4, Model Town, Raipur",
      city: "Raipur",
      pincode: "492008",
      areaId: areaNorth.id,
      areaName: areaNorth.areaName,
      routeId: routeB.id,
      routeName: routeB.routeName,
      salesmanId: salesmanSunil.id,
      salesmanName: salesmanSunil.name,
      creditLimit: 150000,
      paymentTerms: "30_DAYS",
      gstin: "22CCCCC2222C3Z1",
      outletType: "SUPERMARKET"
    }, DEMO_USER);

    const cust4 = await createCustomerRecord({
      customerName: "Sahu Kirana Store",
      shopName: "Sahu Kirana Store",
      ownerName: "Santosh Sahu",
      mobile: "9876500004",
      address: "Corner Shop, Near Old Toll Post, G.T. Road, Raipur",
      city: "Raipur",
      pincode: "492001",
      areaId: areaCentral.id,
      areaName: areaCentral.areaName,
      routeId: routeC.id,
      routeName: routeC.routeName,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      creditLimit: 35000,
      paymentTerms: "7_DAYS",
      gstin: "22DDDDD3333D4Z4",
      outletType: "GENERAL_TRADE"
    }, DEMO_USER);

    // ── 5. Standard Tally-Format Stock Items (Finished Goods, Trading Goods, Raw Materials) ──
    const prodMaggi = await createProductRecord({
      productName: "Standard Item A (Finished Goods)",
      sku: "STD-ITM-001",
      companyId: "GRP-FINISHED",
      companyName: "Finished Goods",
      category: "Finished Goods",
      subcategory: "General Standard Items",
      hsnCode: "84713010",
      unit: "PCS",
      packSize: "1 Pc",
      mrp: 1200,
      saleRate: 1050.0,
      purchaseRate: 850.0,
      taxRate: 18,
      minimumStock: 50
    }, DEMO_USER);

    const prodKitKat = await createProductRecord({
      productName: "Commercial Pack Box (50 Units)",
      sku: "TRD-BOX-050",
      companyId: "GRP-TRADING",
      companyName: "Trading Goods",
      category: "Trading Goods",
      subcategory: "Packaged Commercial Goods",
      hsnCode: "48191010",
      unit: "BOX",
      packSize: "50 Units",
      mrp: 2000,
      saleRate: 1750.0,
      purchaseRate: 1400.0,
      taxRate: 12,
      minimumStock: 40
    }, DEMO_USER);

    const prodNescafe = await createProductRecord({
      productName: "Industrial Assembly Unit Type-1",
      sku: "IND-ASM-101",
      companyId: "GRP-FINISHED",
      companyName: "Finished Goods",
      category: "Finished Goods",
      subcategory: "Assemblies & Modules",
      hsnCode: "85044090",
      unit: "NOS",
      packSize: "1 No",
      mrp: 3000,
      saleRate: 2600.0,
      purchaseRate: 2100.0,
      taxRate: 18,
      minimumStock: 25
    }, DEMO_USER);

    const prodHorlicks = await createProductRecord({
      productName: "General Consumable Pack (Grade A)",
      sku: "CON-GEN-012",
      companyId: "GRP-CONSUMABLES",
      companyName: "Consumables",
      category: "Consumables",
      subcategory: "General Operational Supply",
      hsnCode: "38140010",
      unit: "PKT",
      packSize: "12 Pkts",
      mrp: 550,
      saleRate: 480.0,
      purchaseRate: 380.0,
      taxRate: 18,
      minimumStock: 30
    }, DEMO_USER);

    const prodHoney = await createProductRecord({
      productName: "Bulk Raw Material Pack 25kg",
      sku: "RAW-MAT-025",
      companyId: "GRP-RAW",
      companyName: "Raw Materials",
      category: "Raw Materials",
      subcategory: "Primary Bulk Input",
      hsnCode: "25010010",
      unit: "BAG",
      packSize: "25 Kg",
      mrp: 900,
      saleRate: 800.0,
      purchaseRate: 650.0,
      taxRate: 5,
      minimumStock: 30
    }, DEMO_USER);

    const prodDantKanti = await createProductRecord({
      productName: "Hardware Fasteners Assorted Kit",
      sku: "HRD-FST-100",
      companyId: "GRP-TRADING",
      companyName: "Trading Goods",
      category: "Trading Goods",
      subcategory: "Fasteners & Fixtures",
      hsnCode: "73181500",
      unit: "SET",
      packSize: "1 Set (100 Pcs)",
      mrp: 320,
      saleRate: 280.0,
      purchaseRate: 220.0,
      taxRate: 18,
      minimumStock: 50
    }, DEMO_USER);

    // ── 6. Inventory Opening Stock ─────────────────────────────
    const productsList = [
      { prod: prodMaggi, qty: 500 },
      { prod: prodKitKat, qty: 350 },
      { prod: prodNescafe, qty: 150 },
      { prod: prodHorlicks, qty: 200 },
      { prod: prodHoney, qty: 180 },
      { prod: prodDantKanti, qty: 300 }
    ];

    for (const item of productsList) {
      const inv = await findInventoryByProductId(item.prod.id);
      if (inv) {
        await adjustStockRecord(
          inv.id,
          {
            adjustmentType: "ADJUSTMENT_IN",
            quantity: item.qty,
            reason: `Opening stock warehouse depot primary - ${item.prod.companyName}`
          },
          DEMO_USER
        );
      }
    }

    // ── 7. Demo Orders & Billing Lifecycle ────────────────────
    // Order 1: Sharma General Store -> Bill 1 (Fully Paid via UPI)
    const order1 = await createOrderRecord({
      customerId: cust1.id,
      customerName: cust1.shopName || cust1.customerName,
      customerCode: cust1.customerCode,
      routeId: routeA.id,
      routeName: routeA.routeName,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      orderDate: new Date().toISOString(),
      items: [
        {
          productId: prodMaggi.id,
          productName: prodMaggi.productName,
          productCode: prodMaggi.productCode,
          sku: prodMaggi.sku,
          quantity: 20,
          rate: prodMaggi.saleRate,
          mrp: prodMaggi.mrp,
          unit: prodMaggi.unit,
          taxPercent: prodMaggi.taxRate
        },
        {
          productId: prodKitKat.id,
          productName: prodKitKat.productName,
          productCode: prodKitKat.productCode,
          sku: prodKitKat.sku,
          quantity: 10,
          rate: prodKitKat.saleRate,
          mrp: prodKitKat.mrp,
          unit: prodKitKat.unit,
          taxPercent: prodKitKat.taxRate
        }
      ],
      remarks: "Regular weekly order - Sadar beat"
    });
    await submitOrderRecord(order1.id, DEMO_USER);
    const billRes1 = await generateBillFromOrderService(order1.id, DEMO_USER);
    const bill1 = billRes1.bill || billRes1;
    await lockBillService(bill1.id, DEMO_USER);

    // Order 2: Gupta Provision Store -> Bill 2 (Partially Paid via Cash)
    const order2 = await createOrderRecord({
      customerId: cust2.id,
      customerName: cust2.shopName || cust2.customerName,
      customerCode: cust2.customerCode,
      routeId: routeA.id,
      routeName: routeA.routeName,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      orderDate: new Date().toISOString(),
      items: [
        {
          productId: prodHorlicks.id,
          productName: prodHorlicks.productName,
          productCode: prodHorlicks.productCode,
          sku: prodHorlicks.sku,
          quantity: 15,
          rate: prodHorlicks.saleRate,
          mrp: prodHorlicks.mrp,
          unit: prodHorlicks.unit,
          taxPercent: prodHorlicks.taxRate
        },
        {
          productId: prodHoney.id,
          productName: prodHoney.productName,
          productCode: prodHoney.productCode,
          sku: prodHoney.sku,
          quantity: 10,
          rate: prodHoney.saleRate,
          mrp: prodHoney.mrp,
          unit: prodHoney.unit,
          taxPercent: prodHoney.taxRate
        }
      ],
      remarks: "Festival stocking order"
    });
    await submitOrderRecord(order2.id, DEMO_USER);
    const billRes2 = await generateBillFromOrderService(order2.id, DEMO_USER);
    const bill2 = billRes2.bill || billRes2;
    await lockBillService(bill2.id, DEMO_USER);

    // Order 3: New Horizon Mart -> Bill 3 (Unpaid / Open Invoice)
    const order3 = await createOrderRecord({
      customerId: cust3.id,
      customerName: cust3.shopName || cust3.customerName,
      customerCode: cust3.customerCode,
      routeId: routeB.id,
      routeName: routeB.routeName,
      salesmanId: salesmanSunil.id,
      salesmanName: salesmanSunil.name,
      orderDate: new Date().toISOString(),
      items: [
        {
          productId: prodNescafe.id,
          productName: prodNescafe.productName,
          productCode: prodNescafe.productCode,
          sku: prodNescafe.sku,
          quantity: 12,
          rate: prodNescafe.saleRate,
          mrp: prodNescafe.mrp,
          unit: prodNescafe.unit,
          taxPercent: prodNescafe.taxRate
        },
        {
          productId: prodDantKanti.id,
          productName: prodDantKanti.productName,
          productCode: prodDantKanti.productCode,
          sku: prodDantKanti.sku,
          quantity: 40,
          rate: prodDantKanti.saleRate,
          mrp: prodDantKanti.mrp,
          unit: prodDantKanti.unit,
          taxPercent: prodDantKanti.taxRate
        }
      ],
      remarks: "Supermarket monthly billing cycle"
    });
    await submitOrderRecord(order3.id, DEMO_USER);
    const billRes3 = await generateBillFromOrderService(order3.id, DEMO_USER);
    const bill3 = billRes3.bill || billRes3;
    await lockBillService(bill3.id, DEMO_USER);

    // ── 8. Payment Collections (UPI, Cash, Cheque & Unmatched) ─
    // Payment 1: Full UPI payment for Bill 1
    const pay1 = await createPaymentRecord({
      customerId: cust1.id,
      customerName: cust1.customerName,
      customerCode: cust1.customerCode,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      paymentMode: "UPI",
      amount: bill1.totalAmount,
      referenceNumber: "UPI-DEMO-998811",
      payerName: "Ramesh Sharma (PhonePe)",
      notes: "Full UPI settlement for invoice 1"
    }, DEMO_USER);
    await mapPaymentToBills(pay1.id, [{ billId: bill1.id, allocatedAmount: bill1.totalAmount }], DEMO_USER);

    // Payment 2: Partial Cash collection for Bill 2
    const cashAmount = Math.min(2000, bill2.totalAmount);
    const pay2 = await createPaymentRecord({
      customerId: cust2.id,
      customerName: cust2.customerName,
      customerCode: cust2.customerCode,
      salesmanId: salesmanRahul.id,
      salesmanName: salesmanRahul.name,
      paymentMode: "CASH",
      amount: cashAmount,
      referenceNumber: "CASH-REC-00129",
      payerName: "Suresh Gupta (Counter)",
      notes: "Partial cash collection received on beat visit"
    }, DEMO_USER);
    await mapPaymentToBills(pay2.id, [{ billId: bill2.id, allocatedAmount: cashAmount }], DEMO_USER);

    // Payment 3: Cheque collection from New Horizon Mart
    await createPaymentRecord({
      customerId: cust3.id,
      customerName: cust3.customerName,
      customerCode: cust3.customerCode,
      salesmanId: salesmanSunil.id,
      salesmanName: salesmanSunil.name,
      paymentMode: "CHEQUE",
      amount: 4500,
      referenceNumber: "CHQ-882194",
      chequeNumber: "882194",
      bankName: "HDFC Bank Ltd",
      chequeDate: new Date().toISOString(),
      payerName: "Horizon Retail Pvt Ltd",
      status: "RECORDED",
      notes: "Account payee cheque handed to salesman"
    }, DEMO_USER);

    // Payment 4: Unmatched UPI credit (Suspense Queue)
    await createPaymentRecord({
      paymentMode: "UPI",
      amount: 12500,
      referenceNumber: "UPI-SUSP-776655",
      upiReference: "UPI-SUSP-776655",
      payerName: "Direct NEFT Credit / Unknown Counter",
      status: "UNMATCHED",
      notes: "Direct bank credit received without customer tag - in Suspense Queue"
    }, DEMO_USER);

    // ── 9. Delivery Fleet Vehicles ─────────────────────────────
    const veh1 = await createVehicleRecord({
      vehicleNumber: "CG-04-ME-1024",
      vehicleType: "MINI_TRUCK",
      model: "Tata Ace Gold",
      driverName: "Manoj Yadav",
      driverMobile: "9826112233",
      capacityWeightKg: 750,
      capacityCrates: 45,
      status: "AVAILABLE"
    }, DEMO_USER);

    const veh2 = await createVehicleRecord({
      vehicleNumber: "CG-04-NL-8842",
      vehicleType: "PICKUP_TRUCK",
      model: "Mahindra Bolero Maxi Truck",
      driverName: "Suresh Verma",
      driverMobile: "9826114455",
      capacityWeightKg: 1200,
      capacityCrates: 70,
      status: "ON_TRIP"
    }, DEMO_USER);

    await createVehicleRecord({
      vehicleNumber: "CG-04-PQ-3319",
      vehicleType: "MEDIUM_TRUCK",
      model: "Ashok Leyland Bada Dost",
      driverName: "Rajesh Kumar",
      driverMobile: "9826116677",
      capacityWeightKg: 1800,
      capacityCrates: 110,
      status: "AVAILABLE"
    }, DEMO_USER);

    await createVehicleRecord({
      vehicleNumber: "CG-04-RT-5520",
      vehicleType: "THREE_WHEELER",
      model: "Piaggio Ape Xtra LDX",
      driverName: "Vinod Sahu",
      driverMobile: "9826118899",
      capacityWeightKg: 500,
      capacityCrates: 30,
      status: "MAINTENANCE"
    }, DEMO_USER);

    // ── 10. Delivery Trips ─────────────────────────────────────
    await createTripRecord({
      routeId: routeA.id,
      routeName: routeA.routeName,
      vehicleId: veh2.id,
      vehicleNumber: veh2.vehicleNumber,
      driverName: veh2.driverName,
      driverMobile: veh2.driverMobile,
      status: "IN_PROGRESS",
      deliveries: [
        {
          billId: bill1.id,
          billNumber: bill1.billNumber,
          customerId: cust1.id,
          customerName: cust1.customerName,
          amount: bill1.totalAmount,
          status: "DELIVERED"
        },
        {
          billId: bill2.id,
          billNumber: bill2.billNumber,
          customerId: cust2.id,
          customerName: cust2.customerName,
          amount: bill2.totalAmount,
          status: "OUT_FOR_DELIVERY"
        }
      ]
    }, DEMO_USER);

    // ── 11. Exceptions & Financial Approvals ───────────────────
    await exceptionRepository.createException({
      exceptionType: "CREDIT_LIMIT_BREACH",
      module: "SALES",
      severity: "CRITICAL",
      title: "Credit Limit Exceeded: Sharma General Store",
      description: "Order booked while ledger outstanding was near limit. Requires Owner override.",
      status: "OPEN",
      customerName: cust1.customerName,
      amount: 18400,
      referenceNumber: order1.orderNumber,
      performedBy: "Automated Credit Guard"
    });

    await exceptionRepository.createException({
      exceptionType: "UNMATCHED_PAYMENT",
      module: "PAYMENTS",
      severity: "WARNING",
      title: "Unmatched UPI Credit: ₹12,500 in HDFC Current A/c",
      description: "Direct bank transfer from unknown retail counter waiting for party reconciliation.",
      status: "OPEN",
      amount: 12500,
      referenceNumber: "UPI-SUSP-776655",
      performedBy: "Bank Recon Engine"
    });

    await exceptionRepository.createException({
      exceptionType: "VEHICLE_MAINTENANCE",
      module: "DELIVERY",
      severity: "INFO",
      title: "Fleet Service Alert: CG-04-RT-5520",
      description: "Piaggio Ape Xtra LDX scheduled for 10,000 km periodic brake inspection.",
      status: "OPEN",
      referenceNumber: "CG-04-RT-5520",
      performedBy: "Fleet Manager"
    });

    await exceptionRepository.createApproval({
      approvalType: "CREDIT_LIMIT_OVERRIDE",
      module: "FINANCE",
      title: "Credit Limit Override Request: Sharma General Store",
      description: "Salesman Rahul Kumar requested temporary credit ceiling extension of ₹20,000 for festival delivery.",
      requestedByName: salesmanRahul.name,
      referenceNumber: cust1.customerCode,
      reason: "High volume festival order with guaranteed 3-day post-dated cheque.",
      status: "PENDING"
    });

    await exceptionRepository.createApproval({
      approvalType: "SPECIAL_TRADE_DISCOUNT",
      module: "SALES",
      title: "Bulk Scheme Discount: New Horizon Mart (5%)",
      description: "Supermarket request for additional 5% margin rebate on Nescafé 50g carton purchases.",
      requestedByName: salesmanSunil.name,
      referenceNumber: cust3.customerCode,
      reason: "Counter agreed to prominent end-cap display placement across 3 prime stores.",
      status: "PENDING"
    });

    console.log("✅ Comprehensive demo seed complete!");
    console.log(`   📍 Areas     : 2`);
    console.log(`   🛣️  Routes    : 3`);
    console.log(`   👤 Salesmen  : 2 (Rahul Kumar, Sunil Gupta)`);
    console.log(`   🏪 Customers : 4 (Sharma General, Gupta Provision, New Horizon, Sahu Kirana)`);
    console.log(`   📦 Products  : 6 SKUs across Nestlé, Patanjali, GSK`);
    console.log(`   🧾 Invoices  : 3 (Paid, Partial, Open)`);
    console.log(`   💰 Payments  : 4 (UPI, Cash, Cheque, Suspense Queue)`);
    console.log(`   🚛 Vehicles  : 4 Fleet units`);
    console.log(`   🚨 Exceptions: 3 Open alerts (Credit, Recon, Fleet)`);

  } catch (err) {
    console.error("⚠️  Demo seed warning (non-fatal):", err.message || err);
  }
}
