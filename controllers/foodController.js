const foodModel = require("../models/foodModel");


/* =====================================================
   GET MENU
===================================================== */

const getMenu = (req, res) => {

    foodModel.getAllFoods((err, foods) => {

        if (err) {

            console.error(
                "Menu Error:",
                err
            );

            return res.status(500).json({

                success: false,

                message: "Menu load nahi hua"

            });

        }


        return res.status(200).json({

            success: true,

            foods: foods || []

        });

    });

};


module.exports = {
    getMenu
};