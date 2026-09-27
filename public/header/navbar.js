document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    // LOAD NAVBAR HTML
    fetch("/header/navbar.html", {
        cache: "no-store"
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Navbar HTML not found");
            }
            return res.text();
        })
        .then(html => {
            navbar.innerHTML = html;
            initNavbar();
        })
        .catch(() => {
            // Keep page working if navbar fails
        });


    // INITIALIZE NAVBAR
    function initNavbar() {
        checkAuth();
        loadCart();
        setupMobile();
        setupLogout();
    }


    // CHECK LOGIN
    function checkAuth() {

        fetch("/check-auth", {
            credentials: "include",
            cache: "no-store"
        })
            .then(res => {

                if (!res.ok) {
                    throw new Error("Auth request failed");
                }

                return res.json();
            })
            .then(data => {

                const logged = data.loggedIn === true;

                // DESKTOP
                const login = document.getElementById("headerLogin");
                const register = document.getElementById("headerRegister");
                const profile = document.getElementById("headerProfile");
                const logout = document.getElementById("headerLogout");

                if (login) {
                    login.style.display = logged ? "none" : "flex";
                }

                if (register) {
                    register.style.display = logged ? "none" : "flex";
                }

                if (profile) {
                    profile.style.display = logged ? "flex" : "none";
                }

                if (logout) {
                    logout.style.display = logged ? "flex" : "none";
                }


                // MOBILE
                const mobileLogin =
                    document.getElementById("mobileHeaderLogin");

                const mobileRegister =
                    document.getElementById("mobileHeaderRegister");

                const mobileProfile =
                    document.getElementById("mobileHeaderProfile");

                const mobileLogout =
                    document.getElementById("mobileHeaderLogout");


                if (mobileLogin) {
                    mobileLogin.style.display =
                        logged ? "none" : "flex";
                }

                if (mobileRegister) {
                    mobileRegister.style.display =
                        logged ? "none" : "flex";
                }

                if (mobileProfile) {
                    mobileProfile.style.display =
                        logged ? "flex" : "none";
                }

                if (mobileLogout) {
                    mobileLogout.style.display =
                        logged ? "flex" : "none";
                }


                // USER LOGGED IN
                if (logged) {

                    updateNavbarUser(
                        data.name || "Profile"
                    );

                    // LOAD LATEST PROFILE
                    loadFreshProfile();

                    // IMPORTANT:
                    // LOAD DEFAULT ADDRESS
                    loadDefaultAddress();
                }

            })
            .catch(() => {
                // Authentication failure handled silently
            });
    }


    // LOAD FRESH PROFILE
    function loadFreshProfile() {

        fetch("/api/profile", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        })
            .then(res => {

                if (!res.ok) {
                    throw new Error("Profile API failed");
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

                const profile = data.profile;

                updateNavbarUser(
                    profile.full_name || "Profile"
                );
            })
            .catch(() => {
                // Profile loading failure handled silently
            });
    }


    // =========================================================
    // DEFAULT ADDRESS
    // =========================================================

    async function loadDefaultAddress() {

        try {

            const response = await fetch(
                "/api/addresses",
                {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            if (!response.ok) {
                throw new Error("Address API failed");
            }


            const data = await response.json();


            if (
                !data ||
                !data.success ||
                !Array.isArray(data.addresses)
            ) {
                setNavbarLocation("Your Address");
                return;
            }


            const addresses = data.addresses;


            // FIND DEFAULT ADDRESS
            let defaultAddress = addresses.find(
                address =>
                    Number(address.is_default) === 1
            );


            // FALLBACK:
            // If backend returns true instead of 1
            if (!defaultAddress) {

                defaultAddress = addresses.find(
                    address =>
                        address.is_default === true
                );
            }


            // NO DEFAULT ADDRESS
            if (!defaultAddress) {

                setNavbarLocation("Your Address");

                localStorage.removeItem(
                    "userAddress"
                );

                return;
            }


            // GET ACTUAL SAVED ADDRESS
            const addressText =
                defaultAddress.address ||
                defaultAddress.city ||
                "Your Address";


            // UPDATE NAVBAR
            setNavbarLocation(addressText);


            // SAVE FOR OTHER PAGES
            localStorage.setItem(
                "userAddress",
                addressText
            );


        } catch (error) {

            // FALLBACK TO OLD SAVED ADDRESS
            const savedAddress =
                localStorage.getItem("userAddress");

            if (savedAddress) {
                setNavbarLocation(savedAddress);
            } else {
                setNavbarLocation("Your Address");
            }
        }
    }


    // =========================================================
    // UPDATE NAVBAR USER NAME
    // =========================================================

    function updateNavbarUser(name) {

        const nameBox =
            document.getElementById("headerUserName");

        const mobileName =
            document.getElementById("mobileHeaderName");


        if (nameBox) {
            nameBox.textContent =
                name || "Profile";
        }


        if (mobileName) {
            mobileName.textContent =
                name || "Profile";
        }
    }


    // =========================================================
    // UPDATE NAVBAR ADDRESS
    // =========================================================

    function setNavbarLocation(address) {

        const headerCity =
            document.getElementById("headerCity");

        const mobileHeaderCity =
            document.getElementById("mobileHeaderCity");


        const finalAddress =
            address || "Your Address";


        if (headerCity) {
            headerCity.textContent =
                finalAddress;
        }


        if (mobileHeaderCity) {
            mobileHeaderCity.textContent =
                finalAddress;
        }
    }


    // =========================================================
    // CART
    // =========================================================

    function loadCart() {

        fetch("/cart", {
            credentials: "include",
            cache: "no-store"
        })
            .then(res => {

                if (!res.ok) {
                    throw new Error("Cart request failed");
                }

                return res.json();
            })
            .then(data => {

                const cart =
                    Array.isArray(data.cart)
                        ? data.cart
                        : [];


                const uniqueFoodIds =
                    new Set();


                cart.forEach(item => {

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


                updateCartCount(
                    uniqueFoodIds.size
                );
            })
            .catch(() => {

                updateCartCount(0);
            });
    }


    // UPDATE CART COUNT
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


        if (cart) {
            cart.textContent = count;
        }


        if (mobileCart) {
            mobileCart.textContent = count;
        }


        if (floatingCart) {

            floatingCart.textContent =
                `${count} ${
                    count === 1
                        ? "item"
                        : "items"
                }`;
        }
    }


    // =========================================================
    // MOBILE MENU
    // =========================================================

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


        if (!menu || !open) return;


        open.onclick = () => {

            menu.classList.add("show");

            document.body.style.overflow =
                "hidden";
        };


        if (close) {

            close.onclick = () => {

                menu.classList.remove("show");

                document.body.style.overflow =
                    "";
            };
        }


        menu.querySelectorAll("a")
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


    // =========================================================
    // LOGOUT
    // =========================================================

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
            logout.onclick = logoutUser;
        }


        if (mobileLogout) {
            mobileLogout.onclick = logoutUser;
        }
    }


    function logoutUser() {

        fetch("/logout", {
            method: "POST",
            credentials: "include"
        })
            .then(() => {

                localStorage.removeItem(
                    "userCity"
                );

                localStorage.removeItem(
                    "userAddress"
                );

                window.location.href = "/";
            })
            .catch(() => {

                window.location.href = "/";
            });
    }


    // =========================================================
    // PROFILE UPDATED EVENT
    // =========================================================

    window.addEventListener(
        "profileUpdated",
        () => {

            loadFreshProfile();

            // Profile city change hone par
            // default address dobara check karo
            loadDefaultAddress();
        }
    );


    // =========================================================
    // PAGE VISIBILITY
    // =========================================================

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                loadCart();
                checkAuth();
                loadDefaultAddress();
            }
        }
    );

});