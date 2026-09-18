/* =========================================================
   JIGATO ADMIN PROFILE CONTROLLER
========================================================= */

const bcrypt =
    require("bcrypt");

const profileModel =
    require("../../models/admin/profileModel");


/* =========================================================
   ADMIN SESSION CHECK
========================================================= */

function isAdminSession(req) {

    const loggedIn =
        req.session &&
        req.session.userId !== undefined &&
        req.session.userId !== null;


    if (!loggedIn) {
        return false;
    }


    const role =
        String(
            req.session.role || ""
        )
        .trim()
        .toLowerCase();


    return role === "admin";

}


/* =========================================================
   GET ADMIN PROFILE
========================================================= */

const getAdminProfile =
    async (req, res) => {

        try {

            if (!isAdminSession(req)) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Admin login required."
                });

            }


            const adminId =
                Number(
                    req.session.userId
                );


            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin session."
                });

            }


            const profile =
                await profileModel
                    .getAdminProfile(
                        adminId
                    );


            if (!profile) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Admin profile not found."
                });

            }


            return res.json({

                success: true,

                profile: {

                    id:
                        profile.id,

                    name:
                        profile.name || "",

                    email:
                        profile.email || "",

                    phone:
                        profile.phone || "",

                    city:
                        profile.city || "",

                    role:
                        profile.role || "admin",

                    status:
                        profile.status || "active",

                    created_at:
                        profile.created_at

                }

            });

        }
        catch (error) {

            console.error(
                "GET ADMIN PROFILE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load admin profile."

            });

        }

    };


/* =========================================================
   UPDATE ADMIN PROFILE
========================================================= */

const updateAdminProfile =
    async (req, res) => {

        try {

            if (!isAdminSession(req)) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Admin login required."
                });

            }


            const adminId =
                Number(
                    req.session.userId
                );


            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin session."
                });

            }


            const name =
                String(
                    req.body?.name || ""
                ).trim();


            const email =
                String(
                    req.body?.email || ""
                ).trim()
                .toLowerCase();


            const phone =
                String(
                    req.body?.phone || ""
                ).trim();


            const city =
                String(
                    req.body?.city || ""
                ).trim();


            /* =============================================
               VALIDATION
            ============================================= */

            if (!name) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Full name is required."
                });

            }


            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email address is required."
                });

            }


            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailRegex.test(email)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid email address."
                });

            }


            if (
                phone &&
                !/^[0-9+\-\s]{7,15}$/.test(phone)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid phone number."
                });

            }


            if (name.length > 100) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name must not exceed 100 characters."
                });

            }


            if (email.length > 100) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email must not exceed 100 characters."
                });

            }


            if (phone.length > 15) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Phone number is too long."
                });

            }


            if (city.length > 100) {

                return res.status(400).json({
                    success: false,
                    message:
                        "City must not exceed 100 characters."
                });

            }


            /* =============================================
               CHECK DUPLICATE EMAIL
            ============================================= */

            const emailExists =
                await profileModel
                    .emailExistsForOtherUser(
                        email,
                        adminId
                    );


            if (emailExists) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email address is already in use."
                });

            }


            /* =============================================
               UPDATE
            ============================================= */

            const result =
                await profileModel
                    .updateAdminProfile(

                        adminId,

                        {
                            name,
                            email,
                            phone,
                            city
                        }

                    );


            if (
                !result ||
                !result.affectedRows
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Admin profile not found."
                });

            }


            /* =============================================
               UPDATE SESSION
            ============================================= */

            req.session.name =
                name;


            req.session.city =
                city;


            req.session.email =
                email;


            await new Promise(
                (resolve, reject) => {

                    req.session.save(
                        error => {

                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve();

                        }
                    );

                }
            );


            /* =============================================
               FRESH PROFILE
            ============================================= */

            const updatedProfile =
                await profileModel
                    .getAdminProfile(
                        adminId
                    );


            return res.json({

                success: true,

                message:
                    "Admin profile updated successfully.",

                profile: {

                    id:
                        updatedProfile?.id ||
                        adminId,

                    name:
                        updatedProfile?.name ||
                        name,

                    email:
                        updatedProfile?.email ||
                        email,

                    phone:
                        updatedProfile?.phone ||
                        phone,

                    city:
                        updatedProfile?.city ||
                        city,

                    role:
                        updatedProfile?.role ||
                        "admin",

                    status:
                        updatedProfile?.status ||
                        "active",

                    created_at:
                        updatedProfile?.created_at ||
                        null

                }

            });

        }
        catch (error) {

            console.error(
                "UPDATE ADMIN PROFILE ERROR:",
                error
            );


            if (
                error.code ===
                "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Email address already exists."

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Unable to update admin profile."

            });

        }

    };


/* =========================================================
   CHANGE ADMIN PASSWORD
========================================================= */

const changeAdminPassword =
    async (req, res) => {

        try {

            if (!isAdminSession(req)) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Admin login required."
                });

            }


            const adminId =
                Number(
                    req.session.userId
                );


            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin session."
                });

            }


            const currentPassword =
                String(
                    req.body?.currentPassword ||
                    ""
                );


            const newPassword =
                String(
                    req.body?.newPassword ||
                    ""
                );


            const confirmPassword =
                String(
                    req.body?.confirmPassword ||
                    ""
                );


            /* =============================================
               VALIDATION
            ============================================= */

            if (!currentPassword) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Current password is required."
                });

            }


            if (!newPassword) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password is required."
                });

            }


            if (!confirmPassword) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Confirm password is required."
                });

            }


            if (
                newPassword.length < 8
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be at least 8 characters."
                });

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password and confirm password do not match."
                });

            }


            if (
                currentPassword ===
                newPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be different from the current password."
                });

            }


            /* =============================================
               GET ADMIN PASSWORD
            ============================================= */

            const admin =
                await profileModel
                    .getAdminWithPassword(
                        adminId
                    );


            if (!admin) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Admin account not found."
                });

            }


            if (
                !admin.password
            ) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Admin password is not configured correctly."
                });

            }


            /* =============================================
               VERIFY CURRENT PASSWORD
            ============================================= */

            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    admin.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Current password is incorrect."
                });

            }


            /* =============================================
               HASH NEW PASSWORD
            ============================================= */

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            /* =============================================
               SAVE PASSWORD
            ============================================= */

            const result =
                await profileModel
                    .updateAdminPassword(

                        adminId,

                        hashedPassword

                    );


            if (
                !result ||
                !result.affectedRows
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Admin account not found."
                });

            }


            return res.json({

                success: true,

                message:
                    "Admin password updated successfully."

            });

        }
        catch (error) {

            console.error(
                "CHANGE ADMIN PASSWORD ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to change admin password."

            });

        }

    };


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getAdminProfile,

    updateAdminProfile,

    changeAdminPassword

};