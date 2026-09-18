/* =====================================================
   JIGATO ADMIN SIDEBAR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* =================================================
           SIDEBAR CONTAINER
        ================================================= */

        let container =
            document.getElementById(
                "adminSidebarContainer"
            );


        /*
         * Agar container page mein nahi hai,
         * to sidebar automatically create hoga.
         */

        if (!container) {

            container =
                document.createElement(
                    "div"
                );

            container.id =
                "adminSidebarContainer";


            document.body.prepend(
                container
            );

        }


        /* =================================================
           LOAD SHARED SIDEBAR
        ================================================= */

        try {

            const response =
                await fetch(
                    "/admin/sidebar/sidebar.html",
                    {
                        method: "GET",

                        cache:
                            "no-store",

                        headers: {
                            "Accept":
                                "text/html"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Sidebar HTTP ${response.status}`
                );

            }


            const html =
                await response.text();


            if (!html.trim()) {

                throw new Error(
                    "Sidebar HTML is empty."
                );

            }


            container.innerHTML =
                html;


        }
        catch (error) {

            console.error(
                "SIDEBAR LOAD ERROR:",
                error
            );

            return;

        }


        /* =================================================
           SIDEBAR ELEMENT
        ================================================= */

        const sidebar =
            document.getElementById(
                "adminSidebar"
            );


        if (!sidebar) {

            console.error(
                "Admin sidebar element not found."
            );

            return;

        }


        /* =================================================
           ACTIVE LINK
        ================================================= */

        const currentPath =
            window.location.pathname
                .replace(
                    /\/+$/,
                    ""
                ) || "/";


        const links =
            sidebar.querySelectorAll(
                ".sidebar-link"
            );


        links.forEach(
            link => {

                const href =
                    link.getAttribute(
                        "href"
                    );


                if (!href) {

                    return;

                }


                const linkPath =
                    new URL(
                        href,
                        window.location.origin
                    )
                    .pathname
                    .replace(
                        /\/+$/,
                        ""
                    ) || "/";


                link.classList.toggle(
                    "active",
                    currentPath ===
                    linkPath
                );

            }
        );


        /* =================================================
           MOBILE TOGGLE BUTTON
        ================================================= */

        const toggle =
            document.getElementById(
                "sidebarToggle"
            );


        /* =================================================
           MOBILE OVERLAY
        ================================================= */

        let overlay =
            document.getElementById(
                "sidebarOverlay"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );

            overlay.id =
                "sidebarOverlay";

            overlay.className =
                "sidebar-overlay";


            document.body.appendChild(
                overlay
            );

        }


        /* =================================================
           OPEN SIDEBAR
        ================================================= */

        function openSidebar() {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "active"
            );

        }


        /* =================================================
           CLOSE SIDEBAR
        ================================================= */

        function closeSidebar() {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "active"
            );

        }


        /* =================================================
           TOGGLE
        ================================================= */

        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    if (
                        sidebar.classList.contains(
                            "open"
                        )
                    ) {

                        closeSidebar();

                    }
                    else {

                        openSidebar();

                    }

                }
            );

        }


        /* =================================================
           OVERLAY CLICK
        ================================================= */

        overlay.addEventListener(
            "click",
            closeSidebar
        );


        /* =================================================
           MENU CLICK
        ================================================= */

        links.forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );


        /* =================================================
           ESC CLOSE
        ================================================= */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeSidebar();

                }

            }
        );


        /* =================================================
           LOGOUT
        ================================================= */

        const logout =
            document.getElementById(
                "adminLogoutBtn"
            );


        if (logout) {

            logout.addEventListener(
                "click",
                async () => {

                    try {

                        logout.disabled =
                            true;


                        const response =
                            await fetch(
                                "/logout",
                                {

                                    method:
                                        "POST",

                                    credentials:
                                        "include",

                                    cache:
                                        "no-store",

                                    headers: {

                                        "Accept":
                                            "application/json"

                                    }

                                }
                            );


                        console.log(
                            "ADMIN LOGOUT STATUS:",
                            response.status
                        );

                    }
                    catch (error) {

                        console.error(
                            "LOGOUT ERROR:",
                            error
                        );

                    }


                    window.location.replace(
                        "/login"
                    );

                }
            );

        }


        /* =================================================
           READY EVENT
        ================================================= */

        document.dispatchEvent(
            new CustomEvent(
                "jigato:sidebar-ready"
            )
        );


        console.log(
            "✅ Shared Jigato Admin Sidebar Loaded"
        );

    }
);