const checkoutModel = require("../models/checkoutModel");

// ==========================
// Place Order
// ==========================
const placeOrder = (req, res) => {

    // Check Login
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;
const {
    paymentMethod = "COD",
    customerName,
    phone,
    address,
    city,
    state,
    pincode
} = req.body;

    // Get Cart Items
    checkoutModel.getCheckoutItems(userId, (err, cartItems) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        // Calculate Total
        let totalAmount = 0;

        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // Create Order
      checkoutModel.createOrder(
    userId,
    customerName,
    phone,
    address,
    city,
    state,
    pincode,
    totalAmount,
    paymentMethod,
    (err, orderResult) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to create order."
                    });
                }

                const orderId = orderResult.insertId;

                // Save Order Items
                checkoutModel.saveOrderItems(
                    orderId,
                    cartItems,
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Failed to save order items."
                            });
                        }

                        // Clear Cart
                        checkoutModel.clearCart(userId, (err) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to clear cart."
                                });
                            }

                            return res.json({
                                success: true,
                                message: "Order placed successfully!",
                                orderId: orderId
                            });

                        });

                    }
                );

            }
        );

    });

};
// ==========================
// Get Checkout Data
// ==========================
const getCheckout = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;

    checkoutModel.getCheckoutItems(userId, (err, items) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        let total = 0;

        items.forEach(item => {
            total += item.price * item.quantity;
        });

        res.json({
            success: true,
            items,
            total
        });

    });

};

module.exports = {
    placeOrder,
    getCheckout

};