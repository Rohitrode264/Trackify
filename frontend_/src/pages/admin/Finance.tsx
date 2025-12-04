import React, { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
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
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Receipt,
    FileText,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    X,
    FileDown,
} from 'lucide-react';
import Card from '../../components/Card';
import { useOrders } from '../../hooks/useFetchOrders';
import Button from '../../components/Button';
import { generateFinanceReportPDF, generateFinanceReportCSV } from '../../utils/financeReportGenerator';

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

export const Finance: React.FC = () => {
    const { orders, loading, error } = useOrders({ page: 1, limit: 1000 });
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '12m' | 'all'>('30d');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState<'pdf' | 'csv'>('pdf');
    const [customDateRange, setCustomDateRange] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [reportPeriod, setReportPeriod] = useState<'days' | 'months' | 'years' | 'custom'>('days');
    const [periodValue, setPeriodValue] = useState<number>(30);

    const today = useMemo(() => new Date(), []);
    const startOfMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
    const startOfYear = useMemo(() => new Date(today.getFullYear(), 0, 1), [today]);

    // Filter orders based on time range and status
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter((order) => order.status.toLowerCase() === selectedStatus.toLowerCase());
        }

        // Filter by time range
        const now = new Date();
        filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt);
            switch (timeRange) {
                case '7d':
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return orderDate >= sevenDaysAgo;
                case '30d':
                    const thirtyDaysAgo = new Date(now);
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return orderDate >= thirtyDaysAgo;
                case '12m':
                    return orderDate >= startOfYear;
                case 'all':
                default:
                    return true;
            }
        });

        return filtered;
    }, [orders, timeRange, selectedStatus, startOfYear]);

    // Calculate comprehensive financial metrics
    const financialMetrics = useMemo(() => {
        let totalRevenue = 0;
        let totalGST = 0;
        let totalShipping = 0;
        let totalSubtotal = 0;
        let paidOrders = 0;
        let pendingOrders = 0;
        let cancelledOrders = 0;
        let refundedAmount = 0;

        filteredOrders.forEach((order) => {
            const status = (order.status || '').toLowerCase();
            const grandTotal = order.totals?.grandTotal || 0;
            const gst = order.totals?.totalGst || 0;
            const shipping = order.shippingCharge || 0;
            const subtotal = order.totals?.subTotal || 0;

            totalRevenue += grandTotal;
            totalGST += gst;
            totalShipping += shipping;
            totalSubtotal += subtotal;

            if (status.includes('deliver')) {
                paidOrders += 1;
            } else if (status.includes('cancel') || status.includes('return')) {
                cancelledOrders += 1;
                refundedAmount += grandTotal;
            } else {
                pendingOrders += 1;
            }
        });

        const netRevenue = totalRevenue - refundedAmount;
        const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
        const gstPercentage = totalSubtotal > 0 ? (totalGST / totalSubtotal) * 100 : 0;

        return {
            totalRevenue,
            netRevenue,
            totalGST,
            totalShipping,
            totalSubtotal,
            paidOrders,
            pendingOrders,
            cancelledOrders,
            refundedAmount,
            averageOrderValue,
            gstPercentage,
            totalOrders: filteredOrders.length,
        };
    }, [filteredOrders]);

    // Revenue trend data
    const revenueTrendData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '12m' ? 12 : 365;
        const isMonthly = timeRange === '12m' || timeRange === 'all';

        return Array.from({ length: days }).map((_, idx) => {
            const date = new Date(today);
            if (isMonthly) {
                date.setMonth(date.getMonth() - (days - 1 - idx));
                date.setDate(1);
            } else {
                date.setDate(date.getDate() - (days - 1 - idx));
            }

            const key = isMonthly
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                : date.toISOString().slice(0, 10);

            const dayOrders = filteredOrders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                if (isMonthly) {
                    return (
                        orderDate.getFullYear() === date.getFullYear() &&
                        orderDate.getMonth() === date.getMonth()
                    );
                }
                return order.createdAt?.startsWith(key);
            });

            const revenue = dayOrders.reduce((sum, order) => sum + (order.totals?.grandTotal || 0), 0);
            const gst = dayOrders.reduce((sum, order) => sum + (order.totals?.totalGst || 0), 0);
            const ordersCount = dayOrders.length;

            return {
                label: isMonthly
                    ? date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : formatDayLabel(date),
                revenue: Math.round(revenue),
                gst: Math.round(gst),
                orders: ordersCount,
                netRevenue: Math.round(revenue - gst),
            };
        });
    }, [filteredOrders, timeRange, today]);

    // Status-wise revenue distribution
    const statusRevenueData = useMemo(() => {
        const statusMap = new Map<string, { revenue: number; count: number }>();

        filteredOrders.forEach((order) => {
            const status = (order.status || 'pending').toLowerCase();
            const revenue = order.totals?.grandTotal || 0;

            const existing = statusMap.get(status) || { revenue: 0, count: 0 };
            statusMap.set(status, {
                revenue: existing.revenue + revenue,
                count: existing.count + 1,
            });
        });

        return Array.from(statusMap.entries()).map(([status, data], idx) => ({
            status: status.replace(/_/g, ' ').toUpperCase(),
            revenue: data.revenue,
            count: data.count,
            color: chartPalette[idx % chartPalette.length],
        }));
    }, [filteredOrders]);

    // Top customers by revenue
    const topCustomers = useMemo(() => {
        const customerMap = new Map<string, { name: string; revenue: number; orders: number }>();

        filteredOrders.forEach((order) => {
            const customerId = order.customer?._id || 'unknown';
            const customerName = order.customer?.name || 'Unknown';
            const revenue = order.totals?.grandTotal || 0;

            const existing = customerMap.get(customerId) || { name: customerName, revenue: 0, orders: 0 };
            customerMap.set(customerId, {
                name: customerName,
                revenue: existing.revenue + revenue,
                orders: existing.orders + 1,
            });
        });

        return Array.from(customerMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [filteredOrders]);

    // Monthly comparison
    const monthlyComparison = useMemo(() => {
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const currentMonthOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= currentMonth;
        });

        const lastMonthOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastMonth && orderDate <= lastMonthEnd;
        });

        const currentRevenue = currentMonthOrders.reduce(
            (sum, order) => sum + (order.totals?.grandTotal || 0),
            0,
        );
        const lastRevenue = lastMonthOrders.reduce(
            (sum, order) => sum + (order.totals?.grandTotal || 0),
            0,
        );

        const change = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

        return {
            current: currentRevenue,
            last: lastRevenue,
            change,
        };
    }, [filteredOrders, today]);

    // Calculate date range for report
    const getReportDateRange = () => {
        const end = new Date();
        let start = new Date();

        if (customDateRange && startDate && endDate) {
            return {
                start: new Date(startDate),
                end: new Date(endDate),
            };
        }

        switch (reportPeriod) {
            case 'days':
                start.setDate(start.getDate() - periodValue);
                break;
            case 'months':
                start.setMonth(start.getMonth() - periodValue);
                break;
            case 'years':
                start.setFullYear(start.getFullYear() - periodValue);
                break;
            case 'custom':
                if (startDate && endDate) {
                    return {
                        start: new Date(startDate),
                        end: new Date(endDate),
                    };
                }
                break;
        }

        return { start, end };
    };

    // Generate report
    const handleGenerateReport = () => {
        const { start, end } = getReportDateRange();
        
        // Filter orders for the date range
        const reportOrders = filteredOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
        });

        // Calculate metrics
        let totalRevenue = 0;
        let totalGST = 0;
        let totalShipping = 0;
        let totalSubtotal = 0;
        let refundedAmount = 0;
        let paidOrders = 0;
        let pendingOrders = 0;
        let cancelledOrders = 0;

        reportOrders.forEach((order) => {
            const status = (order.status || '').toLowerCase();
            totalRevenue += order.totals?.grandTotal || 0;
            totalGST += order.totals?.totalGst || 0;
            totalShipping += order.shippingCharge || 0;
            totalSubtotal += order.totals?.subTotal || 0;

            if (status.includes('deliver')) {
                paidOrders += 1;
            } else if (status.includes('cancel') || status.includes('return')) {
                cancelledOrders += 1;
                refundedAmount += order.totals?.grandTotal || 0;
            } else {
                pendingOrders += 1;
            }
        });

        const netRevenue = totalRevenue - refundedAmount;
        const averageOrderValue = reportOrders.length > 0 ? totalRevenue / reportOrders.length : 0;

        const reportData = {
            orders: reportOrders,
            startDate: start,
            endDate: end,
            totalRevenue,
            totalGST,
            totalShipping,
            totalSubtotal,
            netRevenue,
            refundedAmount,
            totalOrders: reportOrders.length,
            paidOrders,
            pendingOrders,
            cancelledOrders,
            averageOrderValue,
        };

        if (reportType === 'pdf') {
            generateFinanceReportPDF(reportData, 'Finance Report');
        } else {
            generateFinanceReportCSV(reportData);
        }

        setShowReportModal(false);
    };

    const kpiCards = [
        {
            label: 'Total Revenue',
            value: formatCurrency(financialMetrics.totalRevenue),
            icon: DollarSign,
            change: monthlyComparison.change,
        },
        {
            label: 'Net Revenue',
            value: formatCurrency(financialMetrics.netRevenue),
            icon: TrendingUp,
        },
        {
            label: 'Total GST',
            value: formatCurrency(financialMetrics.totalGST),
            icon: Receipt,
        },
        {
            label: 'Shipping Charges',
            value: formatCurrency(financialMetrics.totalShipping),
            icon: CreditCard,
        },
        {
            label: 'Average Order Value',
            value: formatCurrency(financialMetrics.averageOrderValue),
            icon: FileText,
        },
        {
            label: 'Refunded Amount',
            value: formatCurrency(financialMetrics.refundedAmount),
            icon: TrendingDown,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500">
                            Finance · Management
                        </p>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                            Financial Overview
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Comprehensive financial analytics and revenue insights
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Download Report Button */}
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setShowReportModal(true)}
                            className="shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
                        >
                            <FileDown className="w-5 h-5" />
                            <span className="hidden sm:inline">Download Report</span>
                        </Button>
                        {/* Time Range Filter */}
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                            {(['7d', '30d', '12m', 'all'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        timeRange === range
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {range === 'all' ? 'All Time' : range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="delivered">Delivered</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="packaging">Packaging</option>
                                <option value="created">Created</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && (
                    <Card padding="md" shadow="sm" className="border-dashed border-2 border-gray-200">
                        <p className="text-center text-sm text-gray-500">Loading financial data...</p>
                    </Card>
                )}

                {error && (
                    <Card padding="md" shadow="sm" className="border border-red-200 bg-red-50/50">
                        <p className="text-center text-sm text-red-600">{error}</p>
                    </Card>
                )}

                {!loading && !error && (
                    <>
                        {/* KPI Cards */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {kpiCards.map(({ label, value, icon: Icon, change }) => (
                                <Card key={label} padding="md" shadow="md" className="relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold uppercase text-gray-400 truncate">
                                                {label}
                                            </p>
                                            <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900 break-words">
                                                {value}
                                            </p>
                                            {change !== undefined && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    {change >= 0 ? (
                                                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            change >= 0 ? 'text-emerald-600' : 'text-red-600'
                                                        }`}
                                                    >
                                                        {Math.abs(change).toFixed(1)}% vs last month
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 ml-2">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </section>

                        {/* Revenue Trend Chart */}
                        <section>
                            <Card padding="lg" shadow="md">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
                                        <p className="text-sm text-gray-500">
                                            {timeRange === '7d'
                                                ? '7-day revenue analysis'
                                                : timeRange === '30d'
                                                  ? '30-day revenue analysis'
                                                  : timeRange === '12m'
                                                    ? '12-month revenue analysis'
                                                    : 'Complete revenue history'}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueTrendData}>
                                            <defs>
                                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gstGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#2563eb"
                                                fillOpacity={1}
                                                fill="url(#revenueGradient)"
                                                name="Total Revenue"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="gst"
                                                stroke="#9333ea"
                                                fillOpacity={1}
                                                fill="url(#gstGradient)"
                                                name="GST"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="netRevenue"
                                                stroke="#14b8a6"
                                                fillOpacity={0.5}
                                                name="Net Revenue"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </section>

                        {/* Status-wise Revenue & Top Customers */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Status-wise Revenue Distribution */}
                            <Card padding="lg" shadow="md">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Revenue by Status</h2>
                                        <p className="text-sm text-gray-500">Breakdown by order status</p>
                                    </div>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={statusRevenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#6b7280' }} />
                                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {statusRevenueData.map((entry) => (
                                        <div
                                            key={entry.status}
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{entry.status}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatCurrency(entry.revenue)}
                                                </p>
                                                <p className="text-xs text-gray-500">{entry.count} orders</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Top Customers */}
                            <Card padding="lg" shadow="md">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
                                        <p className="text-sm text-gray-500">Highest revenue contributors</p>
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {topCustomers.length === 0 ? (
                                        <p className="text-center text-gray-500 py-8">No customer data available</p>
                                    ) : (
                                        topCustomers.map((customer, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm border border-blue-200">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">{customer.orders} orders</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(customer.revenue)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </section>

                        {/* Detailed Financial Summary Table */}
                        <section>
                            <Card padding="lg" shadow="md">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Financial Summary</h2>
                                        <p className="text-sm text-gray-500">Complete breakdown of financial metrics</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b-2 border-gray-200">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                                    Metric
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                                    Percentage
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">Total Revenue</td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(financialMetrics.totalRevenue)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">100%</td>
                                            </tr>
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">Subtotal (Before GST)</td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(financialMetrics.totalSubtotal)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {financialMetrics.totalRevenue > 0
                                                        ? ((financialMetrics.totalSubtotal / financialMetrics.totalRevenue) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">Total GST</td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(financialMetrics.totalGST)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {financialMetrics.totalSubtotal > 0
                                                        ? financialMetrics.gstPercentage.toFixed(1)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900">Shipping Charges</td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(financialMetrics.totalShipping)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {financialMetrics.totalRevenue > 0
                                                        ? ((financialMetrics.totalShipping / financialMetrics.totalRevenue) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-700">Refunded Amount</td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-700">
                                                    {formatCurrency(financialMetrics.refundedAmount)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600">
                                                    {financialMetrics.totalRevenue > 0
                                                        ? ((financialMetrics.refundedAmount / financialMetrics.totalRevenue) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                <td className="px-6 py-4 font-bold text-gray-900">Net Revenue</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                                                    {formatCurrency(financialMetrics.netRevenue)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-gray-700">
                                                    {financialMetrics.totalRevenue > 0
                                                        ? ((financialMetrics.netRevenue / financialMetrics.totalRevenue) * 100).toFixed(1)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </section>

                        {/* Order Statistics */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card padding="md" shadow="md">
                                <div className="text-center">
                                    <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Total Orders</p>
                                    <p className="text-3xl font-semibold text-gray-900">{financialMetrics.totalOrders}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {financialMetrics.paidOrders + financialMetrics.pendingOrders + financialMetrics.cancelledOrders}{' '}
                                        processed
                                    </p>
                                </div>
                            </Card>
                            <Card padding="md" shadow="md">
                                <div className="text-center">
                                    <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Paid Orders</p>
                                    <p className="text-3xl font-semibold text-gray-900">{financialMetrics.paidOrders}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {financialMetrics.totalOrders > 0
                                            ? ((financialMetrics.paidOrders / financialMetrics.totalOrders) * 100).toFixed(1)
                                            : 0}
                                        % of total
                                    </p>
                                </div>
                            </Card>
                            <Card padding="md" shadow="md">
                                <div className="text-center">
                                    <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Pending Orders</p>
                                    <p className="text-3xl font-semibold text-gray-900">{financialMetrics.pendingOrders}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {financialMetrics.totalOrders > 0
                                            ? ((financialMetrics.pendingOrders / financialMetrics.totalOrders) * 100).toFixed(1)
                                            : 0}
                                        % of total
                                    </p>
                                </div>
                            </Card>
                            <Card padding="md" shadow="md">
                                <div className="text-center">
                                    <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Cancelled Orders</p>
                                    <p className="text-3xl font-semibold text-gray-900">{financialMetrics.cancelledOrders}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {financialMetrics.totalOrders > 0
                                            ? ((financialMetrics.cancelledOrders / financialMetrics.totalOrders) * 100).toFixed(1)
                                            : 0}
                                        % of total
                                    </p>
                                </div>
                            </Card>
                        </section>
                    </>
                )}

                {/* Report Download Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <FileDown className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Download Finance Report</h2>
                                        <p className="text-sm text-gray-600">Select report format and date range</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Report Format */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Report Format
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setReportType('pdf')}
                                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                                reportType === 'pdf'
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                            <p className="font-medium text-gray-900">PDF</p>
                                            <p className="text-xs text-gray-500">Portable Document Format</p>
                                        </button>
                                        <button
                                            onClick={() => setReportType('csv')}
                                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                                reportType === 'csv'
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <FileDown className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                            <p className="font-medium text-gray-900">CSV</p>
                                            <p className="text-xs text-gray-500">Comma Separated Values</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Date Range Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Report Period
                                    </label>
                                    <div className="space-y-4">
                                        {/* Period Type */}
                                        <div className="flex gap-4">
                                            {(['days', 'months', 'years', 'custom'] as const).map((period) => (
                                                <button
                                                    key={period}
                                                    onClick={() => {
                                                        setReportPeriod(period);
                                                        setCustomDateRange(period === 'custom');
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                                        reportPeriod === period
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {period}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Period Value Input */}
                                        {reportPeriod !== 'custom' && (
                                            <div>
                                                <label className="block text-sm text-gray-600 mb-2">
                                                    Number of {reportPeriod}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={periodValue}
                                                    onChange={(e) => setPeriodValue(parseInt(e.target.value) || 1)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Custom Date Range */}
                                        {customDateRange && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-gray-600 mb-2">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Presets */}
                                        {!customDateRange && (
                                            <div className="flex flex-wrap gap-2">
                                                {reportPeriod === 'days' &&
                                                    [7, 15, 30, 60, 90].map((days) => (
                                                        <button
                                                            key={days}
                                                            onClick={() => setPeriodValue(days)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                periodValue === days
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {days} days
                                                        </button>
                                                    ))}
                                                {reportPeriod === 'months' &&
                                                    [1, 3, 6, 12].map((months) => (
                                                        <button
                                                            key={months}
                                                            onClick={() => setPeriodValue(months)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                periodValue === months
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {months} {months === 1 ? 'month' : 'months'}
                                                        </button>
                                                    ))}
                                                {reportPeriod === 'years' &&
                                                    [1, 2, 3, 5].map((years) => (
                                                        <button
                                                            key={years}
                                                            onClick={() => setPeriodValue(years)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                                                periodValue === years
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {years} {years === 1 ? 'year' : 'years'}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preview Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-blue-900 mb-2">Report Preview</p>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <p>
                                            Format: <span className="font-semibold">{reportType.toUpperCase()}</span>
                                        </p>
                                        <p>
                                            Period:{' '}
                                            {customDateRange && startDate && endDate
                                                ? `${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`
                                                : `Last ${periodValue} ${reportPeriod}`}
                                        </p>
                                        <p>
                                            Orders: <span className="font-semibold">{filteredOrders.length}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
                                <Button variant="outline" onClick={() => setShowReportModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleGenerateReport}
                                    disabled={
                                        customDateRange && (!startDate || !endDate || new Date(startDate) > new Date(endDate))
                                    }
                                >
                                    <Download className="w-4 h-4" />
                                    Generate & Download
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

