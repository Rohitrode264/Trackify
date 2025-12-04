import React, { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import {
    BarChart3,
    CreditCard,
    PackageCheck,
    PackageSearch,
    ShoppingCart,
    Star,
    Truck,
    UsersRound,
} from 'lucide-react';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import { useOrders } from '../../hooks/useFetchOrders';

const chartPalette = [
    '#2563eb', // blue-600
    '#9333ea', // purple-600
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#16a34a', // green-600
    '#f43f5e', // rose-500
    '#0ea5e9', // sky-500
    '#a855f7', // violet-500
];

const formatCurrency = (value: number) =>
    value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    });

const formatDayLabel = (date: Date) =>
    date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

const pendingStatuses = ['created', 'admin_review', 'packaging', 'ready_for_dispatch'];

export const OmsDashboard: React.FC = () => {
    const { orders, loading, error } = useOrders({ page: 1, limit: 100 });
    const [revenueRange, setRevenueRange] = useState<'7d' | '30d' | '12m'>('7d');

    const today = useMemo(() => new Date(), []);
    const startOfMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);

    // Calculate customer order counts for new vs returning customers
    const customerOrderCounts = useMemo(() => {
        const counts = new Map<string, number>();
        orders.forEach((order) => {
            if (!order.customer?._id) {
                return;
            }
            counts.set(order.customer._id, (counts.get(order.customer._id) || 0) + 1);
        });
        return counts;
    }, [orders]);

    // Calculate all KPIs from real order data
    const kpiStats = useMemo(() => {
        let ordersToday = 0;
        let ordersThisMonth = 0;
        let revenueToday = 0;
        let revenueThisMonth = 0;
        let pendingOrders = 0;
        let deliveredOrders = 0;
        let cancelledOrders = 0;
        let returns = 0;
        let totalRevenue = 0;

        orders.forEach((order) => {
            const createdAt = new Date(order.createdAt);
            const status = (order.status || '').toLowerCase();
            const value = order.totals?.grandTotal || 0;

            totalRevenue += value;

            // Orders today
            if (
                createdAt.getDate() === today.getDate() &&
                createdAt.getMonth() === today.getMonth() &&
                createdAt.getFullYear() === today.getFullYear()
            ) {
                ordersToday += 1;
                revenueToday += value;
            }

            // Orders this month
            if (createdAt >= startOfMonth) {
                ordersThisMonth += 1;
                revenueThisMonth += value;
            }

            // Status-based counts
            if (pendingStatuses.includes(status)) {
                pendingOrders += 1;
            }

            if (status.includes('deliver')) {
                deliveredOrders += 1;
            }

            if (status.includes('cancel')) {
                cancelledOrders += 1;
            }

            if (status.includes('return')) {
                returns += 1;
            }
        });

        const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        return {
            ordersToday,
            ordersThisMonth,
            revenueToday,
            revenueThisMonth,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            returns,
            averageOrderValue,
        };
    }, [orders, startOfMonth, today]);

    // Generate 10-day trend data from real orders
    const recentDaysData = useMemo(() => {
        return Array.from({ length: 10 }).map((_, idx) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (9 - idx));
            const key = date.toISOString().slice(0, 10);

            const dayOrders = orders.filter((order) => order.createdAt?.startsWith(key));
            const ordersCount = dayOrders.length;
            const dayRevenue = dayOrders.reduce(
                (sum, order) => sum + (order.totals?.grandTotal || 0),
                0,
            );

            return {
                label: formatDayLabel(date),
                orders: ordersCount,
                revenue: Math.round(dayRevenue),
            };
        });
    }, [orders, today]);

    // Revenue trend data for range selector (7 days, 30 days, 12 months)
    const revenueTrendData = useMemo(() => {
        if (revenueRange === '7d') {
            return Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (6 - idx));
                const key = date.toISOString().slice(0, 10);
                const dayOrders = orders.filter((order) => order.createdAt?.startsWith(key));
                const dayRevenue = dayOrders.reduce(
                    (sum, order) => sum + (order.totals?.grandTotal || 0),
                    0,
                );
                return {
                    label: formatDayLabel(date),
                    revenue: Math.round(dayRevenue),
                };
            });
        }

        if (revenueRange === '30d') {
            return Array.from({ length: 30 }).map((_, idx) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (29 - idx));
                const key = date.toISOString().slice(0, 10);
                const dayOrders = orders.filter((order) => order.createdAt?.startsWith(key));
                const dayRevenue = dayOrders.reduce(
                    (sum, order) => sum + (order.totals?.grandTotal || 0),
                    0,
                );
                return {
                    label: `${date.getDate()}`,
                    revenue: Math.round(dayRevenue),
                };
            });
        }

        // 12 months – group by month
        const monthMap = new Map<string, number>();
        orders.forEach((order) => {
            const d = new Date(order.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthMap.set(key, (monthMap.get(key) || 0) + (order.totals?.grandTotal || 0));
        });

        return Array.from({ length: 12 }).map((_, idx) => {
            const date = new Date(today.getFullYear(), today.getMonth() - (11 - idx), 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const revenue = monthMap.get(key) || 0;
            const label = date.toLocaleDateString('en-IN', { month: 'short' });
            return { label, revenue: Math.round(revenue) };
        });
    }, [orders, revenueRange, today]);

    // Order status distribution from real data
    const statusDistribution = useMemo(() => {
        const counts = new Map<string, number>();
        orders.forEach((order) => {
            const status = (order.status || 'pending').toLowerCase();
            counts.set(status, (counts.get(status) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([status, value], idx) => ({
            status,
            value,
            color: chartPalette[idx % chartPalette.length],
        }));
    }, [orders]);

    // Shipment status distribution
    const shipmentStatusData = useMemo(() => {
        const buckets = {
            pending: 0,
            inTransit: 0,
            delivered: 0,
        };

        orders.forEach((order) => {
            const status = (order.status || '').toLowerCase();
            if (status.includes('deliver')) {
                buckets.delivered += 1;
            } else if (status.includes('dispatch') || status.includes('ship')) {
                buckets.inTransit += 1;
            } else {
                buckets.pending += 1;
            }
        });

        return Object.entries(buckets).map(([label, value], idx) => ({
            label,
            value,
            color: chartPalette[idx % chartPalette.length],
        }));
    }, [orders]);

    // Customer insights: new vs returning
    const customerSplitData = useMemo(() => {
        let newCustomers = 0;
        let returningCustomers = 0;

        customerOrderCounts.forEach((count) => {
            if (count > 1) {
                returningCustomers += 1;
            } else {
                newCustomers += 1;
            }
        });

        return [
            { label: 'New', value: newCustomers, color: chartPalette[0] },
            { label: 'Returning', value: returningCustomers, color: chartPalette[1] },
        ];
    }, [customerOrderCounts]);

    // Recent orders sorted by date
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8);
    }, [orders]);

    const kpiCards = [
        {
            label: 'Total Orders Today',
            value: kpiStats.ordersToday,
            icon: ShoppingCart,
        },
        {
            label: 'Total Orders This Month',
            value: kpiStats.ordersThisMonth,
            icon: PackageCheck,
        },
        {
            label: 'Revenue Today',
            value: formatCurrency(kpiStats.revenueToday),
            icon: CreditCard,
        },
        {
            label: 'Revenue This Month',
            value: formatCurrency(kpiStats.revenueThisMonth),
            icon: BarChart3,
        },
        {
            label: 'Pending Orders',
            value: kpiStats.pendingOrders,
            icon: PackageSearch,
        },
        {
            label: 'Delivered Orders',
            value: kpiStats.deliveredOrders,
            icon: Truck,
        },
        {
            label: 'Cancelled Orders',
            value: kpiStats.cancelledOrders,
            icon: UsersRound,
        },
        {
            label: 'Returns / RMA',
            value: kpiStats.returns,
            icon: Star,
        },
        {
            label: 'Average Order Value',
            value: formatCurrency(kpiStats.averageOrderValue || 0),
            icon: BarChart3,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500">
                            Operations · Order Management
                        </p>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            OMS Performance Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Real-time visibility into orders, revenue, logistics, and customer health.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200 text-xs sm:text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Synced with live data
                        </span>
                        <span className="hidden md:inline text-gray-400">•</span>
                        <span className="text-gray-600 text-xs sm:text-sm">
                            {today.toLocaleDateString('en-IN', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                {loading && (
                    <Card padding="md" shadow="sm" className="border-dashed border-2 border-gray-200">
                        <p className="text-center text-sm text-gray-500">Loading dashboard metrics...</p>
                    </Card>
                )}

                {error && (
                    <Card padding="md" shadow="sm" className="border border-red-200 bg-red-50/50">
                        <p className="text-center text-sm text-red-600">{error}</p>
                    </Card>
                )}

                {!loading && !error && (
                    <>
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {kpiCards.map(({ label, value, icon: Icon }) => (
                                <Card key={label} padding="md" shadow="md" className="relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold uppercase text-gray-400 truncate">{label}</p>
                                            <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 wrap-break-words">{value}</p>
                                        </div>
                                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 ml-2">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </section>

                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                            <Card className="col-span-1 xl:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Orders Trend</h2>
                                        <p className="text-sm text-gray-500">10-day volume vs revenue</p>
                                    </div>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={recentDaysData}
                                            margin={{ left: 4, right: 0, top: 10, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                            <YAxis
                                                yAxisId="left"
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="orders"
                                                stroke="#2563eb"
                                                strokeWidth={2}
                                                dot={{ r: 4, strokeWidth: 2, stroke: '#2563eb', fill: '#fff' }}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#14b8a6"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Order Status Distribution</h2>
                                        <p className="text-sm text-gray-500">Live workflow split</p>
                                    </div>
                                </div>
                                <div className="h-72 flex flex-col">
                                    <div className="flex-1">
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={statusDistribution}
                                                    dataKey="value"
                                                    nameKey="status"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                >
                                                    {statusDistribution.map((entry) => (
                                                        <Cell key={`status-${entry.status}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        {statusDistribution.map((entry) => (
                                            <div key={entry.status} className="flex items-center gap-2 text-sm text-gray-600">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="capitalize">{entry.status.replace(/_/g, ' ')}</span>
                                                <span className="ml-auto font-semibold text-gray-900">{entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                                <p className="text-sm text-gray-500">Growth over time, similar to a stock chart</p>
                            </div>
                            <div className="inline-flex items-center rounded-full bg-gray-100 p-0.5 text-xs sm:text-sm">
                                {[
                                    { key: '7d', label: '7D' },
                                    { key: '30d', label: '30D' },
                                    { key: '12m', label: '12M' },
                                ].map((range) => (
                                    <button
                                        key={range.key}
                                        onClick={() => setRevenueRange(range.key as '7d' | '30d' | '12m')}
                                        className={`px-3 py-1 rounded-full transition-all ${
                                            revenueRange === range.key
                                                ? 'bg-white shadow-sm text-gray-900'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer>
                                <AreaChart data={revenueTrendData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#revenueGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Shipment Status</h2>
                                        <p className="text-sm text-gray-500">Fulfilment pipeline</p>
                                    </div>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={shipmentStatusData}
                                                dataKey="value"
                                                nameKey="label"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                            >
                                                {shipmentStatusData.map((entry) => (
                                                    <Cell key={entry.label} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    {shipmentStatusData.map((entry) => (
                                        <div key={entry.label} className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-xs uppercase text-gray-400">{entry.label}</p>
                                            <p className="text-lg font-semibold text-gray-900 mt-1">{entry.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </section>

                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Card>
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Customer Insights</h2>
                                        <p className="text-sm text-gray-500">New vs returning buyers</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="h-64">
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={customerSplitData}
                                                    dataKey="value"
                                                    nameKey="label"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                >
                                                    {customerSplitData.map((entry) => (
                                                        <Cell key={entry.label} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-4">
                                        {customerSplitData.map((entry) => (
                                            <div
                                                key={entry.label}
                                                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-500">{entry.label} customers</p>
                                                        <p className="text-lg font-semibold text-gray-900">{entry.value}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {orders.length
                                                        ? Math.round((entry.value / customerOrderCounts.size) * 100)
                                                        : 0}
                                                    %
                                                </span>
                                            </div>
                                        ))}

                                        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50 text-sm text-blue-700">
                                            Returning customers drive{' '}
                                            {orders.length
                                                ? Math.round(
                                                    ((customerSplitData[1]?.value || 0) / customerOrderCounts.size) * 100,
                                                )
                                                : 0}
                                            % of total customer base.
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                                        <p className="text-sm text-gray-500">Quick statistics</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200">
                                        <p className="text-xs uppercase text-blue-600 font-semibold mb-1">Total Orders</p>
                                        <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-linear-to-br from-green-50 to-green-100 border border-green-200">
                                        <p className="text-xs uppercase text-green-600 font-semibold mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-900">
                                            {formatCurrency(
                                                orders.reduce((sum, order) => sum + (order.totals?.grandTotal || 0), 0),
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200">
                                        <p className="text-xs uppercase text-purple-600 font-semibold mb-1">Unique Customers</p>
                                        <p className="text-2xl font-bold text-purple-900">{customerOrderCounts.size}</p>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        <section>
                            <Card className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                                        <p className="text-sm text-gray-500">Latest fulfilment activity</p>
                                    </div>
                                </div>
                                {recentOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">No orders found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500 uppercase tracking-wide text-xs">
                                                    <th className="py-3 pr-6 font-semibold">Order ID</th>
                                                    <th className="py-3 pr-6 font-semibold">Customer</th>
                                                    <th className="py-3 pr-6 font-semibold">Order Status</th>
                                                    <th className="py-3 pr-6 font-semibold">Order Value</th>
                                                    <th className="py-3 pr-6 font-semibold">Order Date</th>
                                                    <th className="py-3 font-semibold">Items</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                                {recentOrders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-gray-50">
                                                        <td className="py-4 pr-6 font-semibold text-gray-900">
                                                            {order.orderId}
                                                        </td>
                                                        <td className="py-4 pr-6">
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {order.customer?.name || 'N/A'}
                                                                </p>
                                                                {order.customer?.phones?.[0] && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {order.customer.phones[0]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pr-6">
                                                            <StatusBadge
                                                                status={(order.status || 'pending').toLowerCase()}
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td className="py-4 pr-6 font-semibold text-gray-900">
                                                            {formatCurrency(order.totals?.grandTotal || 0)}
                                                        </td>
                                                        <td className="py-4 pr-6 text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </td>
                                                        <td className="py-4 text-gray-600">
                                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default OmsDashboard;
