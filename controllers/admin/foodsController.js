const fs = require("fs");
const path = require("path");

const foodsModel =
    require("../../models/admin/foodsModel");


// ============================================================
// HELPERS
// ============================================================

const deleteImageFile = (filename) => {

    if (!filename) {
        return;
    }

    const cleanName =
        path.basename(String(filename));

    const filePath =
        path.join(
            __dirname,
            "../../public/images/foods",
            cleanName
        );

    fs.unlink(filePath, (error) => {

        if (error && error.code !== "ENOENT") {

            console.error(
                "IMAGE DELETE ERROR:",
                error
            );

        }

    });

};


// ============================================================
// GET ALL FOODS
// ============================================================

const getFoods = (req, res) => {

    foodsModel.getAllFoods(
        (error, foods) => {

            if (error) {

                console.error(
                    "GET FOODS ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to load menu."
                });

            }

            return res.json({
                success: true,
                foods: foods || []
            });

        }
    );

};


// ============================================================
// GET SINGLE FOOD
// ============================================================

const getFoodById = (req, res) => {

    const foodId =
        Number(req.params.id);

    if (
        !Number.isInteger(foodId) ||
        foodId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid food ID."
        });

    }


    foodsModel.getFoodById(
        foodId,
        (error, food) => {

            if (error) {

                console.error(
                    "GET FOOD ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to load food."
                });

            }


            if (!food) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Food item not found."
                });

            }


            return res.json({
                success: true,
                food
            });

        }
    );

};


// ============================================================
// CREATE FOOD
// ============================================================

const createFood = (req, res) => {

    const body = req.body || {};

    const name =
        String(body.name || "")
            .trim();

    const description =
        String(body.description || "")
            .trim();

    const category =
        String(body.category || "")
            .trim();

    const price =
        Number(body.price);

    const isAvailable =
        Number(body.is_available) === 0
            ? 0
            : 1;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Food name is required."
        });

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Enter a valid food price."
        });

    }


    if (!category) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Category is required."
        });

    }


    // --------------------------------------------------------
    // IMAGE REQUIRED FOR NEW FOOD
    // --------------------------------------------------------

    if (!req.file) {

        return res.status(400).json({
            success: false,
            message:
                "Please upload a food image."
        });

    }


    // --------------------------------------------------------
    // DATA
    // --------------------------------------------------------

    const data = {

        name,

        description,

        price:
            Number(
                price.toFixed(2)
            ),

        category,

        image:
            req.file.filename,

        is_available:
            isAvailable

    };


    // --------------------------------------------------------
    // DATABASE
    // --------------------------------------------------------

    foodsModel.createFood(
        data,
        (error, result) => {

            if (error) {

                console.error(
                    "CREATE FOOD ERROR:",
                    error
                );


                // DB fail → remove uploaded image
                deleteImageFile(
                    req.file.filename
                );


                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to add food."
                });

            }


            return res.status(201).json({

                success: true,

                message:
                    "Food added successfully.",

                foodId:
                    result.insertId,

                image:
                    req.file.filename

            });

        }
    );

};


// ============================================================
// UPDATE FOOD
// ============================================================

