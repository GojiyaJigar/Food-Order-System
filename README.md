# 🍔 Jigato — Online Food Ordering System

<p align="center">
  <strong>Cravings Meet Happiness.</strong><br>
  A modern full-stack online food ordering platform built with Node.js, Express.js, MySQL, HTML, CSS and JavaScript.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

<p align="center">
  <em>Discover food. Build your cart. Place your order. Enjoy.</em>
</p>

---

## 📌 Overview

**Jigato** is a full-stack food ordering web application focused on providing a clean, modern and responsive ordering experience.

The application combines a browser-based frontend with an Express.js backend and MySQL database. It is structured using a lightweight MVC-style approach so authentication, profiles, addresses, restaurants, food items and orders can be maintained separately.

### What users can do

- 🔐 Register and log in
- 👤 Manage profile information
- 📍 Save and manage delivery addresses
- 🍽️ Discover restaurants and menus
- 🔎 Search food, restaurants and categories
- 🛒 Add items to cart and manage quantities
- 🎟️ Apply coupons and discounts
- 💳 Complete checkout
- 📦 Place and manage orders
- 📋 View previous orders
- 🔄 Reorder previous purchases
- 📱 Use the application across desktop, tablet and mobile layouts

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- Session-based authentication
- Logout
- Password hashing with `bcrypt`
- Dynamic authentication state in the navbar

### Navbar state

**Logged out**

```text
Login | Register
```

**Logged in**

```text
Profile | Logout
```

---

## 👤 User Profile

Users can manage account details such as:

- Full name
- Email
- Phone
- City
- Date of birth
- Gender
- Other profile information

Profile updates can also be reflected in the delivery city shown in the navbar.

---

## 📍 Address Management

Users can save and manage multiple delivery addresses.

Typical address information includes:

```text
Name
Phone
Address
City
State
Pincode
```

Saved addresses can be selected during checkout.

---

## 🍽️ Restaurant Discovery

Users can:

- Browse restaurants
- View restaurant information
- Open restaurant menus
- Browse available food items
- Discover recently added restaurants
- Explore popular restaurants

---

## 🍕 Food Discovery

Food items can contain:

```text
Name
Description
Price
Category
Image
Availability
Restaurant
```

Users can search by:

- Food name
- Restaurant name
- Category

---

## 🛒 Cart System

The cart supports:

- Add food items
- Increase/decrease quantity
- Remove items
- Display cart count
- Show cart summary
- Navigate to checkout
- Reorder previous items

The navbar can dynamically display the current cart count.

---

## 🎟️ Offers & Coupons

The checkout flow supports coupon-based discounts.

Coupons may support:

- Percentage discounts
- Fixed discounts
- Minimum order requirements
- Maximum discount limits
- Restaurant-specific offers
- General offers

Example calculation:

```text
Subtotal       ₹947.00
Delivery        ₹40.00
GST             ₹47.35
Discount       ₹189.40
-----------------------
Total           ₹844.95
```

> The exact discount and tax calculation depends on the implementation used by the project.

---

# 💳 Checkout

The checkout flow can include:

### 1. Delivery Address

Select a saved address or add a new delivery address.

### 2. Order Summary

```text
Subtotal
Delivery Fee
GST
Discount
Total
```

### 3. Payment Method

Supported payment methods may include:

```text
COD
UPI
CARD
```

> Payment availability depends on the current project implementation.

---

# 📦 Order Management

Orders can store customer, delivery, billing and status information.

### Order information

```text
Order ID
User ID
Customer Name
Phone
Address
City
State
Pincode
Subtotal
Delivery Fee
GST
Discount
Coupon Code
Total Amount
Payment Method
Order Status
Created At
Updated At
Cancelled At
```

### Order statuses

```text
Pending
Confirmed
Preparing
Out For Delivery
Delivered
Cancelled
```

---

# 📋 My Orders

The **My Orders** section provides an order history and order-management experience.

Possible features include:

- 📊 Total orders
- ⏳ Active orders
- ✅ Delivered orders
- 🔎 Status filtering
- 🍕 Food thumbnails
- 📍 Delivery address
- 💳 Payment method
- 💰 Order billing
- 🎟️ Coupon information
- 👀 Order details
- 🔄 Reorder

### Order filters

