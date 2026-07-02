"use client";
import React, { useState, useEffect } from "react";
import {
  
  FaShoppingCart,
  FaUsers,
  FaBoxes,
  FaArrowUp,
  FaArrowDown,
  FaRegClock,
  FaWallet,
} from "react-icons/fa";
import {
  MdOutlineAttachMoney,
} from "react-icons/md";

import DashboardSkeleton from "@/components/layout/admin/DashboardSkeleton";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import RecentOrder from "@/components/admin/RecentOrder";
import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";


const Dashboard = () => {
  const [loading, setLoading] = useState(true);

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

  

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"], 
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data;
    },
  });

  
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

 

  return (
    <AdminRoute>
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

    

        {/* Recent Orders Table */}
        <RecentOrder />

      
      </div>
    </AdminRoute>
  );
};

export default Dashboard;