const updateFood = (req, res) => {

    const foodId =
        Number(req.params.id);


    if (
        !Number.isInteger(foodId) ||
        foodId <= 0
    ) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Invalid food ID."
        });

    }


    const body =
        req.body || {};


    const name =
        String(body.name || "")
            .trim();

    const description =
        String(body.description || "")
            .trim();

    const category =
        String(body.category || "")
            .trim();

    const price =
        Number(body.price);

    const isAvailable =
        Number(body.is_available) === 0
            ? 0
            : 1;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Food name is required."
        });

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Enter a valid food price."
        });

    }


    if (!category) {

        if (req.file) {
            deleteImageFile(req.file.filename);
        }

        return res.status(400).json({
            success: false,
            message:
                "Category is required."
        });

    }


    // --------------------------------------------------------
    // GET CURRENT FOOD
    // --------------------------------------------------------

    foodsModel.getFoodById(
        foodId,
        (findError, existingFood) => {

            if (findError) {

                if (req.file) {
                    deleteImageFile(
                        req.file.filename
                    );
                }

                console.error(
                    "GET FOOD BEFORE UPDATE ERROR:",
                    findError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load existing food."
                });

            }


            if (!existingFood) {

                if (req.file) {
                    deleteImageFile(
                        req.file.filename
                    );
                }

                return res.status(404).json({
                    success: false,
                    message:
                        "Food item not found."
                });

            }


            // ------------------------------------------------
            // KEEP OLD IMAGE IF NEW IMAGE NOT SELECTED
            // ------------------------------------------------

            const image =
                req.file
                    ? req.file.filename
                    : existingFood.image;


            const data = {

                name,

                description,

                price:
                    Number(
                        price.toFixed(2)
                    ),

                category,

                image,

                is_available:
                    isAvailable

            };


            foodsModel.updateFood(
                foodId,
                data,
                (error, result) => {

                    if (error) {

                        if (req.file) {
                            deleteImageFile(
                                req.file.filename
                            );
                        }

                        console.error(
                            "UPDATE FOOD ERROR:",
                            error
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                error.sqlMessage ||
                                error.message ||
                                "Unable to update food."
                        });

                    }


                    if (
                        !result ||
                        !result.affectedRows
                    ) {

                        if (req.file) {
                            deleteImageFile(
                                req.file.filename
                            );
                        }

                        return res.status(404).json({
                            success: false,
                            message:
                                "Food item not found."
                        });

                    }


                    return res.json({

                        success: true,

                        message:
                            "Food updated successfully.",

                        image

                    });

                }
            );

        }
    );

};


// ============================================================
// TOGGLE AVAILABILITY
// ============================================================

const updateFoodStatus = (req, res) => {

    const foodId =
        Number(req.params.id);

    const status =
        Number(
            req.body?.is_available
        );


    if (
        !Number.isInteger(foodId) ||
        foodId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid food ID."
        });

    }


    if (
        status !== 0 &&
        status !== 1
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid availability status."
        });

    }


    foodsModel.updateFoodStatus(
        foodId,
        status,
        (error, result) => {

            if (error) {

                console.error(
                    "FOOD STATUS ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to update availability."
                });

            }


            if (
                !result ||
                !result.affectedRows
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Food item not found."
                });

            }


            return res.json({

                success: true,

                message:
                    status === 1
                        ? "Food is now available."
                        : "Food is now unavailable.",

                is_available:
                    status

            });

        }
    );

};


// ============================================================
// DELETE FOOD
// ============================================================

const deleteFood = (req, res) => {

    const foodId =
        Number(req.params.id);


    if (
        !Number.isInteger(foodId) ||
        foodId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid food ID."
        });

    }


    // --------------------------------------------------------
    // FIRST GET FOOD
    // --------------------------------------------------------

    foodsModel.getFoodById(
        foodId,
        (findError, food) => {

            if (findError) {

                console.error(
                    "GET FOOD BEFORE DELETE ERROR:",
                    findError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load food."
                });

            }


            if (!food) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Food item not found."
                });

            }


            // ------------------------------------------------
            // CHECK ORDER HISTORY
            // ------------------------------------------------

            foodsModel.getFoodOrderCount(
                foodId,
                (checkError, orderCount) => {

                    if (checkError) {

                        console.error(
                            "FOOD DELETE CHECK ERROR:",
                            checkError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Unable to verify food order history."
                        });

                    }


                    if (orderCount > 0) {

                        return res.status(409).json({
                            success: false,
                            message:
                                "This food cannot be deleted because it exists in order history. Mark it unavailable instead."
                        });

                    }


                    // ----------------------------------------
                    // DELETE DATABASE RECORD
                    // ----------------------------------------

                    foodsModel.deleteFood(
                        foodId,
                        (error, result) => {

                            if (error) {

                                console.error(
                                    "DELETE FOOD ERROR:",
                                    error
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        error.sqlMessage ||
                                        error.message ||
                                        "Unable to delete food."
                                });

                            }


                            if (
                                !result ||
                                !result.affectedRows
                            ) {

                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Food item not found."
                                });

                            }


                            // ----------------------------
                            // DELETE IMAGE
                            // ----------------------------

                            if (food.image) {
                                deleteImageFile(
                                    food.image
                                );
                            }


                            return res.json({
                                success: true,
                                message:
                                    "Food deleted successfully."
                            });

                        }
                    );

                }
            );

        }
    );

};


module.exports = {

    getFoods,

    getFoodById,

    createFood,

    updateFood,

    updateFoodStatus,

    deleteFood

};