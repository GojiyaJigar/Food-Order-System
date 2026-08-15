const express=require("express");

const router=express.Router();

const {getRestaurants}=require("../controllers/restaurantController");

router.get("/restaurants",getRestaurants);

module.exports=router;