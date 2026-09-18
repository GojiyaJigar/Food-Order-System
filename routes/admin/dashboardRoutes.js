const express = require("express");
const path = require("path");

const db = require("../../config/db");

const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");

const router = express.Router();

/* =========================================================
   PROMISE WRAPPER
========================================================= */

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }

            resolve(results || []);
        });
    });
}


/* =========================================================
   DASHBOARD PAGE
   GET /admin/dashboard
========================================================= */

router.get(
    "/dashboard",
    requireAdmin,
    (req, res) => {
        return res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/dashboard.html"
            )
        );
    }
);


/* =========================================================
   DASHBOARD DATA
   GET /admin/api/dashboard
========================================================= */

async function getDashboardData(req, res) {
    try {

        /* =================================================
           TOTAL CUSTOMERS
           Only role = customer
        ================================================= */

        const customerRows = await query(`
            SELECT COUNT(*) AS totalUsers
            FROM users
            WHERE role = 'customer'
        `);


        /* =================================================
           TOTAL FOODS
        ================================================= */

        const foodRows = await query(`
            SELECT COUNT(*) AS totalFoods
            FROM foods
        `);


        /* =================================================
           TOTAL ORDERS
        ================================================= */

        const orderRows = await query(`
            SELECT COUNT(*) AS totalOrders
            FROM orders
        `);


        /* =================================================
           TOTAL REVENUE
           Cancelled orders excluded
        ================================================= */

        const revenueRows = await query(`
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN order_status <> 'Cancelled'
                            THEN total_amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS totalRevenue
            FROM orders
        `);


        /* =================================================
           ORDER STATUS COUNTS
        ================================================= */

        const statusRows = await query(`
            SELECT
                order_status,
                COUNT(*) AS total
            FROM orders
            GROUP BY order_status
        `);


        const statusMap = {
            Pending: 0,
            Confirmed: 0,
            Preparing: 0,
            "Out For Delivery": 0,
            Delivered: 0,
            Cancelled: 0
        };


        statusRows.forEach(row => {
            const status = String(
                row.order_status || ""
            );

            if (
                Object.prototype.hasOwnProperty.call(
                    statusMap,
                    status
                )
            ) {
                statusMap[status] =
                    Number(row.total || 0);
            }
        });


        /* =================================================
           ACTIVE OFFERS
           Safe fallback = 0 if offers structure differs
        ================================================= */

        let activeOffers = 0;

        try {
            const offerRows = await query(`
                SELECT COUNT(*) AS total
                FROM offers
                WHERE is_active = 1
                  AND (
                      start_date IS NULL
                      OR start_date <= NOW()
                  )
                  AND (
                      end_date IS NULL
                      OR end_date >= NOW()
                  )
            `);

            activeOffers = Number(
                offerRows[0]?.total || 0
            );

        } catch (offerError) {
            console.warn(
                "Dashboard offers query skipped:",
                offerError.message
            );

            activeOffers = 0;
        }


        /* =================================================
           RECENT ORDERS
        ================================================= */

        const recentOrders = await query(`
            SELECT
                o.id,
                o.customer_name,
                o.phone,
                o.total_amount,
                o.payment_method,
                o.order_status,
                o.created_at,
                COUNT(oi.id) AS items_count
            FROM orders o
            LEFT JOIN order_items oi
                ON oi.order_id = o.id
            GROUP BY
                o.id,
                o.customer_name,
                o.phone,
                o.total_amount,
                o.payment_method,
                o.order_status,
                o.created_at
            ORDER BY
                o.created_at DESC,
                o.id DESC
            LIMIT 8
        `);


        /* =================================================
           RESPONSE
        ================================================= */

        return res.json({
            success: true,

            stats: {
                totalUsers:
                    Number(
                        customerRows[0]?.totalUsers || 0
                    ),

                totalFoods:
                    Number(
                        foodRows[0]?.totalFoods || 0
                    ),

                totalOrders:
                    Number(
                        orderRows[0]?.totalOrders || 0
                    ),

                totalRevenue:
                    Number(
                        revenueRows[0]?.totalRevenue || 0
                    ),

                pendingOrders:
                    statusMap.Pending,

                confirmedOrders:
                    statusMap.Confirmed,

                preparingOrders:
                    statusMap.Preparing,

                outForDeliveryOrders:
                    statusMap["Out For Delivery"],

                deliveredOrders:
                    statusMap.Delivered,

                cancelledOrders:
                    statusMap.Cancelled,

                activeOffers
            },

            recentOrders
        });

    } catch (error) {

        console.error(
            "DASHBOARD API ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load dashboard data."
        });
    }
}


/* =========================================================
   DASHBOARD API ROUTES

   Main:
   /admin/api/dashboard

   Extra aliases are kept so frontend route mismatch
   does not break the dashboard.
========================================================= */

router.get(
    "/api/dashboard",
    requireAdminAPI,
    getDashboardData
);

router.get(
    "/dashboard/data",
    requireAdminAPI,
    getDashboardData
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;