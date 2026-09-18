document.addEventListener("DOMContentLoaded", () => {

    const $ = id =>
        document.getElementById(id);

    const range =
        $("reportRange");

    const customRange =
        $("customRange");

    const state = {
        data: null
    };


    /* =====================================================
       API
    ===================================================== */

    async function loadReports() {

        const selected =
            range.value;

        let url =
            `/admin/api/reports?range=${selected}`;


        if (
            selected === "custom"
        ) {

            const start =
                $("reportStartDate").value;

            const end =
                $("reportEndDate").value;

            if (!start || !end) {
                return;
            }

            url =
                `/admin/api/reports?range=custom` +
                `&start=${start}` +
                `&end=${end}`;
        }


        try {

            showLoading();

            const response =
                await fetch(
                    url,
                    {
                        credentials:
                            "include",

                        cache:
                            "no-store",

                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "Unable to load reports."
                );
            }


            state.data =
                data;


            render(
                data
            );

        } catch (error) {

            console.error(
                "REPORT ERROR:",
                error
            );


            if (
                typeof Swal !==
                "undefined"
            ) {

                Swal.fire({
                    icon:"error",
                    title:"Reports unavailable",
                    text:error.message
                });
            }
        }
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function render(data) {

        const overview =
            data.overview || {};


        $("reportRevenue").textContent =
            money(
                overview.revenue
            );


        $("reportOrders").textContent =
            Number(
                overview.orders || 0
            );


        $("reportCustomers").textContent =
            Number(
                overview.customers || 0
            );


        $("reportAverage").textContent =
            money(
                overview.average_order
            );


        renderRevenueChart(
            data.revenue || []
        );


        renderStatus(
            data.order_status || {}
        );


        renderFoods(
            data.top_foods || []
        );


        renderPayments(
            data.payments || {}
        );


        const customers =
            data.customer_insights ||
            {};


        $("customerTotal").textContent =
            Number(
                customers.total || 0
            );


        $("newCustomers").textContent =
            Number(
                customers.new || 0
            );


        $("activeCustomers").textContent =
            Number(
                customers.active || 0
            );


        const offers =
            data.offers || {};


        $("offerTotal").textContent =
            Number(
                offers.total || 0
            );


        $("offerActive").textContent =
            Number(
                offers.active || 0
            );


        $("couponUsed").textContent =
            Number(
                offers.used || 0
            );


        $("discountGiven").textContent =
            money(
                offers.discount || 0
            );
    }


    /* =====================================================
       REVENUE
    ===================================================== */

    function renderRevenueChart(
        rows
    ) {

        const box =
            $("revenueChart");


        if (!rows.length) {

            box.innerHTML = `
                <div
                    style="
                        width:100%;
                        text-align:center;
                        color:#aaa;
                        padding-top:100px;
                    "
                >
                    No sales data
                </div>
            `;

            return;
        }


        const max =
            Math.max(
                ...rows.map(
                    item =>
                        Number(
                            item.revenue || 0
                        )
                ),
                1
            );


        box.innerHTML =
            rows.map(item => {

                const value =
                    Number(
                        item.revenue || 0
                    );


                const height =
                    Math.max(
                        5,
                        (
                            value /
                            max
                        ) * 200
                    );


                return `
                    <div class="chart-column">

                        <div
                            class="chart-value"
                        >
                            ₹${formatCompact(value)}
                        </div>

                        <div
                            class="chart-bar"
                            style="
                                height:${height}px
                            "
                        ></div>

                        <div
                            class="chart-label"
                        >
                            ${esc(
                                item.label || ""
                            )}
                        </div>

                    </div>
                `;

            }).join("");
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function renderStatus(
        statuses
    ) {

        const box =
            $("statusChart");


        const list = [
            ["Pending","pending"],
            ["Confirmed","confirmed"],
            ["Preparing","preparing"],
            ["Out For Delivery","out_for_delivery"],
            ["Delivered","delivered"],
            ["Cancelled","cancelled"]
        ];


        const values =
            list.map(
                item =>
                    Number(
                        statuses[item[1]] || 0
                    )
            );


        const max =
            Math.max(
                ...values,
                1
            );


        box.innerHTML =
            list.map(
                item => {

                    const value =
                        Number(
                            statuses[
                                item[1]
                            ] || 0
                        );


                    const width =
                        value
                            ? Math.max(
                                6,
                                (
                                    value /
                                    max
                                ) * 100
                            )
                            : 0;


                    return `
                        <div class="status-row">

                            <div
                                class="
                                    status-row-head
                                "
                            >
                                <span>
                                    ${item[0]}
                                </span>

                                <strong>
                                    ${value}
                                </strong>
                            </div>

                            <div
                                class="
                                    status-track
                                "
                            >

                                <div
                                    class="
                                        status-fill
                                    "
                                    style="
                                        width:${width}%
                                    "
                                ></div>

                            </div>

                        </div>
                    `;
                }
            ).join("");
    }


    /* =====================================================
       FOODS
    ===================================================== */

    function renderFoods(
        foods
    ) {

        const body =
            $("topFoodsBody");


        if (!foods.length) {

            body.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        style="
                            text-align:center;
                            color:#aaa;
                        "
                    >
                        No food sales
                    </td>
                </tr>
            `;

            return;
        }


        body.innerHTML =
            foods.slice(0,10)
                .map(
                    food => `
                        <tr>

                            <td>
                                ${esc(
                                    food.name ||
                                    "Food"
                                )}
                            </td>

                            <td>
                                ${Number(
                                    food.quantity || 0
                                )}
                            </td>

                            <td>
                                ${money(
                                    food.revenue
                                )}
                            </td>

                        </tr>
                    `
                )
                .join("");
    }


    /* =====================================================
       PAYMENTS
    ===================================================== */

    function renderPayments(
        payments
    ) {

        const box =
            $("paymentReport");


        box.innerHTML =
            ["COD","UPI","CARD"]
                .map(method => {

                    const item =
                        payments[
                            method
                        ] || {};


                    return `
                        <div
                            class="
                                payment-item
                            "
                        >

                            <div
                                class="
                                    payment-name
                                "
                            >
                                ${method}
                            </div>

                            <div
                                class="
                                    payment-data
                                "
                            >

                                <strong>
                                    ${money(
                                        item.amount
                                    )}
                                </strong>

                                <span>
                                    ${Number(
                                        item.orders || 0
                                    )} orders
                                </span>

                            </div>

                        </div>
                    `;
                })
                .join("");
    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        $("topFoodsBody").innerHTML = `
            <tr>
                <td
                    colspan="3"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#999;
                    "
                >
                    Loading...
                </td>
            </tr>
        `;
    }


    /* =====================================================
       DATE RANGE
    ===================================================== */

    range.addEventListener(
        "change",
        () => {

            customRange.hidden =
                range.value !==
                "custom";


            if (
                range.value !==
                "custom"
            ) {
                loadReports();
            }
        }
    );


    $("applyCustomRange")
        .addEventListener(
            "click",
            loadReports
        );


    $("refreshReportsBtn")
        .addEventListener(
            "click",
            loadReports
        );


    /* =====================================================
       HELPERS
    ===================================================== */

    function money(value) {

        return `₹${Number(
            value || 0
        ).toFixed(2)}`;
    }


    function formatCompact(
        value
    ) {

        const n =
            Number(value || 0);

        if (n >= 100000) {
            return `${(
                n / 100000
            ).toFixed(1)}L`;
        }

        if (n >= 1000) {
            return `${(
                n / 1000
            ).toFixed(1)}K`;
        }

        return n.toFixed(0);
    }


    function esc(value) {

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


    /* =====================================================
       DEFAULT DATES
    ===================================================== */

    const today =
        new Date();

    const dateValue =
        today.toISOString()
            .split("T")[0];


    $("reportEndDate").value =
        dateValue;


    const monthStart =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    $("reportStartDate").value =
        monthStart
            .toISOString()
            .split("T")[0];


    /* START */

    loadReports();

});