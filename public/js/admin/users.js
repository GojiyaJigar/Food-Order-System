/* ==================================================
   JIGATO ADMIN - CUSTOMERS
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const body = $("usersTableBody");
    const search = $("userSearch");
    const filter = $("userStatusFilter");
    const sort = $("userSort");
    const refresh = $("refreshUsersBtn");

    const viewModal = $("userModal");
    const editModal = $("editUserModal");

    const state = {
        users: [],
        filtered: [],
        page: 1,
        perPage: 10,
        selected: null,
        editStatus: "active"
    };


    /* ==================================================
       HELPERS
    ================================================== */

    const esc = v =>
        String(v ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const initials = name => {
        const p = String(name || "Customer").trim().split(/\s+/);
        return p.length > 1
            ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
            : p[0].substring(0, 2).toUpperCase();
    };

    const date = value => {
        const d = new Date(value);
        return isNaN(d) ? "-" : d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const money = value =>
        Number(value || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        });

    const alertBox = (icon, title, text = "") =>
        typeof Swal !== "undefined"
            ? Swal.fire({
                icon,
                title,
                text,
                confirmButtonColor: "#ff5a1f"
            })
            : alert(text ? `${title}\n${text}` : title);

    const confirmBox = async (title, text, confirmText) => {
        if (typeof Swal === "undefined") {
            return confirm(`${title}\n${text}`);
        }

        const r = await Swal.fire({
            icon: "warning",
            title,
            text,
            showCancelButton: true,
            confirmButtonColor: "#ff5a1f",
            cancelButtonColor: "#777",
            confirmButtonText: confirmText
        });

        return r.isConfirmed;
    };

    async function request(url, options = {}) {

        const res = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...(options.headers || {})
            }
        });

        if (res.status === 401) {
            location.replace("/login");
            throw new Error("Session expired.");
        }

        if (res.status === 403) {
            location.replace("/");
            throw new Error("Access denied.");
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Request failed.");
        }

        return data;
    }


    /* ==================================================
       LOAD
    ================================================== */

    async function loadUsers() {

        body.innerHTML = `
            <tr>
                <td colspan="7" class="users-loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading customers...
                </td>
            </tr>
        `;

        refresh?.classList.add("loading");

        try {

            const data = await request("/admin/api/users");

            state.users = Array.isArray(data.users)
                ? data.users
                : [];

            updateStats();
            apply();

            $("usersLastUpdated").textContent =
                new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

        } catch (err) {

            console.error(err);

            body.innerHTML = `
                <tr>
                    <td colspan="7" class="users-empty">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        Unable to load customers.
                    </td>
                </tr>
            `;

            alertBox("error", "Failed", err.message);

        } finally {

            refresh?.classList.remove("loading");

        }
    }


    /* ==================================================
       FILTER + SORT
    ================================================== */

    function apply() {

        const q = search.value.trim().toLowerCase();
        const status = filter.value;

        state.filtered = state.users.filter(u => {

            const matchSearch =
                !q ||
                String(u.name || "").toLowerCase().includes(q) ||
                String(u.email || "").toLowerCase().includes(q) ||
                String(u.phone || "").toLowerCase().includes(q);

            const matchStatus =
                status === "all" ||
                String(u.status || "active").toLowerCase() === status;

            return matchSearch && matchStatus;
        });

        const mode = sort.value;

        state.filtered.sort((a, b) => {

            if (mode === "name-asc" || mode === "name-desc") {

                const A = String(a.name || "").toLowerCase();
                const B = String(b.name || "").toLowerCase();

                return mode === "name-asc"
                    ? A.localeCompare(B)
                    : B.localeCompare(A);
            }

            const A = new Date(a.created_at || 0).getTime();
            const B = new Date(b.created_at || 0).getTime();

            return mode === "oldest" ? A - B : B - A;
        });

        state.page = 1;
        render();
    }


    /* ==================================================
       RENDER
    ================================================== */

    function render() {

        const total = state.filtered.length;
        const pages = Math.max(
            1,
            Math.ceil(total / state.perPage)
        );

        state.page = Math.min(state.page, pages);

        const start =
            (state.page - 1) * state.perPage;

        const users =
            state.filtered.slice(
                start,
                start + state.perPage
            );

        $("visibleUsersCount").textContent = total;

        $("usersResultText").textContent = total
            ? `Showing ${start + 1}-${Math.min(start + state.perPage, total)} of ${total} customers`
            : "Showing 0 customers";


        body.innerHTML = users.length
            ? users.map(row).join("")
            : `
                <tr>
                    <td colspan="7" class="users-empty">
                        <i class="fa-solid fa-users-slash"></i>
                        No customers found.
                    </td>
                </tr>
            `;

        $("prevUsersBtn").disabled = state.page === 1;
        $("nextUsersBtn").disabled = state.page === pages;

        $("usersPages").innerHTML =
            pages <= 1
                ? ""
                : Array.from(
                    { length: pages },
                    (_, i) => `
                        <button
                            type="button"
                            class="page-number ${i + 1 === state.page ? "active" : ""}"
                            data-page="${i + 1}"
                        >
                            ${i + 1}
                        </button>
                    `
                ).join("");
    }


    function row(u) {

        const id = Number(u.id);

        const name = u.name || "Customer";
        const status =
            String(u.status || "active").toLowerCase();

        const inactive = status === "inactive";

        return `
            <tr>

                <td>
                    <div class="customer-info">

                        <div class="user-avatar">
                            ${esc(initials(name))}
                        </div>

                        <div class="customer-text">

                            <strong>
                                ${esc(name)}
                            </strong>

                            <span>
                                ${esc(u.email || "-")}
                            </span>

                        </div>

                    </div>
                </td>

                <td>${esc(u.phone || "-")}</td>

                <td>${esc(u.city || "-")}</td>

                <td>${esc(date(u.created_at))}</td>

                <td>
                    <strong>
                        ${Number(u.total_orders || 0)}
                    </strong>
                </td>

                <td>
                    <span class="user-status ${inactive ? "inactive" : "active"}">
                        ${inactive ? "Inactive" : "Active"}
                    </span>
                </td>

                <td>
                    <div class="user-actions">

                        <button
                            class="user-action-btn view"
                            data-action="view"
                            data-id="${id}"
                            title="View"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button
                            class="user-action-btn edit"
                            data-action="edit"
                            data-id="${id}"
                            title="Edit"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="user-action-btn toggle"
                            data-action="toggle"
                            data-id="${id}"
                            title="${inactive ? "Activate" : "Block"}"
                        >
                            <i class="fa-solid ${inactive ? "fa-user-check" : "fa-user-lock"}"></i>
                        </button>

                        <button
                            class="user-action-btn delete"
                            data-action="delete"
                            data-id="${id}"
                            title="Delete"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }


    /* ==================================================
       STATS
    ================================================== */

    function updateStats() {

        const active = state.users.filter(
            u => String(u.status || "active").toLowerCase() === "active"
        ).length;

        const inactive = state.users.length - active;

        const monthAgo =
            Date.now() - 30 * 24 * 60 * 60 * 1000;

        const newest = state.users.filter(
            u => new Date(u.created_at).getTime() >= monthAgo
        ).length;

        $("totalCustomers").textContent = state.users.length;
        $("activeCustomers").textContent = active;
        $("inactiveCustomers").textContent = inactive;
        $("newCustomers").textContent = newest;
    }


    /* ==================================================
       VIEW
    ================================================== */

    async function viewUser(id) {

        try {

            const data =
                await request(`/admin/api/users/${id}`);

            state.selected = data.user;

            fillView(data.user);

            viewModal.classList.add("show");
            document.body.style.overflow = "hidden";

        } catch (err) {

            alertBox("error", "Unable to Open", err.message);

        }
    }


    function fillView(u) {

        $("modalUserAvatar").textContent =
            initials(u.name);

        $("modalUserName").textContent =
            u.name || "Customer";

        $("modalUserEmail").textContent =
            u.email || "-";

        $("modalUserPhone").textContent =
            u.phone || "-";

        $("modalUserCity").textContent =
            u.city || "-";

        $("modalUserJoined").textContent =
            date(u.created_at);

        $("modalUserStatus").textContent =
            String(u.status || "active")
                .toLowerCase() === "inactive"
                ? "Inactive"
                : "Active";

        $("modalUserOrders").textContent =
            Number(u.total_orders || 0);

        $("modalUserSpent").textContent =
            money(u.total_spent);
    }


    /* ==================================================
       EDIT
    ================================================== */

    async function editUser(id) {

        try {

            const data =
                await request(`/admin/api/users/${id}`);

            state.selected = data.user;

            const u = data.user;

            $("editUserId").value = u.id;

            $("editUserName").value = u.name || "";
            $("editUserEmail").value = u.email || "";
            $("editUserPhone").value = u.phone || "";
            $("editUserCity").value = u.city || "";
            $("editUserState").value = u.state || "";
            $("editUserPincode").value = u.pincode || "";
            $("editUserAddress").value = u.address || "";

            $("editUserPreviewName").textContent =
                u.name || "Customer";

            $("editUserAvatar").textContent =
                initials(u.name);

            state.editStatus =
                String(u.status || "active").toLowerCase() === "inactive"
                    ? "inactive"
                    : "active";

            updateEditStatus();

            viewModal.classList.remove("show");
            editModal.classList.add("show");

            document.body.style.overflow = "hidden";

        } catch (err) {

            alertBox("error", "Unable to Edit", err.message);

        }
    }


    function updateEditStatus() {

        const active =
            state.editStatus === "active";

        $("editUserStatusIndicator")
            .classList.toggle("inactive", !active);

        $("editUserStatusText").textContent =
            active ? "Active" : "Inactive";

        $("editUserStatusBtn").innerHTML =
            active
                ? `<i class="fa-solid fa-user-lock"></i> Block Customer`
                : `<i class="fa-solid fa-user-check"></i> Activate Customer`;
    }


    async function saveUser(e) {

        e.preventDefault();

        const id = Number($("editUserId").value);

        const payload = {
            name: $("editUserName").value.trim(),
            email: $("editUserEmail").value.trim(),
            phone: $("editUserPhone").value.trim(),
            city: $("editUserCity").value.trim(),
            state: $("editUserState").value.trim(),
            pincode: $("editUserPincode").value.trim(),
            address: $("editUserAddress").value.trim()
        };

        if (
            !payload.name ||
            !payload.email ||
            !payload.phone ||
            !payload.city
        ) {
            return alertBox(
                "warning",
                "Missing Fields",
                "Name, email, phone and city are required."
            );
        }

        const btn = $("saveUserBtn");

        btn.disabled = true;
        btn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

        try {

            await request(`/admin/api/users/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            const oldStatus =
                String(state.selected?.status || "active").toLowerCase();

            if (state.editStatus !== oldStatus) {

                await request(`/admin/api/users/${id}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: state.editStatus
                    })
                });
            }

            editModal.classList.remove("show");
            document.body.style.overflow = "";

            await loadUsers();

            alertBox(
                "success",
                "Customer Updated",
                "Customer information updated successfully."
            );

        } catch (err) {

            alertBox(
                "error",
                "Update Failed",
                err.message
            );

        } finally {

            btn.disabled = false;
            btn.innerHTML =
                `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;

        }
    }


    /* ==================================================
       STATUS
    ================================================== */

    async function toggleStatus(id) {

        const user =
            state.users.find(u => Number(u.id) === id);

        if (!user) return;

        const inactive =
            String(user.status || "active").toLowerCase() === "inactive";

        const newStatus =
            inactive ? "active" : "inactive";

        const ok = await confirmBox(
            inactive ? "Activate Customer?" : "Block Customer?",
            inactive
                ? "This customer will be able to use the account again."
                : "This customer will no longer be able to use the account.",
            inactive ? "Activate" : "Block"
        );

        if (!ok) return;

        try {

            await request(`/admin/api/users/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({
                    status: newStatus
                })
            });

            await loadUsers();

            alertBox(
                "success",
                inactive
                    ? "Customer Activated"
                    : "Customer Blocked"
            );

        } catch (err) {

            alertBox(
                "error",
                "Status Update Failed",
                err.message
            );
        }
    }


    /* ==================================================
       DELETE
    ================================================== */

    async function deleteUser(id) {

        const user =
            state.users.find(u => Number(u.id) === id);

        if (!user) return;

        const ok = await confirmBox(
            "Delete Customer?",
            `${user.name || "Customer"} will be deleted if there is no order history.`,
            "Delete"
        );

        if (!ok) return;

        try {

            await request(`/admin/api/users/${id}`, {
                method: "DELETE"
            });

            await loadUsers();

            alertBox(
                "success",
                "Customer Deleted"
            );

        } catch (err) {

            alertBox(
                "error",
                "Delete Failed",
                err.message
            );
        }
    }


    /* ==================================================
       EVENTS
    ================================================== */

    search.addEventListener("input", apply);
    filter.addEventListener("change", apply);
    sort.addEventListener("change", apply);

    refresh.addEventListener("click", loadUsers);


    body.addEventListener("click", e => {

        const btn =
            e.target.closest("[data-action]");

        if (!btn) return;

        const id =
            Number(btn.dataset.id);

        const action =
            btn.dataset.action;

        if (action === "view") viewUser(id);
        if (action === "edit") editUser(id);
        if (action === "toggle") toggleStatus(id);
        if (action === "delete") deleteUser(id);
    });


    $("usersPages").addEventListener("click", e => {

        const btn =
            e.target.closest("[data-page]");

        if (!btn) return;

        state.page =
            Number(btn.dataset.page);

        render();
    });


    $("prevUsersBtn").addEventListener("click", () => {

        if (state.page > 1) {
            state.page--;
            render();
        }
    });


    $("nextUsersBtn").addEventListener("click", () => {

        const pages =
            Math.max(
                1,
                Math.ceil(
                    state.filtered.length /
                    state.perPage
                )
            );

        if (state.page < pages) {
            state.page++;
            render();
        }
    });


    $("closeUserModal").addEventListener(
        "click",
        () => {
            viewModal.classList.remove("show");
            document.body.style.overflow = "";
        }
    );


    $("userModalOverlay").addEventListener(
        "click",
        () => {
            viewModal.classList.remove("show");
            document.body.style.overflow = "";
        }
    );


    $("modalEditUserBtn").addEventListener(
        "click",
        () => {
            if (state.selected) {
                editUser(state.selected.id);
            }
        }
    );


    $("closeEditUserModal").addEventListener(
        "click",
        closeEdit
    );

    $("editUserModalOverlay").addEventListener(
        "click",
        closeEdit
    );

    $("cancelEditUserBtn").addEventListener(
        "click",
        closeEdit
    );


    function closeEdit() {
        editModal.classList.remove("show");
        document.body.style.overflow = "";
    }


    $("editUserForm").addEventListener(
        "submit",
        saveUser
    );


    $("editUserStatusBtn").addEventListener(
        "click",
        () => {
            state.editStatus =
                state.editStatus === "active"
                    ? "inactive"
                    : "active";

            updateEditStatus();
        }
    );


    $("editUserName").addEventListener(
        "input",
        () => {

            const name =
                $("editUserName").value.trim() ||
                "Customer";

            $("editUserPreviewName").textContent = name;
            $("editUserAvatar").textContent = initials(name);
        }
    );


    document.addEventListener("keydown", e => {

        if (e.key !== "Escape") return;

        viewModal.classList.remove("show");
        editModal.classList.remove("show");

        document.body.style.overflow = "";
    });


    /* ==================================================
       MOBILE SIDEBAR
    ================================================== */

    const sidebar = $("adminSidebar");
    const toggle = $("sidebarToggle");
    const overlay = $("sidebarOverlay");

    toggle?.addEventListener("click", () => {
        sidebar?.classList.add("open");
        overlay?.classList.add("show");
    });

    overlay?.addEventListener("click", closeSidebar);

    document
        .querySelectorAll(".sidebar-link")
        .forEach(link =>
            link.addEventListener("click", closeSidebar)
        );

    function closeSidebar() {
        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
    }


    /* ==================================================
       START
    ================================================== */

    loadUsers();

});         