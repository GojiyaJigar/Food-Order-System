const db = require("../../config/db");


/* =========================================================
   GET ALL CUSTOMERS
========================================================= */

const getAllCustomers = (callback) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.city,
            u.state,
            u.pincode,
            u.address,
            u.status,
            u.created_at,

            COUNT(DISTINCT o.id) AS total_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status NOT IN (
                            'Cancelled'
                        )
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent

        FROM users u

        LEFT JOIN orders o
            ON o.user_id = u.id

        WHERE u.role = 'customer'

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            u.city,
            u.state,
            u.pincode,
            u.address,
            u.status,
            u.created_at

        ORDER BY u.created_at DESC
    `;

    db.query(
        sql,
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            callback(
                null,
                rows || []
            );
        }
    );
};


/* =========================================================
   GET SINGLE CUSTOMER
========================================================= */

const getCustomerById = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.phone,
            u.city,
            u.state,
            u.pincode,
            u.address,
            u.status,
            u.created_at,

            COUNT(DISTINCT o.id) AS total_orders,

            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status NOT IN (
                            'Cancelled'
                        )
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent

        FROM users u

        LEFT JOIN orders o
            ON o.user_id = u.id

        WHERE
            u.id = ?
            AND u.role = 'customer'

        GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            u.city,
            u.state,
            u.pincode,
            u.address,
            u.status,
            u.created_at

        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            callback(
                null,
                rows && rows.length
                    ? rows[0]
                    : null
            );
        }
    );
};


/* =========================================================
   UPDATE CUSTOMER
========================================================= */

const updateCustomer = (
    userId,
    data,
    callback
) => {

    const sql = `
        UPDATE users
        SET
            name = ?,
            email = ?,
            phone = ?,
            city = ?,
            state = ?,
            pincode = ?,
            address = ?
        WHERE
            id = ?
            AND role = 'customer'
    `;

    db.query(
        sql,
        [
            data.name,
            data.email,
            data.phone,
            data.city,
            data.state,
            data.pincode,
            data.address,
            userId
        ],
        callback
    );
};


/* =========================================================
   UPDATE CUSTOMER STATUS
========================================================= */

const updateCustomerStatus = (
    userId,
    status,
    callback
) => {

    const sql = `
        UPDATE users
        SET status = ?
        WHERE
            id = ?
            AND role = 'customer'
    `;

    db.query(
        sql,
        [
            status,
            userId
        ],
        callback
    );
};


/* =========================================================
   CHECK CUSTOMER DELETE ELIGIBILITY
=========================================================

   Allowed terminal statuses:
   - Delivered
   - Failed
   - Cancelled

   Current DB officially has:
   Pending
   Confirmed
   Preparing
   Out For Delivery
   Delivered
   Cancelled

   So "Cancelled" acts as failed/terminal state.
========================================================= */

const canDeleteCustomer = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            COUNT(*) AS total_orders,

            SUM(
                CASE
                    WHEN order_status IN (
                        'Delivered',
                        'Failed',
                        'Cancelled'
                    )
                    THEN 0
                    ELSE 1
                END
            ) AS active_orders

        FROM orders

        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            const row =
                rows && rows.length
                    ? rows[0]
                    : {};

            callback(
                null,
                {
                    totalOrders:
                        Number(
                            row.total_orders || 0
                        ),

                    activeOrders:
                        Number(
                            row.active_orders || 0
                        )
                }
            );
        }
    );
};


/* =========================================================
   OLD COMPATIBILITY FUNCTION
========================================================= */

const customerHasOrders = (
    userId,
    callback
) => {

    const sql = `
        SELECT COUNT(*) AS total_orders
        FROM orders
        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            const count =
                rows && rows.length
                    ? Number(
                        rows[0].total_orders || 0
                    )
                    : 0;

            callback(
                null,
                count
            );
        }
    );
};


/* =========================================================
   DELETE CUSTOMER
=========================================================

   Sequence:

   1. order_items
   2. orders
   3. users

   addresses/profile/cart/user_addresses will be cleaned
   through the existing FK cascade when users is deleted.
========================================================= */

const deleteCustomer = (
    userId,
    callback
) => {

    /* ==========================================
       DELETE ORDER ITEMS
    ========================================== */

    db.query(
        `
        DELETE oi
        FROM order_items oi

        INNER JOIN orders o
            ON oi.order_id = o.id

        WHERE o.user_id = ?
        `,
        [userId],
        (error) => {

            if (error) {
                return callback(error);
            }


            /* ==========================================
               DELETE ORDERS
            ========================================== */

            db.query(
                `
                DELETE FROM orders
                WHERE user_id = ?
                `,
                [userId],
                (error) => {

                    if (error) {
                        return callback(error);
                    }


                    /* ==========================================
                       DELETE CUSTOMER
                    ========================================== */

                    db.query(
                        `
                        DELETE FROM users
                        WHERE
                            id = ?
                            AND role = 'customer'
                        `,
                        [userId],
                        (error, result) => {

                            if (error) {
                                return callback(error);
                            }

                            callback(
                                null,
                                result
                            );
                        }
                    );
                }
            );
        }
    );
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getAllCustomers,

    getCustomerById,

    updateCustomer,

    updateCustomerStatus,

    customerHasOrders,

    canDeleteCustomer,

    deleteCustomer
};