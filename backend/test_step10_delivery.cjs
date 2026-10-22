/**
 * Step 10: Dispatch & Delivery Management Engine Test Suite
 * Automated Verification for Distributor ERP
 */

const http = require("http");

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5005${path}`);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message, details = "") {
  if (condition) {
    passedChecks++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedChecks++;
    console.error(`  ❌ FAIL: ${message} ${details ? `(${details})` : ""}`);
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("🧪 STARTING STEP 10: DISPATCH & DELIVERY MANAGEMENT TEST SUITE");
  console.log("================================================================================");

  let ownerToken = "";
  let salesmanToken = "";
  let financeToken = "";

  try {
    // --- Phase 1: Authentication & Health ---
    console.log("\n--- Phase 1: Authentication & Health ---");
    const healthRes = await request("GET", "/api/health");
    assert(healthRes.status === 200 && healthRes.data?.status === "online", "Health check /api/health (Criteria 1)");

    const ownerLogin = await request("POST", "/api/auth/login", {
      emailOrMobile: "owner@distributorerp.com",
      password: "password123",
      role: "SUPER_ADMIN"
    });
    ownerToken = ownerLogin.data?.token;
    assert(ownerLogin.status === 200 && !!ownerToken, "Owner Login (SUPER_ADMIN) (Criteria 2)");

    const salesmanLogin = await request("POST", "/api/auth/login", {
      emailOrMobile: "salesman@distributorerp.com",
      password: "password123",
      role: "SALESMAN"
    });
    salesmanToken = salesmanLogin.data?.token;
    assert(salesmanLogin.status === 200 && !!salesmanToken, "Salesman Login (SALESMAN) (Criteria 3)");

    const financeLogin = await request("POST", "/api/auth/login", {
      emailOrMobile: "finance@distributorerp.com",
      password: "password123",
      role: "FINANCE"
    });
    financeToken = financeLogin.data?.token;
    assert(financeLogin.status === 200 && !!financeToken, "Finance Login (FINANCE)");

    // --- Phase 2: Vehicles Fleet & Details ---
    console.log("\n--- Phase 2: Vehicles Fleet & Querying ---");
    const vehiclesRes = await request("GET", "/api/vehicles", null, ownerToken);
    assert(vehiclesRes.status === 200 && vehiclesRes.data?.success, "GET /api/vehicles returns list (Criteria 4)");
    assert(vehiclesRes.data?.data?.length >= 6, `Pre-seeded 6 FMCG vehicles (Found: ${vehiclesRes.data?.data?.length})`);

    const firstVehicle = vehiclesRes.data?.data?.[0];
    assert(firstVehicle && !!firstVehicle.vehicleNumber, `Vehicle has registration number (${firstVehicle?.vehicleNumber})`);

    const vehicleDetailsRes = await request("GET", `/api/vehicles/${firstVehicle.id || firstVehicle.vehicleNumber}`, null, ownerToken);
    assert(vehicleDetailsRes.status === 200 && vehicleDetailsRes.data?.data?.vehicleNumber === firstVehicle.vehicleNumber, "GET /api/vehicles/:id returns details (Criteria 6)");

    // Filter available vehicles
    const availVehiclesRes = await request("GET", "/api/vehicles?status=AVAILABLE", null, ownerToken);
    assert(
      availVehiclesRes.status === 200 && availVehiclesRes.data?.data?.every((v) => v.status === "AVAILABLE"),
      "Filter status=AVAILABLE returns only available fleet"
    );

    // --- Phase 3: Ready for Dispatch Bills ---
    console.log("\n--- Phase 3: Bills Ready for Dispatch ---");
    const readyBillsRes = await request("GET", "/api/delivery/ready-bills", null, ownerToken);
    assert(readyBillsRes.status === 200 && readyBillsRes.data?.success, "GET /api/delivery/ready-bills returns list (Criteria 5)");
    assert(Array.isArray(readyBillsRes.data?.data) && readyBillsRes.data?.data?.length > 0, `Found ${readyBillsRes.data?.data?.length} bills ready for dispatch`);

    const sampleBill = readyBillsRes.data?.data?.[0];
    assert(sampleBill && sampleBill.billStatus === "LOCKED", "Ready bill is in LOCKED status");

    // --- Phase 4: Create Delivery Trip & Vehicle Assignment ---
    console.log("\n--- Phase 4: Create Delivery Trip & Assignment ---");
    // Find an available vehicle
    const availVehicle = vehiclesRes.data?.data?.find((v) => v.status === "AVAILABLE");
    assert(!!availVehicle, `Selected available vehicle: ${availVehicle?.vehicleNumber} (Criteria 7)`);

    // Pick 2 ready bills
    const targetBills = readyBillsRes.data?.data?.slice(0, 2);
    const targetBillIds = targetBills.map((b) => b.id || b.billNumber);

    const tripPayload = {
      vehicleId: availVehicle.id,
      driverName: availVehicle.driverName,
      driverMobile: availVehicle.driverMobile,
      routeId: "ROUTE-000001",
      routeName: "Route A - Sadar Bazaar",
      billIds: targetBillIds,
      notes: "Test delivery dispatch batch"
    };

    const createTripRes = await request("POST", "/api/delivery/trips", tripPayload, ownerToken);
    assert(createTripRes.status === 201 && createTripRes.data?.success, "Created new delivery trip (Criteria 6)");
    const createdTrip = createTripRes.data?.data;
    assert(createdTrip && createdTrip.tripNumber.startsWith("TRIP-"), `Generated trip number: ${createdTrip?.tripNumber}`);
    assert(createdTrip.totalBills === 2, "Trip totalBills matches assigned bills count (2)");
    assert(createdTrip.status === "READY", "Initial trip status is READY");

    // --- Phase 5: Trip Dispatch Lifecycle ---
    console.log("\n--- Phase 5: Dispatch Trip Lifecycle ---");
    const dispatchRes = await request("PATCH", `/api/delivery/trips/${createdTrip.id}/dispatch`, {}, ownerToken);
    assert(dispatchRes.status === 200 && dispatchRes.data?.success, "Trip status changed to DISPATCHED (Criteria 9)");

    // Verify Vehicle status became ON_TRIP
    const checkVehicleRes = await request("GET", `/api/vehicles/${availVehicle.id}`, null, ownerToken);
    assert(checkVehicleRes.data?.data?.status === "ON_TRIP", "Vehicle status changed to ON_TRIP (Criteria 10)");
    assert(checkVehicleRes.data?.data?.currentTripId === createdTrip.id, "Vehicle currentTripId linked to trip");

    // Attempt to create another trip with now ON_TRIP vehicle should fail (HTTP 400)
    const busyVehicleTripRes = await request(
      "POST",
      "/api/delivery/trips",
      {
        vehicleId: availVehicle.id,
        driverName: "Any Driver",
        driverMobile: "9999999999",
        billIds: [targetBillIds[0]]
      },
      ownerToken
    );
    assert(busyVehicleTripRes.status === 400, "Assigning ON_TRIP vehicle to new trip rejected (HTTP 400) (Criteria 8)");

    // Attempt to create trip with already dispatched bill should fail (HTTP 400)
    const otherAvailVeh = vehiclesRes.data?.data?.find((v) => v.id !== availVehicle.id && v.status === "AVAILABLE");
    if (otherAvailVeh) {
      const dispatchedBillTripRes = await request(
        "POST",
        "/api/delivery/trips",
        {
          vehicleId: otherAvailVeh.id,
          driverName: otherAvailVeh.driverName,
          driverMobile: otherAvailVeh.driverMobile,
          billIds: [targetBillIds[0]]
        },
        ownerToken
      );
      assert(dispatchedBillTripRes.status === 400, "Dispatched bill duplicate trip assignment rejected (HTTP 400)");
    }

    // --- Phase 6: Start Trip & Deliver Invoices ---
    console.log("\n--- Phase 6: Start Trip & Deliver Invoices ---");
    const startRes = await request("PATCH", `/api/delivery/trips/${createdTrip.id}/start`, {}, ownerToken);
    assert(startRes.status === 200 && startRes.data?.data?.status === "IN_PROGRESS", "Trip started: status is IN_PROGRESS (Criteria 12)");

    // Deliver first bill
    const deliverBill1Res = await request(
      "PATCH",
      `/api/delivery/trips/${createdTrip.id}/delivery/${targetBillIds[0]}`,
      {
        status: "DELIVERED",
        remarks: "Delivered to shop owner. Verified cartons."
      },
      ownerToken
    );
    assert(deliverBill1Res.status === 200 && deliverBill1Res.data?.success, "Updated bill delivery status to DELIVERED (Criteria 13)");
    const updatedTripState = deliverBill1Res.data?.data;
    assert(updatedTripState.deliveredBills === 1, "Trip deliveredBills count incremented to 1 (Criteria 14)");

    // Deliver second bill
    const deliverBill2Res = await request(
      "PATCH",
      `/api/delivery/trips/${createdTrip.id}/delivery/${targetBillIds[1]}`,
      {
        status: "DELIVERED",
        remarks: "Received and acknowledged by cashier."
      },
      ownerToken
    );
    assert(deliverBill2Res.status === 200, "Second bill marked DELIVERED successfully");

    // Complete trip
    const completeTripRes = await request("PATCH", `/api/delivery/trips/${createdTrip.id}/complete`, {}, ownerToken);
    assert(completeTripRes.status === 200 && completeTripRes.data?.data?.status === "COMPLETED", "Trip marked COMPLETED (Criteria 15)");
    assert(!!completeTripRes.data?.data?.returnTime, "Trip returnTime recorded");

    // Verify vehicle released back to AVAILABLE
    const releasedVehicleRes = await request("GET", `/api/vehicles/${availVehicle.id}`, null, ownerToken);
    assert(releasedVehicleRes.data?.data?.status === "AVAILABLE", "Vehicle released back to AVAILABLE (Criteria 16)");
    assert(releasedVehicleRes.data?.data?.currentTripId === null, "Vehicle currentTripId cleared to null");

    // --- Phase 7: Delivery Dashboard Summary & Exceptions ---
    console.log("\n--- Phase 7: Delivery Dashboard Summary & Exceptions ---");
    const summaryRes = await request("GET", "/api/delivery/summary/dashboard", null, ownerToken);
    assert(summaryRes.status === 200 && summaryRes.data?.success, "GET /api/delivery/summary/dashboard (Criteria 19)");
    const summary = summaryRes.data?.data;
    assert(summary && summary.vehiclesTotal >= 6, `Summary reports vehiclesTotal: ${summary?.vehiclesTotal}`);
    assert(summary && summary.vehiclesAvailable >= 1, `Summary reports vehiclesAvailable: ${summary?.vehiclesAvailable}`);
    assert(summary && summary.deliveredToday >= 2, `Summary reports deliveredToday: ${summary?.deliveredToday}`);
    assert(Array.isArray(summary?.exceptions), "Summary includes delivery exceptions array");

    // --- Phase 8: RBAC Enforcement ---
    console.log("\n--- Phase 8: RBAC Enforcement ---");
    const salesmanTripRes = await request(
      "POST",
      "/api/delivery/trips",
      {
        vehicleId: availVehicle.id,
        driverName: "Rahul Kumar",
        driverMobile: "9999999999",
        billIds: ["bill-001"]
      },
      salesmanToken
    );
    assert(salesmanTripRes.status === 403, "Salesman cannot create trip (HTTP 403 Forbidden) (Criteria 17)");

    const salesmanCreateVehicleRes = await request(
      "POST",
      "/api/vehicles",
      {
        vehicleNumber: "CG04XX9999",
        vehicleType: "Mini Truck",
        capacity: "2000 KG",
        driverName: "Test Driver",
        driverMobile: "9999999999"
      },
      salesmanToken
    );
    assert(salesmanCreateVehicleRes.status === 403, "Salesman cannot create vehicle (HTTP 403 Forbidden) (Criteria 18)");

    const salesmanUpdateVehicleRes = await request(
      "PATCH",
      `/api/vehicles/${availVehicle.id}`,
      { capacity: "9999 KG" },
      salesmanToken
    );
    assert(salesmanUpdateVehicleRes.status === 403, "Salesman cannot modify vehicle (HTTP 403 Forbidden)");

    // --- Phase 9: Steps 1-9 Regression Testing ---
    console.log("\n--- Phase 9: Steps 1-9 Full Regression Testing ---");

    const dashRes = await request("GET", "/api/dashboard/owner", null, ownerToken);
    assert(dashRes.status === 200 && dashRes.data?.success, "Step 2: Owner Dashboard intact (Criteria 20)");

    const custRes = await request("GET", "/api/customers?limit=1", null, ownerToken);
    assert(custRes.status === 200 && custRes.data?.success, "Step 3: Customer Master intact (Criteria 21)");

    const prodRes = await request("GET", "/api/products?limit=1", null, ownerToken);
    assert(prodRes.status === 200 && prodRes.data?.success, "Step 4: Product Master intact (Criteria 22)");

    const routesRes = await request("GET", "/api/routes", null, ownerToken);
    assert(routesRes.status === 200 && routesRes.data?.success, "Step 5: Routes Master intact");

    const ordersRes = await request("GET", "/api/orders?limit=1", null, ownerToken);
    assert(ordersRes.status === 200 && ordersRes.data?.success, "Step 6: Orders Engine intact (Criteria 23)");

    const billsRes = await request("GET", "/api/bills?limit=1", null, ownerToken);
    assert(billsRes.status === 200 && billsRes.data?.success, "Step 7: Billing Engine intact (Criteria 24)");

    const paymentsRes = await request("GET", "/api/payments?limit=1", null, ownerToken);
    assert(paymentsRes.status === 200 && paymentsRes.data?.success, "Step 8: Payment Collections & Recon intact (Criteria 25)");

    const invRes = await request("GET", "/api/inventory/summary/dashboard", null, ownerToken);
    assert(invRes.status === 200 && invRes.data?.success, "Step 9: Inventory & Stock Management intact (Criteria 26)");

    console.log("\n================================================================================");
    console.log(`📊 TEST RESULTS: ${passedChecks} PASSED | ${failedChecks} FAILED`);
    console.log("================================================================================\n");

    if (failedChecks > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal Test Suite Exception:", err);
    process.exit(1);
  }
}

runTests();
