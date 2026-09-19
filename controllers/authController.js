const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const db = require("../config/db");
const userModel = require("../models/userModel");


// =====================================================
// PASSWORD RESET EMAIL TRANSPORTER
// =====================================================

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD

        }

    });


// =====================================================
// REGISTER
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


                    // =================================================
                    // EMAIL DUPLICATE
                    // =================================================

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


                    // =================================================
                    // PHONE DUPLICATE
                    // =================================================

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

const loginUser = (
    req,
    res
) => {

    const {
        email,
        password
    } = req.body;


    if (
        !email ||
        !password
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required."

        });

    }


    userModel.findUserByEmail(
        email,
        (
            err,
            result
        ) => {

            if (err) {

                console.error(
                    "LOGIN DATABASE ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            if (
                !result ||
                result.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid Email or Password"

                });

            }


            const user =
                result[0];


            bcrypt.compare(
                password,
                user.password,
                (
                    compareError,
                    isMatch
                ) => {

                    if (compareError) {

                        console.error(
                            "PASSWORD COMPARE ERROR:",
                            compareError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Password Compare Error"

                        });

                    }


                    if (!isMatch) {

                        return res.status(401).json({

                            success: false,

                            message:
                                "Invalid Email or Password"

                        });

                    }


                    // =================================================
                    // CREATE FRESH SESSION
                    // =================================================

                    req.session.regenerate(
                        (
                            sessionError
                        ) => {

                            if (sessionError) {

                                console.error(
                                    "SESSION REGENERATE ERROR:",
                                    sessionError
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Session Creation Failed"

                                });

                            }


                            // =================================================
                            // SAVE SESSION
                            // =================================================

                            req.session.userId =
                                user.id;


                            req.session.role =
                                user.role;


                            req.session.name =
                                user.name;


                            req.session.city =
                                user.city;


                            req.session.save(
                                (
                                    saveError
                                ) => {

                                    if (saveError) {

                                        console.error(
                                            "SESSION SAVE ERROR:",
                                            saveError
                                        );

                                        return res.status(500).json({

                                            success: false,

                                            message:
                                                "Session Save Failed"

                                        });

                                    }


                                    return res.json({

                                        success:
                                            true,

                                        message:
                                            "Login Successful",

                                        role:
                                            user.role,

                                        name:
                                            user.name

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

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
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (
    req,
    res
) => {

    try {

        const email =
            String(
                req.body.email || ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email address."

            });

        }


        // =================================================
        // FIND USER
        // =================================================

        const findUserQuery = `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE email = ?
            LIMIT 1
        `;


        db.query(
            findUserQuery,
            [email],
            async (
                dbError,
                users
            ) => {

                if (dbError) {

                    console.error(
                        "FORGOT PASSWORD DB ERROR:",
                        dbError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong. Please try again."

                    });

                }


                // =================================================
                // USER NOT FOUND
                // =================================================

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


                const user =
                    users[0];


                // =================================================
                // CREATE RANDOM TOKEN
                // =================================================

                const rawToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                // =================================================
                // HASH TOKEN
                // =================================================

                const tokenHash =
                    crypto
                        .createHash("sha256")
                        .update(rawToken)
                        .digest("hex");


                // =================================================
                // TOKEN EXPIRY
                // 15 MINUTES
                // =================================================

                const expiresAt =
                    new Date(
                        Date.now() +
                        15 * 60 * 1000
                    );


                // =================================================
                // DELETE OLD UNUSED TOKENS
                // =================================================

                const deleteOldTokensQuery = `
                    DELETE FROM password_reset_tokens
                    WHERE user_id = ?
                    AND used_at IS NULL
                `;


                db.query(
                    deleteOldTokensQuery,
                    [user.id],
                    (
                        deleteError
                    ) => {

                        if (deleteError) {

                            console.error(
                                "OLD TOKEN DELETE ERROR:",
                                deleteError
                            );

                        }


                        // =================================================
                        // SAVE NEW TOKEN
                        // =================================================

                        const insertTokenQuery = `
                            INSERT INTO password_reset_tokens
                            (
                                user_id,
                                token_hash,
                                expires_at
                            )
                            VALUES (?, ?, ?)
                        `;


                        db.query(
                            insertTokenQuery,
                            [
                                user.id,
                                tokenHash,
                                expiresAt
                            ],
                            async (
                                insertError
                            ) => {

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


                                // =================================================
                                // RESET URL
                                // =================================================

                                const resetUrl =
                                    `http://localhost:5000/reset-password?token=${rawToken}`;


                                // =================================================
                                // EMAIL
                                // =================================================

                                const mailOptions = {

                                    from:
                                        `"Jigato" <${process.env.EMAIL_USER}>`,

                                    to:
                                        user.email,

                                    subject:
                                        "Reset Your Jigato Password",

                                    html: `

                                        <div
                                            style="
                                                font-family: Arial, sans-serif;
                                                max-width: 600px;
                                                margin: auto;
                                                padding: 30px;
                                            "
                                        >

                                            <h2>
                                                Reset Your Jigato Password
                                            </h2>

                                            <p>
                                                Hello ${user.name},
                                            </p>

                                            <p>
                                                We received a request
                                                to reset your Jigato password.
                                            </p>

                                            <p>
                                                Click the button below
                                                to create a new password.
                                            </p>

                                            <p>

                                                <a
                                                    href="${resetUrl}"
                                                    style="
                                                        display:inline-block;
                                                        padding:12px 22px;
                                                        background:#ff5a36;
                                                        color:white;
                                                        text-decoration:none;
                                                        border-radius:6px;
                                                    "
                                                >
                                                    Reset Password
                                                </a>

                                            </p>

                                            <p>
                                                This link will expire
                                                in 15 minutes.
                                            </p>

                                            <p>
                                                If you did not request
                                                this password reset,
                                                you can safely ignore
                                                this email.
                                            </p>

                                            <p>
                                                — Jigato Team
                                            </p>

                                        </div>

                                    `

                                };


                                // =================================================
                                // SEND EMAIL
                                // =================================================

                                try {

                                    await transporter.sendMail(
                                        mailOptions
                                    );


                                    return res.json({

                                        success: true,

                                        message:
                                            "If this email is registered, a password reset link has been sent."

                                    });

                                }

                                catch (
                                    mailError
                                ) {

                                    console.error(
                                        "RESET EMAIL ERROR:",
                                        mailError
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


// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (
    req,
    res
) => {

    try {

        const token =
            String(
                req.body.token || ""
            ).trim();


        const password =
            String(
                req.body.password || ""
            );


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !token ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid password reset request."

            });

        }


        if (
            password.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // =================================================
        // HASH TOKEN
        // =================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // =================================================
        // FIND TOKEN
        // =================================================

        const findTokenQuery = `
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
            findTokenQuery,
            [tokenHash],
            async (
                dbError,
                tokens
            ) => {

                if (dbError) {

                    console.error(
                        "RESET TOKEN DB ERROR:",
                        dbError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong. Please try again."

                    });

                }


                // =================================================
                // TOKEN NOT FOUND
                // =================================================

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


                // =================================================
                // TOKEN ALREADY USED
                // =================================================

                if (
                    resetToken.used_at
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has already been used."

                    });

                }


                // =================================================
                // TOKEN EXPIRED
                // =================================================

                const currentTime =
                    new Date();


                const expiryTime =
                    new Date(
                        resetToken.expires_at
                    );


                if (
                    currentTime >
                    expiryTime
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has expired."

                    });

                }


                // =================================================
                // HASH NEW PASSWORD
                // =================================================

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // =================================================
                // UPDATE PASSWORD
                // =================================================

                const updatePasswordQuery = `
                    UPDATE users
                    SET password = ?
                    WHERE id = ?
                `;


                db.query(
                    updatePasswordQuery,
                    [
                        hashedPassword,
                        resetToken.user_id
                    ],
                    (
                        updateError
                    ) => {

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


                        // =================================================
                        // MARK TOKEN USED
                        // =================================================

                        const markTokenUsedQuery = `
                            UPDATE password_reset_tokens
                            SET used_at = NOW()
                            WHERE id = ?
                        `;


                        db.query(
                            markTokenUsedQuery,
                            [resetToken.id],
                            (
                                usedError
                            ) => {

                                if (usedError) {

                                    console.error(
                                        "TOKEN USED UPDATE ERROR:",
                                        usedError
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Password changed, but reset token could not be finalized."

                                    });

                                }


                                // =================================================
                                // SUCCESS
                                // =================================================

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
                "Something went wrong. Please try again."

        });

    }

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