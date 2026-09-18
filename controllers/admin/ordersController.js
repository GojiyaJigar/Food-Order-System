const ordersModel = require("../../models/admin/ordersModel");

const VALID_STATUSES = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Out For Delivery",
    "Delivered",
    "Cancelled"
];


const getAllOrders = (req, res) => {
    ordersModel.getAllOrders((error, orders) => {
        if (error) {
            console.error("Get all orders error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to load orders."
            });
        }

        return res.json({
            success: true,
            orders
        });
    });
};


const getOrderById = (req, res) => {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID."
        });
    }

    ordersModel.getOrderById(orderId, (error, order) => {
        if (error) {
            console.error("Get order details error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to load order details."
            });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.json({
            success: true,
            order
        });
    });
};


const updateOrderStatus = (req, res) => {
    const orderId = Number(req.params.id);

    const status = String(
        req.body?.status || ""
    ).trim();

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid order ID."
        });
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid order status."
        });
    }

    ordersModel.updateOrderStatus(
        orderId,
        status,
        (error, result) => {
            if (error) {
                console.error(
                    "Update order status error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update order status."
                });
            }

            if (!result || result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            return res.json({
                success: true,
                message: "Order status updated successfully.",
                status
            });
        }
    );
};


module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus
};