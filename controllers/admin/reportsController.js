const reportsModel = require("../../models/admin/reportsModel");

// Get Analytical Reports
const getReports = (req, res) => {
    const range = String(req.query.range || "month").toLowerCase();
    const start = req.query.start || null;
    const end = req.query.end || null;

    const allowed = ["today", "week", "month", "custom"];

    if (!allowed.includes(range)) {
        return res.status(400).json({
            success: false,
            message: "Invalid report range."
        });
    }

    if (range === "custom" && (!start || !end)) {
        return res.status(400).json({
            success: false,
            message: "Start date and end date are required."
        });
    }

    if (range === "custom" && start > end) {
        return res.status(400).json({
            success: false,
            message: "End date must be after start date."
        });
    }

    reportsModel.getReports(range, start, end, (error, reports) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: "Unable to load reports."
            });
        }

        return res.json({
            success: true,
            ...reports
        });
    });
};

// Export Modules
module.exports = {
    getReports
};