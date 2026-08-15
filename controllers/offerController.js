const offerModel = require("../models/offerModel");


// =====================================================
// GET ALL OFFERS
// =====================================================

const getOffers = (req, res) => {

    offerModel.getAllOffers((err, offers) => {

        if (err) {

            console.error(
                "GET OFFERS CONTROLLER ERROR:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Unable to load offers."
            });

        }


        return res.json({

            success: true,

            offers: offers || []

        });

    });

};


// =====================================================
// GET SINGLE OFFER
// =====================================================

const getOffer = (req, res) => {

    const offerId =
        Number(req.params.id);


    if (
        !Number.isInteger(offerId) ||
        offerId <= 0
    ) {

        return res.status(400).json({

            success: false,
            message: "Invalid offer ID."

        });

    }


    offerModel.getOfferById(
        offerId,
        (err, offer) => {

            if (err) {

                console.error(
                    "GET OFFER CONTROLLER ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,
                    message: "Unable to load offer."

                });

            }


            if (!offer) {

                return res.status(404).json({

                    success: false,
                    message: "Offer not found."

                });

            }


            return res.json({

                success: true,
                offer: offer

            });

        }
    );

};


// =====================================================
// APPLY / VALIDATE COUPON
// =====================================================

const applyCoupon = (req, res) => {

    const body =
        req.body || {};


    const code =
        String(
            body.code || ""
        )
        .trim()
        .toUpperCase();


    const subtotal =
        Number(
            body.subtotal || 0
        );


    // =================================================
    // VALIDATION
    // =================================================

    if (!code) {

        return res.status(400).json({

            success: false,
            message: "Please enter a coupon code."

        });

    }


    if (
        !Number.isFinite(subtotal) ||
        subtotal < 0
    ) {

        return res.status(400).json({

            success: false,
            message: "Invalid order amount."

        });

    }


    // =================================================
    // FIND COUPON
    // =================================================

    offerModel.getOfferByCode(
        code,
        (err, offer) => {

            if (err) {

                console.error(
                    "COUPON LOOKUP ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,
                    message: "Unable to verify coupon."

                });

            }


            if (!offer) {

                return res.status(404).json({

                    success: false,
                    message: "Invalid coupon code."

                });

            }


            // =================================================
            // ACTIVE CHECK
            // =================================================

            if (
                Number(offer.is_active) !== 1
            ) {

                return res.status(400).json({

                    success: false,
                    message: "This coupon is inactive."

                });

            }


            // =================================================
            // DATE CHECK
            // =================================================

            const now =
                new Date();


            const startDate =
                new Date(
                    offer.start_date
                );


            const endDate =
                new Date(
                    offer.end_date
                );


            if (
                now < startDate
            ) {

                return res.status(400).json({

                    success: false,
                    message: "This coupon is not active yet."

                });

            }


            if (
                now > endDate
            ) {

                return res.status(400).json({

                    success: false,
                    message: "This coupon has expired."

                });

            }


            // =================================================
            // USAGE LIMIT
            // =================================================

            if (
                offer.usage_limit !== null &&
                Number(offer.used_count) >=
                Number(offer.usage_limit)
            ) {

                return res.status(400).json({

                    success: false,
                    message: "This coupon usage limit has been reached."

                });

            }


            // =================================================
            // MINIMUM ORDER
            // =================================================

            const minimumOrder =
                Number(
                    offer.min_order_amount || 0
                );


            if (
                subtotal < minimumOrder
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Minimum order amount is ₹${minimumOrder.toFixed(2)}.`

                });

            }


            // =================================================
            // CALCULATE DISCOUNT
            // =================================================

            let discount = 0;


            const discountType =
                offer.discount_type;


            const discountValue =
                Number(
                    offer.discount_value || 0
                );


            // -------------------------------------------------
            // PERCENTAGE
            // -------------------------------------------------

            if (
                discountType ===
                "percentage"
            ) {

                discount =
                    subtotal *
                    discountValue /
                    100;


                // Max discount
                if (
                    offer.max_discount !== null &&
                    Number(offer.max_discount) > 0
                ) {

                    discount =
                        Math.min(
                            discount,
                            Number(
                                offer.max_discount
                            )
                        );

                }

            }


            // -------------------------------------------------
            // FLAT
            // -------------------------------------------------

            else if (
                discountType === "flat"
            ) {

                discount =
                    discountValue;


                if (
                    offer.max_discount !== null &&
                    Number(offer.max_discount) > 0
                ) {

                    discount =
                        Math.min(
                            discount,
                            Number(
                                offer.max_discount
                            )
                        );

                }

            }


            // -------------------------------------------------
            // FREE DELIVERY
            // -------------------------------------------------

            else if (
                discountType ===
                "free_delivery"
            ) {

                // Delivery fee will be handled
                // by checkout.

                discount = 0;

            }


            // =================================================
            // SAFETY
            // =================================================

            discount =
                Math.max(
                    0,
                    Math.min(
                        discount,
                        subtotal
                    )
                );


            discount =
                Number(
                    discount.toFixed(2)
                );


            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                success: true,

                message:
                    "Coupon applied successfully.",

                coupon: {

                    id:
                        offer.id,

                    code:
                        offer.code,

                    title:
                        offer.title,

                    description:
                        offer.description,

                    discountType:
                        offer.discount_type,

                    discountValue:
                        Number(
                            offer.discount_value
                        ),

                    discount:
                        discount,

                    maxDiscount:
                        offer.max_discount !== null
                            ? Number(
                                offer.max_discount
                            )
                            : null,

                    minOrderAmount:
                        minimumOrder,

                    offerType:
                        offer.offer_type,

                    restaurantId:
                        offer.restaurant_id,

                    restaurantName:
                        offer.restaurant_name || null

                }

            });

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getOffers,

    getOffer,

    applyCoupon

};