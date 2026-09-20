"use strict";

const db = require("../../config/db");


// =========================
// GET ALL ORDERS
// =========================

const getAllOrders = (callback) => {

    const sql = `
        SELECT
            o.id,
            o.order_number,
            o.user_id,
            o.customer_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
            o.subtotal,
            o.delivery_fee,
            o.gst,
            o.discount,
            o.coupon_code,
            o.total_amount,
            o.payment_method,
            o.order_status,
            o.created_at,
            o.updated_at,
            o.cancelled_at,

            COUNT(oi.id) AS items_count

        FROM orders o

        LEFT JOIN order_items oi
            ON oi.order_id = o.id

        GROUP BY o.id

        ORDER BY o.created_at DESC
    `;


    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "ADMIN GET ALL ORDERS ERROR:",
                err
            );

            return callback(err, null);
        }

        callback(null, results || []);
    });
};


// =========================
// GET SINGLE ORDER
// =========================

const getOrderById = (
    orderId,
    callback
) => {

    const sql = `
        SELECT
            o.id,
            o.order_number,
            o.user_id,
            o.customer_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
            o.subtotal,
            o.delivery_fee,
            o.gst,
            o.discount,
            o.coupon_code,
            o.total_amount,
            o.payment_method,
            o.order_status,
            o.created_at,
            o.updated_at,
            o.cancelled_at,

            oi.id AS item_id,
            oi.food_id,
            oi.quantity,
            oi.price AS item_price,

            f.name AS food_name,
            f.description AS food_description,
            f.image AS food_image,
            f.category AS food_category

        FROM orders o

        LEFT JOIN order_items oi
            ON oi.order_id = o.id

        LEFT JOIN foods f
            ON f.id = oi.food_id

        WHERE o.id = ?

        ORDER BY oi.id ASC
    `;


    db.query(
        sql,
        [orderId],
        (err, results) => {

            if (err) {

                console.error(
                    "ADMIN GET ORDER ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );
            }

            callback(
                null,
                results || []
            );
        }
    );
};


// =========================
// UPDATE STATUS
// =========================

const updateOrderStatus = (
    orderId,
    status,
    callback
) => {

    const sql = `
        UPDATE orders
        SET
            order_status = ?,
            cancelled_at =
                CASE
                    WHEN ? = 'Cancelled'
                    THEN NOW()
                    ELSE NULL
                END
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            status,
            status,
            orderId
        ],
        (err, result) => {

            if (err) {

                console.error(
                    "ADMIN UPDATE ORDER ERROR:",
                    err
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


module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus
};