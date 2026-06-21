import React, { useState, useEffect } from 'react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { X, Plus, Loader2, Package, DollarSign, Box, Image, Truck, Calendar, Ruler, Shirt, Star, Crown, Award, Palette } from 'lucide-react';
import ProductSizeManager from '../ProductSizeManager';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/api';

const ProductForm = ({ onSuccess, editingProduct, setEditingProduct, onCancel }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    shortDescription: '',
    
    // Pricing
    regularPrice: '',
    discountPrice: '',
    costPerItem: '',
    
    // Categories
    category: '',
    subcategory: '',
    brand: '',
    
    // Inventory
    sku: '',
    quantity: '',
    lowStockThreshold: '10',
    trackInventory: true,
    allowBackorder: false,
    
    // Size Management
    hasSizes: false,
    sizes: [],
    
    // Color Management
    hasColors: false,
    colors: [],
    
    // Images
    images: [],
    
    // Status
    status: 'draft',
    isActive: true,
    isFeatured: false,
    isPremium: false,
    isBest: false,
    isPublished: false,
    isFreeShipping: false,
    
    // Variants (optional)
    variants: [],
  });
  
  const [errors, setErrors] = useState({});
  const [imageInput, setImageInput] = useState({ url: '', alt: '' });
  const [showVariants, setShowVariants] = useState(false);
  const [sizeEnabled, setSizeEnabled] = useState(false);
  const [colorEnabled, setColorEnabled] = useState(false);
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // Fetch colors from API
  const { data: colorsData = [] } = useQuery({
    queryKey: ['colors'],
    queryFn: async () => {
      const res = await api.get('/colors/all');
      return res.data?.data || res.data || [];
    }
  });

  // Transform colors data
  const availableColors = colorsData.map(color => ({
    _id: color._id,
    name: color.name,
    hexCode: color.hexCode || '#000000',
    isActive: color.isActive
  }));

  // Get subcategories based on selected category
  const selectedCategory = categories.find(c => c._id === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        shortDescription: editingProduct.shortDescription || '',
        regularPrice: editingProduct.regularPrice || '',
        discountPrice: editingProduct.discountPrice || '',
        costPerItem: editingProduct.costPerItem || '',
        category: editingProduct.category?._id || editingProduct.category || '',
        subcategory: editingProduct.subcategory?._id || editingProduct.subcategory || '',
        brand: editingProduct.brand?._id || editingProduct.brand || '',
        sku: editingProduct.sku || '',
        quantity: editingProduct.quantity || '',
        lowStockThreshold: editingProduct.lowStockThreshold || '10',
        trackInventory: editingProduct.trackInventory !== false,
        allowBackorder: editingProduct.allowBackorder || false,
        hasSizes: editingProduct.hasSizes || false,
        sizes: editingProduct.sizes || [],
        hasColors: editingProduct.hasColors || false,
        colors: editingProduct.colors || [],
        images: editingProduct.images || [],
        status: editingProduct.status || 'draft',
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSizesChange = (sizes) => {
    const totalQuantity = sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      sizes: sizes,
      quantity: sizeEnabled ? totalQuantity : prev.quantity,
      hasSizes: sizeEnabled && sizes.length > 0,
    }));
  };

  const handleSizeToggle = (enabled) => {
    setSizeEnabled(enabled);
    
    if (!enabled) {
      setFormData(prev => ({
        ...prev,
        sizes: [],
        hasSizes: false,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hasSizes: true,
      }));
    }
  };

  // Color Management Functions - Only track which colors are selected, no quantity
  const handleColorToggle = (enabled) => {
    setColorEnabled(enabled);
    
    if (!enabled) {
      setFormData(prev => ({
        ...prev,
        colors: [],
        hasColors: false,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hasColors: true,
      }));
    }
  };

  const handleAddColor = (color) => {
    // Check if color already exists
    if (!formData.colors.some(c => c._id === color._id)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, { ...color }] // No quantity field
      }));
    }
  };

  const handleRemoveColor = (colorId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c._id !== colorId)
    }));
  };

  const handleAddImage = () => {
    if (imageInput.url) {
      const newImage = {
        url: imageInput.url,
        alt: imageInput.alt,
        isPrimary: formData.images.length === 0
      };
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setImageInput({ url: '', alt: '' });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.regularPrice) newErrors.regularPrice = 'Regular price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    
    if (sizeEnabled && formData.sizes.length === 0) {
      newErrors.sizes = 'At least one size is required when size management is enabled';
    }
    
    if (sizeEnabled && formData.sizes.length > 0) {
      const sizeNames = formData.sizes.map(s => s.name.toLowerCase());
      const hasDuplicates = sizeNames.some((name, index) => sizeNames.indexOf(name) !== index);
      if (hasDuplicates) {
        newErrors.sizes = 'Duplicate size names are not allowed';
      }
    }
    
    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.regularPrice)) {
      newErrors.discountPrice = 'Discount price must be less than regular price';
    }
    
   
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Calculate total quantity from sizes if size management is enabled
    const totalSizeQuantity = sizeEnabled ? formData.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0) : 0;
    
    const submitData = {
      ...formData,
      regularPrice: parseFloat(formData.regularPrice),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      costPerItem: formData.costPerItem ? parseFloat(formData.costPerItem) : null,
      quantity: sizeEnabled ? totalSizeQuantity : (parseInt(formData.quantity) || 0),
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
      hasSizes: sizeEnabled && formData.sizes.length > 0,
      sizes: sizeEnabled ? formData.sizes : [],
      hasColors: colorEnabled && formData.colors.length > 0,
      colors: colorEnabled ? formData.colors : [], 
    };
    
    
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct._id,
          data: submitData
        });
      } else {
        await createProduct.mutateAsync(submitData);
      }
      
      if (onSuccess) onSuccess();
      if (setEditingProduct) setEditingProduct(null);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const isLoading = createProduct.isLoading || updateProduct.isLoading;
  
  // Calculate total from sizes
  const totalSizeQuantity = formData.sizes.reduce((sum, size) => sum + (size.quantity || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b z-10">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================= BASIC INFORMATION ================= */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          
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
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
        
        {/* ================= PRICING ================= */}
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.regularPrice && <p className="text-red-500 text-xs mt-1">{errors.regularPrice}</p>}
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
              {errors.discountPrice && <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>}
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        
        {/* ================= CATEGORY & BRAND ================= */}
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
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
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
                {subcategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
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
                {brands.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>
          </div>
        </div>
        
        {/* ================= COLOR MANAGEMENT ================= */}
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
              Enable this if your product comes in different colors (e.g., Red, Blue, Black)
            </p>
          </div>
          
          {colorEnabled && (
            <div className="mt-4">
              {/* Available Colors - No quantity needed */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Available Colors
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {availableColors.filter(color => color.isActive !== false).map((color) => {
                    const isSelected = formData.colors.some(c => c._id === color._id);
                    return (
                      <button
                        key={color._id}
                        type="button"
                        onClick={() => isSelected ? handleRemoveColor(color._id) : handleAddColor(color)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-pink-500 bg-pink-50' 
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-xs text-gray-600">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Selected Colors List - Just display, no quantity input */}
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
                        <span className="text-sm text-gray-800">{color.name}</span>
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
                  
                  {/* Color Summary */}
                  <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-pink-800">Color Selection Summary</p>
                        <p className="text-xs text-pink-600 mt-1">
                          Selected {formData.colors.length} color{formData.colors.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Palette size={20} className="text-pink-500" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.colors.map(color => (
                        <span key={color._id} className="text-xs bg-white px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hexCode }} />
                          {color.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {errors.colors && (
                <p className="text-red-500 text-xs mt-2">{errors.colors}</p>
              )}
            </div>
          )}
        </div>
        
        {/* ================= SIZE MANAGEMENT ================= */}
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
              Enable this if your product comes in different sizes (e.g., S, M, L, XL)
            </p>
          </div>
          
          {sizeEnabled && (
            <div className="mt-4">
              <ProductSizeManager
                sizes={formData.sizes}
                onSizesChange={handleSizesChange}
                disabled={isLoading}
              />
              {errors.sizes && (
                <p className="text-red-500 text-xs mt-2">{errors.sizes}</p>
              )}
              
              {/* Size Summary */}
              {formData.sizes.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Size Inventory Summary</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Total units across all sizes: <strong>{totalSizeQuantity}</strong>
                      </p>
                    </div>
                    <Shirt size={20} className="text-blue-500" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.sizes.map(size => (
                      <span key={size.name} className="text-xs bg-white px-2 py-1 rounded-full shadow-sm">
                        {size.name}: {size.quantity} units
                        {size.extraPrice > 0 && ` (+৳${size.extraPrice})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* ================= INVENTORY ================= */}
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
              {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
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
        
        {/* ================= IMAGES ================= */}
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
                onChange={(e) => setImageInput({ ...imageInput, url: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Alt text"
                value={imageInput.alt}
                onChange={(e) => setImageInput({ ...imageInput, alt: e.target.value })}
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
            <p className="text-xs text-gray-500">Add product images (first image will be primary by default)</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative border rounded-lg p-2">
                <img src={img.url} alt={img.alt} className="h-24 w-full object-cover rounded" />
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(idx)}
                    className={`text-xs px-2 py-1 rounded cursor-pointer ${img.isPrimary ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    {img.isPrimary ? 'Primary' : 'Set Primary'}
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
        
        {/* ================= SHIPPING ================= */}
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
        
        {/* ================= STATUS & VISIBILITY ================= */}
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
              <span className="text-sm text-gray-700">Published (Visible on Store)</span>
            </label>
            
            <div className="border-t pt-3 mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Product Badges & Labels</p>
              
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
                  Featured Product (Shows in featured sections)
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
                  Premium Product (High-end/Luxury items)
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
                  Best Seller (Top selling products)
                </span>
              </label>
            </div>
          </div>
        </div>
        
        {/* ================= SUBMIT BUTTON ================= */}
        <div className="sticky bottom-0 bg-white pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {editingProduct ? 'Updating Product...' : 'Creating Product...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus size={18} />
                {editingProduct ? 'Update Product' : 'Create Product'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;