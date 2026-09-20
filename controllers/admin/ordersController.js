"use strict";

const ordersModel =
    require("../../models/admin/ordersModel");

const {
    sendOrderStatusEmail
} = require("../orderController");


// =========================
// ORDER NUMBER
// =========================

const createOrderNumber = (id) => {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `JGO-${year}${month}${day}-${String(id).padStart(6, "0")}`;
};


const getSafeOrderNumber = (
    orderNumber,
    id
) => {

    return (
        orderNumber ||
        createOrderNumber(id)
    );
};


// =========================
// GET ALL ORDERS
// =========================

const getAllOrders = (
    req,
    res
) => {

    ordersModel.getAllOrders(
        (err, orders) => {

            if (err) {

                console.error(
                    "ADMIN ORDERS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load orders."
                });
            }


            const formattedOrders =
                (orders || []).map(order => ({

                    ...order,

                    orderNumber:
                        getSafeOrderNumber(
                            order.order_number,
                            order.id
                        ),

                    items_count:
                        Number(
                            order.items_count || 0
                        )

                }));


            return res.json({

                success: true,

                count:
                    formattedOrders.length,

                orders:
                    formattedOrders

            });
        }
    );
};


// =========================
// GET SINGLE ORDER
// =========================

const getOrderById = (
    req,
    res
) => {

    const orderId =
        Number(req.params.id);


    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order ID."

        });
    }


    ordersModel.getOrderById(
        orderId,
        (err, rows) => {

            if (err) {

                console.error(
                    "ADMIN SINGLE ORDER ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to load order details."

                });
            }


            if (!rows || !rows.length) {

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
                        Number(row.item_id),

                    food_id:
                        Number(row.food_id),

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

                order

            });
        }
    );
};


// =========================
// UPDATE STATUS
// =========================

const updateOrderStatus = async (
    req,
    res
) => {

    const orderId =
        Number(req.params.id);

    const status =
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
        !validStatuses.includes(status)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order status."

        });
    }


    ordersModel.updateOrderStatus(
        orderId,
        status,
        async (err) => {

            if (err) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to update order status."

                });
            }


            try {

                await sendOrderStatusEmail(
                    orderId,
                    status
                );

            } catch (error) {

                console.error(
                    "STATUS EMAIL ERROR:",
                    error
                );
            }


            return res.json({

                success: true,

                message:
                    "Order status updated successfully.",

                status,

                orderId

            });
        }
    );
};


module.exports = {

    getAllOrders,

    getOrderById,

    updateOrderStatus

};