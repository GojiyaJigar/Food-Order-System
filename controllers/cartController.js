const cartModel = require("../models/cartModel");

// ==========================
// Add Item To Cart
// ==========================
const addToCart = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;
    const { foodId } = req.body;

    if (!foodId) {
        return res.status(400).json({
            success: false,
            message: "Food ID is required."
        });
    }

    cartModel.addToCart(userId, foodId, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        return res.json({
            success: true,
            message: "Item added to cart successfully."
        });

    });

};

// ==========================
// Get User Cart
// ==========================
const getCartItems = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;

    cartModel.getCartItems(userId, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        return res.json({
            success: true,
            cart: result
        });

    });

};

// ==========================
// Increase Quantity
// ==========================
const increaseQuantity = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const { cartId } = req.params;

    cartModel.increaseQuantity(cartId, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        return res.json({
            success: true,
            message: "Quantity increased."
        });

    });

};

// ==========================
// Decrease Quantity
// ==========================
const decreaseQuantity = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const { cartId } = req.params;

    cartModel.decreaseQuantity(cartId, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        return res.json({
            success: true,
            message: "Quantity decreased."
        });

    });

};

// ==========================
// Remove Cart Item
// ==========================
const removeCartItem = (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const { cartId } = req.params;

    cartModel.removeCartItem(cartId, (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        return res.json({
            success: true,
            message: "Item removed successfully."
        });

    });

};

// ==========================
// Export
// ==========================
module.exports = {
    addToCart,
    getCartItems,
    removeCartItem,
    increaseQuantity,
    decreaseQuantity
};