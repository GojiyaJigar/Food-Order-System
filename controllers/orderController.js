const db = require("../config/db");
const orderModel = require("../models/orderModel");


// =====================================================
// CREATE ORDER
// =====================================================

const createOrder = (req, res) => {

    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }


    const userId = req.session.userId;

    const data = req.body || {};


    console.log("ORDER DATA:", data);


    // =================================================
    // CUSTOMER DATA
    // =================================================

    const customerName =
        data.customerName ||
        data.customer_name ||
        "";

    const customerPhone =
        data.customerPhone ||
        data.phone ||
        "";

    const customerAddress =
        data.customerAddress ||
        data.address ||
        "";

    const customerCity =
        data.customerCity ||
        data.city ||
        "";

    const customerState =
        data.customerState ||
        data.state ||
        "";

    const customerPincode =
        data.customerPincode ||
        data.pincode ||
        "";


    // =================================================
    // PAYMENT
    // =================================================

    const paymentMethod =
        data.paymentMethod ||
        data.payment_method ||
        "COD";


    // =================================================
    // BILLING
    // =================================================

    const subtotal =
        Number(
            data.subtotal || 0
        );

    const deliveryFee =
        Number(
            data.deliveryFee ??
            data.delivery_fee ??
            0
        );

    const gst =
        Number(
            data.gst || 0
        );

    const discount =
        Number(
            data.discount || 0
        );

    const totalAmount =
        Number(
            data.total ??
            data.total_amount ??
            0
        );


    // =================================================
    // COUPON
    // =================================================

    const couponCode =
        data.couponCode ||
        data.coupon_code ||
        null;


    // =================================================
    // ITEMS
    // =================================================

    const items =
        Array.isArray(data.items)
            ? data.items
            : [];


    // =================================================
    // VALIDATION
    // =================================================

    if (!customerName.trim()) {

        return res.status(400).json({
            success: false,
            message: "Customer name is required."
        });

    }


    if (!customerPhone.trim()) {

        return res.status(400).json({
            success: false,
            message: "Phone number is required."
        });

    }


    if (!customerAddress.trim()) {

        return res.status(400).json({
            success: false,
            message: "Delivery address is required."
        });

    }


    if (!customerCity.trim()) {

        return res.status(400).json({
            success: false,
            message: "City is required."
        });

    }


    if (!items.length) {

        return res.status(400).json({
            success: false,
            message: "Your cart is empty."
        });

    }


    if (
        Number.isNaN(totalAmount) ||
        totalAmount <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid order total."
        });

    }


    // =================================================
    // INSERT ORDER
    //
    // IMPORTANT:
    // Your orders table does NOT have address_id.
    // So we intentionally do NOT insert address_id.
    // =================================================

    const orderSql = `

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

        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,

            ?,
            ?,
            ?,
            ?,
            ?,

            ?,

            ?,
            'Pending'
        )

    `;


    const orderValues = [

        userId,

        customerName.trim(),

        customerPhone.trim(),

        customerAddress.trim(),

        customerCity.trim(),

        customerState.trim(),

        customerPincode.trim(),


        subtotal,

        deliveryFee,

        gst,

        discount,

        couponCode,


        totalAmount,


        paymentMethod

    ];


    db.query(
        orderSql,
        orderValues,
        (orderError, orderResult) => {

            if (orderError) {

                console.error(
                    "ORDER INSERT ERROR:",
                    orderError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        orderError.sqlMessage ||
                        "Unable to place order."

                });

            }


            const orderId =
                orderResult.insertId;


            console.log(
                "ORDER CREATED:",
                orderId
            );


            // =================================================
            // INSERT ORDER ITEMS
            // =================================================

            const itemValues = [];


            items.forEach(item => {

                const foodId =
                    Number(
                        item.foodId ??
                        item.food_id
                    );

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                const price =
                    Number(
                        item.price || 0
                    );


                if (
                    foodId &&
                    quantity > 0
                ) {

                    itemValues.push([

                        orderId,

                        foodId,

                        quantity,

                        price

                    ]);

                }

            });


            if (!itemValues.length) {

                // -----------------------------------------
                // DELETE EMPTY ORDER
                // -----------------------------------------

                db.query(
                    `
                        DELETE FROM orders
                        WHERE id = ?
                    `,
                    [orderId],
                    () => {}
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "No valid items found in order."

                });

            }


            const itemSql = `

                INSERT INTO order_items
                (
                    order_id,
                    food_id,
                    quantity,
                    price
                )

                VALUES ?

            `;


            db.query(
                itemSql,
                [itemValues],
                (itemError) => {

                    if (itemError) {

                        console.error(
                            "ORDER ITEMS INSERT ERROR:",
                            itemError
                        );


                        // ---------------------------------
                        // REMOVE ORDER IF ITEMS FAIL
                        // ---------------------------------

                        db.query(
                            `
                                DELETE FROM orders
                                WHERE id = ?
                            `,
                            [orderId],
                            () => {}
                        );


                        return res.status(500).json({

                            success: false,

                            message:
                                itemError.sqlMessage ||
                                "Unable to save order items."

                        });

                    }


                    // =================================================
                    // CLEAR CART
                    // =================================================

                    db.query(
                        `
                            DELETE FROM cart
                            WHERE user_id = ?
                        `,
                        [userId],
                        (cartError) => {

                            if (cartError) {

                                console.error(
                                    "CART CLEAR ERROR:",
                                    cartError
                                );

                                // -------------------------------------
                                // Order is already successfully created.
                                // So DON'T fail the order because cart
                                // clearing failed.
                                // -------------------------------------

                            }


                            // =================================================
                            // SUCCESS
                            // =================================================

                            console.log(
                                "ORDER SUCCESS:",
                                orderId
                            );


                            return res.status(201).json({

                                success: true,

                                message:
                                    "Order placed successfully.",

                                orderId:
                                    orderId,

                                order: {

                                    id:
                                        orderId,

                                    subtotal:
                                        subtotal,

                                    deliveryFee:
                                        deliveryFee,

                                    gst:
                                        gst,

                                    discount:
                                        discount,

                                    couponCode:
                                        couponCode,

                                    total:
                                        totalAmount,

                                    paymentMethod:
                                        paymentMethod,

                                    status:
                                        "Pending"

                                }

                            });

                        }
                    );

                }
            );

        }
    );

};



