document.addEventListener("DOMContentLoaded", () => {

    let cartItems = [];
    let addresses = [];
    let selectedAddress = null;
    let appliedCoupon = null;

    const $ = id => document.getElementById(id);

    let settings = {
        delivery_fee: 40,
        free_delivery_above: 500,
        gst_rate: 5,
        minimum_order: 100,
        payment_cod: true,
        payment_upi: true,
        payment_card: true,
        offers_enabled: true,
        coupons_enabled: true,
        free_delivery_offers: true
    };

    const bool = v => v === true || Number(v) === 1;


    // =====================================================
    // SETTINGS
    // =====================================================

    async function loadSettings() {

        const res = await fetch("/api/settings", {
            credentials: "include",
            cache: "no-store"
        });

        const data = await res.json();

        if (!res.ok || !data.success)
            throw new Error(
                data.message || "Unable to load settings."
            );

        settings = {
            ...settings,
            ...data.settings
        };

        applyPaymentSettings();
    }


    // =====================================================
    // CHECKOUT LOAD
    // =====================================================

    async function loadCheckout() {

        try {

            await loadSettings();

            const [cartRes, addressRes] =
                await Promise.all([
                    fetch("/cart", {
                        credentials: "include",
                        cache: "no-store"
                    }),
                    fetch("/api/addresses", {
                        credentials: "include",
                        cache: "no-store"
                    })
                ]);

            if (
                cartRes.status === 401 ||
                addressRes.status === 401
            ) {
                location.href = "/login";
                return;
            }

            const cartData = await cartRes.json();
            const addressData = await addressRes.json();

            if (!cartRes.ok || !cartData.success)
                throw new Error(
                    cartData.message || "Unable to load cart."
                );

            if (!addressRes.ok || !addressData.success)
                throw new Error(
                    addressData.message ||
                    "Unable to load addresses."
                );

            cartItems = Array.isArray(cartData.cart)
                ? cartData.cart
                : [];

            addresses = Array.isArray(addressData.addresses)
                ? addressData.addresses
                : [];

            renderAddresses();
            renderItems();
            loadSavedCoupon();
            applyPaymentSettings();
            updateSummary();

        } catch (error) {

            console.error("CHECKOUT LOAD ERROR:", error);
            showError(error.message);

        }
    }


    // =====================================================
    // ADDRESS
    // =====================================================

    function renderAddresses() {

        const box = $("addressList");
        if (!box) return;

        if (!addresses.length) {

            box.innerHTML = `
                <div class="no-address">
                    <div>📍</div>
                    <strong>No Saved Address</strong>
                    <p>Please add an address from your profile.</p>
                </div>
            `;

            selectedAddress = null;
            return;
        }

        selectedAddress =
            addresses.find(x => Number(x.is_default) === 1) ||
            addresses[0];

        box.innerHTML = addresses.map(address => {

            const selected =
                Number(address.id) ===
                Number(selectedAddress.id);

            return `
                <div class="checkout-address ${selected ? "selected" : ""}"
                     data-id="${address.id}">

                    <div class="radio">
                        <input type="radio"
                               name="address"
                               ${selected ? "checked" : ""}>
                    </div>

                    <div class="address-info">
                        <div class="address-title">
                            <strong>
                                ${escapeHTML(address.full_name)}
                            </strong>

                            <span>
                                ${getIcon(address.address_label)}
                                ${escapeHTML(
                                    address.address_label || "Home"
                                )}
                            </span>
                        </div>

                        <p>📞 ${escapeHTML(address.phone)}</p>
                        <p>${escapeHTML(address.address)}</p>
                        <p>
                            ${escapeHTML(address.city)},
                            ${escapeHTML(address.state)}
                            -
                            ${escapeHTML(address.pincode)}
                        </p>
                    </div>

                </div>
            `;

        }).join("");

        box.querySelectorAll(".checkout-address").forEach(card => {

            card.addEventListener("click", () => {

                const id = Number(card.dataset.id);

                selectedAddress =
                    addresses.find(
                        x => Number(x.id) === id
                    );

                box.querySelectorAll(".checkout-address")
                    .forEach(x =>
                        x.classList.remove("selected")
                    );

                card.classList.add("selected");

                const radio = card.querySelector("input");

                if (radio)
                    radio.checked = true;
            });

        });
    }


    // =====================================================
    // ITEMS
    // =====================================================

    function renderItems() {

        const box = $("checkoutItems");
        if (!box) return;

        if (!cartItems.length) {

            box.innerHTML = `
                <div class="no-address">
                    🛒 Your cart is empty.
                </div>
            `;

            return;
        }

        box.innerHTML = cartItems.map(item => {

            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;

            return `
                <div class="checkout-item">

                    <img
                        src="/images/foods/${escapeHTML(item.image)}"
                        alt="${escapeHTML(item.food_name)}"
                        onerror="
                            this.src='/images/foods/default-food.jpg'
                        "
                    >

                    <div class="checkout-item-info">

                        <h3>${escapeHTML(item.food_name)}</h3>
                        <p>Jigato</p>
                        <span>
                            ₹${price.toFixed(2)} × ${quantity}
                        </span>

                    </div>

                    <strong>
                        ₹${(price * quantity).toFixed(2)}
                    </strong>

                </div>
            `;

        }).join("");
    }


    // =====================================================
    // TOTALS
    // =====================================================

    function getSubtotal() {

        return cartItems.reduce(
            (sum, item) =>
                sum +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 0),
            0
        );
    }


    function getDeliveryFee(subtotal) {

        if (subtotal <= 0) return 0;

        const couponType =
            String(
                appliedCoupon?.discountType ||
                appliedCoupon?.discount_type ||
                ""
            ).toLowerCase();

        if (
            bool(settings.free_delivery_offers) &&
            couponType === "free_delivery"
        )
            return 0;

        const freeAbove =
            Number(settings.free_delivery_above || 0);

        if (freeAbove > 0 && subtotal >= freeAbove)
            return 0;

        return Number(settings.delivery_fee || 0);
    }


    function getGST(subtotal) {

        return subtotal *
            Number(settings.gst_rate || 0) / 100;
    }


    function getDiscount() {

        return Number(
            appliedCoupon?.discount || 0
        );
    }


    function updateSummary() {

        const subtotal = getSubtotal();
        const delivery = getDeliveryFee(subtotal);
        const gst = getGST(subtotal);
        const discount = getDiscount();

        const total = Math.max(
            0,
            subtotal + delivery + gst - discount
        );

        const values = {
            subtotal,
            delivery,
            gst,
            discount
        };

        Object.entries(values).forEach(([id, value]) => {

            const el = $(id);

            if (el)
                el.textContent =
                    id === "discount"
                        ? `- ₹${value.toFixed(2)}`
                        : `₹${value.toFixed(2)}`;
        });

        if ($("grandTotal"))
            $("grandTotal").textContent =
                `₹${total.toFixed(2)}`;
    }


    // =====================================================
    // PAYMENT
    // =====================================================

    function applyPaymentSettings() {

        const allowed = {
            COD: bool(settings.payment_cod),
            UPI: bool(settings.payment_upi),
            CARD: bool(settings.payment_card)
        };

        document
            .querySelectorAll(".payment-option")
            .forEach(option => {

                const radio =
                    option.querySelector(
                        'input[name="payment"]'
                    );

                if (!radio) return;

                const enabled =
                    allowed[
                        radio.value.trim().toUpperCase()
                    ] !== false;

                radio.disabled = !enabled;
                option.style.display =
                    enabled ? "" : "none";

                if (!enabled) {
                    radio.checked = false;
                    option.classList.remove("active");
                }
            });

        let checked =
            document.querySelector(
                'input[name="payment"]:checked:not(:disabled)'
            );

        if (!checked) {

            checked =
                document.querySelector(
                    'input[name="payment"]:not(:disabled)'
                );

            if (checked)
                checked.checked = true;
        }

        document
            .querySelectorAll(".payment-option")
            .forEach(x =>
                x.classList.remove("active")
            );

        checked
            ?.closest(".payment-option")
            ?.classList.add("active");
    }


    document
        .querySelectorAll(".payment-option")
        .forEach(option => {

            option.addEventListener("click", () => {

                const radio =
                    option.querySelector(
                        'input[name="payment"]'
                    );

                if (!radio || radio.disabled) return;

                document
                    .querySelectorAll(".payment-option")
                    .forEach(x =>
                        x.classList.remove("active")
                    );

                option.classList.add("active");
                radio.checked = true;
            });
        });


    // =====================================================
    // COUPON
    // =====================================================

    const couponInput = $("couponCode");
    const applyCouponButton = $("applyCouponBtn");
    const removeCouponButton = $("removeCouponBtn");
    const couponMessage = $("couponMessage");
    const appliedCouponBox = $("appliedCoupon");


    applyCouponButton?.addEventListener(
        "click",
        applyCoupon
    );


    couponInput?.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            e.preventDefault();
            applyCoupon();
        }

    });


    removeCouponButton?.addEventListener(
        "click",
        removeCoupon
    );


    async function applyCoupon() {

        if (!bool(settings.offers_enabled)) {

            showCouponMessage(
                "Offers are currently disabled.",
                "error"
            );

            return;
        }

        if (!bool(settings.coupons_enabled)) {

            showCouponMessage(
                "Coupons are currently disabled.",
                "error"
            );

            return;
        }

        const code =
            couponInput?.value.trim().toUpperCase();

        if (!code) {

            showCouponMessage(
                "Please enter a coupon code.",
                "error"
            );

            return;
        }

        const subtotal = getSubtotal();

        if (subtotal <= 0) {

            showCouponMessage(
                "Your cart is empty.",
                "error"
            );

            return;
        }

        try {

            if (applyCouponButton)
                applyCouponButton.disabled = true;

            const res = await fetch(
                "/api/offers/apply",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    },
                    body: JSON.stringify({
                        code,
                        subtotal:
                            Number(subtotal.toFixed(2))
                    })
                }
            );

            if (res.status === 401) {
                location.href = "/login";
                return;
            }

            const data = await res.json();

            if (!res.ok || !data.success)
                throw new Error(
                    data.message || "Invalid coupon."
                );

            appliedCoupon = data.coupon;

            localStorage.setItem(
                "jigatoAppliedCoupon",
                JSON.stringify(appliedCoupon)
            );

            showAppliedCoupon();
            updateSummary();

            showCouponMessage(
                data.message ||
                "Coupon applied successfully.",
                "success"
            );

            if (typeof Swal !== "undefined") {

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: `${code} applied!`,
                    showConfirmButton: false,
                    timer: 1600
                });
            }

        } catch (error) {

            appliedCoupon = null;

            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );

            updateSummary();

            showCouponMessage(
                error.message,
                "error"
            );

        } finally {

            if (applyCouponButton) {

                applyCouponButton.disabled =
                    !bool(settings.coupons_enabled);
            }
        }
    }


    function showAppliedCoupon() {

        if (!appliedCoupon || !appliedCouponBox)
            return;

        appliedCouponBox.style.display = "flex";

        const span =
            appliedCouponBox.querySelector("span");

        if (span)
            span.textContent =
                `${appliedCoupon.code || ""} Applied`;

        if (couponInput) {

            couponInput.value =
                appliedCoupon.code || "";

            couponInput.disabled = true;
        }

        if (applyCouponButton)
            applyCouponButton.disabled = true;
    }


    function removeCoupon() {

        appliedCoupon = null;

        localStorage.removeItem(
            "jigatoAppliedCoupon"
        );

        localStorage.removeItem(
            "jigatoCoupon"
        );

        if (couponInput) {

            couponInput.value = "";

            couponInput.disabled =
                !bool(settings.coupons_enabled);
        }

        if (applyCouponButton) {

            applyCouponButton.disabled =
                !bool(settings.coupons_enabled);
        }

        if (appliedCouponBox)
            appliedCouponBox.style.display = "none";

        if (couponMessage) {

            couponMessage.textContent = "";
            couponMessage.className =
                "coupon-message";
        }

        updateSummary();
    }


    function loadSavedCoupon() {

        if (
            !bool(settings.offers_enabled) ||
            !bool(settings.coupons_enabled)
        )
            return;

        try {

            const saved =
                localStorage.getItem(
                    "jigatoAppliedCoupon"
                );

            if (saved) {

                const coupon =
                    JSON.parse(saved);

                const type =
                    String(
                        coupon.discountType ||
                        coupon.discount_type ||
                        ""
                    ).toLowerCase();

                if (
                    type !== "free_delivery" ||
                    bool(settings.free_delivery_offers)
                ) {

                    appliedCoupon = coupon;
                    showAppliedCoupon();

                } else {

                    localStorage.removeItem(
                        "jigatoAppliedCoupon"
                    );
                }
            }

        } catch {

            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );
        }

        const code =
            localStorage.getItem("jigatoCoupon");

        if (
            code &&
            couponInput &&
            !appliedCoupon
        )
            couponInput.value = code;
    }


    function showCouponMessage(message, type) {

        if (!couponMessage) return;

        couponMessage.textContent = message;
        couponMessage.className =
            `coupon-message ${type}`;
    }


    // =====================================================
    // PLACE ORDER
    // =====================================================

    $("placeOrderBtn")?.addEventListener(
        "click",
        placeOrder
    );


    async function placeOrder() {

        if (!selectedAddress) {
            showError(
                "Please select a delivery address."
            );
            return;
        }

        if (!cartItems.length) {
            showError("Your cart is empty.");
            return;
        }

        const subtotal = getSubtotal();

        const minimum =
            Number(settings.minimum_order || 0);

        if (
            minimum > 0 &&
            subtotal < minimum
        ) {

            showError(
                `Minimum order amount is ₹${minimum.toFixed(2)}.`
            );

            return;
        }

        const payment =
            document.querySelector(
                'input[name="payment"]:checked'
            );

        if (!payment || payment.disabled) {

            showError(
                "Please select an available payment method."
            );

            return;
        }

        const method =
            payment.value.trim().toUpperCase();

        const allowed = {
            COD: bool(settings.payment_cod),
            UPI: bool(settings.payment_upi),
            CARD: bool(settings.payment_card)
        };

        if (!allowed[method]) {

            showError(
                `${method} payment is currently disabled.`
            );

            applyPaymentSettings();
            return;
        }

        const delivery =
            getDeliveryFee(subtotal);

        const gst =
            getGST(subtotal);

        const discount =
            getDiscount();

        const total =
            Math.max(
                0,
                subtotal +
                delivery +
                gst -
                discount
            );

        const items =
            cartItems.map(item => ({
                foodId: Number(item.food_id),
                quantity: Number(item.quantity),
                price: Number(item.price)
            }));

        const orderData = {

            customerName:
                selectedAddress.full_name,

            customerPhone:
                selectedAddress.phone,

            customerAddress:
                selectedAddress.address,

            customerCity:
                selectedAddress.city,

            customerState:
                selectedAddress.state,

            customerPincode:
                selectedAddress.pincode,

            paymentMethod: method,

            subtotal:
                Number(subtotal.toFixed(2)),

            deliveryFee:
                Number(delivery.toFixed(2)),

            gst:
                Number(gst.toFixed(2)),

            discount:
                Number(discount.toFixed(2)),

            couponCode:
                appliedCoupon?.code || null,

            total:
                Number(total.toFixed(2)),

            items
        };

        const button = $("placeOrderBtn");

        if (button) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Placing Order...
            `;
        }

        try {

            const res = await fetch(
                "/api/orders",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Accept":
                            "application/json"
                    },
                    body:
                        JSON.stringify(orderData)
                }
            );

            if (res.status === 401) {

                location.href = "/login";
                return;
            }

            const data = await res.json();

            if (!res.ok || !data.success)
                throw new Error(
                    data.message ||
                    "Unable to place order."
                );

            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );

            localStorage.removeItem(
                "jigatoCoupon"
            );

            appliedCoupon = null;

            await Swal.fire({
                icon: "success",
                title: "Order Placed! 🎉",
                text:
                    data.message ||
                    "Your order has been placed successfully.",
                confirmButtonColor: "#ff5a1f"
            });

            location.href = "/";

        } catch (error) {

            console.error(
                "ORDER ERROR:",
                error
            );

            showError(
                error.message ||
                "Unable to place order."
            );

        } finally {

            if (button) {

                button.disabled = false;

                button.innerHTML = `
                    <i class="fa-solid fa-circle-check"></i>
                    Place Order
                `;
            }
        }
    }


    // =====================================================
    // HELPERS
    // =====================================================

    function getIcon(label) {

        const value =
            String(label || "").toLowerCase();

        if (value === "work") return "💼";
        if (value === "other") return "📍";

        return "🏠";
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function showError(message) {

        Swal.fire({
            icon: "error",
            title: "Oops!",
            text: message,
            confirmButtonColor: "#ff5a1f"
        });
    }


    // =====================================================
    // START
    // =====================================================

    loadCheckout();

});