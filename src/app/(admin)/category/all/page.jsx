"use client";
import CategoryForm from "@/components/category/CategoryForm";
import CategoryList from "@/components/category/CategoryList";
import SubCategoryForm from "@/components/category/SubCategoryForm";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";
import React, { useState } from "react";

const CategoriesPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showSubForm, setShowSubForm] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingCategory(null);
    setShowSubForm(false);
    setSelectedParent(null);
  };

  const handleAddSubcategory = (category) => {
    setSelectedParent(category);
    setShowSubForm(true);
    setEditingCategory(null);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowSubForm(false);
    setSelectedParent(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            Category Management System
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div>
              {/* Subcategory Form */}
              {showSubForm && selectedParent && (
                <SubCategoryForm
                  parentCategory={selectedParent}
                  onSuccess={handleSuccess}
                  onCancel={() => setShowSubForm(false)}
                />
              )}

              {/* Main/Edit Category Form */}
              {!showSubForm && (
                <CategoryForm
                  key={refreshKey}
                  onSuccess={handleSuccess}
                  editingCategory={editingCategory}
                  setEditingCategory={setEditingCategory}
                />
              )}
            </div>

            {/* Right Column - Category List */}
            <div>
              <CategoryList
                key={refreshKey}
                onEdit={handleEdit}
                onAddSubcategory={handleAddSubcategory}
                refreshTrigger={refreshKey}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default CategoriesPage;
