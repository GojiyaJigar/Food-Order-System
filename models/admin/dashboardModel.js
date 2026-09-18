const db = require("../../config/db");


// =====================================================
// DASHBOARD STATS
// =====================================================

const getDashboardStats = (callback) => {

    const query = `
        SELECT

            /* -----------------------------------------
               TOTAL CUSTOMERS
               Admin ko count nahi karna
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM users
                WHERE role = 'customer'
            ) AS totalUsers,


            /* -----------------------------------------
               TOTAL AVAILABLE FOODS
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM foods
                WHERE is_available = 1
            ) AS totalFoods,


            /* -----------------------------------------
               TOTAL ORDERS
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
            ) AS totalOrders,


            /* -----------------------------------------
               TOTAL REVENUE
               Cancelled orders exclude
            ----------------------------------------- */
            (
                SELECT COALESCE(
                    SUM(total_amount),
                    0
                )
                FROM orders
                WHERE order_status != 'Cancelled'
            ) AS totalRevenue,


            /* -----------------------------------------
               PENDING
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Pending'
            ) AS pendingOrders,


            /* -----------------------------------------
               CONFIRMED
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Confirmed'
            ) AS confirmedOrders,


            /* -----------------------------------------
               PREPARING
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Preparing'
            ) AS preparingOrders,


            /* -----------------------------------------
               OUT FOR DELIVERY
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Out For Delivery'
            ) AS outForDeliveryOrders,


            /* -----------------------------------------
               DELIVERED
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Delivered'
            ) AS deliveredOrders,


            /* -----------------------------------------
               CANCELLED
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'Cancelled'
            ) AS cancelledOrders,


            /* -----------------------------------------
               ACTIVE OFFERS
            ----------------------------------------- */
            (
                SELECT COUNT(*)
                FROM offers
                WHERE is_active = 1
                  AND NOW() >= start_date
                  AND NOW() <= end_date
            ) AS activeOffers

    `;


    db.query(
        query,
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Dashboard Stats Error:",
                    err.message
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                result[0]
            );

        }
    );

};



// =====================================================
// RECENT ORDERS
// =====================================================

const getRecentOrders = (callback) => {

    const query = `
        SELECT

            id,
            user_id,
            customer_name,
            phone,
            total_amount,
            payment_method,
            order_status,
            created_at

        FROM orders

        ORDER BY created_at DESC

        LIMIT 8
    `;


    db.query(
        query,
        (err, result) => {

            if (err) {

                console.error(
                    "❌ Recent Orders Error:",
                    err.message
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                result
            );

        }
    );

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getDashboardStats,
    getRecentOrders

};