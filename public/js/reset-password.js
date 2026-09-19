const resetForm =
    document.getElementById(
        "resetPasswordForm"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirmPassword"
    );


const resetPasswordBtn =
    document.getElementById(
        "resetPasswordBtn"
    );


const resetMessage =
    document.getElementById(
        "resetMessage"
    );


// =====================================================
// GET TOKEN FROM URL
// =====================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const token =
    urlParams.get("token");


// =====================================================
// TOKEN CHECK
// =====================================================

if (!token) {

    showMessage(
        "Invalid or missing password reset link.",
        "error"
    );

    resetPasswordBtn.disabled = true;

}


// =====================================================
// FORM SUBMIT
// =====================================================

resetForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (!password || !confirmPassword) {

            showMessage(
                "Please fill all fields.",
                "error"
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                "Password must be at least 6 characters.",
                "error"
            );

            return;

        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;

        }


        // =================================================
        // BUTTON
        // =================================================

        resetPasswordBtn.disabled = true;

        resetPasswordBtn.textContent =
            "Resetting...";


        try {

            const response =
                await fetch(
                    "/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                token,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to reset password."
                );

            }


            // =================================================
            // SUCCESS
            // =================================================

            showMessage(
                data.message ||
                "Password reset successful.",
                "success"
            );


            resetForm.reset();


            resetPasswordBtn.disabled =
                true;


            // Login page par bhejo

            setTimeout(
                () => {

                    window.location.href =
                        "/login";

                },
                2000
            );


        }

        catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong.",
                "error"
            );


            resetPasswordBtn.disabled =
                false;

            resetPasswordBtn.textContent =
                "Reset Password";

        }

    }
);


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    resetMessage.textContent =
        message;

    resetMessage.style.display =
        "block";


    if (type === "success") {

        resetMessage.style.color =
            "green";

    }

    else {

        resetMessage.style.color =
            "red";

    }

}