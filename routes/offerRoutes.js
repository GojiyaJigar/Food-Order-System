const express = require("express");

const router = express.Router();

const {
    getOffers,
    getOffer,
    applyCoupon
} = require("../controllers/offerController");


// =====================================================
// GET ALL ACTIVE OFFERS
// =====================================================

router.get(
    "/api/offers",
    getOffers
);


// =====================================================
// GET SINGLE OFFER
// =====================================================

router.get(
    "/api/offers/:id",
    getOffer
);


// =====================================================
// APPLY COUPON
// =====================================================

router.post(
    "/api/offers/apply",
    applyCoupon
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;