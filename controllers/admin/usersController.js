const usersModel =
    require("../../models/admin/usersModel");


/* =========================================================
   GET ALL CUSTOMERS
========================================================= */

const getUsers = (req, res) => {

    usersModel.getAllCustomers(
        (error, users) => {

            if (error) {

                console.error(
                    "GET USERS ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to load customers."
                });
            }


            const formattedUsers =
                (users || []).map(user => ({

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    city:
                        user.city,

                    state:
                        user.state,

                    pincode:
                        user.pincode,

                    address:
                        user.address,

                    status:
                        user.status || "active",

                    created_at:
                        user.created_at,

                    total_orders:
                        Number(
                            user.total_orders || 0
                        ),

                    total_spent:
                        Number(
                            user.total_spent || 0
                        )
                }));


            return res.json({
                success: true,
                users: formattedUsers
            });
        }
    );
};


/* =========================================================
   GET SINGLE CUSTOMER
========================================================= */

const getUserById = (
    req,
    res
) => {

    const userId =
        Number(req.params.id);


    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid customer ID."
        });
    }


    usersModel.getCustomerById(
        userId,
        (error, user) => {

            if (error) {

                console.error(
                    "GET USER ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to load customer."
                });
            }


            if (!user) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found."
                });
            }


            return res.json({

                success: true,

                user: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    phone:
                        user.phone,

                    city:
                        user.city,

                    state:
                        user.state,

                    pincode:
                        user.pincode,

                    address:
                        user.address,

                    status:
                        user.status || "active",

                    created_at:
                        user.created_at,

                    total_orders:
                        Number(
                            user.total_orders || 0
                        ),

                    total_spent:
                        Number(
                            user.total_spent || 0
                        )
                }
            });
        }
    );
};


/* =========================================================
   UPDATE CUSTOMER
========================================================= */

const updateUser = (
    req,
    res
) => {

    const userId =
        Number(req.params.id);


    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid customer ID."
        });
    }


    const {
        name,
        email,
        phone,
        city,
        state,
        pincode,
        address
    } = req.body || {};


    /* ==========================================
       VALIDATION
    ========================================== */

    if (
        !name ||
        !email ||
        !phone ||
        !city
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Name, email, phone and city are required."
        });
    }


    const cleanData = {

        name:
            String(name).trim(),

        email:
            String(email).trim(),

        phone:
            String(phone).trim(),

        city:
            String(city).trim(),

        state:
            String(state || "").trim(),

        pincode:
            String(pincode || "").trim(),

        address:
            String(address || "").trim()
    };


    usersModel.updateCustomer(
        userId,
        cleanData,
        (error, result) => {

            if (error) {

                console.error(
                    "UPDATE USER ERROR:",
                    error
                );


                if (
                    error.code ===
                    "ER_DUP_ENTRY"
                ) {

                    return res.status(409).json({
                        success: false,
                        message:
                            "Email or phone already exists."
                    });
                }


                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to update customer."
                });
            }


            if (
                !result ||
                !result.affectedRows
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found."
                });
            }


            return res.json({
                success: true,
                message:
                    "Customer updated successfully."
            });
        }
    );
};


/* =========================================================
   BLOCK / ACTIVATE
========================================================= */

const updateUserStatus = (
    req,
    res
) => {

    const userId =
        Number(req.params.id);


    const status =
        String(
            req.body?.status || ""
        )
        .trim()
        .toLowerCase();


    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid customer ID."
        });
    }


    if (
        !["active", "inactive"]
            .includes(status)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid customer status."
        });
    }


    usersModel.updateCustomerStatus(
        userId,
        status,
        (error, result) => {

            if (error) {

                console.error(
                    "STATUS UPDATE ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        error.sqlMessage ||
                        error.message ||
                        "Unable to update customer status."
                });
            }


            if (
                !result ||
                !result.affectedRows
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Customer not found."
                });
            }


            return res.json({

                success: true,

                message:
                    status === "active"
                        ? "Customer activated successfully."
                        : "Customer blocked successfully.",

                status
            });
        }
    );
};


/* =========================================================
   DELETE CUSTOMER
========================================================= */

const deleteUser = (
    req,
    res
) => {

    const userId =
        Number(req.params.id);


    /* ==========================================
       VALIDATE ID
    ========================================== */

    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid customer ID."
        });
    }


    /* ==========================================
       CHECK ORDER STATUS
    ========================================== */

    usersModel.canDeleteCustomer(
        userId,
        (checkError, orderInfo) => {

            if (checkError) {

                console.error(
                    "DELETE CHECK ERROR:",
                    checkError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        checkError.sqlMessage ||
                        checkError.message ||
                        "Unable to verify customer orders."
                });
            }


            /*
             * IMPORTANT:
             *
             * activeOrders > 0 means at least
             * one order is:
             *
             * Pending
             * Confirmed
             * Preparing
             * Out For Delivery
             *
             * So deletion is blocked.
             */

            if (
                orderInfo.activeOrders > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Customer cannot be deleted because one or more orders are still active."
                });
            }


            /* ==========================================
               DELETE CUSTOMER
            ========================================== */

            usersModel.deleteCustomer(
                userId,
                (error, result) => {

                    if (error) {

                        console.error(
                            "DELETE CUSTOMER ERROR:",
                            error
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                error.sqlMessage ||
                                error.message ||
                                "Unable to delete customer."
                        });
                    }


                    if (
                        !result ||
                        !result.affectedRows
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Customer not found."
                        });
                    }


                    return res.json({

                        success: true,

                        message:
                            "Customer deleted successfully."
                    });
                }
            );
        }
    );
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    getUsers,

    getUserById,

    updateUser,

    updateUserStatus,

    deleteUser
};