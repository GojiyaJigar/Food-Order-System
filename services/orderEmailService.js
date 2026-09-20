"use strict";

require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/* =========================
   HELPERS
========================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function money(value) {
    return Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
}

/* =========================
   STATUS CONTENT
========================= */

function getStatusContent(status) {
    const content = {
        pending: {
            subject: "Jigato Order Received 📋",
            label: "ORDER RECEIVED",
            title: "We've received your order",
            message: "Thanks for trusting Jigato. Your order is waiting for restaurant confirmation.",
            icon: "⏳",
            color: "#f59e0b"
        },
        confirmed: {
            subject: "Jigato Order Confirmed ✅",
            label: "ORDER CONFIRMED",
            title: "Your order is confirmed",
            message: "The restaurant has accepted your order and will start cooking soon.",
            icon: "✓",
            color: "#16a34a"
        },
        preparing: {
            subject: "Your Food Is Being Prepared 🍳",
            label: "KITCHEN PREPARING",
            title: "Chef is on it!",
            message: "Your food is fresh and currently being prepared in the kitchen.",
            icon: "🔥",
            color: "#f97316"
        },
        "out for delivery": {
            subject: "Your Jigato Order Is On The Way 🛵",
            label: "OUT FOR DELIVERY",
            title: "Your food is racing to you",
            message: "Our delivery partner has picked up your order and is heading to your location.",
            icon: "🚀",
            color: "#2563eb"
        },
        delivered: {
            subject: "Order Delivered - Enjoy Your Meal! 😋",
            label: "ORDER DELIVERED",
            title: "Bon Appétit!",
            message: "Your order has been successfully delivered. We hope you love your meal!",
            icon: "🎉",
            color: "#16a34a"
        },
        cancelled: {
            subject: "Jigato Order Cancelled ❌",
            label: "ORDER CANCELLED",
            title: "Order was cancelled",
            message: "Your Jigato order has been cancelled successfully.",
            icon: "✕",
            color: "#dc2626"
        }
    };

    return content[normalizeStatus(status)] || content.pending;
}

/* =========================
   ORDER ITEMS
========================= */

function buildOrderItems(items) {
    if (!Array.isArray(items) || !items.length) {
        return `<tr><td colspan="2" style="padding:15px 0; color:#6b7280; font-size:14px;">No item details available.</td></tr>`;
    }

    return items.map(item => {
        const name = escapeHTML(item.name || "Delicious Item");
        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const total = Number(item.total ?? price * quantity);

        return `
            <tr>
                <td style="padding:12px 0; border-bottom:1px solid #f3f4f6;">
                    <div style="font-size:14px; font-weight:700; color:#111827;">${name}</div>
                    <div style="margin-top:2px; font-size:12px; color:#6b7280;">₹${money(price)} × ${quantity}</div>
                </td>
                <td align="right" style="padding:12px 0; border-bottom:1px solid #f3f4f6; font-size:14px; font-weight:700; color:#111827; white-space:nowrap;">
                    ₹${money(total)}
                </td>
            </tr>
        `;
    }).join("");
}

/* =========================
   SEND ORDER EMAIL
========================= */

const sendOrderEmail = async ({ to, customerName, status, order }) => {
    if (!to) throw new Error("Customer email is required.");

    order = order || {};
    const statusInfo = getStatusContent(status);
    const safeCustomerName = escapeHTML(customerName || "Foodie");
    const orderNumber = escapeHTML(order.orderNumber || `JG-${order.id || "101"}`);
    
    const addressLine = [
        escapeHTML(order.address),
        escapeHTML(order.city),
        escapeHTML(order.state),
        escapeHTML(order.pincode)
    ].filter(Boolean).join(", ");

    const subtotal = Number(order.subtotal || 0);
    const deliveryFee = Number(order.delivery_fee || 0);
    const gst = Number(order.gst || 0);
    const discount = Number(order.discount || 0);
    const totalAmount = Number(order.total_amount || 0);
    const safePayment = escapeHTML(order.payment_method || "COD");
    const safePhone = escapeHTML(order.phone || "");

    const itemsHTML = buildOrderItems(order.items);

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHTML(statusInfo.title)}</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI',Helvetica,Arial,sans-serif; color:#1f2937;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6; padding:30px 10px;">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">

<!-- HEADER BRANDING -->
<tr>
<td style="padding:24px 30px; background:#ffffff; border-bottom:1px solid #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div style="font-size:22px; font-weight:900; color:#ff4f18; letter-spacing:-0.5px;">Jigato</div>
            </td>
            <td align="right" style="font-size:12px; font-weight:600; color:#9ca3af;">
                Order Support
            </td>
        </tr>
    </table>
</td>
</tr>

<!-- HERO STATUS BANNER -->
<tr>
<td align="center" style="padding:36px 30px 24px; background:linear-gradient(to bottom, #fffaf9, #ffffff);">
    <div style="width:56px; height:56px; line-height:56px; border-radius:50%; background:${statusInfo.color}; color:#ffffff; font-size:24px; text-align:center; margin:0 auto 16px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        ${statusInfo.icon}
    </div>
    <div style="font-size:11px; font-weight:800; letter-spacing:1.5px; color:${statusInfo.color}; margin-bottom:6px;">
        ${statusInfo.label}
    </div>
    <h1 style="margin:0; font-size:22px; font-weight:800; color:#111827;">
        ${statusInfo.title}
    </h1>
    <p style="margin:10px auto 0; max-width:420px; font-size:14px; line-height:1.6; color:#4b5563;">
        Hi <strong style="color:#111827;">${safeCustomerName}</strong>, ${statusInfo.message}
    </p>
