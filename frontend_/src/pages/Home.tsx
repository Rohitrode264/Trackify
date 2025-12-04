import { useMemo } from "react";
import {
  Package,
  Users,
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { useOrders } from "../hooks/useFetchOrders";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";

export const Home = () => {
  const { orders, loading } = useOrders({ page: 1, limit: 10 });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate non-confidential stats
  const stats = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
      };
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === "created" || order.status === "admin_review"
    ).length;
    const inProgressOrders = orders.filter(
      (order) => order.status === "packaging" || order.status === "ready_for_dispatch"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "dispatched" || order.status === "delivered"
    ).length;

    return { totalOrders, pendingOrders, inProgressOrders, completedOrders };
  }, [orders]);

  const quickActions = [
    {
      title: "View Orders",
      description: "Manage and track all orders",
      icon: ClipboardList,
      href: "/orders",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Manage Customers",
      description: "View and edit customer information",
      icon: Users,
      href: "/customers",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Packaging",
      description: "Handle order packaging tasks",
      icon: Package,
      href: "/packaging",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      title: "Dispatch",
      description: "Manage order dispatches",
      icon: Truck,
      href: "/dispatch",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  const statusCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ClipboardList,
      gradient: "from-blue-50 to-cyan-50",
    },
    {
      label: "Pending Review",
      value: stats.pendingOrders,
      icon: Clock,
      gradient: "from-yellow-50 to-amber-50",
    },
    {
      label: "In Progress",
      value: stats.inProgressOrders,
      icon: Package,
      gradient: "from-indigo-50 to-purple-50",
    },
    {
      label: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle2,
      gradient: "from-green-50 to-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 md:p-10 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Here's what's happening with your orders today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Current order status summary</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statusCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} padding="md" shadow="md" className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{card.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500 mt-1">Navigate to key sections</p>
              </div>
              <Zap className="w-5 h-5 text-gray-400 hidden sm:block" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.href)}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative z-10">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{action.description}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-gray-900">
                      <span>Go to</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <Card padding="lg" shadow="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Platform Features</h2>
                <p className="text-sm text-gray-500">Everything you need to manage orders efficiently</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Order Management</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Create, track, and manage orders through their entire lifecycle
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Customer Database</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Maintain comprehensive customer information and order history
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Fulfillment</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Streamlined packaging and dispatch workflows for faster delivery
                </p>
              </div>
            </div>
          </Card>
        </section>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-sm text-gray-500 mt-4">Loading order data...</p>
          </div>
        )}
      </div>
    </div>
  );
};
