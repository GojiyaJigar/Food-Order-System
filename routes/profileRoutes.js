const express = require("express");

const router = express.Router();


const {
    getProfile,
    createProfile,
    updateProfile
} = require("../controllers/profileController");


// =====================================================
// GET PROFILE
// =====================================================

router.get(
    "/api/profile",
    getProfile
);


// =====================================================
// CREATE PROFILE
// =====================================================

router.post(
    "/api/profile",
    createProfile
);


// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
    "/api/profile",
    updateProfile
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;