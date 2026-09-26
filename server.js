"use strict";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
// DATABASE CONFIGURATION
require("./config/db");
// SESSION GENERATION
const SESSION_GENERATION = Date.now().toString();
app.locals.sessionGeneration = SESSION_GENERATION;
// BODY PARSER
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// SESSION CONFIGURATION
app.use(
    session({
        name: "jigato.sid",
        secret: process.env.SESSION_SECRET || "jigato_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }
    })
);
// SESSION NORMALIZATION: req.session.userId aur req.session.user.id dono ko sync me rakhta hai
app.use((req, res, next) => {
    if (!req.session) return next();
    // User object hai par user ID missing hai
    if (!req.session.userId && req.session.user && req.session.user.id) {
        req.session.userId = req.session.user.id;
    }
    // User ID hai par user object missing hai
    if (req.session.userId && !req.session.user) {
        req.session.user = {
            id: req.session.userId,
            name: req.session.name || "",
            role: req.session.role || "customer"
        };
    }
    // User object ID ko sync me rakhein
    if (req.session.user && req.session.userId) {
        req.session.user.id = req.session.userId;
    }
    // Role ko sync me rakhein
    if (req.session.user && req.session.role) {
        req.session.user.role = req.session.role;
    }
    next();
});
// SESSION GENERATION CHECK
app.use((req, res, next) => {
    // Guest users
    if (!req.session || !req.session.userId) return next();
    // Generation missing
    if (!req.session.sessionGeneration) {
        console.log("⚠️ SESSION GENERATION MISSING -> DESTROYING SESSION");
        return req.session.destroy(() => {
            if (req.path.startsWith("/api/")) {
                return res.status(401).json({ success: false, message: "Session expired. Please login again." });
            }
            return res.redirect("/login");
        });
    }
    // Old server session
    if (req.session.sessionGeneration !== SESSION_GENERATION) {
        console.log("⚠️ OLD SESSION -> DESTROYING SESSION");
        return req.session.destroy(() => {
            if (req.path.startsWith("/api/")) {
                return res.status(401).json({ success: false, message: "Session expired. Please login again." });
            }
            return res.redirect("/login");
        });
    }
    next();
});
// NO CACHE MIDDLEWARE
app.use((req, res, next) => {
    if (req.method === "GET") {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
    }
    next();
});
// STATIC FILES
app.use(
    express.static(path.join(__dirname, "public"), {
        etag: false,
        lastModified: false,
        cacheControl: false
    })
);
// AUTH & ROLE MIDDLEWARE
const {
    requireCustomer,
    requireAdmin,
    blockStaffFromCustomer,
    checkBlockedUser
} = require("./middleware/adminMiddleware");
// HELPER FUNCTIONS
function isLoggedIn(req) {
    return Boolean(req.session && req.session.userId);
}
function getUserRole(req) {
    return String(req.session?.role || req.session?.user?.role || "").trim().toLowerCase();
}
function redirectByRole(req, res) {
    const role = getUserRole(req);
    if (role === "admin") return res.redirect("/admin/dashboard");
    if (role === "owner") return res.redirect("/owner");
    return res.redirect("/");
}
// PAGE ROUTES
app.get("/", (req, res) => {
    if (isLoggedIn(req)) {
        const role = getUserRole(req);
        if (role === "admin") return res.redirect("/admin/dashboard");
        if (role === "owner") return res.redirect("/owner");
    }
    return res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/login", (req, res) => {
    if (isLoggedIn(req)) return redirectByRole(req, res);
    return res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/register", (req, res) => {
    if (isLoggedIn(req)) return redirectByRole(req, res);
    return res.sendFile(path.join(__dirname, "views", "register.html"));
});
app.get("/forgot-password", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "forgot-password.html"));
});
app.get("/reset-password", (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "reset-password.html"));
});
app.get("/menu", blockStaffFromCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "menu.html"));
});
app.get("/offers", blockStaffFromCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "offers.html"));
});
app.get("/cart-page", requireCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "cart.html"));
});
app.get("/checkout", requireCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "checkout.html"));
});
app.get("/checkout-page", requireCustomer, (req, res) => {
    return res.redirect("/checkout");
});
app.get("/profile", requireCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "profile.html"));
});
app.get("/orders", requireCustomer, (req, res) => {
    return res.sendFile(path.join(__dirname, "views", "my-orders.html"));
});
// API & ROUTE MODULES
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
app.use("/", authRoutes);

const homeRoutes = require("./routes/homeRoutes");
app.use(homeRoutes);

const foodRoutes = require("./routes/foodRoutes");
app.use(foodRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use(cartRoutes);

const checkoutRoutes = require("./routes/checkoutRoutes");
app.use(checkoutRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use(profileRoutes);

const addressRoutes = require("./routes/addressRoutes");
app.use(addressRoutes);

const offerRoutes = require("./routes/offerRoutes");
app.use(offerRoutes);

const settingsRoutes = require("./routes/settingsRoutes");
app.use(settingsRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", requireAdmin, adminRoutes);

// 404 HANDLER
app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ success: false, message: "API endpoint not found." });
    }
    return res.status(404).send("404 - Page Not Found");
});
// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("======================================");
    console.error("SERVER ERROR:");
    console.error(err);
    console.error("======================================");
    if (req.path.startsWith("/api/")) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    return res.status(500).send("500 - Internal Server Error");
});
// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("======================================");
    console.log("🚀 Jigato Server Started");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔐 Session Generation: ${SESSION_GENERATION}`);
    console.log("======================================");
});