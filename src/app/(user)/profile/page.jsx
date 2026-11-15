"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaUser,
  FaShoppingBag,
  FaCreditCard,
  FaMapMarkerAlt,
  FaChevronRight,
  FaSignOutAlt,
  FaRegHeart,
  FaBell,
  FaShieldAlt,
} from "react-icons/fa";
import { GiLeatherBoot, GiHandbag } from "react-icons/gi";
import Link from "next/link";
import Profile from "@/components/User_dashboard/Profile";
import MyOrder from "@/components/User_dashboard/MyOrder";
import Payments from "@/components/User_dashboard/Payments";
import Tracking from "@/components/User_dashboard/Tracking";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/AuthProvider/AuthProvider";

const DashboardContent = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [active, setActive] = useState("profile");

  useEffect(() => {
    if (tabParam === "orders" || tabParam === "myorder" || tabParam === "My_Order") {
      setActive("My_Order");
    } else if (tabParam === "tracking") {
      setActive("Tracking");
    } else if (tabParam === "payments" || tabParam === "Payment") {
      setActive("Payment");
    } else if (tabParam === "profile") {
      setActive("profile");
    }
  }, [tabParam]);

  const menuItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: <FaUser className="text-lg" />,
      case: "profile",
      description: "Manage your personal information",
    },
    {
      name: "My Orders",
      href: "/myorder",
      icon: <FaShoppingBag className="text-lg" />,
      case: "My_Order",
      description: "View your order history",
    },
    {
      name: "Payments",
      href: "/payments",
      icon: <FaCreditCard className="text-lg" />,
      case: "Payment",
      description: "Payment methods & history",
    },
    {
      name: "Order Tracking",
      href: "/tracking",
      icon: <FaMapMarkerAlt className="text-lg" />,
      case: "tracking",
      description: "Track your orders",
    },
  ];

  const renderContent = () => {
    switch (active) {
      case "profile":
        return <Profile />;
      case "My_Order":
        return <MyOrder />;
      case "Payment":
        return <Payments />;
      case "tracking":
        return <Tracking />;
      default:
        return <Profile />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <GiLeatherBoot className="text-xl" />
              <span className="text-sm font-medium">User Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              My Account
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and view your orders
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-150">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-3 bg-linear-to-b from-amber-50 to-amber-100/50 border-r border-amber-200 lg:block md:block hidden">
                {/* User Profile Summary */}
                <div className="p-6 border-b border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-linear-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-xl uppercase">
                      {user?.name ? user.name.slice(0, 2) : "DS"}
                    </div>
                    <div className="truncate">
                      <h2 className="font-bold text-gray-800 text-lg truncate">
                        {user?.name || user?.fullName || "Valued Customer"}
                      </h2>
                      <p className="text-gray-600 text-sm truncate">
                        {user?.email || "customer@discountstorebd.com"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">
                          Verified Account
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Navigation */}
                <div className="p-4">
                  <nav className="space-y-2">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setActive(item.case)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                          active === item.case
                            ? "bg-white shadow-lg border border-amber-200 transform scale-105"
                            : "hover:bg-white hover:shadow-md hover:border hover:border-amber-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-lg transition-colors ${
                              active === item.case
                                ? "bg-amber-500 text-white"
                                : "bg-amber-100 text-amber-600 group-hover:bg-amber-200 group-hover:text-amber-700"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <div
                              className={`font-semibold transition-colors ${
                                active === item.case
                                  ? "text-amber-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <FaChevronRight
                          className={`text-sm transition-transform ${
                            active === item.case
                              ? "text-amber-500 rotate-90"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-9">
                <div className="h-full p-6 lg:p-8">
                  {/* Content Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-100">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {menuItems.find((item) => item.case === active)?.name ||
                          "Profile"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {menuItems.find((item) => item.case === active)
                          ?.description || "Manage your personal information"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition">
                        <FaBell className="text-lg" />
                      </button>
                      <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition">
                        <FaRegHeart className="text-lg" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-100">{renderContent()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation for Mobile */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 p-4 shadow-lg z-50">
            <div className="grid grid-cols-4 gap-2">
              {menuItems.slice(0, 4).map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActive(item.case)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                    active === item.case
                      ? "bg-amber-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-amber-50"
                  }`}
                >
                  <div className="text-xl">{item.icon}</div>
                  <span className="text-xs mt-1 font-medium">
                    {item.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:hidden h-20"></div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const Dashboard = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-amber-500 rounded-full"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;