// =====================================================
// GET MY ORDERS
// =====================================================

const getMyOrders = (req, res) => {

    if (!req.session.userId) {

        return res.status(401).json({

            success: false,

            message:
                "Please login first."

        });

    }


    const userId =
        req.session.userId;


    orderModel.getMyOrders(
        userId,
        (err, rows) => {

            if (err) {

                console.error(
                    "GET MY ORDERS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to load orders."

                });

            }


            if (
                !rows ||
                rows.length === 0
            ) {

                return res.json({

                    success: true,

                    count: 0,

                    orders: []

                });

            }


            // =================================================
            // GROUP ORDERS
            // =================================================

            const orderMap =
                new Map();


            rows.forEach(row => {

                const orderId =
                    Number(row.id);


                if (
                    !orderMap.has(orderId)
                ) {

                    orderMap.set(
                        orderId,
                        {

                            id:
                                orderId,

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
                                row.coupon_code ||
                                null,

                            total_amount:
                                Number(
                                    row.total_amount || 0
                                ),


                            payment_method:
                                row.payment_method ||
                                "COD",


                            order_status:
                                row.order_status ||
                                "Pending",


                            created_at:
                                row.created_at,

                            updated_at:
                                row.updated_at,

                            cancelled_at:
                                row.cancelled_at,


                            items: []

                        }
                    );

                }


                // =================================================
                // ITEM
                // =================================================

                if (row.item_id) {

                    const order =
                        orderMap.get(
                            orderId
                        );


                    order.items.push({

                        id:
                            Number(
                                row.item_id
                            ),

                        food_id:
                            Number(
                                row.food_id
                            ),

                        name:
                            row.food_name ||
                            "Food Item",

                        description:
                            row.food_description ||
                            "",

                        image:
                            row.food_image ||
                            "",

                        category:
                            row.food_category ||
                            "",

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

                orders:
                    orders

            });

        }
    );

};



// =====================================================
// GET SINGLE ORDER
// =====================================================

const getMyOrderById = (
    req,
    res
) => {

    if (!req.session.userId) {

        return res.status(401).json({

            success: false,

            message:
                "Please login first."

        });

    }


    const userId =
        req.session.userId;


    const orderId =
        Number(
            req.params.id
        );


    if (
        !orderId ||
        Number.isNaN(orderId)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order ID."

        });

    }


    orderModel.getOrderById(
        userId,
        orderId,
        (err, rows) => {

            if (err) {

                console.error(
                    "GET ORDER ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to load order."

                });

            }


            if (
                !rows ||
                rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found."

                });

            }


            const first =
                rows[0];


            const order = {

                id:
                    Number(
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
                    first.coupon_code ||
                    null,

                total_amount:
                    Number(
                        first.total_amount || 0
                    ),


                payment_method:
                    first.payment_method ||
                    "COD",


                order_status:
                    first.order_status ||
                    "Pending",


                created_at:
                    first.created_at,

                updated_at:
                    first.updated_at,

                cancelled_at:
                    first.cancelled_at,


                items: []

            };


            rows.forEach(row => {

                if (!row.item_id) {
                    return;
                }


                order.items.push({

                    id:
                        Number(
                            row.item_id
                        ),

                    food_id:
                        Number(
                            row.food_id
                        ),

                    name:
                        row.food_name ||
                        "Food Item",

                    description:
                        row.food_description ||
                        "",

                    image:
                        row.food_image ||
                        "",

                    category:
                        row.food_category ||
                        "",

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

                order:
                    order

            });

        }
    );

};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createOrder,

    getMyOrders,

    getMyOrderById

};