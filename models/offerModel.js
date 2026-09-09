const db = require("../config/db");


// =====================================================
// GET ALL ACTIVE OFFERS
// =====================================================

const getAllOffers = (callback) => {

    const sql = `
        SELECT
            id,
            title,
            description,
            code,
            discount_type,
            discount_value,
            max_discount,
            min_order_amount,
            offer_type,
            start_date,
            end_date,
            usage_limit,
            used_count,
            is_active,
            created_at

        FROM offers

        WHERE is_active = 1

        AND NOW() >= start_date

        AND NOW() <= end_date

        AND (
            usage_limit IS NULL
            OR used_count < usage_limit
        )

        ORDER BY created_at DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error(
                    "GET OFFERS ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                results || []
            );

        }
    );

};


// =====================================================
// GET OFFER BY ID
// =====================================================

const getOfferById = (
    offerId,
    callback
) => {

    const sql = `
        SELECT
            id,
            title,
            description,
            code,
            discount_type,
            discount_value,
            max_discount,
            min_order_amount,
            offer_type,
            start_date,
            end_date,
            usage_limit,
            used_count,
            is_active,
            created_at

        FROM offers

        WHERE id = ?

        LIMIT 1
    `;


    db.query(
        sql,
        [offerId],
        (err, results) => {

            if (err) {

                console.error(
                    "GET OFFER ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                results[0] || null
            );

        }
    );

};


// =====================================================
// GET OFFER BY COUPON CODE
// =====================================================

const getOfferByCode = (
    code,
    callback
) => {

    const sql = `
        SELECT
            id,
            title,
            description,
            code,
            discount_type,
            discount_value,
            max_discount,
            min_order_amount,
            offer_type,
            start_date,
            end_date,
            usage_limit,
            used_count,
            is_active,
            created_at

        FROM offers

        WHERE UPPER(code) = UPPER(?)

        LIMIT 1
    `;


    db.query(
        sql,
        [code],
        (err, results) => {

            if (err) {

                console.error(
                    "GET COUPON ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                results[0] || null
            );

        }
    );

};


// =====================================================
// INCREASE USED COUNT
// =====================================================

const increaseUsedCount = (
    offerId,
    callback
) => {

    const sql = `
        UPDATE offers

        SET used_count =
            used_count + 1

        WHERE id = ?

        AND is_active = 1

        AND (
            usage_limit IS NULL
            OR used_count < usage_limit
        )
    `;


    db.query(
        sql,
        [offerId],
        (err, result) => {

            if (err) {

                console.error(
                    "UPDATE OFFER USAGE ERROR:",
                    err
                );

                return callback(
                    err,
                    null
                );

            }


            callback(
                null,
                result
            );

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAllOffers,

    getOfferById,

    getOfferByCode,

    increaseUsedCount

};