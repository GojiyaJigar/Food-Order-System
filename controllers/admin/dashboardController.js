const dashboardModel =
    require("../../models/admin/dashboardModel");


// =====================================================
// GET ADMIN DASHBOARD
// =====================================================

const getDashboard = (req, res) => {

    // -------------------------------------------------
    // NO CACHE
    // -------------------------------------------------

    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.set(
        "Pragma",
        "no-cache"
    );

    res.set(
        "Expires",
        "0"
    );


    // -------------------------------------------------
    // GET STATS
    // -------------------------------------------------

    dashboardModel.getDashboardStats(
        (statsError, stats) => {

            if (statsError) {

                console.error(
                    "❌ Dashboard Controller Stats Error:",
                    statsError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to load dashboard statistics."

                });

            }


            // -------------------------------------------------
            // GET RECENT ORDERS
            // -------------------------------------------------

            dashboardModel.getRecentOrders(
                (ordersError, recentOrders) => {

                    if (ordersError) {

                        console.error(
                            "❌ Dashboard Controller Orders Error:",
                            ordersError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to load recent orders."

                        });

                    }


                    // -------------------------------------------------
                    // FINAL RESPONSE
                    // -------------------------------------------------

                    return res.status(200).json({

                        success: true,

                        stats: {

                            totalUsers:
                                Number(
                                    stats.totalUsers || 0
                                ),

                            totalFoods:
                                Number(
                                    stats.totalFoods || 0
                                ),

                            totalOrders:
                                Number(
                                    stats.totalOrders || 0
                                ),

                            totalRevenue:
                                Number(
                                    stats.totalRevenue || 0
                                ),

                            pendingOrders:
                                Number(
                                    stats.pendingOrders || 0
                                ),

                            confirmedOrders:
                                Number(
                                    stats.confirmedOrders || 0
                                ),

                            preparingOrders:
                                Number(
                                    stats.preparingOrders || 0
                                ),

                            outForDeliveryOrders:
                                Number(
                                    stats.outForDeliveryOrders || 0
                                ),

                            deliveredOrders:
                                Number(
                                    stats.deliveredOrders || 0
                                ),

                            cancelledOrders:
                                Number(
                                    stats.cancelledOrders || 0
                                ),

                            activeOffers:
                                Number(
                                    stats.activeOffers || 0
                                )

                        },


                        recentOrders:
                            recentOrders || []

                    });

                }
            );

        }
    );

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDashboard
};