document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = id => document.getElementById(id);


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchInput = $("searchInput");
    const searchBtn = $("searchBtn");
    const clearBtn = $("clearSearchBtn");

    const foodBox = $("foodContainer");
    const categoryBox = $("categoryContainer");

    const searchSection = $("searchResultsSection");
    const searchFoodBox = $("searchFoodContainer");


    /* =====================================================
       GLOBAL DATA
    ===================================================== */

    let allFoods = [];

    let loggedIn = false;


    /* =====================================================
       AUTH
    ===================================================== */

    async function checkAuth() {

        try {

            const response =
                await fetch(
                    "/check-auth",
                    {
                        credentials: "include",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                loggedIn = false;

                await updateCartCount();

                return;

            }


            const data =
                await response.json();


            loggedIn =
                data.loggedIn === true;


            console.log(
                "AUTH:",
                data
            );


            await updateCartCount();

        }
        catch (error) {

            console.error(
                "AUTH ERROR:",
                error
            );


            loggedIn = false;


            await updateCartCount();

        }

    }


    /* =====================================================
       LOAD MENU DATA
    ===================================================== */

    async function loadFoods() {

        try {

            const response =
                await fetch(
                    "/api/menu",
                    {
                        credentials: "include",
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Menu API failed"
                );

            }


            const data =
                await response.json();


            console.log(
                "MENU DATA:",
                data
            );


            if (
                data.success !== true
            ) {

                throw new Error(
                    data.message ||
                    "Menu data failed"
                );

            }


            allFoods =
                uniqueFoods(
                    data.foods || []
                );


            console.log(
                "ALL FOODS:",
                allFoods
            );


            /* ---------------------------------------------
               FOOD COUNT
            --------------------------------------------- */

            if ($("foodCount")) {

                $("foodCount").textContent =
                    allFoods.length;

            }


            /* ---------------------------------------------
               CATEGORIES
            --------------------------------------------- */

            createCategories();


            /* ---------------------------------------------
               POPULAR FOOD
            --------------------------------------------- */

            renderFoods(
                allFoods.slice(0, 6),
                foodBox
            );

        }
        catch (error) {

            console.error(
                "FOOD LOAD ERROR:",
                error
            );


            if (foodBox) {

                foodBox.innerHTML = `
                    <div class="empty-message">
                        🍽️ Unable to load food.
                    </div>
                `;

            }

        }

    }


    /* =====================================================
       UNIQUE FOODS
    ===================================================== */

    function uniqueFoods(list) {

        const map =
            new Map();


        list.forEach(food => {

            if (!food) {

                return;

            }


            const id =
                food.id ??
                food.food_id;


            if (
                id === undefined ||
                id === null
            ) {

                return;

            }


            const key =
                String(id);


            if (!map.has(key)) {

                map.set(
                    key,
                    food
                );

            }

        });


        return [
            ...map.values()
        ];

    }


    /* =====================================================
       CREATE CATEGORIES
    ===================================================== */

    function createCategories() {

        if (!categoryBox) {

            return;

        }


        const categories =
            [
                ...new Set(
                    allFoods
                        .map(food =>
                            String(
                                food.category || ""
                            ).trim()
                        )
                        .filter(Boolean)
                )
            ]
            .sort();


        categoryBox.innerHTML =
            "";


        categories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "category-card";


                button.dataset.category =
                    category;


                button.innerHTML = `

                    <div class="category-icon">
                        ${getCategoryIcon(category)}
                    </div>

                    <h3>
                        ${escapeHTML(category)}
                    </h3>

                    <span>
                        Explore food
                    </span>

                `;


                button.addEventListener(
                    "click",
                    () => {

                        if (searchInput) {

                            searchInput.value =
                                category;

                        }


                        showCategoryResults(
                            category
                        );

                    }
                );


                categoryBox.appendChild(
                    button
                );

            }
        );

    }


    /* =====================================================
       CATEGORY RESULTS
    ===================================================== */

    function showCategoryResults(
        category
    ) {

        const value =
            String(category)
                .trim()
                .toLowerCase();


        const foods =
            allFoods.filter(food => {

                return String(
                    food.category || ""
                )
                .trim()
                .toLowerCase()
                === value;

            });


        if (searchSection) {

            searchSection.style.display =
                "block";

        }


        if ($("searchResultsTitle")) {

            $("searchResultsTitle")
                .textContent =
                `${category} Food`;

        }


        if ($("searchResultsSubtitle")) {

            $("searchResultsSubtitle")
                .textContent =
                `${foods.length} ${
                    foods.length === 1
                        ? "food item"
                        : "food items"
                } found`;

        }


        renderFoods(
            foods,
            searchFoodBox
        );


        if (searchSection) {

            searchSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }


    /* =====================================================
       RENDER FOODS
    ===================================================== */

    function renderFoods(
        list,
        box
    ) {

        if (!box) {

            return;

        }


        if (!list.length) {

            box.innerHTML = `
                <div class="empty-message">
                    🍽️ No food available
                </div>
            `;

            return;

        }


        box.innerHTML =
            list.map(food => {

                const id =
                    food.id ??
                    food.food_id;


                const name =
                    food.name ??
                    "Food";


                const description =
                    food.description ??
                    "Delicious food";


                const category =
                    food.category ??
                    "Food";


                const price =
                    food.price ??
                    0;


                const image =
                    food.image ??
                    "";


                return `

                    <div class="deal-card">

                        <div class="deal-image">

                            <img
                                src="${getImage(image)}"
                                alt="${escapeHTML(name)}"

                                onerror="
                                    this.onerror=null;
                                    this.src='/images/foods/default-food.jpg';
                                "
                            >

                            <span class="offer">
                                AVAILABLE
                            </span>

                        </div>


                        <div class="deal-info">

                            <h3>
                                ${escapeHTML(name)}
                            </h3>


                            <p>
                                ${escapeHTML(description)}
                            </p>


                            <p>
                                ${escapeHTML(category)}
                            </p>


                            <div class="price-row">

                                <strong>
                                    ₹${escapeHTML(price)}
                                </strong>


                                <button
                                    type="button"
                                    class="order-btn"

                                    data-food-id="${escapeAttr(id)}"

                                    data-food-name="${escapeAttr(name)}"
                                >

                                    Add to Cart

                                </button>

                            </div>

                        </div>

                    </div>

                `;

            })
            .join("");


        /* ---------------------------------------------
           ADD TO CART BUTTONS
        --------------------------------------------- */

        box
            .querySelectorAll(
                ".order-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        addToCart(
                            button.dataset.foodId,
                            button.dataset.foodName
                        );

                    }
                );

            });

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    async function addToCart(
        foodId,
        foodName
    ) {

        /* ---------------------------------------------
           FOOD ID CHECK
        --------------------------------------------- */

        if (
            foodId === undefined ||
            foodId === null ||
            String(foodId).trim() === ""
        ) {

            showPopup(
                "❌ Food ID missing",
                "error"
            );

            return;

        }


        /* ---------------------------------------------
           LOGIN CHECK
        --------------------------------------------- */

        if (!loggedIn) {

            showPopup(
                "🔐 Please login first",
                "error"
            );

            return;

        }


        try {

            /* -----------------------------------------
               ADD CART REQUEST
            ----------------------------------------- */

            const response =
                await fetch(
                    "/cart/add",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            foodId:
                                Number(foodId),

                            quantity: 1

                        })

                    }
                );


            /* -----------------------------------------
               RESPONSE
            ----------------------------------------- */

            const data =
                await response.json();


            console.log(
                "ADD CART RESPONSE:",
                data
            );


            /* -----------------------------------------
               LOGIN REQUIRED / SESSION EXPIRED
            ----------------------------------------- */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                loggedIn =
                    false;


                showPopup(
                    "🔐 Please login first",
                    "error"
                );


                await updateCartCount();


                return;

            }


            /* -----------------------------------------
               OTHER API ERROR
            ----------------------------------------- */

            if (
                !response.ok ||
                data.success !== true
            ) {

                throw new Error(
                    data.message ||
                    "Unable to add item"
                );

            }


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            showPopup(
                `✅ ${foodName} added to cart`,
                "success"
            );


            /* -----------------------------------------
               UPDATE UNIQUE CART COUNT
            ----------------------------------------- */

            await updateCartCount();


            /* -----------------------------------------
               CART UPDATED EVENT
            ----------------------------------------- */

            document.dispatchEvent(
                new CustomEvent(
                    "cartUpdated"
                )
            );

        }
        catch (error) {

            console.error(
                "ADD CART ERROR:",
                error
            );


            showPopup(
                "❌ " +
                (
                    error.message ||
                    "Unable to add item"
                ),
                "error"
            );

        }

    }


    /* =====================================================
       CART COUNT
       
       IMPORTANT:
       Quantity COUNT nahi hogi.

       Pizza × 5
       Burger × 3

       = 2 items
    ===================================================== */

    async function updateCartCount() {

        /* ---------------------------------------------
           NOT LOGGED IN
        --------------------------------------------- */

        if (!loggedIn) {

            if ($("cartCount")) {

                $("cartCount").textContent =
                    "0 items";

            }


            if ($("headerCartCount")) {

                $("headerCartCount").textContent =
                    "0";

            }


            if ($("mobileCartCount")) {

                $("mobileCartCount").textContent =
                    "0";

            }


            return;

        }


        try {

            /* -----------------------------------------
               GET CART
            ----------------------------------------- */

            const response =
                await fetch(
                    "/cart",
                    {
                        credentials: "include",
                        cache: "no-store"
                    }
                );


            /* -----------------------------------------
               SESSION EXPIRED
            ----------------------------------------- */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                loggedIn =
                    false;


                if ($("cartCount")) {

                    $("cartCount").textContent =
                        "0 items";

                }


                if ($("headerCartCount")) {

                    $("headerCartCount").textContent =
                        "0";

                }


                if ($("mobileCartCount")) {

                    $("mobileCartCount").textContent =
                        "0";

                }


                return;

            }


            if (!response.ok) {

                return;

            }


            const data =
                await response.json();


            const cart =
                Array.isArray(data.cart)
                    ? data.cart
                    : [];


            /* -----------------------------------------
               UNIQUE ITEMS
               
               Quantity ko ignore karo.
            ----------------------------------------- */

            const uniqueItems =
                new Set();


            cart.forEach(item => {

                if (!item) {

                    return;

                }


                /*
                 * Food ID ko priority do.
                 */

                let foodKey =
                    item.food_id ??
                    item.foodId ??
                    item.menu_item_id ??
                    item.menuItemId ??
                    item.food?.id ??
                    item.menu_item?.id ??
                    item.menuItem?.id;


                /*
                 * Food ID available nahi hai
                 * to food name use karo.
                 */

                if (
                    foodKey === undefined ||
                    foodKey === null ||
                    String(foodKey).trim() === ""
                ) {

                    foodKey =
                        item.food_name ??
                        item.foodName ??
                        item.name ??
                        item.food?.name ??
                        item.menu_item?.name ??
                        item.menuItem?.name;

                }


                /*
                 * UNIQUE KEY ADD
                 */

                if (
                    foodKey !== undefined &&
                    foodKey !== null &&
                    String(foodKey).trim() !== ""
                ) {

                    uniqueItems.add(
                        String(foodKey)
                            .trim()
                            .toLowerCase()
                    );

                }

            });


            /* -----------------------------------------
               FINAL COUNT
            ----------------------------------------- */

            const count =
                uniqueItems.size;


            console.log(
                "CART DATA:",
                cart
            );


            console.log(
                "UNIQUE CART ITEMS:",
                [...uniqueItems]
            );


            console.log(
                "UNIQUE CART COUNT:",
                count
            );


            /* -----------------------------------------
               BOTTOM CART
            ----------------------------------------- */

            if ($("cartCount")) {

                $("cartCount")
                    .textContent =
                    `${count} ${
                        count === 1
                            ? "item"
                            : "items"
                    }`;

            }


            /* -----------------------------------------
               HEADER CART
            ----------------------------------------- */

            if ($("headerCartCount")) {

                $("headerCartCount")
                    .textContent =
                    count;

            }


            /* -----------------------------------------
               MOBILE CART
            ----------------------------------------- */

            if ($("mobileCartCount")) {

                $("mobileCartCount")
                    .textContent =
                    count;

            }

        }
        catch (error) {

            console.error(
                "CART COUNT ERROR:",
                error
            );

        }

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function search(
        query
    ) {

        query =
            String(query || "")
                .trim()
                .toLowerCase();


        if (!query) {

            clearSearch();

            return;

        }


        const foods =
            allFoods.filter(food => {

                const text = [

                    food.name,

                    food.description,

                    food.category

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return text.includes(
                    query
                );

            });


        if (searchSection) {

            searchSection.style.display =
                "block";

        }


        if ($("searchResultsTitle")) {

            $("searchResultsTitle")
                .textContent =
                `Results for "${query}"`;

        }


        if ($("searchResultsSubtitle")) {

            $("searchResultsSubtitle")
                .textContent =
                `${foods.length} ${
                    foods.length === 1
                        ? "food item"
                        : "food items"
                } found`;

        }


        renderFoods(
            foods,
            searchFoodBox
        );


        if (searchSection) {

            searchSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }


    /* =====================================================
       SEARCH BUTTON
    ===================================================== */

    searchBtn?.addEventListener(
        "click",
        () => {

            search(
                searchInput?.value
            );

        }
    );


    /* =====================================================
       ENTER SEARCH
    ===================================================== */

    searchInput?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();


                search(
                    searchInput.value
                );

            }

        }
    );


    /* =====================================================
       QUICK SEARCH
    ===================================================== */

    document
        .querySelectorAll(
            ".quick-search button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const query =
                        button.dataset.search ||
                        "";


                    if (searchInput) {

                        searchInput.value =
                            query;

                    }


                    search(
                        query
                    );

                }
            );

        });


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    clearBtn?.addEventListener(
        "click",
        clearSearch
    );


    function clearSearch() {

        if (searchInput) {

            searchInput.value =
                "";

        }


        if (searchSection) {

            searchSection.style.display =
                "none";

        }


        if (searchFoodBox) {

            searchFoodBox.innerHTML =
                "";

        }

    }


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    function getImage(
        image
    ) {

        if (!image) {

            return "/images/foods/default-food.jpg";

        }


        const value =
            String(image).trim();


        if (
            value.startsWith(
                "http://"
            ) ||
            value.startsWith(
                "https://"
            )
        ) {

            return value;

        }


        if (
            value.startsWith(
                "/"
            )
        ) {

            return value;

        }


        if (
            value.startsWith(
                "images/"
            )
        ) {

            return "/" + value;

        }


        return (
            "/images/foods/" +
            value.split("/").pop()
        );

    }


    /* =====================================================
       POPUP
    ===================================================== */

    function showPopup(
        message,
        type = "success"
    ) {

        document
            .querySelector(
                ".jigato-popup"
            )
            ?.remove();


        const popup =
            document.createElement(
                "div"
            );


        popup.className =
            `jigato-popup ${type}`;


        popup.innerHTML = `

            <div class="popup-icon">

                ${
                    type === "success"
                        ? "✓"
                        : "!"
                }

            </div>


            <div class="popup-message">

                ${escapeHTML(message)}

            </div>

        `;


        document.body.appendChild(
            popup
        );


        setTimeout(
            () => {

                popup.classList.add(
                    "hide"
                );


                setTimeout(
                    () => popup.remove(),
                    300
                );

            },
            2500
        );

    }


    /* =====================================================
       CATEGORY ICON
    ===================================================== */

    function getCategoryIcon(
        name
    ) {

        const value =
            String(name || "")
                .toLowerCase();


        if (
            value.includes("pizza")
        ) {

            return "🍕";

        }


        if (
            value.includes("burger")
        ) {

            return "🍔";

        }


        if (
            value.includes("biryani")
        ) {

            return "🍛";

        }


        if (
            value.includes("chinese")
        ) {

            return "🍜";

        }


        if (
            value.includes("pasta")
        ) {

            return "🍝";

        }


        if (
            value.includes("drink") ||
            value.includes("beverage")
        ) {

            return "🥤";

        }


        if (
            value.includes("dessert") ||
            value.includes("sweet")
        ) {

            return "🍰";

        }


        if (
            value.includes("snack")
        ) {

            return "🍟";

        }


        if (
            value.includes("wrap")
        ) {

            return "🌯";

        }


        return "🍽️";

    }


    /* =====================================================
       SAFE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


    /* =====================================================
       SAFE ATTRIBUTE
    ===================================================== */

    function escapeAttr(
        value
    ) {

        return escapeHTML(
            value
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    await checkAuth();

    await loadFoods();

});