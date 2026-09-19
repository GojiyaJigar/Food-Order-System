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
// MIDDLEWARE
// =====================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


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

            maxAge:
                1000 * 60 * 60 * 24,

            httpOnly: true,

            secure: false,

            sameSite: "lax"

        }

    })
);


// =====================================================
// NO CACHE FOR ALL HTML PAGES
// =====================================================

app.use(
    (req, res, next) => {

        // API requests ko chhod do
        // HTML pages ke liye browser cache disable karo

        if (
            req.method === "GET" &&
            !req.path.startsWith("/api/")
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
// CUSTOMER AUTH MIDDLEWARE
// =====================================================

const {
    requireCustomer
} = require("./middleware/adminMiddleware");


// =====================================================
// HOME
// PUBLIC
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "index.html"
            )
        );

    }
);


// =====================================================
// REGISTER
// PUBLIC
// =====================================================

app.get(
    "/register",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "register.html"
            )
        );

    }
);


// =====================================================
// LOGIN
// PUBLIC
// =====================================================

app.get(
    "/login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "login.html"
            )
        );

    }
);


// =====================================================
// MENU
// PUBLIC
// =====================================================

app.get(
    "/menu",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "menu.html"
            )
        );

    }
);


// =====================================================
// CART PAGE
// AUTH PROTECTED
// =====================================================

app.get(
    "/cart-page",
    requireCustomer,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "cart.html"
            )
        );

    }
);


// =====================================================
// CHECKOUT PAGE
// AUTH PROTECTED
// =====================================================

app.get(
    "/checkout",
    requireCustomer,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "checkout.html"
            )
        );

    }
);


// =====================================================
// OLD CHECKOUT URL
// AUTH PROTECTED
// =====================================================

app.get(
    "/checkout-page",
    requireCustomer,
    (req, res) => {

        res.redirect(
            "/checkout"
        );

    }
);


// =====================================================
// OFFERS
// PUBLIC
// =====================================================

app.get(
    "/offers",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "views",
                "offers.html"
            )
        );

    }
);


// =====================================================
// PROFILE
// AUTH PROTECTED
// =====================================================

app.get(
    "/profile",
    requireCustomer,
    (req, res) => {

        res.sendFile(
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
// AUTH PROTECTED
// =====================================================

app.get(
    "/orders",
    requireCustomer,
    (req, res) => {

        res.sendFile(
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

app.use(
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
// PUBLIC SETTINGS API
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
    adminRoutes
);


// =====================================================
// 404
// =====================================================

app.use(
    (req, res) => {

        res.status(404).send(
            "404 - Page Not Found"
        );

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal Server Error"

        });

    }
);


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Server Running on http://localhost:${PORT}`
        );

    }
);