const db = require("../config/db");

const getDashboardStats = (callback) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM users) AS totalUsers,

      (SELECT COUNT(*)
       FROM foods
       WHERE is_available = 1) AS totalFoods,

      (SELECT COUNT(*)
       FROM orders) AS totalOrders,

      (SELECT COALESCE(SUM(total_amount), 0)
       FROM orders
       WHERE order_status != 'Cancelled') AS totalRevenue,

      (SELECT COUNT(*)
       FROM orders
       WHERE order_status = 'Pending') AS pendingOrders,

      (SELECT COUNT(*)
       FROM orders
       WHERE order_status = 'Delivered') AS deliveredOrders,

      (SELECT COUNT(*)
       FROM offers
       WHERE is_active = 1
       AND NOW() >= start_date
       AND NOW() <= end_date) AS activeOffers
  `;

  db.query(query, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, result[0]);
  });
};

const getRecentOrders = (callback) => {
  const query = `
    SELECT
      id,
      customer_name,
      total_amount,
      payment_method,
      order_status,
      created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 8
  `;

  db.query(query, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, result);
  });
};

module.exports = {
  getDashboardStats,
  getRecentOrders
};