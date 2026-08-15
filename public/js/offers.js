/* =====================================================
   JIGATO - OFFERS PAGE JS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const offersGrid =
        document.getElementById("offersGrid");

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    let allOffers = [];

    let currentFilter = "all";


    // =====================================================
    // LOAD OFFERS
    // =====================================================

    loadOffers();


    async function loadOffers() {

        if (!offersGrid) return;


        showLoading();


        try {

            const response =
                await fetch(
                    "/api/offers",
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            const raw =
                await response.text();


            console.log(
                "OFFERS API STATUS:",
                response.status
            );


            console.log(
                "OFFERS API RESPONSE:",
                raw
            );


            let data;


            try {

                data =
                    JSON.parse(raw);

            } catch (error) {

                console.error(
                    "INVALID OFFERS JSON:",
                    error
                );

                throw new Error(
                    "Server returned invalid offers data."
                );

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load offers."
                );

            }


            allOffers =
                Array.isArray(
                    data.offers
                )
                    ? data.offers
                    : [];


            renderOffers();


        } catch (error) {

            console.error(
                "LOAD OFFERS ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to load offers."
            );

        }

    }


    // =====================================================
    // FILTER BUTTONS
    // =====================================================

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderOffers();

            }
        );

    });


    // =====================================================
    // RENDER OFFERS
    // =====================================================

    function renderOffers() {

        if (!offersGrid) return;


        let filteredOffers =
            allOffers;


        if (
            currentFilter !== "all"
        ) {

            filteredOffers =
                allOffers.filter(
                    offer => {

                        return (
                            String(
                                offer.offer_type
                            ).toLowerCase()
                            ===
                            String(
                                currentFilter
                            ).toLowerCase()
                        );

                    }
                );

        }


        if (!filteredOffers.length) {

            showEmpty();

            return;

        }


        offersGrid.innerHTML =
            filteredOffers
                .map(
                    createOfferCard
                )
                .join("");


        setupCopyButtons();

        setupOrderButtons();

    }


    // =====================================================
    // CREATE OFFER CARD
    // =====================================================

    function createOfferCard(
        offer
    ) {

        const type =
            String(
                offer.offer_type ||
                "general"
            ).toLowerCase();


        const discountType =
            String(
                offer.discount_type ||
                ""
            ).toLowerCase();


        const discountValue =
            Number(
                offer.discount_value ||
                0
            );


        const minimum =
            Number(
                offer.min_order_amount ||
                0
            );


        const maxDiscount =
            offer.max_discount !== null &&
            offer.max_discount !== undefined
                ? Number(
                    offer.max_discount
                )
                : null;


        // =================================================
        // DISCOUNT TEXT
        // =================================================

        let discountText = "";


        if (
            discountType ===
            "percentage"
        ) {

            discountText =
                `${formatNumber(
                    discountValue
                )}% OFF`;

        }

        else if (
            discountType ===
            "flat"
        ) {

            discountText =
                `₹${formatNumber(
                    discountValue
                )} OFF`;

        }

        else if (
            discountType ===
            "free_delivery"
        ) {

            discountText =
                "FREE";

        }

        else {

            discountText =
                "SPECIAL";

        }


        // =================================================
        // TYPE LABEL
        // =================================================

        const typeLabel =
            getOfferTypeLabel(
                type,
                discountType
            );


        const typeIcon =
            getOfferTypeIcon(
                type,
                discountType
            );


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            offer.description ||
            "Enjoy this exclusive Jigato offer.";


        // =================================================
        // MINIMUM ORDER
        // =================================================

        const minimumText =
            minimum > 0

                ? `Minimum order ₹${minimum.toFixed(0)}`

                : "No minimum order";


        // =================================================
        // MAX DISCOUNT
        // =================================================

        let maxText = "";


        if (
            maxDiscount !== null &&
            maxDiscount > 0 &&
            discountType ===
                "percentage"
        ) {

            maxText =
                ` • Max discount ₹${maxDiscount.toFixed(0)}`;

        }


        // =================================================
        // EXPIRY
        // =================================================

        const expiry =
            formatExpiry(
                offer.end_date
            );


        // =================================================
        // RESTAURANT
        // =================================================

        const restaurantName =
            offer.restaurant_name ||
            "";


        // =================================================
        // ORDER LINK
        // =================================================

        let orderLink =
            "/restaurant";


        if (
            offer.restaurant_id
        ) {

            orderLink =
                `/restaurant/${Number(
                    offer.restaurant_id
                )}`;

        }


        return `

            <article
                class="offer-card"
                data-type="${escapeHTML(
                    type
                )}"
                data-id="${Number(
                    offer.id
                )}"
            >


                <div class="offer-card-top">

                    <span class="offer-type">

                        <i class="${typeIcon}"></i>

                        ${escapeHTML(
                            typeLabel
                        )}

                    </span>


                    <span class="offer-expiry">

                        ${escapeHTML(
                            expiry
                        )}

                    </span>

                </div>


                <h3>

                    ${escapeHTML(
                        offer.title ||
                        "Special Offer"
                    )}

                </h3>


                <p class="offer-card-description">

                    ${escapeHTML(
                        description
                    )}

                </p>


                <div class="offer-discount">

                    <strong>

                        ${escapeHTML(
                            discountText
                        )}

                    </strong>


                    ${
                        discountType ===
                        "percentage"

                            ? `<span>
                                on your order
                               </span>`

                            : discountType ===
                              "free_delivery"

                                ? `<span>
                                    on delivery
                                   </span>`

                                : `<span>
                                    on your order
                                   </span>`
                    }

                </div>


                <div class="offer-min-order">

                    <i class="fa-solid fa-circle-info"></i>

                    ${escapeHTML(
                        minimumText
                    )}

                    ${escapeHTML(
                        maxText
                    )}

                </div>


                <div class="offer-code-box">

                    <span class="offer-code">

                        ${escapeHTML(
                            offer.code
                        )}

                    </span>


                    <button
                        type="button"
                        class="copy-code-btn"
                        data-code="${escapeHTML(
                            offer.code
                        )}"
                    >

                        <i class="fa-regular fa-copy"></i>

                        Copy

                    </button>

                </div>


                <div class="offer-card-footer">


                    <span
                        class="offer-restaurant"
                    >

                        ${
                            restaurantName

                                ? `
                                    <i class="fa-solid fa-store"></i>
                                    ${escapeHTML(
                                        restaurantName
                                    )}
                                  `

                                : `
                                    <i class="fa-solid fa-utensils"></i>
                                    All Restaurants
                                  `
                        }

                    </span>


                    <a
                        href="${orderLink}"
                        class="offer-order-btn"
                    >

                        Order Now

                        <i class="fa-solid fa-arrow-right"></i>

                    </a>


                </div>


            </article>

        `;

    }


    // =====================================================
    // COPY BUTTONS
    // =====================================================

    function setupCopyButtons() {

        const buttons =
            document.querySelectorAll(
                ".copy-code-btn"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const code =
                        button.dataset.code;


                    if (!code) return;


                    const copied =
                        await copyToClipboard(
                            code
                        );


                    if (copied) {

                        const oldHTML =
                            button.innerHTML;


                        button.innerHTML = `
                            <i class="fa-solid fa-check"></i>
                            Copied
                        `;


                        button.classList.add(
                            "copied"
                        );


                        if (
                            typeof Swal !==
                            "undefined"
                        ) {

                            Swal.fire({

                                toast: true,

                                position:
                                    "top-end",

                                icon:
                                    "success",

                                title:
                                    `${code} copied`,

                                showConfirmButton:
                                    false,

                                timer:
                                    1600

                            });

                        }


                        setTimeout(
                            () => {

                                button.innerHTML =
                                    oldHTML;

                                button.classList.remove(
                                    "copied"
                                );

                            },
                            1800
                        );

                    }

                    else {

                        if (
                            typeof Swal !==
                            "undefined"
                        ) {

                            Swal.fire({

                                icon:
                                    "info",

                                title:
                                    "Coupon Code",

                                text:
                                    code,

                                confirmButtonColor:
                                    "#ff5a1f"

                            });

                        }

                    }

                }
            );

        });

    }


    // =====================================================
    // ORDER BUTTONS
    // =====================================================

    function setupOrderButtons() {

        const buttons =
            document.querySelectorAll(
                ".offer-order-btn"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const card =
                        button.closest(
                            ".offer-card"
                        );


                    if (!card) return;


                    const code =
                        card.querySelector(
                            ".offer-code"
                        );


                    if (
                        code &&
                        code.textContent
                    ) {

                        localStorage.setItem(
                            "jigatoCoupon",
                            code.textContent.trim()
                        );

                    }

                }
            );

        });

    }


    // =====================================================
    // COPY TO CLIPBOARD
    // =====================================================

    async function copyToClipboard(
        text
    ) {

        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard.writeText(
                    text
                );

                return true;

            }


            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value = text;

            textarea.style.position =
                "fixed";

            textarea.style.left =
                "-9999px";


            document.body.appendChild(
                textarea
            );


            textarea.select();


            const success =
                document.execCommand(
                    "copy"
                );


            textarea.remove();


            return success;

        } catch (error) {

            console.error(
                "COPY ERROR:",
                error
            );

            return false;

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        if (!offersGrid) return;


        offersGrid.innerHTML = `

            <div class="offers-loading">

                <div class="loading-spinner"></div>

                <p>
                    Finding the best offers for you...
                </p>

            </div>

        `;

    }


    // =====================================================
    // EMPTY
    // =====================================================

    function showEmpty() {

        if (!offersGrid) return;


        offersGrid.innerHTML = `

            <div class="offers-empty">

                <i
                    class="fa-solid fa-ticket"
                ></i>


                <h3>
                    No Offers Available
                </h3>


                <p>
                    There are no offers in this category
                    right now. Check again soon.
                </p>

            </div>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(
        message
    ) {

        if (!offersGrid) return;


        offersGrid.innerHTML = `

            <div class="offers-empty">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>


                <h3>
                    Unable To Load Offers
                </h3>


                <p>
                    ${escapeHTML(
                        message
                    )}
                </p>


                <button
                    type="button"
                    id="retryOffers"
                    class="filter-btn active"
                    style="margin-top:15px;"
                >

                    Try Again

                </button>

            </div>

        `;


        const retry =
            document.getElementById(
                "retryOffers"
            );


        if (retry) {

            retry.addEventListener(
                "click",
                loadOffers
            );

        }

    }


    // =====================================================
    // OFFER TYPE LABEL
    // =====================================================

    function getOfferTypeLabel(
        type,
        discountType
    ) {

        if (
            discountType ===
            "free_delivery"
        ) {

            return "Free Delivery";

        }


        switch (type) {

            case "welcome":

                return "New User";


            case "restaurant":

                return "Restaurant";


            case "free_delivery":

                return "Free Delivery";


            default:

                return "Special Deal";

        }

    }


    // =====================================================
    // OFFER TYPE ICON
    // =====================================================

    function getOfferTypeIcon(
        type,
        discountType
    ) {

        if (
            discountType ===
            "free_delivery"
        ) {

            return "fa-solid fa-truck-fast";

        }


        switch (type) {

            case "welcome":

                return "fa-solid fa-gift";


            case "restaurant":

                return "fa-solid fa-store";


            default:

                return "fa-solid fa-percent";

        }

    }


    // =====================================================
    // EXPIRY FORMAT
    // =====================================================

    function formatExpiry(
        date
    ) {

        if (!date) {

            return "Limited time";

        }


        const end =
            new Date(date);


        if (
            Number.isNaN(
                end.getTime()
            )
        ) {

            return "Limited time";

        }


        const now =
            new Date();


        const difference =
            end.getTime() -
            now.getTime();


        if (
            difference <= 0
        ) {

            return "Expired";

        }


        const days =
            Math.ceil(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        if (days === 1) {

            return "Ends tomorrow";

        }


        if (days <= 7) {

            return `Ends in ${days} days`;

        }


        return `Valid till ${end.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        )}`;

    }


    // =====================================================
    // NUMBER FORMAT
    // =====================================================

    function formatNumber(
        number
    ) {

        const value =
            Number(number);


        if (
            !Number.isFinite(value)
        ) {

            return "0";

        }


        return Number.isInteger(value)
            ? String(value)
            : value.toFixed(2);

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(
        value
    ) {

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

});