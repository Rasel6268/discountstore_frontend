"use client";
import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBoxes,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaTruck,
  FaRegClock,
  FaEye,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import {
  MdOutlineAttachMoney,
  MdTrendingUp,
  MdOutlineShoppingBag,
} from "react-icons/md";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import Link from "next/link";
import DashboardSkeleton from "@/components/layout/admin/DashboardSkeleton";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import RecentOrder from "@/components/admin/RecentOrder";

// Sample data
const revenueData = [
  { month: "Jan", revenue: 12500, orders: 450, profit: 3750 },
  { month: "Feb", revenue: 15200, orders: 520, profit: 4560 },
  { month: "Mar", revenue: 18900, orders: 680, profit: 5670 },
  { month: "Apr", revenue: 16800, orders: 590, profit: 5040 },
  { month: "May", revenue: 21000, orders: 720, profit: 6300 },
  { month: "Jun", revenue: 23500, orders: 850, profit: 7050 },
  { month: "Jul", revenue: 27800, orders: 980, profit: 8340 },
  { month: "Aug", revenue: 25600, orders: 910, profit: 7680 },
  { month: "Sep", revenue: 29800, orders: 1050, profit: 8940 },
  { month: "Oct", revenue: 32400, orders: 1180, profit: 9720 },
  { month: "Nov", revenue: 35600, orders: 1320, profit: 10680 },
  { month: "Dec", revenue: 42500, orders: 1580, profit: 12750 },
];

const categoryData = [
  { name: "Leather Bags", value: 45, color: "#f59e0b", sales: 1120 },
  { name: "Fusion Handbags", value: 28, color: "#ec4899", sales: 680 },
  { name: "Men's Wallets", value: 15, color: "#06b6d4", sales: 420 },
  { name: "Leather Jackets", value: 12, color: "#8b5cf6", sales: 290 },
];

const weeklyData = [
  { day: "Mon", sales: 1250, visitors: 3200 },
  { day: "Tue", sales: 1450, visitors: 3500 },
  { day: "Wed", sales: 1680, visitors: 3800 },
  { day: "Thu", sales: 1820, visitors: 4100 },
  { day: "Fri", sales: 2100, visitors: 4500 },
  { day: "Sat", sales: 2350, visitors: 5200 },
  { day: "Sun", sales: 1980, visitors: 4800 },
];



const topProducts = [
  { name: "Premium Leather Bag", sales: 245, revenue: 12250, growth: 12 },
  { name: "Fusion Handbag", sales: 189, revenue: 9450, growth: 8 },
  { name: "Men's Leather Wallet", sales: 156, revenue: 4680, growth: 15 },
  { name: "Leather Jacket", sales: 98, revenue: 24500, growth: 5 },
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("year");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStats({
        totalRevenue: 289456,
        totalOrders: 2458,
        totalProducts: 156,
        totalUsers: 5678,
        totalSales: 32890,
        averageOrderValue: 117.8,
        conversionRate: 3.2,
        pendingOrders: 23,
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const StatCard = ({ title, value, icon, change, changeType, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">
            {typeof value === "number" && title.includes("Revenue")
              ? `৳${value.toLocaleString()}`
              : value.toLocaleString()}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === "up" ? (
                <FaArrowUp className="text-green-500 text-xs" />
              ) : (
                <FaArrowDown className="text-red-500 text-xs" />
              )}
              <span
                className={`text-xs font-medium ${changeType === "up" ? "text-green-500" : "text-red-500"}`}
              >
                {change}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <div className={`text-${color}-500 text-xl`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="text-sm" style={{ color: p.color }}>
              {p.name}: ৳{p.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
   <ProtectedRoute>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<MdOutlineAttachMoney />}
          change="12.5"
          changeType="up"
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FaShoppingCart />}
          change="8.2"
          changeType="up"
          color="blue"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<FaBoxes />}
          change="5"
          changeType="up"
          color="purple"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers />}
          change="15.3"
          changeType="up"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-linear-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-amber-100 text-sm">Total Sales</p>
              <p className="text-2xl font-bold">
                ৳{stats.totalSales.toLocaleString()}
              </p>
            </div>
            <FaWallet className="text-3xl text-amber-200" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-800">
            ৳{stats.averageOrderValue.toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-green-500">
            ↑ 5.2% from last month
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-500 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.conversionRate}%
          </p>
          <div className="mt-2 text-xs text-green-500">
            ↑ 0.8% from last month
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </p>
            </div>
            <FaRegClock className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Area Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Revenue Overview
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Monthly revenue for current year
              </p>
            </div>
            <FaChartLine className="text-amber-500 text-xl" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue (৳)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders & Profit - Composed Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Orders & Profit
              </h3>
              <p className="text-xs text-gray-500 mt-1">Monthly comparison</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                fontSize={12}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="orders"
                fill="#10b981"
                name="Orders"
                radius={[8, 8, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profit"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Profit (৳)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales - Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Weekly Sales Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="sales"
                fill="#f59e0b"
                name="Sales (৳)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="visitors"
                fill="#06b6d4"
                name="Visitors"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution - Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart for Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Revenue Trend
            </h3>
            <p className="text-xs text-gray-500 mt-1">12 months performance</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: "#f59e0b", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={3}
              name="Profit"
              dot={{ fill: "#10b981", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Top Selling Products
        </h3>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-sm">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  ৳{product.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-500">
                  ↑ {product.growth}% growth
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/products"
          className="mt-4 text-center text-amber-600 text-sm hover:text-amber-700 block"
        >
          View All Products →
        </Link>
      </div>

      {/* Recent Orders Table */}
      <RecentOrder></RecentOrder>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/products/add"
          className="bg-linear-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Quick Action</p>
              <p className="text-xl font-bold mt-1">Add New Product</p>
            </div>
            <FaBoxes className="text-3xl text-amber-200 group-hover:scale-110 transition" />
          </div>
        </Link>
        <Link
          href="/discounts/add"
          className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Quick Action</p>
              <p className="text-xl font-bold mt-1">Create Discount</p>
            </div>
            <FaStar className="text-3xl text-pink-200 group-hover:scale-110 transition" />
          </div>
        </Link>
        <Link
          href="/orders"
          className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Quick Action</p>
              <p className="text-xl font-bold mt-1">Manage Orders</p>
            </div>
            <FaTruck className="text-3xl text-blue-200 group-hover:scale-110 transition" />
          </div>
        </Link>
      </div>
    </div>
   </ProtectedRoute>
  );
};

export default Dashboard;
