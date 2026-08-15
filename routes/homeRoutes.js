const express = require("express");

const router = express.Router();

const {
    getHomeData,
    searchHome
} = require("../controllers/homeController");


router.get(
    "/api/home",
    getHomeData
);


router.get(
    "/api/home/search",
    searchHome
);


module.exports = router;


module.exports = router;