const express = require("express");

const router = express.Router();

const cartModel = require("../models/cartModel");


// ================= CHECKOUT DATA =================

router.get("/api/checkout", (req, res) => {

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }


    const userId = req.session.userId;


    cartModel.getCartItems(
        userId,
        (err, items) => {

            if (err) {

                console.error(
                    "CHECKOUT CART ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }


            const cart = items || [];


            const subtotal = cart.reduce(
                (sum, item) => {

                    return sum +
                        (
                            Number(item.price) *
                            Number(item.quantity)
                        );

                },
                0
            );


            return res.json({

                success: true,

                items: cart,

                subtotal: Number(
                    subtotal.toFixed(2)
                )

            });

        }
    );

});


module.exports = router;