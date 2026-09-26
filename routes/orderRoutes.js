const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getMyOrderById,
    updateOrderStatus,
    cancelOrder
} = require("../controllers/orderController");
// Order Banayein
router.post("/", createOrder);
// Mere Orders
router.get("/my", getMyOrders);
// Ek Order
router.get("/my/:id", getMyOrderById);
// Status Update Karein
router.post("/:id/status", updateOrderStatus);
// Order Cancel Karein
router.post("/:id/cancel", cancelOrder);
module.exports = router;