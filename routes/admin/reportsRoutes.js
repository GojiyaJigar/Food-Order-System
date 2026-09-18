const express = require("express");
const path = require("path");

const router = express.Router();

const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");

const {
    getReports
} = require("../../controllers/admin/reportsController");


/* PAGE */

router.get(
    "/reports",
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/reports.html"
            )
        );
    }
);


/* API */

router.get(
    "/api/reports",
    requireAdminAPI,
    getReports
);


module.exports = router;