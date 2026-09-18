document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) =>
        document.getElementById(id);


    function showSuccess(title, message) {

        if (typeof Swal !== "undefined") {

            return Swal.fire({

                icon: "success",

                title:
                    title || "Success",

                text:
                    message || "Operation completed.",

                confirmButtonColor:
                    "#ff5a1f"

            });

        }

        alert(
            message || "Operation completed."
        );

        return Promise.resolve();

    }


    function showError(message) {

        if (typeof Swal !== "undefined") {

            Swal.fire({

                icon: "error",

                title: "Oops!",

                text:
                    message ||
                    "Something went wrong.",

                confirmButtonColor:
                    "#ff5a1f"

            });

            return;

        }

        alert(
            message ||
            "Something went wrong."
        );

    }


    async function getJSON(response) {

        const text =
            await response.text();

        console.log(
            "PROFILE API STATUS:",
            response.status
        );

        console.log(
            "PROFILE API RESPONSE:",
            text
        );

        if (!text.trim()) {

            throw new Error(
                "Server returned an empty response."
            );

        }

        try {

            return JSON.parse(text);

        }
        catch (error) {

            console.error(
                "INVALID JSON RESPONSE:",
                text
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }

    }


    function setValue(id, value) {

        const element =
            $(id);

        if (element) {

            element.value =
                value ?? "";

        }

    }


    function getValue(id) {

        const element =
            $(id);

        if (!element)
            return "";

        return String(
            element.value || ""
        ).trim();

    }


    function setAvatar(name) {

        const avatar =
            $("profileAvatar");

        const displayName =
            $("profileDisplayName");

        const cleanName =
            String(
                name || "Admin"
            ).trim();


        const initial =
            cleanName
                ? cleanName
                    .charAt(0)
                    .toUpperCase()
                : "A";


        if (avatar) {

            avatar.textContent =
                initial;

        }


        if (displayName) {

            displayName.textContent =
                cleanName ||
                "Admin";

        }

    }


    /* =====================================================
       LOAD PROFILE
    ===================================================== */

    async function loadProfile() {

        try {

            const response =
                await fetch(
                    "/admin/api/profile",
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


            const data =
                await getJSON(
                    response
                );


            if (response.status === 401) {

                window.location.href =
                    "/login";

                return;

            }


            if (response.status === 403) {

                window.location.href =
                    "/";

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load admin profile."
                );

            }


            const profile =
                data.profile || {};


            console.log(
                "ADMIN PROFILE:",
                profile
            );


            setValue(
                "profileName",
                profile.name
            );


            setValue(
                "profileEmail",
                profile.email
            );


            setValue(
                "profilePhone",
                profile.phone
            );


            setValue(
                "profileCity",
                profile.city
            );


            setValue(
                "profileRole",
                profile.role ||
                "admin"
            );


            if (
                $("profileJoined")
            ) {

                const date =
                    profile.created_at
                        ? new Date(
                            profile.created_at
                        )
                        : null;


                if (
                    date &&
                    !isNaN(
                        date.getTime()
                    )
                ) {

                    $("profileJoined")
                        .value =
                        date.toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                }
                else {

                    $("profileJoined")
                        .value = "";

                }

            }


            setAvatar(
                profile.name
            );


        }
        catch (error) {

            console.error(
                "LOAD PROFILE ERROR:",
                error
            );

            showError(
                error.message ||
                "Unable to load admin profile."
            );

        }

    }


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    async function saveProfile(
        event
    ) {

        if (event) {

            event.preventDefault();

        }


        const saveButton =
            $("saveProfileBtn");


        const name =
            getValue(
                "profileName"
            );


        const email =
            getValue(
                "profileEmail"
            )
            .toLowerCase();


        const phone =
            getValue(
                "profilePhone"
            );


        const city =
            getValue(
                "profileCity"
            );


        console.log(
            "SAVE PROFILE DATA:",
            {
                name,
                email,
                phone,
                city
            }
        );


        /* =================================================
           VALIDATION
        ================================================= */

        if (!name) {

            showError(
                "Full name is required."
            );

            return;

        }


        if (!email) {

            showError(
                "Email address is required."
            );

            return;

        }


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailRegex.test(email)
        ) {

            showError(
                "Please enter a valid email address."
            );

            return;

        }


        if (
            phone &&
            !/^[0-9+\-\s]{7,15}$/.test(
                phone
            )
        ) {

            showError(
                "Please enter a valid phone number."
            );

            return;

        }


        try {

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.dataset.oldText =
                    saveButton.innerHTML;

                saveButton.innerHTML =
                    `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                    `;

            }


            const response =
                await fetch(
                    "/admin/api/profile",
                    {

                        method: "PUT",

                        credentials:
                            "include",

                        cache:
                            "no-store",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone,

                                city:
                                    city

                            })

                    }
                );


            const data =
                await getJSON(
                    response
                );


            console.log(
                "SAVE PROFILE RESULT:",
                data
            );


            if (
                response.status === 401
            ) {

                window.location.href =
                    "/login";

                return;

            }


            if (
                response.status === 403
            ) {

                showError(
                    "Admin access required."
                );

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to save profile."
                );

            }


            const profile =
                data.profile || {};


            setValue(
                "profileName",
                profile.name ||
                name
            );


            setValue(
                "profileEmail",
                profile.email ||
                email
            );


            setValue(
                "profilePhone",
                profile.phone ||
                phone
            );


            setValue(
                "profileCity",
                profile.city ||
                city
            );


            setAvatar(
                profile.name ||
                name
            );


            localStorage.setItem(
                "jigatoAdminName",
                profile.name ||
                name
            );


            localStorage.setItem(
                "jigatoAdminCity",
                profile.city ||
                city
            );


            await showSuccess(
                "Profile Saved",
                data.message ||
                "Your admin profile has been updated successfully."
            );


        }
        catch (error) {

            console.error(
                "SAVE PROFILE ERROR:",
                error
            );

            showError(
                error.message ||
                "Unable to save profile."
            );

        }
        finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.innerHTML =
                    saveButton.dataset.oldText ||
                    `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Changes
                    `;

            }

        }

    }


    /* =====================================================
       CHANGE PASSWORD
    ===================================================== */

    async function changePassword(
        event
    ) {

        if (event) {

            event.preventDefault();

        }


        const button =
            $("changePasswordBtn");


        const currentPassword =
            $("currentPassword")
                ?.value || "";


        const newPassword =
            $("newPassword")
                ?.value || "";


        const confirmPassword =
            $("confirmPassword")
                ?.value || "";


        /* =================================================
           VALIDATION
        ================================================= */

        if (!currentPassword) {

            showError(
                "Current password is required."
            );

            return;

        }


        if (!newPassword) {

            showError(
                "New password is required."
            );

            return;

        }


        if (!confirmPassword) {

            showError(
                "Please confirm your new password."
            );

            return;

        }


        if (
            newPassword.length < 8
        ) {

            showError(
                "New password must be at least 8 characters."
            );

            return;

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            showError(
                "New password and confirm password do not match."
            );

            return;

        }


        if (
            currentPassword ===
            newPassword
        ) {

            showError(
                "New password must be different from your current password."
            );

            return;

        }


        try {

            if (button) {

                button.disabled =
                    true;

                button.dataset.oldText =
                    button.innerHTML;

                button.innerHTML =
                    `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Updating...
                    `;

            }


            console.log(
                "CHANGING ADMIN PASSWORD..."
            );


            const response =
                await fetch(
                    "/admin/api/profile/password",
                    {

                        method: "PUT",

                        credentials:
                            "include",

                        cache:
                            "no-store",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                currentPassword:
                                    currentPassword,

                                newPassword:
                                    newPassword,

                                confirmPassword:
                                    confirmPassword

                            })

                    }
                );


            const data =
                await getJSON(
                    response
                );


            console.log(
                "PASSWORD CHANGE RESULT:",
                data
            );


            if (
                response.status === 401
            ) {

                if (
                    data.message ===
                    "Admin login required."
                ) {

                    window.location.href =
                        "/login";

                    return;

                }


                throw new Error(
                    data.message ||
                    "Current password is incorrect."
                );

            }


            if (
                response.status === 403
            ) {

                throw new Error(
                    data.message ||
                    "Admin access required."
                );

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to change password."
                );

            }


            if (
                $("currentPassword")
            ) {

                $("currentPassword")
                    .value = "";

            }


            if (
                $("newPassword")
            ) {

                $("newPassword")
                    .value = "";

            }


            if (
                $("confirmPassword")
            ) {

                $("confirmPassword")
                    .value = "";

            }


            /* ===============================
               RESET PASSWORD MATCH UI
            =============================== */

            const confirm =
                $("confirmPassword");


            if (confirm) {

                confirm.classList.remove(
                    "password-match",
                    "password-mismatch"
                );

            }


            await showSuccess(
                "Password Changed",
                data.message ||
                "Your admin password has been updated successfully."
            );


        }
        catch (error) {

            console.error(
                "CHANGE PASSWORD ERROR:",
                error
            );

            showError(
                error.message ||
                "Unable to change password."
            );

        }
        finally {

            if (button) {

                button.disabled =
                    false;

                button.innerHTML =
                    button.dataset.oldText ||
                    `
                    <i class="fa-solid fa-lock"></i>
                    Change Password
                    `;

            }

        }

    }


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    function setupPasswordToggle(
        buttonId,
        inputId
    ) {

        const button =
            $(buttonId);

        const input =
            $(inputId);


        if (
            !button ||
            !input
        ) {

            return;

        }


        button.addEventListener(
            "click",
            () => {

                const showing =
                    input.type ===
                    "text";


                input.type =
                    showing
                        ? "password"
                        : "text";


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.classList.toggle(
                        "fa-eye",
                        showing
                    );

                    icon.classList.toggle(
                        "fa-eye-slash",
                        !showing
                    );

                }

            }
        );

    }


    /* =====================================================
       PASSWORD MATCH
    ===================================================== */

    function setupPasswordMatch() {

        const newPassword =
            $("newPassword");

        const confirmPassword =
            $("confirmPassword");


        if (
            !newPassword ||
            !confirmPassword
        ) {

            return;

        }


        function updateMatch() {

            const newValue =
                newPassword.value;


            const confirmValue =
                confirmPassword.value;


            confirmPassword.classList.remove(
                "password-match",
                "password-mismatch"
            );


            if (
                confirmValue &&
                newValue ===
                confirmValue
            ) {

                confirmPassword.classList.add(
                    "password-match"
                );

            }
            else if (
                confirmValue
            ) {

                confirmPassword.classList.add(
                    "password-mismatch"
                );

            }

        }


        newPassword.addEventListener(
            "input",
            updateMatch
        );


        confirmPassword.addEventListener(
            "input",
            updateMatch
        );

    }


    /* =====================================================
       FORM SUBMIT HANDLERS
    ===================================================== */

    const saveButton =
        $("saveProfileBtn");


    const changeButton =
        $("changePasswordBtn");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveProfile
        );

    }


    if (changeButton) {

        changeButton.addEventListener(
            "click",
            changePassword
        );

    }


    /* =====================================================
       PREVENT FORM DEFAULT SUBMIT
    ===================================================== */

    const forms =
        document.querySelectorAll(
            "form"
        );


    forms.forEach(
        form => {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                }
            );

        }
    );


    /* =====================================================
       PASSWORD TOGGLES
    ===================================================== */

    setupPasswordToggle(
        "toggleCurrentPassword",
        "currentPassword"
    );


    setupPasswordToggle(
        "toggleNewPassword",
        "newPassword"
    );


    setupPasswordToggle(
        "toggleConfirmPassword",
        "confirmPassword"
    );


    setupPasswordMatch();


    /* =====================================================
       START
    ===================================================== */

    loadProfile();

});