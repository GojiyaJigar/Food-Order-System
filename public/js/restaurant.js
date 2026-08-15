document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    const box = $("restaurantContainer");
    const search = $("searchRestaurant");
    const empty = $("emptyState");
    const result = $("resultText");
    const sort = $("sortRestaurant");

    let restaurants = [];
    let activeFilter = "all";


    /* ================= IMAGE ================= */

    function restaurantImage(image) {

        if (!image)
            return "/images/restaurants/mc.jpg";

        image = String(image).trim();

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/images/"))
            return image;

        if (image.startsWith("images/"))
            return "/" + image;

        const file =
            image.split("/").pop();

        return `/images/restaurants/${file}`;

    }


    function imageError(img) {

        img.onerror = null;

        img.src =
            "/images/restaurants/mc.jpg";

    }


    /* ================= LOAD ================= */

    async function loadRestaurants() {

        box.innerHTML = `
            <div class="loading-card"></div>
            <div class="loading-card"></div>
            <div class="loading-card"></div>
        `;


        try {

            /*
             * Agar tera restaurant API
             * /api/restaurants hai to ye use hoga.
             */

            let response =
                await fetch("/api/restaurants", {
                    credentials: "include"
                });


            /*
             * Agar API available nahi hai,
             * home API fallback.
             */

            if (!response.ok) {

                response =
                    await fetch("/api/home", {
                        credentials: "include"
                    });

            }


            if (!response.ok)
                throw new Error(
                    "Restaurant API failed"
                );


            const data =
                await response.json();


            console.log(
                "Restaurant Data:",
                data
            );


            /*
             * Different API response formats
             */

            let list = [];


            if (Array.isArray(data)) {

                list = data;

            }

            else if (Array.isArray(data.restaurants)) {

                list = data.restaurants;

            }

            else if (Array.isArray(data.data)) {

                list = data.data;

            }

            else {

                list = [
                    ...(data.topRated || []),
                    ...(data.recent || [])
                ];

            }


            /* REMOVE DUPLICATES */

            const unique =
                new Map();


            list.forEach(item => {

                const id =
                    item.id ||
                    item.restaurant_id ||
                    item.name;


                if (!unique.has(id)) {

                    unique.set(
                        id,
                        item
                    );

                }

            });


            restaurants =
                [...unique.values()];


            console.log(
                "Restaurants:",
                restaurants
            );


            render();

        }
        catch (error) {

            console.error(
                "Restaurant loading error:",
                error
            );


            box.innerHTML = "";

            empty.style.display =
                "block";


            result.textContent =
                "Restaurants could not be loaded.";

        }

    }


    /* ================= RENDER ================= */

    function render() {

        let list =
            [...restaurants];


        const query =
            search.value
                .trim()
                .toLowerCase();


        /* SEARCH */

        if (query) {

            list =
                list.filter(item => {

                    const text = [

                        item.name,
                        item.restaurant_name,
                        item.category,
                        item.cuisine,
                        item.city,
                        item.address

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                    return text.includes(query);

                });

        }


        /* FILTER */

        if (activeFilter !== "all") {

            list =
                list.filter(item => {

                    const text = [

                        item.name,
                        item.restaurant_name,
                        item.category,
                        item.cuisine

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                    return text.includes(
                        activeFilter
                    );

                });

        }


        /* SORT */

        if (sort.value === "rating") {

            list.sort((a, b) => {

                return (
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
                );

            });

        }


        else if (
            sort.value === "delivery"
        ) {

            list.sort((a, b) => {

                return (
                    getTime(a.delivery_time) -
                    getTime(b.delivery_time)
                );

            });

        }


        else if (
            sort.value === "name"
        ) {

            list.sort((a, b) => {

                return String(
                    a.name ||
                    a.restaurant_name ||
                    ""
                )
                .localeCompare(
                    String(
                        b.name ||
                        b.restaurant_name ||
                        ""
                    )
                );

            });

        }


        /* EMPTY */

        if (!list.length) {

            box.innerHTML = "";

            empty.style.display =
                "block";

            result.textContent =
                "No restaurants found.";

            return;

        }


        empty.style.display =
            "none";


        result.textContent =
            `${list.length} restaurant${
                list.length > 1
                    ? "s"
                    : ""
            } available`;


        box.innerHTML =
            list.map(card).join("");

    }


    /* ================= CARD ================= */

    function card(r) {

        const id =
            r.id ||
            r.restaurant_id;


        const name =
            r.name ||
            r.restaurant_name ||
            "Restaurant";


        const image =
            restaurantImage(
                r.image ||
                r.image_url ||
                r.restaurant_image
            );


        const rating =
            r.rating || "4.5";


        const category =
            r.category ||
            r.cuisine ||
            "Multi Cuisine";


        const delivery =
            r.delivery_time ||
            "30 mins";


        const city =
            r.city || "";


        const isOpen =
            Number(r.is_open) === 1;


        return `

        <div class="restaurant-card">


            <div class="restaurant-card-image">

                <img
                    src="${image}"
                    alt="${safe(name)}"
                    onerror="restaurantImageError(this)"
                >


                <span class="restaurant-offer">

                    ${
                        isOpen
                            ? "OPEN NOW"
                            : "POPULAR"
                    }

                </span>


                <button
                    class="restaurant-favourite"
                    type="button"
                    onclick="event.stopPropagation()"
                >
                    ♡
                </button>

            </div>


            <div class="restaurant-card-content">


                <div class="restaurant-name-row">

                    <h3 class="restaurant-name">
                        ${safe(name)}
                    </h3>


                    <span class="restaurant-rating">
                        ⭐ ${safe(rating)}
                    </span>

                </div>


                <p class="restaurant-cuisine">

                    ${safe(category)}

                    ${
                        city
                            ? " • " + safe(city)
                            : ""
                    }

                </p>


                <div class="restaurant-meta">

                    <span>

                        <i class="fa-solid fa-motorcycle"></i>

                        ${safe(delivery)}

                    </span>


                    <span>

                        <i class="fa-solid fa-star"></i>

                        ${safe(rating)}

                    </span>

                </div>


                <div class="restaurant-card-bottom">


                    <span class="open-status">

                        <span class="open-dot"></span>

                        ${
                            isOpen
                                ? "Open now"
                                : "Currently closed"
                        }

                    </span>


                    <button
                        class="view-menu"
                        type="button"
                        onclick="openRestaurant(${Number(id)})"
                    >
                        View Menu
                    </button>

                </div>

            </div>

        </div>

        `;

    }


    /* ================= SEARCH ================= */

    search.addEventListener(
        "input",
        render
    );


    $("searchBtn").addEventListener(
        "click",
        render
    );


    /* ENTER SEARCH */

    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                render();

            }

        }
    );


    /* ================= SORT ================= */

    sort.addEventListener(
        "change",
        render
    );


    /* ================= FILTER ================= */

    document
        .querySelectorAll(
            ".quick-filter"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".quick-filter"
                        )
                        .forEach(btn => {

                            btn.classList
                                .remove(
                                    "active"
                                );

                        });


                    button.classList
                        .add("active");


                    activeFilter =
                        button.dataset.filter ||
                        "all";


                    render();

                }
            );

        });


    /* ================= CLEAR ================= */

    $("clearSearch")
        .addEventListener(
            "click",
            () => {

                search.value = "";

                activeFilter = "all";


                document
                    .querySelectorAll(
                        ".quick-filter"
                    )
                    .forEach(btn => {

                        btn.classList
                            .remove(
                                "active"
                            );

                    });


                const all =
                    document.querySelector(
                        '[data-filter="all"]'
                    );


                if (all)
                    all.classList
                        .add("active");


                render();

            }
        );


    /* ================= OPEN ================= */

    window.openRestaurant =
        function(id) {

            if (!id)
                return;


            window.location.href =
                `/restaurant/${id}`;

        };


    /* ================= HELPERS ================= */

    function getTime(value) {

        if (!value)
            return 999;


        const number =
            parseInt(
                String(value)
                    .replace(/\D/g, "")
            );


        return number || 999;

    }


    function safe(value) {

        return String(value || "")
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


    /* GLOBAL IMAGE ERROR */

    window.restaurantImageError =
        imageError;


    /* START */

    loadRestaurants();

});