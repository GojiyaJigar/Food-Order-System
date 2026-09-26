"use strict";
const express = require("express");
const router =
    express.Router();
const {
    getAddresses,
    getDefaultAddress,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");
// =====================================================
// SABHI USER ADDRESSES PRAPT KAREIN
// GET /api/addresses
// =====================================================
router.get(
    "/api/addresses",
    getAddresses
);
// =====================================================
// DEFAULT USER ADDRESS PRAPT KAREIN
// GET /api/addresses/default
// =====================================================
router.get(
    "/api/addresses/default",
    getDefaultAddress
);
// =====================================================
// NAYA ADDRESS BANAYEIN
// POST /api/addresses
// =====================================================
router.post(
    "/api/addresses",
    createAddress
);
// =====================================================
// ADDRESS UPDATE KAREIN
// PUT /api/addresses/:id
// =====================================================
router.put(
    "/api/addresses/:id",
    updateAddress
);
// =====================================================
// ADDRESS DELETE KAREIN
// DELETE /api/addresses/:id
// =====================================================
router.delete(
    "/api/addresses/:id",
    deleteAddress
);
module.exports = router;