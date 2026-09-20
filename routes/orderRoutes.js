const express = require("express");

const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getMyOrderById,
    updateOrderStatus
} = require("../controllers/orderController");


// Create Order
router.post("/", createOrder);

// My Orders
router.get("/my", getMyOrders);

// Single Order
router.get("/my/:id", getMyOrderById);

// Update Order Status
router.post("/:id/status", updateOrderStatus);


module.exports = router;