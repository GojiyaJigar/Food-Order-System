const db = require("../../config/db");

const getAllOrders = (callback) => {
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
        GROUP BY
            o.id,
            o.user_id,
            o.customer_name,
            o.phone,
            o.address,
            o.city,
            o.state,
            o.pincode,
            o.total_amount,
            o.payment_method,
            o.order_status,
            o.created_at,
            o.updated_at,
            o.cancelled_at
        ORDER BY o.created_at DESC, o.id DESC
    `;

    db.query(sql, (error, rows) => {
        if (error) return callback(error);
        callback(null, rows || []);
    });
};


const getOrderById = (orderId, callback) => {
    const orderSql = `
        SELECT
            id,
            user_id,
            customer_name,
            phone,
            address,
            city,
            state,
            pincode,
            total_amount,
            payment_method,
            order_status,
            created_at,
            updated_at,
            cancelled_at
        FROM orders
        WHERE id = ?
        LIMIT 1
    `;

    db.query(orderSql, [orderId], (error, orderRows) => {
        if (error) return callback(error);

        if (!orderRows || !orderRows.length) {
            return callback(null, null);
        }

        const order = orderRows[0];

        const itemsSql = `
            SELECT
                oi.id,
                oi.order_id,
                oi.food_id,
                oi.quantity,
                oi.price,
                f.name,
                f.image,
                (oi.quantity * oi.price) AS item_total
            FROM order_items oi
            LEFT JOIN foods f
                ON f.id = oi.food_id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        `;

        db.query(itemsSql, [orderId], (itemsError, itemRows) => {
            if (itemsError) return callback(itemsError);

            order.items = itemRows || [];

            callback(null, order);
        });
    });
};


const updateOrderStatus = (orderId, status, callback) => {
    let sql;
    let params;

    if (status === "Cancelled") {
        sql = `
            UPDATE orders
            SET
                order_status = ?,
                cancelled_at = NOW()
            WHERE id = ?
        `;

        params = [status, orderId];
    } else {
        sql = `
            UPDATE orders
            SET
                order_status = ?,
                cancelled_at = NULL
            WHERE id = ?
        `;

        params = [status, orderId];
    }

    db.query(sql, params, callback);
};


module.exports = {
    getAllOrders,
    getOrderById,
    updateOrderStatus
};  