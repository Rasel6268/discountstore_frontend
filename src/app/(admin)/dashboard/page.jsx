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
import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";

// Sample data (consider moving to separate file or API)
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
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });

  // API Queries
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/auth/all-users");
      return res.data.users;
    },
  });
  const totalUsers = users?.filter((item) => item.role === "user").length
 
  

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await api.get("/orders/allorder");
      return res.data.data;
    },
  });
  console.log(users);
  

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"], // ✅ Fixed unique key
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  // Calculate real stats from API data
  useEffect(() => {
    if (users && ordersData && productsData) {
      const completedOrders = ordersData.filter(order => order.orderStatus === "delivered");
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = ordersData.filter(order => order.orderStatus === "pending").length;
      
      setStats({
        totalUsers: totalUsers || 0,
        totalOrders: ordersData.length || 0,
        totalProducts: productsData.count || 0,
        totalSales: totalRevenue,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0,
        conversionRate: 3.2, // Calculate based on your metrics
      });
      setLoading(false);
    }
  }, [users, ordersData, productsData]);

  // Show skeleton while loading
  if (loading || usersLoading || ordersLoading || productsLoading) {
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

        {/* Rest of your dashboard content remains the same */}
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

        {/* Charts Section - Add rest of your charts here */}
        {/* ... (keep all your existing chart code) */}

        {/* Recent Orders Table */}
        <RecentOrder />

      
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;