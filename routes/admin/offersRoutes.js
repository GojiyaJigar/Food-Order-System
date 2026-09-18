const express = require("express");
const path = require("path");

const router = express.Router();

const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");

const {
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    updateOfferStatus,
    deleteOffer
} = require("../../controllers/admin/offersController");


/* =========================================================
   OFFERS PAGE
   GET /admin/offers
========================================================= */

router.get(
    "/offers",
    requireAdmin,
    (req, res) => {
        res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/offers.html"
            )
        );
    }
);


/* =========================================================
   GET ALL OFFERS
   GET /admin/api/offers
========================================================= */

router.get(
    "/api/offers",
    requireAdminAPI,
    getAllOffers
);


/* =========================================================
   GET SINGLE OFFER
   GET /admin/api/offers/:id
========================================================= */

router.get(
    "/api/offers/:id",
    requireAdminAPI,
    getOfferById
);


/* =========================================================
   CREATE OFFER
   POST /admin/api/offers
========================================================= */

router.post(
    "/api/offers",
    requireAdminAPI,
    createOffer
);


/* =========================================================
   UPDATE OFFER
   PUT /admin/api/offers/:id
========================================================= */

router.put(
    "/api/offers/:id",
    requireAdminAPI,
    updateOffer
);


/* =========================================================
   ACTIVATE / DEACTIVATE
   PATCH /admin/api/offers/:id/status
========================================================= */

router.patch(
    "/api/offers/:id/status",
    requireAdminAPI,
    updateOfferStatus
);


/* =========================================================
   DELETE OFFER
   DELETE /admin/api/offers/:id
========================================================= */

router.delete(
    "/api/offers/:id",
    requireAdminAPI,
    deleteOffer
);


module.exports = router;