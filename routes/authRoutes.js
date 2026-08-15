const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    checkAuth,
    logoutUser
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", checkAuth);

router.get("/test", (req, res) => {
    res.send("Route Working");
});

module.exports = router;