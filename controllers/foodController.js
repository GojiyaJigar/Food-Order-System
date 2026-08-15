const foodModel = require("../models/foodModel");

const getRestaurantMenu = (req, res) => {

    const restaurantId = req.params.id;

    console.log("Restaurant ID:", restaurantId);

    foodModel.getRestaurant(restaurantId, (err, restaurant) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (!restaurant || restaurant.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Restaurant Not Found"
            });
        }

        foodModel.getFoodsByRestaurant(restaurantId, (err, foods) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            return res.status(200).json({
                success: true,
                restaurant: restaurant[0],
                foods: foods
            });

        });

    });

};

module.exports = {
    getRestaurantMenu
};