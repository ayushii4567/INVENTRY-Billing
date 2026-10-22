// In-memory + Mongoose Order Repository
let orderCounter = 1;

export const generateOrderNumber = () => {
  const num = `ORD-${String(orderCounter).padStart(6, "0")}`;
  orderCounter++;
  return num;
};

// Operational Orders Repository (Clean Production Foundation)
let initialOrders = [];
orderCounter = 1;

export const findOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "ALL",
  salesmanId = "",
  customerId = "",
  routeId = "",
  areaId = "",
  startDate = "",
  endDate = "",
  scopedSalesmanId = null
}) => {
  let list = [...initialOrders];

  // 1. Scoping Enforcement (Salesman can ONLY view their own orders)
  if (scopedSalesmanId) {
    list = list.filter((o) => 
      o.salesman?.salesmanId === scopedSalesmanId || 
      o.salesman?.userId === scopedSalesmanId ||
      (scopedSalesmanId === "user-salesman-01" && (o.salesman?.salesmanCode === "SM-000001" || o.salesman?.userId === "user-salesman-01"))
    );
  } else if (salesmanId && salesmanId !== "ALL") {
    list = list.filter((o) => 
      o.salesman?.salesmanId === salesmanId || 
      o.salesman?.salesmanCode === salesmanId ||
      o.salesman?.userId === salesmanId
    );
  }

  // 2. Status Filter
  if (status && status !== "ALL") {
    list = list.filter((o) => o.status === status);
  }

  // 3. Customer Filter
  if (customerId && customerId !== "ALL") {
    list = list.filter((o) => o.customer?.customerId === customerId || o.customer?.customerCode === customerId);
  }

  // 4. Route Filter
  if (routeId && routeId !== "ALL") {
    list = list.filter((o) => o.route?.routeId === routeId || o.route?.routeCode === routeId || o.customer?.routeId === routeId);
  }

  // 5. Area Filter
  if (areaId && areaId !== "ALL") {
    list = list.filter((o) => o.area?.areaId === areaId || o.area?.areaCode === areaId || o.customer?.areaId === areaId);
  }

  // 6. Date Range Filters
  if (startDate) {
    list = list.filter((o) => new Date(o.orderDate) >= new Date(startDate));
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    list = list.filter((o) => new Date(o.orderDate) <= end);
  }

  // 7. Search Filter (orderNumber, customer shop name, owner name, customer code)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((o) => 
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.shopName?.toLowerCase().includes(q) ||
      o.customer?.ownerName?.toLowerCase().includes(q) ||
      o.customer?.customerCode?.toLowerCase().includes(q) ||
      o.salesman?.salesmanName?.toLowerCase().includes(q)
    );
  }

  // Sort descending by orderDate / createdAt
  list.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));

  // Pagination
  const total = list.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = list.slice(startIndex, startIndex + limitNum);

  return {
    data: paginatedData,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages
  };
};

export const findOrderById = async (id) => {
  return initialOrders.find((o) => o.id === id || o.orderNumber === id) || null;
};

export const findOrderByNumber = async (orderNumber) => {
  return initialOrders.find((o) => o.orderNumber === orderNumber.trim()) || null;
};

export const findCustomerOrders = async (customerId, scopedSalesmanId = null) => {
  let list = initialOrders.filter((o) => o.customer?.customerId === customerId || o.customer?.customerCode === customerId);
  
  if (scopedSalesmanId) {
    list = list.filter((o) => 
      o.salesman?.salesmanId === scopedSalesmanId || 
      o.salesman?.userId === scopedSalesmanId ||
      (scopedSalesmanId === "user-salesman-01" && (o.salesman?.salesmanCode === "SM-000001" || o.salesman?.userId === "user-salesman-01"))
    );
  }

  list.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
  return list;
};

