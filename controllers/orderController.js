"use strict";

const db = require("../config/db");
const orderModel = require("../models/orderModel");
const settingsModel = require("../models/admin/settingsModel");

const {
    sendOrderEmail
} = require("../services/orderEmailService");


// =========================
// HELPERS
// =========================

const query = (sql, values = []) =>
    new Promise((resolve, reject) => {

        db.query(
            sql,
            values,
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );

    });


const sendJSON = (res, status, data) => {
    return res.status(status).json(data);
};


// =========================
// ORDER NUMBER
// =========================

const createOrderNumber = (id) => {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 8; i++) {

        code += characters[
            Math.floor(
                Math.random() * characters.length
            )
        ];

    }

    return `JGO-${year}${month}${day}-${code}`;
};


const getSafeOrderNumber = (orderNumber, id) => {

    return (
        orderNumber ||
        createOrderNumber(id)
    );
};


// =========================
// EMAIL DATA
// =========================

const getOrderEmailData = async (orderId) => {

    const rows = await query(
        `
        SELECT
            o.id,
            o.order_number,
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
            o.total_amount,
            o.payment_method,
            o.order_status,

            u.email AS customer_email,

            oi.id AS item_id,
            oi.food_id,
            oi.quantity,
            oi.price AS item_price,

            f.name AS food_name

        FROM orders o

        LEFT JOIN users u
            ON u.id = o.user_id

        LEFT JOIN order_items oi
            ON oi.order_id = o.id

        LEFT JOIN foods f
            ON f.id = oi.food_id

        WHERE o.id = ?

        ORDER BY oi.id ASC
        `,
        [orderId]
    );


    if (!rows.length) {
        return null;
    }


    const first = rows[0];

    const orderNumber =
        getSafeOrderNumber(
            first.order_number,
            first.id
        );


    const items = rows
        .filter(row => row.item_id)
        .map(row => {

            const quantity =
                Number(row.quantity || 0);

            const price =
                Number(row.item_price || 0);

            return {
                id: Number(row.item_id),
                food_id: Number(row.food_id),
                name: row.food_name || "Food Item",
                quantity,
                price,
                total: Number(
                    (price * quantity).toFixed(2)
                )
            };

        });


    return {

        email: first.customer_email,

        customerName:
            first.customer_name || "Customer",

        status:
            first.order_status || "Pending",

        order: {

            id: Number(first.id),

            orderNumber,

            phone: first.phone || "",
            address: first.address || "",
            city: first.city || "",
            state: first.state || "",
            pincode: first.pincode || "",

            subtotal:
                Number(first.subtotal || 0),

            delivery_fee:
                Number(first.delivery_fee || 0),

            gst:
                Number(first.gst || 0),

            discount:
                Number(first.discount || 0),

            total_amount:
                Number(first.total_amount || 0),

            payment_method:
                first.payment_method || "COD",

            items
        }
    };
};


// =========================
// SEND ORDER EMAIL
// =========================

const sendOrderStatusEmail = async (
    orderId,
    status
) => {

    try {

        const data =
            await getOrderEmailData(orderId);

        if (!data) return;

        if (!data.email) {

            console.error(
                `ORDER EMAIL ERROR → Email missing for Order #${orderId}`
            );

            return;
        }


        await sendOrderEmail({

            to: data.email,

            customerName:
                data.customerName,

            status,

            order:
                data.order

        });


        console.log(
            `ORDER EMAIL SENT → ${data.email} | ${data.order.orderNumber} | ${status}`
        );

    } catch (error) {

        console.error(
            `ORDER EMAIL ERROR → ${orderId} | ${status}`,
            error
        );

    }
};


// =========================
// CREATE ORDER
// =========================

