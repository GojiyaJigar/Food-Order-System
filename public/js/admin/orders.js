document.addEventListener("DOMContentLoaded", () => {

    const state = {
        orders: [],
        filtered: [],
        page: 1,
        size: 10,
        selectedId: null
    };

    const $ = id => document.getElementById(id);

    const el = {
        refresh: $("refreshOrdersBtn"),
        lastUpdated: $("ordersLastUpdated"),

        total: $("totalOrders"),
        pending: $("pendingOrders"),
        active: $("activeOrders"),
        delivered: $("deliveredOrders"),
        cancelled: $("cancelledOrders"),
        revenue: $("totalOrderRevenue"),

        search: $("orderSearch"),
        clear: $("clearOrderSearch"),
        status: $("orderStatusFilter"),
        sort: $("orderSort"),

        title: $("ordersTitle"),
        count: $("ordersVisibleCount"),

        body: $("ordersTableBody"),
        empty: $("ordersEmptyState"),
        emptyText: $("ordersEmptyText"),
        reset: $("resetOrderFiltersBtn"),

        result: $("ordersResultText"),
        prev: $("prevOrdersBtn"),
        pages: $("ordersPages"),
        next: $("nextOrdersBtn"),

        modal: $("orderModal"),
        overlay: $("orderModalOverlay"),
        closeModal: $("closeOrderModal"),
        modalTitle: $("modalOrderTitle"),
        modalDate: $("modalOrderDate"),
        modalContent: $("orderModalContent"),
        modalStatus: $("modalOrderStatus"),
        updateStatus: $("updateOrderStatusBtn")
    };

    const statuses = [
        "Pending",
        "Confirmed",
        "Preparing",
        "Out For Delivery",
        "Delivered",
        "Cancelled"
    ];

    function money(value) {
        return `₹${Number(value || 0).toFixed(2)}`;
    }

    function date(value) {
        if (!value) return "-";

        const d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return value;
        }

        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function statusClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace("out-for-delivery", "out");
    }

    function getId(order) {
        return order.id ?? order.order_id ?? "";
    }

    function getOrderNumber(order) {
        return (
            order.orderNumber ||
            order.order_number ||
            "-"
        );
    }

    function getStatus(order) {
        return order.order_status || "Pending";
    }

    function getName(order) {
        return order.customer_name || "Unknown Customer";
    }

    function getPhone(order) {
        return order.phone || "-";
    }

    function getAmount(order) {
        return Number(
            order.total_amount ??
            order.total ??
            0
        );
    }

    function getPayment(order) {
        return order.payment_method || "COD";
    }

    function getDate(order) {
        return order.created_at || null;
    }

    function getItems(order) {
        if (Array.isArray(order.items)) {
            return order.items.reduce(
                (sum, item) =>
                    sum + Number(item.quantity || 0),
                0
            );
        }

        return Number(
            order.items_count ??
            order.item_count ??
            0
        );
    }

    async function api(url, options = {}) {

        const res = await fetch(url, {
            credentials: "include",
            cache: "no-store",
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        });

        const text = await res.text();

        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error("Invalid server response.");
        }

        if (!res.ok || data.success === false) {
            throw new Error(
                data.message || "Request failed."
            );
        }

        return data;
    }

    async function load(showAlert = false) {

        el.body.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="orders-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Loading orders...
                    </div>
                </td>
            </tr>
        `;

        try {

            const data =
                await api("/admin/api/orders");

            state.orders =
                Array.isArray(data.orders)
                    ? data.orders
                    : [];

            state.page = 1;

            updateStats();
            apply();
            updateTime();

            if (
                showAlert &&
                typeof Swal !== "undefined"
            ) {
                Swal.fire({
                    icon: "success",
                    title: "Orders refreshed",
                    timer: 1200,
                    showConfirmButton: false
                });
            }

        } catch (error) {

            console.error("ORDERS LOAD:", error);

            state.orders = [];
            state.filtered = [];

            updateStats();
            render();
            pagination();

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "error",
                    title: "Unable to load orders",
                    text: error.message
                });
            }
        }
    }

    function updateStats() {

        const orders = state.orders;

        const count = status =>
            orders.filter(
                order =>
                    getStatus(order).toLowerCase() ===
                    status.toLowerCase()
            ).length;

        const revenue = orders.reduce(
            (sum, order) =>
                getStatus(order) === "Cancelled"
                    ? sum
                    : sum + getAmount(order),
            0
        );

        el.total.textContent = orders.length;
        el.pending.textContent = count("Pending");

        el.active.textContent =
            orders.filter(order =>
                [
                    "Confirmed",
                    "Preparing",
                    "Out For Delivery"
                ].includes(getStatus(order))
            ).length;

        el.delivered.textContent =
            count("Delivered");

        el.cancelled.textContent =
            count("Cancelled");

        el.revenue.textContent =
            money(revenue);
    }

    function apply() {

        const q =
            (el.search.value || "")
                .trim()
                .toLowerCase();

        const selectedStatus =
            (el.status.value || "all")
                .trim()
                .toLowerCase();

        let list = [...state.orders];

        if (q) {
            list = list.filter(order => {

                const text = [
                    getOrderNumber(order),
                    getId(order),
                    getName(order),
                    getPhone(order)
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(q);
            });
        }

        if (selectedStatus !== "all") {
            list = list.filter(
                order =>
                    getStatus(order)
                        .trim()
                        .toLowerCase() ===
                    selectedStatus
            );
        }

        switch (el.sort.value) {

            case "oldest":
                list.sort(
                    (a, b) =>
                        new Date(getDate(a)) -
                        new Date(getDate(b))
                );
                break;

            case "amount-high":
                list.sort(
                    (a, b) =>
                        getAmount(b) -
                        getAmount(a)
                );
                break;

            case "amount-low":
                list.sort(
                    (a, b) =>
                        getAmount(a) -
                        getAmount(b)
                );
                break;

            case "customer-az":
                list.sort(
                    (a, b) =>
                        getName(a).localeCompare(
                            getName(b)
                        )
                );
                break;

            case "customer-za":
                list.sort(
                    (a, b) =>
                        getName(b).localeCompare(
                            getName(a)
                        )
                );
                break;

            default:
                list.sort(
                    (a, b) =>
                        new Date(getDate(b)) -
                        new Date(getDate(a))
                );
        }

        state.filtered = list;

        const pages = Math.max(
            1,
            Math.ceil(
                list.length / state.size
            )
        );

        if (state.page > pages) {
            state.page = pages;
        }

        updateFilterHeader();
        render();
        pagination();
    }

    function updateFilterHeader() {

        const labels = {
            all: "All Orders",
            Pending: "Pending",
            Confirmed: "Confirmed",
            Preparing: "Preparing",
            "Out For Delivery": "Out For Delivery",
            Delivered: "Delivered",
            Cancelled: "Cancelled"
        };

        el.title.textContent =
            labels[el.status.value] ||
            "All Orders";

        el.count.textContent =
            `${state.filtered.length} ${
                state.filtered.length === 1
                    ? "order"
                    : "orders"
            }`;
    }

    function render() {

        if (!state.filtered.length) {

            el.body.innerHTML = "";

            el.empty.hidden = false;
            el.empty.style.display = "flex";

            el.emptyText.textContent =
                state.orders.length
                    ? "No orders match your current filters."
                    : "There are no orders yet.";

            return;
        }

        el.empty.hidden = true;
        el.empty.style.display = "none";

        const start =
            (state.page - 1) *
            state.size;

        const items =
            state.filtered.slice(
                start,
                start + state.size
            );

        el.body.innerHTML =
            items.map(row).join("");
    }

    function row(order) {

        const status = getStatus(order);
        const payment = getPayment(order);
        const orderNumber = getOrderNumber(order);

        return `
            <tr>

                <td>
                    <div class="order-id">
                        ${esc(orderNumber)}
                    </div>
                </td>

                <td>
                    <div class="customer-name">
                        ${esc(getName(order))}
                    </div>

                    <div class="customer-phone">
                        ${esc(getPhone(order))}
                    </div>
                </td>

                <td>
                    <span class="items-count">
                        ${getItems(order)}
                    </span>
                </td>

                <td>
                    <strong>
                        ${money(getAmount(order))}
                    </strong>
                </td>

                <td>
                    <span class="payment-badge">
                        ${esc(payment)}
                    </span>
                </td>

                <td>
                    <span
                        class="order-status status-${statusClass(status)}"
                    >
                        ${esc(status)}
                    </span>
                </td>

                <td>
                    <span class="order-date">
                        ${date(getDate(order))}
                    </span>
                </td>

                <td>
                    <div class="order-actions">
                        <button
                            type="button"
                            class="order-action-btn"
                            data-view="${esc(getId(order))}"
                            title="View Order"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </td>

            </tr>
        `;
    }

    function pagination() {

        const total =
            state.filtered.length;

        const pages = Math.max(
            1,
            Math.ceil(
                total / state.size
            )
        );

        const start = total
            ? ((state.page - 1) * state.size) + 1
            : 0;

        const end = total
            ? Math.min(
                state.page * state.size,
                total
            )
            : 0;

        el.result.textContent =
            `Showing ${start}-${end} of ${total} orders`;

        el.prev.disabled =
            state.page <= 1;

        el.next.disabled =
            state.page >= pages ||
            total === 0;

        el.pages.innerHTML = "";

        for (let i = 1; i <= pages; i++) {

            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "page-btn";

            if (i === state.page) {
                button.classList.add("active");
            }

            button.textContent = i;

            button.addEventListener(
                "click",
                () => {
                    state.page = i;
                    render();
                    pagination();
                }
            );

            el.pages.appendChild(button);
        }
    }

    async function openModal(id) {

        state.selectedId = id;

        el.modal.hidden = false;
        el.modalTitle.textContent =
            "Order Details";

        el.modalDate.textContent =
            "Loading...";

        el.modalContent.innerHTML = `
            <div class="orders-loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading order details...
            </div>
        `;

        try {

            const data =
                await api(
                    `/admin/api/orders/${encodeURIComponent(id)}`
                );

            const order = data.order;

            if (!order) {
                throw new Error(
                    "Order not found."
                );
            }

            const orderNumber =
                getOrderNumber(order);

            el.modalTitle.textContent =
                orderNumber !== "-"
                    ? `Order ${orderNumber}`
                    : "Order Details";

            el.modalDate.textContent =
                date(getDate(order));

            el.modalStatus.value =
                getStatus(order);

            renderModal(order);

        } catch (error) {

            el.modalContent.innerHTML = `
                <div class="orders-loading">
                    ${esc(error.message)}
                </div>
            `;
        }
    }

    function renderModal(order) {

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];

        const address = [
            order.address,
            order.city,
            order.state,
            order.pincode
        ]
            .filter(Boolean)
            .join(", ");

        const itemHtml = items.length
            ? items.map(item => `
                <div class="order-item-row">

                    <div>
                        <div class="order-item-name">
                            ${esc(
                                item.name ||
                                "Food Item"
                            )}
                        </div>

                        <div class="order-item-meta">
                            ${Number(item.quantity || 0)}
                            ×
                            ${money(item.price)}
                        </div>
                    </div>

                    <div class="order-item-total">
                        ${money(
                            item.item_total ??
                            (
                                Number(item.quantity || 0) *
                                Number(item.price || 0)
                            )
                        )}
                    </div>

                </div>
            `).join("")
            : `
                <div class="orders-loading">
                    No item details available.
                </div>
            `;

        el.modalContent.innerHTML = `

            <div class="order-modal-section">

                <div class="order-modal-section-title">
                    Customer
                </div>

                <div class="order-modal-customer">
                    <strong>
                        ${esc(getName(order))}
                    </strong>

                    <span>
                        ${esc(getPhone(order))}
                    </span>
                </div>

            </div>

            <div class="order-modal-section">

                <div class="order-modal-section-title">
                    Delivery Address
                </div>

                <div class="order-modal-address">
                    ${esc(address || "-")}
                </div>

            </div>

            <div class="order-modal-section">

                <div class="order-modal-section-title">
                    Items
                </div>

                <div class="order-items-list">
                    ${itemHtml}
                </div>

            </div>

            <div class="order-modal-section">

                <div class="order-modal-section-title">
                    Payment
                </div>

                <div class="order-modal-payment">
                    ${esc(getPayment(order))}
                </div>

            </div>

            <div class="order-modal-section">

                <div class="order-modal-section-title">
                    Total
                </div>

                <div class="order-modal-totals">

                    <div class="order-total-row">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ${money(getAmount(order))}
                        </strong>

                    </div>

                </div>

            </div>
        `;
    }

    function closeModal() {
        el.modal.hidden = true;
        state.selectedId = null;
    }

    async function updateStatus() {

        if (!state.selectedId) return;

        const status =
            el.modalStatus.value;

        if (!statuses.includes(status)) {
            return;
        }

        if (typeof Swal !== "undefined") {

            const selectedOrder =
                state.orders.find(
                    order =>
                        String(getId(order)) ===
                        String(state.selectedId)
                );

            const displayId =
                selectedOrder
                    ? getOrderNumber(selectedOrder)
                    : state.selectedId;

            const result =
                await Swal.fire({
                    icon: "question",
                    title: "Update order status?",
                    text:
                        `Order ${displayId} → ${status}`,
                    showCancelButton: true,
                    confirmButtonText: "Update",
                    cancelButtonText: "Cancel"
                });

            if (!result.isConfirmed) {
                return;
            }
        }

        el.updateStatus.disabled = true;

        try {

            await api(
                `/admin/api/orders/${encodeURIComponent(
                    state.selectedId
                )}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const local =
                state.orders.find(
                    order =>
                        String(getId(order)) ===
                        String(state.selectedId)
                );

            if (local) {
                local.order_status = status;
            }

            updateStats();
            apply();
            closeModal();

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "success",
                    title: "Status updated",
                    timer: 1300,
                    showConfirmButton: false
                });
            }

        } catch (error) {

            if (typeof Swal !== "undefined") {
                Swal.fire({
                    icon: "error",
                    title: "Update failed",
                    text: error.message
                });
            }

        } finally {
            el.updateStatus.disabled = false;
        }
    }

    el.search.addEventListener("input", () => {
        state.page = 1;
        apply();
    });

    el.clear.addEventListener("click", () => {
        el.search.value = "";
        state.page = 1;
        apply();
        el.search.focus();
    });

    el.status.addEventListener("change", () => {
        state.page = 1;
        apply();
    });

    el.sort.addEventListener("change", () => {
        state.page = 1;
        apply();
    });

    el.refresh.addEventListener(
        "click",
        () => load(true)
    );

    el.reset.addEventListener("click", () => {
        el.search.value = "";
        el.status.value = "all";
        el.sort.value = "latest";
        state.page = 1;
        apply();
    });

    el.prev.addEventListener("click", () => {

        if (state.page > 1) {
            state.page--;
            render();
            pagination();
        }
    });

    el.next.addEventListener("click", () => {

        const pages =
            Math.max(
                1,
                Math.ceil(
                    state.filtered.length /
                    state.size
                )
            );

        if (state.page < pages) {
            state.page++;
            render();
            pagination();
        }
    });

    el.body.addEventListener("click", event => {

        const button =
            event.target.closest("[data-view]");

        if (!button) return;

        openModal(button.dataset.view);
    });

    el.closeModal.addEventListener(
        "click",
        closeModal
    );

    el.overlay.addEventListener(
        "click",
        closeModal
    );

    el.updateStatus.addEventListener(
        "click",
        updateStatus
    );

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            !el.modal.hidden
        ) {
            closeModal();
        }
    });

    function updateTime() {

        el.lastUpdated.textContent =
            `Updated ${new Date().toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;
    }

    el.status.value = "all";
    el.sort.value = "latest";

    load();
});