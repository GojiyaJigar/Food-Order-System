const bcrypt = require("bcrypt");
const db = require("../config/db");
const userModel = require("../models/userModel");


// =====================================================
// REGISTER
// =====================================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            city,
            password
        } = req.body;


        const cleanName =
            String(name || "").trim();

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone || "")
                .replace(/\D/g, "")
                .trim();

        const cleanCity =
            String(city || "").trim();


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


        if (!/^\d{10}$/.test(cleanPhone)) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid 10-digit mobile number."

            });

        }


        if (String(password).length < 6) {

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
            async (checkError, existingUsers) => {

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


                if (existingUsers.length > 0) {

                    const existing =
                        existingUsers[0];


                    // EMAIL DUPLICATE
                    if (
                        String(existing.email || "")
                            .trim()
                            .toLowerCase() ===
                        cleanEmail
                    ) {

                        return res.status(409).json({

                            success: false,

                            field: "email",

                            message:
                                "This email is already registered."

                        });

                    }


                    // PHONE DUPLICATE
                    if (
                        String(existing.phone || "")
                            .replace(/\D/g, "")
                            === cleanPhone
                    ) {

                        return res.status(409).json({

                            success: false,

                            field: "phone",

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
                // IMPORTANT: ALWAYS CUSTOMER
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
                    (insertError, result) => {

                        if (insertError) {

                            console.error(
                                "REGISTER INSERT ERROR:",
                                insertError
                            );


                            // MySQL duplicate safety
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

                            userId: result.insertId

                        });

                    }
                );

            }
        );

    } catch (error) {

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
        (err, result) => {

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
                (compareError, isMatch) => {

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


                    /*
                     * Create fresh session
                     */

                    req.session.regenerate(
                        (sessionError) => {

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


                            /*
                             * Save session
                             */

                            req.session.userId =
                                user.id;

                            req.session.role =
                                user.role;

                            req.session.name =
                                user.name;

                            req.session.city =
                                user.city;


                            req.session.save(
                                (saveError) => {

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

// =====================================================
// LOGOUT
// =====================================================

const logoutUser = (req, res) => {

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


    req.session.destroy((err) => {

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

    });

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    registerUser,

    loginUser,

    checkAuth,

    logoutUser

};