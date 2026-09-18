const db = require("../../config/db");

function query(sql, params = [], callback) {
    db.query(sql, params, callback);
}

function getRange(range, start, end) {
    if (range === "custom" && start && end) {
        return {
            start: `${start} 00:00:00`,
            end: `${end} 23:59:59`
        };
    }

    if (range === "today") {
        return {
            start: `
                DATE_FORMAT(CURDATE(), '%Y-%m-%d 00:00:00')
            `,
            end: `
                DATE_FORMAT(
                    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
                    '%Y-%m-%d 00:00:00'
                )
            `
        };
    }

    if (range === "week") {
        return {
            start: `
                DATE_FORMAT(
                    DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
                    '%Y-%m-%d 00:00:00'
                )
            `,
            end: `
                DATE_FORMAT(
                    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
                    '%Y-%m-%d 00:00:00'
                )
            `
        };
    }

    return {
        start: `
            DATE_FORMAT(
                CURDATE() - INTERVAL (DAY(CURDATE()) - 1) DAY,
                '%Y-%m-%d 00:00:00'
            )
        `,
        end: `
            DATE_FORMAT(
                DATE_ADD(
                    LAST_DAY(CURDATE()),
                    INTERVAL 1 DAY
                ),
                '%Y-%m-%d 00:00:00'
            )
        `
    };
}


