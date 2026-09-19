// =====================================================
// JIGATO - ADMIN SETTINGS CONTROLLER
// =====================================================

const settingsModel =
    require("../../models/admin/settingsModel");


// =====================================================
// SESSION ADMIN CHECK
// =====================================================

function isAdmin(req) {

    const loggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    if (!loggedIn) {
        return false;
    }

    const role =
        String(
            req.session.role || ""
        )
            .trim()
            .toLowerCase();

    return role === "admin";
}


// =====================================================
// FORMAT SETTINGS
// =====================================================

function formatSettings(settings) {

    if (!settings) {
        return null;
    }

    return {

        id: settings.id,

        app_name:
            settings.app_name || "",

        support_email:
            settings.support_email || "",

        support_phone:
            settings.support_phone || "",

        default_city:
            settings.default_city || "",


        delivery_fee:
            Number(
                settings.delivery_fee || 0
            ),

        free_delivery_above:
            Number(
                settings.free_delivery_above || 0
            ),

        gst_rate:
            Number(
                settings.gst_rate || 0
            ),

        minimum_order:
            Number(
                settings.minimum_order || 0
            ),


        payment_cod:
            Number(
                settings.payment_cod
            ) === 1,

        payment_upi:
            Number(
                settings.payment_upi
            ) === 1,

        payment_card:
            Number(
                settings.payment_card
            ) === 1,


        offers_enabled:
            Number(
                settings.offers_enabled
            ) === 1,

        coupons_enabled:
            Number(
                settings.coupons_enabled
            ) === 1,

        free_delivery_offers:
            Number(
                settings.free_delivery_offers
            ) === 1,


        new_order_alert:
            Number(
                settings.new_order_alert
            ) === 1,

        order_status_alert:
            Number(
                settings.order_status_alert
            ) === 1,

        new_customer_alert:
            Number(
                settings.new_customer_alert
            ) === 1,

        offer_expiry_alert:
            Number(
                settings.offer_expiry_alert
            ) === 1,

        created_at:
            settings.created_at,

        updated_at:
            settings.updated_at

    };
}


// =====================================================
// VALIDATION
// =====================================================

function validateSettings(body) {

    const data = body || {};


    const appName =
        String(
            data.app_name || ""
        ).trim();

    if (!appName) {

        return {
            valid: false,
            message: "App name is required."
        };

    }


    const city =
        String(
            data.default_city || ""
        ).trim();

    if (!city) {

        return {
            valid: false,
            message: "Default city is required."
        };

    }


    const email =
        String(
            data.support_email || ""
        ).trim();

    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        return {
            valid: false,
            message: "Enter a valid support email."
        };

    }


    const deliveryFee =
        Number(data.delivery_fee);

    const freeDeliveryAbove =
        Number(data.free_delivery_above);

    const gstRate =
        Number(data.gst_rate);

    const minimumOrder =
        Number(data.minimum_order);


    if (
        !Number.isFinite(deliveryFee) ||
        deliveryFee < 0
    ) {

        return {
            valid: false,
            message: "Delivery fee must be a valid number."
        };

    }


    if (
        !Number.isFinite(freeDeliveryAbove) ||
        freeDeliveryAbove < 0
    ) {

        return {
            valid: false,
            message:
                "Free delivery amount must be a valid number."
        };

    }


    if (
        !Number.isFinite(gstRate) ||
        gstRate < 0 ||
        gstRate > 100
    ) {

        return {
            valid: false,
            message:
                "GST rate must be between 0 and 100."
        };

    }


    if (
        !Number.isFinite(minimumOrder) ||
        minimumOrder < 0
    ) {

        return {
            valid: false,
            message:
                "Minimum order must be a valid number."
        };

    }


    return {
        valid: true
    };
}


// =====================================================
// GET ADMIN SETTINGS
// GET /admin/api/settings
// =====================================================

async function getAdminSettings(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(
                req.session &&
                req.session.userId !== undefined &&
                req.session.userId !== null
                    ? 403
                    : 401
            ).json({

                success: false,

                message:
                    req.session &&
                    req.session.userId !== undefined &&
                    req.session.userId !== null
                        ? "Admin access required."
                        : "Please login first."

            });

        }


        const settings =
            await settingsModel
                .getOrCreateSettings();


        return res.json({

            success: true,

            settings:
                formatSettings(settings)

        });

    }
    catch (error) {

        console.error(
            "GET ADMIN SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load settings."

        });

    }

}


