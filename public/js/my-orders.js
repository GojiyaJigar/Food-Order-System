/* =====================================================
   JIGATO - MY ORDERS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const ordersList = document.getElementById("ordersList");
    const emptyOrders = document.getElementById("emptyOrders");

    const orderModal = document.getElementById("orderModal");
    const closeOrderModal = document.getElementById("closeOrderModal");
    const modalTitle = document.getElementById("modalOrderTitle");
    const modalContent = document.getElementById("orderModalContent");

    const filterButtons = document.querySelectorAll(".filter-btn");

    const totalCount = document.getElementById("totalOrdersCount");
    const activeCount = document.getElementById("activeOrdersCount");
    const deliveredCount = document.getElementById("deliveredOrdersCount");

    let orders = [];
    let filter = "all";
    let reordering = false;


    /* =====================================================
       LOAD
    ===================================================== */

    loadOrders();


    async function loadOrders() {

        showLoading();

        try {

            const res = await fetch("/api/orders/my", {
                credentials: "include",
                cache: "no-store",
                headers: {
                    Accept: "application/json"
                }
            });

            if (res.status === 401) {
                location.href = "/login";
                return;
            }

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load orders."
                );
            }

            orders = Array.isArray(data.orders)
                ? data.orders
                : [];

            updateStats();
            render();

        } catch (err) {

            console.error("MY ORDERS ERROR:", err);

            showError(
                err.message || "Unable to load your orders."
            );

        }

    }


    /* =====================================================
       STATS
    ===================================================== */

    function updateStats() {

        const active = orders.filter(order =>
            [
                "pending",
                "confirmed",
                "preparing",
                "out for delivery"
            ].includes(normalize(order.order_status))
        ).length;

        const delivered = orders.filter(order =>
            normalize(order.order_status) === "delivered"
        ).length;

        if (totalCount) totalCount.textContent = orders.length;
        if (activeCount) activeCount.textContent = active;
        if (deliveredCount) deliveredCount.textContent = delivered;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        let list = orders;

        if (filter !== "all") {
            list = orders.filter(order =>
                normalize(order.order_status) === normalize(filter)
            );
        }

        if (!list.length) {

            ordersList.innerHTML = "";
            ordersList.style.display = "none";

            if (emptyOrders) {
                emptyOrders.style.display = "block";
            }

            return;

        }

        if (emptyOrders) {
            emptyOrders.style.display = "none";
        }

        ordersList.style.display = "flex";

        ordersList.innerHTML =
            list.map(orderCard).join("");

        bindButtons();

    }


    /* =====================================================
       ORDER CARD
    ===================================================== */

    function orderCard(order) {

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const shown = items.slice(0, 3);
        const extra = Math.max(items.length - 3, 0);

        const address = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ].filter(Boolean).join(", ");

        const discount = Number(order.discount || 0);

        return `

            <article class="order-card">

                <div class="order-card-top">

                    <div class="order-number-box">

                        <div class="order-icon">
                            <i class="fa-solid fa-bag-shopping"></i>
                        </div>

                        <div class="order-number">

                            <h3>
                                Order #${order.id}
                            </h3>

                            <p>
                                ${formatDate(order.created_at)}
                            </p>

                        </div>

                    </div>

                    <span class="order-status ${statusClass(order.order_status)}">
                        ${escape(order.order_status || "Pending")}
                    </span>

                </div>


                <div class="order-card-body">

                    <div class="order-body-grid">

                        <div>

                            <div class="order-items">

                                ${shown.map(itemHTML).join("")}

                            </div>

                            ${
                                extra
                                ? `<div class="more-items">
                                    + ${extra} more item${extra > 1 ? "s" : ""}
                                </div>`
                                : ""
                            }


                            <div class="order-info">

                                <div class="order-info-box">

                                    <div class="order-info-icon">
                                        <i class="fa-solid fa-location-dot"></i>
                                    </div>

                                    <div class="order-info-text">

                                        <small>
                                            Delivered To
                                        </small>

                                        <strong>
                                            ${escape(
                                                address ||
                                                "Address unavailable"
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                <div class="order-info-box">

                                    <div class="order-info-icon">
                                        <i class="fa-solid fa-credit-card"></i>
                                    </div>

                                    <div class="order-info-text">

                                        <small>
                                            Payment
                                        </small>

                                        <strong>
                                            ${escape(
                                                order.payment_method ||
                                                "COD"
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        <div class="order-summary">

                            <h4>
                                Order Summary
                            </h4>

                            <div class="order-summary-row">
                                <span>Subtotal</span>
                                <strong>₹${money(order.subtotal)}</strong>
                            </div>

                            <div class="order-summary-row">
                                <span>Delivery</span>
                                <strong>₹${money(order.delivery_fee)}</strong>
                            </div>

                            <div class="order-summary-row">
                                <span>GST</span>
                                <strong>₹${money(order.gst)}</strong>
                            </div>

                            ${
                                discount > 0
                                ? `
                                    <div class="order-summary-row discount">
                                        <span>Discount</span>
                                        <strong>- ₹${money(discount)}</strong>
                                    </div>
                                `
                                : ""
                            }

                            <hr>

                            <div class="order-summary-row total">
                                <span>Total</span>
                                <strong>₹${money(order.total_amount)}</strong>
                            </div>

                            ${
                                discount > 0
                                ? `
                                    <div class="order-coupon">
                                        <i class="fa-solid fa-ticket"></i>
                                        <span>
                                            ${escape(
                                                order.coupon_code ||
                                                "Coupon Applied"
                                            )}
                                            · Saved ₹${money(discount)}
                                        </span>
                                    </div>
                                `
                                : ""
                            }

                        </div>

                    </div>

                </div>


                <div class="order-card-footer">

                    <div class="order-footer-left">
                        <i class="fa-regular fa-clock"></i>
                        <span>
                            ${statusMessage(order.order_status)}
                        </span>
                    </div>

                    <div class="order-actions">

                        <button
                            type="button"
                            class="order-action-btn"
                            data-action="view"
                            data-id="${order.id}"
                        >
                            <i class="fa-regular fa-eye"></i>
                            View Details
                        </button>

                        <button
                            type="button"
                            class="order-action-btn primary"
                            data-action="reorder"
                            data-id="${order.id}"
                        >
                            <i class="fa-solid fa-rotate-right"></i>
                            Reorder
                        </button>

                    </div>

                </div>

            </article>
        `;

    }


    function itemHTML(item) {

        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const total = Number(item.item_total || qty * price);

        return `

            <div class="order-item">

                <img
                    class="order-item-image"
                    src="${attr(foodImage(item.image))}"
                    alt="${attr(item.name || "Food")}"
                    onerror="this.onerror=null;this.src='/images/food-placeholder.jpg';"
                >

                <div class="order-item-info">

                    <h4>
                        ${escape(item.name || "Food Item")}
                    </h4>

                    <p>
                        ${qty} × ₹${money(price)}
                    </p>

                </div>

                <div class="order-item-price">
                    ₹${money(total)}
                </div>

            </div>

        `;

    }


    /* =====================================================
       BUTTONS
    ===================================================== */

    function bindButtons() {

        document.querySelectorAll("[data-action]").forEach(btn => {

            btn.onclick = () => {

                const id = Number(btn.dataset.id);
                const action = btn.dataset.action;

                if (action === "view") {
                    openDetails(id);
                }

                if (action === "reorder") {
                    reorder(id);
                }

            };

        });

    }


    /* =====================================================
   REORDER
===================================================== */

