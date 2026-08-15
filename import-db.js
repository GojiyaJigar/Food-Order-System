const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function importDatabase() {
    let db;

    try {
        const sqlFile = path.join(__dirname, "food-order-system.sql");
        const sql = fs.readFileSync(sqlFile, "utf8");

        db = await mysql.createConnection({
            host: process.env.MYSQLHOST,
            port: Number(process.env.MYSQLPORT),
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            multipleStatements: true
        });

        console.log("✅ Connected to Railway MySQL");

        await db.query(sql);

        console.log("✅ Database imported successfully!");
    } catch (error) {
        console.error("❌ Database import failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (db) {
            await db.end();
        }
    }
}

importDatabase();
