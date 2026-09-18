const db = require("../../config/db");

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
            created_at,
            updated_at
        FROM offers
        ORDER BY created_at DESC, id DESC
    `;

    db.query(sql, (error, rows) => {
        if (error) return callback(error);
        callback(null, rows || []);
    });
};


const getOfferById = (id, callback) => {
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
            created_at,
            updated_at
        FROM offers
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [id], (error, rows) => {
        if (error) return callback(error);

        callback(
            null,
            rows && rows.length ? rows[0] : null
        );
    });
};


const getOfferByCode = (code, callback) => {
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
            created_at,
            updated_at
        FROM offers
        WHERE code = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [code],
        (error, rows) => {
            if (error) return callback(error);

            callback(
                null,
                rows && rows.length
                    ? rows[0]
                    : null
            );
        }
    );
};


const createOffer = (data, callback) => {
    const sql = `
        INSERT INTO offers (
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
            is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.title,
            data.description,
            data.code,
            data.discount_type,
            data.discount_value,
            data.max_discount,
            data.min_order_amount,
            data.offer_type,
            data.start_date,
            data.end_date,
            data.usage_limit,
            0,
            data.is_active
        ],
        callback
    );
};


const updateOffer = (id, data, callback) => {
    const sql = `
        UPDATE offers
        SET
            title = ?,
            description = ?,
            code = ?,
            discount_type = ?,
            discount_value = ?,
            max_discount = ?,
            min_order_amount = ?,
            offer_type = ?,
            start_date = ?,
            end_date = ?,
            usage_limit = ?,
            is_active = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            data.title,
            data.description,
            data.code,
            data.discount_type,
            data.discount_value,
            data.max_discount,
            data.min_order_amount,
            data.offer_type,
            data.start_date,
            data.end_date,
            data.usage_limit,
            data.is_active,
            id
        ],
        callback
    );
};


const updateOfferStatus = (
    id,
    isActive,
    callback
) => {
    const sql = `
        UPDATE offers
        SET is_active = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [isActive, id],
        callback
    );
};


const deleteOffer = (id, callback) => {
    const sql = `
        DELETE FROM offers
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


const incrementUsedCount = (
    id,
    callback
) => {
    const sql = `
        UPDATE offers
        SET used_count = used_count + 1
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
};


module.exports = {
    getAllOffers,
    getOfferById,
    getOfferByCode,
    createOffer,
    updateOffer,
    updateOfferStatus,
    deleteOffer,
    incrementUsedCount
};