```text
All Orders
Pending
Confirmed
Preparing
Out For Delivery
Delivered
Cancelled
```

---

# 🔄 Reorder Flow

Users can reorder items from a previous order.

```text
My Orders
    ↓
Select Order
    ↓
Click Reorder
    ↓
Previous Food Items Added to Cart
    ↓
Cart Count Updated
    ↓
Continue Shopping / View Cart
```

---

# 🧩 Reusable UI Components

Jigato is designed around reusable navbar and footer components.

## Navbar

```text
public/
└── header/
    ├── navbar.html
    ├── navbar.css
    └── navbar.js
```

The navbar can handle:

- Logo
- Location
- Home
- Restaurants
- Offers
- Cart
- Login / Register
- Profile
- Logout
- Mobile menu
- Dynamic username
- Dynamic city
- Cart count

## Footer

```text
public/
└── footer/
    ├── footer.html
    ├── footer.css
    └── footer.js
```

The footer provides reusable navigation and branding across pages.

---

# 🏗️ Project Architecture

Jigato follows a lightweight **MVC-style architecture**.

```text
Jigato/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── addressController.js
│   ├── restaurantController.js
│   └── orderController.js
│
├── models/
│   ├── userModel.js
│   ├── profileModel.js
│   ├── addressModel.js
│   ├── restaurantModel.js
│   ├── foodModel.js
│   └── orderModel.js
│
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── addressRoutes.js
│   ├── restaurantRoutes.js
│   └── orderRoutes.js
│
├── views/
│   ├── header/
│   │   ├── navbar.html
│   │   ├── navbar.css
│   │   └── navbar.js
│   │
│   ├── footer/
│   │   ├── footer.html
│   │   ├── footer.css
│   │   └── footer.js
│   │
│   ├── index.html
│   ├── restaurant.html
│   ├── offers.html
│   ├── cart.html
│   ├── checkout.html
│   ├── my-orders.html
│   ├── profile.html
│   ├── login.html
│   └── register.html
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│       ├── foods/
│       └── restaurants/
│
├── .env
├── package.json
├── server.js
└── README.md
```

> Keep this tree synchronized with the actual repository structure if files or folders change.

---

# 🔄 Application Flow

```text
                    ┌───────────────┐
                    │   Register    │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │     Login     │
                    └───────┬───────┘
                            ↓
              ┌─────────────────────────┐
              │ Restaurants / Food      │
              └────────────┬────────────┘
                           ↓
                  ┌────────────────┐
                  │    Add Cart    │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │    Checkout    │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │ Select Address │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │ Apply Coupon   │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │  Place Order   │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │   MySQL Order  │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │   My Orders    │
                  └───────┬────────┘
                          ↓
                ┌─────────┴──────────┐
                ↓                    ↓
          View Details            Reorder
                                     ↓
                                   Cart
```

---

# 🗄️ Database

The project is designed around a MySQL database.

### Core tables

```text
users
profiles
addresses
user_addresses
restaurants
foods
cart
orders
order_items
```

### Main relationship

```text
users
  │
  └── orders
        │
        └── order_items
                │
                └── foods
```

---

## 🍕 Foods

Typical fields:

```text
id
restaurant_id
name
description
price
category
image
is_available
created_at
```

Example image filenames:

```text
margherita.jpg
farmhouse.jpg
sprite.jpg
burgerking.jpg
```

---

## 🧾 Order Items

Typical fields:

```text
id
order_id
food_id
quantity
price
```

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Client-side functionality |
| Font Awesome | Icons |
| SweetAlert2 | Alerts, confirmations and dialogs |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web server and API |
| Express Session | Session management |
| bcrypt | Password hashing |
| dotenv | Environment configuration |

## Database

| Technology | Purpose |
|---|---|
| MySQL | Application database |
| phpMyAdmin | Local database administration |

## Development

| Tool | Purpose |
|---|---|
| Nodemon | Automatic development server restart |
| XAMPP | Local MySQL environment |

---

# ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=food_order_system
DB_PORT=3306

SESSION_SECRET=your_secret_key
```

### ⚠️ Important

Never commit real credentials or secrets to GitHub.

Your `.gitignore` should include:

```gitignore
.env
.env.*
node_modules/
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/jigato.git
cd jigato
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure MySQL

