"use strict";

const db = require("../config/db");

// =====================================================
// REQUIRE LOGIN
// =====================================================

const requireLogin = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    if (!isLoggedIn) {
        if (req.path.startsWith("/api/")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }
        return res.redirect("/login");
    }

    next();
};

// =====================================================
// REQUIRE CUSTOMER
// =====================================================
// ONLY customer can access customer website.

const requireCustomer = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    // ---------------------------------------------
    // LOGIN CHECK
    // ---------------------------------------------
    if (!isLoggedIn) {
        if (req.path.startsWith("/api/")) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }
        return res.redirect("/login");
    }

    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------
    const role = String(req.session.role || "")
        .trim()
        .toLowerCase();

    // ---------------------------------------------
    // CUSTOMER
    // ---------------------------------------------
    if (role === "customer") {
        return next();
    }

    // ---------------------------------------------
    // ADMIN
    // ---------------------------------------------
    if (role === "admin") {
        if (req.path.startsWith("/api/")) {
            return res.status(403).json({
                success: false,
                message: "Admin accounts cannot access customer APIs."
            });
        }
        return res.redirect("/admin/dashboard");
    }

    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------
    if (role === "owner") {
        if (req.path.startsWith("/api/")) {
            return res.status(403).json({
                success: false,
                message: "Owner accounts cannot access customer APIs."
            });
        }
        return res.redirect("/owner");
    }

    // ---------------------------------------------
    // UNKNOWN ROLE
    // ---------------------------------------------
    req.session.destroy(() => {});

    if (req.path.startsWith("/api/")) {
        return res.status(403).json({
            success: false,
            message: "Invalid account role."
        });
    }

    return res.redirect("/login");
};

// =====================================================
// REQUIRE ADMIN
// =====================================================
// ONLY admin can access admin pages.

const requireAdmin = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    // ---------------------------------------------
    // LOGIN CHECK
    // ---------------------------------------------
    if (!isLoggedIn) {
        if (req.path.startsWith("/api/")) {
            return res.status(401).json({
                success: false,
                message: "Admin login required."
            });
        }
        return res.redirect("/login");
    }

    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------
    const role = String(req.session.role || "")
        .trim()
        .toLowerCase();

    // ---------------------------------------------
    // ADMIN ALLOWED
    // ---------------------------------------------
    if (role === "admin") {
        return next();
    }

    // ---------------------------------------------
    // CUSTOMER
    // ---------------------------------------------
    if (role === "customer") {
        if (req.path.startsWith("/api/")) {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }
        return res.redirect("/");
    }

    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------
    if (role === "owner") {
        if (req.path.startsWith("/api/")) {
            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });
        }
        return res.redirect("/owner");
    }

    // ---------------------------------------------
    // UNKNOWN ROLE
    // ---------------------------------------------
    return res.status(403).json({
        success: false,
        message: "Access denied."
    });
};

// =====================================================
// REQUIRE ADMIN API
// =====================================================
// For Admin APIs.
// Example:
// GET  /admin/api/dashboard
// GET  /admin/api/users
// POST /admin/api/foods
// Returns JSON response instead of browser page redirect.

const requireAdminAPI = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    // ---------------------------------------------
    // NOT LOGGED IN
    // ---------------------------------------------
    if (!isLoggedIn) {
        return res.status(401).json({
            success: false,
            message: "Admin login required."
        });
    }

    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------
    const role = String(req.session.role || "")
        .trim()
        .toLowerCase();

    // ---------------------------------------------
    // ADMIN
    // ---------------------------------------------
    if (role === "admin") {
        return next();
    }

    // ---------------------------------------------
    // CUSTOMER / OWNER / OTHER
    // ---------------------------------------------
    return res.status(403).json({
        success: false,
        message: "Admin access required."
    });
};

// =====================================================
// REQUIRE OWNER
// =====================================================

const requireOwner = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    if (!isLoggedIn) {
        if (req.path.startsWith("/api/")) {
            return res.status(401).json({
                success: false,
                message: "Owner login required."
            });
        }
        return res.redirect("/login");
    }

    const role = String(req.session.role || "")
        .trim()
        .toLowerCase();

    if (role === "owner") {
        return next();
    }

    if (role === "admin") {
        if (req.path.startsWith("/api/")) {
            return res.status(403).json({
                success: false,
                message: "Owner access required."
            });
        }
        return res.redirect("/admin/dashboard");
    }

    if (req.path.startsWith("/api/")) {
        return res.status(403).json({
            success: false,
            message: "Owner access required."
        });
    }

    return res.redirect("/");
};

// =====================================================
// BLOCK STAFF FROM CUSTOMER WEBSITE
// =====================================================
// If Admin / Owner are logged in, they cannot access customer side pages.
// Customer allowed.
// Guest allowed.
// Admin  -> /admin/dashboard
// Owner  -> /owner
// Customer -> continue
// Guest -> continue
// =====================================================

const blockStaffFromCustomer = (req, res, next) => {
    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;

    // Guest user can access customer website
    if (!isLoggedIn) {
        return next();
    }

    const role = String(req.session.role || "")
        .trim()
        .toLowerCase();

    // ---------------------------------------------
    // ADMIN
    // ---------------------------------------------
    if (role === "admin") {
        return res.redirect("/admin/dashboard");
    }

    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------
    if (role === "owner") {
        return res.redirect("/owner");
    }

    // ---------------------------------------------
    // CUSTOMER
    // ---------------------------------------------
    return next();
};

// =====================================================
// CHECK BLOCKED USER
// =====================================================
// If user is already logged in and admin blocks them:
// status = inactive
// Session will be destroyed on the next request.

const checkBlockedUser = (req, res, next) => {
    // ---------------------------------------------
    // GUEST
    // ---------------------------------------------
    if (!req.session || !req.session.userId) {
        return next();
    }

    const userId = req.session.userId;

    // ---------------------------------------------
    // CHECK USER STATUS
    // ---------------------------------------------
    const sql = `
        SELECT
            id,
            status,
            role
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (error, rows) => {
        if (error) {
            return next();
        }

        // -----------------------------------------
        // USER DOES NOT EXIST
        // -----------------------------------------
        if (!rows || rows.length === 0) {
            return req.session.destroy(() => {
                if (req.path.startsWith("/api/")) {
                    return res.status(401).json({
                        success: false,
                        blocked: true,
                        message: "Your account is no longer available."
                    });
                }
                return res.redirect("/login?blocked=1");
            });
        }

        const user = rows[0];

        const status = String(user.status || "active")
            .trim()
            .toLowerCase();

        // -----------------------------------------
        // BLOCKED USER
        // -----------------------------------------
        if (status !== "active") {
            return req.session.destroy((destroyError) => {
                // ---------------------------------
                // API
                // ---------------------------------
                if (req.path.startsWith("/api/")) {
                    return res.status(403).json({
                        success: false,
                        blocked: true,
                        message:
                            "Your account has been blocked by admin. Please login after your account is activated."
                    });
                }

                // ---------------------------------
                // NORMAL PAGE
                // ---------------------------------
                return res.redirect("/login?blocked=1");
            });
        }

        // -----------------------------------------
        // USER ACTIVE
        // -----------------------------------------
        next();
    });
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    requireLogin,
    requireCustomer,
    requireAdmin,
    requireAdminAPI,
    requireOwner,
    blockStaffFromCustomer,
    checkBlockedUser
};