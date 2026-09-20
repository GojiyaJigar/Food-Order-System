"use strict";

require("dotenv").config();
const nodemailer = require("nodemailer");

// =====================================================
// GMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// =====================================================
// SEND PASSWORD RESET EMAIL
// =====================================================

const sendPasswordResetEmail = async ({
    to,
    customerName,
    resetUrl
}) => {
    if (!to) {
        throw new Error("Recipient email is required.");
    }

    const safeName = String(customerName || "Foodie")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeResetUrl = String(resetUrl || "#")
        .replace(/"/g, "&quot;");

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Jigato Password</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI',Helvetica,Arial,sans-serif; color:#1f2937;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6; padding:40px 15px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">

<!-- HEADER -->
<tr>
<td style="background:linear-gradient(135deg, #ff4f18, #ff7a50); padding:32px 30px; text-align:center;">
    <div style="color:#ffffff; font-size:26px; font-weight:900; letter-spacing:-0.5px;">
        Jigato
    </div>
    <div style="margin-top:4px; color:#ffe8e2; font-size:13px; font-weight:600;">
        Account Security & Recovery
    </div>
</td>
</tr>

<!-- CONTENT SECTION -->
<tr>
<td style="padding:36px 30px; color:#111827;">

    <h2 style="margin:0 0 16px; font-size:22px; font-weight:800; color:#111827;">
        Password Reset Request 🔐
    </h2>

    <p style="font-size:15px; line-height:1.6; color:#4b5563; margin:0 0 16px;">
        Hello <strong style="color:#111827;">${safeName}</strong>,
    </p>

    <p style="font-size:15px; line-height:1.6; color:#4b5563; margin:0 0 24px;">
        We received a request to reset the password for your Jigato account. Click the secure button below to choose a new password.
    </p>

    <!-- ACTION BUTTON -->
    <div style="text-align:center; margin:32px 0;">
        <a href="${safeResetUrl}" style="display:inline-block; background:#ff4f18; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:800; box-shadow:0 4px 12px rgba(255, 79, 24, 0.3);">
            Reset My Password
        </a>
    </div>

    <!-- EXPIRY WARNING BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffaf9; border:1px solid #fed7aa; border-left:4px solid #ff4f18; border-radius:8px; margin:24px 0;">
        <tr>
            <td style="padding:14px 16px; font-size:13px; color:#9a3412; line-height:1.5;">
                <strong>⚠️ Security Notice:</strong> This password reset link is valid for only <strong>15 minutes</strong>. Do not share this link with anyone.
            </td>
        </tr>
    </table>

    <p style="font-size:13px; line-height:1.6; color:#6b7280; margin:24px 0 0;">
        If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.
    </p>

    <p style="margin:30px 0 0; font-size:14px; font-weight:700; color:#111827;">
        — Team Jigato
    </p>

</td>
</tr>

<!-- ALTERNATIVE LINK SECTION -->
<tr>
<td style="padding:0 30px 24px; background:#ffffff;">
    <div style="font-size:12px; color:#9ca3af; line-height:1.5; border-top:1px solid #f3f4f6; padding-top:16px; word-break:break-all;">
        If the button above doesn't work, copy and paste this URL into your browser:<br>
        <a href="${safeResetUrl}" style="color:#ff4f18; text-decoration:underline;">${safeResetUrl}</a>
    </div>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="padding:20px 30px; background:#f9fafb; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:11px; line-height:1.5;">
    © ${new Date().getFullYear()} Jigato Inc. All rights reserved.<br>
    This is an automated system notification. Please do not reply directly to this email.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

    const text = `
Jigato - Password Recovery

Hello ${customerName || "Customer"},

We received a request to reset your Jigato password. 
Open the link below to set a new password (valid for 15 minutes):
${resetUrl}

If you did not request this, please ignore this email.

— Team Jigato
`;

    await transporter.sendMail({
        from: `"Jigato Security" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset Your Jigato Password",
        text,
        html
    });
};

module.exports = {
    sendPasswordResetEmail
};