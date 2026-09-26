const adminModel = require("../models/adminModel");
const getDashboard = (req, res) => {
  adminModel.getDashboardStats((statsErr, stats) => {
    if (statsErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to load dashboard statistics."
      });
    }
    adminModel.getRecentOrders((ordersErr, orders) => {
      if (ordersErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to load recent orders."
        });
      }
      res.json({
        success: true,
        stats,
        recentOrders: orders
      });
    });
  });
};
module.exports = {
  getDashboard
};