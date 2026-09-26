document.addEventListener("DOMContentLoaded", () => {
    // Locate the navigation container element in the DOM
    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    // Fetch and dynamically inject the public navigation bar template into the page
    fetch("/header/navbar.html", { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error("Navbar HTML not found");
            return res.text();
        })
        .then(html => {
            navbar.innerHTML = html;
            initNavbar();
        })
        .catch(err => {
            // Silently handle template loading errors
        });

    // Initialize initial authentication state, cart contents, and event listeners
    function initNavbar() {
        checkAuth();
        loadCart();
        setupMobile();
        setupLogout();
    }

    // Verify current user authentication status and update interface elements accordingly
    function checkAuth() {
        fetch("/check-auth", { credentials: "include", cache: "no-store" })
            .then(res => {
                if (!res.ok) throw new Error("Auth request failed");
                return res.json();
            })
            .then(data => {
                const logged = data.loggedIn === true;

                // Update desktop authentication actions visibility
                const login = document.getElementById("headerLogin");
                const register = document.getElementById("headerRegister");
                const profile = document.getElementById("headerProfile");
                const logout = document.getElementById("headerLogout");

                if (login) login.style.display = logged ? "none" : "flex";
                if (register) register.style.display = logged ? "none" : "flex";
                if (profile) profile.style.display = logged ? "flex" : "none";
                if (logout) logout.style.display = logged ? "flex" : "none";

                // Update mobile authentication actions visibility
                const mobileLogin = document.getElementById("mobileHeaderLogin");
                const mobileRegister = document.getElementById("mobileHeaderRegister");
                const mobileProfile = document.getElementById("mobileHeaderProfile");
                const mobileLogout = document.getElementById("mobileHeaderLogout");

                if (mobileLogin) mobileLogin.style.display = logged ? "none" : "flex";
                if (mobileRegister) mobileRegister.style.display = logged ? "none" : "flex";
                if (mobileProfile) mobileProfile.style.display = logged ? "flex" : "none";
                if (mobileLogout) mobileLogout.style.display = logged ? "flex" : "none";

                // Render current session user details or fetch latest profile record
                if (logged) {
                    updateNavbarUser(data.name || "Profile", data.city || "Your City");
                    loadFreshProfile();
                }
            })
            .catch(err => {
                // Silently handle authentication verification failures
            });
    }

    // Retrieve fresh profile records directly from the database API endpoint
    function loadFreshProfile() {
        fetch("/api/profile", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { "Accept": "application/json" }
        })
            .then(res => {
                if (!res.ok) throw new Error("Profile API failed");
                return res.json();
            })
            .then(data => {
                if (!data || !data.success || !data.profile) return;
                const profile = data.profile;
                updateNavbarUser(profile.full_name || "Profile", profile.city || "Your City");
            })
            .catch(err => {
                // Silently handle profile fetch errors
            });
    }

    // Synchronize current profile display values across desktop, mobile, and storage
    function updateNavbarUser(name, city) {
        const nameBox = document.getElementById("headerUserName");
        const mobileName = document.getElementById("mobileHeaderName");
        const cityBox = document.getElementById("headerCity");
        const mobileCity = document.getElementById("mobileHeaderCity");

        if (nameBox) nameBox.textContent = name || "Profile";
        if (mobileName) mobileName.textContent = name || "Profile";
        if (cityBox) cityBox.textContent = city || "Your City";
        if (mobileCity) mobileCity.textContent = city || "Your City";

        if (city) localStorage.setItem("userCity", city);
    }

    // Retrieve user shopping cart content to calculate distinct menu items
    function loadCart() {
        fetch("/cart", { credentials: "include", cache: "no-store" })
            .then(res => {
                if (!res.ok) throw new Error("Cart request failed");
                return res.json();
            })
            .then(data => {
                const cart = Array.isArray(data.cart) ? data.cart : [];
                const uniqueFoodIds = new Set();

                // Group items by unique menu identifier rather than cumulative item counts
                cart.forEach(item => {
                    const foodId = item.food_id ?? item.foodId ?? item.menu_item_id ?? item.menuItemId ?? item.food?.id ?? item.menu_item?.id ?? item.id;
                    if (foodId !== undefined && foodId !== null && String(foodId).trim() !== "") {
                        uniqueFoodIds.add(String(foodId));
                    }
                });

                updateCartCount(uniqueFoodIds.size);
            })
            .catch(err => {
                updateCartCount(0);
            });
    }

    // Render unique item count indicators across headers and floating elements
    function updateCartCount(count) {
        const cart = document.getElementById("headerCartCount");
        const mobileCart = document.getElementById("mobileCartCount");
        const floatingCart = document.getElementById("cartCount");

        if (cart) cart.textContent = count;
        if (mobileCart) mobileCart.textContent = count;
        if (floatingCart) floatingCart.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    }

    // Register mobile menu toggle actions and backdrop interaction handlers
    function setupMobile() {
        const menu = document.getElementById("headerMobileMenu");
        const open = document.getElementById("headerMenuBtn");
        const close = document.getElementById("headerCloseMenu");

        if (!menu || !open) return;

        open.onclick = () => {
            menu.classList.add("show");
            document.body.style.overflow = "hidden";
        };

        if (close) {
            close.onclick = () => {
                menu.classList.remove("show");
                document.body.style.overflow = "";
            };
        }

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("show");
                document.body.style.overflow = "";
            });
        });
    }

    // Attach click listeners to user logout control triggers
    function setupLogout() {
        const logout = document.getElementById("headerLogout");
        const mobileLogout = document.getElementById("mobileHeaderLogout");

        if (logout) logout.onclick = logoutUser;
        if (mobileLogout) mobileLogout.onclick = logoutUser;
    }

    // Invalidate user session on the server and redirect to the landing page
    function logoutUser() {
        fetch("/logout", { method: "POST", credentials: "include" })
            .then(() => {
                localStorage.removeItem("userCity");
                window.location.href = "/";
            })
            .catch(err => {
                window.location.href = "/";
            });
    }

    // Refresh user profile details when custom update event is triggered
    window.addEventListener("profileUpdated", () => {
        loadFreshProfile();
    });

    // Synchronize session details when switching browser tab visibility
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            loadCart();
            checkAuth();
        }
    });
});