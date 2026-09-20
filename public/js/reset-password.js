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
    | Safety Check
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
        console.error(
            "Reset Password: Required HTML elements are missing."
        );

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
    | Get Reset Token From URL
    |--------------------------------------------------------------------------
    |
    | Example:
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
    | Token Check
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
    | Clear API Message
    |--------------------------------------------------------------------------
    */

    function clearMessage() {

        message.textContent = "";

        message.className = "message";

    }


    /*
    |--------------------------------------------------------------------------
    | Show API Message
    |--------------------------------------------------------------------------
    */

    function showMessage(type, text) {

        message.textContent = text;

        message.className =
            `message ${type} show`;

    }


    /*
    |--------------------------------------------------------------------------
    | Clear Field Error
    |--------------------------------------------------------------------------
    */

    function clearFieldError(element, input) {

        element.textContent = "";

        element.classList.remove("show");

        input.classList.remove("input-error");

    }


    /*
    |--------------------------------------------------------------------------
    | Show Field Error
    |--------------------------------------------------------------------------
    */

    function showFieldError(element, input, text) {

        element.textContent = text;

        element.classList.add("show");

        input.classList.add("input-error");

    }


    /*
    |--------------------------------------------------------------------------
    | Password Validation
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
    | Confirm Password Validation
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
    | Password Rules UI
    |--------------------------------------------------------------------------
    */

    function updatePasswordRules() {

        const password =
            passwordInput.value;


        /*
        | Minimum length
        */

        if (password.length >= 6) {

            ruleLength?.classList.add("valid");

        } else {

            ruleLength?.classList.remove("valid");

        }


        /*
        | No leading/trailing spaces
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
    | Loading State
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
    | Disable Form
    |--------------------------------------------------------------------------
    */

    function disableForm() {

        passwordInput.disabled = true;

        confirmPasswordInput.disabled = true;

        submitBtn.disabled = true;

    }


    /*
    |--------------------------------------------------------------------------
    | Submit Form
    |--------------------------------------------------------------------------
    */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage();


            /*
            | Validate password
            */

            const passwordValid =
                validatePassword();


            /*
            | Validate confirmation
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
                | Send reset request
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
                | Safely Read Response
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

                    console.error(
                        "Invalid JSON response:",
                        responseText
                    );

                    throw new Error(
                        "Server returned an invalid response."
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | API Error
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
                | Success
                |--------------------------------------------------------------------------
                */

                showMessage(
                    "success",

                    data?.message ||
                    "Your password has been reset successfully."
                );


                /*
                |--------------------------------------------------------------------------
                | Clear Password Fields
                |--------------------------------------------------------------------------
                */

                passwordInput.value = "";

                confirmPasswordInput.value = "";


                /*
                |--------------------------------------------------------------------------
                | Disable Form After Success
                |--------------------------------------------------------------------------
                */

                passwordInput.disabled = true;

                confirmPasswordInput.disabled = true;

                submitBtn.disabled = true;


                /*
                |--------------------------------------------------------------------------
                | Redirect To Login
                |--------------------------------------------------------------------------
                |
                | Give user a moment to read success message.
                |
                */

                setTimeout(() => {

                    window.location.href =
                        "/login";

                }, 1800);


            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );


                showMessage(
                    "error",

                    error?.message ||
                    "Something went wrong. Please try again."
                );


            } finally {

                /*
                | Only restore loading state if
                | form is still usable.
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
            | If both fields contain values,
            | check matching while typing.
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
    | Initial Password Rules State
    |--------------------------------------------------------------------------
    */

    updatePasswordRules();

});