const express = require("express");

const router = express.Router();


const {
    registerUser,
    loginUser,
    checkAuth,
    logoutUser,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");


// REGISTER
router.post(
    "/register",
    registerUser
);


// LOGIN
router.post(
    "/login",
    loginUser
);


// CHECK AUTH
router.get(
    "/check-auth",
    checkAuth
);


// LOGOUT
router.post(
    "/logout",
    logoutUser
);


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