async function reorder(id) {

    if (reordering) return;

    const order = orders.find(
        item => Number(item.id) === Number(id)
    );

    if (!order || !order.items?.length) {

        return alertBox(
            "No items found in this order.",
            "error"
        );

    }


    if (typeof Swal !== "undefined") {

        const result = await Swal.fire({

            title: "Reorder this order?",

            text: "All items will be added to your cart.",

            icon: "question",

            showCancelButton: true,

            confirmButtonText: "Yes, Reorder",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#ff5a1f"

        });


        if (!result.isConfirmed) return;

    }


    reordering = true;

    setButtons(id, true);


    try {

        const validItems =
            order.items.filter(
                item =>
                    Number(item.food_id) > 0 &&
                    Number(item.quantity) > 0
            );


        /*
         * Quantity ko ek hi request me bhej rahe hain.
         * Existing endpoint = /cart/add
         */

        const results =
            await Promise.allSettled(
                validItems.map(item =>
                    addToCart(
                        Number(item.food_id),
                        Number(item.quantity)
                    )
                )
            );


        const added =
            results.filter(
                r => r.status === "fulfilled"
            ).length;


        const failed =
            results.length - added;


        if (!added) {

            throw new Error(
                "Unable to add items to cart."
            );

        }


        await updateCartCount();


        window.dispatchEvent(
            new Event("cartUpdated")
        );


        if (typeof Swal !== "undefined") {

            const result = await Swal.fire({

                icon:
                    failed
                        ? "warning"
                        : "success",

                title:
                    failed
                        ? "Partially Added"
                        : "Added to Cart! 🛒",

                text:
                    failed
                        ? `${added} item${added > 1 ? "s" : ""} added. ${failed} failed.`
                        : `${added} item${added > 1 ? "s" : ""} added to your cart.`,

                showCancelButton: true,

                confirmButtonText: "View Cart",

                cancelButtonText: "Continue",

                confirmButtonColor: "#ff5a1f"

            });


            if (result.isConfirmed) {

                location.href =
                    "/cart-page";

            }

        } else {

            location.href =
                "/cart-page";

        }

    }
    catch (error) {

        console.error(
            "REORDER ERROR:",
            error
        );


        alertBox(
            error.message ||
            "Unable to reorder.",
            "error"
        );

    }
    finally {

        reordering = false;

        setButtons(id, false);

    }

}


