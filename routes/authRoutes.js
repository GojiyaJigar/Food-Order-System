const express = require("express");
const router = express.Router();

// Auth Controller functions
const {
    registerUser,
    loginUser,
    checkAuth,
    logoutUser
} = require("../controllers/authController");

// Password Reset Controller functions (Agar alag file hai)
const {
    forgotPassword,
    resetPassword
} = require("../controllers/passwordResetController");


// REGISTER
router.post("/register", registerUser);

// LOGIN
router.post("/login", loginUser);

// CHECK AUTH
router.get("/check-auth", checkAuth);

// LOGOUT
router.post("/logout", logoutUser);

// FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// RESET PASSWORD
router.post("/reset-password", resetPassword);


module.exports = router;