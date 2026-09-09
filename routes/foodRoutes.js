const express = require("express");

const router = express.Router();

const {
    getMenu
} = require("../controllers/foodController");


/* =====================================================
   MENU
===================================================== */

router.get(
    "/api/menu",
    getMenu
);


module.exports = router;