// =====================================================
// UPDATE ADMIN SETTINGS
// PUT /admin/api/settings
// =====================================================

async function updateAdminSettings(req, res) {

    try {

        if (!isAdmin(req)) {

            return res.status(
                req.session &&
                req.session.userId !== undefined &&
                req.session.userId !== null
                    ? 403
                    : 401
            ).json({

                success: false,

                message:
                    req.session &&
                    req.session.userId !== undefined &&
                    req.session.userId !== null
                        ? "Admin access required."
                        : "Please login first."

            });

        }


        const validation =
            validateSettings(req.body);


        if (!validation.valid) {

            return res.status(400).json({

                success: false,

                message:
                    validation.message

            });

        }


        const body =
            req.body || {};


        const settingsData = {

            app_name:
                String(
                    body.app_name || ""
                ).trim(),

            support_email:
                String(
                    body.support_email || ""
                ).trim(),

            support_phone:
                String(
                    body.support_phone || ""
                ).trim(),

            default_city:
                String(
                    body.default_city || ""
                ).trim(),


            delivery_fee:
                Number(
                    body.delivery_fee || 0
                ),

            free_delivery_above:
                Number(
                    body.free_delivery_above || 0
                ),

            gst_rate:
                Number(
                    body.gst_rate || 0
                ),

            minimum_order:
                Number(
                    body.minimum_order || 0
                ),


            payment_cod:
                body.payment_cod
                    ? 1
                    : 0,

            payment_upi:
                body.payment_upi
                    ? 1
                    : 0,

            payment_card:
                body.payment_card
                    ? 1
                    : 0,


            offers_enabled:
                body.offers_enabled
                    ? 1
                    : 0,

            coupons_enabled:
                body.coupons_enabled
                    ? 1
                    : 0,

            free_delivery_offers:
                body.free_delivery_offers
                    ? 1
                    : 0,


            new_order_alert:
                body.new_order_alert
                    ? 1
                    : 0,

            order_status_alert:
                body.order_status_alert
                    ? 1
                    : 0,

            new_customer_alert:
                body.new_customer_alert
                    ? 1
                    : 0,

            offer_expiry_alert:
                body.offer_expiry_alert
                    ? 1
                    : 0

        };


        const updated =
            await settingsModel
                .updateSettings(
                    settingsData
                );


        return res.json({

            success: true,

            message:
                "Settings saved successfully.",

            settings:
                formatSettings(updated)

        });

    }
    catch (error) {

        console.error(
            "UPDATE ADMIN SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to save settings."

        });

    }

}


// =====================================================
// GET PUBLIC SETTINGS
// GET /api/settings
// =====================================================

async function getPublicSettings(req, res) {

    try {

        const settings =
            await settingsModel
                .getOrCreateSettings();


        if (!settings) {

            return res.status(500).json({

                success: false,

                message:
                    "Settings not found."

            });

        }


        return res.json({

            success: true,

            settings: {

                app_name:
                    settings.app_name,

                support_email:
                    settings.support_email,

                support_phone:
                    settings.support_phone,

                default_city:
                    settings.default_city,


                delivery_fee:
                    Number(
                        settings.delivery_fee || 0
                    ),

                free_delivery_above:
                    Number(
                        settings.free_delivery_above || 0
                    ),

                gst_rate:
                    Number(
                        settings.gst_rate || 0
                    ),

                minimum_order:
                    Number(
                        settings.minimum_order || 0
                    ),


                payment_cod:
                    Number(
                        settings.payment_cod
                    ) === 1,

                payment_upi:
                    Number(
                        settings.payment_upi
                    ) === 1,

                payment_card:
                    Number(
                        settings.payment_card
                    ) === 1,


                offers_enabled:
                    Number(
                        settings.offers_enabled
                    ) === 1,

                coupons_enabled:
                    Number(
                        settings.coupons_enabled
                    ) === 1,

                free_delivery_offers:
                    Number(
                        settings.free_delivery_offers
                    ) === 1

            }

        });

    }
    catch (error) {

        console.error(
            "GET PUBLIC SETTINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load public settings."

        });

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAdminSettings,

    updateAdminSettings,

    getPublicSettings

};