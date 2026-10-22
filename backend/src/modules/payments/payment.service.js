import {
  findPayments,
  findPaymentById,
  findUnmatchedPayments,
  generatePaymentNumber,
  createPaymentRecord,
  identifyCustomer,
  mapPaymentToBills,
  cancelPaymentRecord
} from "./payment.repository.js";
import {
  validatePaymentEntry,
  validateCustomerIdentification,
  validatePaymentMapping,
  validatePaymentCancellation
} from "./payment.validator.js";
import { findCustomerById } from "../customers/customer.repository.js";

const round2 = (num) => Math.round((Number(num || 0) + Number.EPSILON) * 100) / 100;

export const listPaymentsService = async ({ page, limit, search, status, paymentMode, paymentType = "ALL", supplierId = null, user }) => {
  let salesmanScope = null;

  if (user.role === "SALESMAN") {
    salesmanScope = user.id || "user-salesman-01";
  }

  return await findPayments({
    page,
    limit,
    search,
    status,
    paymentMode,
    paymentType,
    supplierId,
    salesmanId: salesmanScope
  });
};

export const getPaymentDetailsService = async (id, user) => {
  const payment = await findPaymentById(id);
  if (!payment) {
    return { success: false, statusCode: 404, message: "Payment not found." };
  }

  if (user.role === "SALESMAN") {
    const isOwner =
      payment.salesmanId === user.id ||
      payment.salesmanCode === "SM-000001" ||
      payment.salesmanId === "user-salesman-01";

    if (!isOwner) {
      return {
        success: false,
        statusCode: 403,
        message: "Salesmen are only authorized to view their own collections."
      };
    }
  }

  return { success: true, data: payment };
};

export const getUnmatchedPaymentsService = async (user) => {
  if (user.role === "SALESMAN") {
    return {
      success: false,
      statusCode: 403,
      message: "Salesman cannot access the central UPI suspense queue."
    };
  }

  const list = await findUnmatchedPayments();
  return { success: true, data: list, count: list.length };
};

export const recordPaymentService = async (payload, user) => {
  const paymentMode = (payload.paymentMode || payload.mode || "").toUpperCase();
  const normalizedPayload = { ...payload, paymentMode };
  const validation = validatePaymentEntry(normalizedPayload, user);
  if (!validation.isValid) {
    return { success: false, statusCode: 400, message: validation.message };
  }

  const numAmount = round2(normalizedPayload.amount);
  const paymentNumber = await generatePaymentNumber();

  let customerSnapshot = {
    customerId: null,
    customerCode: null,
    customerName: null
  };

  if (payload.customerId) {
    const customer = await findCustomerById(payload.customerId);
    if (customer) {
      customerSnapshot = {
        customerId: customer.id || customer.customerCode,
        customerCode: customer.customerCode,
        customerName: customer.shopName || customer.ownerName
      };
    } else {
      customerSnapshot = {
        customerId: payload.customerId,
        customerCode: payload.customerCode || payload.customerId,
        customerName: payload.customerName || "Retail Customer"
      };
    }
  }

  let salesmanSnapshot = {
    salesmanId: null,
    salesmanCode: null,
    salesmanName: null
  };

  if (user.role === "SALESMAN") {
    salesmanSnapshot = {
      salesmanId: user.id || "user-salesman-01",
      salesmanCode: "SM-000001",
      salesmanName: user.name || "Rahul Kumar"
    };
  } else if (payload.salesmanId) {
    salesmanSnapshot = {
      salesmanId: payload.salesmanId,
      salesmanCode: payload.salesmanCode || "SM-000001",
      salesmanName: payload.salesmanName || "Rahul Kumar"
    };
  }

  const isUnmatchedUpi = paymentMode === "UPI" && !customerSnapshot.customerId;
  const initialStatus = isUnmatchedUpi ? "UNMATCHED" : "RECORDED";

  const paymentRecordData = {
    paymentNumber,
    paymentDate: payload.paymentDate || new Date().toISOString(),
    ...customerSnapshot,
    ...salesmanSnapshot,
    paymentMode,
    amount: numAmount,
    referenceNumber: payload.referenceNumber || payload.upiReference || payload.chequeNumber || `REF-${Date.now()}`,
    payerName: payload.payerName || customerSnapshot.customerName || "Counter Payer",
    upiReference: payload.upiReference || "",
    chequeNumber: payload.chequeNumber || "",
    chequeBank: payload.chequeBank || "",
    chequeDate: payload.chequeDate || null,
    status: initialStatus,
    mappedAmount: 0,
    unmappedAmount: numAmount,
    billMappings: payload.billMappings || [],
    notes: payload.notes || "",
    createdBy: `${user.name} (${user.role})`
  };

  const created = await createPaymentRecord(paymentRecordData, user);

  return {
    success: true,
    statusCode: 201,
    message: isUnmatchedUpi
      ? `Payment ${created.paymentNumber} placed in UPI Suspense Queue (UNMATCHED).`
      : `Payment ${created.paymentNumber} recorded successfully.`,
    data: created
  };
};

export const identifyCustomerService = async (id, customerData, user) => {
  const payment = await findPaymentById(id);
  const validation = validateCustomerIdentification(payment, customerData, user);
  if (!validation.isValid) {
    return {
      success: false,
      statusCode: validation.statusCode,
      message: validation.message
    };
  }

  let fullCustomer = customerData;
  if (customerData.customerId || customerData.id) {
    const found = await findCustomerById(customerData.customerId || customerData.id);
    if (found) {
      fullCustomer = {
        customerId: found.id || found.customerCode,
        customerCode: found.customerCode,
        customerName: found.shopName || found.ownerName
      };
    }
  }

  const updated = await identifyCustomer(id, fullCustomer, user);
  return {
    success: true,
    statusCode: 200,
    message: `Payment ${payment.paymentNumber} successfully mapped to customer ${fullCustomer.customerName}.`,
    data: updated
  };
};

export const mapPaymentService = async (id, allocations, user) => {
  const payment = await findPaymentById(id);
  const validation = await validatePaymentMapping(payment, allocations, user);
  if (!validation.isValid) {
    return {
      success: false,
      statusCode: validation.statusCode,
      message: validation.message
    };
  }

  const updated = await mapPaymentToBills(id, allocations, user);
  return {
    success: true,
    statusCode: 200,
    message: `Payment ${payment.paymentNumber} successfully mapped to ${allocations.length} invoice(s).`,
    data: updated
  };
};

export const cancelPaymentService = async (id, reason, user) => {
  const payment = await findPaymentById(id);
  const validation = validatePaymentCancellation(payment, reason, user);
  if (!validation.isValid) {
    return {
      success: false,
      statusCode: validation.statusCode,
      message: validation.message
    };
  }

  const cancelled = await cancelPaymentRecord(id, reason, user);
  return {
    success: true,
    statusCode: 200,
    message: `Payment ${payment.paymentNumber} cancelled successfully.`,
    data: cancelled
  };
};
