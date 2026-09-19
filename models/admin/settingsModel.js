// =====================================================
// JIGATO - ADMIN SETTINGS MODEL
// =====================================================

const db = require("../../config/db");


// =====================================================
// GET SETTINGS
// =====================================================

async function getSettings() {

    const [rows] = await db.promise().query(`
        SELECT
            id,
            app_name,
            support_email,
            support_phone,
            default_city,

            delivery_fee,
            free_delivery_above,
            gst_rate,
            minimum_order,

            payment_cod,
            payment_upi,
            payment_card,

            offers_enabled,
            coupons_enabled,
            free_delivery_offers,

            new_order_alert,
            order_status_alert,
            new_customer_alert,
            offer_expiry_alert,

            created_at,
            updated_at

        FROM app_settings
        WHERE id = 1
        LIMIT 1
    `);

    return rows[0] || null;
}


// =====================================================
// CREATE DEFAULT SETTINGS
// =====================================================

async function createDefaultSettings() {

    await db.promise().query(`
        INSERT INTO app_settings (
            id,
            app_name,
            support_email,
            support_phone,
            default_city,

            delivery_fee,
            free_delivery_above,
            gst_rate,
            minimum_order,

            payment_cod,
            payment_upi,
            payment_card,

            offers_enabled,
            coupons_enabled,
            free_delivery_offers,

            new_order_alert,
            order_status_alert,
            new_customer_alert,
            offer_expiry_alert
        )

        VALUES (
            1,
            'Jigato',
            'support@jigato.com',
            '',
            'India',

            40.00,
            500.00,
            5.00,
            100.00,

            1,
            1,
            1,

            1,
            1,
            1,

            1,
            1,
            1,
            1
        )

        ON DUPLICATE KEY UPDATE
            id = id
    `);

    return getSettings();
}


// =====================================================
// GET OR CREATE
// =====================================================

async function getOrCreateSettings() {

    let settings = await getSettings();

    if (!settings) {
        settings = await createDefaultSettings();
    }

    return settings;
}


// =====================================================
// UPDATE SETTINGS
// =====================================================

async function updateSettings(data) {

    const {

        app_name,
        support_email,
        support_phone,
        default_city,

        delivery_fee,
        free_delivery_above,
        gst_rate,
        minimum_order,

        payment_cod,
        payment_upi,
        payment_card,

        offers_enabled,
        coupons_enabled,
        free_delivery_offers,

        new_order_alert,
        order_status_alert,
        new_customer_alert,
        offer_expiry_alert

    } = data;


    await db.promise().query(`

        INSERT INTO app_settings (

            id,

            app_name,
            support_email,
            support_phone,
            default_city,

            delivery_fee,
            free_delivery_above,
            gst_rate,
            minimum_order,

            payment_cod,
            payment_upi,
            payment_card,

            offers_enabled,
            coupons_enabled,
            free_delivery_offers,

            new_order_alert,
            order_status_alert,
            new_customer_alert,
            offer_expiry_alert

        )

        VALUES (

            1,

            ?,
            ?,
            ?,
            ?,

            ?,
            ?,
            ?,
            ?,

            ?,
            ?,
            ?,

            ?,
            ?,
            ?,

            ?,
            ?,
            ?,
            ?

        )

        ON DUPLICATE KEY UPDATE

            app_name = VALUES(app_name),
            support_email = VALUES(support_email),
            support_phone = VALUES(support_phone),
            default_city = VALUES(default_city),

            delivery_fee = VALUES(delivery_fee),
            free_delivery_above = VALUES(free_delivery_above),
            gst_rate = VALUES(gst_rate),
            minimum_order = VALUES(minimum_order),

            payment_cod = VALUES(payment_cod),
            payment_upi = VALUES(payment_upi),
            payment_card = VALUES(payment_card),

            offers_enabled = VALUES(offers_enabled),
            coupons_enabled = VALUES(coupons_enabled),
            free_delivery_offers = VALUES(free_delivery_offers),

            new_order_alert = VALUES(new_order_alert),
            order_status_alert = VALUES(order_status_alert),
            new_customer_alert = VALUES(new_customer_alert),
            offer_expiry_alert = VALUES(offer_expiry_alert)

    `, [

        app_name,
        support_email || null,
        support_phone || null,
        default_city || null,

        Number(delivery_fee),
        Number(free_delivery_above),
        Number(gst_rate),
        Number(minimum_order),

        payment_cod ? 1 : 0,
        payment_upi ? 1 : 0,
        payment_card ? 1 : 0,

        offers_enabled ? 1 : 0,
        coupons_enabled ? 1 : 0,
        free_delivery_offers ? 1 : 0,

        new_order_alert ? 1 : 0,
        order_status_alert ? 1 : 0,
        new_customer_alert ? 1 : 0,
        offer_expiry_alert ? 1 : 0

    ]);


    return getSettings();
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getSettings,
    createDefaultSettings,
    getOrCreateSettings,
    updateSettings
};