export const createOrderRecord = async (orderData) => {
  const newId = `ord-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const customerObj = orderData.customer || {
    customerId: orderData.customerId || "",
    customerCode: orderData.customerCode || "",
    customerName: orderData.customerName || orderData.shopName || "",
    ownerName: orderData.ownerName || "",
    mobile: orderData.mobile || "",
    address: orderData.address || "",
    areaId: orderData.areaId || orderData.area?.areaId || "",
    areaName: orderData.areaName || orderData.area?.areaName || "",
    routeId: orderData.routeId || orderData.route?.routeId || "",
    routeName: orderData.routeName || orderData.route?.routeName || ""
  };
  if (!customerObj.customerName && orderData.shopName) {
    customerObj.customerName = orderData.shopName;
  }

  const salesmanObj = orderData.salesman || {
    salesmanId: orderData.salesmanId || "",
    salesmanCode: orderData.salesmanCode || "SM-000001",
    salesmanName: orderData.salesmanName || "",
    userId: orderData.userId || null
  };

  const newOrder = {
    id: newId,
    orderNumber,
    orderDate: orderData.orderDate || now,
    customer: customerObj,
    salesman: salesmanObj,
    customerId: customerObj.customerId,
    customerName: customerObj.customerName,
    customerCode: customerObj.customerCode,
    salesmanId: salesmanObj.salesmanId,
    route: orderData.route || { routeId: customerObj.routeId, routeName: customerObj.routeName },
    area: orderData.area || { areaId: customerObj.areaId, areaName: customerObj.areaName },
    items: orderData.items,
    pricingSummary: orderData.pricingSummary,
    status: orderData.status || "DRAFT",
    notes: (orderData.notes || "").trim(),
    submittedAt: orderData.status === "SUBMITTED" ? now : null,
    submittedBy: orderData.status === "SUBMITTED" ? orderData.createdBy : null,
    auditLog: [
      {
        action: "ORDER_CREATED",
        actor: orderData.createdBy || "system",
        timestamp: now,
        details: { status: orderData.status || "DRAFT", total: orderData.pricingSummary?.grandTotal }
      }
    ],
    createdBy: orderData.createdBy || "system",
    updatedBy: orderData.createdBy || "system",
    createdAt: now,
    updatedAt: now
  };

  initialOrders.unshift(newOrder);
  return newOrder;
};

export const updateOrderRecord = async (id, updateData, user) => {
  const index = initialOrders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  const current = initialOrders[index];
  const now = new Date().toISOString();

  const updated = {
    ...current,
    items: updateData.items || current.items,
    pricingSummary: updateData.pricingSummary || current.pricingSummary,
    notes: updateData.notes !== undefined ? updateData.notes.trim() : current.notes,
    updatedBy: user.name || user.email || user.id,
    updatedAt: now,
    auditLog: [
      ...current.auditLog,
      {
        action: "DRAFT_UPDATED",
        actor: user.name || user.email || user.id,
        timestamp: now,
        details: { previousTotal: current.pricingSummary?.grandTotal, newTotal: updateData.pricingSummary?.grandTotal }
      }
    ]
  };

  initialOrders[index] = updated;
  return updated;
};

export const submitOrderRecord = async (id, user) => {
  const index = initialOrders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  const current = initialOrders[index];
  const now = new Date().toISOString();

  const submitted = {
    ...current,
    status: "SUBMITTED",
    submittedAt: now,
    submittedBy: user.name || user.email || user.id,
    updatedBy: user.name || user.email || user.id,
    updatedAt: now,
    auditLog: [
      ...current.auditLog,
      {
        action: "ORDER_SUBMITTED",
        actor: user.name || user.email || user.id,
        timestamp: now,
        details: { grandTotal: current.pricingSummary?.grandTotal }
      }
    ]
  };

  initialOrders[index] = submitted;
  return submitted;
};

export const cancelOrderRecord = async (id, reason, user) => {
  const index = initialOrders.findIndex((o) => o.id === id || o.orderNumber === id);
  if (index === -1) return null;

  const current = initialOrders[index];
  const now = new Date().toISOString();

  const cancelled = {
    ...current,
    status: "CANCELLED",
    cancelledAt: now,
    cancelledBy: user.name || user.email || user.id,
    cancellationReason: reason.trim(),
    updatedBy: user.name || user.email || user.id,
    updatedAt: now,
    auditLog: [
      ...current.auditLog,
      {
        action: "ORDER_CANCELLED",
        actor: user.name || user.email || user.id,
        timestamp: now,
        details: { previousStatus: current.status, reason }
      }
    ]
  };

  initialOrders[index] = cancelled;
  return cancelled;
};
