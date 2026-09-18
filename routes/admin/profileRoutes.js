const express = require("express");

const router = express.Router();

const profileController =
    require("../../controllers/admin/profileController");


/* =========================================================
   ADMIN PROFILE PAGE
   GET /admin/profile
========================================================= */

router.get(
    "/profile",
    (req, res) => {

        res.sendFile(
            require("path").join(
                __dirname,
                "../../views/admin/profile.html"
            )
        );

    }
);


/* =========================================================
   GET ADMIN PROFILE API
   GET /admin/api/profile
========================================================= */

router.get(
    "/api/profile",
    profileController.getAdminProfile
);


/* =========================================================
   UPDATE ADMIN PROFILE
   PUT /admin/api/profile
========================================================= */

router.put(
    "/api/profile",
    profileController.updateAdminProfile
);


/* =========================================================
   CHANGE ADMIN PASSWORD
   PUT /admin/api/profile/password
========================================================= */

router.put(
    "/api/profile/password",
    profileController.changeAdminPassword
);


module.exports = router;