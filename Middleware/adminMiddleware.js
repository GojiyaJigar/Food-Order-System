// =====================================================
// CHECK LOGIN
// =====================================================

const isLoggedIn = (req) => {

    return (
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null
    );

};


// =====================================================
// NO CACHE
// =====================================================

const disableCache = (res) => {

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

};


// =====================================================
// ADMIN PAGE
// =====================================================

const requireAdmin = (req, res, next) => {

    disableCache(res);


    if (!isLoggedIn(req)) {

        return res.redirect("/login");

    }


    const role =
        String(req.session.role || "")
            .trim()
            .toLowerCase();


    if (role !== "admin") {

        return res.status(403).send(
            "403 - Admin Access Required"
        );

    }


    next();

};


// =====================================================
// ADMIN API
// =====================================================

const requireAdminAPI = (req, res, next) => {

    disableCache(res);


    if (!isLoggedIn(req)) {

        return res.status(401).json({

            success: false,
            message: "Please login first."

        });

    }


    const role =
        String(req.session.role || "")
            .trim()
            .toLowerCase();


    if (role !== "admin") {

        return res.status(403).json({

            success: false,
            message: "Admin access required."

        });

    }


    next();

};


// =====================================================
// CUSTOMER PAGE
// =====================================================

const requireCustomer = (req, res, next) => {

    disableCache(res);


    if (!isLoggedIn(req)) {

        return res.redirect("/login");

    }


    const role =
        String(req.session.role || "")
            .trim()
            .toLowerCase();


    if (role === "admin") {

        return res.redirect("/admin/dashboard");

    }


    next();

};


module.exports = {

    requireAdmin,
    requireAdminAPI,
    requireCustomer

};