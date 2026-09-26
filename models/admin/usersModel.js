"use strict";
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
            /* DEFAULT ADDRESS */
            COALESCE(a.city, u.city) AS city,
            COALESCE(a.state, u.state) AS state,
            COALESCE(a.pincode, u.pincode) AS pincode,
            COALESCE(a.address, u.address) AS address,
            u.status,
            u.created_at,
            COUNT(DISTINCT o.id) AS total_orders,
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status NOT IN ('Cancelled')
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent
        FROM users u
        /* =================================================
           ONLY DEFAULT ADDRESS
        ================================================= */
        LEFT JOIN addresses a
            ON a.user_id = u.id
            AND a.is_default = 1
        /* =================================================
           ORDERS
        ================================================= */
        LEFT JOIN orders o
            ON o.user_id = u.id
        WHERE
            u.role = 'customer'
        GROUP BY
            u.id,
            u.name,
            u.email,
            u.phone,
            a.city,
            a.state,
            a.pincode,
            a.address,
            u.city,
            u.state,
            u.pincode,
            u.address,
            u.status,
            u.created_at
        ORDER BY
            u.created_at DESC
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
            /* DEFAULT ADDRESS */
            COALESCE(a.city, u.city) AS city,
            COALESCE(a.state, u.state) AS state,
            COALESCE(a.pincode, u.pincode) AS pincode,
            COALESCE(a.address, u.address) AS address,
            u.status,
            u.created_at,
            COUNT(DISTINCT o.id) AS total_orders,
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status NOT IN ('Cancelled')
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS total_spent
        FROM users u
        /* =================================================
           DEFAULT ADDRESS
        ================================================= */
        LEFT JOIN addresses a
            ON a.user_id = u.id
            AND a.is_default = 1
        /* =================================================
           ORDERS
        ================================================= */
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
            a.city,
            a.state,
            a.pincode,
            a.address,
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
    /* =====================================================
       FIRST CHECK CUSTOMER
    ===================================================== */
    db.query(
        `
        SELECT
            id
        FROM users
        WHERE
            id = ?
            AND role = 'customer'
        LIMIT 1
        `,
        [userId],
        (findError, users) => {
            if (findError) {
                return callback(findError);
            }
            if (!users || !users.length) {
                return callback(
                    Object.assign(
                        new Error("Customer not found."),
                        {
                            code:
                                "CUSTOMER_NOT_FOUND"
                        }
                    )
                );
            }
            /* =================================================
               UPDATE USER BASIC INFORMATION
            ================================================= */
            const updateUserSQL = `
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
                updateUserSQL,
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
                (userError) => {
                    if (userError) {
                        return callback(userError);
                    }
                    /* =================================================
                       FIND DEFAULT ADDRESS
                    ================================================= */
                    db.query(
                        `
                        SELECT
                            id
                        FROM addresses
                        WHERE
                            user_id = ?
                            AND is_default = 1
                        ORDER BY id DESC
                        LIMIT 1
                        `,
                        [userId],
                        (addressFindError, rows) => {
                            if (addressFindError) {
                                return callback(
                                    addressFindError
                                );
                            }
                            /* =================================================
                               ADDRESS DATA
                            ================================================= */
                            const addressData = [
                                data.name,
                                data.phone,
                                data.address,
                                data.city,
                                data.state,
                                data.pincode
                            ];
                            /* =================================================
                               DEFAULT ADDRESS EXISTS
                            ================================================= */
                            if (
                                rows &&
                                rows.length
                            ) {
                                const addressId =
                                    rows[0].id;
                                const updateAddressSQL = `
                                    UPDATE addresses
                                    SET
                                        full_name = ?,
                                        phone = ?,
                                        address = ?,
                                        city = ?,
                                        state = ?,
                                        pincode = ?,
                                        is_default = 1
                                    WHERE
                                        id = ?
                                        AND user_id = ?
                                `;
                                return db.query(
                                    updateAddressSQL,
                                    [
                                        ...addressData,
                                        addressId,
                                        userId
                                    ],
                                    (addressError) => {
                                        if (addressError) {
                                            return callback(
                                                addressError
                                            );
                                        }
                                        /*
                                         * User + default address
                                         * successfully updated.
                                         */
                                        return callback(
                                            null,
                                            {
                                                affectedRows: 1
                                            }
                                        );
                                    }
                                );
                            }
                            /* =================================================
                               NO DEFAULT ADDRESS
                               CREATE ONE
                            ================================================= */
                            const createAddressSQL = `
                                INSERT INTO addresses
                                (
                                    user_id,
                                    address_label,
                                    full_name,
                                    phone,
                                    address,
                                    city,
                                    state,
                                    pincode,
                                    is_default
                                )
                                VALUES
                                (?, ?, ?, ?, ?, ?, ?, ?, 1)
                            `;
                            db.query(
                                createAddressSQL,
                                [
                                    userId,
                                    "Home",
                                    data.name,
                                    data.phone,
                                    data.address,
                                    data.city,
                                    data.state,
                                    data.pincode
                                ],
                                (createError) => {
                                    if (createError) {
                                        return callback(
                                            createError
                                        );
                                    }
                                    return callback(
                                        null,
                                        {
                                            affectedRows: 1
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
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
        SET
            status = ?
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
        WHERE
            user_id = ?
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
        SELECT
            COUNT(*) AS total_orders
        FROM orders
        WHERE
            user_id = ?
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
========================================================= */
const deleteCustomer = (
    userId,
    callback
) => {
    /* =====================================================
       DELETE ORDER ITEMS
    ===================================================== */
    db.query(
        `
        DELETE oi
        FROM order_items oi
        INNER JOIN orders o
            ON oi.order_id = o.id
        WHERE
            o.user_id = ?
        `,
        [userId],
        (error) => {
            if (error) {
                return callback(error);
            }
            /* =================================================
               DELETE ORDERS
            ================================================= */
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
                    /* =================================================
                       DELETE ADDRESSES
                    ================================================= */
                    db.query(
                        `
                        DELETE FROM addresses
                        WHERE user_id = ?
                        `,
                        [userId],
                        (error) => {
                            if (error) {
                                return callback(error);
                            }
                            /* =================================================
                               DELETE CUSTOMER
                            ================================================= */
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