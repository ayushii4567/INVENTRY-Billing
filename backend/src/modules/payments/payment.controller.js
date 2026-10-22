import {
  listPaymentsService,
  getPaymentDetailsService,
  getUnmatchedPaymentsService,
  recordPaymentService,
  identifyCustomerService,
  mapPaymentService,
  cancelPaymentService
} from "./payment.service.js";

export const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "ALL",
      paymentMode = "ALL",
      paymentType = "ALL",
      supplierId = null
    } = req.query;

    const result = await listPaymentsService({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      search,
      status,
      paymentMode,
      paymentType,
      supplierId,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully.",
      data: result.payments,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error("Error in getPayments controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payments."
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPaymentDetailsService(id, req.user);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getPaymentById controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching payment details."
    });
  }
};

export const getUnmatchedPayments = async (req, res) => {
  try {
    const result = await getUnmatchedPaymentsService(req.user);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Unmatched UPI payments retrieved successfully.",
      data: result.data,
      count: result.count
    });
  } catch (error) {
    console.error("Error in getUnmatchedPayments controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unmatched payments queue."
    });
  }
};

export const recordPayment = async (req, res) => {
  try {
    const result = await recordPaymentService(req.body, req.user);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.statusCode || 201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error in recordPayment controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while recording payment entry."
    });
  }
};

export const identifyCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, customerCode, customerName, shopName } = req.body;

    const result = await identifyCustomerService(
      id,
      { customerId, customerCode, customerName, shopName },
      req.user
    );

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error in identifyCustomer controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error identifying customer for unmatched payment."
    });
  }
};

export const mapPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocations } = req.body;

    const result = await mapPaymentService(id, allocations, req.user);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error in mapPayment controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error mapping payment to invoices."
    });
  }
};

export const cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await cancelPaymentService(id, reason, req.user);

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error in cancelPayment controller:", error);
    return res.status(500).json({
      success: false,
      message: "Server error cancelling payment."
    });
  }
};
