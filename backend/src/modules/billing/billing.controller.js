import {
  generateBillFromOrderService,
  createDirectBillService,
  lockBillService,
  cancelBillService,
  getBillsService,
  getBillByIdService
} from "./billing.service.js";

export const createDirectBill = async (req, res) => {
  try {
    const bill = await createDirectBillService(req.body, req.user);
    res.status(201).json({
      success: true,
      message: `Tax Invoice ${bill.billNumber} posted successfully. Stock and ledger updated.`,
      data: bill
    });
  } catch (err) {
    console.error("createDirectBill Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to create direct billing invoice."
    });
  }
};

export const getBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      billStatus = "ALL",
      paymentStatus = "ALL",
      salesmanId = "",
      customerId = ""
    } = req.query;

    const result = await getBillsService(
      { page, limit, search, billStatus, paymentStatus, salesmanId, customerId },
      req.user
    );

    res.status(200).json({
      success: true,
      data: result.bills,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (err) {
    console.error("getBills Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to fetch invoices."
    });
  }
};

export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await getBillByIdService(id, req.user);

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (err) {
    console.error("getBillById Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to fetch invoice details."
    });
  }
};

export const generateBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    const bill = await generateBillFromOrderService(orderId, req.user);

    res.status(201).json({
      success: true,
      message: `Invoice ${bill.billNumber} generated successfully from Order #${bill.orderNumber}.`,
      data: bill
    });
  } catch (err) {
    console.error("generateBill Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to generate invoice."
    });
  }
};

export const lockBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await lockBillService(id, req.user);

    res.status(200).json({
      success: true,
      message: `Invoice ${bill.billNumber} is now locked. No further modifications allowed.`,
      data: bill
    });
  } catch (err) {
    console.error("lockBill Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to lock invoice."
    });
  }
};

export const cancelBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const bill = await cancelBillService(id, reason, req.user);

    res.status(200).json({
      success: true,
      message: `Invoice ${bill.billNumber} has been cancelled.`,
      data: bill
    });
  } catch (err) {
    console.error("cancelBill Controller Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to cancel invoice."
    });
  }
};

export const getOpenBillsForCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { findOpenBillsByCustomer } = await import("./billing.repository.js");
    const bills = await findOpenBillsByCustomer(customerId);
    return res.status(200).json({
      success: true,
      data: bills
    });
  } catch (err) {
    console.error("getOpenBillsForCustomer Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch open bills for customer."
    });
  }
};

