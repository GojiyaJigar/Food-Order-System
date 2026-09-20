"use strict";


// =====================================================
// REQUIRE LOGIN
// =====================================================

const requireLogin = (
    req,
    res,
    next
) => {

    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    if (!isLoggedIn) {

        if (
            req.path.startsWith("/api/")
        ) {

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
//
// ONLY customer can access customer website.
//

const requireCustomer = (
    req,
    res,
    next
) => {

    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    // ---------------------------------------------
    // LOGIN CHECK
    // ---------------------------------------------

    if (!isLoggedIn) {

        if (
            req.path.startsWith("/api/")
        ) {

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

    const role =
        String(
            req.session.role || ""
        )
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

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Admin accounts cannot access customer APIs."
            });

        }


        return res.redirect("/admin/dashboard");

    }


    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------

    if (role === "owner") {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Owner accounts cannot access customer APIs."
            });

        }


        return res.redirect("/owner");

    }


    // ---------------------------------------------
    // UNKNOWN ROLE
    // ---------------------------------------------

    console.error(
        "UNKNOWN USER ROLE:",
        role
    );


    req.session.destroy(
        () => {}
    );


    if (
        req.path.startsWith("/api/")
    ) {

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
//
// ONLY admin can access admin pages.
//

const requireAdmin = (
    req,
    res,
    next
) => {

    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    // ---------------------------------------------
    // LOGIN CHECK
    // ---------------------------------------------

    if (!isLoggedIn) {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Admin login required."
            });

        }


        return res.redirect("/login");

    }


    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------

    const role =
        String(
            req.session.role || ""
        )
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

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Admin access required."
            });

        }


        return res.redirect("/");

    }


    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------

    if (role === "owner") {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Admin access required."
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
//
// Admin APIs ke liye.
//
// Example:
//
// GET  /admin/api/dashboard
// GET  /admin/api/users
// POST /admin/api/foods
//
// Browser page redirect ke bajay JSON response
// milega.
//

const requireAdminAPI = (
    req,
    res,
    next
) => {

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

            message:
                "Admin login required."

        });

    }


    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------

    const role =
        String(
            req.session.role || ""
        )
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

        message:
            "Admin access required."

    });

};


// =====================================================
// REQUIRE OWNER
// =====================================================

const requireOwner = (
    req,
    res,
    next
) => {

    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    if (!isLoggedIn) {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Owner login required."
            });

        }


        return res.redirect("/login");

    }


    const role =
        String(
            req.session.role || ""
        )
        .trim()
        .toLowerCase();


    if (role === "owner") {

        return next();

    }


    if (role === "admin") {

        if (
            req.path.startsWith("/api/")
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Owner access required."
            });

        }


        return res.redirect("/admin/dashboard");

    }


    if (
        req.path.startsWith("/api/")
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Owner access required."
        });

    }


    return res.redirect("/");

};
// =====================================================
// BLOCK STAFF FROM CUSTOMER WEBSITE
// =====================================================
//
// Admin / Owner agar logged in hain to customer side
// ke pages access nahi kar sakte.
//
// Customer allowed.
// Guest allowed.
//
// Admin  -> /admin/dashboard
// Owner  -> /owner
// Customer -> continue
// Guest -> continue
// =====================================================

const blockStaffFromCustomer = (
    req,
    res,
    next
) => {

    const isLoggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    // Guest hai
    // Customer website access kar sakta hai.
    if (!isLoggedIn) {

        return next();

    }


    const role =
        String(
            req.session.role || ""
        )
        .trim()
        .toLowerCase();


    // ---------------------------------------------
    // ADMIN
    // ---------------------------------------------

    if (role === "admin") {

        return res.redirect(
            "/admin/dashboard"
        );

    }


    // ---------------------------------------------
    // OWNER
    // ---------------------------------------------

    if (role === "owner") {

        return res.redirect(
            "/owner"
        );

    }


    // ---------------------------------------------
    // CUSTOMER
    // ---------------------------------------------

    return next();

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
    blockStaffFromCustomer

};