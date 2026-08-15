const db = require("../config/db");

// Get Restaurant Details
const getRestaurant = (restaurantId, callback) => {

    const sql = "SELECT * FROM restaurants WHERE id = ?";

    db.query(sql, [restaurantId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });

};

// Get Foods By Restaurant
const getFoodsByRestaurant = (restaurantId, callback) => {

    const sql = `
        SELECT *
        FROM foods
        WHERE restaurant_id = ?
        ORDER BY category, name
    `;

    db.query(sql, [restaurantId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });

};

module.exports = {
    getRestaurant,
    getFoodsByRestaurant
};