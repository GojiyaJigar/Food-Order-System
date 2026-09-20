const express = require("express");

const router = express.Router();

const {
    forgotPassword,
    resetPassword
} = require("../controllers/passwordResetController");


// FORGOT PASSWORD
router.post(
    "/forgot-password",
    forgotPassword
);


// RESET PASSWORD
router.post(
    "/reset-password",
    resetPassword
);


module.exports = router;