const getReports = (
    range,
    start,
    end,
    callback
) => {

    const r = getRange(
        range,
        start,
        end
    );


    const rangeWhere = `
        o.created_at >= ${r.start}
        AND o.created_at < ${r.end}
    `;


    const overviewSql = `
        SELECT
            COUNT(*) AS orders,
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status <> 'Cancelled'
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS revenue
        FROM orders o
        WHERE ${rangeWhere}
    `;


    const customersSql = `
        SELECT COUNT(DISTINCT o.user_id) AS customers
        FROM orders o
        WHERE ${rangeWhere}
          AND o.order_status <> 'Cancelled'
    `;


    const revenueSql = `
        SELECT
            DATE(o.created_at) AS report_date,
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status <> 'Cancelled'
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS revenue
        FROM orders o
        WHERE ${rangeWhere}
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at)
    `;


    const statusSql = `
        SELECT
            o.order_status,
            COUNT(*) AS total
        FROM orders o
        WHERE ${rangeWhere}
        GROUP BY o.order_status
    `;


    const foodsSql = `
        SELECT
            f.name,
            SUM(oi.quantity) AS quantity,
            SUM(oi.quantity * oi.price) AS revenue
        FROM order_items oi
        INNER JOIN orders o
            ON o.id = oi.order_id
        INNER JOIN foods f
            ON f.id = oi.food_id
        WHERE ${rangeWhere}
          AND o.order_status <> 'Cancelled'
        GROUP BY oi.food_id, f.name
        ORDER BY quantity DESC
        LIMIT 10
    `;


    const paymentSql = `
        SELECT
            o.payment_method,
            COUNT(*) AS orders,
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status <> 'Cancelled'
                        THEN o.total_amount
                        ELSE 0
                    END
                ),
                0
            ) AS amount
        FROM orders o
        WHERE ${rangeWhere}
        GROUP BY o.payment_method
    `;


    const customerInsightSql = `
        SELECT
            COUNT(*) AS total,
            SUM(
                CASE
                    WHEN u.created_at >= ${r.start}
                     AND u.created_at < ${r.end}
                    THEN 1
                    ELSE 0
                END
            ) AS new_customers,
            SUM(
                CASE
                    WHEN u.status = 'active'
                    THEN 1
                    ELSE 0
                END
            ) AS active_customers
        FROM users u
        WHERE u.role = 'customer'
    `;


    const offerSql = `
        SELECT
            COUNT(*) AS total,
            SUM(
                CASE
                    WHEN is_active = 1
                     AND start_date <= NOW()
                     AND end_date >= NOW()
                    THEN 1
                    ELSE 0
                END
            ) AS active,
            COALESCE(
                SUM(used_count),
                0
            ) AS used
        FROM offers
    `;


    const discountSql = `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN o.order_status <> 'Cancelled'
                        THEN 0
                        ELSE 0
                    END
                ),
                0
            ) AS discount
        FROM orders o
        WHERE ${rangeWhere}
    `;


    query(
        overviewSql,
        [],
        (error, overviewRows) => {

            if (error) {
                return callback(error);
            }


            query(
                customersSql,
                [],
                (error, customerRows) => {

                    if (error) {
                        return callback(error);
                    }


                    query(
                        revenueSql,
                        [],
                        (error, revenueRows) => {

                            if (error) {
                                return callback(error);
                            }


                            query(
                                statusSql,
                                [],
                                (error, statusRows) => {

                                    if (error) {
                                        return callback(error);
                                    }


                                    query(
                                        foodsSql,
                                        [],
                                        (error, foodRows) => {

                                            if (error) {
                                                return callback(error);
                                            }


                                            query(
                                                paymentSql,
                                                [],
                                                (
                                                    error,
                                                    paymentRows
                                                ) => {

                                                    if (error) {
                                                        return callback(error);
                                                    }


                                                    query(
                                                        customerInsightSql,
                                                        [],
                                                        (
                                                            error,
                                                            customerInsightRows
                                                        ) => {

                                                            if (error) {
                                                                return callback(error);
                                                            }


                                                            query(
                                                                offerSql,
                                                                [],
                                                                (
                                                                    error,
                                                                    offerRows
                                                                ) => {

                                                                    if (error) {
                                                                        return callback(error);
                                                                    }


                                                                    query(
                                                                        discountSql,
                                                                        [],
                                                                        (
                                                                            error,
                                                                            discountRows
                                                                        ) => {

                                                                            if (error) {
                                                                                return callback(error);
                                                                            }


                                                                            callback(
                                                                                null,
                                                                                {
                                                                                    overview: {
                                                                                        revenue:
                                                                                            Number(
                                                                                                overviewRows[0]?.revenue || 0
                                                                                            ),

                                                                                        orders:
                                                                                            Number(
                                                                                                overviewRows[0]?.orders || 0
                                                                                            ),

                                                                                        customers:
                                                                                            Number(
                                                                                                customerRows[0]?.customers || 0
                                                                                            ),

                                                                                        average_order:
                                                                                            Number(
                                                                                                overviewRows[0]?.orders
                                                                                                    ? (
                                                                                                        Number(
                                                                                                            overviewRows[0]?.revenue || 0
                                                                                                        ) /
                                                                                                        Number(
                                                                                                            overviewRows[0]?.orders || 1
                                                                                                        )
                                                                                                    )
                                                                                                    : 0
                                                                                            )
                                                                                    },

                                                                                    revenue:
                                                                                        revenueRows.map(
                                                                                            row => ({
                                                                                                label:
                                                                                                    new Date(
                                                                                                        row.report_date
                                                                                                    ).toLocaleDateString(
                                                                                                        "en-IN",
                                                                                                        {
                                                                                                            day: "2-digit",
                                                                                                            month: "short"
                                                                                                        }
                                                                                                    ),

                                                                                                revenue:
                                                                                                    Number(
                                                                                                        row.revenue || 0
                                                                                                    )
                                                                                            })
                                                                                        ),

                                                                                    order_status:
                                                                                        statusRows.reduce(
                                                                                            (
                                                                                                obj,
                                                                                                row
                                                                                            ) => {

                                                                                                const key =
                                                                                                    String(
                                                                                                        row.order_status
                                                                                                    )
                                                                                                        .toLowerCase()
                                                                                                        .replace(
                                                                                                            / /g,
                                                                                                            "_"
                                                                                                        );

                                                                                                obj[key] =
                                                                                                    Number(
                                                                                                        row.total || 0
                                                                                                    );

                                                                                                return obj;
                                                                                            },
                                                                                            {}
                                                                                        ),

                                                                                    top_foods:
                                                                                        foodRows.map(
                                                                                            row => ({
                                                                                                name:
                                                                                                    row.name,

                                                                                                quantity:
                                                                                                    Number(
                                                                                                        row.quantity || 0
                                                                                                    ),

                                                                                                revenue:
                                                                                                    Number(
                                                                                                        row.revenue || 0
                                                                                                    )
                                                                                            })
                                                                                        ),

                                                                                    payments:
                                                                                        paymentRows.reduce(
                                                                                            (
                                                                                                obj,
                                                                                                row
                                                                                            ) => {

                                                                                                obj[
                                                                                                    row.payment_method
                                                                                                ] = {
                                                                                                    orders:
                                                                                                        Number(
                                                                                                            row.orders || 0
                                                                                                        ),

                                                                                                    amount:
                                                                                                        Number(
                                                                                                            row.amount || 0
                                                                                                        )
                                                                                                };

                                                                                                return obj;
                                                                                            },
                                                                                            {}
                                                                                        ),

                                                                                    customer_insights:
                                                                                        {
                                                                                            total:
                                                                                                Number(
                                                                                                    customerInsightRows[0]?.total || 0
                                                                                                ),

                                                                                            new:
                                                                                                Number(
                                                                                                    customerInsightRows[0]?.new_customers || 0
                                                                                                ),

                                                                                            active:
                                                                                                Number(
                                                                                                    customerInsightRows[0]?.active_customers || 0
                                                                                                )
                                                                                        },

                                                                                    offers:
                                                                                        {
                                                                                            total:
                                                                                                Number(
                                                                                                    offerRows[0]?.total || 0
                                                                                                ),

                                                                                            active:
                                                                                                Number(
                                                                                                    offerRows[0]?.active || 0
                                                                                                ),

                                                                                            used:
                                                                                                Number(
                                                                                                    offerRows[0]?.used || 0
                                                                                                ),

                                                                                            discount:
                                                                                                Number(
                                                                                                    discountRows[0]?.discount || 0
                                                                                                )
                                                                                        }
                                                                                }
                                                                            );
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


module.exports = {
    getReports
};