import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import {
  X,
  Plus,
  Loader2,
  Package,
  DollarSign,
  Box,
  Image,
  Truck,
  Ruler,
  Shirt,
  Star,
  Crown,
  Award,
  Palette,
} from "lucide-react";
import api from "@/config/api";
import toast from "react-hot-toast";
import ProductSizeManager from "../ProductSizeManager";

// Custom hooks for product mutations
const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

const ProductForm = ({
  onSuccess,
  editingProduct,
  setEditingProduct,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    regularPrice: "",
    discountPrice: "",
    costPerItem: "",
    category: "",
    subcategory: "",
    brand: "",
    sku: "",
    quantity: "",
    lowStockThreshold: "10",
    trackInventory: true,
    allowBackorder: false,
    hasSizes: false,
    sizes: [],
    hasColors: false,
    colors: [],
    images: [],
    status: "draft",
    isActive: true,
    isFeatured: false,
    isPremium: false,
    isBest: false,
    isPublished: false,
    isFreeShipping: false,
    variants: [],
  });

  const [errors, setErrors] = useState({});
  const [imageInput, setImageInput] = useState({ url: "", alt: "" });
  const [sizeEnabled, setSizeEnabled] = useState(false);
  const [colorEnabled, setColorEnabled] = useState(false);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // Fetch colors from API with error handling
  const { data: colorsData = [] } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      try {
        const res = await api.get("/colors/all");
        return res.data?.data || res.data || [];
      } catch (error) {
        console.error("Error fetching colors:", error);
        return [];
      }
    },
    enabled: true,
  });

  // Transform colors data with safe access
  const availableColors = Array.isArray(colorsData)
    ? colorsData.map((color) => ({
        _id: color._id || color.id,
        name: color.name || "Unnamed Color",
        hexCode: color.hexCode || "#000000",
        isActive: color.isActive !== false,
      }))
    : [];

  // Fetch size groups from API
  const { data: sizeGroupsData = [] } = useQuery({
    queryKey: ["product-sizes"],
    queryFn: async () => {
      try {
        const res = await api.get("/sizes/all");
        return res.data?.data || res.data || [];
      } catch (error) {
        console.error("Error fetching sizes:", error);
        return [];
      }
    },
    enabled: true,
  });

  // Get subcategories based on selected category
  const selectedCategory = categories.find((c) => c._id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        shortDescription: editingProduct.shortDescription || "",
        regularPrice: editingProduct.regularPrice || "",
        discountPrice: editingProduct.discountPrice || "",
        costPerItem: editingProduct.costPerItem || "",
        category: editingProduct.category?._id || editingProduct.category || "",
        subcategory:
          editingProduct.subcategory?._id || editingProduct.subcategory || "",
        brand: editingProduct.brand?._id || editingProduct.brand || "",
        sku: editingProduct.sku || "",
        quantity: editingProduct.quantity || "",
        lowStockThreshold: editingProduct.lowStockThreshold || "10",
        trackInventory: editingProduct.trackInventory !== false,
        allowBackorder: editingProduct.allowBackorder || false,
        hasSizes: editingProduct.hasSizes || false,
        sizes:
          editingProduct.sizes?.map((size) => ({
            name: size.name,
            type: size.type || "", // Aligned with the new ProductSizeManager 'type' grouping
            quantity: size.quantity || 0,
            extraPrice: size.extraPrice || 0,
          })) || [],
        hasColors: editingProduct.hasColors || false,
        colors:
          editingProduct.colors?.map((color) => ({
            name: color.name,
            _id: color._id || "",
            hexCode: color.hexCode || "#000000",
          })) || [],
        images: editingProduct.images || [],
        status: editingProduct.status || "draft",
        isActive: editingProduct.isActive !== false,
        isFeatured: editingProduct.isFeatured || false,
        isPremium: editingProduct.isPremium || false,
        isBest: editingProduct.isBest || false,
        isPublished: editingProduct.isPublished || false,
        isFreeShipping: editingProduct.isFreeShipping || false,
        variants: editingProduct.variants || [],
      });
      setSizeEnabled(editingProduct.hasSizes || false);
      setColorEnabled(editingProduct.hasColors || false);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "number") {
      const numValue = parseFloat(value);
      if (value === "" || numValue >= 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSizesChange = (sizes) => {
    const totalQuantity = sizes.reduce(
      (sum, size) => sum + (size.quantity || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      sizes: sizes,
      quantity: sizeEnabled ? totalQuantity : prev.quantity,
      hasSizes: sizeEnabled && sizes.length > 0,
    }));
  };

  const handleSizeToggle = (enabled) => {
    setSizeEnabled(enabled);
    if (!enabled) {
      setFormData((prev) => ({
        ...prev,
        sizes: [],
        hasSizes: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        hasSizes: true,
      }));
    }
  };

  const handleColorToggle = (enabled) => {
    setColorEnabled(enabled);
    if (!enabled) {
      setFormData((prev) => ({
        ...prev,
        colors: [],
        hasColors: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        hasColors: true,
      }));
    }
  };

  const handleAddColor = (color) => {
    if (!formData.colors.some((c) => c._id === color._id)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, { ...color }],
      }));
    }
  };

  const handleRemoveColor = (colorId) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c._id !== colorId),
    }));
  };

  const handleAddImage = () => {
    if (imageInput.url) {
      const newImage = {
        url: imageInput.url,
        alt: imageInput.alt,
        isPrimary: formData.images.length === 0,
      };
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
      setImageInput({ url: "", alt: "" });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.regularPrice)
      newErrors.regularPrice = "Regular price is required";

    if (formData.regularPrice && parseFloat(formData.regularPrice) < 0) {
      newErrors.regularPrice = "Regular price must be greater than 0";
    }

    if (formData.costPerItem && parseFloat(formData.costPerItem) < 0) {
      newErrors.costPerItem =
        "Cost per item must be greater than or equal to 0";
    }

    if (formData.discountPrice) {
      const discount = parseFloat(formData.discountPrice);
      const regular = parseFloat(formData.regularPrice);
      if (discount < 0) {
        newErrors.discountPrice = "Discount price must be greater than 0";
      } else if (regular && discount >= regular) {
        newErrors.discountPrice =
          "Discount price must be less than regular price";
      }
    }

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";

    if (sizeEnabled && formData.sizes.length === 0) {
      newErrors.sizes =
        "At least one size is required when size management is enabled";
    }

    if (sizeEnabled && formData.sizes.length > 0) {
      // Changed from sizeName to name
      const sizeNames = formData.sizes.map((s) => s.name?.toLowerCase() || "");
      const hasDuplicates = sizeNames.some(
        (name, index) => name && sizeNames.indexOf(name) !== index
      );
      if (hasDuplicates) {
        newErrors.sizes = "Duplicate size names are not allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const totalSizeQuantity = sizeEnabled
      ? formData.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0)
      : 0;

    // Prepare submit data
    const submitData = {
      name: formData.name || "",
      description: formData.description || "",
      shortDescription: formData.shortDescription || "",
      regularPrice: parseFloat(formData.regularPrice) || 0,
      discountPrice: formData.discountPrice
        ? parseFloat(formData.discountPrice)
        : undefined,
      costPerItem: formData.costPerItem
        ? parseFloat(formData.costPerItem)
        : undefined,
      category: formData.category || "",
      subcategory: formData.subcategory || "",
      brand: formData.brand || "",
      sku: formData.sku || "",
      quantity: sizeEnabled ? totalSizeQuantity : parseInt(formData.quantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
      trackInventory: formData.trackInventory !== false,
      allowBackorder: formData.allowBackorder || false,
      hasSizes: sizeEnabled && formData.sizes.length > 0,
      
      sizes: sizeEnabled
        ? formData.sizes.map((size) => ({
            name: size.name, 
            quantity: size.quantity || 0,
            type: size.type || "",
            extraPrice: size.extraPrice || 0,
          }))
        : [],
      hasColors: colorEnabled && formData.colors.length > 0,
      colors: colorEnabled
        ? formData.colors.map((color) => ({
            name: color.name, // Only send the name
          }))
        : [],
      images: formData.images || [],
      status: formData.status || "draft",
      isActive: formData.isActive !== false,
      isFeatured: formData.isFeatured || false,
      isPremium: formData.isPremium || false,
      isBest: formData.isBest || false,
      isPublished: formData.isPublished || false,
      isFreeShipping: formData.isFreeShipping || false,
      variants: formData.variants || [],
    };

    // Remove undefined values
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    console.log("Submitting product data:", JSON.stringify(submitData, null, 2));

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct.mutateAsync({
          id: editingProduct._id,
          data: submitData,
        });
      } else {
        result = await createProduct.mutateAsync(submitData);
      }
      console.log(result);

      if (result && (result.success === true || result.data)) {
        toast.success(
          editingProduct
            ? "Product updated successfully!"
            : "Product created successfully!"
        );

        if (!editingProduct) {
          // Reset form
          setFormData({
            name: "",
            description: "",
            shortDescription: "",
            regularPrice: "",
            discountPrice: "",
            costPerItem: "",
            category: "",
            subcategory: "",
            brand: "",
            sku: "",
            quantity: "",
            lowStockThreshold: "10",
            trackInventory: true,
            allowBackorder: false,
            hasSizes: false,
            sizes: [],
            hasColors: false,
            colors: [],
            images: [],
            status: "draft",
            isActive: true,
            isFeatured: false,
            isPremium: false,
            isBest: false,
            isPublished: false,
            isFreeShipping: false,
            variants: [],
          });
          setSizeEnabled(false);
          setColorEnabled(false);
          setImageInput({ url: "", alt: "" });
        }

        if (onSuccess) onSuccess();
        if (setEditingProduct) setEditingProduct(null);
      } else {
        const errorMessage = result?.error || result?.message || "Failed to save product";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Product save error:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          const errorMsg = data?.error || data?.message || "Validation error";
          toast.error(errorMsg);
        } else if (status === 401) {
          toast.error("Unauthorized. Please log in again.");
        } else if (status === 403) {
          toast.error("You do not have permission to perform this action.");
        } else if (status === 409) {
          toast.error("Conflict: Duplicate or conflicting data.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(data?.error || data?.message || `Server error (${status})`);
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save product. Please try again.");
      }
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  const totalSizeQuantity = formData.sizes.reduce(
    (sum, size) => sum + (size.quantity || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                rows="2"
                maxLength="200"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="Brief description (max 200 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.shortDescription?.length || 0}/200 characters
              </p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            Pricing
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Regular Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="regularPrice"
                value={formData.regularPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.regularPrice && (
                <p className="text-red-500 text-xs mt-1">{errors.regularPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Price
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.discountPrice && (
                <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost Per Item
              </label>
              <input
                type="number"
                name="costPerItem"
                value={formData.costPerItem}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.costPerItem && (
                <p className="text-red-500 text-xs mt-1">{errors.costPerItem}</p>
              )}
            </div>
          </div>
        </div>

        {/* Category & Brand */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Box size={18} className="text-purple-600" />
            Category & Brand
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) &&
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !formData.category}
              >
                <option value="">Select Subcategory</option>
                {Array.isArray(subcategories) &&
                  subcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Select Brand</option>
                {Array.isArray(brands) &&
                  brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
              </select>
              {errors.brand && (
                <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
              )}
            </div>
          </div>
        </div>

        {/* Color Management */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Palette size={18} className="text-pink-600" />
            Color Management
          </h3>
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={colorEnabled}
                onChange={(e) => handleColorToggle(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">
                Enable color-based inventory management
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable this if your product comes in different colors
            </p>
          </div>

          {colorEnabled && (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Available Colors
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {availableColors
                    .filter((color) => color.isActive !== false)
                    .map((color) => {
                      const isSelected = formData.colors.some(
                        (c) => c._id === color._id
                      );
                      return (
                        <button
                          key={color._id}
                          type="button"
                          onClick={() =>
                            isSelected
                              ? handleRemoveColor(color._id)
                              : handleAddColor(color)
                          }
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "border-pink-500 bg-pink-50"
                              : "border-gray-200 hover:border-pink-300"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow-sm"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <span className="text-xs text-gray-600">
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {formData.colors.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Colors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color) => (
                      <div
                        key={color._id}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div
                          className="w-6 h-6 rounded-full shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-sm text-gray-800">
                          {color.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color._id)}
                          className="text-red-500 hover:text-red-700 ml-1 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size Management */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Ruler size={18} className="text-indigo-600" />
            Size Management
          </h3>
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sizeEnabled}
                onChange={(e) => handleSizeToggle(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">
                Enable size-based inventory management
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable this if your product comes in different sizes
            </p>
          </div>

          {sizeEnabled && (
            <div className="mt-4">
              <ProductSizeManager
                sizes={formData.sizes}
                onSizesChange={handleSizesChange}
                disabled={isLoading}
                sizeGroups={sizeGroupsData}
              />
              {errors.sizes && (
                <p className="text-red-500 text-xs mt-2">{errors.sizes}</p>
              )}
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Package size={18} className="text-orange-600" />
            Inventory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="Unique product code"
              />
              {errors.sku && (
                <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
              )}
            </div>

            {!sizeEnabled && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  placeholder="0"
                />
              </div>
            )}

            {sizeEnabled && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Quantity (Auto-calculated)
                </label>
                <input
                  type="text"
                  value={`${totalSizeQuantity} units`}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Automatically calculated from sizes above
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="10"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="trackInventory"
                  checked={formData.trackInventory}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Track Inventory</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-700">Allow Backorder</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Image size={18} className="text-pink-600" />
            Product Images
          </h3>
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Image URL"
                value={imageInput.url}
                onChange={(e) =>
                  setImageInput({ ...imageInput, url: e.target.value })
                }
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Alt text"
                value={imageInput.alt}
                onChange={(e) =>
                  setImageInput({ ...imageInput, alt: e.target.value })
                }
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Add product images (first image will be primary by default)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative border rounded-lg p-2">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-24 w-full object-cover rounded"
                />
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    className={`text-xs px-2 py-1 rounded cursor-pointer ${
                      img.isPrimary ? "bg-green-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    {img.isPrimary ? "Primary" : "Set Primary"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Truck size={18} className="text-teal-600" />
            Shipping
          </h3>
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFreeShipping"
                checked={formData.isFreeShipping}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-700">Free Shipping</span>
            </label>
          </div>
        </div>

        {/* Status & Visibility */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Star size={18} className="text-yellow-600" />
            Status & Visibility
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Active Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Published (Visible on Store)
              </span>
            </label>

            <div className="border-t pt-3 mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Product Badges & Labels
              </p>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-yellow-600 rounded"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  Featured Product
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={formData.isPremium}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Crown size={14} className="text-purple-500" />
                  Premium Product
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBest"
                  checked={formData.isBest}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Award size={14} className="text-red-500" />
                  Best Seller
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {editingProduct ? "Updating Product..." : "Creating Product..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus size={18} />
                {editingProduct ? "Update Product" : "Create Product"}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;