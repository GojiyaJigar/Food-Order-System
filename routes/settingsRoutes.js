const express = require("express");

const router = express.Router();

const settingsController =
    require("../controllers/admin/settingsController");


// =====================================================
// PUBLIC SETTINGS
// GET /api/settings
// =====================================================

router.get(
    "/api/settings",
    settingsController.getPublicSettings
);


module.exports = router;