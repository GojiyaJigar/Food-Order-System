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
// Cart Me Item Jodein
// ==========================
router.post("/cart/add", addToCart);
// ==========================
// User Cart Prapt Karein
// ==========================
router.get("/cart", getCartItems);
// ==========================
// Quantity Badhayein
// ==========================
router.put("/cart/increase/:cartId", increaseQuantity);
// ==========================
// Quantity Ghatayein
// ==========================
router.put("/cart/decrease/:cartId", decreaseQuantity);
// ==========================
// Cart Item Hataayein
// ==========================
router.delete("/cart/:cartId", removeCartItem);
module.exports = router;