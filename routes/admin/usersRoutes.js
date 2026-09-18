const express = require("express");
const path = require("path");

const router = express.Router();


const {
    requireAdmin,
    requireAdminAPI
} = require("../../middleware/adminMiddleware");


const {
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
} = require("../../controllers/admin/usersController");


/* =========================================================
   USERS PAGE
   GET /admin/users
========================================================= */

router.get(
    "/users",
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../../views/admin/users.html"
            )
        );

    }
);


/* =========================================================
   GET ALL CUSTOMERS
   GET /admin/api/users
========================================================= */

router.get(
    "/api/users",
    requireAdminAPI,
    getUsers
);


/* =========================================================
   GET SINGLE CUSTOMER
   GET /admin/api/users/:id
========================================================= */

router.get(
    "/api/users/:id",
    requireAdminAPI,
    getUserById
);


/* =========================================================
   UPDATE CUSTOMER
   PUT /admin/api/users/:id
========================================================= */

router.put(
    "/api/users/:id",
    requireAdminAPI,
    updateUser
);


/* =========================================================
   UPDATE STATUS
   PATCH /admin/api/users/:id/status
========================================================= */

router.patch(
    "/api/users/:id/status",
    requireAdminAPI,
    updateUserStatus
);


/* =========================================================
   DELETE CUSTOMER
   DELETE /admin/api/users/:id
========================================================= */

router.delete(
    "/api/users/:id",
    requireAdminAPI,
    deleteUser
);


module.exports = router;