document.addEventListener("DOMContentLoaded", () => {

    const foodContainer =
        document.getElementById("foodContainer");

    const emptyFood =
        document.getElementById("emptyFood");

    const searchFood =
        document.getElementById("searchFood");

    const categorySection =
        document.getElementById("categorySection");


    let foods = [];

    let activeCategory = "All";


    /* =====================================================
       HELPERS
    ===================================================== */

    function safe(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getFoodId(food) {

        return (
            food.id ??
            food.food_id ??
            food.item_id ??
            food.foodId ??
            food.foodID
        );

    }


    function getImage(image) {

        if (!image) {
            return "/images/foods/default-food.jpg";
        }


        image = String(image).trim();


        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }


        if (
            image.startsWith("/images/foods/")
        ) {
            return image;
        }


        if (
            image.startsWith("images/foods/")
        ) {
            return "/" + image;
        }


        return (
            "/images/foods/" +
            image.split("/").pop()
        );

    }


    /* =====================================================
       LOAD MENU
    ===================================================== */

    async function loadMenu() {

        foodContainer.innerHTML = `
            <div class="food-loading">
                Loading delicious food...
            </div>
        `;


        try {

            const response =
                await fetch("/api/menu", {
                    credentials: "include",
                    cache: "no-store"
                });


            if (!response.ok) {
                throw new Error(
                    "Menu could not be loaded."
                );
            }


            const data =
                await response.json();


            console.log(
                "MENU API:",
                data
            );


            foods =
                Array.isArray(data.foods)
                    ? data.foods
                    : [];


            createCategories();


            if (!foods.length) {

                showEmpty(
                    "No food available."
                );

                return;
            }


            renderFoods();

        }
        catch (error) {

            console.error(
                "MENU ERROR:",
                error
            );


            showEmpty(
                "Unable to load menu."
            );

        }

    }


    /* =====================================================
       CREATE CATEGORIES
    ===================================================== */

    function createCategories() {

        if (!categorySection)
            return;


        const categories =
            [
                ...new Set(
                    foods
                        .map(food =>
                            String(
                                food.category || ""
                            ).trim()
                        )
                        .filter(Boolean)
                )
            ]
            .sort();


        categorySection.innerHTML = `

            <button
                class="category-btn active"
                data-category="All"
                type="button"
            >
                All
            </button>

        `;


        categories.forEach(category => {

            const button =
                document.createElement("button");


            button.className =
                "category-btn";


            button.type = "button";


            button.dataset.category =
                category;


            button.textContent =
                category;


            categorySection.appendChild(
                button
            );

        });


        bindCategoryButtons();

    }


    /* =====================================================
       RENDER FOODS
    ===================================================== */

    function renderFoods() {

        let list =
            [...foods];


        const query =
            searchFood
                ? searchFood.value
                    .trim()
                    .toLowerCase()
                : "";


        /* SEARCH */

        if (query) {

            list =
                list.filter(food => {

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

        }


        /* CATEGORY */

        if (
            activeCategory !==
            "All"
        ) {

            list =
                list.filter(food => {

                    const category =
                        String(
                            food.category || ""
                        ).toLowerCase();


                    return (
                        category ===
                        activeCategory
                            .toLowerCase()
                    );

                });

        }


        if (!list.length) {

            showEmpty(
                "No food found."
            );

            return;
        }


        hideEmpty();


        foodContainer.innerHTML =
            list
                .map(createFoodCard)
                .join("");

    }


    /* =====================================================
       FOOD CARD
    ===================================================== */

    function createFoodCard(food) {

        const id =
            getFoodId(food);


        const name =
            food.name ||
            "Food";


        const description =
            food.description ||
            "Delicious food";


        const price =
            food.price ?? 0;


        const image =
            food.image || "";


        return `

            <div class="food-card">

                <img
                    src="${safe(
                        getImage(image)
                    )}"
                    alt="${safe(name)}"

                    onerror="
                        this.onerror=null;
                        this.src='/images/foods/default-food.jpg';
                    "
                >


                <div class="food-content">

                    <h3>
                        ${safe(name)}
                    </h3>


                    <p>
                        ${safe(description)}
                    </p>


                    <div class="food-footer">

                        <span class="price">
                            ₹${safe(price)}
                        </span>


                        <button
                            class="add-btn"
                            type="button"
                            data-food-id="${safe(id)}"
                        >
                            Add To Cart
                        </button>

                    </div>

                </div>

            </div>

        `;

    }


    /* =====================================================
       ADD TO CART
    ===================================================== */

    async function addToCart(
        foodId,
        button
    ) {

        if (!foodId) {

            Swal.fire({

                icon: "error",

                title: "Oops!",

                text: "Food ID is required."

            });

            return;

        }


        try {

            button.disabled = true;

            button.textContent =
                "Adding...";


            const response =
                await fetch(
                    "/cart/add",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({

                            foodId:
                                Number(foodId),

                            food_id:
                                Number(foodId),

                            quantity: 1

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "ADD CART RESPONSE:",
                data
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                await Swal.fire({

                    icon: "info",

                    title: "Login Required",

                    text: "Please login first."

                });


                location.href =
                    "/login";


                return;

            }


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to add item to cart."
                );

            }


            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "success",

                title:
                    data.message ||
                    "Added to cart",

                showConfirmButton: false,

                timer: 1500

            });


            loadCartCount();


        }
        catch (error) {

            console.error(
                "ADD CART ERROR:",
                error
            );


            Swal.fire({

                icon: "error",

                title: "Oops!",

                text: error.message

            });

        }
        finally {

            button.disabled = false;

            button.textContent =
                "Add To Cart";

        }

    }


    /* =====================================================
       FOOD CLICK
    ===================================================== */

    foodContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".add-btn"
                );


            if (!button)
                return;


            addToCart(

                button.dataset.foodId,

                button

            );

        }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchFood) {

        searchFood.addEventListener(
            "input",
            renderFoods
        );

    }


    /* =====================================================
       CATEGORY BUTTONS
    ===================================================== */

    function bindCategoryButtons() {

        const buttons =
            document.querySelectorAll(
                ".category-btn"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        btn =>
                            btn.classList
                                .remove(
                                    "active"
                                )
                    );


                    button.classList.add(
                        "active"
                    );


                    activeCategory =
                        button.dataset.category ||
                        "All";


                    renderFoods();

                }
            );

        });

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    function showEmpty(message) {

        foodContainer.innerHTML = "";


        if (!emptyFood)
            return;


        emptyFood.style.display =
            "block";


        const p =
            emptyFood.querySelector(
                "p"
            );


        if (p) {
            p.textContent =
                message;
        }

    }


    function hideEmpty() {

        if (emptyFood) {

            emptyFood.style.display =
                "none";

        }

    }


    /* =====================================================
       CART COUNT
    ===================================================== */

    function loadCartCount() {

        fetch(
            "/cart",
            {
                credentials: "include",
                cache: "no-store"
            }
        )

        .then(res =>
            res.json()
        )

        .then(data => {

            const cart =
                Array.isArray(data.cart)
                    ? data.cart
                    : [];


            const uniqueItems =
                new Set();


            cart.forEach(item => {

                const id =
                    item.food_id ||
                    item.foodId ||
                    item.id;


                if (id) {

                    uniqueItems.add(
                        String(id)
                    );

                }

            });


            const count =
                uniqueItems.size;


            const el =
                document.getElementById(
                    "headerCartCount"
                );


            if (el) {

                el.textContent =
                    count;

            }

        })

        .catch(() => {

            const el =
                document.getElementById(
                    "headerCartCount"
                );


            if (el) {

                el.textContent =
                    "0";

            }

        });

    }


    /* =====================================================
       START
    ===================================================== */

    console.log(
        "Jigato Menu Started"
    );


    loadMenu();

    loadCartCount();

});