document.addEventListener("DOMContentLoaded", () => {

    const navbar =
        document.getElementById("navbar");


    if (!navbar) return;


    // =====================================================
    // LOAD NAVBAR HTML
    // =====================================================

    fetch("/header/navbar.html", {
        cache: "no-store"
    })

    .then(res => {

        if (!res.ok) {
            throw new Error(
                "Navbar HTML not found"
            );
        }

        return res.text();

    })

    .then(html => {

        navbar.innerHTML = html;

        initNavbar();

    })

    .catch(err => {

        console.error(
            "Navbar Error:",
            err
        );

    });


    // =====================================================
    // INITIALIZE
    // =====================================================

    function initNavbar() {

        checkAuth();

        loadCart();

        setupMobile();

        setupLogout();

    }


    // =====================================================
    // CHECK AUTH
    // =====================================================

    function checkAuth() {

        fetch("/check-auth", {
            credentials: "include",
            cache: "no-store"
        })

        .then(res => {

            if (!res.ok) {

                throw new Error(
                    "Auth request failed"
                );

            }

            return res.json();

        })

        .then(data => {

            const logged =
                data.loggedIn === true;


            // =============================================
            // DESKTOP
            // =============================================

            const login =
                document.getElementById(
                    "headerLogin"
                );


            const register =
                document.getElementById(
                    "headerRegister"
                );


            const profile =
                document.getElementById(
                    "headerProfile"
                );


            const logout =
                document.getElementById(
                    "headerLogout"
                );


            if (login) {

                login.style.display =
                    logged
                        ? "none"
                        : "flex";

            }


            if (register) {

                register.style.display =
                    logged
                        ? "none"
                        : "flex";

            }


            if (profile) {

                profile.style.display =
                    logged
                        ? "flex"
                        : "none";

            }


            if (logout) {

                logout.style.display =
                    logged
                        ? "flex"
                        : "none";

            }


            // =============================================
            // MOBILE
            // =============================================

            const mobileLogin =
                document.getElementById(
                    "mobileHeaderLogin"
                );


            const mobileRegister =
                document.getElementById(
                    "mobileHeaderRegister"
                );


            const mobileProfile =
                document.getElementById(
                    "mobileHeaderProfile"
                );


            const mobileLogout =
                document.getElementById(
                    "mobileHeaderLogout"
                );


            if (mobileLogin) {

                mobileLogin.style.display =
                    logged
                        ? "none"
                        : "flex";

            }


            if (mobileRegister) {

                mobileRegister.style.display =
                    logged
                        ? "none"
                        : "flex";

            }


            if (mobileProfile) {

                mobileProfile.style.display =
                    logged
                        ? "flex"
                        : "none";

            }


            if (mobileLogout) {

                mobileLogout.style.display =
                    logged
                        ? "flex"
                        : "none";

            }


            // =============================================
            // USER DATA
            // =============================================

            if (logged) {

                updateNavbarUser(
                    data.name ||
                    "Profile",

                    data.city ||
                    "Your City"
                );


                // Fresh database profile
                loadFreshProfile();

            }

        })

        .catch(err => {

            console.error(
                "Auth Error:",
                err
            );

        });

    }


    // =====================================================
    // LOAD FRESH PROFILE
    // =====================================================

    function loadFreshProfile() {

        fetch("/api/profile", {

            method: "GET",

            credentials: "include",

            cache: "no-store",

            headers: {
                "Accept":
                    "application/json"
            }

        })

        .then(res => {

            if (!res.ok) {

                throw new Error(
                    "Profile API failed"
                );

            }

            return res.json();

        })

        .then(data => {

            if (
                !data ||
                !data.success ||
                !data.profile
            ) {

                return;

            }


            const profile =
                data.profile;


            updateNavbarUser(

                profile.full_name ||
                "Profile",

                profile.city ||
                "Your City"

            );


            console.log(
                "Navbar fresh profile:",
                profile
            );

        })

        .catch(err => {

            console.error(
                "Navbar Profile Error:",
                err
            );

        });

    }


    // =====================================================
    // UPDATE NAVBAR USER
    // =====================================================

    function updateNavbarUser(
        name,
        city
    ) {


        // =============================================
        // DESKTOP NAME
        // =============================================

        const nameBox =
            document.getElementById(
                "headerUserName"
            );


        if (nameBox) {

            nameBox.textContent =
                name || "Profile";

        }


        // =============================================
        // MOBILE NAME
        // =============================================

        const mobileName =
            document.getElementById(
                "mobileHeaderName"
            );


        if (mobileName) {

            mobileName.textContent =
                name || "Profile";

        }


        // =============================================
        // DESKTOP CITY
        // =============================================

        const cityBox =
            document.getElementById(
                "headerCity"
            );


        if (cityBox) {

            cityBox.textContent =
                city || "Your City";

        }


        // =============================================
        // MOBILE CITY
        // =============================================

        const mobileCity =
            document.getElementById(
                "mobileHeaderCity"
            );


        if (mobileCity) {

            mobileCity.textContent =
                city || "Your City";

        }


        // =============================================
        // LOCAL STORAGE
        // =============================================

        if (city) {

            localStorage.setItem(
                "userCity",
                city
            );

        }

    }


    // =====================================================
    // CART
    // =====================================================

    function loadCart() {

        fetch("/cart", {

            credentials: "include",

            cache: "no-store"

        })

        .then(res => {

            if (!res.ok) {

                throw new Error(
                    "Cart request failed"
                );

            }

            return res.json();

        })

        .then(data => {

            /*
             * =================================================
             * UNIQUE CART ITEMS
             * =================================================
             *
             * Quantity ko count nahi karna hai.
             *
             * Example:
             *
             * Pizza       × 4
             * Burger      × 2
             * Biryani     × 5
             *
             * Result:
             *
             * 3 items
             *
             * Na ki:
             *
             * 4 + 2 + 5 = 11 items
             *
             * =================================================
             */

            const cart =
                Array.isArray(data.cart)
                    ? data.cart
                    : [];


            const uniqueFoodIds =
                new Set();


            cart.forEach(item => {

                /*
                 * Food ID ke possible field names.
                 *
                 * Backend mein jo available hoga
                 * usko use kiya jayega.
                 */

                const foodId =
                    item.food_id ??
                    item.foodId ??
                    item.menu_item_id ??
                    item.menuItemId ??
                    item.food?.id ??
                    item.menu_item?.id ??
                    item.id;


                if (
                    foodId !== undefined &&
                    foodId !== null &&
                    String(foodId).trim() !== ""
                ) {

                    uniqueFoodIds.add(
                        String(foodId)
                    );

                }

            });


            /*
             * Set mein duplicate food IDs
             * automatically remove ho jaati hain.
             */

            const count =
                uniqueFoodIds.size;


            console.log(
                "CART DATA:",
                cart
            );


            console.log(
                "UNIQUE FOOD IDS:",
                [...uniqueFoodIds]
            );


            console.log(
                "UNIQUE CART ITEM COUNT:",
                count
            );


            updateCartCount(count);

        })

        .catch(err => {

            console.error(
                "Cart Error:",
                err
            );

            updateCartCount(0);

        });

    }


    // =====================================================
    // UPDATE CART COUNT
    // =====================================================

    function updateCartCount(count) {

        const cart =
            document.getElementById(
                "headerCartCount"
            );


        const mobileCart =
            document.getElementById(
                "mobileCartCount"
            );


        const floatingCart =
            document.getElementById(
                "cartCount"
            );


        // =============================================
        // DESKTOP HEADER CART
        // =============================================

        if (cart) {

            cart.textContent =
                count;

        }


        // =============================================
        // MOBILE HEADER CART
        // =============================================

        if (mobileCart) {

            mobileCart.textContent =
                count;

        }


        // =============================================
        // FLOATING CART
        // =============================================

        if (floatingCart) {

            floatingCart.textContent =
                `${count} ${
                    count === 1
                        ? "item"
                        : "items"
                }`;

        }

    }


    // =====================================================
    // MOBILE MENU
    // =====================================================

    function setupMobile() {

        const menu =
            document.getElementById(
                "headerMobileMenu"
            );


        const open =
            document.getElementById(
                "headerMenuBtn"
            );


        const close =
            document.getElementById(
                "headerCloseMenu"
            );


        if (!menu || !open) {

            return;

        }


        open.onclick = () => {

            menu.classList.add(
                "show"
            );


            document.body.style.overflow =
                "hidden";

        };


        if (close) {

            close.onclick = () => {

                menu.classList.remove(
                    "show"
                );


                document.body.style.overflow =
                    "";

            };

        }


        // Close after clicking links

        menu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        menu.classList.remove(
                            "show"
                        );


                        document.body.style.overflow =
                            "";

                    }
                );

            });

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function setupLogout() {

        const logout =
            document.getElementById(
                "headerLogout"
            );


        const mobileLogout =
            document.getElementById(
                "mobileHeaderLogout"
            );


        if (logout) {

            logout.onclick =
                logoutUser;

        }


        if (mobileLogout) {

            mobileLogout.onclick =
                logoutUser;

        }

    }


    // =====================================================
    // LOGOUT USER
    // =====================================================

    function logoutUser() {

        fetch("/logout", {

            method: "POST",

            credentials: "include"

        })

        .then(() => {

            localStorage.removeItem(
                "userCity"
            );


            window.location.href =
                "/";

        })

        .catch(err => {

            console.error(
                "Logout Error:",
                err
            );


            window.location.href =
                "/";

        });

    }


    // =====================================================
    // PROFILE UPDATED EVENT
    // =====================================================

    window.addEventListener(
        "profileUpdated",
        () => {

            console.log(
                "Profile updated → refreshing navbar..."
            );


            loadFreshProfile();

        }
    );


    // =====================================================
    // REFRESH NAVBAR WHEN TAB BECOMES ACTIVE
    // =====================================================

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                loadCart();

                // Auth state refresh
                checkAuth();

            }

        }
    );

});