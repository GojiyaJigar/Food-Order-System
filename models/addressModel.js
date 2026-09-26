const addressModel = require("../models/addressModel");

// Verify if request session contains an authenticated user ID
function isLoggedIn(req, res) {
    if (!req || !req.session || !req.session.userId) {
        res.status(401).json({
            success: false,
            message: "Please login first."
        });
        return false;
    }
    return true;
}

// Validate input fields, phone number format, and postal pincode
function validateAddress(data) {
    if (
        !data ||
        !data.fullName ||
        !data.phone ||
        !data.address ||
        !data.city ||
        !data.state ||
        !data.pincode
    ) {
        return "Please fill all address details.";
    }

    if (!/^[0-9]{10}$/.test(String(data.phone).trim())) {
        return "Please enter a valid 10 digit phone number.";
    }

    if (!/^[0-9]{6}$/.test(String(data.pincode).trim())) {
        return "Please enter a valid 6 digit pincode.";
    }

    return null;
}

// Extract and format request body address payload fields
function getAddressData(req) {
    const body = req.body || {};
    return {
        addressLabel: String(body.addressLabel || "Home").trim(),
        fullName: String(body.fullName || "").trim(),
        phone: String(body.phone || "").trim(),
        address: String(body.address || "").trim(),
        city: String(body.city || "").trim(),
        state: String(body.state || "").trim(),
        pincode: String(body.pincode || "").trim(),
        isDefault:
            body.isDefault === true ||
            body.isDefault === 1 ||
            body.isDefault === "1" ||
            body.isDefault === "true"
    };
}

// Retrieve all saved user addresses for current session user
const getAddresses = (req, res) => {
    if (!isLoggedIn(req, res)) {
        return;
    }

    const userId = req.session.userId;

    addressModel.getAddresses(userId, (err, addresses) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to load addresses.",
                error: err.sqlMessage || err.message
            });
        }

        return res.status(200).json({
            success: true,
            addresses: addresses || []
        });
    });
};

// Create and save a new user address record
const createAddress = (req, res) => {
    if (!isLoggedIn(req, res)) {
        return;
    }

    const userId = req.session.userId;
    const data = getAddressData(req);
    const validationError = validateAddress(data);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const insertAddress = () => {
        addressModel.createAddress(userId, data, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message || "Unable to save address."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Address saved successfully.",
                addressId: result ? result.insertId : null
            });
        });
    };

    if (data.isDefault) {
        addressModel.removeDefault(userId, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message || "Unable to save address."
                });
            }
            insertAddress();
        });
    } else {
        insertAddress();
    }
};

// Update an existing user address record by ID
const updateAddress = (req, res) => {
    if (!isLoggedIn(req, res)) {
        return;
    }

    const userId = req.session.userId;
    const addressId = Number(req.params.id);

    if (!addressId || isNaN(addressId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid address ID."
        });
    }

    const data = getAddressData(req);
    const validationError = validateAddress(data);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const update = () => {
        addressModel.updateAddress(userId, addressId, data, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message || "Unable to update address."
                });
            }

            if (!result || result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Address updated successfully."
            });
        });
    };

    if (data.isDefault) {
        addressModel.removeDefault(userId, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.sqlMessage || err.message || "Unable to update address."
                });
            }
            update();
        });
    } else {
        update();
    }
};

// Delete a specified user address record by ID
const deleteAddress = (req, res) => {
    if (!isLoggedIn(req, res)) {
        return;
    }

    const userId = req.session.userId;
    const addressId = Number(req.params.id);

    if (!addressId || isNaN(addressId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid address ID."
        });
    }

    addressModel.deleteAddress(userId, addressId, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.sqlMessage || err.message || "Unable to delete address."
            });
        }

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Address not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully."
        });
    });
};

module.exports = {
    isLoggedIn,
    validateAddress,
    getAddressData,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};