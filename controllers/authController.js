"use strict";

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = require("../config/db");
const userModel = require("../models/userModel");

const {
    sendPasswordResetEmail
} = require("../services/authEmailService");


const forgotPassword = async (req, res) => {

    try {

        const email =
            String(req.body.email || "")
                .trim()
                .toLowerCase();


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

            });

        }


        const userQuery = `

            SELECT
                id,
                name,
                email

            FROM users

            WHERE email = ?

            LIMIT 1

        `;


        db.query(

            userQuery,

            [email],

            async (userError, users) => {

                if (userError) {

                    console.error(
                        "FORGOT PASSWORD USER ERROR:",
                        userError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong."

                    });

                }


                /*
                 * Security:
                 * User exist kare ya nahi,
                 * same response denge.
                 */

                if (
                    !users ||
                    users.length === 0
                ) {

                    return res.json({

                        success: true,

                        message:
                            "If this email is registered, a password reset link has been sent."

                    });

                }


                const user = users[0];


                // =========================================
                // CREATE RAW TOKEN
                // =========================================

                const rawToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                // =========================================
                // HASH TOKEN
                // =========================================

                const tokenHash =
                    crypto
                        .createHash("sha256")
                        .update(rawToken)
                        .digest("hex");


                // =========================================
                // 15 MINUTE EXPIRY
                // =========================================

                const expiresAt =
                    new Date(
                        Date.now() +
                        15 * 60 * 1000
                    );


                // =========================================
                // DELETE OLD UNUSED TOKENS
                // =========================================

                const deleteQuery = `

                    DELETE FROM password_reset_tokens

                    WHERE user_id = ?

                    AND used_at IS NULL

                `;


                db.query(

                    deleteQuery,

                    [user.id],

                    deleteError => {

                        if (deleteError) {

                            console.error(
                                "OLD RESET TOKEN DELETE ERROR:",
                                deleteError
                            );

                        }


                        // =================================
                        // SAVE NEW TOKEN
                        // =================================

                        const insertQuery = `

                            INSERT INTO password_reset_tokens
                            (
                                user_id,
                                token_hash,
                                expires_at
                            )

                            VALUES (?, ?, ?)

                        `;


                        db.query(

                            insertQuery,

                            [
                                user.id,
                                tokenHash,
                                expiresAt
                            ],

                            async insertError => {

                                if (insertError) {

                                    console.error(
                                        "RESET TOKEN INSERT ERROR:",
                                        insertError
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Unable to create reset link."

                                    });

                                }


                                // =================================
                                // RESET URL
                                // =================================

                                const resetUrl =
                                    `http://localhost:5000/reset-password?token=${rawToken}`;


                                // =================================
                                // SEND EMAIL
                                // =================================

                                try {

                                    await sendPasswordResetEmail({

                                        to:
                                            user.email,

                                        customerName:
                                            user.name,

                                        resetUrl

                                    });


                                    return res.json({

                                        success: true,

                                        message:
                                            "If this email is registered, a password reset link has been sent."

                                    });

                                }

                                catch (emailError) {

                                    console.error(
                                        "PASSWORD RESET EMAIL ERROR:",
                                        emailError
                                    );


                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Unable to send reset email."

                                    });

                                }

                            }

                        );

                    }

                );

            }

        );

    }

    catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again."

        });

    }

};
const resetPassword = async (req, res) => {

    try {

        const token =
            String(req.body.token || "")
                .trim();


        const password =
            String(req.body.password || "");


        if (!token || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid password reset request."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // =========================================
        // HASH TOKEN
        // =========================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // =========================================
        // FIND TOKEN
        // =========================================

        const tokenQuery = `

            SELECT
                id,
                user_id,
                expires_at,
                used_at

            FROM password_reset_tokens

            WHERE token_hash = ?

            LIMIT 1

        `;


        db.query(

            tokenQuery,

            [tokenHash],

            async (tokenError, tokens) => {

                if (tokenError) {

                    console.error(
                        "RESET TOKEN DB ERROR:",
                        tokenError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong."

                    });

                }


                if (
                    !tokens ||
                    tokens.length === 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link is invalid or expired."

                    });

                }


                const resetToken =
                    tokens[0];


                // =========================================
                // ALREADY USED
                // =========================================

                if (resetToken.used_at) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has already been used."

                    });

                }


                // =========================================
                // EXPIRED
                // =========================================

                if (
                    new Date() >
                    new Date(resetToken.expires_at)
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has expired."

                    });

                }


                // =========================================
                // HASH NEW PASSWORD
                // =========================================

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // =========================================
                // UPDATE PASSWORD
                // =========================================

                const updateQuery = `

                    UPDATE users

                    SET password = ?

                    WHERE id = ?

                `;


                db.query(

                    updateQuery,

                    [
                        hashedPassword,
                        resetToken.user_id
                    ],

                    updateError => {

                        if (updateError) {

                            console.error(
                                "PASSWORD UPDATE ERROR:",
                                updateError
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Unable to update password."

                            });

                        }


                        // =================================
                        // MARK TOKEN USED
                        // =================================

                        const usedQuery = `

                            UPDATE password_reset_tokens

                            SET used_at = NOW()

                            WHERE id = ?

                        `;


                        db.query(

                            usedQuery,

                            [resetToken.id],

                            usedError => {

                                if (usedError) {

                                    console.error(
                                        "TOKEN USED ERROR:",
                                        usedError
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Password changed, but reset token could not be finalized."

                                    });

                                }


                                return res.json({

                                    success: true,

                                    message:
                                        "Password reset successful. Please login with your new password."

                                });

                            }

                        );

                    }

                );

            }

        );

    }

    catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Something went wrong."

        });

    }

};
// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            phone,
            city,
            password
        } = req.body;


        const cleanName =
            String(
                name || ""
            ).trim();


        const cleanEmail =
            String(
                email || ""
            )
                .trim()
                .toLowerCase();


        const cleanPhone =
            String(
                phone || ""
            )
                .replace(/\D/g, "")
                .trim();


        const cleanCity =
            String(
                city || ""
            ).trim();


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !cleanName ||
            !cleanEmail ||
            !cleanPhone ||
            !cleanCity ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill all required fields."

            });

        }


        if (
            !/^\d{10}$/.test(
                cleanPhone
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid 10-digit mobile number."

            });

        }


        if (
            String(password).length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // =================================================
        // CHECK DUPLICATE EMAIL / PHONE
        // =================================================

        const checkQuery = `
            SELECT
                id,
                email,
                phone
            FROM users
            WHERE email = ?
               OR phone = ?
            LIMIT 1
        `;


        db.query(
            checkQuery,
            [
                cleanEmail,
                cleanPhone
            ],
            async (
                checkError,
                existingUsers
            ) => {

                if (checkError) {

                    console.error(
                        "REGISTER CHECK ERROR:",
                        checkError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong. Please try again."

                    });

                }


                if (
                    existingUsers.length > 0
                ) {

                    const existing =
                        existingUsers[0];


                    // EMAIL DUPLICATE

                    if (
                        String(
                            existing.email || ""
                        )
                            .trim()
                            .toLowerCase() ===
                        cleanEmail
                    ) {

                        return res.status(409).json({

                            success: false,

                            field:
                                "email",

                            message:
                                "This email is already registered."

                        });

                    }


                    // PHONE DUPLICATE

                    if (
                        String(
                            existing.phone || ""
                        )
                            .replace(/\D/g, "")
                            === cleanPhone
                    ) {

                        return res.status(409).json({

                            success: false,

                            field:
                                "phone",

                            message:
                                "This mobile number is already registered."

                        });

                    }

                }


                // =================================================
                // PASSWORD HASH
                // =================================================

                const hashedPassword =
                    await bcrypt.hash(
                        String(password),
                        10
                    );


                // =================================================
                // INSERT USER
                // ALWAYS CUSTOMER
                // =================================================

                const insertQuery = `
                    INSERT INTO users
                    (
                        name,
                        email,
                        phone,
                        city,
                        password,
                        role
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `;


                db.query(
                    insertQuery,
                    [
                        cleanName,
                        cleanEmail,
                        cleanPhone,
                        cleanCity,
                        hashedPassword,
                        "customer"
                    ],
                    (
                        insertError,
                        result
                    ) => {

                        if (insertError) {

                            console.error(
                                "REGISTER INSERT ERROR:",
                                insertError
                            );


                            if (
                                insertError.code ===
                                "ER_DUP_ENTRY"
                            ) {

                                return res.status(409).json({

                                    success: false,

                                    message:
                                        "Email or mobile number is already registered."

                                });

                            }


                            return res.status(500).json({

                                success: false,

                                message:
                                    "Registration failed. Please try again."

                            });

                        }


                        return res.status(201).json({

                            success: true,

                            message:
                                "Registration successful. Please login.",

                            userId:
                                result.insertId

                        });

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again."

        });

    }

};


