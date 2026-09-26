/* =========================================================
   JIGATO - MY ORDERS
   Database status is the single source of truth.
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);
    const ordersList = $("ordersList");
    const emptyOrders = $("emptyOrders");
    const orderModal = $("orderModal");
    const modalTitle = $("modalOrderTitle");
    const modalContent = $("orderModalContent");
    const filterButtons = document.querySelectorAll(".filter-btn");
    let orders = [];
    let filter = "all";
    let loading = false;
    let reordering = false;
    /* =====================================================
       LOAD ORDERS
    ===================================================== */
    loadOrders();
    // Refresh from database every 5 seconds.
    // IMPORTANT:
    // This only GETS data.
    // It never changes order status.
    setInterval(() => {
        loadOrders(true);
    }, 5000);
    async function loadOrders(silent = false) {
        if (loading) return;
        loading = true;
        if (!silent) {
            showLoading();
        }
        try {
            const res = await fetch("/api/orders/my", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: {
                    "Accept": "application/json",
                    "Cache-Control": "no-cache"
                }
            });
            if (res.status === 401) {
                window.location.href = "/login";
                return;
            }
            const data = await json(res);
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
        } catch (error) {
            if (!silent) {
                showError(
                    error.message ||
                    "Unable to load orders."
                );
            }
        } finally {
            loading = false;
        }
    }
    /* =====================================================
       UPDATE STATS
    ===================================================== */
    function updateStats() {
        const active = orders.filter(order => {
            const status = normalize(
                order.order_status
            );
            return [
                "pending",
                "confirmed",
                "preparing",
                "out for delivery"
            ].includes(status);
        }).length;
        const delivered = orders.filter(order =>
            normalize(order.order_status) === "delivered"
        ).length;
        if ($("totalOrdersCount")) {
            $("totalOrdersCount").textContent =
                orders.length;
        }
        if ($("activeOrdersCount")) {
            $("activeOrdersCount").textContent =
                active;
        }
        if ($("deliveredOrdersCount")) {
            $("deliveredOrdersCount").textContent =
                delivered;
        }
    }
    /* =====================================================
       RENDER ORDERS
    ===================================================== */
    function render() {
        const list = filter === "all"
            ? orders
            : orders.filter(order =>
                normalize(order.order_status) ===
                normalize(filter)
            );
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
        const items =
            Array.isArray(order.items)
                ? order.items
                : [];
        const shown =
            items.slice(0, 3);
        const extra =
            Math.max(items.length - 3, 0);
        const address = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ]
            .filter(Boolean)
            .join(", ");
        const discount =
            Number(order.discount || 0);
        const status =
            normalize(order.order_status);
        const cancelled =
            status === "cancelled";
        const orderNo =
            order.orderNumber ||
            order.order_number ||
            order.id;
        const canCancel = [
            "pending",
            "confirmed",
            "preparing"
        ].includes(status);
        return `
        <article class="order-card ${cancelled ? "order-cancelled" : ""}">
            <div class="order-card-top">
                <div class="order-number-box">
                    <div class="order-icon">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </div>
                    <div class="order-number">
                        <h3>
                            Order #${escape(orderNo)}
                        </h3>
                        <p>
                            ${formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <span class="order-status ${statusClass(order.order_status)}">
                    ${escape(
                        order.order_status ||
                        "Pending"
                    )}
                </span>
            </div>
            <div class="order-card-body">
                <div class="order-body-grid">
                    <div>
                        <div class="order-items">
                            ${shown
                                .map(itemHTML)
                                .join("")}
                        </div>
                        ${
                            extra
                                ? `
                                <div class="more-items">
                                    + ${extra}
                                    more item${extra > 1 ? "s" : ""}
                                </div>
                                `
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
                            <span>
                                Subtotal
                            </span>
                            <strong>
                                ₹${money(order.subtotal)}
                            </strong>
                        </div>
                        <div class="order-summary-row">
                            <span>
                                Delivery
                            </span>
                            <strong>
                                ₹${money(order.delivery_fee)}
                            </strong>
                        </div>
                        <div class="order-summary-row">
                            <span>
                                GST
                            </span>
                            <strong>
                                ₹${money(order.gst)}
                            </strong>
                        </div>
                        ${
                            discount > 0
                                ? `
                                <div class="order-summary-row discount">
                                    <span>
                                        Discount
                                    </span>
                                    <strong>
                                        - ₹${money(discount)}
                                    </strong>
                                </div>
                                `
                                : ""
                        }
                        <hr>
                        <div class="order-summary-row total">
                            <span>
                                Total
                            </span>
                            <strong>
                                ₹${money(order.total_amount)}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-footer-left">
                    <i class="fa-regular fa-clock"></i>
                    <span>
                        ${statusMessage(
                            order.order_status
                        )}
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
                    ${
                        canCancel
                            ? `
                            <button
                                type="button"
                                class="order-action-btn cancel-order-btn"
                                data-action="cancel"
                                data-id="${order.id}"
                            >
                                <i class="fa-solid fa-xmark"></i>
                                Cancel Order
                            </button>
                            `
                            : ""
                    }
                </div>
            </div>
        </article>
        `;
    }
    /* =====================================================
       ORDER ITEM
    ===================================================== */
    function itemHTML(item) {
        const qty =
            Number(item.quantity || 0);
        const price =
            Number(
                item.price ||
                item.item_price ||
                0
            );
        const total =
            Number(
                item.item_total ||
                qty * price
            );
        return `
        <div class="order-item">
            <img
                class="order-item-image"
                src="${attr(
                    foodImage(
                        item.image ||
                        item.food_image
                    )
                )}"
                alt="${attr(
                    item.name ||
                    item.food_name ||
                    "Food"
                )}"
                onerror="
                    this.onerror=null;
                    this.style.display='none';
                "
            >
            <div class="order-item-info">
                <h4>
                    ${escape(
                        item.name ||
                        item.food_name ||
                        "Food Item"
                    )}
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
       BUTTON EVENTS
    ===================================================== */
    function bindButtons() {
        document
            .querySelectorAll("[data-action]")
            .forEach(button => {
                button.onclick = () => {
                    const id =
                        Number(
                            button.dataset.id
                        );
                    const action =
                        button.dataset.action;
                    if (action === "view") {
                        openDetails(id);
                    }
                    if (action === "reorder") {
                        reorder(id);
                    }
                    if (action === "cancel") {
                        cancelOrder(id);
                    }
                };
            });
    }
    /* =====================================================
       CANCEL ORDER
    ===================================================== */
    async function cancelOrder(id) {
        const order =
            orders.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );
        if (!order) return;
        const status =
            normalize(order.order_status);
        if (
            ![
                "pending",
                "confirmed",
                "preparing"
            ].includes(status)
        ) {
            return alertBox(
                "This order can no longer be cancelled.",
                "warning"
            );
        }
        let confirmed = true;
        if (typeof Swal !== "undefined") {
            const result =
                await Swal.fire({
                    title: "Cancel Order?",
                    text:
                        "Are you sure you want to cancel this order?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText:
                        "Yes, Cancel",
                    cancelButtonText:
                        "Keep Order",
                    confirmButtonColor:
                        "#ef4444"
                });
            confirmed =
                result.isConfirmed;
        }
        if (!confirmed) return;
        try {
            const res =
                await fetch(
                    `/api/orders/${id}/cancel`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type":
                                "application/json",
                            "Accept":
                                "application/json"
                        }
                    }
                );
            if (res.status === 401) {
                location.href =
                    "/login";
                return;
            }
            const data =
                await json(res);
            if (
                !res.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to cancel order."
                );
            }
            // Update local display immediately.
            order.order_status =
                "Cancelled";
            updateStats();
            render();
            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "success",
                    title:
                        "Order Cancelled",
                    text:
                        "Your order has been cancelled.",
                    timer: 1500,
                    showConfirmButton:
                        false
                });
            }
        } catch (error) {
            alertBox(
                error.message ||
                "Unable to cancel order.",
                "error"
            );
        }
    }
    /* =====================================================
       REORDER
    ===================================================== */
    async function reorder(id) {
        if (reordering) return;
        const order =
            orders.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );
        if (
            !order ||
            !Array.isArray(order.items) ||
            !order.items.length
        ) {
            return alertBox(
                "No items found in this order.",
                "error"
            );
        }
        if (typeof Swal !== "undefined") {
            const result =
                await Swal.fire({
                    title:
                        "Reorder this order?",
                    text:
                        "All items will be added to your cart.",
                    icon:
                        "question",
                    showCancelButton:
                        true,
                    confirmButtonText:
                        "Yes, Reorder",
                    cancelButtonText:
                        "Cancel",
                    confirmButtonColor:
                        "#ff5a1f"
                });
            if (!result.isConfirmed) {
                return;
            }
        }
        reordering = true;
        setButtons(
            id,
            true
        );
        try {
            const items =
                order.items.filter(
                    item =>
                        Number(item.food_id) > 0 &&
                        Number(item.quantity) > 0
                );
            const results =
                await Promise.allSettled(
                    items.map(
                        item =>
                            addToCart(
                                Number(item.food_id),
                                Number(item.quantity)
                            )
                    )
                );
            const added =
                results.filter(
                    result =>
                        result.status ===
                        "fulfilled"
                ).length;
            const failed =
                results.length -
                added;
            if (!added) {
                throw new Error(
                    "Unable to add items to cart."
                );
            }
            await updateCartCount();
            if (
                typeof Swal !==
                "undefined"
            ) {
                const result =
                    await Swal.fire({
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
                        showCancelButton:
                            true,
                        confirmButtonText:
                            "View Cart",
                        cancelButtonText:
                            "Continue",
                        confirmButtonColor:
                            "#ff5a1f"
                    });
                if (result.isConfirmed) {
                    location.href =
                        "/cart-page";
                }
            } else {
                location.href =
                    "/cart-page";
            }
        } catch (error) {
            alertBox(
                error.message ||
                "Unable to reorder.",
                "error"
            );
        } finally {
            reordering = false;
            setButtons(
                id,
                false
            );
        }
    }
    /* =====================================================
       ADD TO CART
    ===================================================== */
    async function addToCart(
        foodId,
        quantity
    ) {
        const res =
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
                        foodId,
                        quantity
                    })
                }
            );
        if (res.status === 401) {
            location.href =
                "/login";
            throw new Error(
                "Please login first."
            );
        }
        const data =
            await json(res);
        if (
            !res.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to add item to cart."
            );
        }
        return data;
    }
    /* =====================================================
       REORDER BUTTON LOADING
    ===================================================== */
    function setButtons(
        id,
        loadingState
    ) {
        const button =
            document.querySelector(
                `[data-action="reorder"][data-id="${id}"]`
            );
        if (!button) return;
        if (loadingState) {
            button.disabled =
                true;
            button.dataset.oldHTML =
                button.innerHTML;
            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Adding...
            `;
        } else {
            button.disabled =
                false;
            button.innerHTML =
                button.dataset.oldHTML ||
                `
                <i class="fa-solid fa-rotate-right"></i>
                Reorder
                `;
        }
    }
    /* =====================================================
       OPEN ORDER DETAILS
    ===================================================== */
    async function openDetails(id) {
        if (!orderModal) return;
        orderModal.classList.add(
            "show"
        );
        if (modalTitle) {
            modalTitle.textContent =
                "Order Details";
        }
        modalContent.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
                <p>
                    Loading order...
                </p>
            </div>
        `;
        try {
            const res =
                await fetch(
                    `/api/orders/my/${id}`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            "Accept":
                                "application/json",
                            "Cache-Control":
                                "no-cache"
                        }
                    }
                );
            if (res.status === 401) {
                location.href =
                    "/login";
                return;
            }
            const data =
                await json(res);
            if (
                !res.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to load order."
                );
            }
            const order =
                data.order;
            if (modalTitle) {
                modalTitle.textContent =
                    `Order #${
                        order.orderNumber ||
                        order.order_number ||
                        id
                    }`;
            }
            renderModal(order);
        } catch (error) {
            modalContent.innerHTML = `
                <div class="orders-loading">
                    <p>
                        ${escape(
                            error.message
                        )}
                    </p>
                </div>
            `;
        }
    }
    /* =====================================================
       MODAL
    ===================================================== */
    function renderModal(order) {
        const address = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ]
            .filter(Boolean)
            .join(", ");
        const discount =
            Number(order.discount || 0);
        modalContent.innerHTML = `
            <div class="modal-status-box">
                <div class="modal-status-text">
                    <small>
                        ORDER STATUS
                    </small>
                    <strong>
                        ${escape(
                            order.order_status ||
                            "Pending"
                        )}
                    </strong>
                </div>
                <span class="order-status ${statusClass(
                    order.order_status
                )}">
                    ${escape(
                        order.order_status ||
                        "Pending"
                    )}
                </span>
            </div>
            <div class="modal-items">
                ${(order.items || [])
                    .map(modalItem)
                    .join("")}
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
                    <span>
                        Subtotal
                    </span>
                    <strong>
                        ₹${money(order.subtotal)}
                    </strong>
                </div>
                <div class="modal-bill-row">
                    <span>
                        Delivery Fee
                    </span>
                    <strong>
                        ₹${money(
                            order.delivery_fee
                        )}
                    </strong>
                </div>
                <div class="modal-bill-row">
                    <span>
                        GST
                    </span>
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
                                - ₹${money(
                                    discount
                                )}
                            </strong>
                        </div>
                        `
                        : ""
                }
                <hr>
                <div class="modal-bill-row total">
                    <span>
                        Total
                    </span>
                    <strong>
                        ₹${money(
                            order.total_amount
                        )}
                    </strong>
                </div>
            </div>
        `;
    }
    /* =====================================================
       MODAL ITEM
    ===================================================== */
    function modalItem(item) {
        const qty =
            Number(
                item.quantity || 0
            );
        const price =
            Number(
                item.price ||
                item.item_price ||
                0
            );
        const total =
            Number(
                item.item_total ||
                qty * price
            );
        return `
            <div class="modal-item">
                <img
                    src="${attr(
                        foodImage(
                            item.image ||
                            item.food_image
                        )
                    )}"
                    alt="${attr(
                        item.name ||
                        item.food_name ||
                        "Food"
                    )}"
                    onerror="
                        this.onerror=null;
                        this.style.display='none';
                    "
                >
                <div class="modal-item-info">
                    <h4>
                        ${escape(
                            item.name ||
                            item.food_name ||
                            "Food Item"
                        )}
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
       FILTER BUTTONS
    ===================================================== */
    filterButtons.forEach(button => {
        button.onclick = () => {
            filterButtons.forEach(
                item =>
                    item.classList.remove(
                        "active"
                    )
            );
            button.classList.add(
                "active"
            );
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
            orderModal.classList.remove(
                "show"
            );
        }
    }
    $("closeOrderModal")
        ?.addEventListener(
            "click",
            closeModal
        );
    orderModal?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                orderModal
            ) {
                closeModal();
            }
        }
    );
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                orderModal?.classList.contains(
                    "show"
                )
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
            const res =
                await fetch(
                    "/cart",
                    {
                        credentials:
                            "include",
                        cache:
                            "no-store",
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );
            const data =
                await json(res);
            const count =
                Array.isArray(data.cart)
                    ? data.cart.length
                    : 0;
            [
                "headerCartCount",
                "mobileCartCount"
            ].forEach(id => {
                const element = $(id);
                if (element) {
                    element.textContent =
                        count;
                }
            });
            const floating =
                $("cartCount");
            if (floating) {
                floating.textContent =
                    `${count} item${
                        count === 1
                            ? ""
                            : "s"
                    }`;
            }
        } catch (error) {
        }
    }
    /* =====================================================
       JSON PARSER
    ===================================================== */
    async function json(res) {
        const text =
            await res.text();
        if (!text.trim()) {
            throw new Error(
                `Empty server response (${res.status})`
            );
        }
        try {
            return JSON.parse(text);
        } catch {
            throw new Error(
                `Server returned invalid JSON (${res.status}).`
            );
        }
    }
    /* =====================================================
       FOOD IMAGE
    ===================================================== */
    function foodImage(image) {
        if (!image) {
            return "/images/food-placeholder.jpg";
        }
        image =
            String(image).trim();
        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("/")
        ) {
            return image;
        }
        return "/images/foods/" + image;
    }
    /* =====================================================
       STATUS CSS
    ===================================================== */
    function statusClass(status) {
        return {
            pending:
                "status-pending",
            confirmed:
                "status-confirmed",
            preparing:
                "status-preparing",
            "out for delivery":
                "status-out-for-delivery",
            delivered:
                "status-delivered",
            cancelled:
                "status-cancelled"
        }[
            normalize(status)
        ] || "status-pending";
    }
    /* =====================================================
       STATUS MESSAGE
    ===================================================== */
    function statusMessage(status) {
        return {
            pending:
                "Order received",
            confirmed:
                "Your order has been confirmed",
            preparing:
                "Your food is being prepared",
            "out for delivery":
                "Your order is on the way",
            delivered:
                "Order delivered successfully",
            cancelled:
                "This order was cancelled"
        }[
            normalize(status)
        ] || "Order placed";
    }
    /* =====================================================
       NORMALIZE
    ===================================================== */
    function normalize(value) {
        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            );
    }
    /* =====================================================
       DATE
    ===================================================== */
    function formatDate(value) {
        if (!value) {
            return "Date unavailable";
        }
        const date =
            new Date(value);
        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
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
    /* =====================================================
       MONEY
    ===================================================== */
    function money(value) {
        return Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }
    /* =====================================================
       ESCAPE HTML
    ===================================================== */
    function escape(value) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }
    /* =====================================================
       ATTRIBUTE ESCAPE
    ===================================================== */
    function attr(value) {
        return escape(value);
    }
    /* =====================================================
       LOADING
    ===================================================== */
    function showLoading() {
        if (!ordersList) return;
        if (emptyOrders) {
            emptyOrders.style.display =
                "none";
        }
        ordersList.style.display =
            "flex";
        ordersList.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
                <p>
                    Loading your orders...
                </p>
            </div>
        `;
    }
    /* =====================================================
       ERROR
    ===================================================== */
    function showError(message) {
        if (!ordersList) return;
        ordersList.innerHTML = `
            <div class="orders-loading">
                <i
                    class="fa-solid fa-circle-exclamation"
                    style="
                        color:#ef4444;
                        font-size:25px;
                        margin-bottom:10px
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
                        cursor:pointer;
                    "
                >
                    Try Again
                </button>
            </div>
        `;
        $("retryOrders")
            ?.addEventListener(
                "click",
                () => loadOrders()
            );
    }
    /* =====================================================
       ALERT
    ===================================================== */
    function alertBox(
        message,
        type = "info"
    ) {
        if (
            typeof Swal !==
            "undefined"
        ) {
            Swal.fire({
                icon: type,
                text: message,
                confirmButtonColor:
                    "#ff5a1f"
            });
        } else {
            alert(message);
        }
    }
});