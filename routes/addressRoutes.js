const express = require("express");

const router = express.Router();


const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} = require(
    "../controllers/addressController"
);


// =====================================================
// GET ADDRESSES
// =====================================================

router.get(
    "/api/addresses",
    getAddresses
);


// =====================================================
// CREATE ADDRESS
// =====================================================

router.post(
    "/api/addresses",
    createAddress
);


// =====================================================
// UPDATE ADDRESS
// =====================================================

router.put(
    "/api/addresses/:id",
    updateAddress
);


// =====================================================
// DELETE ADDRESS
// =====================================================

router.delete(
    "/api/addresses/:id",
    deleteAddress
);


module.exports = router;