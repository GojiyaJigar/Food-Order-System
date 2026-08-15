// ==============================
// DOM Elements
// ==============================

const ordersList = document.getElementById("ordersList");
const emptyOrders = document.getElementById("emptyOrders");


// ==============================
// Format Date & Time
// ==============================

function formatDate(dateString) {

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    return new Date(dateString).toLocaleString("en-IN", options);

}


// ==============================
// Status Badge Class
// ==============================

function getStatusClass(status) {

    switch (status) {

        case "Pending":
            return "pending";

        case "Confirmed":
            return "confirmed";

        case "Preparing":
            return "preparing";

        case "Out For Delivery":
            return "delivery";

        case "Delivered":
            return "delivered";

        default:
            return "pending";

    }

}


// ==============================
// Progress Width
// ==============================

function getProgressWidth(status) {

    switch (status) {

        case "Pending":
            return "0%";

        case "Confirmed":
            return "25%";

        case "Preparing":
            return "50%";

        case "Out For Delivery":
            return "75%";

        case "Delivered":
            return "100%";

        default:
            return "0%";

    }

}


// ==============================
// Render Orders
// ==============================

function renderOrders(orders) {

    ordersList.innerHTML = "";

    if (orders.length === 0) {

        emptyOrders.style.display = "block";
        return;

    }

    emptyOrders.style.display = "none";

    orders.forEach(order => {

        const card = document.createElement("div");
        card.className = "order-card";

        const itemsHtml = order.items.map(item => `

            <div class="order-item">

                <img
                    src="/images/foods/${item.image}"
                    class="food-image"
                    alt="${item.food_name}">

                <div class="item-details">

                    <h3>${item.food_name}</h3>

                    <p>
                        ₹${item.price} × ${item.quantity}
                    </p>

                </div>

            </div>

        `).join("");

        card.innerHTML = `

            <div class="order-top">

                <div class="order-details">

                    <h2>
                        📦 Order #${order.order_id}
                    </h2>

                    <div class="order-info">

                        <span>
                            📅 ${formatDate(order.created_at)}
                        </span>

                        <span>
                            💳 ${order.payment_method}
                        </span>

                        <span>
                            ₹${order.total_amount}
                        </span>

                    </div>

                    <div class="order-items">

                        ${itemsHtml}

                    </div>

                </div>

            </div>

            <div class="status-section">

                <h3>Order Status</h3>

                <div class="status-badge ${getStatusClass(order.order_status)}">

                    ${order.order_status}

                </div>

            </div>

            <div class="progress-container">

                <div class="progress-line">

                    <div class="progress-fill"
                        style="width:${getProgressWidth(order.order_status)};">
                    </div>

                </div>

                <div class="progress-steps">

                    <div class="step pending">
                        <div class="circle"></div>
                        <span>Pending</span>
                    </div>

                    <div class="step confirmed">
                        <div class="circle"></div>
                        <span>Confirmed</span>
                    </div>

                    <div class="step preparing">
                        <div class="circle"></div>
                        <span>Preparing</span>
                    </div>

                    <div class="step delivery">
                        <div class="circle"></div>
                        <span>Out For Delivery</span>
                    </div>

                    <div class="step delivered">
                        <div class="circle"></div>
                        <span>Delivered</span>
                    </div>

                </div>

            </div>

        `;

        ordersList.appendChild(card);

        updateProgress(card, order.order_status);

    });

}
// ==============================
// Update Progress Tracker
// ==============================

function updateProgress(card, status) {

    const steps = card.querySelectorAll(".step");

    const order = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out For Delivery",
        "Delivered"
    ];

    const currentIndex = order.indexOf(status);

    steps.forEach((step, index) => {

        step.classList.remove("active");
        step.classList.remove("completed");

        if (index < currentIndex) {

            step.classList.add("completed");

        } else if (index === currentIndex) {

            step.classList.add("active");

        }

    });

}



// ==============================
// Load Orders
// ==============================

async function loadOrders() {

    try {

        const res = await fetch("/api/orders");

        const data = await res.json();

        if (!data.success) {

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: data.message
            });

            return;

        }

        renderOrders(data.orders);

    } catch (err) {

        console.error(err);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to load your orders."
        });

    }

}



// ==============================
// Check Authentication
// ==============================

async function checkAuth() {

    try {

        const res = await fetch("/check-auth");

        const data = await res.json();

        if (data.loggedIn) {

            const profile = document.getElementById("profileName");

            profile.style.display = "inline-block";
            profile.innerHTML = `👤 ${data.name}`;

            document.getElementById("logoutBtn").style.display = "inline-block";
            document.getElementById("mobileLogoutBtn").style.display = "block";

        }

    } catch (err) {

        console.error(err);

    }

}



// ==============================
// Logout
// ==============================

async function logout() {

    const res = await fetch("/logout", {
        method: "POST"
    });

    const data = await res.json();

    if (data.success) {

        Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "See you again!",
            timer: 1500,
            showConfirmButton: false
        });

        setTimeout(() => {

            window.location.href = "/";

        }, 1500);

    }

}


document
    .getElementById("logoutBtn")
    ?.addEventListener("click", logout);

document
    .getElementById("mobileLogoutBtn")
    ?.addEventListener("click", logout);



// ==============================
// Mobile Menu
// ==============================

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle.addEventListener("click", () => {

    mobileMenu.classList.toggle("active");

});



// ==============================
// Initial Load
// ==============================

checkAuth();

loadOrders();