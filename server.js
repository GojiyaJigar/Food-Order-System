"use strict";

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();


// =====================================================
// DATABASE
// =====================================================

require("./config/db");


// =====================================================
// SERVER SESSION GENERATION
// =====================================================
//
// Har server start par new generation.
//
// Old session + new server
//        ↓
// Generation mismatch
//        ↓
// Session destroy
//        ↓
// Login required
//
// =====================================================

const SESSION_GENERATION =
    Date.now().toString();


// Controllers ke liye available
app.locals.sessionGeneration =
    SESSION_GENERATION;


// =====================================================
// BODY PARSER
// =====================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// =====================================================
// SESSION
// =====================================================

app.use(
    session({

        name: "jigato.sid",

        secret:
            process.env.SESSION_SECRET ||
            "jigato_secret_key",

        resave: false,

        saveUninitialized: false,

        cookie: {

            // Browser session cookie
            // maxAge / expires intentionally nahi hai

            httpOnly: true,

            secure: false,

            sameSite: "lax"

        }

    })
);


// =====================================================
// SESSION GENERATION CHECK
// =====================================================
//
// IMPORTANT:
//
// Login se pehle:
//     req.session.userId nahi hoga
//
// Login ke baad controller save karega:
//
//     userId
//     role
//     name
//     city
//     sessionGeneration
//
// =====================================================

app.use(
    (req, res, next) => {

        // ---------------------------------------------
        // GUEST
        // ---------------------------------------------

        if (
            !req.session ||
            !req.session.userId
        ) {

            return next();

        }


        // ---------------------------------------------
        // GENERATION MISSING
        // ---------------------------------------------
        //
        // Iska matlab valid login session nahi hai.
        //

        if (
            !req.session.sessionGeneration
        ) {

            console.log(
                "⚠️ SESSION GENERATION MISSING -> DESTROYING SESSION"
            );


            return req.session.destroy(
                () => {

                    // API request
                    if (
                        req.path.startsWith("/api/")
                    ) {

                        return res.status(401).json({

                            success: false,

                            message:
                                "Session expired. Please login again."

                        });

                    }


                    // Normal page
                    return res.redirect(
                        "/login"
                    );

                }
            );

        }


        // ---------------------------------------------
        // OLD SERVER SESSION
        // ---------------------------------------------

        if (
            req.session.sessionGeneration !==
            SESSION_GENERATION
        ) {

            console.log(
                "⚠️ OLD SESSION -> DESTROYING SESSION"
            );


            return req.session.destroy(
                () => {

                    // API request
                    if (
                        req.path.startsWith("/api/")
                    ) {

                        return res.status(401).json({

                            success: false,

                            message:
                                "Session expired. Please login again."

                        });

                    }


                    // Normal page
                    return res.redirect(
                        "/login"
                    );

                }
            );

        }


        // ---------------------------------------------
        // VALID SESSION
        // ---------------------------------------------

        next();

    }
);


// =====================================================
// NO CACHE
// =====================================================

app.use(
    (req, res, next) => {

        if (
            req.method === "GET"
        ) {

            res.set(
                "Cache-Control",
                "no-store, no-cache, must-revalidate, proxy-revalidate"
            );

            res.set(
                "Pragma",
                "no-cache"
            );

            res.set(
                "Expires",
                "0"
            );

        }

        next();

    }
);


// =====================================================
// STATIC FILES
// =====================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        ),
        {
            etag: false,
            lastModified: false,
            cacheControl: false
        }
    )
);


// =====================================================
// AUTH / ROLE MIDDLEWARE
// =====================================================

const {
    requireCustomer,
    requireAdmin,
    blockStaffFromCustomer
} = require(
    "./middleware/adminMiddleware"
);


// =====================================================
// HELPERS
// =====================================================

function isLoggedIn(req) {

    return Boolean(
        req.session &&
        req.session.userId
    );

}


function getUserRole(req) {

    return String(
        req.session?.role || ""
    )
    .trim()
    .toLowerCase();

}


function redirectByRole(
    req,
    res
) {

    const role =
        getUserRole(req);


    // ADMIN

    if (
        role === "admin"
    ) {

        return res.redirect(
            "/admin/dashboard"
        );

    }


    // OWNER

    if (
        role === "owner"
    ) {

        return res.redirect(
            "/owner"
        );

    }


    // CUSTOMER

    return res.redirect(
        "/"
    );

}


// =====================================================
// HOME
// =====================================================

app.get(
    "/",
    (req, res) => {

        if (
            isLoggedIn(req)
        ) {

            const role =
                getUserRole(req);


            // ADMIN

            if (
                role === "admin"
            ) {

                return res.redirect(
                    "/admin/dashboard"
                );

            }


            // OWNER

            if (
                role === "owner"
            ) {

                return res.redirect(
                    "/owner"
                );

            }

        }


        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "index.html"
            )
        );

    }
);


