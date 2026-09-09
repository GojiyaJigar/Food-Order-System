const homeModel = require("../models/homeModel");


/* =====================================================
   HOME PAGE DATA
===================================================== */

const getHomeData = (req, res) => {

    homeModel.getCategories((categoryError, categories) => {

        if (categoryError) {

            console.error(
                "Categories Error:",
                categoryError
            );

            return res.status(500).json({
                success: false,
                message: "Categories load nahi hui"
            });

        }


        homeModel.getHomeFoods((foodError, foods) => {

            if (foodError) {

                console.error(
                    "Foods Error:",
                    foodError
                );

                return res.status(500).json({
                    success: false,
                    message: "Foods load nahi hue"
                });

            }


            res.json({

                success: true,

                categories: categories || [],

                foods: foods || []

            });

        });

    });

};


/* =====================================================
   MENU DATA
   ALL AVAILABLE FOODS
===================================================== */

const getMenuData = (req, res) => {

    homeModel.getAllFoods((error, foods) => {

        if (error) {

            console.error(
                "Menu Foods Error:",
                error
            );

            return res.status(500).json({

                success: false,

                message: "Menu load nahi hua"

            });

        }


        res.json({

            success: true,

            foods: foods || []

        });

    });

};


/* =====================================================
   HOME SEARCH
   FOOD ONLY
===================================================== */

const searchHome = (req, res) => {

    const q = String(
        req.query.q || ""
    ).trim();


    if (!q) {

        return res.json({

            success: true,

            foods: []

        });

    }


    homeModel.getAllFoods((foodError, foods) => {

        if (foodError) {

            console.error(
                "Search Food Error:",
                foodError
            );

            return res.status(500).json({

                success: false,

                message: "Food search failed"

            });

        }


        const search =
            q.toLowerCase();


        const matchedFoods =
            foods.filter(food => {

                const text = `

                    ${food.name || ""}

                    ${food.category || ""}

                    ${food.description || ""}

                `.toLowerCase();


                return text.includes(search);

            });


        res.json({

            success: true,

            foods: matchedFoods

        });

    });

};


module.exports = {

    getHomeData,
    getMenuData,
    searchHome

};