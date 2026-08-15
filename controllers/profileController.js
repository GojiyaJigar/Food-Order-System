const db = require("../config/db");


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


    const sql = `
        SELECT
            u.id AS user_id,
            u.name AS user_name,
            u.email,
            u.phone AS user_phone,
            u.city AS user_city,

            p.id AS profile_id,
            p.full_name AS profile_name,
            p.phone AS profile_phone,
            p.date_of_birth,
            p.gender

        FROM users u

        LEFT JOIN profiles p
            ON p.user_id = u.id

        WHERE u.id = ?

        LIMIT 1
    `;


    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {

                console.error(
                    "GET PROFILE ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }


            if (!results.length) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });

            }


            const user = results[0];


            return res.json({

                success: true,

                profileExists:
                    !!user.profile_id,

                profile: {

                    user_id:
                        user.user_id,

                    /*
                     * Name:
                     * users aur profiles dono same rakhenge.
                     * Agar kisi reason se profile empty ho,
                     * users ka name show hoga.
                     */

                    full_name:
                        user.profile_name ||
                        user.user_name ||
                        "",

                    email:
                        user.email ||
                        "",

                    /*
                     * Phone:
                     * profiles priority,
                     * fallback users.
                     */

                    phone:
                        user.profile_phone ||
                        user.user_phone ||
                        "",

                    city:
                        user.user_city ||
                        "",

                    date_of_birth:
                        user.date_of_birth ||
                        "",

                    gender:
                        user.gender ||
                        ""

                }

            });

        }
    );

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
        gender
    } = req.body;


    if (
        !full_name ||
        !String(full_name).trim()
    ) {

        return res.status(400).json({
            success: false,
            message: "Full name is required."
        });

    }


    const cleanName =
        String(full_name).trim();

    const cleanPhone =
        phone
            ? String(phone).trim()
            : "";


    /*
     * Pehle check karenge profile already hai
     */

    const checkSQL = `
        SELECT id
        FROM profiles
        WHERE user_id = ?
        LIMIT 1
    `;


    db.query(
        checkSQL,
        [userId],
        (checkErr, results) => {

            if (checkErr) {

                console.error(
                    "CHECK PROFILE ERROR:",
                    checkErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }


            if (results.length > 0) {

                return res.status(409).json({
                    success: false,
                    message: "Profile already exists."
                });

            }


            const insertSQL = `
                INSERT INTO profiles
                (
                    user_id,
                    full_name,
                    phone,
                    date_of_birth,
                    gender
                )
                VALUES (?, ?, ?, ?, ?)
            `;


            db.query(
                insertSQL,
                [
                    userId,
                    cleanName,
                    cleanPhone,
                    date_of_birth || null,
                    gender || null
                ],
                (insertErr, result) => {

                    if (insertErr) {

                        console.error(
                            "CREATE PROFILE ERROR:",
                            insertErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Unable to create profile."
                        });

                    }


                    /*
                     * Profile create hone ke saath
                     * users table bhi sync karenge.
                     */

                    const updateUserSQL = `
                        UPDATE users
                        SET
                            name = ?,
                            phone = ?
                        WHERE id = ?
                    `;


                    db.query(
                        updateUserSQL,
                        [
                            cleanName,
                            cleanPhone,
                            userId
                        ],
                        (userErr) => {

                            if (userErr) {

                                console.error(
                                    "SYNC USER ERROR:",
                                    userErr
                                );

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
        gender
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !full_name ||
        !String(full_name).trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Full name is required."

        });

    }


    const cleanName =
        String(full_name).trim();

    const cleanPhone =
        phone
            ? String(phone).trim()
            : "";

    const cleanCity =
        city
            ? String(city).trim()
            : "";


    // =================================================
    // UPDATE USERS TABLE
    // =================================================

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
            cleanName,
            cleanPhone,
            cleanCity,
            userId
        ],

        (userErr) => {

            if (userErr) {

                console.error(
                    "UPDATE USERS ERROR:",
                    userErr
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to update account details."

                });

            }


            // =============================================
            // CHECK PROFILE
            // =============================================

            const checkProfileSQL = `

                SELECT id

                FROM profiles

                WHERE user_id = ?

                LIMIT 1

            `;


            db.query(

                checkProfileSQL,

                [userId],

                (profileErr, results) => {

                    if (profileErr) {

                        console.error(
                            "CHECK PROFILE ERROR:",
                            profileErr
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Unable to check profile."

                        });

                    }


                    // =====================================
                    // PROFILE DOES NOT EXIST
                    // =====================================

                    if (results.length === 0) {

                        const insertProfileSQL = `

                            INSERT INTO profiles

                            (
                                user_id,
                                full_name,
                                phone,
                                date_of_birth,
                                gender
                            )

                            VALUES (?, ?, ?, ?, ?)

                        `;


                        db.query(

                            insertProfileSQL,

                            [
                                userId,
                                cleanName,
                                cleanPhone,
                                date_of_birth || null,
                                gender || null
                            ],

                            (insertErr, result) => {

                                if (insertErr) {

                                    console.error(
                                        "CREATE PROFILE DURING UPDATE ERROR:",
                                        insertErr
                                    );

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
                                        cleanCity,

                                    profileId:
                                        result.insertId

                                });

                            }

                        );


                        return;

                    }


                    // =====================================
                    // PROFILE EXISTS
                    // =====================================

                    const updateProfileSQL = `

                        UPDATE profiles

                        SET
                            full_name = ?,
                            phone = ?,
                            date_of_birth = ?,
                            gender = ?

                        WHERE user_id = ?

                    `;


                    db.query(

                        updateProfileSQL,

                        [
                            cleanName,
                            cleanPhone,
                            date_of_birth || null,
                            gender || null,
                            userId
                        ],

                        (profileUpdateErr) => {

                            if (profileUpdateErr) {

                                console.error(
                                    "UPDATE PROFILES ERROR:",
                                    profileUpdateErr
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Account updated but profile could not be updated."

                                });

                            }


                            // =================================
                            // EVERYTHING SUCCESSFUL
                            // =================================

                            return res.json({

                                success: true,

                                message:
                                    "Profile updated successfully.",

                                city:
                                    cleanCity

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