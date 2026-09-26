/* =====================================================
   JIGATO - OFFERS PAGE JS
===================================================== */
document.addEventListener(
    "DOMContentLoaded",
    () => {
        const offersGrid =
            document.getElementById(
                "offersGrid"
            );
        const filterButtons =
            document.querySelectorAll(
                ".filter-btn"
            );
        let allOffers = [];
        let currentFilter = "all";
        /* =================================================
           LOAD
        ================================================= */
        loadOffers();
        async function loadOffers() {
            if (!offersGrid)
                return;
            showLoading();
            try {
                const response =
                    await fetch(
                        "/api/offers",
                        {
                            method: "GET",
                            credentials:
                                "include",
                            cache:
                                "no-store",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );
                const raw =
                    await response.text();
                let data;
                try {
                    data =
                        JSON.parse(raw);
                }
                catch (error) {
                    throw new Error(
                        "Server returned invalid offers data."
                    );
                }
                if (
                    !response.ok ||
                    data.success !== true
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
            }
            catch (error) {
                showError(
                    error.message ||
                    "Unable to load offers."
                );
            }
        }
        /* =================================================
           FILTER
        ================================================= */
        filterButtons.forEach(
            button => {
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
                    }
                );
            }
        );
    }
);