const db = require("../config/db");


// =====================================================
// Add Item To Cart
// =====================================================

const addToCart = (
    userId,
    foodId,
    callback
) => {

    const checkFoodSql = `
        SELECT id
        FROM foods
        WHERE id = ?
        AND is_available = 1
    `;


    db.query(
        checkFoodSql,
        [foodId],
        (foodErr, foodResult) => {

            if (foodErr)
                return callback(foodErr);


            if (
                !foodResult ||
                foodResult.length === 0
            ) {

                return callback(
                    new Error("Food not available")
                );

            }


            const checkCartSql = `
                SELECT id, quantity
                FROM cart
                WHERE user_id = ?
                AND food_id = ?
            `;


            db.query(
                checkCartSql,
                [
                    userId,
                    foodId
                ],
                (err, result) => {

                    if (err)
                        return callback(err);


                    /* ==========================
                       ITEM ALREADY EXISTS
                    ========================== */

                    if (
                        result.length > 0
                    ) {

                        const updateSql = `
                            UPDATE cart
                            SET quantity = quantity + 1
                            WHERE user_id = ?
                            AND food_id = ?
                        `;


                        return db.query(
                            updateSql,
                            [
                                userId,
                                foodId
                            ],
                            callback
                        );

                    }


                    /* ==========================
                       NEW ITEM
                    ========================== */

                    const insertSql = `
                        INSERT INTO cart
                        (
                            user_id,
                            food_id,
                            quantity
                        )
                        VALUES (?, ?, 1)
                    `;


                    db.query(
                        insertSql,
                        [
                            userId,
                            foodId
                        ],
                        callback
                    );

                }
            );

        }
    );

};


// =====================================================
// Get User Cart
// =====================================================

const getCartItems = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            cart.id,
            cart.user_id,
            cart.food_id,
            cart.quantity,

            foods.name,
            foods.description,
            foods.price,
            foods.category,
            foods.image,
            foods.is_available

        FROM cart

        INNER JOIN foods
            ON cart.food_id = foods.id

        WHERE cart.user_id = ?

        ORDER BY cart.created_at DESC
    `;


    db.query(
        sql,
        [userId],
        callback
    );

};


// =====================================================
// Increase Quantity
// =====================================================

const increaseQuantity = (
    cartId,
    userId,
    callback
) => {

    const sql = `
        UPDATE cart
        SET quantity = quantity + 1
        WHERE id = ?
        AND user_id = ?
    `;


    db.query(
        sql,
        [
            cartId,
            userId
        ],
        callback
    );

};


// =====================================================
// Decrease Quantity
// =====================================================

const decreaseQuantity = (
    cartId,
    userId,
    callback
) => {

    const sql = `
        UPDATE cart
        SET quantity =
            CASE
                WHEN quantity > 1
                    THEN quantity - 1
                ELSE 1
            END
        WHERE id = ?
        AND user_id = ?
    `;


    db.query(
        sql,
        [
            cartId,
            userId
        ],
        callback
    );

};


// =====================================================
// Remove Item
// =====================================================

const removeCartItem = (
    cartId,
    userId,
    callback
) => {

    const sql = `
        DELETE FROM cart
        WHERE id = ?
        AND user_id = ?
    `;


    db.query(
        sql,
        [
            cartId,
            userId
        ],
        callback
    );

};


// =====================================================
// Clear User Cart
// =====================================================

const clearCart = (
    userId,
    callback
) => {

    const sql = `
        DELETE FROM cart
        WHERE user_id = ?
    `;


    db.query(
        sql,
        [userId],
        callback
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    addToCart,

    getCartItems,

    removeCartItem,

    increaseQuantity,

    decreaseQuantity,

    clearCart

};