"use client";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const SizePage = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showEditSizeModal, setShowEditSizeModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingSize, setEditingSize] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    SizeType: "Men's",
    size: [],
    isActive: true,
  });
  const [newSizeItem, setNewSizeItem] = useState({
    size: "",
    extraPrice: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch sizes
  const { data: sizes, isLoading, refetch } = useQuery({
    queryKey: ["sizes"],
    queryFn: async () => {
      try {
        const res = await api.get("/sizes/all");
        return res.data.data || [];
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch sizes");
        return [];
      }
    },
  });

  // Create size group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      const res = await api.post("/sizes/create", groupData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size group added successfully");
      setShowAddModal(false);
      resetGroupForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add size group");
    },
  });

  // Update size group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/sizes/update/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size group updated successfully");
      setShowEditModal(false);
      setEditingGroup(null);
      resetGroupForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update size group");
    },
  });

  // Delete size group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/sizes/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size group deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete size group");
    },
  });

  // Add size to group mutation
  const addSizeMutation = useMutation({
    mutationFn: async ({ sizeType, sizeData }) => {
      const res = await api.put("/sizes/add-size", { 
        sizeType, 
        sizeName: sizeData.size,
        extraPrice: sizeData.extraPrice 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size added to group successfully");
      setShowAddSizeModal(false);
      setNewSizeItem({ size: "", extraPrice: 0 });
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add size");
    },
  });

  // Update size in group mutation
  const updateSizeMutation = useMutation({
    mutationFn: async ({ sizeType, oldSizeName, sizeData }) => {
      const res = await api.put("/sizes/update-size", { 
        sizeType, 
        oldSizeName,
        sizeName: sizeData.size,
        extraPrice: sizeData.extraPrice 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size updated successfully");
      setShowEditSizeModal(false);
      setEditingSize(null);
      setNewSizeItem({ size: "", extraPrice: 0 });
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update size");
    },
  });

  // Remove size from group mutation
  const removeSizeMutation = useMutation({
    mutationFn: async ({ sizeType, sizeName }) => {
      const res = await api.put("/sizes/remove-size", { sizeType, sizeName });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Size removed from group successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove size");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => {
      const res = await api.put(`/sizes/update/${id}`, { 
        isActive: !currentStatus 
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["sizes"]);
      toast.success("Status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const resetGroupForm = () => {
    setNewGroup({
      SizeType: "Men's",
      size: [],
      isActive: true,
    });
  };

  const handleGroupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGroup((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSizeInputChange = (e) => {
    const { name, value } = e.target;
    setNewSizeItem((prev) => ({
      ...prev,
      [name]: name === "extraPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmitGroup = () => {
    if (!newGroup.SizeType) {
      toast.error("Please select a size type");
      return;
    }
    createGroupMutation.mutate(newGroup);
  };

  const handleUpdateGroup = () => {
    if (!newGroup.SizeType) {
      toast.error("Please select a size type");
      return;
    }
    updateGroupMutation.mutate({ id: editingGroup._id, data: newGroup });
  };

  const handleAddSize = () => {
    if (!newSizeItem.size.trim()) {
      toast.error("Please enter a size name");
      return;
    }
    addSizeMutation.mutate({ 
      sizeType: selectedGroup.SizeType, 
      sizeData: newSizeItem
    });
  };

  const handleEditSize = (group, sizeItem) => {
    setSelectedGroup(group);
    setEditingSize(sizeItem);
    setNewSizeItem({
      size: sizeItem.size,
      extraPrice: sizeItem.extraPrice || 0,
    });
    setShowEditSizeModal(true);
  };

  const handleUpdateSize = () => {
    if (!newSizeItem.size.trim()) {
      toast.error("Please enter a size name");
      return;
    }
    updateSizeMutation.mutate({ 
      sizeType: selectedGroup.SizeType, 
      oldSizeName: editingSize.size,
      sizeData: newSizeItem
    });
  };

  const handleRemoveSize = (groupType, sizeName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to remove "${sizeName}" from ${groupType}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        removeSizeMutation.mutate({ sizeType: groupType, sizeName });
      }
    });
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setNewGroup({
      SizeType: group.SizeType,
      size: group.size || [],
      isActive: group.isActive,
    });
    setShowEditModal(true);
  };

  const handleDeleteGroup = (id, name) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${name}" group`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteGroupMutation.mutate(id);

        Swal.fire({
          title: "Deleted!",
          text: `${name} group has been deleted.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleToggleStatus = (id, currentStatus) => {
    toggleStatusMutation.mutate({ id, currentStatus });
  };

  // Filter sizes
  const filteredSizes = sizes?.filter((group) => {
    const matchesSearch = group.SizeType
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && group.isActive) ||
      (filterStatus === "inactive" && !group.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredSizes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredSizes.slice(startIndex, endIndex);

  // Summary statistics
  const totalGroups = filteredSizes.length;
  const activeGroups = filteredSizes.filter((group) => group.isActive).length;
  const inactiveGroups = filteredSizes.filter((group) => !group.isActive).length;
  const totalSizes = filteredSizes.reduce((acc, group) => acc + group.size.length, 0);

  const sizeTypes = [
    { value: "Men's", label: "Men's", icon: "👨" },
    { value: "Women's", label: "Women's", icon: "👩" },
    { value: "Unisex", label: "Unisex", icon: "👥" },
    { value: "Kids", label: "Kids", icon: "👶" },
  ];

  const getTypeIcon = (type) => {
    const found = sizeTypes.find((t) => t.value === type);
    return found ? found.icon : "📏";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-8 w-8 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Size Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your product size groups</p>
            </div>
            <button
              onClick={() => {
                resetGroupForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Size Group
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Groups</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeGroups}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Groups</p>
                <p className="text-2xl font-bold text-red-600">
                  {inactiveGroups}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sizes</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalSizes}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative w-64">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search size groups..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing:{" "}
              <span className="font-semibold text-gray-900">
                {filteredSizes.length}
              </span>{" "}
              groups
            </div>
          </div>
        </div>
      </div>

      {/* Size Groups Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGroups.length > 0 ? (
            currentGroups.map((group) => (
              <div
                key={group._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Group Header */}
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getTypeIcon(group.SizeType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.SizeType}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {group.size.length} sizes
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(group._id, group.isActive)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          group.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {group.isActive ? "Active" : "Inactive"}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          title="Edit Group"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group._id, group.SizeType)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          title="Delete Group"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sizes List */}
                <div className="p-5">
                  {group.size.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {group.size.map((item, idx) => (
                        <div
                          key={idx}
                          className="inline-flex flex-col items-center gap-1 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group relative"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {item.size}
                            </span>
                            <button
                              onClick={() => handleEditSize(group, item)}
                              className="text-blue-500 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit Size"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRemoveSize(group.SizeType, item.size)}
                              className="text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove Size"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          {item.extraPrice > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              +₹{item.extraPrice}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No sizes in this group
                    </p>
                  )}

                  {/* Add Size Button */}
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setNewSizeItem({ size: "", extraPrice: 0 });
                      setShowAddSizeModal(true);
                    }}
                    className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Size to {group.SizeType}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <p className="text-gray-500 text-lg">No size groups found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Click "Add New Size Group" to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredSizes.length > 0 && (
          <div className="mt-6 px-6 py-4 border-t border-gray-200 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredSizes.length)}
                </span> of{" "}
                <span className="font-medium">{filteredSizes.length}</span> results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Size Group Modal */}
      {(showAddModal || showEditModal) && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setEditingGroup(null);
              resetGroupForm();
            }}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {showEditModal ? "Edit Size Group" : "Add New Size Group"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {showEditModal
                        ? "Update size group information"
                        : "Create a new size group"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingGroup(null);
                      resetGroupForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Type *
                    </label>
                    <select
                      name="SizeType"
                      value={newGroup.SizeType}
                      onChange={handleGroupInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sizeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select which category this size group belongs to
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="font-medium text-gray-700">
                        Active Status
                      </label>
                      <p className="text-sm text-gray-500">
                        Enable to make this size group available
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={newGroup.isActive}
                        onChange={handleGroupInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingGroup(null);
                      resetGroupForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showEditModal ? handleUpdateGroup : handleSubmitGroup}
                    className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
                  >
                    {showEditModal ? "Update Group" : "Add Group"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Size to Group Modal */}
      {showAddSizeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => {
              setShowAddSizeModal(false);
              setNewSizeItem({ size: "", extraPrice: 0 });
            }}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add Size to {selectedGroup?.SizeType}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Add a new size with optional extra price
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddSizeModal(false);
                      setNewSizeItem({ size: "", extraPrice: 0 });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Name *
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={newSizeItem.size}
                      onChange={handleSizeInputChange}
                      placeholder="e.g., S, M, L, XL, XXL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a unique size name for this group
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Price (₹)
                    </label>
                    <input
                      type="number"
                      name="extraPrice"
                      value={newSizeItem.extraPrice}
                      onChange={handleSizeInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Additional price for this size (if any)
                    </p>
                  </div>

                  {selectedGroup?.size.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Existing sizes in this group:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroup.size.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                          >
                            {item.size} {item.extraPrice > 0 && `(+₹${item.extraPrice})`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowAddSizeModal(false);
                      setNewSizeItem({ size: "", extraPrice: 0 });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSize}
                    className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md"
                  >
                    Add Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Size Modal */}
      {showEditSizeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => {
              setShowEditSizeModal(false);
              setEditingSize(null);
              setNewSizeItem({ size: "", extraPrice: 0 });
            }}
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Size
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Update size information
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditSizeModal(false);
                      setEditingSize(null);
                      setNewSizeItem({ size: "", extraPrice: 0 });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Name *
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={newSizeItem.size}
                      onChange={handleSizeInputChange}
                      placeholder="e.g., S, M, L, XL, XXL"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Price (₹)
                    </label>
                    <input
                      type="number"
                      name="extraPrice"
                      value={newSizeItem.extraPrice}
                      onChange={handleSizeInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowEditSizeModal(false);
                      setEditingSize(null);
                      setNewSizeItem({ size: "", extraPrice: 0 });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSize}
                    className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
                  >
                    Update Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SizePage;