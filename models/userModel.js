const db = require("../config/db");

// =============================
// Create New User
// =============================

const createUser = (userData, callback) => {

    const sql = `
        INSERT INTO users
        (name, email, phone, city, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [
            userData.name,
            userData.email,
            userData.phone,
            userData.city,
            userData.password,
            userData.role
        ],

        callback

    );

};

// =============================
// Find User By Email
// =============================

const findUserByEmail = (email, callback) => {

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], callback);

};

// =============================
// Export Functions
// =============================

module.exports = {

    createUser,

    findUserByEmail

};