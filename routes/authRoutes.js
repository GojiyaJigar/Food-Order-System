const express =
    require("express");

const router =
    express.Router();


const {
    registerUser,
    loginUser,
    checkAuth,
    logoutUser
} = require(
    "../controllers/authController"
);


// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    registerUser
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginUser
);


// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    logoutUser
);


// =====================================================
// CHECK AUTH
// =====================================================

router.get(
    "/check-auth",
    checkAuth
);


module.exports =
    router;