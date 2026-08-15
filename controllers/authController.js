const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

// ==========================
// Register User
// ==========================

const registerUser = (req, res) => {

    const { name, email, phone, city, password, role } = req.body;

    userModel.findUserByEmail(email, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Password Hashing Failed"
                });
            }

            const userData = {
                name,
                email,
                phone,
                city,
                password: hashedPassword,
                role
            };

            userModel.createUser(userData, (err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Registration Failed"
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: "Registration Successful"
                });

            });

        });

    });

};

// ==========================
// Login User
// ==========================

const loginUser = (req, res) => {

    const { email, password } = req.body;

    userModel.findUserByEmail(email, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Password Compare Error"
                });
            }

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Email or Password"
                });
            }

            // Save Session
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.name = user.name;
            req.session.city=user.city;

            req.session.save((err) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Session Save Failed"
                    });
                }
                return res.json({
                    success: true,
                    message: "Login Successful",
                    role: user.role,
                    name: user.name
                });

            });

        });

    });

};

// ==========================
// Check Authentication
// ==========================

const checkAuth = (req, res) => {

    if (req.session.userId) {

        return res.json({
            loggedIn: true,
            userId: req.session.userId,
            role: req.session.role,
            name: req.session.name,
            city: req.session.city
        });

    }

    return res.json({
        loggedIn: false
    });

};

// ==========================
// Logout User
// ==========================

const logoutUser = (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout Failed"
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            success: true,
            message: "Logout Successful"
        });

    });

};

// ==========================
// Export
// ==========================

module.exports = {
    registerUser,
    loginUser,
    checkAuth,
    logoutUser
};