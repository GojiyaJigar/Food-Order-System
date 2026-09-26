const offersModel = require("../../models/admin/offersModel");

const DISCOUNT_TYPES = ["percentage", "flat", "free_delivery"];
const OFFER_TYPES = ["general", "welcome", "free_delivery"];

// Fetch All Offers
const getAllOffers = (req, res) => {
    offersModel.getAllOffers((error, offers) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to load offers."
            });
        }

        res.json({
            success: true,
            offers
        });
    });
};

// Get Single Offer By ID
const getOfferById = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid offer ID."
        });
    }

    offersModel.getOfferById(id, (error, offer) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to load offer."
            });
        }

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found."
            });
        }

        res.json({
            success: true,
            offer
        });
    });
};

// Validate Offer Payload Helper
const validateOffer = (body) => {
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const code = String(body.code || "").trim().toUpperCase();
    const discountType = String(body.discount_type || "").trim();
    const offerType = String(body.offer_type || "").trim();
    const discountValue = Number(body.discount_value ?? 0);
    const minOrder = Number(body.min_order_amount ?? 0);
    const maxDiscount = body.max_discount === "" || body.max_discount === null || body.max_discount === undefined ? null : Number(body.max_discount);
    const usageLimit = body.usage_limit === "" || body.usage_limit === null || body.usage_limit === undefined ? null : Number(body.usage_limit);
    const startDate = String(body.start_date || "").trim();
    const endDate = String(body.end_date || "").trim();
    const isActive = Number(body.is_active) === 1 ? 1 : 0;

    if (!title) return { error: "Offer title is required." };
    if (!code) return { error: "Coupon code is required." };
    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) return { error: "Coupon code can contain only letters, numbers, _ and -." };
    if (!DISCOUNT_TYPES.includes(discountType)) return { error: "Invalid discount type." };
    if (!OFFER_TYPES.includes(offerType)) return { error: "Invalid offer type." };
    if (!Number.isFinite(discountValue) || discountValue < 0) return { error: "Discount value must be 0 or greater." };
    if (discountType === "percentage" && discountValue > 100) return { error: "Percentage discount cannot exceed 100." };
    if (!Number.isFinite(minOrder) || minOrder < 0) return { error: "Minimum order amount is invalid." };
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) return { error: "Maximum discount is invalid." };
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) return { error: "Usage limit must be a positive number." };
    if (!startDate || !endDate) return { error: "Start date and end date are required." };

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: "Invalid offer dates." };
    if (end <= start) return { error: "End date must be after start date." };

    return {
        data: {
            title,
            description: description || null,
            code,
            discount_type: discountType,
            discount_value: discountValue,
            max_discount: maxDiscount,
            min_order_amount: minOrder,
            offer_type: offerType,
            start_date: startDate,
            end_date: endDate,
            usage_limit: usageLimit,
            is_active: isActive
        }
    };
};

// Create New Offer
const createOffer = (req, res) => {
    const validation = validateOffer(req.body || {});

    if (validation.error) {
        return res.status(400).json({
            success: false,
            message: validation.error
        });
    }

    const data = validation.data;

    offersModel.getOfferByCode(data.code, (error, existingOffer) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to validate coupon code."
            });
        }

        if (existingOffer) {
            return res.status(409).json({
                success: false,
                message: "Coupon code already exists."
            });
        }

        offersModel.createOffer(data, (createError, result) => {
            if (createError) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to create offer."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Offer created successfully.",
                offerId: result.insertId
            });
        });
    });
};

// Update Existing Offer
const updateOffer = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid offer ID."
        });
    }

    const validation = validateOffer(req.body || {});

    if (validation.error) {
        return res.status(400).json({
            success: false,
            message: validation.error
        });
    }

    const data = validation.data;

    offersModel.getOfferById(id, (error, currentOffer) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to load offer."
            });
        }

        if (!currentOffer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found."
            });
        }

        offersModel.getOfferByCode(data.code, (codeError, existingOffer) => {
            if (codeError) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to validate coupon code."
                });
            }

            if (existingOffer && Number(existingOffer.id) !== id) {
                return res.status(409).json({
                    success: false,
                    message: "Coupon code already exists."
                });
            }

            offersModel.updateOffer(id, data, (updateError, result) => {
                if (updateError) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to update offer."
                    });
                }

                if (!result || result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Offer not found."
                    });
                }

                return res.json({
                    success: true,
                    message: "Offer updated successfully."
                });
            });
        });
    });
};

// Update Offer Status
const updateOfferStatus = (req, res) => {
    const id = Number(req.params.id);
    const isActive = Number(req.body?.is_active);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid offer ID."
        });
    }

    if (![0, 1].includes(isActive)) {
        return res.status(400).json({
            success: false,
            message: "Invalid offer status."
        });
    }

    offersModel.updateOfferStatus(id, isActive, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update offer status."
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Offer not found."
            });
        }

        res.json({
            success: true,
            message: isActive ? "Offer activated." : "Offer deactivated."
        });
    });
};

// Delete Offer
const deleteOffer = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid offer ID."
        });
    }

    offersModel.getOfferById(id, (error, offer) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to load offer."
            });
        }

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: "Offer not found."
            });
        }

        offersModel.deleteOffer(id, (deleteError, result) => {
            if (deleteError) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete offer."
                });
            }

            if (!result || result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found."
                });
            }

            return res.json({
                success: true,
                message: "Offer deleted successfully."
            });
        });
    });
};

// Export Modules
module.exports = {
    getAllOffers,
    getOfferById,
    createOffer,
    updateOffer,
    updateOfferStatus,
    deleteOffer
};