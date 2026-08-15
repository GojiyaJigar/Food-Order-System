document.addEventListener("DOMContentLoaded", () => {

    const foodContainer = document.getElementById("foodContainer");
    const emptyFood = document.getElementById("emptyFood");
    const searchFood = document.getElementById("searchFood");
    const categoryButtons = document.querySelectorAll(".category-btn");

    // =====================================================
    // RESTAURANT ID
    // /restaurant/5
    // =====================================================

    const parts = location.pathname.split("/").filter(Boolean);
    const restaurantIndex = parts.indexOf("restaurant");

    const restaurantId =
        restaurantIndex !== -1
            ? parts[restaurantIndex + 1]
            : null;

    if (!restaurantId) {
        foodContainer.innerHTML = `
            <div class="food-loading">
                Restaurant ID not found.
            </div>
        `;
        return;
    }

    let foods = [];
    let activeCategory = "All";


    // =====================================================
    // HELPERS
    // =====================================================

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

        if (!image)
            return "/images/foods/default-food.jpg";

        image = String(image).trim();

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/images/foods/"))
            return image;

        if (image.startsWith("images/foods/"))
            return "/" + image;

        return "/images/foods/" + image.split("/").pop();
    }


    // =====================================================
    // LOAD MENU
    // =====================================================

    async function loadMenu() {

        foodContainer.innerHTML = `
            <div class="food-loading">
                Loading delicious food...
            </div>
        `;

        try {

            const response = await fetch(
                `/restaurant/${restaurantId}/menu`,
                {
                    credentials: "include"
                }
            );

            if (!response.ok)
                throw new Error("Menu could not be loaded.");

            const data = await response.json();

            console.log("MENU API:", data);

            // API ke different response formats support
            if (Array.isArray(data)) {
                foods = data;
            }
            else if (Array.isArray(data.foods)) {
                foods = data.foods;
            }
            else if (Array.isArray(data.menu)) {
                foods = data.menu;
            }
            else if (Array.isArray(data.items)) {
                foods = data.items;
            }
            else if (Array.isArray(data.data)) {
                foods = data.data;
            }
            else {
                foods = [];
            }


            // Restaurant information
            const restaurant =
                data.restaurant ||
                data.restaurantData;

            if (restaurant) {
                setRestaurantInfo(restaurant);
            }


            console.log("FOODS:", foods);


            if (!foods.length) {
                showEmpty("No food available.");
                return;
            }


            renderFoods();

        }
        catch (error) {

            console.error("MENU ERROR:", error);

            showEmpty(
                "Unable to load restaurant menu."
            );

        }
    }


    // =====================================================
    // RESTAURANT INFORMATION
    // =====================================================

    function setRestaurantInfo(r) {

        const name =
            r.name ||
            r.restaurant_name;

        const category =
            r.category ||
            r.cuisine ||
            "Multi Cuisine";

        const rating =
            r.rating ||
            "4.5";

        const time =
            r.delivery_time ||
            r.deliveryTime ||
            "30 min";

        const city =
            r.city ||
            "";

        const image =
            r.image ||
            r.image_url ||
            r.restaurant_image;


        const nameEl =
            document.getElementById("restaurantName");

        const categoryEl =
            document.getElementById("restaurantCategory");

        const ratingEl =
            document.getElementById("restaurantRating");

        const timeEl =
            document.getElementById("restaurantTime");

        const cityEl =
            document.getElementById("restaurantCity");

        const imageEl =
            document.getElementById("restaurantImage");


        if (nameEl)
            nameEl.textContent = name;

        if (categoryEl)
            categoryEl.textContent = category;

        if (ratingEl)
            ratingEl.textContent = "⭐ " + rating;

        if (timeEl)
            timeEl.textContent = "🚚 " + time;

        if (cityEl)
            cityEl.textContent =
                city ? "📍 " + city : "";

        if (imageEl && image)
            imageEl.src = getImage(image);
    }


    // =====================================================
    // RENDER FOOD
    // =====================================================

    function renderFoods() {

        let list = [...foods];

        const query =
            searchFood
                ? searchFood.value.trim().toLowerCase()
                : "";


        // SEARCH
        if (query) {

            list = list.filter(food => {

                const text = [

                    food.name,
                    food.food_name,
                    food.item_name,
                    food.description,
                    food.food_description,
                    food.category,
                    food.food_category

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(query);
            });
        }


        // CATEGORY
        if (activeCategory !== "All") {

            list = list.filter(food => {

                const category = String(
                    food.category ||
                    food.food_category ||
                    food.category_name ||
                    ""
                ).toLowerCase();

                const name = String(
                    food.name ||
                    food.food_name ||
                    ""
                ).toLowerCase();

                return (
                    category.includes(
                        activeCategory.toLowerCase()
                    ) ||
                    name.includes(
                        activeCategory.toLowerCase()
                    )
                );
            });
        }


        if (!list.length) {
            showEmpty("No food found.");
            return;
        }

        hideEmpty();

        foodContainer.innerHTML =
            list.map(createFoodCard).join("");
    }


    // =====================================================
    // FOOD CARD
    // =====================================================

    function createFoodCard(food) {

        const id = getFoodId(food);

        const name =
            food.name ||
            food.food_name ||
            food.item_name ||
            "Food";

        const description =
            food.description ||
            food.food_description ||
            "Delicious food";

        const price =
            food.price ??
            food.food_price ??
            food.item_price ??
            0;

        const image =
            food.image ||
            food.image_url ||
            food.food_image ||
            "";


        // IMPORTANT DEBUG
        console.log(
            "FOOD:",
            name,
            "ID:",
            id
        );


        return `
            <div class="food-card">

                <img
                    src="${safe(getImage(image))}"
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


    // =====================================================
    // ADD TO CART
    // =====================================================

    async function addToCart(foodId, button) {

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
        button.textContent = "Adding...";

        const response = await fetch("/cart/add", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                foodId: Number(foodId),
                food_id: Number(foodId),

                restaurantId: Number(restaurantId),
                restaurant_id: Number(restaurantId),

                quantity: 1
            })
        });

        const data = await response.json();

        console.log("ADD CART RESPONSE:", data);

        if (response.status === 401 || response.status === 403) {

            await Swal.fire({
                icon: "info",
                title: "Login Required",
                text: "Please login first."
            });

            location.href = "/login";
            return;
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to add item to cart."
            );
        }

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: data.message || "Added to cart",
            showConfirmButton: false,
            timer: 1500
        });

        loadCartCount();

    } catch (error) {

        console.error("ADD CART ERROR:", error);

        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: error.message
        });

    } finally {

        button.disabled = false;
        button.textContent = "Add To Cart";

    }
}



    // =====================================================
    // ADD BUTTON CLICK
    // =====================================================

    foodContainer.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(".add-btn");

            if (!button)
                return;


            const foodId =
                button.dataset.foodId;


            console.log(
                "CLICKED FOOD ID:",
                foodId
            );


            addToCart(
                foodId,
                button
            );
        }
    );


    // =====================================================
    // SEARCH
    // =====================================================

    if (searchFood) {

        searchFood.addEventListener(
            "input",
            renderFoods
        );
    }


    // =====================================================
    // CATEGORY
    // =====================================================

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                activeCategory =
                    button.dataset.category ||
                    "All";

                renderFoods();
            }
        );

    });


    // =====================================================
    // EMPTY
    // =====================================================

    function showEmpty(message) {

        foodContainer.innerHTML = "";

        if (!emptyFood)
            return;

        emptyFood.style.display = "block";

        const p =
            emptyFood.querySelector("p");

        if (p)
            p.textContent = message;
    }


    function hideEmpty() {

        if (emptyFood)
            emptyFood.style.display = "none";

    }


    // =====================================================
    // CART COUNT
    // =====================================================

    function loadCartCount() {

    fetch("/cart", {
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {

        const cart = Array.isArray(data.cart)
            ? data.cart
            : [];

        const uniqueItems = new Set();

        cart.forEach(item => {

            const id =
                item.food_id ||
                item.foodId ||
                item.id;

            if (id) {
                uniqueItems.add(String(id));
            }

        });

        const count = uniqueItems.size;

        const el = document.getElementById("headerCartCount");

        if (el) {
            el.textContent = count;
        }

    })
    .catch(() => {

        const el = document.getElementById("headerCartCount");

        if (el) {
            el.textContent = "0";
        }

    });
}
    // =====================================================
    // START
    // =====================================================

    console.log(
        "Jigato Menu:",
        restaurantId
    );

    loadMenu();
    loadCartCount();

});