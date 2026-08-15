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
   TOP RATED RESTAURANTS
===================================================== */

const getTopRatedRestaurants = (callback) => {

    const sql = `
        SELECT
            id,
            name,
            image,
            category,
            city,
            rating,
            delivery_time,
            address,
            is_open,
            created_at
        FROM restaurants
        ORDER BY rating DESC
        LIMIT 6
    `;

    db.query(sql, callback);
};


/* =====================================================
   RECENT RESTAURANTS
===================================================== */

const getRecentRestaurants = (callback) => {

    const sql = `
        SELECT
            id,
            name,
            image,
            category,
            city,
            rating,
            delivery_time,
            address,
            is_open,
            created_at
        FROM restaurants
        ORDER BY created_at DESC
        LIMIT 6
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
            f.id,
            f.restaurant_id,
            f.name,
            f.description,
            f.price,
            f.category,
            f.image,
            f.is_available,
            f.created_at,

            r.name AS restaurant_name,
            r.rating AS restaurant_rating,
            r.delivery_time,
            r.city,
            r.is_open

        FROM foods f

        INNER JOIN restaurants r
            ON f.restaurant_id = r.id

        WHERE
            f.is_available = 1
            AND r.is_open = 1

        ORDER BY f.created_at DESC

        LIMIT 6
    `;

    db.query(sql, callback);
};


/* =====================================================
   ALL RESTAURANTS
   USED FOR SEARCH
===================================================== */

const getAllRestaurants = (callback) => {

    const sql = `
        SELECT
            id,
            name,
            image,
            category,
            city,
            rating,
            delivery_time,
            address,
            is_open,
            created_at
        FROM restaurants
        ORDER BY name ASC
    `;

    db.query(sql, callback);
};


/* =====================================================
   ALL FOODS
   USED FOR SEARCH
===================================================== */

const getAllFoods = (callback) => {

    const sql = `
        SELECT
            f.id,
            f.restaurant_id,
            f.name,
            f.description,
            f.price,
            f.category,
            f.image,
            f.is_available,
            f.created_at,

            r.name AS restaurant_name,
            r.rating AS restaurant_rating,
            r.delivery_time,
            r.city,
            r.is_open

        FROM foods f

        INNER JOIN restaurants r
            ON f.restaurant_id = r.id

        WHERE f.is_available = 1

        ORDER BY f.name ASC
    `;

    db.query(sql, callback);
};


module.exports = {

    getCategories,
    getTopRatedRestaurants,
    getRecentRestaurants,
    getHomeFoods,
    getAllRestaurants,
    getAllFoods

};