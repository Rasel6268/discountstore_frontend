// components/admin/CategoryList.jsx
'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Folder,
  FolderOpen,
  Loader2,
  Package,
  MoreVertical,
  X,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

const CategoryList = ({ onEdit, onAddSubcategory }) => {
  const [open, setOpen] = useState({});
  const [hoveredId, setHoveredId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (id, name, hasChildren) => {
    if (hasChildren) {
      toast.error("Please delete all subcategories first");
      return;
    }

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
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Delete Category
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
                await deleteCategory.mutateAsync(id);
                setDeletingId(null);
                toast.success(`"${name}" deleted successfully`);
              }}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 size={16} />
              Delete Category
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
      <div className="bg-white rounded-2xl shadow-lg p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin w-12 h-12 text-purple-600 mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-red-500 mb-2">Failed to load categories</div>
        <button 
          onClick={() => refetch()} 
          className="text-purple-600 hover:underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Category Structure
          <span className="text-sm text-gray-500 ml-2">
            ({categories.length} main categories)
          </span>
        </h3>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">Click "New Category" to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {categories.map((cat, index) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredId(cat._id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Main Category */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1">
                    {cat.subcategories?.length > 0 && (
                      <button
                        onClick={() => toggle(cat._id)}
                        className="text-gray-400 hover:text-purple-600 transition-colors cursor-pointer"
                      >
                        {open[cat._id] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    
                    <div className={`p-2 rounded-lg ${open[cat._id] ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      {open[cat._id] ? (
                        <FolderOpen className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Folder className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-semibold text-gray-800">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{cat.description}</div>
                      )}
                      {cat.subcategories?.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {cat.subcategories.length} subcategory{cat.subcategories.length > 1 ? 'ies' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => onAddSubcategory(cat)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 cursor-pointer"
                      title="Add Subcategory"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(cat)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name, cat.subcategories?.length)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Category"
                      disabled={deletingId === cat._id}
                    >
                      {deletingId === cat._id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subcategories */}
              <AnimatePresence>
                {open[cat._id] && cat.subcategories?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50/50 border-t border-gray-100"
                  >
                    {cat.subcategories.map((sub, idx) => (
                      <motion.div
                        key={sub._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="px-6 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center ml-8">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">↳</span>
                            <div>
                              <div className="text-gray-700">{sub.name}</div>
                              {sub.description && (
                                <div className="text-xs text-gray-400">{sub.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onEdit(sub)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50 cursor-pointer"
                              title="Edit Subcategory"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub._id, sub.name, false)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Subcategory"
                              disabled={deletingId === sub._id}
                            >
                              {deletingId === sub._id ? (
                                <Loader2 className="animate-spin w-3.5 h-3.5" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;