const fs = require("fs");
const path = require("path");
const foodsModel = require("../../models/admin/foodsModel");

// Helper: Delete Image File
const deleteImageFile = (filename) => {
    if (!filename) return;

    const cleanName = path.basename(String(filename));
    const filePath = path.join(__dirname, "../../public/images/foods", cleanName);

    fs.unlink(filePath, (error) => {
        // Silently handle error if needed
    });
};

// Get All Foods
const getFoods = (req, res) => {
    foodsModel.getAllFoods((error, foods) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to load menu."
            });
        }

        return res.json({
            success: true,
            foods: foods || []
        });
    });
};

// Get Single Food By ID
const getFoodById = (req, res) => {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid food ID."
        });
    }

    foodsModel.getFoodById(foodId, (error, food) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to load food."
            });
        }

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        return res.json({
            success: true,
            food
        });
    });
};

// Create New Food Item
const createFood = (req, res) => {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const price = Number(body.price);
    const isAvailable = Number(body.is_available) === 0 ? 0 : 1;

    // Validation
    if (!name) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Food name is required."
        });
    }

    if (!Number.isFinite(price) || price < 0) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Enter a valid food price."
        });
    }

    if (!category) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Category is required."
        });
    }

    // Image Validation
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a food image."
        });
    }

    // Data Payload
    const data = {
        name,
        description,
        price: Number(price.toFixed(2)),
        category,
        image: req.file.filename,
        is_available: isAvailable
    };

    // Database Operation
    foodsModel.createFood(data, (error, result) => {
        if (error) {
            deleteImageFile(req.file.filename);
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to add food."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Food added successfully.",
            foodId: result.insertId,
            image: req.file.filename
        });
    });
};

// Update Existing Food Item
const updateFood = (req, res) => {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Invalid food ID."
        });
    }

    const body = req.body || {};
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const price = Number(body.price);
    const isAvailable = Number(body.is_available) === 0 ? 0 : 1;

    // Validation
    if (!name) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Food name is required."
        });
    }

    if (!Number.isFinite(price) || price < 0) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Enter a valid food price."
        });
    }

    if (!category) {
        if (req.file) deleteImageFile(req.file.filename);
        return res.status(400).json({
            success: false,
            message: "Category is required."
        });
    }

    // Check Current Item Availability
    foodsModel.getFoodById(foodId, (findError, existingFood) => {
        if (findError) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(500).json({
                success: false,
                message: "Unable to load existing food."
            });
        }

        if (!existingFood) {
            if (req.file) deleteImageFile(req.file.filename);
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const image = req.file ? req.file.filename : existingFood.image;

        const data = {
            name,
            description,
            price: Number(price.toFixed(2)),
            category,
            image,
            is_available: isAvailable
        };

        foodsModel.updateFood(foodId, data, (error, result) => {
            if (error) {
                if (req.file) deleteImageFile(req.file.filename);
                return res.status(500).json({
                    success: false,
                    message: error.sqlMessage || error.message || "Unable to update food."
                });
            }

            if (!result || !result.affectedRows) {
                if (req.file) deleteImageFile(req.file.filename);
                return res.status(404).json({
                    success: false,
                    message: "Food item not found."
                });
            }

            return res.json({
                success: true,
                message: "Food updated successfully.",
                image
            });
        });
    });
};

// Toggle Food Availability Status
const updateFoodStatus = (req, res) => {
    const foodId = Number(req.params.id);
    const status = Number(req.body?.is_available);

    if (!Number.isInteger(foodId) || foodId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid food ID."
        });
    }

    if (status !== 0 && status !== 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid availability status."
        });
    }

    foodsModel.updateFoodStatus(foodId, status, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to update availability."
            });
        }

        if (!result || !result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        return res.json({
            success: true,
            message: status === 1 ? "Food is now available." : "Food is now unavailable.",
            is_available: status
        });
    });
};

// Delete Food Item
const deleteFood = (req, res) => {
    const foodId = Number(req.params.id);

    if (!Number.isInteger(foodId) || foodId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid food ID."
        });
    }

    foodsModel.getFoodById(foodId, (findError, food) => {
        if (findError) {
            return res.status(500).json({
                success: false,
                message: "Unable to load food."
            });
        }

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        foodsModel.getFoodOrderCount(foodId, (checkError, orderCount) => {
            if (checkError) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to verify food order history."
                });
            }

            if (orderCount > 0) {
                return res.status(409).json({
                    success: false,
                    message: "This food cannot be deleted because it exists in order history. Mark it unavailable instead."
                });
            }

            foodsModel.deleteFood(foodId, (error, result) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: error.sqlMessage || error.message || "Unable to delete food."
                    });
                }

                if (!result || !result.affectedRows) {
                    return res.status(404).json({
                        success: false,
                        message: "Food item not found."
                    });
                }

                if (food.image) {
                    deleteImageFile(food.image);
                }

                return res.json({
                    success: true,
                    message: "Food deleted successfully."
                });
            });
        });
    });
};

// Export Modules
module.exports = {
    getFoods,
    getFoodById,
    createFood,
    updateFood,
    updateFoodStatus,
    deleteFood
};