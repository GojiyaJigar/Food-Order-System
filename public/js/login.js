document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ==================================================
           ELEMENTS
        ================================================== */

        const form =
            document.getElementById(
                "loginForm"
            );


        const email =
            document.getElementById(
                "email"
            );


        const password =
            document.getElementById(
                "password"
            );


        const submit =
            document.getElementById(
                "loginSubmit"
            );


        const togglePassword =
            document.getElementById(
                "togglePassword"
            );


        const message =
            document.getElementById(
                "loginMessage"
            );


        const backButton =
            document.getElementById(
                "backButton"
            );


        const googleLogin =
            document.getElementById(
                "googleLogin"
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
                "login-message " +
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
                "login-message";

            message.style.display =
                "none";

        }



        /* ==================================================
           PASSWORD SHOW / HIDE
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


                    togglePassword
                        .setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                } else {

                    password.type =
                        "password";


                    togglePassword.innerHTML =
                        `
                        <i
                            class="fa-solid fa-eye"
                        ></i>
                        `;


                    togglePassword
                        .setAttribute(
                            "aria-label",
                            "Show password"
                        );

                }

            }
        );



        /* ==================================================
           BACK BUTTON
        ================================================== */

        backButton?.addEventListener(
            "click",
            () => {

                /*
                 * Agar previous page isi website
                 * se hai to back.
                 */

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


                /*
                 * Otherwise Home
                 */

                window.location.href =
                    "/";

            }
        );



        /* ==================================================
           LOGIN
        ================================================== */

        form?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                hideMessage();


                const userEmail =
                    email.value.trim();


                const userPassword =
                    password.value;


                /* ==========================
                   VALIDATION
                ========================== */

                if (!userEmail) {

                    showMessage(
                        "Please enter your email address.",
                        "error"
                    );

                    email.focus();

                    return;

                }


                if (!userPassword) {

                    showMessage(
                        "Please enter your password.",
                        "error"
                    );

                    password.focus();

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
                        Logging in...
                    </span>

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>
                    `;



                try {

                    const response =
                        await fetch(
                            "/login",
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

                                        email:
                                            userEmail,

                                        password:
                                            userPassword

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    console.log(
                        "LOGIN RESPONSE:",
                        data
                    );



                    /* ==========================
                       LOGIN FAILED
                    ========================== */

                    if (
                        !response.ok ||
                        data.success !== true
                    ) {

                        showMessage(
                            data.message ||
                            "Invalid email or password.",
                            "error"
                        );

                        return;

                    }



                    /* ==========================
                       SUCCESS
                    ========================== */

                    showMessage(
                        "Login successful! Redirecting...",
                        "success"
                    );


                    /*
                     * Small delay so user sees
                     * success message.
                     */

                    setTimeout(
                        () => {

                            window.location.href =
                                "/";

                        },
                        700
                    );


                } catch (error) {

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );


                    showMessage(
                        "Unable to connect to server. Please try again.",
                        "error"
                    );


                } finally {

                    /*
                     * Agar redirect nahi hua,
                     * button normal state mein.
                     */

                    setTimeout(
                        () => {

                            submit.disabled =
                                false;


                            submit.innerHTML =
                                `
                                <span>
                                    Login
                                </span>

                                <i
                                    class="fa-solid fa-arrow-right"
                                ></i>
                                `;

                        },
                        800
                    );

                }

            }
        );



        /* ==================================================
           GOOGLE LOGIN
        ================================================== */

        googleLogin?.addEventListener(
            "click",
            () => {

                /*
                 * Google OAuth backend route.
                 *
                 * IMPORTANT:
                 * Backend mein /auth/google
                 * route configured hona chahiye.
                 */

                window.location.href =
                    "/auth/google";

            }
        );


    }
);