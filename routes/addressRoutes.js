const express = require("express");

const router = express.Router();

const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");


/* =====================================================
   GET ALL ADDRESSES
   GET /api/addresses
===================================================== */

router.get(
    "/api/addresses",
    getAddresses
);


/* =====================================================
   CREATE ADDRESS
   POST /api/addresses
===================================================== */

router.post(
    "/api/addresses",
    createAddress
);


/* =====================================================
   UPDATE ADDRESS
   PUT /api/addresses/:id
===================================================== */

router.put(
    "/api/addresses/:id",
    updateAddress
);


/* =====================================================
   DELETE ADDRESS
   DELETE /api/addresses/:id
===================================================== */

router.delete(
    "/api/addresses/:id",
    deleteAddress
);


module.exports = router;