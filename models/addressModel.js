"use strict";
const db = require("../config/db");
// =====================================================
// GET ALL ADDRESSES
// =====================================================
const getAddresses = (userId, callback) => {
    const sql = `
        SELECT
            id,
            user_id,
            address_label,
            full_name,
            phone,
            address,
            city,
            state,
            pincode,
            is_default,
            created_at,
            updated_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, id DESC
    `;
    db.query(
        sql,
        [userId],
        callback
    );
};
// =====================================================
// GET SINGLE ADDRESS
// =====================================================
const getAddressById = (
    userId,
    addressId,
    callback
) => {
    const sql = `
        SELECT
            id,
            user_id,
            address_label,
            full_name,
            phone,
            address,
            city,
            state,
            pincode,
            is_default,
            created_at,
            updated_at
        FROM addresses
        WHERE id = ?
        AND user_id = ?
        LIMIT 1
    `;
    db.query(
        sql,
        [
            addressId,
            userId
        ],
        callback
    );
};
// =====================================================
// REMOVE DEFAULT
// =====================================================
const removeDefault = (
    userId,
    callback
) => {
    const sql = `
        UPDATE addresses
        SET is_default = 0
        WHERE user_id = ?
    `;
    db.query(
        sql,
        [userId],
        callback
    );
};
// =====================================================
// CREATE ADDRESS
// =====================================================
const createAddress = (
    userId,
    data,
    callback
) => {
    const sql = `
        INSERT INTO addresses
        (
            user_id,
            address_label,
            full_name,
            phone,
            address,
            city,
            state,
            pincode,
            is_default
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        sql,
        [
            userId,
            data.addressLabel || "Home",
            data.fullName,
            data.phone,
            data.address,
            data.city,
            data.state,
            data.pincode,
            data.isDefault ? 1 : 0
        ],
        callback
    );
};
// =====================================================
// UPDATE ADDRESS
// =====================================================
const updateAddress = (
    userId,
    addressId,
    data,
    callback
) => {
    const sql = `
        UPDATE addresses
        SET
            address_label = ?,
            full_name = ?,
            phone = ?,
            address = ?,
            city = ?,
            state = ?,
            pincode = ?,
            is_default = ?
        WHERE id = ?
        AND user_id = ?
    `;
    db.query(
        sql,
        [
            data.addressLabel || "Home",
            data.fullName,
            data.phone,
            data.address,
            data.city,
            data.state,
            data.pincode,
            data.isDefault ? 1 : 0,
            addressId,
            userId
        ],
        callback
    );
};
// =====================================================
// DELETE ADDRESS
// =====================================================
const deleteAddress = (
    userId,
    addressId,
    callback
) => {
    const sql = `
        DELETE FROM addresses
        WHERE id = ?
        AND user_id = ?
    `;
    db.query(
        sql,
        [
            addressId,
            userId
        ],
        callback
    );
};
// =====================================================
// EXPORT
// =====================================================
module.exports = {
    getAddresses,
    getAddressById,
    removeDefault,
    createAddress,
    updateAddress,
    deleteAddress
};