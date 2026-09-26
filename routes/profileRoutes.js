const express = require("express");
const router = express.Router();
const {
    getProfile,
    createProfile,
    updateProfile
} = require("../controllers/profileController");
// =====================================================
// PROFILE PRAPT KAREIN
// =====================================================
router.get(
    "/api/profile",
    getProfile
);
// =====================================================
// PROFILE BANAYEIN
// =====================================================
router.post(
    "/api/profile",
    createProfile
);
// =====================================================
// PROFILE UPDATE KAREIN
// =====================================================
router.put(
    "/api/profile",
    updateProfile
);
// =====================================================
// EXPORT
// =====================================================
module.exports = router;