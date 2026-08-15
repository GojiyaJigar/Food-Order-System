const express = require("express");

const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getMyOrderById
} = require("../controllers/orderController");


// =====================================================
// PLACE ORDER
// =====================================================

router.post(
    "/api/orders",
    createOrder
);


// =====================================================
// MY ORDERS
// =====================================================

router.get(
    "/api/orders/my",
    getMyOrders
);


// =====================================================
// SINGLE ORDER
// =====================================================

router.get(
    "/api/orders/my/:id",
    getMyOrderById
);


module.exports = router;