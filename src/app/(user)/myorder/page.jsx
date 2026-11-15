"use client";
import React from "react";
import MyOrder from "@/components/User_dashboard/MyOrder";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyOrderPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50 py-8">
        <MyOrder />
      </div>
    </ProtectedRoute>
  );
}
