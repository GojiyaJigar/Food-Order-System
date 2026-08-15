const db = require("../config/db");

// ==========================
// Get Cart For Checkout
// ==========================
const getCheckoutItems = (userId, callback) => {

    const sql = `
        SELECT
            cart.food_id,
            cart.quantity,

            foods.name AS food_name,
            foods.price,
            foods.image,

            restaurants.name AS restaurant_name

        FROM cart

        JOIN foods
            ON cart.food_id = foods.id

        LEFT JOIN restaurants
            ON foods.restaurant_id = restaurants.id

        WHERE cart.user_id = ?
    `;

    db.query(sql, [userId], callback);

};

module.exports = {
    getCheckoutItems
};

// ==========================
// Create Order
// ==========================
const createOrder = (
    userId,
    customerName,
    phone,
    address,
    city,
    state,
    pincode,
    totalAmount,
    paymentMethod,
    callback
) => {

    const sql = `
        INSERT INTO orders
        (
            user_id,
            customer_name,
            phone,
            address,
            city,
            state,
            pincode,
            total_amount,
            payment_method
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userId,
            customerName,
            phone,
            address,
            city,
            state,
            pincode,
            totalAmount,
            paymentMethod
        ],
        callback
    );

};


// ==========================
// Save Order Items
// ==========================
const saveOrderItems = (orderId, items, callback) => {

    const values = items.map(item => [

        orderId,
        item.food_id,
        item.quantity,
        item.price

    ]);

    const sql = `
        INSERT INTO order_items
        (
            order_id,
            food_id,
            quantity,
            price
        )
        VALUES ?
    `;

    db.query(sql, [values], callback);

};


// ==========================
// Clear User Cart
// ==========================
const clearCart = (userId, callback) => {

    const sql = `
        DELETE FROM cart
        WHERE user_id = ?
    `;

    db.query(sql, [userId], callback);

};


// ==========================
// Export
// ==========================
module.exports = {

    getCheckoutItems,
    createOrder,
    saveOrderItems,
    clearCart

};