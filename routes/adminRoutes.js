const express = require("express");

const router = express.Router();


/* =========================================================
   ADMIN ROUTES
========================================================= */

const dashboardRoutes =
    require("./admin/dashboardRoutes");

const usersRoutes =
    require("./admin/usersRoutes");

const foodsRoutes =
    require("./admin/foodsRoutes");

const ordersRoutes =
    require("./admin/ordersRoutes");

const offersRoutes =
    require("./admin/offersRoutes");

const reportsRoutes =
    require("./admin/reportsRoutes");

const profileRoutes =
    require("./admin/profileRoutes");


/* =========================================================
   MOUNT ROUTES
========================================================= */

router.use(dashboardRoutes);

router.use(usersRoutes);

router.use(foodsRoutes);

router.use(ordersRoutes);

router.use(offersRoutes);

router.use(reportsRoutes);

router.use(profileRoutes);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;