Create the required database and tables using MySQL or phpMyAdmin.

Then update the `.env` file with your local database credentials.

## 4. Start the application

### Development

```bash
npm run dev
```

If the project does not have the `dev` script configured:

```bash
npx nodemon server.js
```

### Production / normal start

```bash
npm start
```

## 5. Open the application

```text
http://localhost:5000
```

---

# 📦 Recommended `package.json` Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

> Keep these scripts only if they match your actual `package.json`.

---

# 🔌 Main API Endpoints

## Authentication

```text
POST /register
POST /login
GET  /check-auth
POST /logout
```

## Profile

```text
GET  /api/profile
POST /api/profile
PUT  /api/profile
```

## Orders

```text
POST /api/orders
GET  /api/orders/my
GET  /api/orders/my/:id
```

## Cart

```text
GET  /cart
POST /cart/add
```

> Additional routes may exist depending on the final implementation. Always treat the actual route files as the source of truth.

---

# 🎨 UI & Brand

Jigato uses a modern food-delivery visual style.

### Design direction

- 🍊 Orange-first branding
- 🤍 Clean white layouts
- 🟠 Warm accent colors
- ⭕ Rounded cards and controls
- ✨ Soft shadows
- 📱 Responsive layouts
- 🍔 Food-focused imagery
- 🔔 Interactive notifications

### Primary brand color

```text
#ff5a1f
```

---

# 📱 Responsive Design

The interface is intended for:

```text
Desktop
Laptop
Tablet
Mobile
```

Responsive areas include:

- Navbar
- Mobile navigation
- Home page
- Restaurants
- Offers
- Cart
- Checkout
- My Orders
- Profile
- Footer

---

# 🔒 Security Checklist

Before production deployment:

- [ ] Keep `.env` private
- [ ] Use a strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Validate and sanitize user input
- [ ] Protect authenticated routes
- [ ] Verify authorization on every protected resource
- [ ] Enable secure cookies in production
- [ ] Use production-ready session storage
- [ ] Add rate limiting
- [ ] Use least-privilege database credentials
- [ ] Never expose secrets in frontend code

---

# 🧪 Development

Start the development server:

```bash
npx nodemon server.js
```

Typical output:

```text
🚀 Server Running on http://localhost:5000
✅ MySQL Connected
```

The exact console messages depend on the current `server.js` and database configuration.

---

# 🖼️ Screenshots

For a polished GitHub presentation, add a `screenshots/` directory:

```text
screenshots/
├── home.png
├── restaurants.png
├── offers.png
├── cart.png
├── checkout.png
├── my-orders.png
└── profile.png
```

Then add them to this README:

```md
## 🏠 Home

![Jigato Home](screenshots/home.png)

## 🍽️ Restaurants

![Restaurants](screenshots/restaurants.png)

## 💳 Checkout

![Checkout](screenshots/checkout.png)

## 📦 My Orders

![My Orders](screenshots/my-orders.png)

## 👤 Profile

![Profile](screenshots/profile.png)
```

---

# 🚧 Future Roadmap

Potential upgrades:

- [ ] 💳 Online payment gateway integration
- [ ] 🏪 Restaurant admin dashboard
- [ ] ⭐ Database-backed reviews and ratings
- [ ] 📍 Real-time delivery tracking
- [ ] ❤️ Wishlist / favourites
- [ ] 🔔 Notifications
- [ ] 🚴 Delivery partner dashboard
- [ ] 📊 Admin analytics
- [ ] 🔎 Advanced food and restaurant filters
- [ ] ☁️ Cloud deployment
- [ ] 📈 Performance optimization
- [ ] 🛡️ Production-grade security hardening

---

# 🎯 Project Goals

```text
Modern UI
    +
Simple Ordering
    +
Reliable Backend
    +
MySQL Database
    +
Responsive Experience
    =
A Better Food Ordering Experience
```

---

# ❤️ Built With

```text
HTML
CSS
JavaScript
Node.js
Express.js
MySQL
```

Built with ❤️ for food lovers.

---

# ⭐ Support

If you like the project, consider giving the repository a ⭐ on GitHub.

<p align="center">
  🍔 <strong>Jigato</strong><br>
  Food Delivery • Made Simple • Built With Love
</p>
