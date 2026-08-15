document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ==================================================
           ELEMENTS
        ================================================== */

        const form =
            document.getElementById(
                "registerForm"
            );


        const name =
            document.getElementById(
                "name"
            );


        const email =
            document.getElementById(
                "email"
            );


        const phone =
            document.getElementById(
                "phone"
            );


        const city =
            document.getElementById(
                "city"
            );


        const password =
            document.getElementById(
                "password"
            );


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        const role =
            document.getElementById(
                "role"
            );


        const terms =
            document.getElementById(
                "terms"
            );


        const submit =
            document.getElementById(
                "registerSubmit"
            );


        const message =
            document.getElementById(
                "registerMessage"
            );


        const togglePassword =
            document.getElementById(
                "togglePassword"
            );


        const toggleConfirm =
            document.getElementById(
                "toggleConfirm"
            );


        const strengthText =
            document.getElementById(
                "strengthText"
            );


        const strengthBars =
            document.querySelectorAll(
                ".strength-bar span"
            );



        /* ==================================================
           MESSAGE
        ================================================== */

        function showMessage(
            text,
            type
        ) {

            if (!message)
                return;


            message.textContent =
                text;


            message.className =
                "register-message " +
                type;


            message.style.display =
                "block";

        }



        function hideMessage() {

            if (!message)
                return;


            message.textContent =
                "";

            message.className =
                "register-message";

            message.style.display =
                "none";

        }



        /* ==================================================
           PASSWORD TOGGLE
        ================================================== */

        togglePassword?.addEventListener(
            "click",
            () => {

                if (
                    password.type ===
                    "password"
                ) {

                    password.type =
                        "text";


                    togglePassword.innerHTML =
                        `
                        <i
                            class="fa-solid fa-eye-slash"
                        ></i>
                        `;

                } else {

                    password.type =
                        "password";


                    togglePassword.innerHTML =
                        `
                        <i
                            class="fa-solid fa-eye"
                        ></i>
                        `;

                }

            }
        );



        /* ==================================================
           CONFIRM PASSWORD TOGGLE
        ================================================== */

        toggleConfirm?.addEventListener(
            "click",
            () => {

                if (
                    confirmPassword.type ===
                    "password"
                ) {

                    confirmPassword.type =
                        "text";


                    toggleConfirm.innerHTML =
                        `
                        <i
                            class="fa-solid fa-eye-slash"
                        ></i>
                        `;

                } else {

                    confirmPassword.type =
                        "password";


                    toggleConfirm.innerHTML =
                        `
                        <i
                            class="fa-solid fa-eye"
                        ></i>
                        `;

                }

            }
        );



        /* ==================================================
           BACK BUTTON
        ================================================== */

        document
            .getElementById(
                "backButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        document.referrer &&
                        document.referrer
                            .includes(
                                window.location.host
                            )
                    ) {

                        window.history.back();

                        return;

                    }


                    window.location.href =
                        "/";

                }
            );



        /* ==================================================
           PHONE ONLY NUMBERS
        ================================================== */

        phone?.addEventListener(
            "input",
            () => {

                phone.value =
                    phone.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            10
                        );

            }
        );



        /* ==================================================
           PASSWORD STRENGTH
        ================================================== */

        password?.addEventListener(
            "input",
            () => {

                const value =
                    password.value;


                let score = 0;


                if (
                    value.length >= 8
                )
                    score++;


                if (
                    /[A-Z]/.test(
                        value
                    )
                )
                    score++;


                if (
                    /[0-9]/.test(
                        value
                    )
                )
                    score++;


                if (
                    /[^A-Za-z0-9]/.test(
                        value
                    )
                )
                    score++;


                strengthBars.forEach(
                    (bar, index) => {

                        bar.style.background =
                            index < score
                                ? (
                                    score <= 1
                                        ? "#ef4444"
                                        : score === 2
                                            ? "#f59e0b"
                                            : "#22c55e"
                                )
                                : "#e8e8e8";

                    }
                );


                if (!value) {

                    strengthText.textContent =
                        "Use 8+ characters";

                } else if (
                    score <= 1
                ) {

                    strengthText.textContent =
                        "Weak password";

                } else if (
                    score === 2
                ) {

                    strengthText.textContent =
                        "Medium password";

                } else if (
                    score === 3
                ) {

                    strengthText.textContent =
                        "Good password";

                } else {

                    strengthText.textContent =
                        "Strong password";

                }

            }
        );



        /* ==================================================
           REGISTER
        ================================================== */

        form?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                hideMessage();



                /* ==========================
                   VALUES
                ========================== */

                const userName =
                    name.value.trim();


                const userEmail =
                    email.value.trim();


                const userPhone =
                    phone.value.trim();


                const userCity =
                    city.value.trim();


                const userPassword =
                    password.value;


                const userConfirm =
                    confirmPassword.value;


                const userRole =
                    role.value;



                /* ==========================
                   NAME
                ========================== */

                if (
                    userName.length < 2
                ) {

                    showMessage(
                        "Please enter your full name.",
                        "error"
                    );

                    name.focus();

                    return;

                }



                /* ==========================
                   EMAIL
                ========================== */

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(
                        userEmail
                    )
                ) {

                    showMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    email.focus();

                    return;

                }



                /* ==========================
                   PHONE
                ========================== */

                if (
                    userPhone.length !== 10
                ) {

                    showMessage(
                        "Please enter a valid 10-digit mobile number.",
                        "error"
                    );

                    phone.focus();

                    return;

                }



                /* ==========================
                   CITY
                ========================== */

                if (
                    userCity.length < 2
                ) {

                    showMessage(
                        "Please enter your city.",
                        "error"
                    );

                    city.focus();

                    return;

                }



                /* ==========================
                   PASSWORD
                ========================== */

                if (
                    userPassword.length < 8
                ) {

                    showMessage(
                        "Password must be at least 8 characters.",
                        "error"
                    );

                    password.focus();

                    return;

                }



                /* ==========================
                   CONFIRM
                ========================== */

                if (
                    userPassword !==
                    userConfirm
                ) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    confirmPassword.focus();

                    return;

                }



                /* ==========================
                   TERMS
                ========================== */

                if (
                    !terms.checked
                ) {

                    showMessage(
                        "Please accept the Terms and Privacy Policy.",
                        "error"
                    );

                    return;

                }



                /* ==========================
                   LOADING
                ========================== */

                submit.disabled =
                    true;


                submit.innerHTML =
                    `
                    <span>
                        Creating Account...
                    </span>

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>
                    `;



                try {

                    /* ==========================
                       BACKEND REQUEST
                    ========================== */

                    const response =
                        await fetch(
                            "/register",
                            {
                                method:
                                    "POST",

                                credentials:
                                    "include",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        name:
                                            userName,

                                        email:
                                            userEmail,

                                        phone:
                                            userPhone,

                                        city:
                                            userCity,

                                        password:
                                            userPassword,

                                        role:
                                            userRole

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "REGISTER RESPONSE:",
                        data
                    );



                    /* ==========================
                       FAILED
                    ========================== */

                    if (
                        !response.ok ||
                        data.success !== true
                    ) {

                        showMessage(
                            data.message ||
                            "Registration failed. Please try again.",
                            "error"
                        );

                        return;

                    }



                    /* ==========================
                       SUCCESS
                    ========================== */

                    showMessage(
                        "🎉 Account created successfully! Redirecting to login...",
                        "success"
                    );


                    /*
                     * Redirect login
                     */

                    setTimeout(
                        () => {

                            window.location.href =
                                "/login";

                        },
                        1200
                    );


                } catch (error) {

                    console.error(
                        "REGISTER ERROR:",
                        error
                    );


                    showMessage(
                        "Unable to connect to server. Please try again.",
                        "error"
                    );


                } finally {

                    setTimeout(
                        () => {

                            submit.disabled =
                                false;


                            submit.innerHTML =
                                `
                                <span>
                                    Create Account
                                </span>

                                <i
                                    class="fa-solid fa-arrow-right"
                                ></i>
                                `;

                        },
                        1300
                    );

                }

            }
        );



        /* ==================================================
           GOOGLE REGISTER
        ================================================== */

        document
            .getElementById(
                "googleRegister"
            )
            ?.addEventListener(
                "click",
                () => {

                    /*
                     * Actual Google OAuth backend
                     * route required.
                     */

                    window.location.href =
                        "/auth/google";

                }
            );


    }
);