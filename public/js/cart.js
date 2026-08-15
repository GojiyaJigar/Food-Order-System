document.addEventListener("DOMContentLoaded", () => {

    const cartItems = document.getElementById("cartItems");
    const subtotalEl = document.getElementById("subtotal");
    const deliveryEl = document.getElementById("delivery");
    const gstEl = document.getElementById("gst");
    const totalEl = document.getElementById("grandTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const DELIVERY_FEE = 40;
    const GST_RATE = 0.05;

    let cart = [];


    /* ================= LOAD CART ================= */

    async function loadCart() {

        cartItems.innerHTML = `
            <div class="cart-loading">
                Loading your cart...
            </div>
        `;

        try {

            const res = await fetch("/cart", {
                credentials: "include"
            });

            const data = await res.json();

            console.log("CART DATA:", data);

            if (!res.ok) {
                throw new Error(
                    data.message || "Unable to load cart."
                );
            }

            cart = Array.isArray(data.cart)
                ? data.cart
                : [];

            renderCart();

        } catch (error) {

            console.error("Cart Error:", error);

            cartItems.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">😕</div>
                    <h3>Unable to load cart</h3>
                    <p>Please try again.</p>
                </div>
            `;

            updateSummary([]);
        }
    }


    /* ================= CART ID ================= */

    function getCartId(item) {

        return (
            item.cart_id ??
            item.cartId ??
            item.id
        );

    }


    /* ================= FOOD ID ================= */

    function getFoodId(item) {

        return (
            item.food_id ??
            item.foodId
        );

    }


    /* ================= NAME ================= */

    function getName(item) {

        return (
            item.food_name ??
            item.name ??
            item.item_name ??
            "Food Item"
        );

    }


    /* ================= PRICE ================= */

    function getPrice(item) {

        return Number(
            item.price ??
            item.food_price ??
            item.item_price ??
            0
        );

    }


    /* ================= QUANTITY ================= */

    function getQuantity(item) {

        const quantity =
            Number(item.quantity);

        return quantity > 0 ? quantity : 1;

    }


    /* ================= IMAGE ================= */

    function getImage(item) {

        const image =
            item.food_image ??
            item.image ??
            item.image_url ??
            "";

        if (!image) {
            return "/images/foods/default-food.jpg";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        if (image.startsWith("/images/foods/")) {
            return image;
        }

        if (image.startsWith("images/foods/")) {
            return "/" + image;
        }

        return "/images/foods/" +
            image.split("/").pop();

    }


    /* ================= SAFE ================= */

    function safe(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ================= RENDER ================= */

    function renderCart() {

        if (!cart.length) {

            cartItems.innerHTML = `
                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <h3>
                        Your cart is empty
                    </h3>

                    <p>
                        Add some delicious food to continue.
                    </p>

                    <a href="/restaurant">
                        Explore Restaurants
                    </a>

                </div>
            `;

            updateSummary([]);

            updateNavbarCount(0);

            return;
        }


        cartItems.innerHTML =
            cart.map(createCartItem).join("");


        updateSummary(cart);

        updateNavbarCount(cart.length);

    }


    /* ================= CART CARD ================= */

    function createCartItem(item) {

        const cartId =
            getCartId(item);

        const foodId =
            getFoodId(item);

        const name =
            getName(item);

        const price =
            getPrice(item);

        const quantity =
            getQuantity(item);

        const image =
            getImage(item);

        const itemTotal =
            price * quantity;


        console.log(
            "Cart Item:",
            {
                cartId,
                foodId,
                name,
                quantity
            }
        );


        return `
            <div
                class="cart-item"
                data-id="${safe(cartId)}"
            >

                <img
                    src="${safe(image)}"
                    alt="${safe(name)}"
                    onerror="
                        this.onerror=null;
                        this.src='/images/foods/default-food.jpg';
                    "
                >


                <div class="cart-item-content">

                    <h3>
                        ${safe(name)}
                    </h3>

                    <p>
                        ₹${price.toFixed(2)} each
                    </p>

                    <div class="cart-item-price">
                        ₹${itemTotal.toFixed(2)}
                    </div>

                </div>


                <div class="quantity-box">

                    <button
                        type="button"
                        class="quantity-minus"
                        data-id="${safe(cartId)}"
                    >
                        −
                    </button>

                    <span>
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-plus"
                        data-id="${safe(cartId)}"
                    >
                        +
                    </button>

                </div>


                <button
                    type="button"
                    class="remove-btn"
                    data-id="${safe(cartId)}"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;
    }


    /* ================= INCREASE ================= */

    async function increaseQuantity(cartId) {

        if (!cartId) return;

        try {

            const res = await fetch(
                `/cart/increase/${cartId}`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await res.json();

            console.log(
                "Increase Response:",
                data
            );

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Unable to increase quantity."
                );
            }

            await loadCart();

        } catch (error) {

            console.error(
                "Increase Error:",
                error
            );

            showError(error.message);
        }
    }


    /* ================= DECREASE ================= */

    async function decreaseQuantity(cartId) {

        if (!cartId) return;

        try {

            const res = await fetch(
                `/cart/decrease/${cartId}`,
                {
                    method: "PUT",
                    credentials: "include"
                }
            );

            const data = await res.json();

            console.log(
                "Decrease Response:",
                data
            );

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Unable to decrease quantity."
                );
            }

            await loadCart();

        } catch (error) {

            console.error(
                "Decrease Error:",
                error
            );

            showError(error.message);
        }
    }


    /* ================= REMOVE ================= */

    async function removeItem(cartId) {

        if (!cartId) return;


        const result =
            await Swal.fire({

                icon: "warning",

                title: "Remove item?",

                text:
                    "Do you want to remove this item from cart?",

                showCancelButton: true,

                confirmButtonText: "Remove",

                cancelButtonText: "Cancel"

            });


        if (!result.isConfirmed)
            return;


        try {

            const res = await fetch(
                `/cart/${cartId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            console.log(
                "Remove Response:",
                data
            );

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "Unable to remove item."
                );
            }


            Swal.fire({

                toast: true,

                position: "top-end",

                icon: "success",

                title: "Item removed",

                showConfirmButton: false,

                timer: 1200

            });


            await loadCart();

        } catch (error) {

            console.error(
                "Remove Error:",
                error
            );

            showError(error.message);
        }
    }


    /* ================= CLICK EVENTS ================= */

    cartItems.addEventListener(
        "click",
        event => {

            const plus =
                event.target.closest(
                    ".quantity-plus"
                );

            const minus =
                event.target.closest(
                    ".quantity-minus"
                );

            const remove =
                event.target.closest(
                    ".remove-btn"
                );


            if (plus) {

                increaseQuantity(
                    plus.dataset.id
                );

                return;
            }


            if (minus) {

                decreaseQuantity(
                    minus.dataset.id
                );

                return;
            }


            if (remove) {

                removeItem(
                    remove.dataset.id
                );

            }

        }
    );


    /* ================= SUMMARY ================= */

    function updateSummary(items) {

        let subtotal = 0;

        items.forEach(item => {

            subtotal +=
                getPrice(item) *
                getQuantity(item);

        });


        const delivery =
            items.length
                ? DELIVERY_FEE
                : 0;


        const gst =
            subtotal * GST_RATE;


        const grandTotal =
            subtotal +
            delivery +
            gst;


        subtotalEl.textContent =
            "₹" + subtotal.toFixed(2);

        deliveryEl.textContent =
            "₹" + delivery.toFixed(2);

        gstEl.textContent =
            "₹" + gst.toFixed(2);

        totalEl.textContent =
            "₹" + grandTotal.toFixed(2);


        checkoutBtn.disabled =
            !items.length;
    }


    /* ================= NAVBAR COUNT ================= */

    function updateNavbarCount(count) {

        const header =
            document.getElementById(
                "headerCartCount"
            );

        const mobile =
            document.getElementById(
                "mobileCartCount"
            );

        if (header) {
            header.textContent = count;
        }

        if (mobile) {
            mobile.textContent = count;
        }

    }


    /* ================= ERROR ================= */

    function showError(message) {

        Swal.fire({

            icon: "error",

            title: "Oops!",

            text:
                message ||
                "Something went wrong."

        });

    }


    /* ================= CHECKOUT ================= */

    checkoutBtn.addEventListener(
        "click",
        () => {

            if (!cart.length)
                return;

            window.location.href =
                "/checkout-page";

        }
    );


    /* ================= START ================= */

    loadCart();

});