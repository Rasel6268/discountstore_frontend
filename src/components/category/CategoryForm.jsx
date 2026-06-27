'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useCreateCategory,
  useUpdateCategory,
  useMainCategories,
} from "@/hooks/useCategories";
import { 
  X, 
  Plus, 
  Loader2, 
  FolderPlus, 
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const CategoryForm = ({
  onSuccess,
  editingCategory,
  setEditingCategory,
  parentCategoryId = null,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    order: 0,
  });
  const [errors, setErrors] = useState({});

  const { data: mainCategories = [] } = useMainCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || "",
        parentCategory: editingCategory.parentCategory?._id || editingCategory.parentCategory || "",
        order: editingCategory.order || 0,
      });
    } else if (parentCategoryId) {
      setFormData((prev) => ({ ...prev, parentCategory: parentCategoryId }));
    }
  }, [editingCategory, parentCategoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "order" ? Number(value) : value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (formData.name.length > 50) newErrors.name = "Name must be less than 50 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData({ name: "", description: "", parentCategory: "", order: 0 });
    setErrors({});
    setEditingCategory?.(null);
    onCancel?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      order: formData.order,
    };

    // FIX: Include parentCategory in payload if it exists
    if (formData.parentCategory) {
      payload.parentCategory = formData.parentCategory;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory._id, data: payload });
        toast.success("Category updated successfully!");
      } else {
        await createCategory.mutateAsync(payload);
        toast.success("Category created successfully!");
      }
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const isLoading = createCategory.isLoading || updateCategory.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <FolderPlus className="w-5 h-5" />
            <h2 className="text-xl font-semibold">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h2>
          </div>
          {(editingCategory || parentCategoryId) && (
            <button
              onClick={reset}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Electronics, Fashion, Books"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of the category..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Parent Category */}
        {!editingCategory && !parentCategoryId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
            </label>
            <select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="">Main Category (No Parent)</option>
              {mainCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to create a main category
            </p>
          </div>
        )}

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers appear first in the list
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="animate-spin mx-auto w-5 h-5" />
            ) : editingCategory ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </button>

          {(editingCategory || parentCategoryId) && (
            <button
              type="button"
              onClick={reset}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default CategoryForm;