// =====================================================
// LOGIN PAGE
// =====================================================

app.get(
    "/login",
    (req, res) => {

        if (
            isLoggedIn(req)
        ) {

            return redirectByRole(
                req,
                res
            );

        }


        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "login.html"
            )
        );

    }
);


// =====================================================
// REGISTER PAGE
// =====================================================

app.get(
    "/register",
    (req, res) => {

        if (
            isLoggedIn(req)
        ) {

            return redirectByRole(
                req,
                res
            );

        }


        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "register.html"
            )
        );

    }
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

app.get(
    "/forgot-password",
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "forgot-password.html"
            )
        );

    }
);


// =====================================================
// RESET PASSWORD
// =====================================================

app.get(
    "/reset-password",
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "reset-password.html"
            )
        );

    }
);


// =====================================================
// MENU
// =====================================================

app.get(
    "/menu",
    blockStaffFromCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "menu.html"
            )
        );

    }
);


// =====================================================
// OFFERS
// =====================================================

app.get(
    "/offers",
    blockStaffFromCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "offers.html"
            )
        );

    }
);


// =====================================================
// CART
// =====================================================

app.get(
    "/cart-page",
    requireCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "cart.html"
            )
        );

    }
);


// =====================================================
// CHECKOUT
// =====================================================

app.get(
    "/checkout",
    requireCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "checkout.html"
            )
        );

    }
);


// =====================================================
// OLD CHECKOUT
// =====================================================

app.get(
    "/checkout-page",
    requireCustomer,
    (req, res) => {

        return res.redirect(
            "/checkout"
        );

    }
);


// =====================================================
// PROFILE
// =====================================================

app.get(
    "/profile",
    requireCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "profile.html"
            )
        );

    }
);


// =====================================================
// MY ORDERS
// =====================================================

app.get(
    "/orders",
    requireCustomer,
    (req, res) => {

        return res.sendFile(
            path.join(
                __dirname,
                "views",
                "my-orders.html"
            )
        );

    }
);


// =====================================================
// AUTH ROUTES
// =====================================================

const authRoutes =
    require("./routes/authRoutes");


// NEW API

app.use(
    "/api/auth",
    authRoutes
);


// LEGACY

app.use(
    "/",
    authRoutes
);


// =====================================================
// HOME ROUTES
// =====================================================

const homeRoutes =
    require("./routes/homeRoutes");

app.use(
    homeRoutes
);


// =====================================================
// FOOD ROUTES
// =====================================================

const foodRoutes =
    require("./routes/foodRoutes");

app.use(
    foodRoutes
);


// =====================================================
// CART ROUTES
// =====================================================

const cartRoutes =
    require("./routes/cartRoutes");

app.use(
    cartRoutes
);


// =====================================================
// CHECKOUT ROUTES
// =====================================================

const checkoutRoutes =
    require("./routes/checkoutRoutes");

app.use(
    checkoutRoutes
);


// =====================================================
// ORDER ROUTES
// =====================================================

const orderRoutes =
    require("./routes/orderRoutes");

app.use(
    "/api/orders",
    orderRoutes
);


// =====================================================
// PROFILE ROUTES
// =====================================================

const profileRoutes =
    require("./routes/profileRoutes");

app.use(
    profileRoutes
);


// =====================================================
// ADDRESS ROUTES
// =====================================================

const addressRoutes =
    require("./routes/addressRoutes");

app.use(
    addressRoutes
);


// =====================================================
// OFFER ROUTES
// =====================================================

const offerRoutes =
    require("./routes/offerRoutes");

app.use(
    offerRoutes
);


// =====================================================
// SETTINGS ROUTES
// =====================================================

const settingsRoutes =
    require("./routes/settingsRoutes");

app.use(
    settingsRoutes
);


// =====================================================
// ADMIN ROUTES
// =====================================================

const adminRoutes =
    require("./routes/adminRoutes");

app.use(
    "/admin",
    requireAdmin,
    adminRoutes
);


// =====================================================
// 404
// =====================================================

app.use(
    (req, res) => {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API endpoint not found."

            });

        }


        return res.status(404).send(
            "404 - Page Not Found"
        );

    }
);


// =====================================================
// GLOBAL ERROR
// =====================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "======================================"
        );

        console.error(
            "SERVER ERROR:"
        );

        console.error(
            err
        );

        console.error(
            "======================================"
        );


        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Internal Server Error"

            });

        }


        return res.status(500).send(
            "500 - Internal Server Error"
        );

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "🚀 Jigato Server Started"
        );

        console.log(
            `🌐 http://localhost:${PORT}`
        );

        console.log(
            `🔐 Session Generation: ${SESSION_GENERATION}`
        );

        console.log(
            "======================================"
        );

    }
);