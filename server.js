require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();


// ================= DATABASE =================

require("./config/db");


// ================= MIDDLEWARE =================

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());


// ================= SESSION =================

app.use(
    session({
        secret: "jigato_secret_key",
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        }
    })
);


// ================= STATIC =================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================================
// PAGE ROUTES
// =====================================================

// HOME
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "index.html")
    );
});


// REGISTER
app.get("/register", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "register.html")
    );
});


// LOGIN
app.get("/login", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "login.html")
    );
});


// RESTAURANTS
app.get("/restaurant", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "restaurant.html")
    );
});


// RESTAURANT MENU
app.get("/restaurant/:id", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "menu.html")
    );
});


// CART PAGE
app.get("/cart-page", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "cart.html")
    );
});


// CHECKOUT PAGE
app.get("/checkout", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "checkout.html")
    );
});


// OLD CHECKOUT URL
app.get("/checkout-page", (req, res) => {
    res.redirect("/checkout");
});
//PROFILE
app.get("/profile", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "profile.html")
    );
});
//offers
app.get("/offers", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "offers.html")
    );
});
//offers
app.get("/orders", (req, res) => {
    res.sendFile(
        path.join(__dirname, "views", "my-orders.html")
    );
});

// =====================================================
// API ROUTES
// =====================================================


// AUTH
const authRoutes =
    require("./routes/authRoutes");

app.use(authRoutes);


// HOME
const homeRoutes =
    require("./routes/homeRoutes");

app.use(homeRoutes);


// RESTAURANT
const restaurantRoutes =
    require("./routes/restaurantRoutes");

app.use(restaurantRoutes);


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
const orderRoutes =require("./routes/orderRoutes");
app.use(orderRoutes);
//PROFILE
const profileRoutes = require("./routes/profileRoutes");

app.use(profileRoutes);
//address
const addressRoutes = require("./routes/addressRoutes");
app.use(addressRoutes);
//offers
const offerRoutes = require("./routes/offerRoutes");
app.use(offerRoutes);
// =====================================================
// HEADER
// =====================================================

app.use(
    "/header",
    express.static(
        path.join(__dirname, "views", "header")
    )
);


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

    res.status(404).send(
        "404 - Page Not Found"
    );

});


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server Running on http://localhost:${PORT}`
    );

});