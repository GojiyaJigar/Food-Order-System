const db = require("../config/db");


// =====================================================
// GET ALL ACTIVE OFFERS
// =====================================================

const getAllOffers = (callback) => {

    const sql = `

        SELECT
            o.id,
            o.title,
            o.description,
            o.code,
            o.discount_type,
            o.discount_value,
            o.max_discount,
            o.min_order_amount,
            o.offer_type,
            o.restaurant_id,
            o.start_date,
            o.end_date,
            o.usage_limit,
            o.used_count,
            o.is_active,

            r.name AS restaurant_name,
            r.image AS restaurant_image

        FROM offers o

        LEFT JOIN restaurants r
            ON r.id = o.restaurant_id

        WHERE o.is_active = 1

        AND NOW() >= o.start_date

        AND NOW() <= o.end_date

        AND (
            o.usage_limit IS NULL
            OR o.used_count < o.usage_limit
        )

        ORDER BY o.created_at DESC

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
                results
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
            o.id,
            o.title,
            o.description,
            o.code,
            o.discount_type,
            o.discount_value,
            o.max_discount,
            o.min_order_amount,
            o.offer_type,
            o.restaurant_id,
            o.start_date,
            o.end_date,
            o.usage_limit,
            o.used_count,
            o.is_active,

            r.name AS restaurant_name

        FROM offers o

        LEFT JOIN restaurants r
            ON r.id = o.restaurant_id

        WHERE o.id = ?

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
            o.id,
            o.title,
            o.description,
            o.code,
            o.discount_type,
            o.discount_value,
            o.max_discount,
            o.min_order_amount,
            o.offer_type,
            o.restaurant_id,
            o.start_date,
            o.end_date,
            o.usage_limit,
            o.used_count,
            o.is_active,

            r.name AS restaurant_name

        FROM offers o

        LEFT JOIN restaurants r
            ON r.id = o.restaurant_id

        WHERE UPPER(o.code) = UPPER(?)

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