</td>
</tr>

<!-- ORDER TRACKER CARD -->
<tr>
<td style="padding:0 30px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px;">
        <tr>
            <td style="padding:16px 20px;">
                <div style="font-size:10px; color:#6b7280; font-weight:700; text-transform:uppercase; letter-spacing:0.8px;">Order Reference</div>
                <div style="margin-top:2px; font-size:16px; font-weight:800; color:#111827;">#${orderNumber}</div>
            </td>
            <td align="right" style="padding:16px 20px;">
                <span style="display:inline-block; padding:6px 12px; border-radius:20px; background:${statusInfo.color}; color:#ffffff; font-size:11px; font-weight:700;">
                    ${escapeHTML(status || "Pending")}
                </span>
            </td>
        </tr>
    </table>
</td>
</tr>

<!-- ORDER ITEMS SECTION -->
<tr>
<td style="padding:10px 30px;">
    <h3 style="margin:0 0 12px; font-size:15px; font-weight:700; color:#111827;">Order Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemsHTML}
    </table>
</td>
</tr>

<!-- BILLING CALCULATION -->
<tr>
<td style="padding:16px 30px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Subtotal</td>
            <td align="right" style="padding:4px 0; font-size:13px; color:#374151;">₹${money(subtotal)}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Delivery Partner Fee</td>
            <td align="right" style="padding:4px 0; font-size:13px; color:#374151;">₹${money(deliveryFee)}</td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Taxes & GST</td>
            <td align="right" style="padding:4px 0; font-size:13px; color:#374151;">₹${money(gst)}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
            <td style="padding:4px 0; font-size:13px; color:#16a34a;">Discount Applied</td>
            <td align="right" style="padding:4px 0; font-size:13px; color:#16a34a; font-weight:600;">- ₹${money(discount)}</td>
        </tr>` : ""}
        <tr>
            <td colspan="2" style="padding-top:10px; border-top:1px solid #e5e7eb;"></td>
        </tr>
        <tr>
            <td style="padding:4px 0; font-size:15px; font-weight:800; color:#111827;">Total Amount</td>
            <td align="right" style="padding:4px 0; font-size:18px; font-weight:900; color:#ff4f18;">₹${money(totalAmount)}</td>
        </tr>
    </table>
</td>
</tr>

<!-- DELIVERY & PAYMENT INFO -->
<tr>
<td style="padding:24px 30px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; padding:16px;">
        <tr>
            <td style="font-size:13px; color:#4b5563; line-height:1.5;">
                <strong style="color:#111827; display:block; margin-bottom:4px;">📍 Delivery Address</strong>
                ${addressLine || "Address details hidden"}
                ${safePhone ? `<br><span style="color:#6b7280; font-size:12px;">Phone: ${safePhone}</span>` : ""}
            </td>
        </tr>
        <tr>
            <td style="padding-top:12px; font-size:13px; color:#4b5563; border-top:1px solid #e5e7eb; margin-top:12px;">
                <strong style="color:#111827;">💳 Payment:</strong> ${safePayment}
            </td>
        </tr>
    </table>
</td>
</tr>

<!-- CALL TO ACTION -->
<tr>
<td align="center" style="padding:28px 30px;">
    <a href="http://localhost:5000/orders" style="display:inline-block; background:#ff4f18; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:700; box-shadow:0 4px 10px rgba(255, 79, 24, 0.3);">
        Track Live Order Status
    </a>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="padding:20px 30px; background:#f9fafb; border-top:1px solid #e5e7eb;">
    <div style="font-size:14px; font-weight:800; color:#111827;">Jigato</div>
    <p style="margin:4px 0 0; font-size:11px; color:#9ca3af; line-height:1.5;">
        You received this email because you placed an order on Jigato.<br>© 2026 Jigato Inc. All rights reserved.
    </p>
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
Jigato - ${statusInfo.label}
Hi ${customerName || "Customer"}, ${statusInfo.message}

Order Number: #${orderNumber}

ITEMS:
${Array.isArray(order.items) ? order.items.map(i => `- ${i.name} (${i.quantity}x) : ₹${money(i.total || i.price * i.quantity)}`).join("\n") : "Items unavailable"}

Subtotal: ₹${money(subtotal)}
Delivery: ₹${money(deliveryFee)}
GST: ₹${money(gst)}
${discount > 0 ? `Discount: -₹${money(discount)}\n` : ""}Total: ₹${money(totalAmount)}

Payment: ${safePayment}
Address: ${addressLine}

Track your order: http://localhost:5000/orders
`;

    await transporter.sendMail({
        from: `"Jigato Food Delivery" <${process.env.EMAIL_USER}>`,
        to,
        replyTo: process.env.EMAIL_USER,
        subject: statusInfo.subject,
        text,
        html
    });
};

module.exports = {
    sendOrderEmail
};