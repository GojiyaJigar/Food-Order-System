"use strict";

const usersModel = require("../../models/admin/usersModel");

// Get All Customers
const getUsers = (req, res) => {
    usersModel.getAllCustomers((error, users) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to load customers."
            });
        }

        const formattedUsers = (users || []).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            address: user.address,
            status: user.status || "active",
            created_at: user.created_at,
            total_orders: Number(user.total_orders || 0),
            total_spent: Number(user.total_spent || 0)
        }));

        return res.json({
            success: true,
            users: formattedUsers
        });
    });
};

// Get Single Customer Details
const getUserById = (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID."
        });
    }

    usersModel.getCustomerById(userId, (error, user) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to load customer."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                city: user.city,
                state: user.state,
                pincode: user.pincode,
                address: user.address,
                status: user.status || "active",
                created_at: user.created_at,
                total_orders: Number(user.total_orders || 0),
                total_spent: Number(user.total_spent || 0)
            }
        });
    });
};

// Update Customer Profile
const updateUser = (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID."
        });
    }

    const { name, email, phone, city, state, pincode, address } = req.body || {};

    if (!name || !email || !phone || !city) {
        return res.status(400).json({
            success: false,
            message: "Name, email, phone and city are required."
        });
    }

    const cleanData = {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        city: String(city).trim(),
        state: String(state || "").trim(),
        pincode: String(pincode || "").trim(),
        address: String(address || "").trim()
    };

    usersModel.updateCustomer(userId, cleanData, (error, result) => {
        if (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Email or phone already exists."
                });
            }

            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to update customer."
            });
        }

        if (!result || !result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        usersModel.getCustomerById(userId, (getError, updatedUser) => {
            if (getError) {
                return res.status(500).json({
                    success: false,
                    message: getError.sqlMessage || getError.message || "Customer updated but latest data could not be loaded."
                });
            }

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "Customer updated but customer data was not found."
                });
            }

            return res.json({
                success: true,
                message: "Customer updated successfully.",
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    city: updatedUser.city,
                    state: updatedUser.state,
                    pincode: updatedUser.pincode,
                    address: updatedUser.address,
                    status: updatedUser.status || "active",
                    created_at: updatedUser.created_at,
                    total_orders: Number(updatedUser.total_orders || 0),
                    total_spent: Number(updatedUser.total_spent || 0)
                }
            });
        });
    });
};

// Block or Activate Customer Status
const updateUserStatus = (req, res) => {
    const userId = Number(req.params.id);
    const status = String(req.body?.status || "").trim().toLowerCase();

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID."
        });
    }

    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer status."
        });
    }

    usersModel.updateCustomerStatus(userId, status, (error, result) => {
        if (error) {
            return res.status(500).json({
                success: false,
                message: error.sqlMessage || error.message || "Unable to update customer status."
            });
        }

        if (!result || !result.affectedRows) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        return res.json({
            success: true,
            message: status === "active" ? "Customer activated successfully." : "Customer blocked successfully.",
            status
        });
    });
};

// Delete Customer Record
const deleteUser = (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID."
        });
    }

    usersModel.canDeleteCustomer(userId, (checkError, orderInfo) => {
        if (checkError) {
            return res.status(500).json({
                success: false,
                message: checkError.sqlMessage || checkError.message || "Unable to verify customer orders."
            });
        }

        if (orderInfo.activeOrders > 0) {
            return res.status(409).json({
                success: false,
                message: "Customer cannot be deleted because one or more orders are still active."
            });
        }

        usersModel.deleteCustomer(userId, (error, result) => {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: error.sqlMessage || error.message || "Unable to delete customer."
                });
            }

            if (!result || !result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }

            return res.json({
                success: true,
                message: "Customer deleted successfully."
            });
        });
    });
};

// Export Modules
module.exports = {
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
};