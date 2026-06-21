// app/admin/coupons/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import api from "@/config/api";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minPurchase: 0,
    maxDiscount: null,
    usageLimit: null,
    perUserLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    userGroups: ["all"],
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get("/coupons");
      if (response.data.success) {
        setCoupons(response.data.coupons);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast.error(error.response?.data?.message || "Failed to fetch coupons");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data for API
    const submitData = {
      ...formData,
      value: parseFloat(formData.value),
      minPurchase: parseFloat(formData.minPurchase),
      perUserLimit: parseInt(formData.perUserLimit),
    };
    
    if (submitData.maxDiscount) {
      submitData.maxDiscount = parseFloat(submitData.maxDiscount);
    }
    if (submitData.usageLimit) {
      submitData.usageLimit = parseInt(submitData.usageLimit);
    }
    
    try {
      let response;
      if (editingCoupon) {
        // Update coupon
        response = await api.put(`/coupons/${editingCoupon._id}`, submitData);
        if (response.data.success) {
          toast.success(response.data.message || "Coupon updated successfully");
          fetchCoupons();
          setShowModal(false);
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to update coupon");
        }
      } else {
        // Create coupon
        response = await api.post("/coupons/create", submitData);
        if (response.data.success) {
          toast.success(response.data.message || "Coupon created successfully");
          fetchCoupons();
          setShowModal(false);
          resetForm();
        } else {
          toast.error(response.data.message || "Failed to create coupon");
        }
      }
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error(error.response?.data?.message || error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await api.delete(`/coupons/${id}`);
        if (response.data.success) {
          toast.success(response.data.message || "Coupon deleted successfully");
          fetchCoupons();
        } else {
          toast.error(response.data.message || "Failed to delete coupon");
        }
      } catch (error) {
        console.error("Failed to delete coupon:", error);
        toast.error(error.response?.data?.message || "Failed to delete coupon");
      }
    }
  };

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === "active" ? "inactive" : "active";
    try {
      const response = await api.put(`/coupons/${coupon._id}`, {
        ...coupon,
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Coupon ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
        fetchCoupons();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minPurchase: 0,
      maxDiscount: null,
      usageLimit: null,
      perUserLimit: 1,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      userGroups: ["all"],
    });
    setEditingCoupon(null);
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      userGroups: coupon.userGroups || ["all"],
    });
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const getStatusBadge = (coupon) => {
    if (coupon.status !== "active") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          {coupon.status}
        </span>
      );
    }
    
    if (isExpired(coupon.endDate)) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          expired
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        active
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
              <p className="text-gray-600 text-sm mt-1">Create and manage discount coupons</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition shadow-md cursor-pointer"
            >
              <FaPlus /> Create Coupon
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No coupons found</h3>
              <p className="text-gray-600 mb-4">Create your first coupon to get started</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition cursor-pointer"
              >
                Create Coupon
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Used/Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valid Until</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{coupon.name}</p>
                          {coupon.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{coupon.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-sm">
                          {coupon.type === "percentage" ? "Percentage" : 
                           coupon.type === "fixed" ? "Fixed Amount" : "Free Shipping"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : coupon.type === "fixed" 
                            ? `$${coupon.value}`
                            : "Free"}
                        </span>
                        {coupon.maxDiscount && coupon.type === "percentage" && (
                          <p className="text-xs text-gray-500">Max: ${coupon.maxDiscount}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium">{coupon.usedCount}</span>
                          <span className="text-gray-500"> / {coupon.usageLimit || "∞"}</span>
                          {coupon.usageLimit && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-amber-500 h-1.5 rounded-full"
                                style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">{formatDate(coupon.endDate)}</p>
                          {isExpired(coupon.endDate) && (
                            <p className="text-xs text-red-500">Expired</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCoupon(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit coupon"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer cursor-pointer"
                            title="Delete coupon"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                            title={coupon.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {coupon.status === "active" ? (
                              <FaToggleOn className="text-green-600 text-xl" />
                            ) : (
                              <FaToggleOff className="text-gray-400 text-xl" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer "
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="SUMMER2024"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique coupon code (auto-uppercase)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Summer Sale 2024"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    rows="2"
                    placeholder="Coupon description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step={formData.type === "percentage" ? "1" : "0.01"}
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min. Purchase Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPurchase: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscount: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only applies to percentage discounts</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per User Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.perUserLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          perUserLimit: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Groups
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["all", "new", "returning", "vip"].map((group) => (
                      <label key={group} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.userGroups.includes(group)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                userGroups: [...formData.userGroups, group],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                userGroups: formData.userGroups.filter(
                                  (g) => g !== group
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm capitalize">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition font-semibold cursor-pointer"
                  >
                    {editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;