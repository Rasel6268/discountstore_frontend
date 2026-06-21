"use client";

import React, { useState } from "react";
import { useBrands, useDeleteBrand } from "@/hooks/useBrands";
import { Edit, Trash2, Loader2, Package, Search, Hash, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const BrandList = ({ onEdit }) => {
  const [searchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const { data: brands = [], isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();
  
  const handleDelete = async (id, name) => {
    toast.custom(
      (t) => (
        <div className="relative bg-white rounded-2xl shadow-2xl border border-red-100 p-6 max-w-md w-full mx-4 animate-in slide-in-from-top-4 duration-300">
          {/* Close button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Icon and Title */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Delete Brand
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">"{name}"</span>?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeletingId(id);
                await deleteBrand.mutateAsync(id);
                setDeletingId(null);
              }}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 size={16} />
              Delete Brand
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-amber-500" size={32} />
          <p className="text-gray-500 text-sm">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          <p className="font-medium">Failed to load brands</p>
          <p className="text-sm">{error.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-linear-to-r from-amber-50 to-amber-100/50 border-b border-amber-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-amber-500" size={22} />
          Brands
          <span className="ml-auto text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
            {brands.length} {brands.length === 1 ? "Brand" : "Brands"}
          </span>
        </h2>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search brands..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Brand List */}
      <div className="divide-y divide-gray-100">
        {brands.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-3">No brands found</p>
            <p className="text-sm text-gray-400">Add your first brand to get started</p>
          </div>
        ) : (
          brands.map((brand) => (
            <div
              key={brand._id}
              className="flex justify-between items-center px-6 py-4 hover:bg-amber-50/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                  {brand.name}
                </p>
                {brand.slug && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Hash size={12} /> {brand.slug}
                  </span>
                )}
                {brand.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {brand.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => onEdit(brand)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                  title="Edit brand"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => handleDelete(brand._id, brand.name)}
                  disabled={deletingId === brand._id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Delete brand"
                >
                  {deletingId === brand._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Showing {brands.length} {brands.length === 1 ? "brand" : "brands"}
        </p>
      </div>
    </div>
  );
};

export default BrandList;