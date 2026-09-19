// =====================================================
// JIGATO ADMIN SETTINGS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const $ = id =>
        document.getElementById(id);


    // =================================================
    // ELEMENTS
    // =================================================

    const form =
        $("settingsForm");

    const saveBtn =
        $("saveSettingsBtn");

    const statusBox =
        $("settingsStatus");


    // =================================================
    // SET STATUS
    // =================================================

    function setStatus(
        text,
        type = "ready"
    ) {

        if (!statusBox) {
            return;
        }


        const icons = {

            ready:
                "fa-circle-check",

            loading:
                "fa-spinner fa-spin",

            success:
                "fa-circle-check",

            error:
                "fa-circle-exclamation"

        };


        statusBox.innerHTML = `

            <i class="fa-solid ${
                icons[type] ||
                icons.ready
            }"></i>

            ${escapeHTML(text)}

        `;


        if (type === "success") {

            statusBox.style.color =
                "#16a34a";

        }
        else if (type === "error") {

            statusBox.style.color =
                "#dc2626";

        }
        else {

            statusBox.style.color =
                "#666";

        }

    }


    // =================================================
    // API HELPER
    // =================================================

    async function api(url, options = {}) {

    const response = await fetch(
        url,
        {
            credentials: "include",
            cache: "no-store",

            ...options,

            headers: {
                "Accept": "application/json",
                ...(options.headers || {})
            }
        }
    );


    // ============================================
    // SESSION EXPIRED / NOT LOGGED IN
    // ============================================

    if (response.status === 401) {

        window.location.replace("/login");

        throw new Error(
            "Session expired. Redirecting to login..."
        );
    }


    const text =
        await response.text();


    let data = {};


    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    }
    catch {

        throw new Error(
            "Invalid server response."
        );

    }


    // ============================================
    // OTHER ERRORS
    // ============================================

    if (!response.ok) {

        throw new Error(
            data.message ||
            `Request failed (${response.status}).`
        );

    }


    if (data.success === false) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;
    }


    // =================================================
    // FILL FORM
    // =================================================

    function fillForm(settings) {

        if (!settings) {
            return;
        }


        // GENERAL

        $("appName").value =
            settings.app_name ?? "";


        $("defaultCity").value =
            settings.default_city ?? "";


        $("supportEmail").value =
            settings.support_email ?? "";


        $("supportPhone").value =
            settings.support_phone ?? "";


        // DELIVERY

        $("deliveryFee").value =
            settings.delivery_fee ?? 0;


        $("freeDeliveryAbove").value =
            settings.free_delivery_above ?? 0;


        $("gstRate").value =
            settings.gst_rate ?? 0;


        $("minimumOrder").value =
            settings.minimum_order ?? 0;


        // PAYMENTS

        $("paymentCOD").checked =
            settings.payment_cod === true ||
            Number(settings.payment_cod) === 1;


        $("paymentUPI").checked =
            settings.payment_upi === true ||
            Number(settings.payment_upi) === 1;


        $("paymentCard").checked =
            settings.payment_card === true ||
            Number(settings.payment_card) === 1;


        // FEATURES

        $("offersEnabled").checked =
            settings.offers_enabled === true ||
            Number(settings.offers_enabled) === 1;


        $("couponsEnabled").checked =
            settings.coupons_enabled === true ||
            Number(settings.coupons_enabled) === 1;


        $("freeDeliveryOffers").checked =
            settings.free_delivery_offers === true ||
            Number(settings.free_delivery_offers) === 1;


        // ALERTS

        $("newOrderAlert").checked =
            settings.new_order_alert === true ||
            Number(settings.new_order_alert) === 1;


        $("orderStatusAlert").checked =
            settings.order_status_alert === true ||
            Number(settings.order_status_alert) === 1;


        $("newCustomerAlert").checked =
            settings.new_customer_alert === true ||
            Number(settings.new_customer_alert) === 1;


        $("offerExpiryAlert").checked =
            settings.offer_expiry_alert === true ||
            Number(settings.offer_expiry_alert) === 1;

    }


    // =================================================
    // GET SETTINGS
    // =================================================

    async function loadSettings() {

        try {

            setStatus(
                "Loading...",
                "loading"
            );


            const data =
                await api(
                    "/admin/api/settings"
                );


            if (
                !data.settings
            ) {

                throw new Error(
                    "Settings data not found."
                );

            }


            fillForm(
                data.settings
            );


            setStatus(
                "Ready",
                "ready"
            );


        }
        catch (error) {

            console.error(
                "LOAD SETTINGS ERROR:",
                error
            );


            setStatus(
                "Load failed",
                "error"
            );


            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire(
                    "Error",
                    error.message,
                    "error"
                );

            }
            else {

                alert(
                    error.message
                );

            }

        }

    }


    // =================================================
    // VALIDATION
    // =================================================

    function validateForm() {

        const appName =
            $("appName").value.trim();


        const city =
            $("defaultCity").value.trim();


        const email =
            $("supportEmail").value.trim();


        if (!appName) {

            return {
                valid: false,
                message:
                    "App name is required."
            };

        }


        if (!city) {

            return {
                valid: false,
                message:
                    "Default city is required."
            };

        }


        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            return {
                valid: false,
                message:
                    "Enter a valid support email."
            };

        }


        const deliveryFee =
            Number(
                $("deliveryFee").value
            );


        const freeDeliveryAbove =
            Number(
                $("freeDeliveryAbove").value
            );


        const gstRate =
            Number(
                $("gstRate").value
            );


        const minimumOrder =
            Number(
                $("minimumOrder").value
            );


        if (
            !Number.isFinite(
                deliveryFee
            ) ||
            deliveryFee < 0
        ) {

            return {
                valid: false,
                message:
                    "Delivery fee must be valid."
            };

        }


        if (
            !Number.isFinite(
                freeDeliveryAbove
            ) ||
            freeDeliveryAbove < 0
        ) {

            return {
                valid: false,
                message:
                    "Free delivery amount must be valid."
            };

        }


        if (
            !Number.isFinite(
                gstRate
            ) ||
            gstRate < 0 ||
            gstRate > 100
        ) {

            return {
                valid: false,
                message:
                    "GST rate must be between 0 and 100."
            };

        }


        if (
            !Number.isFinite(
                minimumOrder
            ) ||
            minimumOrder < 0
        ) {

            return {
                valid: false,
                message:
                    "Minimum order must be valid."
            };

        }


        // At least one payment method

        const paymentAvailable =
            $("paymentCOD").checked ||
            $("paymentUPI").checked ||
            $("paymentCard").checked;


        if (!paymentAvailable) {

            return {
                valid: false,
                message:
                    "At least one payment method must be enabled."
            };

        }


        return {
            valid: true
        };

    }


    // =================================================
    // COLLECT FORM DATA
    // =================================================

    function collectSettings() {

        return {

            app_name:
                $("appName").value.trim(),

            support_email:
                $("supportEmail").value.trim(),

            support_phone:
                $("supportPhone").value.trim(),

            default_city:
                $("defaultCity").value.trim(),


            delivery_fee:
                Number(
                    $("deliveryFee").value || 0
                ),

            free_delivery_above:
                Number(
                    $("freeDeliveryAbove").value || 0
                ),

            gst_rate:
                Number(
                    $("gstRate").value || 0
                ),

            minimum_order:
                Number(
                    $("minimumOrder").value || 0
                ),


            payment_cod:
                $("paymentCOD").checked,

            payment_upi:
                $("paymentUPI").checked,

            payment_card:
                $("paymentCard").checked,


            offers_enabled:
                $("offersEnabled").checked,

            coupons_enabled:
                $("couponsEnabled").checked,

            free_delivery_offers:
                $("freeDeliveryOffers").checked,


            new_order_alert:
                $("newOrderAlert").checked,

            order_status_alert:
                $("orderStatusAlert").checked,

            new_customer_alert:
                $("newCustomerAlert").checked,

            offer_expiry_alert:
                $("offerExpiryAlert").checked

        };

    }


    // =================================================
    // SAVE SETTINGS
    // =================================================

    async function saveSettings() {

        const validation =
            validateForm();


        if (!validation.valid) {

            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire(
                    "Check Settings",
                    validation.message,
                    "warning"
                );

            }
            else {

                alert(
                    validation.message
                );

            }

            return;

        }


        const settings =
            collectSettings();


        console.log(
            "SETTINGS DATA:",
            settings
        );


        const originalHTML =
            saveBtn.innerHTML;


        try {

            saveBtn.disabled =
                true;


            saveBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Saving...</span>
            `;


            setStatus(
                "Saving...",
                "loading"
            );


            const data =
                await api(
                    "/admin/api/settings",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                settings
                            )
                    }
                );


            console.log(
                "SAVE SETTINGS RESPONSE:",
                data
            );


            if (!data.settings) {

                throw new Error(
                    "Server did not return updated settings."
                );

            }


            // Fresh database values

            fillForm(
                data.settings
            );


            setStatus(
                "Saved",
                "success"
            );


            // Let other pages know

            localStorage.setItem(
                "jigatoSettingsUpdatedAt",
                String(Date.now())
            );


            window.dispatchEvent(
                new CustomEvent(
                    "jigato:settings-updated",
                    {
                        detail:
                            data.settings
                    }
                )
            );


            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({

                    icon:
                        "success",

                    title:
                        "Settings Saved",

                    text:
                        "Your settings have been updated.",

                    timer:
                        1400,

                    showConfirmButton:
                        false

                });

            }


            setTimeout(
                () => {

                    setStatus(
                        "Ready",
                        "ready"
                    );

                },
                1500
            );

        }
        catch (error) {

            console.error(
                "SAVE SETTINGS ERROR:",
                error
            );


            setStatus(
                "Save failed",
                "error"
            );


            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire(
                    "Save Failed",
                    error.message,
                    "error"
                );

            }
            else {

                alert(
                    error.message
                );

            }

        }
        finally {

            saveBtn.disabled =
                false;

            saveBtn.innerHTML =
                originalHTML;

        }

    }


    // =================================================
    // FORM SUBMIT
    // =================================================

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveSettings();

            }
        );

    }


    // =================================================
    // BUTTON CLICK
    // =================================================

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            event => {

                if (
                    form &&
                    event.detail === undefined
                ) {
                    return;
                }

            }
        );

    }


    // =================================================
    // NUMBER INPUT CLEANUP
    // =================================================

    [
        "deliveryFee",
        "freeDeliveryAbove",
        "gstRate",
        "minimumOrder"

    ].forEach(id => {

        const input =
            $(id);

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            () => {

                if (
                    Number(input.value) < 0
                ) {

                    input.value = 0;

                }

            }
        );

    });


    // =================================================
    // ESCAPE HTML
    // =================================================

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


    // =================================================
    // START
    // =================================================

    loadSettings();

});