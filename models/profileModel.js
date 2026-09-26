"use strict";

const db = require("../config/db");

// GET PROFILE
// users = main account data
// profiles = additional profile data
const getProfile = (userId, callback) => {
    const sql = `
        SELECT
            u.id AS user_id,
            u.name AS user_name,
            u.email AS user_email,
            u.phone AS user_phone,
            u.city AS user_city,
            u.state AS user_state,
            u.pincode AS user_pincode,
            u.address AS user_address,
            u.status AS user_status,
            p.id AS profile_id,
            p.full_name AS profile_name,
            p.phone AS profile_phone,
            p.date_of_birth,
            p.gender,
            p.profile_image,
            p.created_at AS profile_created_at,
            p.updated_at AS profile_updated_at
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        WHERE u.id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], callback);
};

// CREATE PROFILE
const createProfile = (userId, data, callback) => {
    const sql = `
        INSERT INTO profiles (
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

    db.query(sql, values, callback);
};

// UPDATE PROFILE
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

    db.query(sql, values, callback);
};

// CHECK PROFILE
const profileExists = (userId, callback) => {
    const sql = `
        SELECT id
        FROM profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], callback);
};

// EXPORT
module.exports = {
    getProfile,
    createProfile,
    updateProfile,
    profileExists
};