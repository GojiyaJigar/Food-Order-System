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

    const {
        email,
        password
    } = req.body;


    userModel.findUserByEmail(
        email,
        (err, result) => {

            if (err) {

                console.error(
                    "LOGIN DB ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }


            if (!result || result.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid Email or Password"
                });

            }


            const user =
                result[0];


            bcrypt.compare(
                password,
                user.password,
                (err, isMatch) => {

                    if (err) {

                        console.error(
                            "PASSWORD ERROR:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Password Compare Error"
                        });

                    }


                    if (!isMatch) {

                        return res.status(401).json({
                            success: false,
                            message:
                                "Invalid Email or Password"
                        });

                    }


                    /*
                     * Fresh session create
                     */

                    req.session.regenerate(
                        (sessionError) => {

                            if (sessionError) {

                                console.error(
                                    "SESSION REGENERATE ERROR:",
                                    sessionError
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Session Creation Failed"
                                });

                            }


                            /*
                             * Save user data
                             */

                            req.session.userId =
                                user.id;

                            req.session.role =
                                user.role;

                            req.session.name =
                                user.name;

                            req.session.city =
                                user.city;


                            console.log(
                                "SESSION BEFORE SAVE:",
                                {
                                    userId:
                                        req.session.userId,

                                    role:
                                        req.session.role,

                                    name:
                                        req.session.name,

                                    city:
                                        req.session.city
                                }
                            );


                            req.session.save(
                                (saveError) => {

                                    if (saveError) {

                                        console.error(
                                            "SESSION SAVE ERROR:",
                                            saveError
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Session Save Failed"
                                        });

                                    }


                                    console.log(
                                        "LOGIN SESSION SAVED:",
                                        req.session.userId
                                    );


                                    return res.json({

                                        success: true,

                                        message:
                                            "Login Successful",

                                        role:
                                            user.role,

                                        name:
                                            user.name

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};
// ==========================
// Check Authentication
// ==========================

const checkAuth = (req, res) => {

    console.log(
        "CHECK AUTH SESSION:",
        req.session
    );


    const loggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    if (loggedIn) {

        return res.json({

            loggedIn: true,

            userId:
                req.session.userId,

            role:
                req.session.role,

            name:
                req.session.name,

            city:
                req.session.city

        });

    }


    return res.json({

        loggedIn: false

    });

};

const logoutUser = (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Logout Failed"
            });

        }


        res.clearCookie(
            "jigato.sid",
            {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            }
        );


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