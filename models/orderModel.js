const db = require("../config/db");


// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = (userId, callback) => {

    const sql = `

        SELECT

            o.id,
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

        WHERE o.user_id = ?

        ORDER BY
            o.created_at DESC,
            oi.id ASC

    `;


    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.error(
                    "GET MY ORDERS MODEL ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                results
            );

        }
    );

};



// =====================================================
// GET SINGLE ORDER
// =====================================================

const getOrderById = (
    userId,
    orderId,
    callback
) => {

    const sql = `

        SELECT

            o.id,
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

        WHERE
            o.id = ?
            AND o.user_id = ?

        ORDER BY
            oi.id ASC

    `;


    db.query(
        sql,
        [
            orderId,
            userId
        ],
        (err, results) => {

            if (err) {

                console.error(
                    "GET ORDER BY ID MODEL ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                results
            );

        }
    );

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getMyOrders,
    getOrderById

};