const db = require("../config/db");


/* =====================================================
   GET ALL AVAILABLE FOODS
===================================================== */

const getAllFoods = (callback) => {

    const sql = `
        SELECT
            id,
            name,
            description,
            price,
            category,
            image,
            is_available,
            created_at
        FROM foods
        WHERE is_available = 1
        ORDER BY category ASC, name ASC
    `;

    db.query(sql, callback);

};


module.exports = {
    getAllFoods
};