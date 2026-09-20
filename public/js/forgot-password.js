"use strict";

/*
|--------------------------------------------------------------------------
| Jigato - Forgot Password
|--------------------------------------------------------------------------
| Flow:
|
| User enters email
|       ↓
| Frontend validation
|       ↓
| POST /api/auth/forgot-password
|       ↓
| Backend generates secure reset token
|       ↓
| Token hash stored in database
|       ↓
| Reset email sent
|       ↓
| Success message shown
|--------------------------------------------------------------------------
*/


document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgotPasswordForm");
    const emailInput = document.getElementById("email");

    const emailError = document.getElementById("emailError");

    const message = document.getElementById("message");

    const submitBtn = document.getElementById("submitBtn");
    const buttonText = document.getElementById("buttonText");


    /*
    |--------------------------------------------------------------------------
    | Safety Check
    |--------------------------------------------------------------------------
    */

    if (
        !form ||
        !emailInput ||
        !emailError ||
        !message ||
        !submitBtn ||
        !buttonText
    ) {
        console.error(
            "Forgot Password: Required HTML elements are missing."
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Constants
    |--------------------------------------------------------------------------
    */

    const API_URL = "/api/auth/forgot-password";


    /*
    |--------------------------------------------------------------------------
    | Helper - Clear Messages
    |--------------------------------------------------------------------------
    */

    function clearMessage() {

        message.textContent = "";

        message.className = "message";

    }


    /*
    |--------------------------------------------------------------------------
    | Helper - Show Message
    |--------------------------------------------------------------------------
    */

    function showMessage(type, text) {

        message.textContent = text;

        message.className = `message ${type} show`;

    }


    /*
    |--------------------------------------------------------------------------
    | Helper - Clear Email Error
    |--------------------------------------------------------------------------
    */

    function clearEmailError() {

        emailError.textContent = "";

        emailError.classList.remove("show");

        emailInput.classList.remove("input-error");

    }


    /*
    |--------------------------------------------------------------------------
    | Helper - Show Email Error
    |--------------------------------------------------------------------------
    */

    function showEmailError(text) {

        emailError.textContent = text;

        emailError.classList.add("show");

        emailInput.classList.add("input-error");

    }


    /*
    |--------------------------------------------------------------------------
    | Email Validation
    |--------------------------------------------------------------------------
    */

    function isValidEmail(email) {

        /*
        | Basic and practical email validation.
        */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    function validateForm() {

        clearEmailError();

        clearMessage();


        const email = emailInput.value.trim();


        /*
        | Empty email
        */

        if (!email) {

            showEmailError(
                "Please enter your email address."
            );

            emailInput.focus();

            return false;
        }


        /*
        | Email length
        */

        if (email.length > 100) {

            showEmailError(
                "Email address is too long."
            );

            emailInput.focus();

            return false;
        }


        /*
        | Invalid email
        */

        if (!isValidEmail(email)) {

            showEmailError(
                "Please enter a valid email address."
            );

            emailInput.focus();

            return false;
        }


        return true;

    }


    /*
    |--------------------------------------------------------------------------
    | Loading State
    |--------------------------------------------------------------------------
    */

    function setLoading(isLoading) {

        submitBtn.disabled = isLoading;

        emailInput.disabled = isLoading;


        if (isLoading) {

            submitBtn.classList.add("loading");

            buttonText.textContent = "Sending...";

        } else {

            submitBtn.classList.remove("loading");

            buttonText.textContent = "Send Reset Link";

            emailInput.disabled = false;

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Submit Form
    |--------------------------------------------------------------------------
    */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        /*
        | Validate before API request
        */

        if (!validateForm()) {
            return;
        }


        const email =
            emailInput.value.trim().toLowerCase();


        setLoading(true);


        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );


            /*
            |--------------------------------------------------------------------------
            | Read response safely
            |--------------------------------------------------------------------------
            |
            | We first read text instead of directly calling response.json().
            | This prevents frontend crashes if the server accidentally sends
            | invalid/non-JSON content.
            |
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
                    "Invalid JSON response from server:",
                    responseText
                );

                throw new Error(
                    "Server returned an invalid response."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | HTTP Error
            |--------------------------------------------------------------------------
            */

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to process your request."
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
                "If an account exists with this email, a password reset link has been sent."
            );


            /*
            |--------------------------------------------------------------------------
            | Clear form after successful request
            |--------------------------------------------------------------------------
            */

            emailInput.value = "";


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            /*
            |--------------------------------------------------------------------------
            | User-friendly error
            |--------------------------------------------------------------------------
            */

            showMessage(
                "error",

                error?.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            setLoading(false);

        }

    });


    /*
    |--------------------------------------------------------------------------
    | Remove error while typing
    |--------------------------------------------------------------------------
    */

    emailInput.addEventListener(
        "input",
        () => {

            clearEmailError();

            /*
            | If user starts correcting email,
            | remove old API message as well.
            */

            if (
                message.classList.contains("error")
            ) {
                clearMessage();
            }

        }
    );


    /*
    |--------------------------------------------------------------------------
    | Entered email cleanup
    |--------------------------------------------------------------------------
    */

    emailInput.addEventListener(
        "blur",
        () => {

            emailInput.value =
                emailInput.value.trim();

        }
    );

});