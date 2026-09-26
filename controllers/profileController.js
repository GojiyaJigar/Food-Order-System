"use strict";

const profileModel = require("../models/profileModel");

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;

    profileModel.getProfile(userId, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error."
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = results[0];

        return res.json({
            success: true,
            profileExists: Boolean(user.profile_id),
            profile: {
                // USERS TABLE IS THE MAIN SOURCE
                user_id: user.user_id,
                full_name: user.user_name || "",
                email: user.user_email || "",
                phone: user.user_phone || "",
                city: user.user_city || "",
                state: user.user_state || "",
                pincode: user.user_pincode || "",
                address: user.user_address || "",
                status: user.user_status || "",
                // PROFILE TABLE DATA
                date_of_birth: user.date_of_birth || "",
                gender: user.gender || "",
                profile_image: user.profile_image || ""
            }
        });
    });
};

// =====================================================
// CREATE PROFILE
// =====================================================

const createProfile = (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;

    const {
        full_name,
        phone,
        date_of_birth,
        gender,
        profile_image
    } = req.body;

    if (!full_name || !String(full_name).trim()) {
        return res.status(400).json({
            success: false,
            message: "Full name is required."
        });
    }

    const data = {
        full_name: String(full_name).trim(),
        phone: phone
            ? String(phone).trim()
            : "",
        date_of_birth:
            date_of_birth || null,
        gender:
            gender || null,
        profile_image:
            profile_image || null
    };

    profileModel.profileExists(
        userId,
        (checkErr, results) => {
            if (checkErr) {
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (results && results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Profile already exists."
                });
            }

            profileModel.createProfile(
                userId,
                data,
                (insertErr, result) => {
                    if (insertErr) {
                        return res.status(500).json({
                            success: false,
                            message: "Unable to create profile."
                        });
                    }

                    // Keep users table synchronized
                    const syncSQL = `
                        UPDATE users
                        SET
                            name = ?,
                            phone = ?
                        WHERE id = ?
                    `;

                    const db = require("../config/db");

                    db.query(
                        syncSQL,
                        [
                            data.full_name,
                            data.phone,
                            userId
                        ],
                        (syncErr) => {
                            if (syncErr) {
                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Profile created but account sync failed."
                                });
                            }

                            return res.status(201).json({
                                success: true,
                                message:
                                    "Profile created successfully.",
                                profileId:
                                    result.insertId
                            });
                        }
                    );
                }
            );
        }
    );
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    const userId = req.session.userId;

    const {
        full_name,
        phone,
        city,
        date_of_birth,
        gender,
        profile_image
    } = req.body;

    if (!full_name || !String(full_name).trim()) {
        return res.status(400).json({
            success: false,
            message: "Full name is required."
        });
    }

    const data = {
        full_name:
            String(full_name).trim(),
        phone:
            phone
                ? String(phone).trim()
                : "",
        city:
            city
                ? String(city).trim()
                : "",
        date_of_birth:
            date_of_birth || null,
        gender:
            gender || null,
        profile_image:
            profile_image || null
    };

    // =================================================
    // UPDATE USERS TABLE
    // =================================================

    const db = require("../config/db");

    const updateUsersSQL = `
        UPDATE users
        SET
            name = ?,
            phone = ?,
            city = ?
        WHERE id = ?
    `;

    db.query(
        updateUsersSQL,
        [
            data.full_name,
            data.phone,
            data.city,
            userId
        ],
        (userErr) => {
            if (userErr) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update account details."
                });
            }

            // =================================================
            // CHECK PROFILE
            // =================================================

            profileModel.profileExists(
                userId,
                (checkErr, results) => {
                    if (checkErr) {
                        return res.status(500).json({
                            success: false,
                            message:
                                "Unable to check profile."
                        });
                    }

                    // =================================================
                    // PROFILE DOES NOT EXIST
                    // =================================================

                    if (!results || results.length === 0) {
                        profileModel.createProfile(
                            userId,
                            data,
                            (insertErr, result) => {
                                if (insertErr) {
                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Account updated but profile could not be created."
                                    });
                                }

                                return res.json({
                                    success: true,
                                    message:
                                        "Profile updated successfully.",
                                    city:
                                        data.city,
                                    profileId:
                                        result.insertId
                                });
                            }
                        );

                        return;
                    }

                    // =================================================
                    // PROFILE EXISTS
                    // =================================================

                    profileModel.updateProfile(
                        userId,
                        data,
                        (profileErr) => {
                            if (profileErr) {
                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Account updated but profile could not be updated."
                                });
                            }

                            return res.json({
                                success: true,
                                message:
                                    "Profile updated successfully.",
                                city:
                                    data.city
                            });
                        }
                    );
                }
            );
        }
    );
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getProfile,
    createProfile,
    updateProfile
};