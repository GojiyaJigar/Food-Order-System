/* =========================================================
   JIGATO ADMIN PROFILE MODEL
========================================================= */

const db = require("../../config/db");


/* =========================================================
   DB QUERY HELPER
========================================================= */

function query(sql, params = []) {

    return new Promise((resolve, reject) => {

        db.query(
            sql,
            params,
            (error, results) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(results);

            }
        );

    });

}


/* =========================================================
   GET ADMIN PROFILE
========================================================= */

const getAdminProfile = async (adminId) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            city,
            role,
            status,
            created_at
        FROM users
        WHERE id = ?
          AND role = 'admin'
        LIMIT 1
    `;

    const rows =
        await query(
            sql,
            [adminId]
        );


    if (
        !rows ||
        rows.length === 0
    ) {

        return null;

    }


    return rows[0];

};


/* =========================================================
   GET ADMIN WITH PASSWORD
========================================================= */

const getAdminWithPassword = async (
    adminId
) => {

    const sql = `
        SELECT
            id,
            name,
            email,
            phone,
            city,
            role,
            status,
            password,
            created_at
        FROM users
        WHERE id = ?
          AND role = 'admin'
        LIMIT 1
    `;

    const rows =
        await query(
            sql,
            [adminId]
        );


    if (
        !rows ||
        rows.length === 0
    ) {

        return null;

    }


    return rows[0];

};


/* =========================================================
   UPDATE ADMIN PROFILE
========================================================= */

const updateAdminProfile = async (
    adminId,
    data
) => {

    const sql = `
        UPDATE users
        SET
            name = ?,
            email = ?,
            phone = ?,
            city = ?
        WHERE id = ?
          AND role = 'admin'
        LIMIT 1
    `;


    const result =
        await query(
            sql,
            [
                data.name,
                data.email,
                data.phone || null,
                data.city || null,
                adminId
            ]
        );


    return result;

};


/* =========================================================
   UPDATE ADMIN PASSWORD
========================================================= */

const updateAdminPassword = async (
    adminId,
    hashedPassword
) => {

    const sql = `
        UPDATE users
        SET
            password = ?
        WHERE id = ?
          AND role = 'admin'
        LIMIT 1
    `;


    const result =
        await query(
            sql,
            [
                hashedPassword,
                adminId
            ]
        );


    return result;

};


/* =========================================================
   CHECK EMAIL USED BY ANOTHER USER
========================================================= */

const emailExistsForOtherUser = async (
    email,
    adminId
) => {

    const sql = `
        SELECT id
        FROM users
        WHERE email = ?
          AND id <> ?
        LIMIT 1
    `;


    const rows =
        await query(
            sql,
            [
                email,
                adminId
            ]
        );


    return (
        Array.isArray(rows) &&
        rows.length > 0
    );

};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getAdminProfile,

    getAdminWithPassword,

    updateAdminProfile,

    updateAdminPassword,

    emailExistsForOtherUser

};