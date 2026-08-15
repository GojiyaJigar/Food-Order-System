const express = require("express");
const router = express.Router();

const {
    addToCart,
    getCartItems,
    removeCartItem,
    increaseQuantity,
    decreaseQuantity
} = require("../controllers/cartController");

// ==========================
// Add Item To Cart
// ==========================
router.post("/cart/add", addToCart);

// ==========================
// Get User Cart
// ==========================
router.get("/cart", getCartItems);

// ==========================
// Increase Quantity
// ==========================
router.put("/cart/increase/:cartId", increaseQuantity);

// ==========================
// Decrease Quantity
// ==========================
router.put("/cart/decrease/:cartId", decreaseQuantity);

// ==========================
// Remove Cart Item
// ==========================
router.delete("/cart/:cartId", removeCartItem);

module.exports = router;