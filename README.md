<div align="center">

# 🍔 JIGATO — Online Food Ordering System

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">
<img src="https://img.shields.io/badge/Node.js-Express.js-green?style=for-the-badge&logo=nodedotjs" alt="Node.js">
<img src="https://img.shields.io/badge/MySQL-MariaDB-blue?style=for-the-badge&logo=mysql" alt="MySQL">
<img src="https://img.shields.io/badge/HTML5-CSS3-orange?style=for-the-badge&logo=html5" alt="HTML5">

*A complete, full-stack online food ordering ecosystem built for seamless customer experience and robust administrative control.*

</div>

<br>

---

## 📖 About Jigato

**Jigato** is a feature-rich, full-stack online food ordering application designed from scratch. It bridges the gap between hungry customers looking for delicious food and restaurant administrators managing operations, menus, orders, and dynamic platform rules. 

Built using **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MySQL/MariaDB**, Jigato implements industry-standard security practices, session management, dynamic pricing/taxes, email workflows via Nodemailer, and a fully modular admin dashboard.

---

## ✨ Core Features

<details>
<summary><b>🔐 1. Authentication & Security</b></summary>
<br>

- **Customer Accounts:** Registration, secure login, logout, and active session management.
- **Password Recovery:** Comprehensive **Forgot Password** flow with secure temporary token generation and email delivery via **Nodemailer** (Gmail SMTP/App Password).
- **Password Reset:** Token-validated interface for creating new encrypted passwords.
- **Security Protocols:** Industry-grade `bcrypt` password hashing, parameterized MySQL queries, session-based role protection, and no-cache security headers.
</details>

<details>
<summary><b>🍽️ 2. Dynamic Menu & Browsing</b></summary>
<br>

- **Public Accessibility:** Browse food items, categories, and descriptions without requiring an immediate login.
- **Filter & Search:** Real-time food search, category filtering (*Pizza, Burger, Snacks, Drinks, Gujarati, South Indian, Fast Food, Juices, Non-Veg*), and sorting.
- **Admin Management:** Dedicated admin controls to add, edit, toggle availability, and update prices or images of menu items.
</details>

<details>
<summary><b>🛒 3. Cart & Checkout System</b></summary>
<br>

- **User-Specific Cart:** Add items, scale quantities up/down, remove entries, and track unique item counts and subtotals dynamically.
- **Delivery Addresses:** Add, edit, delete, and select multiple saved delivery addresses labeled as *Home, Work, or Other*.
- **Smart Checkout Engine:** Real-time calculation encompassing Subtotal, Delivery Fee, GST tax rates, and active Coupon/Offer discounts based on live admin settings.
</details>

<details>
<summary><b>🎟️ Offers, Coupons & Dynamic Settings</b></summary>
<br>

- **Promotions:** Support for general, welcome, and free-delivery coupons with percentage or flat-rate discounts, minimum order requirements, maximum caps, and usage tracking.
- **Dynamic Admin Configuration:** Control platform behavior on the fly (Delivery Fees, Free Delivery thresholds, GST rates, Minimum Order limits, and Payment Gateways like COD, UPI, CARD) without touching code.
</details>

<details>
<summary><b>📦 Order Management & Email Notifications</b></summary>
<br>

- **Customer Tracking:** Place orders, view complete order history, and inspect historical bills and itemized details.
- **Order Lifecycles:** Track progression through $\rightarrow$ `Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Preparing` $\rightarrow$ `Out For Delivery` $\rightarrow$ `Delivered` (or `Cancelled`).
- **Automated Email Triggers:** Real-time email updates sent to customers at every major order status stage.
</details>

---

## 🧑‍💼 Admin Dashboard Module

The admin panel is equipped with a unified, shared-sidebar layout across all control sections:

*   📊 **Dashboard:** Real-time overview of total customers, foods, orders, revenue, and active offer metrics.
*   👥 **Users:** View, search, update details, or block/activate/delete customer accounts.
*   🍔 **Foods/Menu:** Manage inventory, categories, pricing, and upload food images (`public/images/foods/`).
*   📦 **Orders:** Monitor incoming orders and update delivery/preparation states.
*   🏷️ **Offers:** Create, modify, and expire promotional coupon codes.
*   📈 **Reports:** Generate sales and activity analytics across custom date ranges, weeks, or months.
*   ⚙️ **Settings:** Fine-tune system rules, taxes, delivery charges, and toggle payment options.

---

## 🏗️ Project Architecture & Structure

```text
JIGATO/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── orderController.js
│   ├── offerController.js
│   └── admin/
│       └── settingsController.js
│
├── middleware/
│   └── adminMiddleware.js
│
├── models/
│   ├── orderModel.js
│   ├── offerModel.js
│   └── admin/
│       └── settingsModel.js
│
├── routes/
│   ├── authRoutes.js, homeRoutes.js, foodRoutes.js, cartRoutes.js,
│   ├── checkoutRoutes.js, orderRoutes.js, profileRoutes.js,
│   ├── addressRoutes.js, offerRoutes.js, settingsRoutes.js, adminRoutes.js
│   └── admin/
│       └── settingsRoutes.js
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/foods/
│   └── admin/sidebar/
│
├── views/
│   ├── index.html, register.html, login.html, forgot-password.html,
│   ├── reset-password.html, menu.html, cart.html, checkout.html,
│   ├── offers.html, profile.html, my-orders.html
│   └── admin/ (dashboard.html, users.html, foods.html, orders.html, etc.)
│
├── .env
├── server.js
├── package.json
└── README.md