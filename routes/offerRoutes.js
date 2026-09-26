const express = require("express");
const router = express.Router();
const {
    getOffers,
    getOffer,
    applyCoupon
} = require("../controllers/offerController");
// =====================================================
// SABHI ACTIVE OFFERS PRAPT KAREIN
// =====================================================
router.get(
    "/api/offers",
    getOffers
);
// =====================================================
// EK OFFER PRAPT KAREIN
// =====================================================
router.get(
    "/api/offers/:id",
    getOffer
);
// =====================================================
// COUPON APPLY KAREIN
// =====================================================
router.post(
    "/api/offers/apply",
    applyCoupon
);
// =====================================================
// EXPORT
// =====================================================
module.exports = router;