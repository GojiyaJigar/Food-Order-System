document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const modal = document.getElementById("addressModal");
    const addressForm = document.getElementById("addressForm");
    const saveProfileBtn = document.getElementById("saveProfile");
    const addAddressBtn = document.getElementById("addAddressBtn");
    const closeModalBtn = document.getElementById("closeModal");


    // =====================================================
    // SAFE JSON RESPONSE
    // =====================================================

    async function getJSON(response) {

        const text = await response.text();

        console.log("API STATUS:", response.status);
        console.log("API RESPONSE:", text);

        if (!text.trim()) {
            throw new Error("Server returned an empty response.");
        }

        try {

            return JSON.parse(text);

        } catch (error) {

            console.error(
                "INVALID JSON:",
                text
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }

    }


    // =====================================================
    // GET VALUE
    // =====================================================

    function getValue(id) {

        const element =
            document.getElementById(id);

        if (!element) return "";

        return element.value.trim();

    }


    // =====================================================
    // SET VALUE
    // =====================================================

    function setValue(id, value) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value =
                value ?? "";

        }

    }


    // =====================================================
    // SHOW ERROR
    // =====================================================

    function showError(message) {

        if (typeof Swal !== "undefined") {

            Swal.fire({

                icon: "error",

                title: "Oops!",

                text:
                    message ||
                    "Something went wrong.",

                confirmButtonColor:
                    "#ff5a1f"

            });

        } else {

            alert(message);

        }

    }


    // =====================================================
    // SHOW SUCCESS
    // =====================================================

    function showSuccess(
        title,
        message
    ) {

        if (typeof Swal !== "undefined") {

            return Swal.fire({

                icon: "success",

                title: title,

                text: message,

                confirmButtonColor:
                    "#ff5a1f"

            });

        }

        alert(message);

        return Promise.resolve();

    }


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    async function loadProfile() {

        try {

            const response =
                await fetch(
                    "/api/profile",
                    {

                        method: "GET",

                        credentials: "include",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    }
                );


            const data =
                await getJSON(response);


            // =============================================
            // LOGIN CHECK
            // =============================================

            if (response.status === 401) {

                window.location.href =
                    "/login";

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load profile."
                );

            }


            const profile =
                data.profile || {};


            // =============================================
            // PERSONAL INFORMATION
            // =============================================

            setValue(
                "profileName",
                profile.full_name
            );


            setValue(
                "profileEmail",
                profile.email
            );


            setValue(
                "profilePhone",
                profile.phone
            );


            setValue(
                "profileCity",
                profile.city
            );


            setValue(
                "profileDOB",
                formatDateForInput(
                    profile.date_of_birth
                )
            );


            setValue(
                "profileGender",
                profile.gender
            );


            // =============================================
            // UPDATE NAVBAR CITY
            // =============================================

            updateNavbarCity(
                profile.city
            );


            console.log(
                "PROFILE LOADED:",
                profile
            );


        } catch (error) {

            console.error(
                "LOAD PROFILE ERROR:",
                error
            );

            showError(
                error.message
            );

        }

    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            updateProfile
        );

    }


    async function updateProfile() {

        const fullName =
            getValue("profileName");

        const phone =
            getValue("profilePhone");

        const city =
            getValue("profileCity");

        const dateOfBirth =
            getValue("profileDOB");

        const gender =
            getValue("profileGender");


        // =============================================
        // VALIDATION
        // =============================================

        if (!fullName) {

            showError(
                "Please enter your full name."
            );

            return;

        }


        if (
            phone &&
            !/^[0-9]{10}$/.test(phone)
        ) {

            showError(
                "Please enter a valid 10 digit phone number."
            );

            return;

        }


        // =============================================
        // DATA
        // =============================================

        const data = {

            full_name:
                fullName,

            phone:
                phone,

            city:
                city,

            date_of_birth:
                dateOfBirth || null,

            gender:
                gender || null

        };


        console.log(
            "PROFILE UPDATE DATA:",
            data
        );


        // =============================================
        // BUTTON LOADING
        // =============================================

        saveProfileBtn.disabled =
            true;

        saveProfileBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Saving...
        `;


        try {

            const response =
                await fetch(
                    "/api/profile",
                    {

                        method: "PUT",

                        credentials:
                            "include",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );


            const result =
                await getJSON(response);


            console.log(
                "PROFILE UPDATE RESULT:",
                result
            );


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to update profile."
                );

            }


            // =============================================
            // UPDATE NAVBAR CITY IMMEDIATELY
            // =============================================

            updateNavbarCity(
                city
            );


            // =============================================
            // CUSTOM EVENT
            // Navbar.js bhi isko listen kar sakta hai
            // =============================================

            window.dispatchEvent(

                new CustomEvent(
                    "profileUpdated",
                    {
                        detail: {
                            name:
                                fullName,

                            phone:
                                phone,

                            city:
                                city,

                            date_of_birth:
                                dateOfBirth,

                            gender:
                                gender
                        }
                    }
                )

            );


            // =============================================
            // SUCCESS
            // =============================================

            await showSuccess(

                "Profile Updated!",

                "Your profile details have been saved successfully."

            );


            // =============================================
            // LOAD FRESH DATA
            // =============================================

            await loadProfile();

        } catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );

            showError(
                error.message
            );

        } finally {

            saveProfileBtn.disabled =
                false;

            saveProfileBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Save Changes
            `;

        }

    }


    // =====================================================
    // NAVBAR CITY UPDATE
    // =====================================================

    function updateNavbarCity(city) {

        if (!city) return;


        /*
         * IMPORTANT:
         * Neeche common navbar IDs/classes handle
         * kiye gaye hain.
         */

        const possibleElements = [

            document.getElementById(
                "currentCity"
            ),

            document.getElementById(
                "navbarCity"
            ),

            document.getElementById(
                "userCity"
            ),

            document.querySelector(
                ".current-city"
            ),

            document.querySelector(
                ".navbar-city"
            )

        ];


        possibleElements.forEach(
            element => {

                if (!element) return;


                // Agar element ke andar icon hai,
                // sirf text update karne ki koshish.

                const textElement =
                    element.querySelector(
                        ".city-name"
                    );


                if (textElement) {

                    textElement.textContent =
                        city;

                } else {

                    element.textContent =
                        `📍 ${city}`;

                }

            }
        );


        // =============================================
        // LOCAL STORAGE
        // Navbar.js agar localStorage use kare
        // =============================================

        localStorage.setItem(
            "userCity",
            city
        );


        console.log(
            "NAVBAR CITY UPDATED:",
            city
        );

    }



    // =====================================================
    // LOAD ADDRESSES
    // =====================================================

    loadAddresses();


    async function loadAddresses() {

        const list =
            document.getElementById(
                "addressList"
            );


        if (!list) return;


        list.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading addresses...
            </div>
        `;


        try {

            const response =
                await fetch(
                    "/api/addresses",
                    {

                        method: "GET",

                        credentials:
                            "include",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    }
                );


            const data =
                await getJSON(response);


            if (response.status === 401) {

                window.location.href =
                    "/login";

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load addresses."
                );

            }


            const addresses =
                Array.isArray(
                    data.addresses
                )
                    ? data.addresses
                    : [];


            // =============================================
            // EMPTY
            // =============================================

            if (
                addresses.length === 0
            ) {

                list.innerHTML = `

                    <div class="no-address">

                        <div
                            style="
                                font-size:28px;
                                margin-bottom:8px;
                            "
                        >
                            📍
                        </div>

                        <strong>
                            No saved address
                        </strong>

                        <br>

                        Add your delivery address.

                    </div>

                `;

                return;

            }


            // =============================================
            // SHOW
            // =============================================

            list.innerHTML =
                addresses
                    .map(
                        renderAddress
                    )
                    .join("");


        } catch (error) {

            console.error(
                "LOAD ADDRESS ERROR:",
                error
            );


            list.innerHTML = `

                <div class="no-address">

                    Unable to load addresses.

                </div>

            `;

        }

    }


    // =====================================================
    // RENDER ADDRESS
    // =====================================================

    function renderAddress(address) {

        const label =
            address.address_label ||
            "Home";


        const isDefault =
            Number(
                address.is_default
            ) === 1;


        return `

            <div class="address-card">

                <div class="address-top">

                    <span class="address-label">

                        ${getAddressIcon(label)}

                        ${escapeHTML(label)}

                    </span>


                    ${
                        isDefault

                            ? `
                                <span class="default-badge">
                                    DEFAULT
                                </span>
                              `

                            : ""
                    }

                </div>


                <p>

                    <strong>
                        ${escapeHTML(
                            address.full_name
                        )}
                    </strong>

                    <br>

                    ${escapeHTML(
                        address.address
                    )}

                    <br>

                    ${escapeHTML(
                        address.city
                    )}

                    ,

                    ${escapeHTML(
                        address.state
                    )}

                    -

                    ${escapeHTML(
                        address.pincode
                    )}

                    <br>

                    📞

                    ${escapeHTML(
                        address.phone
                    )}

                </p>


                <div class="address-actions">

                    <button
                        type="button"
                        class="edit"
                        onclick="
                            editAddress(
                                ${Number(address.id)}
                            )
                        "
                    >

                        <i class="fa-solid fa-pen"></i>

                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete"
                        onclick="
                            deleteAddress(
                                ${Number(address.id)}
                            )
                        "
                    >

                        <i class="fa-solid fa-trash"></i>

                        Delete

                    </button>

                </div>

            </div>

        `;

    }


    // =====================================================
    // OPEN ADD ADDRESS
    // =====================================================

    if (addAddressBtn) {

        addAddressBtn.addEventListener(
            "click",
            openAddAddress
        );

    }


    function openAddAddress() {

        if (!modal || !addressForm)
            return;


        addressForm.reset();


        setValue(
            "addressId",
            ""
        );


        setValue(
            "addressLabel",
            "Home"
        );


        document
            .querySelectorAll(
                ".label-btn"
            )
            .forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


        const homeButton =
            document.querySelector(
                '.label-btn[data-label="Home"]'
            );


        if (homeButton) {

            homeButton.classList.add(
                "active"
            );

        }


        const modalTitle =
            document.getElementById(
                "modalTitle"
            );


        if (modalTitle) {

            modalTitle.textContent =
                "Add Address";

        }


        // =============================================
        // AUTO FILL PROFILE CITY
        // =============================================

        const profileCity =
            getValue("profileCity");


        if (profileCity) {

            setValue(
                "addressCity",
                profileCity
            );

        }


        modal.classList.add(
            "show"
        );

    }


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    if (closeModalBtn) {

        closeModalBtn.addEventListener(
            "click",
            closeModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );

    }


    function closeModal() {

        if (modal) {

            modal.classList.remove(
                "show"
            );

        }

    }


    // =====================================================
    // ADDRESS LABEL BUTTONS
    // =====================================================

    document
        .querySelectorAll(
            ".label-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".label-btn"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    setValue(
                        "addressLabel",
                        button.dataset.label
                    );

                }
            );

        });


    // =====================================================
    // SAVE ADDRESS
    // =====================================================

    if (addressForm) {

        addressForm.addEventListener(
            "submit",
            saveAddress
        );

    }


    async function saveAddress(event) {

        event.preventDefault();


        const addressId =
            getValue("addressId");


        const data = {

            addressLabel:
                getValue(
                    "addressLabel"
                ) || "Home",

            fullName:
                getValue(
                    "addressName"
                ),

            phone:
                getValue(
                    "addressPhone"
                ),

            address:
                getValue(
                    "addressText"
                ),

            city:
                getValue(
                    "addressCity"
                ),

            state:
                getValue(
                    "addressState"
                ),

            pincode:
                getValue(
                    "addressPincode"
                ),

            isDefault:
                document.getElementById(
                    "defaultAddress"
                )?.checked || false

        };


        // =============================================
        // VALIDATION
        // =============================================

        if (
            !data.fullName ||
            !data.phone ||
            !data.address ||
            !data.city ||
            !data.state ||
            !data.pincode
        ) {

            showError(
                "Please fill all address details."
            );

            return;

        }


        if (
            !/^[0-9]{10}$/.test(
                data.phone
            )
        ) {

            showError(
                "Please enter a valid 10 digit phone number."
            );

            return;

        }


        if (
            !/^[0-9]{6}$/.test(
                data.pincode
            )
        ) {

            showError(
                "Please enter a valid 6 digit pincode."
            );

            return;

        }


        try {

            const url =
                addressId

                    ? `/api/addresses/${addressId}`

                    : "/api/addresses";


            const method =
                addressId

                    ? "PUT"

                    : "POST";


            const response =
                await fetch(
                    url,
                    {

                        method,

                        credentials:
                            "include",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );


            const result =
                await getJSON(response);


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to save address."
                );

            }


            closeModal();


            await showSuccess(

                addressId
                    ? "Address Updated!"
                    : "Address Saved!",

                addressId
                    ? "Your address has been updated."
                    : "Your address has been saved."

            );


            await loadAddresses();


        } catch (error) {

            console.error(
                "SAVE ADDRESS ERROR:",
                error
            );

            showError(
                error.message
            );

        }

    }


    // =====================================================
    // EDIT ADDRESS
    // =====================================================

    window.editAddress =
        async function(id) {

            try {

                const response =
                    await fetch(
                        "/api/addresses",
                        {

                            method: "GET",

                            credentials:
                                "include",

                            headers: {

                                "Accept":
                                    "application/json"

                            }

                        }
                    );


                const data =
                    await getJSON(response);


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load address."
                    );

                }


                const address =
                    (
                        data.addresses ||
                        []
                    ).find(
                        item =>
                            Number(item.id) ===
                            Number(id)
                    );


                if (!address) {

                    showError(
                        "Address not found."
                    );

                    return;

                }


                // =============================================
                // FILL MODAL
                // =============================================

                setValue(
                    "addressId",
                    address.id
                );


                setValue(
                    "addressLabel",
                    address.address_label ||
                    "Home"
                );


                setValue(
                    "addressName",
                    address.full_name
                );


                setValue(
                    "addressPhone",
                    address.phone
                );


                setValue(
                    "addressText",
                    address.address
                );


                setValue(
                    "addressCity",
                    address.city
                );


                setValue(
                    "addressState",
                    address.state
                );


                setValue(
                    "addressPincode",
                    address.pincode
                );


                const checkbox =
                    document.getElementById(
                        "defaultAddress"
                    );


                if (checkbox) {

                    checkbox.checked =
                        Number(
                            address.is_default
                        ) === 1;

                }


                // =============================================
                // LABEL
                // =============================================

                document
                    .querySelectorAll(
                        ".label-btn"
                    )
                    .forEach(button => {

                        button.classList.toggle(

                            "active",

                            button.dataset.label ===
                            address.address_label

                        );

                    });


                const modalTitle =
                    document.getElementById(
                        "modalTitle"
                    );


                if (modalTitle) {

                    modalTitle.textContent =
                        "Edit Address";

                }


                modal.classList.add(
                    "show"
                );


            } catch (error) {

                console.error(
                    "EDIT ADDRESS ERROR:",
                    error
                );

                showError(
                    error.message
                );

            }

        };


    // =====================================================
    // DELETE ADDRESS
    // =====================================================

    window.deleteAddress =
        async function(id) {

            let confirmed = true;


            if (
                typeof Swal !== "undefined"
            ) {

                const result =
                    await Swal.fire({

                        icon: "warning",

                        title:
                            "Delete Address?",

                        text:
                            "This address will be removed.",

                        showCancelButton:
                            true,

                        confirmButtonText:
                            "Delete",

                        cancelButtonText:
                            "Cancel",

                        confirmButtonColor:
                            "#e33",

                        cancelButtonColor:
                            "#777"

                    });


                confirmed =
                    result.isConfirmed;

            } else {

                confirmed =
                    confirm(
                        "Delete this address?"
                    );

            }


            if (!confirmed)
                return;


            try {

                const response =
                    await fetch(
                        `/api/addresses/${id}`,
                        {

                            method:
                                "DELETE",

                            credentials:
                                "include",

                            headers: {

                                "Accept":
                                    "application/json"

                            }

                        }
                    );


                const data =
                    await getJSON(response);


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to delete address."
                    );

                }


                await showSuccess(

                    "Address Deleted!",

                    "The address has been removed."

                );


                await loadAddresses();


            } catch (error) {

                console.error(
                    "DELETE ADDRESS ERROR:",
                    error
                );

                showError(
                    error.message
                );

            }

        };


    // =====================================================
    // ADDRESS ICON
    // =====================================================

    function getAddressIcon(label) {

        if (
            String(label).toLowerCase() ===
            "work"
        ) {

            return "💼";

        }


        if (
            String(label).toLowerCase() ===
            "other"
        ) {

            return "📍";

        }


        return "🏠";

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    // =====================================================
    // DATE FORMAT
    // =====================================================

    function formatDateForInput(value) {

        if (!value)
            return "";


        /*
         * MySQL DATE:
         * 2000-05-20
         *
         * MySQL DATETIME:
         * 2000-05-20T00:00:00.000Z
         */

        const stringValue =
            String(value);


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                stringValue
            )
        ) {

            return stringValue;

        }


        if (
            stringValue.includes("T")
        ) {

            return stringValue
                .split("T")[0];

        }


        return stringValue
            .substring(0, 10);

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadProfile();

});