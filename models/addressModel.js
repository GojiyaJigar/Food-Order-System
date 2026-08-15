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
            created_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, id DESC
    `;

    db.query(sql, [userId], callback);
};


// =====================================================
// GET SINGLE ADDRESS
// =====================================================

const getAddressById = (userId, addressId, callback) => {

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
            created_at
        FROM addresses
        WHERE user_id = ?
        AND id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId, addressId],
        callback
    );
};


// =====================================================
// REMOVE DEFAULT ADDRESS
// =====================================================

const removeDefault = (userId, callback) => {

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

    const values = [

        userId,

        data.addressLabel,

        data.fullName,

        data.phone,

        data.address,

        data.city,

        data.state,

        data.pincode,

        data.isDefault ? 1 : 0

    ];


    console.log(
        "ADDRESS INSERT VALUES:",
        values
    );


    db.query(
        sql,
        values,
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
        WHERE user_id = ?
        AND id = ?
    `;

    const values = [

        data.addressLabel,

        data.fullName,

        data.phone,

        data.address,

        data.city,

        data.state,

        data.pincode,

        data.isDefault ? 1 : 0,

        userId,

        addressId

    ];


    db.query(
        sql,
        values,
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
        WHERE user_id = ?
        AND id = ?
    `;

    db.query(
        sql,
        [userId, addressId],
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