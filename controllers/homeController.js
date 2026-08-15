const homeModel = require("../models/homeModel");


/* =====================================================
   HOME PAGE DATA
===================================================== */

const getHomeData = (req, res) => {

    homeModel.getCategories((error, categories) => {

        if (error) {

            console.error("Categories Error:", error);

            return res.status(500).json({
                success: false,
                message: "Categories load nahi hui"
            });

        }


        homeModel.getTopRatedRestaurants(
            (error, topRated) => {

                if (error) {

                    console.error(
                        "Top Rated Error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Restaurants load nahi hue"
                    });

                }


                homeModel.getRecentRestaurants(
                    (error, recent) => {

                        if (error) {

                            console.error(
                                "Recent Error:",
                                error
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Recent restaurants load nahi hue"
                            });

                        }


                        homeModel.getHomeFoods(
                            (error, foods) => {

                                if (error) {

                                    console.error(
                                        "Foods Error:",
                                        error
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Foods load nahi hue"
                                    });

                                }


                                res.json({

                                    success: true,

                                    categories:
                                        categories || [],

                                    topRated:
                                        topRated || [],

                                    recent:
                                        recent || [],

                                    foods:
                                        foods || []

                                });

                            }
                        );

                    }
                );

            }
        );

    });

};


/* =====================================================
   SEARCH
   ALL RESTAURANTS + ALL FOODS
===================================================== */

const searchHome = (req, res) => {

    const q =
        String(
            req.query.q || ""
        ).trim();


    if (!q) {

        return res.json({
            success: true,
            restaurants: [],
            foods: []
        });

    }


    homeModel.getAllRestaurants(
        (restaurantError, restaurants) => {

            if (restaurantError) {

                console.error(
                    "Search Restaurant Error:",
                    restaurantError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Restaurant search failed"
                });

            }


            homeModel.getAllFoods(
                (foodError, foods) => {

                    if (foodError) {

                        console.error(
                            "Search Food Error:",
                            foodError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Food search failed"
                        });

                    }


                    const search =
                        q.toLowerCase();


                    const matchedRestaurants =
                        restaurants.filter(
                            restaurant => {

                                const text = `

                                    ${restaurant.name || ""}

                                    ${restaurant.category || ""}

                                    ${restaurant.city || ""}

                                    ${restaurant.address || ""}

                                `.toLowerCase();


                                return text.includes(
                                    search
                                );

                            }
                        );


                    const matchedFoods =
                        foods.filter(
                            food => {

                                const text = `

                                    ${food.name || ""}

                                    ${food.category || ""}

                                    ${food.description || ""}

                                    ${food.restaurant_name || ""}

                                    ${food.city || ""}

                                `.toLowerCase();


                                return text.includes(
                                    search
                                );

                            }
                        );


                    res.json({

                        success: true,

                        restaurants:
                            matchedRestaurants,

                        foods:
                            matchedFoods

                    });

                }
            );

        }
    );

};


module.exports = {

    getHomeData,
    searchHome

};