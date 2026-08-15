document.addEventListener("DOMContentLoaded", () => {

    let cartItems = [];
    let addresses = [];
    let selectedAddress = null;

    // =====================================================
    // COUPON
    // =====================================================

    let appliedCoupon = null;

    // =====================================================
    // CONSTANTS
    // =====================================================

    const DELIVERY_FEE = 40;
    const GST_RATE = 0.05;

    const $ = id => document.getElementById(id);


    // =====================================================
    // LOAD CHECKOUT
    // =====================================================

    async function loadCheckout() {

        try {

            const [cartRes, addressRes] = await Promise.all([

                fetch("/api/checkout", {
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


            const cartData =
                await cartRes.json();

            const addressData =
                await addressRes.json();


            if (!cartData.success) {

                showError(
                    cartData.message ||
                    "Unable to load cart."
                );

                return;

            }


            if (!addressData.success) {

                showError(
                    addressData.message ||
                    "Unable to load addresses."
                );

                return;

            }


            cartItems =
                cartData.items || [];

            addresses =
                addressData.addresses || [];


            renderAddresses();

            renderItems();

            updateSummary();

            loadSavedCoupon();

        }

        catch (error) {

            console.error(
                "CHECKOUT LOAD ERROR:",
                error
            );

            showError(
                "Unable to load checkout."
            );

        }

    }


    // =====================================================
    // ADDRESS
    // =====================================================

    function renderAddresses() {

        const box =
            $("addressList");

        if (!box) return;


        if (!addresses.length) {

            box.innerHTML = `

                <div class="no-address">

                    <div>📍</div>

                    <strong>
                        No Saved Address
                    </strong>

                    <p>
                        Please add an address
                        from your profile.
                    </p>

                </div>

            `;

            selectedAddress = null;

            return;

        }


        selectedAddress =
            addresses.find(
                address =>
                    Number(address.is_default) === 1
            ) || addresses[0];


        box.innerHTML =
            addresses.map(address => {

                const selected =
                    Number(address.id) ===
                    Number(selectedAddress.id);


                return `

                    <div
                        class="checkout-address
                        ${selected ? "selected" : ""}"
                        data-id="${address.id}"
                    >

                        <div class="radio">

                            <input
                                type="radio"
                                name="address"
                                ${selected ? "checked" : ""}
                            >

                        </div>


                        <div class="address-info">

                            <div class="address-title">

                                <strong>
                                    ${escapeHTML(
                                        address.full_name
                                    )}
                                </strong>

                                <span>

                                    ${getIcon(
                                        address.address_label
                                    )}

                                    ${escapeHTML(
                                        address.address_label ||
                                        "Home"
                                    )}

                                </span>

                            </div>


                            <p>
                                📞
                                ${escapeHTML(
                                    address.phone
                                )}
                            </p>


                            <p>
                                ${escapeHTML(
                                    address.address
                                )}
                            </p>


                            <p>

                                ${escapeHTML(
                                    address.city
                                )},

                                ${escapeHTML(
                                    address.state
                                )}

                                -

                                ${escapeHTML(
                                    address.pincode
                                )}

                            </p>

                        </div>

                    </div>

                `;

            }).join("");


        document
            .querySelectorAll(
                ".checkout-address"
            )
            .forEach(card => {

                card.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                card.dataset.id
                            );


                        selectedAddress =
                            addresses.find(
                                address =>
                                    Number(address.id) === id
                            );


                        document
                            .querySelectorAll(
                                ".checkout-address"
                            )
                            .forEach(item =>
                                item.classList.remove(
                                    "selected"
                                )
                            );


                        card.classList.add(
                            "selected"
                        );


                        const radio =
                            card.querySelector(
                                "input"
                            );


                        if (radio) {

                            radio.checked = true;

                        }

                    }
                );

            });

    }


    // =====================================================
    // CART ITEMS
    // =====================================================

    function renderItems() {

        const box =
            $("checkoutItems");

        if (!box) return;


        if (!cartItems.length) {

            box.innerHTML = `

                <div class="no-address">

                    🛒 Your cart is empty.

                </div>

            `;

            return;

        }


        box.innerHTML =
            cartItems.map(item => {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 1;

                const itemTotal =
                    price * quantity;


                return `

                    <div class="checkout-item">

                        <img
                            src="/images/foods/${escapeHTML(
                                item.image
                            )}"
                            alt="${escapeHTML(
                                item.food_name
                            )}"
                            onerror="
                                this.src='/images/foods/default-food.jpg'
                            "
                        >


                        <div
                            class="checkout-item-info"
                        >

                            <h3>
                                ${escapeHTML(
                                    item.food_name
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.restaurant_name ||
                                    "Jigato"
                                )}
                            </p>

                            <span>

                                ₹${price.toFixed(2)}
                                ×
                                ${quantity}

                            </span>

                        </div>


                        <strong>

                            ₹${itemTotal.toFixed(2)}

                        </strong>

                    </div>

                `;

            }).join("");

    }


    // =====================================================
    // SUBTOTAL
    // =====================================================

    function getSubtotal() {

        return cartItems.reduce(
            (total, item) => {

                return total +
                    (
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 0)
                    );

            },
            0
        );

    }


    // =====================================================
    // DELIVERY FEE
    // =====================================================

    function getDeliveryFee(subtotal) {

        if (subtotal <= 0) {
            return 0;
        }


        // FREE DELIVERY COUPON

        if (
            appliedCoupon &&
            appliedCoupon.discountType ===
            "free_delivery"
        ) {

            return 0;

        }


        return DELIVERY_FEE;

    }


    // =====================================================
    // DISCOUNT
    // =====================================================

    function getDiscount() {

        if (!appliedCoupon) {
            return 0;
        }


        return Number(
            appliedCoupon.discount || 0
        );

    }


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    function updateSummary() {

        const subtotal =
            getSubtotal();


        const delivery =
            getDeliveryFee(
                subtotal
            );


        const gst =
            subtotal * GST_RATE;


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


        const subtotalBox =
            $("subtotal");

        const deliveryBox =
            $("delivery");

        const gstBox =
            $("gst");

        const discountBox =
            $("discount");

        const grandTotalBox =
            $("grandTotal");


        if (subtotalBox) {

            subtotalBox.textContent =
                `₹${subtotal.toFixed(2)}`;

        }


        if (deliveryBox) {

            deliveryBox.textContent =
                `₹${delivery.toFixed(2)}`;

        }


        if (gstBox) {

            gstBox.textContent =
                `₹${gst.toFixed(2)}`;

        }


        if (discountBox) {

            discountBox.textContent =
                `- ₹${discount.toFixed(2)}`;

        }


        if (grandTotalBox) {

            grandTotalBox.textContent =
                `₹${total.toFixed(2)}`;

        }

    }


    // =====================================================
    // COUPON ELEMENTS
    // =====================================================

    const couponInput =
        $("couponCode");

    const applyCouponButton =
        $("applyCouponBtn");

    const removeCouponButton =
        $("removeCouponBtn");

    const couponMessage =
        $("couponMessage");

    const appliedCouponBox =
        $("appliedCoupon");


    // =====================================================
    // APPLY COUPON BUTTON
    // =====================================================

    if (applyCouponButton) {

        applyCouponButton.addEventListener(
            "click",
            applyCoupon
        );

    }


    // =====================================================
    // ENTER KEY
    // =====================================================

    if (couponInput) {

        couponInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    applyCoupon();

                }

            }
        );

    }


    // =====================================================
    // REMOVE COUPON
    // =====================================================

    if (removeCouponButton) {

        removeCouponButton.addEventListener(
            "click",
            removeCoupon
        );

    }


    // =====================================================
    // APPLY COUPON
    // =====================================================

    async function applyCoupon() {

        if (!couponInput) return;


        const code =
            couponInput.value
                .trim()
                .toUpperCase();


        if (!code) {

            showCouponMessage(
                "Please enter a coupon code.",
                "error"
            );

            return;

        }


        const subtotal =
            getSubtotal();


        if (subtotal <= 0) {

            showCouponMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        // ---------------------------------------------
        // BUTTON LOADING
        // ---------------------------------------------

        const oldButtonHTML =
            applyCouponButton
                ? applyCouponButton.innerHTML
                : "";


        if (applyCouponButton) {

            applyCouponButton.disabled =
                true;

            applyCouponButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

            `;

        }


        try {

            const response =
                await fetch(
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

                        body:
                            JSON.stringify({

                                code:
                                    code,

                                subtotal:
                                    Number(
                                        subtotal.toFixed(2)
                                    )

                            })

                    }
                );


            const raw =
                await response.text();


            console.log(
                "COUPON STATUS:",
                response.status
            );


            console.log(
                "COUPON RESPONSE:",
                raw
            );


            let data;


            try {

                data =
                    JSON.parse(raw);

            }

            catch (error) {

                console.error(
                    "INVALID COUPON JSON:",
                    error
                );

                throw new Error(
                    "Server returned an invalid coupon response."
                );

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Invalid coupon."
                );

            }


            // =============================================
            // SAVE COUPON
            // =============================================

            appliedCoupon =
                data.coupon;


            // =============================================
            // SAVE LOCALLY
            // =============================================

            localStorage.setItem(
                "jigatoAppliedCoupon",
                JSON.stringify(
                    appliedCoupon
                )
            );


            // =============================================
            // UPDATE UI
            // =============================================

            showAppliedCoupon();


            updateSummary();


            showCouponMessage(
                data.message ||
                "Coupon applied successfully.",
                "success"
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
                        `${code} applied!`,

                    text:
                        `You saved ₹${Number(
                            appliedCoupon.discount || 0
                        ).toFixed(2)}`,

                    showConfirmButton:
                        false,

                    timer:
                        1800

                });

            }

        }

        catch (error) {

            console.error(
                "APPLY COUPON ERROR:",
                error
            );


            appliedCoupon =
                null;


            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );


            updateSummary();


            showCouponMessage(
                error.message ||
                "Unable to apply coupon.",
                "error"
            );

        }

        finally {

            if (applyCouponButton) {

                applyCouponButton.disabled =
                    false;

                applyCouponButton.innerHTML =
                    oldButtonHTML ||
                    "Apply";

            }

        }

    }


    // =====================================================
    // SHOW APPLIED COUPON
    // =====================================================

    function showAppliedCoupon() {

        if (
            !appliedCouponBox ||
            !appliedCoupon
        ) {

            return;

        }


        appliedCouponBox.style.display =
            "flex";


        const code =
            appliedCoupon.code ||
            "";


        const couponSpan =
            appliedCouponBox.querySelector(
                "span"
            );


        if (couponSpan) {

            couponSpan.textContent =
                `${code} Applied`;

        }


        if (couponInput) {

            couponInput.value =
                code;

            couponInput.disabled =
                true;

        }


        if (applyCouponButton) {

            applyCouponButton.disabled =
                true;

        }

    }


    // =====================================================
    // REMOVE COUPON
    // =====================================================

    function removeCoupon() {

        appliedCoupon =
            null;


        localStorage.removeItem(
            "jigatoAppliedCoupon"
        );


        // Remove old coupon from offers flow too

        localStorage.removeItem(
            "jigatoCoupon"
        );


        if (couponInput) {

            couponInput.value =
                "";

            couponInput.disabled =
                false;

        }


        if (applyCouponButton) {

            applyCouponButton.disabled =
                false;

        }


        if (appliedCouponBox) {

            appliedCouponBox.style.display =
                "none";

        }


        clearCouponMessage();


        updateSummary();

    }


    // =====================================================
    // LOAD SAVED COUPON
    // =====================================================

    function loadSavedCoupon() {

        let savedCoupon = null;


        // ---------------------------------------------
        // FIRST: already applied coupon
        // ---------------------------------------------

        try {

            const saved =
                localStorage.getItem(
                    "jigatoAppliedCoupon"
                );


            if (saved) {

                savedCoupon =
                    JSON.parse(saved);

            }

        }

        catch (error) {

            console.error(
                "SAVED COUPON ERROR:",
                error
            );

            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );

        }


        // ---------------------------------------------
        // SECOND: coupon from Offers page
        // ---------------------------------------------

        if (!savedCoupon) {

            const offerCode =
                localStorage.getItem(
                    "jigatoCoupon"
                );


            if (offerCode) {

                if (couponInput) {

                    couponInput.value =
                        offerCode;

                }

                // We don't apply automatically
                // until user clicks Apply.

                return;

            }

        }


        // ---------------------------------------------
        // RESTORE APPLIED COUPON
        // ---------------------------------------------

        if (savedCoupon) {

            appliedCoupon =
                savedCoupon;


            showAppliedCoupon();

            updateSummary();

        }

    }


    // =====================================================
    // COUPON MESSAGE
    // =====================================================

    function showCouponMessage(
        message,
        type
    ) {

        if (!couponMessage) return;


        couponMessage.textContent =
            message;


        couponMessage.className =
            `coupon-message ${type}`;

    }


    function clearCouponMessage() {

        if (!couponMessage) return;


        couponMessage.textContent =
            "";

        couponMessage.className =
            "coupon-message";

    }


    // =====================================================
    // PAYMENT
    // =====================================================

    document
        .querySelectorAll(".payment-option")
        .forEach(option => {

            option.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".payment-option"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    option.classList.add(
                        "active"
                    );


                    const radio =
                        option.querySelector(
                            'input[name="payment"]'
                        );


                    if (radio) {

                        radio.checked = true;

                    }

                }
            );

        });


    // =====================================================
    // PLACE ORDER BUTTON
    // =====================================================

    const placeOrderButton =
        $("placeOrderBtn");


    if (placeOrderButton) {

        placeOrderButton.addEventListener(
            "click",
            placeOrder
        );

    }


    // =====================================================
    // PLACE ORDER
    // =====================================================

    async function placeOrder() {

        // ---------------------------------------------
        // ADDRESS CHECK
        // ---------------------------------------------

        if (!selectedAddress) {

            showError(
                "Please select a delivery address."
            );

            return;

        }


        // ---------------------------------------------
        // CART CHECK
        // ---------------------------------------------

        if (!cartItems.length) {

            showError(
                "Your cart is empty."
            );

            return;

        }


        // ---------------------------------------------
        // PAYMENT
        // ---------------------------------------------

        const payment =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        const paymentMethod =
            payment
                ? payment.value
                : "COD";


        // ---------------------------------------------
        // TOTALS
        // ---------------------------------------------

        const subtotal =
            getSubtotal();


        const delivery =
            getDeliveryFee(
                subtotal
            );


        const gst =
            subtotal * GST_RATE;


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


        // ---------------------------------------------
        // ORDER ITEMS
        // ---------------------------------------------

        const orderItems =
            cartItems.map(item => {

                return {

                    foodId:
                        Number(
                            item.food_id
                        ),

                    quantity:
                        Number(
                            item.quantity
                        ),

                    price:
                        Number(
                            item.price
                        ),

                    food_id:
                        Number(
                            item.food_id
                        )

                };

            });


        // =================================================
        // ORDER DATA
        // =================================================

        const orderData = {

            // =============================================
            // ADDRESS ID
            // =============================================

            addressId:
                Number(
                    selectedAddress.id
                ),

            address_id:
                Number(
                    selectedAddress.id
                ),


            // =============================================
            // CUSTOMER
            // =============================================

            customerName:
                selectedAddress.full_name,

            customer_name:
                selectedAddress.full_name,


            // =============================================
            // PHONE
            // =============================================

            customerPhone:
                selectedAddress.phone,

            phone:
                selectedAddress.phone,


            // =============================================
            // ADDRESS
            // =============================================

            customerAddress:
                selectedAddress.address,

            address:
                selectedAddress.address,


            // =============================================
            // CITY
            // =============================================

            customerCity:
                selectedAddress.city,

            city:
                selectedAddress.city,


            // =============================================
            // STATE
            // =============================================

            customerState:
                selectedAddress.state,

            state:
                selectedAddress.state,


            // =============================================
            // PINCODE
            // =============================================

            customerPincode:
                selectedAddress.pincode,

            pincode:
                selectedAddress.pincode,


            // =============================================
            // PAYMENT
            // =============================================

            paymentMethod:
                paymentMethod,

            payment_method:
                paymentMethod,


            // =============================================
            // SUBTOTAL
            // =============================================

            subtotal:
                Number(
                    subtotal.toFixed(2)
                ),


            // =============================================
            // DELIVERY
            // =============================================

            deliveryFee:
                Number(
                    delivery.toFixed(2)
                ),

            delivery_fee:
                Number(
                    delivery.toFixed(2)
                ),


            // =============================================
            // GST
            // =============================================

            gst:
                Number(
                    gst.toFixed(2)
                ),


            // =============================================
            // DISCOUNT
            // =============================================

            discount:
                Number(
                    discount.toFixed(2)
                ),


            // =============================================
            // COUPON
            // =============================================

            couponCode:
                appliedCoupon
                    ? appliedCoupon.code
                    : null,

            coupon_code:
                appliedCoupon
                    ? appliedCoupon.code
                    : null,

            offerId:
                appliedCoupon
                    ? Number(
                        appliedCoupon.id
                    )
                    : null,

            offer_id:
                appliedCoupon
                    ? Number(
                        appliedCoupon.id
                    )
                    : null,


            // =============================================
            // TOTAL
            // =============================================

            total:
                Number(
                    total.toFixed(2)
                ),

            total_amount:
                Number(
                    total.toFixed(2)
                ),


            // =============================================
            // ITEMS
            // =============================================

            items:
                orderItems

        };


        console.log(
            "================================="
        );

        console.log(
            "FINAL ORDER DATA:",
            orderData
        );

        console.log(
            "APPLIED COUPON:",
            appliedCoupon
        );

        console.log(
            "================================="
        );


        // ---------------------------------------------
        // BUTTON
        // ---------------------------------------------

        const button =
            $("placeOrderBtn");


        if (button) {

            button.disabled = true;

            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Placing Order...
            `;

        }


        try {

            // =============================================
            // SEND ORDER
            // =============================================

            const response =
                await fetch(
                    "/api/orders",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify(
                                orderData
                            )

                    }
                );


            // =============================================
            // RAW RESPONSE
            // =============================================

            const rawText =
                await response.text();


            console.log(
                "ORDER STATUS:",
                response.status
            );


            console.log(
                "ORDER RAW RESPONSE:",
                rawText
            );


            // =============================================
            // JSON PARSE
            // =============================================

            let result;


            try {

                result =
                    JSON.parse(
                        rawText
                    );

            }

            catch (jsonError) {

                console.error(
                    "INVALID ORDER JSON:",
                    jsonError
                );

                throw new Error(
                    "Server returned an invalid response. Check server console."
                );

            }


            console.log(
                "ORDER RESPONSE:",
                result
            );


            // =============================================
            // ERROR
            // =============================================

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to place order."
                );

            }


            // =============================================
            // CLEAR COUPON AFTER SUCCESS
            // =============================================

            localStorage.removeItem(
                "jigatoAppliedCoupon"
            );

            localStorage.removeItem(
                "jigatoCoupon"
            );


            appliedCoupon =
                null;


            // =============================================
            // SUCCESS
            // =============================================

            await Swal.fire({

                icon: "success",

                title:
                    "Order Placed! 🎉",

                text:
                    result.message ||
                    "Your order has been placed successfully.",

                confirmButtonColor:
                    "#ff5a1f"

            });


            // =============================================
            // REDIRECT
            // =============================================

            window.location.href =
                "/";

        }


        catch (error) {

            console.error(
                "PLACE ORDER ERROR:",
                error
            );


            Swal.fire({

                icon: "error",

                title:
                    "Order Failed",

                text:
                    error.message ||
                    "Unable to place order.",

                confirmButtonColor:
                    "#ff5a1f"

            });

        }


        finally {

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
    // ICON
    // =====================================================

    function getIcon(label) {

        if (
            String(label).toLowerCase() ===
            "work"
        ) {

            return "💼";

        }


        if (
            String(label).toLowerCase() ===
            "other"
        ) {

            return "📍";

        }


        return "🏠";

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

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


    // =====================================================
    // ERROR ALERT
    // =====================================================

    function showError(message) {

        Swal.fire({

            icon: "error",

            title:
                "Oops!",

            text:
                message,

            confirmButtonColor:
                "#ff5a1f"

        });

    }


    // =====================================================
    // START
    // =====================================================

    loadCheckout();

});