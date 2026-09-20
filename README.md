<div align="center">

# 🍔 JIGATO — Online Food Ordering System

<img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">
<img src="https://img.shields.io/badge/Node.js-Express.js-green?style=for-the-badge&logo=nodedotjs" alt="Node.js">
<img src="https://img.shields.io/badge/MySQL-MariaDB-blue?style=for-the-badge&logo=mysql" alt="MySQL">
<img src="https://img.shields.io/badge/HTML5-CSS3-orange?style=for-the-badge&logo=html5" alt="HTML5">

*A complete, full-stack online food ordering ecosystem built with an MVC architecture for seamless customer experience and robust administrative control.*

</div>

<br>

---

## 📖 About Jigato

**Jigato** is a feature-rich, full-stack online food ordering application. It bridges the gap between customers looking to order food online and administrators managing operations, menus, orders, customer profiles, and dynamic platform settings.

---

## ✨ Core Features

<details>
<summary><b>🔐 1. Authentication & Security</b></summary>
<br>

- **Customer & Admin Accounts:** Registration, secure login, logout, and session tracking.
- **Password Recovery:** Forgot password flow with secure token links and automated email sending via Nodemailer (`authEmailService.js`, `orderEmailService.js`).
- **Security Protocols:** Secure password hashing, session-based role checking via `adminMiddleware.js`.
</details>

<details>
<summary><b>🍽️ 2. Menu, Cart & Checkout</b></summary>
<br>

- **Menu Browsing:** Publicly viewable food items categorized cleanly.
- **Cart & Addresses:** User-specific cart handling and multiple saved delivery addresses.
- **Offers & Coupons:** Seamless coupon application and dynamic discount verification.
</details>

<details>
<summary><b>🧑‍💼 3. Complete Admin Dashboard</b></summary>
<br>

- **Management Modules:** Dedicated control panels for Dashboard, Users, Foods, Orders, Offers, Reports, Settings, and Profile.
- **Shared Layouts:** Reusable modular components like admin sidebars (`public/admin/sidebar/`).
</details>

---

## 🏗️ Exact Project Structure

Based on your directory layout, the project follows this exact tree hierarchy[cite: 1]:

```text
Food Order System/
│
├── controllers/
│   ├── admin/
│   │   ├── dashboardController.js
│   │   ├── foodsController.js
│   │   ├── offersController.js
│   │   ├── ordersController.js
│   │   ├── profileController.js
│   │   ├── reportsController.js
│   │   ├── settingsController.js
│   │   └── usersController.js
│   ├── addressController.js
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── checkoutController.js
│   ├── foodController.js
│   ├── homeController.js
│   ├── offerController.js
│   ├── orderController.js
│   ├── passwordResetController.js
│   └── profileController.js
│
├── Middleware/
│   └── adminMiddleware.js
│
├── models/
│   ├── admin/
│   │   ├── dashboardModel.js
│   │   ├── foodsModel.js
│   │   ├── offersModel.js
│   │   ├── ordersModel.js
│   │   ├── profileModel.js
│   │   ├── reportsModel.js
│   │   ├── settingsModel.js
│   │   └── usersModel.js
│   ├── addressModel.js
│   ├── adminModel.js
│   ├── cartModel.js
│   ├── checkoutModel.js
│   ├── foodModel.js
│   ├── homeModel.js
│   ├── offerModel.js
│   ├── orderModel.js
│   ├── profileModel.js
│   └── userModel.js
│
├── public/
│   ├── admin/
│   │   └── sidebar/
│   │       ├── sidebar.css
│   │       ├── sidebar.html
│   │       └── sidebar.js
│   ├── css/
│   │   ├── admin/ (dashboard.css, foods.css, offers.css, orders.css, profile.css, reports.css, settings.css, users.css)
│   │   ├── cart.css, checkout.css, forgot-password.css, login.css, menu.css, my-orders.css, offers.css, orders.css, profile.css, register.css, reset-password.css, style.css
│   ├── footer/
│   │   ├── footer.css
│   │   └── footer.html
│   ├── header/
│   │   ├── navbar.css
│   │   └── navbar.html
│   ├── images/
│   │   ├── foods/
│   │   └── hero-food.png
│   └── js/
│       ├── admin/ (dashboard.js, foods.js, offers.js, profile.js, reports.js, settings.js, users.js)
│       ├── cart.js, checkout.js, forgot-password.js, index.js, login.js, menu.js, my-orders.js, offers.js, orders.js, profile.js, register.js, reset-password.js
│
├── routes/
│   ├── admin/
│   │   ├── dashboardRoutes.js
│   │   ├── foodsRoutes.js
│   │   ├── offersRoutes.js
│   │   ├── ordersRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── reportsRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── usersRoutes.js
│   ├── addressRoutes.js
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── checkoutRoutes.js
│   ├── foodRoutes.js
│   ├── homeRoutes.js
│   ├── offerRoutes.js
│   ├── orderRoutes.js
│   ├── passwordResetRoutes.js
│   ├── profileRoutes.js
│   └── settingsRoutes.js
│
├── services/
│   ├── authEmailService.js
│   └── orderEmailService.js
│
├── views/
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── foods.html
│   │   ├── offers.html
│   │   ├── orders.html
│   │   ├── profile.html
│   │   ├── reports.html
│   │   ├── settings.html
│   │   └── users.html
│   ├── cart.html
│   ├── checkout.html
│   .   ├── forgot-password.html
│   ├── index.html
│   ├── login.html
│   ├── menu.html
│   ├── my-orders.html
│   ├── offers.html
│   ├── profile.html
│   ├── register.html
│   └── reset-password.html
│
├── .env
├── .gitignore
├── food_order_system (6).sql
├── db.js
├── package-lock.json
├── package.json
└── server.js