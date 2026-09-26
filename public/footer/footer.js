document.addEventListener("DOMContentLoaded", () => {
    // Locate the target footer element in the DOM
    const footer = document.getElementById("footer");

    if (!footer) return;

    // Fetch and dynamically inject the public HTML template into the page
    fetch("/footer/footer.html", {
        cache: "no-store"
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Footer HTML not found: ${res.status}`);
        }

        return res.text();
    })
    .then(html => {
        footer.innerHTML = html;

        // Set the current copyright year in the footer
        const year = document.getElementById("footerYear");

        if (year) {
            year.textContent = new Date().getFullYear();
        }
    })
    .catch(err => {
        // Silently handle template loading errors
    });
});