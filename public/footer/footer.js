document.addEventListener("DOMContentLoaded", () => {
    // JIGATO FOOTER
    loadFooter();

    // LOAD FOOTER HTML
    async function loadFooter() {
        try {
            let response = await fetch("/footer/footer.html", { method: "GET", cache: "no-store" });
            // Fallback path
            if (!response.ok) {
                response = await fetch("/footer.html", { method: "GET", cache: "no-store" });
            }
            if (!response.ok) {
                throw new Error("Footer HTML not found.");
            }
            const html = await response.text();
            if (!html.trim()) {
                throw new Error("Footer HTML is empty.");
            }
            // FIND FOOTER CONTAINER
            let footerContainer = document.getElementById("footer");
            if (!footerContainer) {
                footerContainer = document.getElementById("footerContainer");
            }
            // INSERT FOOTER
            if (footerContainer) {
                footerContainer.innerHTML = html;
            } else {
                const wrapper = document.createElement("div");
                wrapper.id = "dynamicFooter";
                wrapper.innerHTML = html;
                document.body.appendChild(wrapper);
            }
            // INITIALIZE
            setFooterYear();
            setupSupportModal();
            loadAdminSettings();
        } catch (error) {
            console.error("JIGATO FOOTER ERROR:", error);
        }
    }

    // LOAD CURRENT YEAR
    function setFooterYear() {
        const year = document.getElementById("footerYear");
        if (year) {
            year.textContent = new Date().getFullYear();
        }
    }

    // LOAD ADMIN SETTINGS
    async function loadAdminSettings() {
        try {
            const response = await fetch("/api/settings", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) {
                throw new Error("Unable to load application settings.");
            }
            const data = await response.json();
            if (!data || data.success !== true || !data.settings) {
                throw new Error("Settings data not available.");
            }
            const settings = data.settings;
            // GET ADMIN VALUES
            const supportEmail = String(settings.support_email || "").trim();
            const supportPhone = String(settings.support_phone || "").trim();
            const appName = String(settings.app_name || "Jigato").trim();
            // UPDATE FOOTER
            updateFooterSettings(supportEmail, supportPhone, appName);
        } catch (error) {
            console.error("JIGATO SETTINGS ERROR:", error);
            updateFooterSettings("", "", "Jigato");
        }
    }

    // UPDATE FOOTER WITH DATABASE VALUES
    function updateFooterSettings(email, phone, appName) {
        // APP NAME
        const footerLogoText = document.querySelector(".jg-footer-logo-text strong");
        if (footerLogoText && appName) {
            footerLogoText.textContent = appName;
        }
        // SUPPORT EMAIL
        const emailLink = document.querySelector('.jg-support-contact[href^="mailto:"]');
        if (emailLink) {
            const emailText = emailLink.querySelector(".jg-support-contact-info strong");
            if (email) {
                emailLink.href = "mailto:" + email;
                if (emailText) {
                    emailText.textContent = email;
                }
            } else {
                emailLink.href = "#";
                if (emailText) {
                    emailText.textContent = "Support email unavailable";
                }
            }
        }
        // SUPPORT PHONE
        const phoneLink = document.querySelector('.jg-support-contact[href^="tel:"]');
        if (phoneLink) {
            const phoneText = phoneLink.querySelector(".jg-support-contact-info strong");
            if (phone) {
                const cleanPhone = phone.replace(/[^0-9+]/g, "");
                phoneLink.href = "tel:" + cleanPhone;
                if (phoneText) {
                    phoneText.textContent = phone;
                }
            } else {
                phoneLink.href = "#";
                if (phoneText) {
                    phoneText.textContent = "Support phone unavailable";
                }
            }
        }
    }

    // SUPPORT MODAL
    function setupSupportModal() {
        const supportButton = document.getElementById("footerSupportBtn");
        const supportModal = document.getElementById("footerSupportModal");
        const closeButton = document.getElementById("footerSupportClose");
        const doneButton = document.getElementById("footerSupportDone");
        const overlay = document.getElementById("footerSupportOverlay");
        // SAFETY CHECK
        if (!supportButton || !supportModal) {
            console.warn("JIGATO: Support modal elements not found.");
            return;
        }
        // OPEN
        function openSupport() {
            supportModal.classList.add("show");
            supportModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("jg-support-open");
        }
        // CLOSE
        function closeSupport() {
            supportModal.classList.remove("show");
            supportModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("jg-support-open");
        }
        // SUPPORT BUTTON
        supportButton.addEventListener("click", openSupport);
        // CLOSE BUTTON
        if (closeButton) {
            closeButton.addEventListener("click", closeSupport);
        }
        // DONE BUTTON
        if (doneButton) {
            doneButton.addEventListener("click", closeSupport);
        }
        // OVERLAY
        if (overlay) {
            overlay.addEventListener("click", closeSupport);
        }
        // ESC KEY
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && supportModal.classList.contains("show")) {
                closeSupport();
            }
        });
    }
});