// =====================================================
// LOGIN USER
// =====================================================

const loginUser = (req, res) => {

    const { email, password } = req.body;

    // -----------------------------------
    // VALIDATION
    // -----------------------------------

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------------
    // FIND USER
    // -----------------------------------

    userModel.findUserByEmail(normalizedEmail, (err, result) => {

        if (err) {
            console.error("Login DB Error:", err);

            return res.status(500).json({
                success: false,
                message: "Server error"
            });
        }

        if (!result || result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = result[0];

        // -----------------------------------
        // PASSWORD CHECK
        // -----------------------------------

        bcrypt.compare(
            password,
            user.password,
            (compareError, isMatch) => {

                if (compareError) {
                    console.error(
                        "Password Compare Error:",
                        compareError
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Server error"
                    });
                }

                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                // -----------------------------------
                // REGENERATE SESSION
                // -----------------------------------

                req.session.regenerate((sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Session Regenerate Error:",
                            sessionError
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Unable to create login session"
                        });
                    }

                    // -----------------------------------
                    // SET USER SESSION
                    // -----------------------------------

                    req.session.userId = user.id;
                    req.session.role = user.role;
                    req.session.name = user.name;
                    req.session.city = user.city;

                    // ⭐ VERY IMPORTANT ⭐
                    // Server.js session-generation check
                    req.session.sessionGeneration =
                        req.app.locals.sessionGeneration;

                    // -----------------------------------
                    // SAVE SESSION
                    // -----------------------------------

                    req.session.save((saveError) => {

                        if (saveError) {

                            console.error(
                                "Session Save Error:",
                                saveError
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Unable to save login session"
                            });
                        }

                        console.log("=================================");
                        console.log("✅ LOGIN SUCCESS");
                        console.log("User ID:", user.id);
                        console.log("Name:", user.name);
                        console.log("Role:", user.role);
                        console.log(
                            "Session Generation:",
                            req.session.sessionGeneration
                        );
                        console.log("=================================");

                        return res.json({
                            success: true,
                            message: "Login Successful",
                            role: user.role,
                            name: user.name
                        });
                    });
                });
            }
        );
    });
};


// =====================================================
// CHECK AUTH
// =====================================================

const checkAuth = (
    req,
    res
) => {

    const loggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    if (loggedIn) {

        return res.json({

            loggedIn:
                true,

            userId:
                req.session.userId,

            role:
                req.session.role,

            name:
                req.session.name,

            city:
                req.session.city

        });

    }


    return res.json({

        loggedIn:
            false

    });

};


// =====================================================
// LOGOUT
// =====================================================

const logoutUser = (
    req,
    res
) => {

    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );


    res.set(
        "Pragma",
        "no-cache"
    );


    res.set(
        "Expires",
        "0"
    );


    req.session.destroy(
        (err) => {

            if (err) {

                console.error(
                    "LOGOUT ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Logout failed."

                });

            }


            res.clearCookie(
                "jigato.sid",
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax"
                }
            );


            return res.status(200).json({

                success: true,

                message:
                    "Logged out successfully."

            });

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    registerUser,

    loginUser,

    checkAuth,

    logoutUser,

    forgotPassword,

    resetPassword

};