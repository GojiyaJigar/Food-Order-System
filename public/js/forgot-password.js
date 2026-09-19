const forgotForm =
    document.getElementById("forgotPasswordForm");

const emailInput =
    document.getElementById("email");

const sendResetBtn =
    document.getElementById("sendResetBtn");

const forgotMessage =
    document.getElementById("forgotMessage");


forgotForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            emailInput.value.trim();


        if (!email) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            return;

        }


        sendResetBtn.disabled = true;

        sendResetBtn.textContent =
            "Sending...";


        try {

            const response =
                await fetch(
                    "/forgot-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Something went wrong."
                );

            }


            showMessage(
                data.message ||
                "If this email is registered, a reset link has been sent.",
                "success"
            );


            forgotForm.reset();


        }
        catch (error) {

            console.error(
                "FORGOT PASSWORD ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to process request.",
                "error"
            );

        }
        finally {

            sendResetBtn.disabled = false;

            sendResetBtn.textContent =
                "Send Reset Link";

        }

    }
);


function showMessage(
    message,
    type
) {

    forgotMessage.textContent =
        message;

    forgotMessage.style.display =
        "block";


    if (type === "success") {

        forgotMessage.style.color =
            "green";

    }
    else {

        forgotMessage.style.color =
            "red";

    }

}