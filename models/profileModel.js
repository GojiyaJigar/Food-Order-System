const db = require("../config/db");


// ================= GET PROFILE =================

const getProfile = (userId, callback) => {

    const sql = `
        SELECT
            id,
            user_id,
            full_name,
            phone,
            date_of_birth,
            gender,
            profile_image,
            created_at,
            updated_at
        FROM profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};


// ================= CREATE PROFILE =================

const createProfile = (userId, data, callback) => {

    const sql = `
        INSERT INTO profiles
        (
            user_id,
            full_name,
            phone,
            date_of_birth,
            gender,
            profile_image
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [

        userId,

        data.full_name || "",

        data.phone || "",

        data.date_of_birth || null,

        data.gender || null,

        data.profile_image || null

    ];

    db.query(
        sql,
        values,
        callback
    );
};


// ================= UPDATE PROFILE =================

const updateProfile = (userId, data, callback) => {

    const sql = `
        UPDATE profiles
        SET
            full_name = ?,
            phone = ?,
            date_of_birth = ?,
            gender = ?,
            profile_image = ?
        WHERE user_id = ?
    `;

    const values = [

        data.full_name || "",

        data.phone || "",

        data.date_of_birth || null,

        data.gender || null,

        data.profile_image || null,

        userId

    ];

    db.query(
        sql,
        values,
        callback
    );
};


// ================= CHECK PROFILE =================

const profileExists = (userId, callback) => {

    const sql = `
        SELECT id
        FROM profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        callback
    );
};


// ================= EXPORT =================

module.exports = {

    getProfile,

    createProfile,

    updateProfile,

    profileExists

};