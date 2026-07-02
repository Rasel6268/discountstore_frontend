"use client";
import React, { useState } from "react";
import { Tag } from "lucide-react";
import BrandList from "@/components/brand/BrandList";
import BrandForm from "@/components/brand/BrandForm";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";

const BrandsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingBrand, setEditingBrand] = useState(null);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingBrand(null);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
              <Tag className="text-purple-600" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Brand Management System
            </h1>
            <p className="text-gray-600">Manage your brands efficiently</p>
            <p className="text-sm text-gray-500 mt-2">
              Slugs are automatically generated from brand names
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <BrandForm
                key={refreshKey}
                onSuccess={handleSuccess}
                editingBrand={editingBrand}
                setEditingBrand={setEditingBrand}
              />
            </div>

            {/* Right Column - Brand List */}
            <div>
              <BrandList
                key={refreshKey}
                onEdit={handleEdit}
                refreshTrigger={refreshKey}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default BrandsPage;
