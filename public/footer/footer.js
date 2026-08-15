document.addEventListener("DOMContentLoaded", () => {

    const footer = document.getElementById("footer");

    if (!footer) return;

    fetch("/footer/footer.html", {
        cache: "no-store"
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(
                `Footer HTML not found: ${res.status}`
            );
        }

        return res.text();
    })
    .then(html => {

        footer.innerHTML = html;

        const year =
            document.getElementById("footerYear");

        if (year) {
            year.textContent =
                new Date().getFullYear();
        }

        console.log("✅ Footer Loaded");

    })
    .catch(err => {
        console.error("❌ Footer Error:", err);
    });

});