/* =====================================================
   ADD TO CART
===================================================== */

async function addToCart(
    foodId,
    quantity
) {

    const response =
        await fetch(
            "/cart/add",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body: JSON.stringify({

                    foodId:
                        foodId,

                    quantity:
                        quantity

                })
            }
        );


    if (response.status === 401) {

        location.href = "/login";

        throw new Error(
            "Please login first."
        );

    }


    const data =
        await response.json();


    console.log(
        "REORDER ADD CART:",
        foodId,
        quantity,
        data
    );


    if (
        !response.ok ||
        data.success !== true
    ) {

        throw new Error(
            data.message ||
            "Unable to add item to cart."
        );

    }


    return data;

}


    function setButtons(id, loading) {

        const btn = document.querySelector(
            `[data-action="reorder"][data-id="${id}"]`
        );

        if (!btn) return;

        if (loading) {

            btn.disabled = true;

            btn.dataset.oldHTML =
                btn.innerHTML;

            btn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Adding...
            `;

        } else {

            btn.disabled = false;

            btn.innerHTML =
                btn.dataset.oldHTML ||
                `
                    <i class="fa-solid fa-rotate-right"></i>
                    Reorder
                `;

        }

    }


    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    async function openDetails(id) {

        if (!orderModal) return;

        orderModal.classList.add("show");

        if (modalTitle) {
            modalTitle.textContent =
                `Order #${id}`;
        }

        modalContent.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
                <p>Loading order...</p>
            </div>
        `;

        try {

            const res = await fetch(
                `/api/orders/my/${id}`,
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load order."
                );
            }

            renderModal(data.order);

        } catch (error) {

            modalContent.innerHTML = `
                <div class="orders-loading">
                    <p>${escape(error.message)}</p>
                </div>
            `;

        }

    }


    function renderModal(order) {

        const address = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ].filter(Boolean).join(", ");

        const discount =
            Number(order.discount || 0);


        modalContent.innerHTML = `

            <div class="modal-status-box">

                <div class="modal-status-text">
                    <small>ORDER STATUS</small>
                    <strong>
                        ${escape(order.order_status || "Pending")}
                    </strong>
                </div>

                <span class="order-status ${statusClass(order.order_status)}">
                    ${escape(order.order_status || "Pending")}
                </span>

            </div>


            <div class="modal-items">

                ${
                    (order.items || [])
                        .map(modalItem)
                        .join("")
                }

            </div>


            <div class="modal-address">

                <div class="modal-address-title">
                    <i class="fa-solid fa-location-dot"></i>
                    Delivery Address
                </div>

                <p>
                    ${escape(
                        address ||
                        "Address unavailable"
                    )}
                </p>

            </div>


            <div class="modal-bill">

                <div class="modal-bill-row">
                    <span>Subtotal</span>
                    <strong>
                        ₹${money(order.subtotal)}
                    </strong>
                </div>

                <div class="modal-bill-row">
                    <span>Delivery Fee</span>
                    <strong>
                        ₹${money(order.delivery_fee)}
                    </strong>
                </div>

                <div class="modal-bill-row">
                    <span>GST</span>
                    <strong>
                        ₹${money(order.gst)}
                    </strong>
                </div>

                ${
                    discount > 0
                    ? `
                        <div class="modal-bill-row discount">

                            <span>
                                ${
                                    order.coupon_code
                                    ? `Coupon (${escape(
                                        order.coupon_code
                                      )})`
                                    : "Discount"
                                }
                            </span>

                            <strong>
                                - ₹${money(discount)}
                            </strong>

                        </div>
                    `
                    : ""
                }

                <hr>

                <div class="modal-bill-row total">
                    <span>Total</span>
                    <strong>
                        ₹${money(order.total_amount)}
                    </strong>
                </div>

            </div>
        `;

    }


    function modalItem(item) {

        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const total = Number(
            item.item_total ||
            qty * price
        );

        return `

            <div class="modal-item">

                <img
                    src="${attr(foodImage(item.image))}"
                    alt="${attr(item.name || "Food")}"
                    onerror="this.onerror=null;this.src='/images/food-placeholder.jpg';"
                >

                <div class="modal-item-info">

                    <h4>
                        ${escape(item.name || "Food Item")}
                    </h4>

                    <p>
                        ${qty} × ₹${money(price)}
                    </p>

                </div>

                <div class="modal-item-total">
                    ₹${money(total)}
                </div>

            </div>

        `;

    }


    /* =====================================================
       FILTERS
    ===================================================== */

    filterButtons.forEach(button => {

        button.onclick = () => {

            filterButtons.forEach(
                btn => btn.classList.remove("active")
            );

            button.classList.add("active");

            filter =
                button.dataset.status ||
                "all";

            render();

        };

    });


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        if (orderModal) {
            orderModal.classList.remove("show");
        }

    }


    if (closeOrderModal) {
        closeOrderModal.onclick = closeModal;
    }


    if (orderModal) {

        orderModal.onclick = event => {

            if (event.target === orderModal) {
                closeModal();
            }

        };

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                orderModal &&
                orderModal.classList.contains("show")
            ) {
                closeModal();
            }

        }
    );


    /* =====================================================
       CART COUNT
    ===================================================== */

    async function updateCartCount() {

        try {

            const res = await fetch(
                "/cart",
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );

            const data = await res.json();

            const count =
                Array.isArray(data.cart)
                    ? data.cart.length
                    : 0;

            const desktop =
                document.getElementById(
                    "headerCartCount"
                );

            const mobile =
                document.getElementById(
                    "mobileCartCount"
                );

            const floating =
                document.getElementById(
                    "cartCount"
                );

            if (desktop) {
                desktop.textContent = count;
            }

            if (mobile) {
                mobile.textContent = count;
            }

            if (floating) {
                floating.textContent =
                    `${count} item${count === 1 ? "" : "s"}`;
            }

        } catch (error) {

            console.error(
                "CART COUNT ERROR:",
                error
            );

        }

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function foodImage(image) {

        if (!image) {
            return "/images/food-placeholder.jpg";
        }

        const value = String(image).trim();

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("/")
        ) {
            return value;
        }

        return "/images/foods/" + value;

    }


    function statusClass(status) {

        return {
            pending: "status-pending",
            confirmed: "status-confirmed",
            preparing: "status-preparing",
            "out for delivery":
                "status-out-for-delivery",
            delivered: "status-delivered",
            cancelled: "status-cancelled"
        }[
            normalize(status)
        ] || "status-pending";

    }


    function statusMessage(status) {

        return {
            pending: "Order received",
            confirmed: "Restaurant confirmed your order",
            preparing: "Your food is being prepared",
            "out for delivery": "Your order is on the way",
            delivered: "Order delivered successfully",
            cancelled: "This order was cancelled"
        }[
            normalize(status)
        ] || "Order placed";

    }


    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }


    function formatDate(value) {

        if (!value) return "Date unavailable";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function money(value) {

        return (
            Number(value || 0)
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function escape(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function attr(value) {

        return escape(value);

    }


    function showLoading() {

        if (!ordersList) return;

        if (emptyOrders) {
            emptyOrders.style.display = "none";
        }

        ordersList.style.display = "flex";

        ordersList.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        `;

    }


    function showError(message) {

        if (!ordersList) return;

        ordersList.innerHTML = `
            <div class="orders-loading">

                <i
                    class="fa-solid fa-circle-exclamation"
                    style="
                        color:#ef4444;
                        font-size:25px;
                        margin-bottom:10px;
                    "
                ></i>

                <p>
                    ${escape(message)}
                </p>

                <button
                    id="retryOrders"
                    type="button"
                    style="
                        margin-top:12px;
                        border:0;
                        padding:8px 14px;
                        border-radius:7px;
                        background:#ff5a1f;
                        color:#fff;
                        font-size:9px;
                        font-weight:800;
                    "
                >
                    Try Again
                </button>

            </div>
        `;

        const retry =
            document.getElementById(
                "retryOrders"
            );

        if (retry) {
            retry.onclick = loadOrders;
        }

    }


    function alertBox(message, type) {

        if (typeof Swal !== "undefined") {

            Swal.fire({
                icon: type || "info",
                text: message,
                confirmButtonColor: "#ff5a1f"
            });

        } else {

            alert(message);

        }

    }

});