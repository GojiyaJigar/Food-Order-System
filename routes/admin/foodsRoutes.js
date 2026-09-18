const express = require("express");
const path = require("path");

const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const router = express.Router();

const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");

const {
    getFoods,
    getFoodById,
    createFood,
    updateFood,
    updateFoodStatus,
    deleteFood
} = require("../../controllers/admin/foodsController");


// ============================================================
// FOOD IMAGE UPLOAD CONFIG
// ============================================================

const uploadDirectory = path.join(
    __dirname,
    "../../public/images/foods"
);


// Folder automatically create
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}


// Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname)
                .toLowerCase();

        const randomName =
            crypto.randomBytes(12)
                .toString("hex");

        const filename =
            `food-${Date.now()}-${randomName}${extension}`;

        cb(null, filename);
    }

});


// File validation
const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {

        return cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            )
        );
    }

    cb(null, true);
};


// Upload middleware
const uploadFoodImage = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// ============================================================
// MENU PAGE
// ============================================================

router.get(
    "/foods",
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/foods.html"
            )
        );

    }
);


// ============================================================
// GET ALL FOODS
// ============================================================

router.get(
    "/api/foods",
    requireAdminAPI,
    getFoods
);


// ============================================================
// GET SINGLE FOOD
// ============================================================

router.get(
    "/api/foods/:id",
    requireAdminAPI,
    getFoodById
);


// ============================================================
// CREATE FOOD
// IMPORTANT: upload.single("image")
// ============================================================

router.post(
    "/api/foods",
    requireAdminAPI,
    uploadFoodImage.single("image"),
    createFood
);


// ============================================================
// UPDATE FOOD
// Image optional during edit
// ============================================================

router.put(
    "/api/foods/:id",
    requireAdminAPI,
    uploadFoodImage.single("image"),
    updateFood
);


// ============================================================
// AVAILABILITY
// ============================================================

router.patch(
    "/api/foods/:id/status",
    requireAdminAPI,
    updateFoodStatus
);


// ============================================================
// DELETE
// ============================================================

router.delete(
    "/api/foods/:id",
    requireAdminAPI,
    deleteFood
);


// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
    (error, req, res, next) => {

        if (error instanceof multer.MulterError) {

            if (error.code === "LIMIT_FILE_SIZE") {

                return res.status(400).json({
                    success: false,
                    message:
                        "Image size must be 5 MB or less."
                });

            }

            return res.status(400).json({
                success: false,
                message: error.message
            });
        }


        if (error) {

            return res.status(400).json({
                success: false,
                message:
                    error.message ||
                    "Image upload failed."
            });

        }

        next();

    }
);


module.exports = router;