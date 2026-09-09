const mysql = require("mysql2");


// =====================================================
// DATABASE CONNECTION
// =====================================================

const db = mysql.createConnection({

    host:
        process.env.MYSQLHOST || "localhost",

    port:
        process.env.MYSQLPORT || 3306,

    user:
        process.env.MYSQLUSER || "root",

    password:
        process.env.MYSQLPASSWORD || "",

    database:
        process.env.MYSQLDATABASE || "food_order_system"

});


// =====================================================
// CONNECT DATABASE
// =====================================================

db.connect((err) => {

    if (err) {

        console.error(
            "❌ MySQL Connection Error:",
            err.message
        );

        return;

    }


    console.log(
        "✅ MySQL Connected"
    );

});


// =====================================================
// EXPORT
// =====================================================

module.exports = db;