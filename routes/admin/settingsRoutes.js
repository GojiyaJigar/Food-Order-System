const express = require("express");
const path = require("path");

const router = express.Router();

const settingsController =
    require("../../controllers/admin/settingsController");


// =====================================================
// ADMIN SETTINGS PAGE
// GET /admin/settings
// =====================================================

router.get(
    "/settings",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/settings.html"
            )
        );

    }
);


// =====================================================
// GET ADMIN SETTINGS
// GET /admin/api/settings
// =====================================================

router.get(
    "/api/settings",
    settingsController.getAdminSettings
);


// =====================================================
// UPDATE ADMIN SETTINGS
// PUT /admin/api/settings
// =====================================================

router.put(
    "/api/settings",
    settingsController.updateAdminSettings
);


module.exports = router;