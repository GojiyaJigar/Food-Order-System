// Import MySQL2 module
const mysql = require("mysql2");

// Create MySQL database connection configuration
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || "localhost",
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "food_order_system"
});

// Establish database connection with error handling
db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err.message);
        return;
    }
});

// Export database connection module
module.exports = db;