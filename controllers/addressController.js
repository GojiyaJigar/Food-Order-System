const addressModel =
    require("../models/addressModel");


// =====================================================
// LOGIN CHECK
// =====================================================

function isLoggedIn(req, res) {

    if (!req.session || !req.session.userId) {

        res.status(401).json({

            success: false,

            message:
                "Please login first."

        });

        return false;
    }

    return true;
}


// =====================================================
// VALIDATE ADDRESS
// =====================================================

function validateAddress(data) {

    if (
        !data.fullName ||
        !data.phone ||
        !data.address ||
        !data.city ||
        !data.state ||
        !data.pincode
    ) {

        return "Please fill all address details.";

    }


    if (
        !/^[0-9]{10}$/.test(
            String(data.phone).trim()
        )
    ) {

        return "Please enter a valid 10 digit phone number.";

    }


    if (
        !/^[0-9]{6}$/.test(
            String(data.pincode).trim()
        )
    ) {

        return "Please enter a valid 6 digit pincode.";

    }


    return null;
}


// =====================================================
// FORMAT ADDRESS DATA
// =====================================================

function getAddressData(req) {

    return {

        addressLabel:
            String(
                req.body.addressLabel ||
                "Home"
            ).trim(),

        fullName:
            String(
                req.body.fullName ||
                ""
            ).trim(),

        phone:
            String(
                req.body.phone ||
                ""
            ).trim(),

        address:
            String(
                req.body.address ||
                ""
            ).trim(),

        city:
            String(
                req.body.city ||
                ""
            ).trim(),

        state:
            String(
                req.body.state ||
                ""
            ).trim(),

        pincode:
            String(
                req.body.pincode ||
                ""
            ).trim(),

        isDefault:
            req.body.isDefault === true ||
            req.body.isDefault === 1 ||
            req.body.isDefault === "1"

    };
}


// =====================================================
// GET ADDRESSES
// =====================================================

const getAddresses = (req, res) => {

    if (!isLoggedIn(req, res)) {
        return;
    }


    const userId =
        req.session.userId;


    addressModel.getAddresses(
        userId,
        (err, addresses) => {

            if (err) {

                console.error(
                    "GET ADDRESSES ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to load addresses.",

                    error:
                        err.sqlMessage ||
                        err.message

                });

            }


            return res.status(200).json({

                success: true,

                addresses:
                    addresses || []

            });

        }
    );

};


// =====================================================
// CREATE ADDRESS
// =====================================================

const createAddress = (req, res) => {

    if (!isLoggedIn(req, res)) {
        return;
    }


    const userId =
        req.session.userId;


    console.log(
        "LOGGED USER ID:",
        userId
    );


    const data =
        getAddressData(req);


    console.log(
        "ADDRESS DATA:",
        data
    );


    // =============================================
    // VALIDATION
    // =============================================

    const validationError =
        validateAddress(data);


    if (validationError) {

        return res.status(400).json({

            success: false,

            message:
                validationError

        });

    }


    // =============================================
    // INSERT ADDRESS
    // =============================================

    const insertAddress = () => {

        addressModel.createAddress(

            userId,

            data,

            (err, result) => {

                if (err) {

                    console.error(
                        "================================"
                    );

                    console.error(
                        "CREATE ADDRESS ERROR"
                    );

                    console.error(
                        "CODE:",
                        err.code
                    );

                    console.error(
                        "MESSAGE:",
                        err.message
                    );

                    console.error(
                        "SQL MESSAGE:",
                        err.sqlMessage
                    );

                    console.error(
                        "SQL:",
                        err.sql
                    );

                    console.error(
                        "================================"
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            err.sqlMessage ||
                            err.message ||
                            "Unable to save address."

                    });

                }


                console.log(
                    "ADDRESS CREATED:",
                    result.insertId
                );


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


    // =============================================
    // DEFAULT ADDRESS
    // =============================================

    if (data.isDefault) {

        addressModel.removeDefault(

            userId,

            (err) => {

                if (err) {

                    console.error(
                        "REMOVE DEFAULT ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            err.sqlMessage ||
                            "Unable to save address."

                    });

                }


                insertAddress();

            }
        );

    } else {

        insertAddress();

    }

};


// =====================================================
// UPDATE ADDRESS
// =====================================================

const updateAddress = (req, res) => {

    if (!isLoggedIn(req, res)) {
        return;
    }


    const userId =
        req.session.userId;


    const addressId =
        Number(req.params.id);


    if (!addressId) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid address ID."

        });

    }


    const data =
        getAddressData(req);


    const validationError =
        validateAddress(data);


    if (validationError) {

        return res.status(400).json({

            success: false,

            message:
                validationError

        });

    }


    const update = () => {

        addressModel.updateAddress(

            userId,

            addressId,

            data,

            (err, result) => {

                if (err) {

                    console.error(
                        "UPDATE ADDRESS ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            err.sqlMessage ||
                            err.message ||
                            "Unable to update address."

                    });

                }


                if (
                    result.affectedRows === 0
                ) {

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


    if (data.isDefault) {

        addressModel.removeDefault(

            userId,

            (err) => {

                if (err) {

                    console.error(
                        "REMOVE DEFAULT ERROR:",
                        err
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Unable to update address."

                    });

                }


                update();

            }
        );

    } else {

        update();

    }

};


// =====================================================
// DELETE ADDRESS
// =====================================================

const deleteAddress = (req, res) => {

    if (!isLoggedIn(req, res)) {
        return;
    }


    const userId =
        req.session.userId;


    const addressId =
        Number(req.params.id);


    if (!addressId) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid address ID."

        });

    }


    addressModel.deleteAddress(

        userId,

        addressId,

        (err, result) => {

            if (err) {

                console.error(
                    "DELETE ADDRESS ERROR:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        err.sqlMessage ||
                        err.message ||
                        "Unable to delete address."

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Address not found."

                });

            }


            return res.json({

                success: true,

                message:
                    "Address deleted successfully."

            });

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAddresses,

    createAddress,

    updateAddress,

    deleteAddress

};