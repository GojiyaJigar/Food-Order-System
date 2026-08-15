const express = require("express");

const router = express.Router();

const { getRestaurantMenu } = require("../controllers/foodController");

// Get Restaurant Menu
router.get("/restaurant/:id/menu", getRestaurantMenu);

module.exports = router;