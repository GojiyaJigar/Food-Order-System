const db = require("../config/db");

// Add Item To Cart
const addToCart = (userId, foodId, callback) => {

    const checkSql = `
        SELECT * 
        FROM cart 
        WHERE user_id = ? AND food_id = ?
    `;

    db.query(checkSql, [userId, foodId], (err, result) => {

        if (err) return callback(err);

        // Item already exists -> Increase quantity
        if (result.length > 0) {

            const updateSql = `
                UPDATE cart
                SET quantity = quantity + 1
                WHERE user_id = ? AND food_id = ?
            `;

            db.query(updateSql, [userId, foodId], callback);

        } else {

            // New Item
            const insertSql = `
                INSERT INTO cart (user_id, food_id, quantity)
                VALUES (?, ?, 1)
            `;

            db.query(insertSql, [userId, foodId], callback);

        }

    });

};


// Get User Cart
const getCartItems = (userId, callback) => {

    const sql = `
        SELECT
            cart.id,
            cart.quantity,
            foods.id AS food_id,
            foods.name,
            foods.price,
            foods.image,
            restaurants.name AS restaurant
        FROM cart
        JOIN foods ON cart.food_id = foods.id
        JOIN restaurants ON foods.restaurant_id = restaurants.id
        WHERE cart.user_id = ?
        ORDER BY cart.created_at DESC
    `;

    db.query(sql, [userId], callback);

};


// Increase Quantity
const increaseQuantity = (cartId, callback) => {

    const sql = `
        UPDATE cart
        SET quantity = quantity + 1
        WHERE id = ?
    `;

    db.query(sql, [cartId], callback);

};

const decreaseQuantity = (cartId, callback) => {

    const sql = `
        UPDATE cart
        SET quantity =
            CASE
                WHEN quantity > 1 THEN quantity - 1
                ELSE 1
            END
        WHERE id = ?
    `;

    db.query(sql, [cartId], callback);

};



// Remove Item
const removeCartItem = (cartId, callback) => {

    const sql = `
        DELETE FROM cart
        WHERE id = ?
    `;

    db.query(sql, [cartId], callback);

};


// Clear User Cart
const clearCart = (userId, callback) => {

    const sql = `
        DELETE FROM cart
        WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);

};



module.exports = {
    addToCart,
    getCartItems,
    removeCartItem,
    increaseQuantity,
    decreaseQuantity
};