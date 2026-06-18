// components/admin/SubCategoryForm.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { categoryApi } from '@/services/categoryApi';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SubCategoryForm = ({ parentCategory, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Subcategory name is required';
    if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (formData.name.length > 50) newErrors.name = 'Name must be less than 50 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await categoryApi.createSubCategory(parentCategory._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        order: formData.order
      });

      // The API returns the created subcategory directly
      // Check if we got a valid response with an _id or name
      if (result && (result._id || result.name)) {
        toast.success(`Subcategory "${formData.name}" added successfully!`);
        setFormData({ name: '', description: '', order: 0 });
        onSuccess?.();
        onCancel?.();
      } else {
        // If result exists but doesn't have expected fields
        toast.error('Failed to add subcategory: Invalid response from server');
        setErrors({ submit: 'Invalid response from server' });
      }
    } catch (err) {
      // Handle error from API
      let errorMessage = 'Failed to add subcategory';
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Show toast for error
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-lg">Add Subcategory</h3>
            <p className="text-emerald-100 text-sm mt-1">
              to: {parentCategory.name}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Smartphones, Laptops, Accessories"
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Brief description of the subcategory..."
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers appear first in the list
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{errors.submit}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto w-5 h-5" />
            ) : (
              <>
                <Plus className="w-4 h-4 inline mr-2" />
                Add Subcategory
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default SubCategoryForm;