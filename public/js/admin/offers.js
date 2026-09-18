document.addEventListener("DOMContentLoaded", () => {

    const state = {
        offers: [],
        filtered: [],
        page: 1,
        size: 10,
        editId: null
    };

    const $ = id => document.getElementById(id);

    const el = {
        total: $("totalOffers"),
        active: $("activeOffers"),
        inactive: $("inactiveOffers"),
        expiring: $("expiringOffers"),

        count: $("offersCount"),
        body: $("offersTableBody"),
        empty: $("offersEmpty"),
        result: $("offersResult"),

        search: $("offerSearch"),
        status: $("offerStatusFilter"),
        type: $("offerTypeFilter"),
        sort: $("offerSort"),

        prev: $("prevOffers"),
        pages: $("offersPages"),
        next: $("nextOffers"),

        add: $("addOfferBtn"),
        modal: $("offerModal"),
        overlay: $("offerModalOverlay"),
        close: $("closeOfferModal"),
        cancel: $("cancelOfferBtn"),
        form: $("offerForm"),

        label: $("offerModalLabel"),
        modalTitle: $("offerModalTitle"),

        id: $("offerId"),
        title: $("offerTitle"),
        description: $("offerDescription"),
        code: $("offerCode"),
        offerType: $("offerType"),
        discountType: $("discountType"),
        discountValue: $("discountValue"),
        minOrder: $("minOrder"),
        maxDiscount: $("maxDiscount"),
        startDate: $("startDate"),
        endDate: $("endDate"),
        activeCheck: $("offerActive"),
        save: $("saveOfferBtn")
    };


    /* =====================================================
       API
    ===================================================== */

    async function api(url, options = {}) {

        const response = await fetch(url, {
            credentials: "include",
            cache: "no-store",
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.headers || {})
            }
        });

        const text = await response.text();

        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error("Invalid server response.");
        }

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "Request failed."
            );
        }

        return data;
    }


    /* =====================================================
       LOAD
    ===================================================== */

    async function load(showMessage = false) {

        el.body.innerHTML = `
            <tr>
                <td colspan="7">
                    <div style="
                        padding:40px;
                        text-align:center;
                        color:#999;
                    ">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Loading offers...
                    </div>
                </td>
            </tr>
        `;

        try {

            const data =
                await api("/admin/api/offers");

            state.offers =
                Array.isArray(data.offers)
                    ? data.offers
                    : [];

            state.page = 1;

            updateStats();
            apply();

            if (
                showMessage &&
                typeof Swal !== "undefined"
            ) {
                Swal.fire({
                    icon: "success",
                    title: "Offers refreshed",
                    timer: 1200,
                    showConfirmButton: false
                });
            }

        } catch (error) {

            console.error(
                "OFFERS LOAD ERROR:",
                error
            );

            state.offers = [];
            state.filtered = [];

            updateStats();
            render();
            pagination();

            Swal.fire({
                icon: "error",
                title: "Unable to load offers",
                text: error.message
            });
        }
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function isExpired(offer) {

        if (!offer.end_date) {
            return false;
        }

        return new Date(
            offer.end_date
        ).getTime() < Date.now();
    }


    function isActive(offer) {

        if (isExpired(offer)) {
            return false;
        }

        return Number(
            offer.is_active ?? 0
        ) === 1;
    }


    function getStatus(offer) {

        if (isExpired(offer)) {
            return ["Expired", "expired"];
        }

        if (isActive(offer)) {
            return ["Active", "active"];
        }

        return ["Inactive", "inactive"];
    }


    /* =====================================================
       STATS
    ===================================================== */

    function updateStats() {

        const offers = state.offers;

        el.total.textContent =
            offers.length;

        el.active.textContent =
            offers.filter(
                isActive
            ).length;

        el.inactive.textContent =
            offers.filter(
                offer =>
                    !isActive(offer) &&
                    !isExpired(offer)
            ).length;

        el.expiring.textContent =
            offers.filter(
                offer => {

                    if (!offer.end_date) {
                        return false;
                    }

                    const days =
                        (
                            new Date(
                                offer.end_date
                            ).getTime() -
                            Date.now()
                        ) / 86400000;

                    return (
                        days >= 0 &&
                        days <= 7
                    );
                }
            ).length;
    }


    /* =====================================================
       DISCOUNT
    ===================================================== */

    function discountText(offer) {

        const type =
            String(
                offer.discount_type || ""
            ).toLowerCase();

        const value =
            Number(
                offer.discount_value || 0
            );

        if (type === "percentage") {
            return `${value}% OFF`;
        }

        if (type === "flat") {
            return `₹${value} OFF`;
        }

        if (type === "free_delivery") {
            return "FREE";
        }

        return "SPECIAL";
    }


    /* =====================================================
       FILTER
    ===================================================== */

    function apply() {

        const q =
            el.search.value
                .trim()
                .toLowerCase();

        const statusFilter =
            el.status.value;

        const typeFilter =
            el.type.value;

        let list =
            [...state.offers];


        /* SEARCH */

        if (q) {

            list =
                list.filter(
                    offer =>
                        String(
                            offer.title || ""
                        )
                            .toLowerCase()
                            .includes(q) ||

                        String(
                            offer.code || ""
                        )
                            .toLowerCase()
                            .includes(q)
                );
        }


        /* STATUS */

        if (
            statusFilter !== "all"
        ) {

            list =
                list.filter(
                    offer => {

                        if (
                            statusFilter ===
                            "active"
                        ) {
                            return isActive(
                                offer
                            );
                        }

                        if (
                            statusFilter ===
                            "inactive"
                        ) {
                            return (
                                !isActive(offer) &&
                                !isExpired(offer)
                            );
                        }

                        if (
                            statusFilter ===
                            "expired"
                        ) {
                            return isExpired(
                                offer
                            );
                        }

                        return true;
                    }
                );
        }


        /* TYPE */

        if (
            typeFilter !== "all"
        ) {

            list =
                list.filter(
                    offer =>
                        String(
                            offer.offer_type ||
                            "general"
                        )
                            .toLowerCase() ===
                        typeFilter
                );
        }


        /* SORT */

        switch (el.sort.value) {

            case "oldest":

                list.sort(
                    (a, b) =>
                        new Date(
                            a.created_at
                        ) -
                        new Date(
                            b.created_at
                        )
                );

                break;


            case "name-az":

                list.sort(
                    (a, b) =>
                        String(
                            a.title || ""
                        ).localeCompare(
                            String(
                                b.title || ""
                            )
                        )
                );

                break;


            case "name-za":

                list.sort(
                    (a, b) =>
                        String(
                            b.title || ""
                        ).localeCompare(
                            String(
                                a.title || ""
                            )
                        )
                );

                break;


            case "discount-high":

                list.sort(
                    (a, b) =>
                        Number(
                            b.discount_value || 0
                        ) -
                        Number(
                            a.discount_value || 0
                        )
                );

                break;


            default:

                list.sort(
                    (a, b) =>
                        new Date(
                            b.created_at
                        ) -
                        new Date(
                            a.created_at
                        )
                );
        }


        state.filtered =
            list;


        const pages =
            Math.max(
                1,
                Math.ceil(
                    list.length /
                    state.size
                )
            );


        if (
            state.page > pages
        ) {
            state.page = pages;
        }


        render();
        pagination();
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        if (
            !state.filtered.length
        ) {

            el.body.innerHTML = "";

            el.empty.hidden =
                false;

            el.count.textContent =
                "0 offers";

            return;
        }


        el.empty.hidden =
            true;


        const start =
            (
                state.page - 1
            ) *
            state.size;


        const list =
            state.filtered.slice(
                start,
                start + state.size
            );


        el.body.innerHTML =
            list.map(
                offer => {

                    const [
                        statusText,
                        statusClass
                    ] =
                        getStatus(
                            offer
                        );


                    return `
                        <tr>

                            <td>

                                <div class="offer-name">
                                    ${esc(
                                        offer.title
                                    )}
                                </div>

                                <div class="offer-description">
                                    ${esc(
                                        offer.description || ""
                                    )}
                                </div>

                            </td>


                            <td>

                                <span class="offer-code">
                                    ${esc(
                                        offer.code
                                    )}
                                </span>

                            </td>


                            <td>

                                <span class="offer-discount">
                                    ${discountText(
                                        offer
                                    )}
                                </span>

                            </td>


                            <td>

                                <span class="offer-minimum">
                                    ${
                                        Number(
                                            offer.min_order_amount || 0
                                        ) > 0

                                        ? `₹${Number(
                                            offer.min_order_amount
                                        ).toFixed(0)}`

                                        : "None"
                                    }
                                </span>

                            </td>


                            <td>

                                <span class="offer-validity">
                                    ${formatDate(
                                        offer.end_date
                                    )}
                                </span>

                            </td>


                            <td>

                                <span
                                    class="
                                        offer-status
                                        status-${statusClass}
                                    "
                                >
                                    ${statusText}
                                </span>

                            </td>


                            <td>

                                <div class="offer-actions">

                                    <button
                                        type="button"
                                        class="action-btn edit-btn"
                                        data-action="edit"
                                        data-id="${offer.id}"
                                        title="Edit"
                                    >
                                        <i class="fa-solid fa-pen"></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn toggle-btn"
                                        data-action="toggle"
                                        data-id="${offer.id}"
                                        title="${
                                            isActive(offer)
                                                ? "Deactivate"
                                                : "Activate"
                                        }"
                                    >
                                        <i
                                            class="
                                                fa-solid
                                                ${
                                                    isActive(offer)
                                                        ? "fa-toggle-on"
                                                        : "fa-toggle-off"
                                                }
                                            "
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn delete-btn"
                                        data-action="delete"
                                        data-id="${offer.id}"
                                        title="Delete"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            ).join("");


        el.count.textContent =
            `${state.filtered.length} ${
                state.filtered.length === 1
                    ? "offer"
                    : "offers"
            }`;
    }


    /* =====================================================
       PAGINATION
    ===================================================== */

    function pagination() {

        const total =
            state.filtered.length;

        const pages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    state.size
                )
            );


        const start =
            total
                ? (
                    (state.page - 1) *
                    state.size
                ) + 1
                : 0;


        const end =
            total
                ? Math.min(
                    state.page *
                    state.size,
                    total
                )
                : 0;


        el.result.textContent =
            `Showing ${start}-${end} of ${total} offers`;


        el.prev.disabled =
            state.page <= 1;


        el.next.disabled =
            total === 0 ||
            state.page >= pages;


        el.pages.innerHTML =
            "";


        for (
            let i = 1;
            i <= pages;
            i++
        ) {

            const btn =
                document.createElement(
                    "button"
                );


            btn.type =
                "button";

            btn.className =
                "page-btn";


            if (
                i === state.page
            ) {
                btn.classList.add(
                    "active"
                );
            }


            btn.textContent =
                i;


            btn.addEventListener(
                "click",
                () => {

                    state.page =
                        i;

                    render();
                    pagination();
                }
            );


            el.pages.appendChild(
                btn
            );
        }
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal(
        offer = null
    ) {

        state.editId =
            offer?.id || null;


        el.modal.hidden =
            false;


        el.label.textContent =
            offer
                ? "EDIT OFFER"
                : "ADD OFFER";


        el.modalTitle.textContent =
            offer
                ? "Edit Offer"
                : "Create Offer";


        el.form.reset();


        el.id.value =
            offer?.id || "";

        el.title.value =
            offer?.title || "";

        el.description.value =
            offer?.description || "";

        el.code.value =
            offer?.code || "";

        el.offerType.value =
            offer?.offer_type ||
            "general";

        el.discountType.value =
            offer?.discount_type ||
            "percentage";

        el.discountValue.value =
            offer?.discount_value ??
            "";

        el.minOrder.value =
            offer?.min_order_amount ??
            "";

        el.maxDiscount.value =
            offer?.max_discount ??
            "";

        el.startDate.value =
            toInputDate(
                offer?.start_date
            );

        el.endDate.value =
            toInputDate(
                offer?.end_date
            );

        el.activeCheck.checked =
            offer
                ? isActive(offer)
                : true;
    }


    function closeModal() {

        el.modal.hidden =
            true;

        el.form.reset();

        state.editId =
            null;
    }


    /* =====================================================
       SAVE
    ===================================================== */

    el.form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const payload = {

                title:
                    el.title.value.trim(),

                description:
                    el.description.value.trim() ||
                    null,

                code:
                    el.code.value
                        .trim()
                        .toUpperCase(),

                offer_type:
                    el.offerType.value,

                discount_type:
                    el.discountType.value,

                discount_value:
                    Number(
                        el.discountValue.value ||
                        0
                    ),

                min_order_amount:
                    Number(
                        el.minOrder.value ||
                        0
                    ),

                max_discount:
                    el.maxDiscount.value
                        ? Number(
                            el.maxDiscount.value
                        )
                        : null,

                start_date:
                    el.startDate.value ||
                    null,

                end_date:
                    el.endDate.value ||
                    null,

                usage_limit:
                    null,

                is_active:
                    el.activeCheck.checked
                        ? 1
                        : 0
            };


            el.save.disabled =
                true;


            const oldText =
                el.save.textContent;


            el.save.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;


            try {

                if (
                    state.editId
                ) {

                    await api(
                        `/admin/api/offers/${state.editId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                } else {

                    await api(
                        "/admin/api/offers",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );
                }


                closeModal();

                await load();


                Swal.fire({
                    icon: "success",

                    title:
                        state.editId
                            ? "Offer updated"
                            : "Offer created",

                    timer: 1300,

                    showConfirmButton:
                        false
                });


            } catch (error) {

                Swal.fire({
                    icon: "error",

                    title:
                        "Save failed",

                    text:
                        error.message
                });

            } finally {

                el.save.disabled =
                    false;

                el.save.textContent =
                    oldText ||
                    "Save Offer";
            }
        }
    );


    /* =====================================================
       TABLE ACTIONS
    ===================================================== */

    el.body.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                Number(
                    button.dataset.id
                );


            const offer =
                state.offers.find(
                    item =>
                        Number(
                            item.id
                        ) === id
                );


            if (!offer) {
                return;
            }


            const action =
                button.dataset.action;


            /* EDIT */

            if (
                action === "edit"
            ) {

                openModal(
                    offer
                );

                return;
            }


            /* TOGGLE */

            if (
                action === "toggle"
            ) {

                const next =
                    isActive(offer)
                        ? 0
                        : 1;


                try {

                    await api(
                        `/admin/api/offers/${id}/status`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    is_active:
                                        next
                                })
                        }
                    );


                    await load();


                } catch (error) {

                    Swal.fire({
                        icon: "error",

                        title:
                            "Status update failed",

                        text:
                            error.message
                    });
                }


                return;
            }


            /* DELETE */

            if (
                action === "delete"
            ) {

                const result =
                    await Swal.fire({

                        icon: "warning",

                        title:
                            "Delete offer?",

                        text:
                            `"${offer.title}" will be permanently deleted.`,

                        showCancelButton:
                            true,

                        confirmButtonText:
                            "Delete",

                        cancelButtonText:
                            "Cancel"
                    });


                if (
                    !result.isConfirmed
                ) {
                    return;
                }


                try {

                    await api(
                        `/admin/api/offers/${id}`,
                        {
                            method:
                                "DELETE"
                        }
                    );


                    await load();


                    Swal.fire({
                        icon: "success",

                        title:
                            "Offer deleted",

                        timer: 1200,

                        showConfirmButton:
                            false
                    });


                } catch (error) {

                    Swal.fire({
                        icon: "error",

                        title:
                            "Delete failed",

                        text:
                            error.message
                    });
                }
            }
        }
    );


    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    el.search.addEventListener(
        "input",
        () => {
            state.page = 1;
            apply();
        }
    );


    el.status.addEventListener(
        "change",
        () => {
            state.page = 1;
            apply();
        }
    );


    el.type.addEventListener(
        "change",
        () => {
            state.page = 1;
            apply();
        }
    );


    el.sort.addEventListener(
        "change",
        () => {
            state.page = 1;
            apply();
        }
    );


    /* =====================================================
       MODAL EVENTS
    ===================================================== */

    el.add.addEventListener(
        "click",
        () => openModal()
    );


    el.close.addEventListener(
        "click",
        closeModal
    );


    el.cancel.addEventListener(
        "click",
        closeModal
    );


    el.overlay.addEventListener(
        "click",
        closeModal
    );


    /* =====================================================
       PAGINATION EVENTS
    ===================================================== */

    el.prev.addEventListener(
        "click",
        () => {

            if (
                state.page > 1
            ) {

                state.page--;

                render();
                pagination();
            }
        }
    );


    el.next.addEventListener(
        "click",
        () => {

            const pages =
                Math.max(
                    1,
                    Math.ceil(
                        state.filtered.length /
                        state.size
                    )
                );


            if (
                state.page < pages
            ) {

                state.page++;

                render();
                pagination();
            }
        }
    );


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !el.modal.hidden
            ) {
                closeModal();
            }
        }
    );


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "No expiry";
        }

        const d =
            new Date(value);


        if (
            Number.isNaN(
                d.getTime()
            )
        ) {
            return "-";
        }


        return d.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function toInputDate(value) {

        if (!value) {
            return "";
        }

        const d =
            new Date(value);


        if (
            Number.isNaN(
                d.getTime()
            )
        ) {
            return "";
        }


        const pad =
            n =>
                String(n)
                    .padStart(2, "0");


        return (
            `${d.getFullYear()}-` +
            `${pad(d.getMonth() + 1)}-` +
            `${pad(d.getDate())}T` +
            `${pad(d.getHours())}:` +
            `${pad(d.getMinutes())}`
        );
    }


    function esc(value) {

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
       INITIAL VALUES
    ===================================================== */

    el.status.value =
        "all";

    el.type.value =
        "all";

    el.sort.value =
        "newest";


    /* =====================================================
       START
    ===================================================== */

    load();

});