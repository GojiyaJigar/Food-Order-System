const db = require("../config/db");
const orderModel = require("../models/orderModel");
const settingsModel = require("../models/admin/settingsModel");
const offerModel = require("../models/offerModel");


// =====================================================
// HELPERS
// =====================================================

const isLoggedIn = req =>
    req.session &&
    req.session.userId !== undefined &&
    req.session.userId !== null;


const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) =>
            err ? reject(err) : resolve(result)
        );
    });


const modelQuery = (fn, ...args) =>
    new Promise((resolve, reject) => {
        fn(...args, (err, result) =>
            err ? reject(err) : resolve(result)
        );
    });


const addItems = rows => {

    const map = new Map();

    rows.forEach(row => {

        const orderId = Number(row.id);

        if (!map.has(orderId)) {

            map.set(orderId, {
                id: orderId,
                user_id: row.user_id,
                customer_name: row.customer_name,
                phone: row.phone,
                address: row.address,
                city: row.city,
                state: row.state,
                pincode: row.pincode,

                subtotal: Number(row.subtotal || 0),
                delivery_fee: Number(row.delivery_fee || 0),
                gst: Number(row.gst || 0),
                discount: Number(row.discount || 0),

                coupon_code: row.coupon_code || null,
                total_amount: Number(row.total_amount || 0),

                payment_method:
                    row.payment_method || "COD",

                order_status:
                    row.order_status || "Pending",

                created_at: row.created_at,
                updated_at: row.updated_at,
                cancelled_at: row.cancelled_at,

                items: []
            });

        }

        if (row.item_id) {

            map.get(orderId).items.push({
                id: Number(row.item_id),
                food_id: Number(row.food_id),

                name:
                    row.food_name || "Food Item",

                description:
                    row.food_description || "",

                image:
                    row.food_image || "",

                category:
                    row.food_category || "",

                quantity:
                    Number(row.quantity || 0),

                price:
                    Number(row.item_price || 0),

                item_total:
                    Number(row.item_price || 0) *
                    Number(row.quantity || 0)
            });

        }

    });

    return [...map.values()];
};


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = async (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    const userId = req.session.userId;
    const data = req.body || {};
    const items = Array.isArray(data.items) ? data.items : [];

    try {

        // =================================================
        // SETTINGS
        // =================================================

        const settings =
            await settingsModel.getOrCreateSettings();

        if (!settings) {

            return res.status(500).json({
                success: false,
                message: "Application settings not found."
            });

        }


        // =================================================
        // CUSTOMER
        // =================================================

        const customerName =
            String(
                data.customerName ||
                data.customer_name ||
                ""
            ).trim();

        const customerPhone =
            String(
                data.customerPhone ||
                data.phone ||
                ""
            ).trim();

        const customerAddress =
            String(
                data.customerAddress ||
                data.address ||
                ""
            ).trim();

        const customerCity =
            String(
                data.customerCity ||
                data.city ||
                ""
            ).trim();

        const customerState =
            String(
                data.customerState ||
                data.state ||
                ""
            ).trim();

        const customerPincode =
            String(
                data.customerPincode ||
                data.pincode ||
                ""
            ).trim();


        // =================================================
        // VALIDATION
        // =================================================

        if (!customerName)
            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });

        if (!customerPhone)
            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });

        if (!customerAddress)
            return res.status(400).json({
                success: false,
                message: "Delivery address is required."
            });

        if (!customerCity)
            return res.status(400).json({
                success: false,
                message: "City is required."
            });

        if (!items.length)
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });


        // =================================================
        // PAYMENT
        // =================================================

        const paymentMethod =
            String(
                data.paymentMethod ||
                data.payment_method ||
                "COD"
            )
                .trim()
                .toUpperCase();

        const payments = {
            COD: Number(settings.payment_cod) === 1,
            UPI: Number(settings.payment_upi) === 1,
            CARD: Number(settings.payment_card) === 1
        };

        if (!payments[paymentMethod]) {

            return res.status(400).json({
                success: false,
                message:
                    `${paymentMethod} payment is currently disabled.`
            });

        }


        // =================================================
        // SUBTOTAL
        // =================================================

        const subtotal =
            Number(data.subtotal || 0);

        if (!Number.isFinite(subtotal) || subtotal <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid order subtotal."
            });

        }


        // =================================================
        // MINIMUM ORDER
        // =================================================

        const minimumOrder =
            Number(settings.minimum_order || 0);

        if (
            minimumOrder > 0 &&
            subtotal < minimumOrder
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `Minimum order amount is ₹${minimumOrder.toFixed(2)}.`
            });

        }


        // =================================================
        // COUPON
        // =================================================

        const couponCode =
            String(
                data.couponCode ||
                data.coupon_code ||
                ""
            )
                .trim()
                .toUpperCase() || null;


        let discount = 0;
        let freeDeliveryCoupon = false;
        let offer = null;


        if (couponCode) {

            if (Number(settings.offers_enabled) !== 1) {

                return res.status(400).json({
                    success: false,
                    message: "Offers are currently disabled."
                });

            }

            if (Number(settings.coupons_enabled) !== 1) {

                return res.status(400).json({
                    success: false,
                    message: "Coupons are currently disabled."
                });

            }


            offer =
                await modelQuery(
                    offerModel.getOfferByCode,
                    couponCode
                );


            if (!offer) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon code."
                });

            }


            if (Number(offer.is_active) !== 1) {

                return res.status(400).json({
                    success: false,
                    message: "This coupon is inactive."
                });

            }


            const now = Date.now();
            const start = new Date(offer.start_date).getTime();
            const end = new Date(offer.end_date).getTime();

            if (now < start) {

                return res.status(400).json({
                    success: false,
                    message: "This coupon is not active yet."
                });

            }

            if (now > end) {

                return res.status(400).json({
                    success: false,
                    message: "This coupon has expired."
                });

            }


            if (
                offer.usage_limit !== null &&
                Number(offer.used_count) >=
                Number(offer.usage_limit)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This coupon usage limit has been reached."
                });

            }


            const offerMin =
                Number(offer.min_order_amount || 0);

            if (subtotal < offerMin) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Minimum order amount is ₹${offerMin.toFixed(2)}.`
                });

            }


            const type =
                String(
                    offer.discount_type || ""
                ).toLowerCase();

            const value =
                Number(
                    offer.discount_value || 0
                );


            if (type === "percentage") {

                discount =
                    subtotal * value / 100;

            }
            else if (type === "flat") {

                discount = value;

            }
            else if (type === "free_delivery") {

                if (
                    Number(
                        settings.free_delivery_offers
                    ) !== 1
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Free delivery offers are currently disabled."
                    });

                }

                freeDeliveryCoupon = true;

            }
            else {

                return res.status(400).json({
                    success: false,
                    message: "Invalid coupon type."
                });

            }


            if (
                offer.max_discount !== null &&
                Number(offer.max_discount) > 0
            ) {

                discount =
                    Math.min(
                        discount,
                        Number(offer.max_discount)
                    );

            }


            discount =
                Number(
                    Math.max(
                        0,
                        Math.min(discount, subtotal)
                    ).toFixed(2)
                );

        }


        // =================================================
        // DELIVERY + GST
        // =================================================

        const freeDeliveryAbove =
            Number(settings.free_delivery_above || 0);

        const configuredDeliveryFee =
            Number(settings.delivery_fee || 0);

        let deliveryFee =
            freeDeliveryCoupon
                ? 0
                : configuredDeliveryFee;

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
                (subtotal * gstRate).toFixed(2)
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


        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid order total."
            });

        }


        // =================================================
        // VALID ORDER ITEMS
        // =================================================

        const itemValues = items
            .map(item => {

                const foodId =
                    Number(
                        item.foodId ??
                        item.food_id
                    );

                const quantity =
                    Number(item.quantity || 0);

                const price =
                    Number(item.price || 0);

                return (
                    Number.isInteger(foodId) &&
                    foodId > 0 &&
                    Number.isFinite(quantity) &&
                    quantity > 0 &&
                    Number.isFinite(price) &&
                    price >= 0
                )
                    ? [
                        foodId,
                        quantity,
                        price
                    ]
                    : null;

            })
            .filter(Boolean);


        if (!itemValues.length) {

            return res.status(400).json({
                success: false,
                message: "No valid items found in order."
            });

        }


        // =================================================
        // CREATE ORDER
        // =================================================

        const orderResult =
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
                    customerPhone,
                    customerAddress,
                    customerCity,
                    customerState,
                    customerPincode,
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
            orderResult.insertId;


        // =================================================
        // ORDER ITEMS
        // =================================================

        const finalItems =
            itemValues.map(item => [
                orderId,
                item[0],
                item[1],
                item[2]
            ]);


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
                [finalItems]
            );

        }
        catch (itemError) {

            await query(
                `DELETE FROM orders WHERE id = ?`,
                [orderId]
            );

            throw itemError;

        }


        // =================================================
        // INCREASE COUPON USAGE
        // =================================================

        if (offer) {

            const result =
                await modelQuery(
                    offerModel.increaseUsedCount,
                    offer.id
                );

            if (!result || result.affectedRows !== 1) {

                console.error(
                    "COUPON USAGE COUNT NOT UPDATED:",
                    offer.id
                );

            }

        }


        // =================================================
        // CLEAR CART
        // =================================================

        try {

            await query(
                `DELETE FROM cart WHERE user_id = ?`,
                [userId]
            );

        }
        catch (cartError) {

            console.error(
                "CART CLEAR ERROR:",
                cartError
            );

        }


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully.",

            orderId,

            order: {

                id: orderId,
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

    }
    catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.sqlMessage ||
                "Unable to place order."

        });

    }

};


// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = async (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    try {

        const rows =
            await modelQuery(
                orderModel.getMyOrders,
                req.session.userId
            );

        const orders =
            rows?.length
                ? addItems(rows)
                : [];

        return res.json({
            success: true,
            count: orders.length,
            orders
        });

    }
    catch (error) {

        console.error(
            "GET MY ORDERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load orders."
        });

    }

};


// =====================================================
// GET SINGLE ORDER
// =====================================================

const getMyOrderById = async (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({
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

        return res.status(400).json({
            success: false,
            message: "Invalid order ID."
        });

    }

    try {

        const rows =
            await modelQuery(
                orderModel.getOrderById,
                req.session.userId,
                orderId
            );

        if (!rows?.length) {

            return res.status(404).json({
                success: false,
                message: "Order not found."
            });

        }

        const order =
            addItems(rows)[0];

        return res.json({
            success: true,
            order
        });

    }
    catch (error) {

        console.error(
            "GET ORDER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load order."
        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    createOrder,
    getMyOrders,
    getMyOrderById
};