const createOrder = async (req, res) => {

    if (!req.session?.userId) {

        return sendJSON(res, 401, {
            success: false,
            message: "Please login first."
        });
    }


    try {

        const userId =
            req.session.userId;

        const data =
            req.body || {};

        const settings =
            await settingsModel.getOrCreateSettings();


        const customerName =
            String(
                data.customerName ||
                data.customer_name ||
                ""
            ).trim();

        const phone =
            String(
                data.customerPhone ||
                data.phone ||
                ""
            ).trim();

        const address =
            String(
                data.customerAddress ||
                data.address ||
                ""
            ).trim();

        const city =
            String(
                data.customerCity ||
                data.city ||
                ""
            ).trim();

        const state =
            String(
                data.customerState ||
                data.state ||
                ""
            ).trim();

        const pincode =
            String(
                data.customerPincode ||
                data.pincode ||
                ""
            ).trim();


        const paymentMethod =
            String(
                data.paymentMethod ||
                data.payment_method ||
                "COD"
            )
                .trim()
                .toUpperCase();


        const subtotal =
            Number(data.subtotal || 0);

        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        if (!customerName)
            return sendJSON(res, 400, {
                success: false,
                message: "Customer name is required."
            });

        if (!phone)
            return sendJSON(res, 400, {
                success: false,
                message: "Phone number is required."
            });

        if (!address)
            return sendJSON(res, 400, {
                success: false,
                message: "Delivery address is required."
            });

        if (!city)
            return sendJSON(res, 400, {
                success: false,
                message: "City is required."
            });

        if (!items.length)
            return sendJSON(res, 400, {
                success: false,
                message: "Your cart is empty."
            });

        if (
            !Number.isFinite(subtotal) ||
            subtotal <= 0
        ) {
            return sendJSON(res, 400, {
                success: false,
                message: "Invalid order subtotal."
            });
        }


        const paymentAllowed = {

            COD:
                Number(settings.payment_cod) === 1,

            UPI:
                Number(settings.payment_upi) === 1,

            CARD:
                Number(settings.payment_card) === 1

        };


        if (!paymentAllowed[paymentMethod]) {

            return sendJSON(res, 400, {
                success: false,
                message:
                    `${paymentMethod} payment is currently disabled.`
            });
        }


        const minimumOrder =
            Number(settings.minimum_order || 0);

        if (
            minimumOrder > 0 &&
            subtotal < minimumOrder
        ) {

            return sendJSON(res, 400, {
                success: false,
                message:
                    `Minimum order amount is ₹${minimumOrder.toFixed(2)}.`
            });
        }


        const freeDeliveryAbove =
            Number(
                settings.free_delivery_above || 0
            );

        let deliveryFee =
            Number(
                settings.delivery_fee || 0
            );


        if (
            freeDeliveryAbove > 0 &&
            subtotal >= freeDeliveryAbove
        ) {
            deliveryFee = 0;
        }


        const gstRate =
            Number(settings.gst_rate || 0) / 100;

        const gst =
            Number(
                (
                    subtotal * gstRate
                ).toFixed(2)
            );


        const couponCode =
            data.couponCode ||
            data.coupon_code ||
            null;

        let discount =
            Number(data.discount || 0);


        if (
            !Number.isFinite(discount) ||
            discount < 0
        ) {
            discount = 0;
        }


        if (
            couponCode &&
            Number(settings.coupons_enabled) !== 1
        ) {

            return sendJSON(res, 400, {
                success: false,
                message: "Coupons are currently disabled."
            });
        }


        if (
            couponCode &&
            Number(settings.offers_enabled) !== 1
        ) {

            return sendJSON(res, 400, {
                success: false,
                message: "Offers are currently disabled."
            });
        }


        discount =
            Math.min(
                discount,
                subtotal +
                deliveryFee +
                gst
            );


        const totalAmount =
            Number(
                Math.max(
                    0,
                    subtotal +
                    deliveryFee +
                    gst -
                    discount
                ).toFixed(2)
            );


        if (totalAmount <= 0) {

            return sendJSON(res, 400, {
                success: false,
                message: "Invalid order total."
            });
        }


        // =========================
        // INSERT ORDER
        // =========================

        const result =
            await query(
                `
                INSERT INTO orders
                (
                    user_id,
                    customer_name,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    subtotal,
                    delivery_fee,
                    gst,
                    discount,
                    coupon_code,
                    total_amount,
                    payment_method,
                    order_status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
                `,
                [
                    userId,
                    customerName,
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                    subtotal,
                    deliveryFee,
                    gst,
                    discount,
                    couponCode,
                    totalAmount,
                    paymentMethod
                ]
            );


        const orderId =
            result.insertId;


        // Permanent JGO number
        const orderNumber =
            createOrderNumber(orderId);


        await query(
            `
            UPDATE orders
            SET order_number = ?
            WHERE id = ?
            `,
            [
                orderNumber,
                orderId
            ]
        );


        // =========================
        // ORDER ITEMS
        // =========================

        const itemValues =
            items
                .map(item => [

                    orderId,

                    Number(
                        item.foodId ??
                        item.food_id
                    ),

                    Number(
                        item.quantity || 0
                    ),

                    Number(
                        item.price || 0
                    )

                ])
                .filter(item =>
                    Number.isInteger(item[1]) &&
                    item[1] > 0 &&
                    item[2] > 0 &&
                    Number.isFinite(item[3]) &&
                    item[3] >= 0
                );


        if (!itemValues.length) {

            await query(
                "DELETE FROM orders WHERE id = ?",
                [orderId]
            );

            return sendJSON(res, 400, {
                success: false,
                message: "No valid items found in order."
            });
        }


        try {

            await query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    food_id,
                    quantity,
                    price
                )
                VALUES ?
                `,
                [itemValues]
            );

        } catch (error) {

            await query(
                "DELETE FROM orders WHERE id = ?",
                [orderId]
            );

            console.error(
                "ORDER ITEMS ERROR:",
                error
            );

            return sendJSON(res, 500, {
                success: false,
                message: "Unable to save order items."
            });
        }


        // Clear cart
        await query(
            "DELETE FROM cart WHERE user_id = ?",
            [userId]
        ).catch(error => {

            console.error(
                "CLEAR CART ERROR:",
                error
            );

        });


        // Email
        await sendOrderStatusEmail(
            orderId,
            "Pending"
        );


        return sendJSON(res, 201, {

            success: true,

            message:
                "Order placed successfully.",

            orderId,

            orderNumber,

            order: {

                id: orderId,

                orderNumber,

                subtotal,

                deliveryFee,

                gst,

                discount,

                couponCode,

                total: totalAmount,

                paymentMethod,

                status: "Pending"

            }
        });


    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return sendJSON(res, 500, {
            success: false,
            message:
                "Something went wrong while placing order."
        });
    }
};


// =========================
// GET MY ORDERS
// =========================

const getMyOrders = (req, res) => {

    if (!req.session?.userId) {

        return sendJSON(res, 401, {
            success: false,
            message: "Please login first."
        });
    }


    orderModel.getMyOrders(
        req.session.userId,
        (err, rows) => {

            if (err) {

                console.error(
                    "GET MY ORDERS ERROR:",
                    err
                );

                return sendJSON(res, 500, {
                    success: false,
                    message: "Unable to load orders."
                });
            }


            if (!rows?.length) {

                return res.json({
                    success: true,
                    count: 0,
                    orders: []
                });
            }


            const orderMap =
                new Map();


            rows.forEach(row => {

                const id =
                    Number(row.id);


                if (!orderMap.has(id)) {

                    orderMap.set(id, {

                        id,

                        orderNumber:
                            getSafeOrderNumber(
                                row.order_number,
                                id
                            ),

                        user_id:
                            row.user_id,

                        customer_name:
                            row.customer_name,

                        phone:
                            row.phone,

                        address:
                            row.address,

                        city:
                            row.city,

                        state:
                            row.state,

                        pincode:
                            row.pincode,

                        subtotal:
                            Number(
                                row.subtotal || 0
                            ),

                        delivery_fee:
                            Number(
                                row.delivery_fee || 0
                            ),

                        gst:
                            Number(
                                row.gst || 0
                            ),

                        discount:
                            Number(
                                row.discount || 0
                            ),

                        coupon_code:
                            row.coupon_code || null,

                        total_amount:
                            Number(
                                row.total_amount || 0
                            ),

                        payment_method:
                            row.payment_method || "COD",

                        order_status:
                            row.order_status || "Pending",

                        created_at:
                            row.created_at,

                        updated_at:
                            row.updated_at,

                        cancelled_at:
                            row.cancelled_at,

                        items: []

                    });
                }


                if (row.item_id) {

                    orderMap
                        .get(id)
                        .items
                        .push({

                            id:
                                Number(row.item_id),

                            food_id:
                                Number(row.food_id),

                            name:
                                row.food_name ||
                                "Food Item",

                            description:
                                row.food_description || "",

                            image:
                                row.food_image || "",

                            category:
                                row.food_category || "",

                            quantity:
                                Number(
                                    row.quantity || 0
                                ),

                            price:
                                Number(
                                    row.item_price || 0
                                ),

                            item_total:
                                Number(
                                    row.item_price || 0
                                ) *
                                Number(
                                    row.quantity || 0
                                )

                        });
                }

            });


            const orders =
                Array.from(
                    orderMap.values()
                );


            return res.json({

                success: true,

                count:
                    orders.length,

                orders

            });

        }
    );
};


// =========================
// UPDATE ORDER STATUS
// =========================

const updateOrderStatus = async (
    req,
    res
) => {

    if (!req.session?.userId) {

        return sendJSON(res, 401, {
            success: false,
            message: "Please login first."
        });
    }


    const orderId =
        Number(req.params.id);

    const newStatus =
        String(
            req.body?.status || ""
        ).trim();


    const validStatuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out For Delivery",
        "Delivered",
        "Cancelled"
    ];


    if (
        !Number.isInteger(orderId) ||
        orderId <= 0 ||
        !validStatuses.includes(newStatus)
    ) {

        return sendJSON(res, 400, {
            success: false,
            message: "Invalid order status."
        });
    }


    try {

        const rows =
            await query(
                `
                SELECT
                    order_status,
                    order_number
                FROM orders
                WHERE id = ?
                AND user_id = ?
                `,
                [
                    orderId,
                    req.session.userId
                ]
            );


        if (!rows.length) {

            return sendJSON(res, 404, {
                success: false,
                message: "Order not found."
            });
        }


        const oldStatus =
            rows[0].order_status;

        const orderNumber =
            getSafeOrderNumber(
                rows[0].order_number,
                orderId
            );


        if (oldStatus === newStatus) {

            return res.json({

                success: true,

                message:
                    "Status already updated.",

                status: newStatus,

                orderId,

                orderNumber

            });
        }


        await query(
            `
            UPDATE orders
            SET
                order_status = ?,
                cancelled_at =
                    ${
                        newStatus === "Cancelled"
                            ? "NOW()"
                            : "NULL"
                    }
            WHERE id = ?
            AND user_id = ?
            `,
            [
                newStatus,
                orderId,
                req.session.userId
            ]
        );


        await sendOrderStatusEmail(
            orderId,
            newStatus
        );


        return res.json({

            success: true,

            message:
                "Order status updated successfully.",

            status: newStatus,

            orderId,

            orderNumber

        });


    } catch (error) {

        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );

        return sendJSON(res, 500, {
            success: false,
            message:
                "Unable to update order status."
        });
    }
};


// =========================
// GET SINGLE ORDER
// =========================

const getMyOrderById = (
    req,
    res
) => {

    if (!req.session?.userId) {

        return sendJSON(res, 401, {
            success: false,
            message: "Please login first."
        });
    }


    const orderId =
        Number(req.params.id);


    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {

        return sendJSON(res, 400, {
            success: false,
            message: "Invalid order ID."
        });
    }


    orderModel.getOrderById(
        req.session.userId,
        orderId,
        (err, rows) => {

            if (err) {

                console.error(
                    "GET ORDER ERROR:",
                    err
                );

                return sendJSON(res, 500, {
                    success: false,
                    message: "Unable to load order."
                });
            }


            if (!rows?.length) {

                return sendJSON(res, 404, {
                    success: false,
                    message: "Order not found."
                });
            }


            const first =
                rows[0];


            const order = {

                id:
                    Number(first.id),

                orderNumber:
                    getSafeOrderNumber(
                        first.order_number,
                        first.id
                    ),

                user_id:
                    first.user_id,

                customer_name:
                    first.customer_name,

                phone:
                    first.phone,

                address:
                    first.address,

                city:
                    first.city,

                state:
                    first.state,

                pincode:
                    first.pincode,

                subtotal:
                    Number(
                        first.subtotal || 0
                    ),

                delivery_fee:
                    Number(
                        first.delivery_fee || 0
                    ),

                gst:
                    Number(
                        first.gst || 0
                    ),

                discount:
                    Number(
                        first.discount || 0
                    ),

                coupon_code:
                    first.coupon_code || null,

                total_amount:
                    Number(
                        first.total_amount || 0
                    ),

                payment_method:
                    first.payment_method || "COD",

                order_status:
                    first.order_status || "Pending",

                created_at:
                    first.created_at,

                updated_at:
                    first.updated_at,

                cancelled_at:
                    first.cancelled_at,

                items: []

            };


            rows.forEach(row => {

                if (!row.item_id) return;


                order.items.push({

                    id:
                        Number(row.item_id),

                    food_id:
                        Number(row.food_id),

                    name:
                        row.food_name ||
                        "Food Item",

                    description:
                        row.food_description || "",

                    image:
                        row.food_image || "",

                    category:
                        row.food_category || "",

                    quantity:
                        Number(
                            row.quantity || 0
                        ),

                    price:
                        Number(
                            row.item_price || 0
                        ),

                    item_total:
                        Number(
                            row.item_price || 0
                        ) *
                        Number(
                            row.quantity || 0
                        )

                });

            });


            return res.json({

                success: true,

                order

            });

        }
    );
};


// =========================
// EXPORT
// =========================

module.exports = {

    createOrder,

    getMyOrders,

    getMyOrderById,

    updateOrderStatus,

    sendOrderStatusEmail

};