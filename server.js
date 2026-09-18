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

const {
    requireCustomer
} = require("./middleware/adminMiddleware");


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
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }
    })
);


// =====================================================
// STATIC FILES
// =====================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================================
// CUSTOMER PAGE ROUTES
// =====================================================


// HOME
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


// REGISTER
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


// LOGIN
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


// MENU
app.get(
    "/menu",
    requireCustomer,
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


// CART
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


// CHECKOUT
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


// OLD CHECKOUT URL
app.get(
    "/checkout-page",
    requireCustomer,
    (req, res) => {

        res.redirect("/checkout");
    }
);


// PROFILE
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


// OFFERS
app.get(
    "/offers",
    requireCustomer,
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


// MY ORDERS
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
// CUSTOMER / GENERAL API ROUTES
// =====================================================


// AUTH
const authRoutes =
    require("./routes/authRoutes");

app.use(authRoutes);


// HOME
const homeRoutes =
    require("./routes/homeRoutes");

app.use(homeRoutes);


// FOOD
const foodRoutes =
    require("./routes/foodRoutes");

app.use(foodRoutes);


// CART
const cartRoutes =
    require("./routes/cartRoutes");

app.use(cartRoutes);


// CHECKOUT
const checkoutRoutes =
    require("./routes/checkoutRoutes");

app.use(checkoutRoutes);


// ORDERS
const orderRoutes =
    require("./routes/orderRoutes");

app.use(orderRoutes);


// PROFILE
const profileRoutes =
    require("./routes/profileRoutes");

app.use(profileRoutes);


// ADDRESS
const addressRoutes =
    require("./routes/addressRoutes");

app.use(addressRoutes);


// OFFERS
const offerRoutes =
    require("./routes/offerRoutes");

app.use(offerRoutes);


// =====================================================
// ADMIN ROUTES
// =====================================================


// MAIN ADMIN ROUTES

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
            message: "Internal Server Error"
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