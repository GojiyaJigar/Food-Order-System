const express = require("express");
const path = require("path");

const router = express.Router();

const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");

const {
    getAllOrders,
    getOrderById,
    updateOrderStatus
} = require("../../controllers/admin/ordersController");


/* =========================================================
   ORDERS PAGE
   GET /admin/orders
========================================================= */

router.get(
    "/orders",
    requireAdmin,
    (req, res) => {
        return res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/orders.html"
            )
        );
    }
);


/* =========================================================
   GET ALL ORDERS
   GET /admin/api/orders
========================================================= */

router.get(
    "/api/orders",
    requireAdminAPI,
    getAllOrders
);


/* =========================================================
   GET SINGLE ORDER
   GET /admin/api/orders/:id
========================================================= */

router.get(
    "/api/orders/:id",
    requireAdminAPI,
    getOrderById
);


/* =========================================================
   UPDATE ORDER STATUS
   PATCH /admin/api/orders/:id/status
========================================================= */

router.patch(
    "/api/orders/:id/status",
    requireAdminAPI,
    updateOrderStatus
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;