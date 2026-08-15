document.addEventListener("DOMContentLoaded", async () => {

    const $ = id => document.getElementById(id);

    const searchInput = $("searchInput");
    const searchBtn = $("searchBtn");
    const clearBtn = $("clearSearchBtn");

    const foodBox = $("foodContainer");
    const topBox = $("topRatedContainer");
    const recentBox = $("recentContainer");
    const categoryBox = $("categoryContainer");

    const searchSection = $("searchResultsSection");
    const searchRestaurantBox = $("searchRestaurantContainer");
    const searchFoodBox = $("searchFoodContainer");

    let home = {};
    let loggedIn = false;


    /* =====================================================
       AUTH
    ===================================================== */

    async function auth() {

        try {

            const res = await fetch(
                "/check-auth",
                {
                    credentials: "include"
                }
            );

            const user = await res.json();

            loggedIn =
                user.loggedIn === true;


            if (loggedIn) {

                if ($("loginBtn"))
                    $("loginBtn").style.display =
                        "none";


                if ($("registerBtn"))
                    $("registerBtn").style.display =
                        "none";


                if ($("profileName")) {

                    $("profileName").style.display =
                        "inline-flex";

                    $("profileName").textContent =
                        "👤 " +
                        (
                            user.name ||
                            "User"
                        );

                }


                if ($("logoutBtn"))
                    $("logoutBtn").style.display =
                        "inline-flex";


                /*
                 * Login ke baad database cart
                 * ka actual count lao.
                 */

                await updateCartCount();

            } else {

                if ($("cartCount"))
                    $("cartCount").textContent =
                        "0 items";

            }

        } catch (err) {

            console.error(
                "AUTH ERROR:",
                err
            );

        }

    }


    /* =====================================================
       HOME
    ===================================================== */

    async function loadHome() {

        try {

            const res = await fetch(
                "/api/home",
                {
                    credentials: "include"
                }
            );


            const data =
                await res.json();


            console.log(
                "HOME DATA:",
                data
            );


            if (!data.success)
                throw new Error(
                    data.message ||
                    "Home API error"
                );


            home = data;


            /*
             * FOOD
             *
             * Duplicate remove
             * Maximum 6
             */

            const foods =
                uniqueById(
                    data.foods || []
                ).slice(0, 6);


            renderFoods(
                foods,
                foodBox
            );


            /*
             * TOP RESTAURANTS
             */

            const restaurants =
                uniqueById(
                    data.topRated || []
                ).slice(0, 6);


            renderRestaurants(
                restaurants,
                topBox
            );


            /*
             * RECENT RESTAURANTS
             */

            const recent =
                uniqueById(
                    data.recent || []
                ).slice(0, 6);


            renderRecent(
                recent
            );


            /*
             * CATEGORIES
             */

            renderCategories(
                data.categories || []
            );


            /*
             * RESTAURANT COUNT
             */

            if ($("restaurantCount")) {

                $("restaurantCount")
                    .textContent =
                    data.restaurantCount ??
                    data.totalRestaurants ??
                    restaurants.length;

            }


            /*
             * FOOD COUNT
             */

            if ($("foodCount")) {

                $("foodCount")
                    .textContent =
                    data.foodCount ??
                    foods.length;

            }

        } catch (err) {

            console.error(
                "HOME ERROR:",
                err
            );

        }

    }


    /* =====================================================
       UNIQUE
    ===================================================== */

    function uniqueById(list) {

        const map = new Map();


        list.forEach(item => {

            if (!item)
                return;


            const id =
                item.id ??
                item.food_id ??
                item.restaurant_id;


            if (
                id !== undefined &&
                id !== null &&
                !map.has(String(id))
            ) {

                map.set(
                    String(id),
                    item
                );

            }

        });


        return [
            ...map.values()
        ];

    }


    /* =====================================================
       FOOD
    ===================================================== */

    function renderFoods(
        list,
        box
    ) {

        if (!box)
            return;


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

                const foodId =
                    food.id ??
                    food.food_id;


                const foodName =
                    food.name ??
                    food.food_name ??
                    "Food";


                const price =
                    food.price ??
                    food.food_price ??
                    0;


                const restaurant =
                    food.restaurant_name ||
                    food.restaurant ||
                    "Restaurant";


                const rating =
                    food.restaurant_rating ??
                    food.rating ??
                    0;


                const delivery =
                    food.delivery_time ||
                    "N/A";


                return `

                    <div class="deal-card">

                        <div class="deal-image">

                            <img
                                src="${imgPath(
                                    food.image,
                                    "food"
                                )}"
                                alt="${safe(foodName)}"
                                onerror="fixImage(
                                    this,
                                    '${safeAttr(food.image)}',
                                    'food'
                                )"
                            >

                            <span class="offer">
                                AVAILABLE
                            </span>

                        </div>


                        <div class="deal-info">

                            <h3>
                                ${safe(foodName)}
                            </h3>


                            <p>
                                🏪
                                ${safe(restaurant)}
                            </p>


                            <p>
                                ⭐ ${rating}
                                •
                                🛵 ${safe(delivery)}
                            </p>


                            <div class="price-row">

                                <strong>
                                    ₹${price}
                                </strong>


                                <button
                                    class="order-btn"
                                    data-id="${foodId}"
                                    data-name="${safeAttr(foodName)}"
                                    type="button"
                                >
                                    Add to Cart
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");


        /*
         * Add to Cart buttons
         */

        box
            .querySelectorAll(".order-btn")
            .forEach(btn => {

                btn.onclick = () => {

                    addCart(
                        btn.dataset.id,
                        btn.dataset.name
                    );

                };

            });

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    async function addCart(
        foodId,
        foodName
    ) {

        /*
         * LOGIN CHECK
         */

        if (!loggedIn) {

            showPopup(
                "🔐 Please login first",
                "error"
            );

            return;

        }


        /*
         * Food ID check
         */

        if (!foodId) {

            showPopup(
                "❌ Food ID missing",
                "error"
            );

            return;

        }


        try {

            const res =
                await fetch(
                    "/cart/add",
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            foodId:
                                foodId

                        })

                    }
                );


            const data =
                await res.json();


            console.log(
                "ADD CART:",
                data
            );


            /*
             * ERROR
             */

            if (
                !res.ok ||
                data.success !== true
            ) {

                showPopup(
                    "❌ " +
                    (
                        data.message ||
                        "Unable to add item"
                    ),
                    "error"
                );

                return;

            }


            /*
             * SUCCESS
             */

            showPopup(
                "✅ Item added successfully",
                "success"
            );


            /*
             * Refresh actual DB cart
             */

            await updateCartCount();


        } catch (err) {

            console.error(
                "ADD CART ERROR:",
                err
            );


            showPopup(
                "❌ Something went wrong",
                "error"
            );

        }

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    async function updateCartCount() {

        if (!loggedIn) {

            if ($("cartCount"))
                $("cartCount").textContent =
                    "0 items";

            return;

        }


        try {

            const res =
                await fetch(
                    "/cart",
                    {
                        credentials:
                            "include"
                    }
                );


            const data =
                await res.json();


            console.log(
                "DATABASE CART:",
                data
            );


            if (
                !res.ok ||
                !data.success
            ) {

                return;

            }


            const cart =
                mergeCart(
                    data.cart || []
                );


            /*
             * Quantity total
             *
             * Pizza x5
             * => 5 items
             */

            const count =
                cart.reduce(
                    (
                        total,
                        item
                    ) => {

                        return (
                            total +
                            Number(
                                item.quantity ||
                                0
                            )
                        );

                    },
                    0
                );


            if ($("cartCount")) {

                $("cartCount")
                    .textContent =
                    `${count} ${
                        count === 1
                            ? "item"
                            : "items"
                    }`;

            }

        } catch (err) {

            console.error(
                "CART COUNT ERROR:",
                err
            );

        }

    }


    /*
     * Same food ki multiple rows
     * ko merge karta hai.
     */

    function mergeCart(cart) {

        const map =
            new Map();


        cart.forEach(item => {

            const id =
                item.food_id ??
                item.foodId ??
                item.id;


            const key =
                String(id);


            const quantity =
                Number(
                    item.quantity || 0
                );


            if (!map.has(key)) {

                map.set(
                    key,
                    {
                        ...item,
                        quantity:
                            quantity
                    }
                );

            } else {

                map.get(key).quantity +=
                    quantity;

            }

        });


        return [
            ...map.values()
        ];

    }


    /* =====================================================
       RESTAURANTS
    ===================================================== */

    function renderRestaurants(
        list,
        box
    ) {

        if (!box)
            return;


        if (!list.length) {

            box.innerHTML = `
                <div class="empty-message">
                    🍽️ No restaurants available
                </div>
            `;

            return;

        }


        box.innerHTML =
            list.map(r => {

                const name =
                    r.name ??
                    r.restaurant_name ??
                    "Restaurant";


                return `

                    <div class="restaurant-card">

                        <div class="restaurant-image">

                            <img
                                src="${imgPath(
                                    r.image,
                                    "restaurant"
                                )}"
                                alt="${safe(name)}"
                                onerror="fixImage(
                                    this,
                                    '${safeAttr(r.image)}',
                                    'restaurant'
                                )"
                            >


                            <span class="open-badge">

                                ${
                                    Number(
                                        r.is_open
                                    ) === 1
                                        ? "OPEN"
                                        : "CLOSED"
                                }

                            </span>

                        </div>


                        <div class="restaurant-info">

                            <h3>
                                ${safe(name)}
                            </h3>


                            <p>
                                ${safe(
                                    r.category ||
                                    "Restaurant"
                                )}

                                •

                                ${safe(
                                    r.city ||
                                    ""
                                )}
                            </p>


                            <div class="restaurant-meta">

                                <span>
                                    ⭐
                                    ${r.rating || "0"}
                                </span>


                                <span>
                                    🛵
                                    ${safe(
                                        r.delivery_time ||
                                        "N/A"
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       RECENT
    ===================================================== */

    function renderRecent(list) {

        if (!recentBox)
            return;


        if (!list.length) {

            recentBox.innerHTML =
                `<p>No restaurants available.</p>`;

            return;

        }


        recentBox.innerHTML =
            list.map(r => {

                const name =
                    r.name ??
                    r.restaurant_name ??
                    "Restaurant";


                return `

                    <div class="new-card">

                        <img
                            src="${imgPath(
                                r.image,
                                "restaurant"
                            )}"
                            alt="${safe(name)}"
                            onerror="fixImage(
                                this,
                                '${safeAttr(r.image)}',
                                'restaurant'
                            )"
                        >


                        <div>

                            <span class="new-badge">
                                NEW
                            </span>


                            <h3>
                                ${safe(name)}
                            </h3>


                            <p>
                                ${safe(
                                    r.category ||
                                    "Restaurant"
                                )}
                            </p>


                            <span>
                                ⭐
                                ${r.rating || "0"}
                            </span>

                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       CATEGORIES
    ===================================================== */

    function renderCategories(list) {

        if (!categoryBox)
            return;


        categoryBox.innerHTML =
            list.map(c => {

                const name =
                    c.category ||
                    c.name ||
                    "";


                return `

                    <button
                        type="button"
                        class="category-card"
                        data-category="${safeAttr(name)}"
                    >

                        <div class="category-icon">
                            ${icon(name)}
                        </div>


                        <h3>
                            ${safe(name)}
                        </h3>


                        <span>
                            Explore food
                        </span>

                    </button>

                `;

            }).join("");


        categoryBox
            .querySelectorAll(
                ".category-card"
            )
            .forEach(btn => {

                btn.onclick = () => {

                    if (searchInput)
                        searchInput.value =
                            btn.dataset.category;


                    search(
                        btn.dataset.category
                    );

                };

            });

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    async function search(q) {

        q =
            String(q || "")
                .trim();


        if (!q) {

            clearSearch();

            return;

        }


        try {

            if (searchSection)
                searchSection.style.display =
                    "block";


            const res =
                await fetch(
                    "/api/home/search?q=" +
                    encodeURIComponent(q),
                    {
                        credentials:
                            "include"
                    }
                );


            const data =
                await res.json();


            console.log(
                "SEARCH DATA:",
                data
            );


            /*
             * Restaurant duplicate remove
             */

            const restaurants =
                uniqueById(
                    data.restaurants ||
                    []
                );


            /*
             * Food duplicate remove
             */

            const foods =
                uniqueById(
                    data.foods ||
                    []
                );


            if ($("searchResultsTitle")) {

                $("searchResultsTitle")
                    .textContent =
                    `Results for "${q}"`;

            }


            if ($("searchResultsSubtitle")) {

                $("searchResultsSubtitle")
                    .textContent =
                    `${restaurants.length} restaurants • ${foods.length} food items`;

            }


            /*
             * Restaurants
             */

            renderRestaurants(
                restaurants,
                searchRestaurantBox
            );


            /*
             * Foods
             */

            renderFoods(
                foods,
                searchFoodBox
            );


            searchSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        } catch (err) {

            console.error(
                "SEARCH ERROR:",
                err
            );


            showPopup(
                "❌ Search failed",
                "error"
            );

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
        e => {

            if (e.key === "Enter") {

                e.preventDefault();

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
        .forEach(btn => {

            btn.onclick = () => {

                const q =
                    btn.dataset.search;


                if (searchInput)
                    searchInput.value =
                        q;


                search(q);

            };

        });


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

        if (searchInput)
            searchInput.value =
                "";


        if (searchSection)
            searchSection.style.display =
                "none";


        if (searchRestaurantBox)
            searchRestaurantBox.innerHTML =
                "";


        if (searchFoodBox)
            searchFoodBox.innerHTML =
                "";

    }


    clearBtn?.addEventListener(
        "click",
        clearSearch
    );


    /* =====================================================
       IMAGE
       YE TERE WORKING CODE WALA HAI
    ===================================================== */

    function imgPath(
        value,
        type
    ) {

        if (!value) {

            return type === "food"
                ? "/images/default-food.jpg"
                : "/images/default-restaurant.jpg";

        }


        let v =
            String(value).trim();


        /*
         * Full URL
         */

        if (
            v.startsWith("http://") ||
            v.startsWith("https://")
        ) {

            return v;

        }


        /*
         * Already /images/...
         */

        if (v.startsWith("/")) {

            return v;

        }


        /*
         * images/file.jpg
         */

        if (
            v.startsWith("images/")
        ) {

            return "/" + v;

        }


        /*
         * uploads/file.jpg
         */

        if (
            v.startsWith("uploads/")
        ) {

            return "/" + v;

        }


        /*
         * Normal filename
         */

        return "/images/" + v;

    }


    /*
     * Image fail hone par multiple
     * possible folders try karega.
     */

    window.fixImage =
        function(
            img,
            original,
            type
        ) {

            const name =
                String(
                    original || ""
                )
                .split("/")
                .pop();


            const paths = [

                `/images/${name}`,

                `/uploads/${name}`,

                `/images/foods/${name}`,

                `/images/restaurants/${name}`,

                `/uploads/foods/${name}`,

                `/uploads/restaurants/${name}`

            ];


            let i =
                Number(
                    img.dataset.try ||
                    0
                );


            if (
                i <
                paths.length
            ) {

                img.dataset.try =
                    i + 1;


                img.src =
                    paths[i];


                return;

            }


            img.onerror =
                null;


            img.src =
                type === "food"
                    ? "/images/default-food.jpg"
                    : "/images/default-restaurant.jpg";

        };


    /* =====================================================
       POPUP
    ===================================================== */

    function showPopup(
        message,
        type = "success"
    ) {

        /*
         * Purana popup remove
         */

        document
            .querySelector(
                ".jigato-popup"
            )
            ?.remove();


        const box =
            document.createElement(
                "div"
            );


        box.className =
            `jigato-popup ${type}`;


        box.innerHTML = `

            <div class="popup-icon">

                ${
                    type === "success"
                        ? "✓"
                        : "!"
                }

            </div>


            <div class="popup-message">

                ${safe(message)}

            </div>

        `;


        document.body.appendChild(
            box
        );


        setTimeout(
            () => {

                box.classList.add(
                    "hide"
                );


                setTimeout(
                    () => box.remove(),
                    300
                );

            },
            2500
        );

    }


    /* =====================================================
       ICON
    ===================================================== */

    function icon(name) {

        name =
            String(name || "")
                .toLowerCase();


        if (
            name.includes("pizza")
        )
            return "🍕";


        if (
            name.includes("burger")
        )
            return "🍔";


        if (
            name.includes("biryani")
        )
            return "🍛";


        if (
            name.includes("chinese")
        )
            return "🍜";


        if (
            name.includes("pasta")
        )
            return "🍝";


        if (
            name.includes("cafe")
        )
            return "☕";


        if (
            name.includes("dessert")
        )
            return "🍰";


        return "🍽️";

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function safe(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


    function safeAttr(value) {

        return safe(value)
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
       LOGOUT
    ===================================================== */

    $("logoutBtn")?.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/logout",
                    {
                        method: "POST",
                        credentials:
                            "include"
                    }
                );


                loggedIn =
                    false;


                if ($("cartCount"))
                    $("cartCount")
                        .textContent =
                        "0 items";


                location.reload();


            } catch (err) {

                console.error(
                    "LOGOUT ERROR:",
                    err
                );

            }

        }
    );


    /* =====================================================
       START
    ===================================================== */

    await auth();

    await loadHome();

});
document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    /* ================= AUTH ================= */

    fetch("/check-auth")
        .then(res => res.json())
        .then(data => {

            const logged = data.loggedIn;

            $("loginBtn").style.display =
                logged ? "none" : "inline-flex";

            $("registerBtn").style.display =
                logged ? "none" : "inline-flex";

            $("profileBtn").style.display =
                logged ? "flex" : "none";

            $("logoutBtn").style.display =
                logged ? "inline-flex" : "none";

            $("mobileLogin").style.display =
                logged ? "none" : "block";

            $("mobileRegister").style.display =
                logged ? "none" : "block";

            $("mobileProfile").style.display =
                logged ? "flex" : "none";

            $("mobileLogout").style.display =
                logged ? "block" : "none";

            if (logged) {

                const name = data.name || "Profile";
                const city = data.city || "Choose location";

                $("profileName").textContent = name;
                $("mobileProfileName").textContent = name;

                $("userCity").textContent = city;
                $("mobileCity").textContent = city;
            }

            loadCart();

        })
        .catch(err =>
            console.log("Auth error:", err)
        );


    /* ================= LOGOUT ================= */

    $("logoutBtn").onclick = logout;
    $("mobileLogout").onclick = logout;

    function logout() {

        fetch("/logout", {
            method: "POST",
            credentials: "include"
        })
        .then(() => location.reload());

    }


    /* ================= MOBILE MENU ================= */

    $("menuToggle").onclick = () =>
        $("mobileMenu").classList.add("active");

    $("closeMenu").onclick = () =>
        $("mobileMenu").classList.remove("active");


    /* ================= SEARCH ================= */

    const search = () => {

        const q = $("searchInput").value.trim();

        if (!q) return;

        window.location.href =
            "/restaurant?search=" +
            encodeURIComponent(q);

    };

    $("searchBtn").onclick = search;

    $("searchInput").addEventListener(
        "keydown",
        e => {
            if (e.key === "Enter") search();
        }
    );


    /* ================= CLEAR SEARCH ================= */

    const clear = $("clearSearchBtn");

    if (clear) {

        clear.onclick = () => {

            $("searchInput").value = "";

            $("searchResultsSection").style.display =
                "none";

        };

    }


    /* ================= QUICK SEARCH ================= */

    document
        .querySelectorAll("[data-search]")
        .forEach(btn => {

            btn.onclick = () => {

                $("searchInput").value =
                    btn.dataset.search;

                search();

            };

        });


    /* ================= CART COUNT ================= */

    function loadCart() {

        fetch("/cart", {
            credentials: "include"
        })
        .then(res => {

            if (!res.ok)
                throw new Error("Not logged");

            return res.json();

        })
        .then(data => {

            const items = data.cart || [];

            /*
             * Same food ko 5 baar + kiya ho,
             * count 5 nahi — unique cart items count.
             */

            const count = items.length;

            $("cartCount").textContent =
                count + (count === 1 ? " item" : " items");

            $("navCartCount").textContent = count;
            $("mobileCartCount").textContent = count;

        })
        .catch(() => {

            $("cartCount").textContent = "0 items";
            $("navCartCount").textContent = "0";
            $("mobileCartCount").textContent = "0";

        });

    }

});