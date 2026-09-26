"use strict";
document.addEventListener("DOMContentLoaded", () => {
    /*
    |--------------------------------------------------------------------------
    | DOM Elements
    |--------------------------------------------------------------------------
    */
    const form = document.getElementById("resetPasswordForm");
    const passwordInput =
        document.getElementById("password");
    const confirmPasswordInput =
        document.getElementById("confirmPassword");
    const passwordError =
        document.getElementById("passwordError");
    const confirmPasswordError =
        document.getElementById("confirmPasswordError");
    const message =
        document.getElementById("message");
    const submitBtn =
        document.getElementById("submitBtn");
    const buttonText =
        document.getElementById("buttonText");
    const ruleLength =
        document.getElementById("ruleLength");
    const ruleSpace =
        document.getElementById("ruleSpace");
    /*
    |--------------------------------------------------------------------------
    | Suraksha Jaanch
    |--------------------------------------------------------------------------
    */
    if (
        !form ||
        !passwordInput ||
        !confirmPasswordInput ||
        !passwordError ||
        !confirmPasswordError ||
        !message ||
        !submitBtn ||
        !buttonText
    ) {
        return;
    }
    /*
    |--------------------------------------------------------------------------
    | API Endpoint
    |--------------------------------------------------------------------------
    */
    const API_URL =
        "/api/auth/reset-password";
    /*
    |--------------------------------------------------------------------------
    | URL se Reset Token praapt karein
    |--------------------------------------------------------------------------
    |
    | Udaaharan:
    |
    | /reset-password?token=abc123
    |
    */
    const urlParams =
        new URLSearchParams(window.location.search);
    const token =
        urlParams.get("token");
    /*
    |--------------------------------------------------------------------------
    | Token Jaanch
    |--------------------------------------------------------------------------
    */
    if (!token) {
        showMessage(
            "error",
            "This password reset link is invalid or incomplete."
        );
        disableForm();
        return;
    }
    /*
    |--------------------------------------------------------------------------
    | API Sandesh Hataayein
    |--------------------------------------------------------------------------
    */
    function clearMessage() {
        message.textContent = "";
        message.className = "message";
    }
    /*
    |--------------------------------------------------------------------------
    | API Sandesh Dikhaayein
    |--------------------------------------------------------------------------
    */
    function showMessage(type, text) {
        message.textContent = text;
        message.className =
            `message ${type} show`;
    }
    /*
    |--------------------------------------------------------------------------
    | Field Truti Hataayein
    |--------------------------------------------------------------------------
    */
    function clearFieldError(element, input) {
        element.textContent = "";
        element.classList.remove("show");
        input.classList.remove("input-error");
    }
    /*
    |--------------------------------------------------------------------------
    | Field Truti Dikhaayein
    |--------------------------------------------------------------------------
    */
    function showFieldError(element, input, text) {
        element.textContent = text;
        element.classList.add("show");
        input.classList.add("input-error");
    }
    /*
    |--------------------------------------------------------------------------
    | Password Jaanch
    |--------------------------------------------------------------------------
    */
    function validatePassword() {
        clearFieldError(
            passwordError,
            passwordInput
        );
        const password =
            passwordInput.value;
        if (!password) {
            showFieldError(
                passwordError,
                passwordInput,
                "Please enter a new password."
            );
            return false;
        }
        if (password.length < 6) {
            showFieldError(
                passwordError,
                passwordInput,
                "Password must be at least 6 characters."
            );
            return false;
        }
        if (password.length > 100) {
            showFieldError(
                passwordError,
                passwordInput,
                "Password is too long."
            );
            return false;
        }
        if (
            password.startsWith(" ") ||
            password.endsWith(" ")
        ) {
            showFieldError(
                passwordError,
                passwordInput,
                "Password cannot start or end with a space."
            );
            return false;
        }
        return true;
    }
    /*
    |--------------------------------------------------------------------------
    | Password Confirm Jaanch
    |--------------------------------------------------------------------------
    */
    function validateConfirmPassword() {
        clearFieldError(
            confirmPasswordError,
            confirmPasswordInput
        );
        const password =
            passwordInput.value;
        const confirmPassword =
            confirmPasswordInput.value;
        if (!confirmPassword) {
            showFieldError(
                confirmPasswordError,
                confirmPasswordInput,
                "Please confirm your new password."
            );
            return false;
        }
        if (password !== confirmPassword) {
            showFieldError(
                confirmPasswordError,
                confirmPasswordInput,
                "Passwords do not match."
            );
            return false;
        }
        return true;
    }
    /*
    |--------------------------------------------------------------------------
    | Password Niyam UI
    |--------------------------------------------------------------------------
    */
    function updatePasswordRules() {
        const password =
            passwordInput.value;
        /*
        | Kam se kam lambai
        */
        if (password.length >= 6) {
            ruleLength?.classList.add("valid");
        } else {
            ruleLength?.classList.remove("valid");
        }
        /*
        | Shuruat ya aakhir me space nahi
        */
        if (
            password.length > 0 &&
            !password.startsWith(" ") &&
            !password.endsWith(" ")
        ) {
            ruleSpace?.classList.add("valid");
        } else {
            ruleSpace?.classList.remove("valid");
        }
    }
    /*
    |--------------------------------------------------------------------------
    | Loading Sthiti
    |--------------------------------------------------------------------------
    */
    function setLoading(isLoading) {
        submitBtn.disabled =
            isLoading;
        passwordInput.disabled =
            isLoading;
        confirmPasswordInput.disabled =
            isLoading;
        if (isLoading) {
            submitBtn.classList.add("loading");
            buttonText.textContent =
                "Resetting...";
        } else {
            submitBtn.classList.remove("loading");
            buttonText.textContent =
                "Reset Password";
            passwordInput.disabled =
                false;
            confirmPasswordInput.disabled =
                false;
        }
    }
    /*
    |--------------------------------------------------------------------------
    | Form ko Band Karein
    |--------------------------------------------------------------------------
    */
    function disableForm() {
        passwordInput.disabled = true;
        confirmPasswordInput.disabled = true;
        submitBtn.disabled = true;
    }
    /*
    |--------------------------------------------------------------------------
    | Form Submit Karein
    |--------------------------------------------------------------------------
    */
    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();
            clearMessage();
            /*
            | Password jaanch
            */
            const passwordValid =
                validatePassword();
            /*
            | Confirm jaanch
            */
            const confirmValid =
                validateConfirmPassword();
            if (
                !passwordValid ||
                !confirmValid
            ) {
                return;
            }
            setLoading(true);
            try {
                /*
                |--------------------------------------------------------------------------
                | Reset anurodh bhejein
                |--------------------------------------------------------------------------
                */
                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                token: token,
                                password:
                                    passwordInput.value
                            })
                        }
                    );
                /*
                |--------------------------------------------------------------------------
                | Surakshit roop se uttar padhein
                |--------------------------------------------------------------------------
                */
                const responseText =
                    await response.text();
                let data = null;
                try {
                    data = responseText
                        ? JSON.parse(responseText)
                        : null;
                } catch (parseError) {
                    throw new Error(
                        "Server returned an invalid response."
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | API Truti
                |--------------------------------------------------------------------------
                */
                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to reset your password."
                    );
                }
                /*
                |--------------------------------------------------------------------------
                | Safalta
                |--------------------------------------------------------------------------
                */
                showMessage(
                    "success",
                    data?.message ||
                    "Your password has been reset successfully."
                );
                /*
                |--------------------------------------------------------------------------
                | Password field khali karein
                |--------------------------------------------------------------------------
                */
                passwordInput.value = "";
                confirmPasswordInput.value = "";
                /*
                |--------------------------------------------------------------------------
                | Safalta ke baad form band karein
                |--------------------------------------------------------------------------
                */
                passwordInput.disabled = true;
                confirmPasswordInput.disabled = true;
                submitBtn.disabled = true;
                /*
                |--------------------------------------------------------------------------
                | Login par bhejien
                |--------------------------------------------------------------------------
                |
                | Safalta sandesh padhne ke liye samay dein.
                |
                */
                setTimeout(() => {
                    window.location.href =
                        "/login";
                }, 1800);
            } catch (error) {
                showMessage(
                    "error",
                    error?.message ||
                    "Something went wrong. Please try again."
                );
            } finally {
                /*
                | Keval tab loading sthiti waapas karein jab
                | form upayog ke yogya ho.
                */
                if (
                    !submitBtn.disabled
                ) {
                    setLoading(false);
                }
            }
        }
    );
    /*
    |--------------------------------------------------------------------------
    | Password Input Events
    |--------------------------------------------------------------------------
    */
    passwordInput.addEventListener(
        "input",
        () => {
            clearFieldError(
                passwordError,
                passwordInput
            );
            updatePasswordRules();
        }
    );
    /*
    |--------------------------------------------------------------------------
    | Confirm Password Input Events
    |--------------------------------------------------------------------------
    */
    confirmPasswordInput.addEventListener(
        "input",
        () => {
            clearFieldError(
                confirmPasswordError,
                confirmPasswordInput
            );
            /*
            | Agar dono fields me value hai,
            | toh type karte waqt milaayein.
            */
            if (
                confirmPasswordInput.value &&
                passwordInput.value &&
                confirmPasswordInput.value !==
                    passwordInput.value
            ) {
                showFieldError(
                    confirmPasswordError,
                    confirmPasswordInput,
                    "Passwords do not match."
                );
            }
        }
    );
    /*
    |--------------------------------------------------------------------------
    | Password Visibility Toggle
    |--------------------------------------------------------------------------
    */
    const toggleButtons =
        document.querySelectorAll(
            ".toggle-password"
        );
    toggleButtons.forEach((button) => {
        button.addEventListener(
            "click",
            () => {
                const targetId =
                    button.dataset.target;
                const target =
                    document.getElementById(
                        targetId
                    );
                if (!target) {
                    return;
                }
                if (
                    target.type === "password"
                ) {
                    target.type = "text";
                    button.textContent = "🙈";
                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );
                } else {
                    target.type = "password";
                    button.textContent = "👁";
                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }
            }
        );
    });
    /*
    |--------------------------------------------------------------------------
    | Shuruaati Password Niyam Sthiti
    |--------------------------------------------------------------------------
    */
    updatePasswordRules();
});