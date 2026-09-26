"use strict";

const addressModel = require("../models/addressModel");


// =====================================================
// CHECK LOGIN
// =====================================================

function checkLogin(req, res) {

    if (!req.session || !req.session.userId) {

        res.status(401).json({
            success: false,
            message: "Please login first."
        });

        return false;
    }

    return true;
}


// =====================================================
// BOOLEAN HELPER
// =====================================================

function isTrue(value) {

    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true"
    );
}


// =====================================================
// GET ALL ADDRESSES
// =====================================================

const getAddresses = (req, res) => {

    if (!checkLogin(req, res)) return;

    const userId = req.session.userId;

    addressModel.getAddresses(
        userId,
        (error, addresses) => {

            if (error) {

                console.error(
                    "GET ADDRESSES ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            const list = addresses || [];

            const defaultAddress =
                list.find(
                    address =>
                        Number(address.is_default) === 1
                ) || null;

            return res.json({

                success: true,

                count: list.length,

                addresses: list,

                defaultAddress

            });

        }
    );
};


// =====================================================
// GET DEFAULT ADDRESS
// =====================================================

const getDefaultAddress = (req, res) => {

    if (!checkLogin(req, res)) return;

    const userId = req.session.userId;

    addressModel.getAddresses(
        userId,
        (error, addresses) => {

            if (error) {

                console.error(
                    "GET DEFAULT ADDRESS ERROR:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            const list = addresses || [];

            const defaultAddress =
                list.find(
                    address =>
                        Number(address.is_default) === 1
                ) || null;

            return res.json({

                success: true,

                address: defaultAddress

            });

        }
    );
};


// =====================================================
// CREATE ADDRESS
// =====================================================

const createAddress = (req, res) => {

    if (!checkLogin(req, res)) return;

    const userId = req.session.userId;

    const data = req.body || {};

    const addressLabel = String(
        data.addressLabel ||
        data.address_label ||
        "Home"
    ).trim();

    const fullName = String(
        data.fullName ||
        data.full_name ||
        ""
    ).trim();

    const phone = String(
        data.phone || ""
    ).trim();

    const address = String(
        data.address || ""
    ).trim();

    const city = String(
        data.city || ""
    ).trim();

    const state = String(
        data.state || ""
    ).trim();

    const pincode = String(
        data.pincode || ""
    ).trim();

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        return res.status(400).json({
            success: false,
            message: "Please fill all address details."
        });
    }

    // -------------------------------------------------
    // GET EXISTING ADDRESSES
    // -------------------------------------------------

    addressModel.getAddresses(
        userId,
        (getError, existingAddresses) => {

            if (getError) {

                console.error(
                    "CHECK ADDRESS ERROR:",
                    getError
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            const list =
                existingAddresses || [];

            /*
             * First address automatically becomes default.
             *
             * If user selected "Make Default",
             * new address also becomes default.
             */

            const shouldBeDefault =
                list.length === 0 ||
                isTrue(data.isDefault);

            const saveAddress = () => {

                addressModel.createAddress(
                    userId,
                    {
                        addressLabel,
                        fullName,
                        phone,
                        address,
                        city,
                        state,
                        pincode,
                        isDefault: shouldBeDefault
                    },
                    (error, result) => {

                        if (error) {

                            console.error(
                                "CREATE ADDRESS ERROR:",
                                error
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to save address."
                            });
                        }

                        return res.status(201).json({

                            success: true,

                            message:
                                "Address saved successfully.",

                            addressId:
                                result.insertId

                        });

                    }
                );

            };

            // -------------------------------------------------
            // NEW ADDRESS BECOMES DEFAULT
            // -------------------------------------------------

            if (shouldBeDefault) {

                return addressModel.removeDefault(
                    userId,
                    removeError => {

                        if (removeError) {

                            console.error(
                                "REMOVE OLD DEFAULT ERROR:",
                                removeError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to update default address."
                            });
                        }

                        saveAddress();

                    }
                );
            }

            saveAddress();

        }
    );
};


// =====================================================
// UPDATE ADDRESS
// =====================================================

const updateAddress = (req, res) => {

    if (!checkLogin(req, res)) return;

    const userId = req.session.userId;

    const addressId =
        Number(req.params.id);

    if (
        !Number.isInteger(addressId) ||
        addressId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid address ID."
        });
    }

    const data = req.body || {};

    const addressLabel = String(
        data.addressLabel ||
        data.address_label ||
        "Home"
    ).trim();

    const fullName = String(
        data.fullName ||
        data.full_name ||
        ""
    ).trim();

    const phone = String(
        data.phone || ""
    ).trim();

    const address = String(
        data.address || ""
    ).trim();

    const city = String(
        data.city || ""
    ).trim();

    const state = String(
        data.state || ""
    ).trim();

    const pincode = String(
        data.pincode || ""
    ).trim();

    if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Please fill all address details."
        });
    }

    // -------------------------------------------------
    // CHECK ADDRESS BELONGS TO USER
    // -------------------------------------------------

    addressModel.getAddressById(
        userId,
        addressId,
        (findError, rows) => {

            if (findError) {

                console.error(
                    "FIND ADDRESS ERROR:",
                    findError
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!rows || !rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Address not found."
                });
            }

            const oldAddress = rows[0];

            const wantsDefault =
                isTrue(data.isDefault);

            // -------------------------------------------------
            // UPDATE FUNCTION
            // -------------------------------------------------

            const saveUpdate = isDefault => {

                addressModel.updateAddress(
                    userId,
                    addressId,
                    {
                        addressLabel,
                        fullName,
                        phone,
                        address,
                        city,
                        state,
                        pincode,
                        isDefault
                    },
                    (error, result) => {

                        if (error) {

                            console.error(
                                "UPDATE ADDRESS ERROR:",
                                error
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to update address."
                            });
                        }

                        if (!result.affectedRows) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "Address not found."
                            });
                        }

                        return res.json({

                            success: true,

                            message:
                                "Address updated successfully."

                        });

                    }
                );
            };


            // -------------------------------------------------
            // MAKE THIS ADDRESS DEFAULT
            // -------------------------------------------------

            if (wantsDefault) {

                return addressModel.removeDefault(
                    userId,
                    removeError => {

                        if (removeError) {

                            console.error(
                                "REMOVE DEFAULT ERROR:",
                                removeError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to update default address."
                            });
                        }

                        saveUpdate(true);

                    }
                );
            }


            // -------------------------------------------------
            // IF CURRENT ADDRESS WAS DEFAULT
            // KEEP ANOTHER ADDRESS AS DEFAULT
            // -------------------------------------------------

            if (
                Number(oldAddress.is_default) === 1
            ) {

                return addressModel.getAddresses(
                    userId,
                    (listError, addresses) => {

                        if (listError) {

                            console.error(
                                "GET ADDRESSES ERROR:",
                                listError
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Database error."
                            });
                        }

                        const otherAddress =
                            (addresses || []).find(
                                item =>
                                    Number(item.id) !==
                                    addressId
                            );

                        // No other address exists.
                        // Keep this address default.
                        if (!otherAddress) {

                            return saveUpdate(true);
                        }

                        // Remove all defaults first.
                        addressModel.removeDefault(
                            userId,
                            removeError => {

                                if (removeError) {

                                    console.error(
                                        "REMOVE DEFAULT ERROR:",
                                        removeError
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Unable to update address."
                                    });
                                }

                                // Update current address
                                saveUpdate(false);

                                // Make another address default
                                addressModel.updateAddress(
                                    userId,
                                    otherAddress.id,
                                    {
                                        addressLabel:
                                            otherAddress.address_label,

                                        fullName:
                                            otherAddress.full_name,

                                        phone:
                                            otherAddress.phone,

                                        address:
                                            otherAddress.address,

                                        city:
                                            otherAddress.city,

                                        state:
                                            otherAddress.state,

                                        pincode:
                                            otherAddress.pincode,

                                        isDefault: true
                                    },
                                    defaultError => {

                                        if (defaultError) {

                                            console.error(
                                                "MAKE NEXT DEFAULT ERROR:",
                                                defaultError
                                            );

                                        }

                                    }
                                );

                            }
                        );

                        return;
                    }
                );
            }


            // -------------------------------------------------
            // NORMAL UPDATE
            // -------------------------------------------------

            saveUpdate(false);

        }
    );
};


