document.addEventListener("DOMContentLoaded", () => {

    const $ = id => document.getElementById(id);

    let foods = [];
    let filtered = [];
    let page = 1;
    const limit = 8;

    let selectedFile = null;
    let oldImage = "";

    /* LOAD */

    async function loadFoods() {

        try {

            const res = await fetch("/admin/api/foods", {
                credentials: "include",
                cache: "no-store"
            });

            const data = await res.json();

            if (!res.ok || data.success === false)
                throw new Error(data.message || "Failed to load menu");

            foods = Array.isArray(data.foods)
                ? data.foods
                : Array.isArray(data.data)
                    ? data.data
                    : Array.isArray(data)
                        ? data
                        : [];

            updateStats();
            updateCategories();
            applyFilters();

            $("foodsLastUpdated").textContent =
                new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });

        } catch (err) {

            console.error(err);

            $("foodsTableBody").innerHTML = `
                <tr>
                    <td colspan="6" class="loading">
                        Unable to load menu.
                    </td>
                </tr>
            `;

            Swal.fire("Error", err.message, "error");
        }
    }


    /* STATS */

    function updateStats() {

        $("totalFoods").textContent = foods.length;

        $("availableFoods").textContent =
            foods.filter(f => Number(f.is_available) === 1).length;

        $("unavailableFoods").textContent =
            foods.filter(f => Number(f.is_available) !== 1).length;

        $("categoryCount").textContent =
            new Set(
                foods
                    .map(f => String(f.category || "").trim())
                    .filter(Boolean)
            ).size;
    }


    /* CATEGORY */

    function updateCategories() {

        const categories = [...new Set(
            foods
                .map(f => String(f.category || "").trim())
                .filter(Boolean)
        )].sort();

        $("foodCategoryFilter").innerHTML =
            `<option value="all">All Categories</option>` +
            categories.map(c =>
                `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`
            ).join("");
    }


    /* FILTER */

    function applyFilters() {

        const search =
            $("foodSearch").value.trim().toLowerCase();

        const category =
            $("foodCategoryFilter").value;

        const status =
            $("foodAvailabilityFilter").value;

        const sort =
            $("foodSort").value;

        filtered = foods.filter(f => {

            const text = [
                f.name,
                f.description,
                f.category
            ].join(" ").toLowerCase();

            if (search && !text.includes(search))
                return false;

            if (
                category !== "all" &&
                String(f.category || "") !== category
            )
                return false;

            const available =
                Number(f.is_available) === 1;

            if (status === "available" && !available)
                return false;

            if (status === "unavailable" && available)
                return false;

            return true;
        });


        filtered.sort((a, b) => {

            if (sort === "name-asc")
                return String(a.name)
                    .localeCompare(String(b.name));

            if (sort === "name-desc")
                return String(b.name)
                    .localeCompare(String(a.name));

            if (sort === "price-low")
                return Number(a.price) - Number(b.price);

            if (sort === "price-high")
                return Number(b.price) - Number(a.price);

            const da = new Date(a.created_at || 0);
            const db = new Date(b.created_at || 0);

            return sort === "oldest"
                ? da - db
                : db - da;
        });

        page = 1;
        render();
    }


    /* QUICK FILTER */

    document
        .querySelectorAll(".quick-filter-btn")
        .forEach(btn => {

            btn.onclick = () => {

                document
                    .querySelectorAll(".quick-filter-btn")
                    .forEach(x =>
                        x.classList.remove("active")
                    );

                btn.classList.add("active");

                const type = btn.dataset.filter;

                if (type === "all")
                    $("foodAvailabilityFilter").value = "all";

                if (type === "available")
                    $("foodAvailabilityFilter").value = "available";

                if (type === "unavailable")
                    $("foodAvailabilityFilter").value = "unavailable";

                if (type === "recent") {
                    $("foodAvailabilityFilter").value = "all";
                    $("foodSort").value = "newest";
                }

                applyFilters();
            };
        });


    /* TABLE */

    function render() {

        const totalPages =
            Math.max(1, Math.ceil(filtered.length / limit));

        page = Math.min(page, totalPages);

        const start = (page - 1) * limit;

        const items =
            filtered.slice(start, start + limit);

        if (!items.length) {

            $("foodsTableBody").innerHTML = "";

            $("foodsEmptyState").hidden = false;

        } else {

            $("foodsEmptyState").hidden = true;

            $("foodsTableBody").innerHTML =
                items.map(foodRow).join("");
        }

        $("visibleFoodsCount").textContent =
            `Showing ${items.length} of ${filtered.length} foods`;

        renderPages(totalPages);
    }


    function foodRow(food) {

        const image = food.image
            ? `/images/foods/${encodeURIComponent(
                String(food.image).split("/").pop()
            )}`
            : "/images/foods/default-food.jpg";

        const available =
            Number(food.is_available) === 1;

        return `
            <tr>

                <td>
                    <div class="food-info">

                        <img
                            src="${image}"
                            onerror="this.src='/images/foods/default-food.jpg'"
                        >

                        <div>
                            <strong>
                                ${escapeHTML(food.name)}
                            </strong>

                            <small>
                                ${escapeHTML(food.description || "")}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${escapeHTML(food.category || "-")}
                </td>

                <td>
                    ₹${Number(food.price || 0).toFixed(2)}
                </td>

                <td>
                    <span class="status ${
                        available ? "available" : "unavailable"
                    }">
                        ${available ? "Available" : "Unavailable"}
                    </span>
                </td>

                <td>
                    ${formatDate(food.created_at)}
                </td>

                <td>
                    <div class="row-actions">

                        <button onclick="viewFood(${food.id})">
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button onclick="editFood(${food.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button onclick="toggleFood(${food.id})">
                            <i class="fa-solid fa-power-off"></i>
                        </button>

                        <button onclick="deleteFood(${food.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }


    /* PAGINATION */

    function renderPages(total) {

        $("foodsPages").innerHTML = "";

        for (let i = 1; i <= total; i++) {

            const btn = document.createElement("button");

            btn.className =
                `page-number ${i === page ? "active" : ""}`;

            btn.textContent = i;

            btn.onclick = () => {
                page = i;
                render();
            };

            $("foodsPages").appendChild(btn);
        }

        $("prevFoodsBtn").disabled = page === 1;
        $("nextFoodsBtn").disabled = page === total;
    }

    $("prevFoodsBtn").onclick = () => {

        if (page > 1) {
            page--;
            render();
        }
    };

    $("nextFoodsBtn").onclick = () => {

        const total =
            Math.ceil(filtered.length / limit);

        if (page < total) {
            page++;
            render();
        }
    };


    /* FILTER EVENTS */

    $("foodSearch").oninput = applyFilters;
    $("foodCategoryFilter").onchange = applyFilters;
    $("foodAvailabilityFilter").onchange = applyFilters;
    $("foodSort").onchange = applyFilters;

    $("clearFoodSearch").onclick = () => {
        $("foodSearch").value = "";
        applyFilters();
    };

    $("resetFoodFiltersBtn").onclick = () => {

        $("foodSearch").value = "";
        $("foodCategoryFilter").value = "all";
        $("foodAvailabilityFilter").value = "all";
        $("foodSort").value = "newest";

        applyFilters();
    };

    $("refreshFoodsBtn").onclick = loadFoods;


    /* MODAL */

    function openModal(edit) {

        $("foodModal").classList.add("show");

        $("foodModalTitle").textContent =
            edit ? "Edit Food" : "Add New Food";

        $("foodModalSubtitle").textContent =
            edit
                ? "Update your food item."
                : "Add a new food item.";

        $("saveFoodBtnText").textContent =
            edit ? "Update Food" : "Add Food";
    }

    function closeModal() {
        $("foodModal").classList.remove("show");
    }


    $("addFoodBtn").onclick = () => {

        $("foodForm").reset();

        $("foodId").value = "";

        $("foodAvailability").checked = true;
        $("foodAvailabilityText").textContent = "Available";

        selectedFile = null;
        oldImage = "";

        resetImage();

        $("foodDescriptionCount").textContent = "0";

        openModal(false);
    };


    $("closeFoodModal").onclick = closeModal;
    $("cancelFoodBtn").onclick = closeModal;
    $("foodModalOverlay").onclick = closeModal;


    /* AVAILABILITY */

    $("foodAvailability").onchange = e => {

        $("foodAvailabilityText").textContent =
            e.target.checked
                ? "Available"
                : "Unavailable";
    };


    $("foodDescription").oninput = e => {

        $("foodDescriptionCount").textContent =
            e.target.value.length;
    };


    /* IMAGE */

    $("chooseFoodImageBtn").onclick =
    $("changeFoodImageBtn").onclick = () =>
        $("foodImage").click();

    $("foodImage").onchange = e => {

        if (e.target.files[0])
            setImage(e.target.files[0]);
    };


    const dropzone = $("foodImageDropzone");

    dropzone.ondragover = e => {
        e.preventDefault();
        dropzone.style.borderColor = "#ff5b27";
    };

    dropzone.ondragleave = () => {
        dropzone.style.borderColor = "";
    };

    dropzone.ondrop = e => {

        e.preventDefault();

        dropzone.style.borderColor = "";

        const file = e.dataTransfer.files[0];

        if (file)
            setImage(file);
    };


    function setImage(file) {

        const types = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!types.includes(file.type))
            return Swal.fire(
                "Invalid Image",
                "Use JPG, PNG or WEBP.",
                "warning"
            );

        if (file.size > 5 * 1024 * 1024)
            return Swal.fire(
                "Image Too Large",
                "Maximum size is 5 MB.",
                "warning"
            );

        selectedFile = file;

        $("foodImagePlaceholder").hidden = true;
        $("foodImagePreviewContainer").hidden = false;

        $("foodImagePreview").src =
            URL.createObjectURL(file);

        $("foodImageName").textContent =
            file.name;

        $("foodImageSize").textContent =
            `${(file.size / 1024).toFixed(0)} KB`;
    }


    function resetImage() {

        $("foodImage").value = "";

        $("foodImagePlaceholder").hidden = false;
        $("foodImagePreviewContainer").hidden = true;

        $("foodImagePreview").src = "";

        $("foodImageName").textContent = "";
        $("foodImageSize").textContent = "";
    }


    $("removeFoodImageBtn").onclick = () => {

        selectedFile = null;

        if (oldImage) {

            $("foodImagePlaceholder").hidden = true;
            $("foodImagePreviewContainer").hidden = false;

            $("foodImagePreview").src =
                `/images/foods/${oldImage}`;

            $("foodImageName").textContent =
                oldImage;

            $("foodImageSize").textContent =
                "Current image";

        } else {

            resetImage();
        }
    };


    /* SAVE */

    $("foodForm").onsubmit = async e => {

        e.preventDefault();

        const id = $("foodId").value;

        if (!id && !selectedFile) {

            return Swal.fire(
                "Photo Required",
                "Please upload food photo.",
                "warning"
            );
        }

        const formData = new FormData();

        formData.append(
            "name",
            $("foodName").value.trim()
        );

        formData.append(
            "category",
            $("foodCategory").value.trim()
        );

        formData.append(
            "price",
            $("foodPrice").value
        );

        formData.append(
            "description",
            $("foodDescription").value.trim()
        );

        formData.append(
            "is_available",
            $("foodAvailability").checked ? "1" : "0"
        );

        if (selectedFile)
            formData.append("image", selectedFile);


        try {

            $("saveFoodBtn").disabled = true;

            const res = await fetch(
                id
                    ? `/admin/api/foods/${id}`
                    : "/admin/api/foods",
                {
                    method: id ? "PUT" : "POST",
                    body: formData,
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok || data.success === false)
                throw new Error(
                    data.message || "Save failed"
                );

            closeModal();

            await loadFoods();

            Swal.fire({
                icon: "success",
                title: id ? "Food Updated" : "Food Added",
                timer: 1300,
                showConfirmButton: false
            });

        } catch (err) {

            Swal.fire(
                "Error",
                err.message,
                "error"
            );

        } finally {

            $("saveFoodBtn").disabled = false;
        }
    };


    /* VIEW */

    window.viewFood = id => {

        const food =
            foods.find(x => Number(x.id) === Number(id));

        if (!food) return;

        const image = food.image
            ? `/images/foods/${food.image}`
            : "/images/foods/default-food.jpg";

        Swal.fire({

            title: escapeHTML(food.name),

            html: `
                <img
                    src="${image}"
                    style="
                        width:180px;
                        height:130px;
                        object-fit:cover;
                        border-radius:9px
                    "
                >

                <p style="margin-top:12px;line-height:1.8">
                    <b>Category:</b>
                    ${escapeHTML(food.category || "-")}<br>

                    <b>Price:</b>
                    ₹${Number(food.price || 0).toFixed(2)}<br>

                    <b>Status:</b>
                    ${Number(food.is_available) === 1
                        ? "Available"
                        : "Unavailable"}
                </p>

                <p>
                    ${escapeHTML(food.description || "")}
                </p>
            `,

            confirmButtonColor: "#ff5b27"
        });
    };


    /* EDIT */

    window.editFood = id => {

        const food =
            foods.find(x => Number(x.id) === Number(id));

        if (!food) return;

        $("foodId").value = food.id;
        $("foodName").value = food.name || "";
        $("foodCategory").value = food.category || "";
        $("foodPrice").value = food.price || "";
        $("foodDescription").value = food.description || "";

        $("foodDescriptionCount").textContent =
            $("foodDescription").value.length;

        $("foodAvailability").checked =
            Number(food.is_available) === 1;

        $("foodAvailabilityText").textContent =
            $("foodAvailability").checked
                ? "Available"
                : "Unavailable";

        selectedFile = null;
        oldImage = food.image || "";

        if (oldImage) {

            $("foodImagePlaceholder").hidden = true;
            $("foodImagePreviewContainer").hidden = false;

            $("foodImagePreview").src =
                `/images/foods/${oldImage}`;

            $("foodImageName").textContent =
                oldImage;

            $("foodImageSize").textContent =
                "Current image";

        } else {

            resetImage();
        }

        openModal(true);
    };


    /* TOGGLE */

    window.toggleFood = async id => {

        const food =
            foods.find(x => Number(x.id) === Number(id));

        if (!food) return;

        const status =
            Number(food.is_available) === 1 ? 0 : 1;

        try {

            const res = await fetch(
                `/admin/api/foods/${id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        is_available: status
                    })
                }
            );

            const data = await res.json();

            if (!res.ok || data.success === false)
                throw new Error(
                    data.message || "Status update failed"
                );

            await loadFoods();

        } catch (err) {

            Swal.fire(
                "Error",
                err.message,
                "error"
            );
        }
    };


    /* DELETE */

    window.deleteFood = async id => {

        const food =
            foods.find(x => Number(x.id) === Number(id));

        if (!food) return;

        const result = await Swal.fire({

            title: "Delete Food?",

            text: `"${food.name}" will be deleted.`,

            icon: "warning",

            showCancelButton: true,

            confirmButtonColor: "#d33",

            confirmButtonText: "Delete"
        });

        if (!result.isConfirmed)
            return;

        try {

            const res = await fetch(
                `/admin/api/foods/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await res.json();

            if (!res.ok || data.success === false)
                throw new Error(
                    data.message || "Delete failed"
                );

            await loadFoods();

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false
            });

        } catch (err) {

            Swal.fire(
                "Error",
                err.message,
                "error"
            );
        }
    };


    function formatDate(date) {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    loadFoods();

});