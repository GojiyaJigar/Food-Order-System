const db = require("../../config/db");


/* =========================================================
   GET ALL FOODS
========================================================= */

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

        ORDER BY created_at DESC, id DESC
    `;

    db.query(
        sql,
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            callback(
                null,
                rows || []
            );
        }
    );
};


/* =========================================================
   GET FOOD BY ID
========================================================= */

const getFoodById = (
    foodId,
    callback
) => {

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

        WHERE id = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [foodId],
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            callback(
                null,
                rows && rows.length
                    ? rows[0]
                    : null
            );
        }
    );
};


/* =========================================================
   CREATE FOOD
========================================================= */

const createFood = (
    data,
    callback
) => {

    const sql = `
        INSERT INTO foods (
            name,
            description,
            price,
            category,
            image,
            is_available
        )

        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.name,
            data.description,
            data.price,
            data.category,
            data.image,
            data.is_available
        ],
        callback
    );
};


/* =========================================================
   UPDATE FOOD
========================================================= */

const updateFood = (
    foodId,
    data,
    callback
) => {

    const sql = `
        UPDATE foods

        SET
            name = ?,
            description = ?,
            price = ?,
            category = ?,
            image = ?,
            is_available = ?

        WHERE id = ?
    `;

    db.query(
        sql,
        [
            data.name,
            data.description,
            data.price,
            data.category,
            data.image,
            data.is_available,
            foodId
        ],
        callback
    );
};


/* =========================================================
   UPDATE AVAILABILITY
========================================================= */

const updateFoodStatus = (
    foodId,
    status,
    callback
) => {

    const sql = `
        UPDATE foods

        SET is_available = ?

        WHERE id = ?
    `;

    db.query(
        sql,
        [
            status,
            foodId
        ],
        callback
    );
};


/* =========================================================
   CHECK FOOD ORDER HISTORY
========================================================= */

const getFoodOrderCount = (
    foodId,
    callback
) => {

    const sql = `
        SELECT
            COUNT(*) AS total_usage

        FROM order_items

        WHERE food_id = ?
    `;

    db.query(
        sql,
        [foodId],
        (error, rows) => {

            if (error) {
                return callback(error);
            }

            callback(
                null,
                rows && rows.length
                    ? Number(
                        rows[0].total_usage || 0
                    )
                    : 0
            );
        }
    );
};


/* =========================================================
   DELETE FOOD
========================================================= */

const deleteFood = (
    foodId,
    callback
) => {

    const sql = `
        DELETE FROM foods

        WHERE id = ?
    `;

    db.query(
        sql,
        [foodId],
        callback
    );
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getAllFoods,

    getFoodById,

    createFood,

    updateFood,

    updateFoodStatus,

    getFoodOrderCount,

    deleteFood
};