// =====================================================
// DELETE ADDRESS
// =====================================================

const deleteAddress = (req, res) => {

    if (!checkLogin(req, res)) return;

    const userId = req.session.userId;

    const addressId =
        Number(req.params.id);

    if (
        !Number.isInteger(addressId) ||
        addressId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Invalid address ID."
        });
    }

    // -------------------------------------------------
    // FIND ADDRESS FIRST
    // -------------------------------------------------

    addressModel.getAddressById(
        userId,
        addressId,
        (findError, rows) => {

            if (findError) {

                console.error(
                    "DELETE ADDRESS FIND ERROR:",
                    findError
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (!rows || !rows.length) {

                return res.status(404).json({
                    success: false,
                    message: "Address not found."
                });
            }

            const deletedAddress =
                rows[0];

            const wasDefault =
                Number(
                    deletedAddress.is_default
                ) === 1;


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            addressModel.deleteAddress(
                userId,
                addressId,
                (deleteError, result) => {

                    if (deleteError) {

                        console.error(
                            "DELETE ADDRESS ERROR:",
                            deleteError
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Unable to delete address."
                        });
                    }

                    if (!result.affectedRows) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "Address not found."
                        });
                    }


                    // -------------------------------------------------
                    // IF DELETED ADDRESS WAS DEFAULT
                    // MAKE NEXT ADDRESS DEFAULT
                    // -------------------------------------------------

                    if (wasDefault) {

                        return addressModel.getAddresses(
                            userId,
                            (listError, addresses) => {

                                if (listError) {

                                    console.error(
                                        "GET NEXT ADDRESS ERROR:",
                                        listError
                                    );

                                    return res.json({
                                        success: true,
                                        message:
                                            "Address deleted successfully."
                                    });
                                }

                                const nextAddress =
                                    (addresses || [])[0];

                                if (!nextAddress) {

                                    return res.json({
                                        success: true,
                                        message:
                                            "Address deleted successfully."
                                    });
                                }


                                addressModel.removeDefault(
                                    userId,
                                    removeError => {

                                        if (removeError) {

                                            console.error(
                                                "REMOVE DEFAULT ERROR:",
                                                removeError
                                            );

                                            return res.json({
                                                success: true,
                                                message:
                                                    "Address deleted successfully."
                                            });
                                        }


                                        addressModel.updateAddress(
                                            userId,
                                            nextAddress.id,
                                            {
                                                addressLabel:
                                                    nextAddress.address_label,

                                                fullName:
                                                    nextAddress.full_name,

                                                phone:
                                                    nextAddress.phone,

                                                address:
                                                    nextAddress.address,

                                                city:
                                                    nextAddress.city,

                                                state:
                                                    nextAddress.state,

                                                pincode:
                                                    nextAddress.pincode,

                                                isDefault: true
                                            },
                                            defaultError => {

                                                if (defaultError) {

                                                    console.error(
                                                        "MAKE NEXT DEFAULT ERROR:",
                                                        defaultError
                                                    );
                                                }

                                                return res.json({
                                                    success: true,
                                                    message:
                                                        "Address deleted successfully."
                                                });

                                            }
                                        );

                                    }
                                );

                            }
                        );
                    }


                    return res.json({

                        success: true,

                        message:
                            "Address deleted successfully."

                    });

                }
            );

        }
    );
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAddresses,

    getDefaultAddress,

    createAddress,

    updateAddress,

    deleteAddress

};