const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const db = require("../config/db");


// =====================================================
// EMAIL TRANSPORTER
// =====================================================

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASSWORD

        }

    });


// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword = async (
    req,
    res
) => {

    try {

        const email =
            String(
                req.body.email || ""
            )
                .trim()
                .toLowerCase();


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email address."

            });

        }


        // =================================================
        // FIND USER
        // =================================================

        const findUserQuery = `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE email = ?
            LIMIT 1
        `;


        db.query(
            findUserQuery,
            [email],
            async (
                dbError,
                users
            ) => {

                if (dbError) {

                    console.error(
                        "FORGOT PASSWORD DB ERROR:",
                        dbError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong. Please try again."

                    });

                }


                // =================================================
                // USER NOT FOUND
                // =================================================

                if (
                    !users ||
                    users.length === 0
                ) {

                    return res.json({

                        success: true,

                        message:
                            "If this email is registered, a password reset link has been sent."

                    });

                }


                const user =
                    users[0];


                // =================================================
                // CREATE SECURE TOKEN
                // =================================================

                const rawToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                const tokenHash =
                    crypto
                        .createHash("sha256")
                        .update(rawToken)
                        .digest("hex");


                // 15 MINUTES

                const expiresAt =
                    new Date(
                        Date.now() +
                        15 * 60 * 1000
                    );


                // =================================================
                // DELETE OLD UNUSED TOKENS
                // =================================================

                const deleteQuery = `
                    DELETE FROM password_reset_tokens
                    WHERE user_id = ?
                    AND used_at IS NULL
                `;


                db.query(
                    deleteQuery,
                    [user.id],
                    (deleteError) => {

                        if (deleteError) {

                            console.error(
                                "OLD TOKEN DELETE ERROR:",
                                deleteError
                            );

                        }


                        // =================================================
                        // SAVE NEW TOKEN
                        // =================================================

                        const insertQuery = `
                            INSERT INTO password_reset_tokens
                            (
                                user_id,
                                token_hash,
                                expires_at
                            )
                            VALUES (?, ?, ?)
                        `;


                        db.query(
                            insertQuery,
                            [
                                user.id,
                                tokenHash,
                                expiresAt
                            ],
                            async (
                                insertError
                            ) => {

                                if (insertError) {

                                    console.error(
                                        "RESET TOKEN INSERT ERROR:",
                                        insertError
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Unable to create reset link."

                                    });

                                }


                                // =================================================
                                // RESET URL
                                // =================================================

                                const resetUrl =
                                    `http://localhost:5000/reset-password?token=${rawToken}`;


                                // =================================================
                                // PROFESSIONAL EMAIL
                                // =================================================

                                const mailOptions = {

                                    from:
                                        `"Jigato" <${process.env.EMAIL_USER}>`,

                                    to:
                                        user.email,

                                    subject:
                                        "Reset Your Jigato Password",

                                    html: `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Reset Your Jigato Password</title>

</head>


<body style="
    margin:0;
    padding:0;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 15px;"
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
    "
>


<!-- HEADER -->

<tr>

<td style="
    background:#ff5a36;
    padding:28px 30px;
    text-align:center;
">

    <div style="
        color:#ffffff;
        font-size:30px;
        font-weight:800;
        letter-spacing:1px;
    ">
        JIGATO
    </div>

    <div style="
        color:#ffe8e2;
        font-size:13px;
        margin-top:6px;
    ">
        Food. Fast. Fresh.
    </div>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td style="
    padding:40px 35px;
    color:#222222;
">


<h1 style="
    margin:0 0 18px;
    font-size:25px;
    color:#222222;
">

    Reset Your Password

</h1>


<p style="
    font-size:16px;
    line-height:1.6;
    margin:0 0 18px;
">

    Hi <strong>${user.name}</strong>,

</p>


<p style="
    font-size:15px;
    line-height:1.7;
    color:#555555;
">

    We received a request to reset the password
    for your Jigato account.

</p>


<p style="
    font-size:15px;
    line-height:1.7;
    color:#555555;
">

    Click the button below to create a new password.

</p>


<!-- BUTTON -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="margin:30px 0;"
>

<tr>

<td align="center">

<a
    href="${resetUrl}"
    style="
        display:inline-block;
        background:#ff5a36;
        color:#ffffff;
        text-decoration:none;
        padding:15px 30px;
        border-radius:10px;
        font-size:15px;
        font-weight:bold;
    "
>

    Reset My Password

</a>

</td>

</tr>

</table>


<!-- EXPIRY -->

<div style="
    background:#fff7f4;
    border:1px solid #ffe0d7;
    border-radius:10px;
    padding:15px;
    margin-bottom:22px;
">

    <p style="
        margin:0;
        color:#555555;
        font-size:14px;
        line-height:1.6;
    ">

        🔐 This password reset link will expire
        in <strong>15 minutes</strong>.

    </p>

</div>


<p style="
    font-size:14px;
    line-height:1.6;
    color:#777777;
">

    If you didn't request a password reset,
    you can safely ignore this email.
    Your password will remain unchanged.

</p>


<hr style="
    border:0;
    border-top:1px solid #eeeeee;
    margin:30px 0;
">


<p style="
    margin:0;
    font-size:14px;
    color:#777777;
">

    Stay hungry, stay happy! 🍔

</p>


<p style="
    margin:6px 0 0;
    font-size:14px;
    font-weight:bold;
    color:#333333;
">

    — Team Jigato

</p>


</td>

</tr>


<!-- FOOTER -->

<tr>

<td style="
    background:#fafafa;
    padding:20px 30px;
    text-align:center;
">


<p style="
    margin:0;
    font-size:12px;
    color:#999999;
">

    This is an automated email from Jigato.

</p>


<p style="
    margin:6px 0 0;
    font-size:12px;
    color:#bbbbbb;
">

    Please do not reply to this email.

</p>


</td>

</tr>


</table>


</td>

</tr>

</table>


</body>

</html>

`

                                };


                                // =================================================
                                // SEND EMAIL
                                // =================================================

                                try {

                                    await transporter.sendMail(
                                        mailOptions
                                    );


                                    return res.json({

                                        success: true,

                                        message:
                                            "If this email is registered, a password reset link has been sent."

                                    });

                                }

                                catch (mailError) {

                                    console.error(
                                        "RESET EMAIL ERROR:",
                                        mailError
                                    );


                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Unable to send reset email."

                                    });

                                }

                            }
                        );

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again."

        });

    }

};


// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (
    req,
    res
) => {

    try {

        const token =
            String(
                req.body.token || ""
            ).trim();


        const password =
            String(
                req.body.password || ""
            );


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !token ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid password reset request."

            });

        }


        if (
            password.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // =================================================
        // HASH TOKEN
        // =================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // =================================================
        // FIND TOKEN
        // =================================================

        const findTokenQuery = `
            SELECT
                id,
                user_id,
                expires_at,
                used_at
            FROM password_reset_tokens
            WHERE token_hash = ?
            LIMIT 1
        `;


        db.query(
            findTokenQuery,
            [tokenHash],
            async (
                dbError,
                tokens
            ) => {

                if (dbError) {

                    console.error(
                        "RESET TOKEN DB ERROR:",
                        dbError
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Something went wrong. Please try again."

                    });

                }


                if (
                    !tokens ||
                    tokens.length === 0
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link is invalid or expired."

                    });

                }


                const resetToken =
                    tokens[0];


                // =================================================
                // TOKEN USED
                // =================================================

                if (
                    resetToken.used_at
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has already been used."

                    });

                }


                // =================================================
                // TOKEN EXPIRED
                // =================================================

                if (
                    new Date() >
                    new Date(
                        resetToken.expires_at
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This password reset link has expired."

                    });

                }


                // =================================================
                // HASH NEW PASSWORD
                // =================================================

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // =================================================
                // UPDATE PASSWORD
                // =================================================

                const updateQuery = `
                    UPDATE users
                    SET password = ?
                    WHERE id = ?
                `;


                db.query(
                    updateQuery,
                    [
                        hashedPassword,
                        resetToken.user_id
                    ],
                    (
                        updateError
                    ) => {

                        if (updateError) {

                            console.error(
                                "PASSWORD UPDATE ERROR:",
                                updateError
                            );

                            return res.status(500).json({

                                success: false,

                                message:
                                    "Unable to update password."

                            });

                        }


                        // =================================================
                        // INVALIDATE TOKEN
                        // =================================================

                        const usedQuery = `
                            UPDATE password_reset_tokens
                            SET used_at = NOW()
                            WHERE id = ?
                        `;


                        db.query(
                            usedQuery,
                            [resetToken.id],
                            (
                                usedError
                            ) => {

                                if (usedError) {

                                    console.error(
                                        "TOKEN USED UPDATE ERROR:",
                                        usedError
                                    );

                                    return res.status(500).json({

                                        success: false,

                                        message:
                                            "Password changed, but reset token could not be finalized."

                                    });

                                }


                                return res.json({

                                    success: true,

                                    message:
                                        "Password reset successful. Please login with your new password."

                                });

                            }
                        );

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again."

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    forgotPassword,

    resetPassword

};