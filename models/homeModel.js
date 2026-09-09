const db = require("../config/db");


/* =====================================================
   CATEGORIES
===================================================== */

const getCategories = (callback) => {

    const sql = `
        SELECT DISTINCT category
        FROM foods
        WHERE category IS NOT NULL
        AND category != ''
        AND is_available = 1
        ORDER BY category ASC
    `;

    db.query(sql, callback);
};


/* =====================================================
   HOME FOODS
   ONLY 6 FOODS
===================================================== */

const getHomeFoods = (callback) => {

    const sql = `
        SELECT
            id,
            restaurant_id,
            name,
            description,
            price,
            category,
            image,
            is_available,
            created_at
        FROM foods
        WHERE is_available = 1
        ORDER BY created_at DESC
        LIMIT 6
    `;

    db.query(sql, callback);
};


/* =====================================================
   ALL FOODS
   USED FOR MENU + SEARCH
===================================================== */

const getAllFoods = (callback) => {

    const sql = `
        SELECT
            id,
            restaurant_id,
            name,
            description,
            price,
            category,
            image,
            is_available,
            created_at
        FROM foods
        WHERE is_available = 1
        ORDER BY name ASC
    `;

    db.query(sql, callback);
};


module.exports = {

    getCategories,
    getHomeFoods,
    getAllFoods

};