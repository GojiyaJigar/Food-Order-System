document.addEventListener("DOMContentLoaded", () => {

    const $ = (id) => document.getElementById(id);

    const refreshBtn = $("refreshBtn");
  


    /* ======================================================
       HELPERS
    ====================================================== */

    function setText(id, value) {
        const element = $(id);
        if (element) {
            element.textContent = value;
        }
    }

    function numberFormat(value) {
        return Number(value || 0).toLocaleString("en-IN");
    }

    function moneyFormat(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getInitial(name) {
        return String(name || "A")
            .trim()
            .charAt(0)
            .toUpperCase();
    }

    function formatDate(date) {

        if (!date) return "-";

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
            return "-";
        }

        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    /* ======================================================
       STATUS CLASS
    ====================================================== */

    function getStatusClass(status) {

        return String(status || "Pending")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");
    }


    /* ======================================================
       RECENT ORDERS
    ====================================================== */

    function renderRecentOrders(orders) {

        const body = $("recentOrdersBody");

        if (!body) return;

        if (!orders || !orders.length) {

            body.innerHTML = `
                <tr>
                    <td colspan="6" class="table-state">
                        <i class="fa-solid fa-inbox"></i>
                        No recent orders found
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML = orders.map(order => {

            const customer =
                order.customer_name || "Customer";

            const status =
                order.order_status || "Pending";

            const statusClass =
                getStatusClass(status);

            return `
                <tr>

                    <td>
                        <span class="order-id">
                            #${order.id}
                        </span>
                    </td>

                    <td>
                        <div class="customer-cell">

                            <span class="customer-avatar-small">
                                ${getInitial(customer)}
                            </span>

                            <span>
                                ${customer}
                            </span>

                        </div>
                    </td>

                    <td>
                        <span class="amount-text">
                            ${moneyFormat(order.total_amount)}
                        </span>
                    </td>

                    <td>
                        ${order.payment_method || "-"}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${status}
                        </span>
                    </td>

                    <td>
                        ${formatDate(order.created_at)}
                    </td>

                </tr>
            `;

        }).join("");
    }


    /* ======================================================
       ORDER FLOW
    ====================================================== */

    function updateProgress(id, count, total) {

        const progress = $(id);

        if (!progress) return;

        const value = Number(count || 0);
        const max = Number(total || 0);

        const percentage =
            max > 0
                ? (value / max) * 100
                : 0;

        progress.style.width =
            `${Math.min(percentage, 100)}%`;
    }


    function updateOrderFlow(stats) {

        const totalOrders =
            Number(stats.totalOrders || 0);

        setText(
            "statusPending",
            numberFormat(stats.pendingOrders)
        );

        setText(
            "statusConfirmed",
            numberFormat(stats.confirmedOrders)
        );

        setText(
            "statusPreparing",
            numberFormat(stats.preparingOrders)
        );

        setText(
            "statusOutForDelivery",
            numberFormat(stats.outForDeliveryOrders)
        );

        setText(
            "statusDelivered",
            numberFormat(stats.deliveredOrders)
        );

        setText(
            "statusCancelled",
            numberFormat(stats.cancelledOrders)
        );


        updateProgress(
            "progressPending",
            stats.pendingOrders,
            totalOrders
        );

        updateProgress(
            "progressConfirmed",
            stats.confirmedOrders,
            totalOrders
        );

        updateProgress(
            "progressPreparing",
            stats.preparingOrders,
            totalOrders
        );

        updateProgress(
            "progressOutForDelivery",
            stats.outForDeliveryOrders,
            totalOrders
        );

        updateProgress(
            "progressDelivered",
            stats.deliveredOrders,
            totalOrders
        );

        updateProgress(
            "progressCancelled",
            stats.cancelledOrders,
            totalOrders
        );
    }


    /* ======================================================
       UPDATE DASHBOARD
    ====================================================== */

    function updateDashboard(data) {

        if (!data || !data.success) {
            throw new Error(
                data?.message ||
                "Dashboard data unavailable."
            );
        }

        const stats = data.stats || {};


        /* MAIN STATS */

        setText(
            "totalUsers",
            numberFormat(stats.totalUsers)
        );

        setText(
            "totalFoods",
            numberFormat(stats.totalFoods)
        );

        setText(
            "totalOrders",
            numberFormat(stats.totalOrders)
        );

        setText(
            "totalRevenue",
            moneyFormat(stats.totalRevenue)
        );


        /* SMALL STATS */

        setText(
            "pendingOrders",
            numberFormat(stats.pendingOrders)
        );

        setText(
            "deliveredOrders",
            numberFormat(stats.deliveredOrders)
        );

        setText(
            "activeOffers",
            numberFormat(stats.activeOffers)
        );


        /* ORDER FLOW */

        updateOrderFlow(stats);


        /* SNAPSHOT */

        setText(
            "summaryOrders",
            numberFormat(stats.totalOrders)
        );

        setText(
            "summaryAwaiting",
            numberFormat(stats.pendingOrders)
        );

        setText(
            "summaryDelivered",
            numberFormat(stats.deliveredOrders)
        );

        setText(
            "summaryOffers",
            numberFormat(stats.activeOffers)
        );


        /* RECENT ORDERS */

        renderRecentOrders(
            data.recentOrders || []
        );


        /* LAST UPDATED */

        const now = new Date();

        setText(
            "lastUpdated",
            now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            })
        );
    }


    /* ======================================================
       LOAD DASHBOARD
    ====================================================== */

    async function loadDashboard() {

        try {

            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.classList.add("loading");
            }


            const response = await fetch(
                "/admin/api/dashboard",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store"
                }
            );


            /* NOT LOGGED IN */

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }


            /* NOT ADMIN */

            if (response.status === 403) {
                window.location.replace("/");
                return;
            }


            if (!response.ok) {
                throw new Error(
                    `Request failed: ${response.status}`
                );
            }


            const data =
                await response.json();

            updateDashboard(data);

        }

        catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            const body =
                $("recentOrdersBody");

            if (body) {

                body.innerHTML = `
                    <tr>
                        <td colspan="6" class="table-state">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            Unable to load dashboard data
                        </td>
                    </tr>
                `;
            }
        }

        finally {

            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.classList.remove("loading");
            }
        }
    }


    /* ======================================================
       ADMIN INFO
    ====================================================== */

    async function loadAdminInfo() {

        try {

            const response = await fetch(
                "/admin/api/dashboard",
                {
                    credentials: "include",
                    cache: "no-store"
                }
            );

            if (!response.ok) return;

            const data =
                await response.json();

            const name =
                data.adminName ||
                data.admin?.name ||
                "Admin";


            setText(
                "adminName",
                name
            );

            setText(
                "adminNameText",
                name
            );


            const avatar =
                $("adminAvatar");

            if (avatar) {
                avatar.textContent =
                    getInitial(name);
            }

        }

        catch (error) {

            console.warn(
                "Admin info unavailable:",
                error
            );
        }
    }



    /* ======================================================
       REFRESH
    ====================================================== */

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadDashboard
        );
    }


    /* ======================================================
       INITIAL LOAD
    ====================================================== */

    loadDashboard();

});