const cartModel = require("../models/cartModel");


// =====================================================
// LOGIN CHECK
// =====================================================

function isLoggedIn(req) {

    return (
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null
    );

}


// =====================================================
// Add Item To Cart
// =====================================================

const addToCart = (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }


    const userId =
        req.session.userId;


    const { foodId } =
        req.body;


    if (!foodId) {

        return res.status(400).json({

            success: false,

            message: "Food ID is required."

        });

    }


    cartModel.addToCart(
        userId,
        Number(foodId),
        (err) => {

            if (err) {

                console.error(
                    "ADD CART ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.json({

                success: true,

                message:
                    "Item added to cart successfully."

            });

        }
    );

};


// =====================================================
// Get User Cart
// =====================================================

const getCartItems = (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }


    const userId =
        req.session.userId;


    cartModel.getCartItems(
        userId,
        (err, result) => {

            if (err) {

                console.error(
                    "GET CART ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.json({

                success: true,

                cart:
                    result || []

            });

        }
    );

};


// =====================================================
// Increase Quantity
// =====================================================

const increaseQuantity = (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }


    const { cartId } =
        req.params;


    cartModel.increaseQuantity(
        cartId,
        req.session.userId,
        (err) => {

            if (err) {

                console.error(
                    "INCREASE CART ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.json({

                success: true,

                message:
                    "Quantity increased."

            });

        }
    );

};


// =====================================================
// Decrease Quantity
// =====================================================

const decreaseQuantity = (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }


    const { cartId } =
        req.params;


    cartModel.decreaseQuantity(
        cartId,
        req.session.userId,
        (err) => {

            if (err) {

                console.error(
                    "DECREASE CART ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.json({

                success: true,

                message:
                    "Quantity decreased."

            });

        }
    );

};


// =====================================================
// Remove Cart Item
// =====================================================

const removeCartItem = (req, res) => {

    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,

            message: "Please login first."

        });

    }


    const { cartId } =
        req.params;


    cartModel.removeCartItem(
        cartId,
        req.session.userId,
        (err) => {

            if (err) {

                console.error(
                    "REMOVE CART ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database Error"

                });

            }


            return res.json({

                success: true,

                message:
                    "Item removed successfully."

            });

        }
    );

};


module.exports = {

    addToCart,

    getCartItems,

    removeCartItem,

    increaseQuantity,

    decreaseQuantity

};