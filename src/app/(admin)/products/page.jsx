'use client'
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter, 
  X,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Star,
  Crown,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from '@/components/product/ProductForm';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    isOnSale: '',
    isPremium: '',     
    isBest: '',         
    isFeatured: '',  
    page: 1,
    limit: 10
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use products with proper configuration
  const { 
    data, 
    isLoading, 
    error, 
    refetch, 
    isRefetching,
    isFetching
  } = useProducts({
    ...filters,
    sortBy: sortField,
    sortOrder: sortOrder
  });
  
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const deleteProduct = useDeleteProduct();
  
  const products = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };

  // Handle filter changes with debounce
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      isOnSale: '',
      isPremium: '',
      isBest: '',
      isFeatured: '',
      page: 1,
      limit: 10
    });
  }, []);

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate the query to force refetch
      await queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      });
      
      // Also invalidate specific query with filters
      await queryClient.invalidateQueries({ 
        queryKey: ['products', { ...filters, sortBy: sortField, sortOrder: sortOrder }] 
      });
      
      // Force refetch
      await refetch();
      
      toast.success('Products refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, filters, sortField, sortOrder, refetch]);

  // Auto-refetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [filters, sortField, sortOrder, refetch]);

  // Handle delete with proper cache invalidation
  const handleDelete = useCallback(async (id, name) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
        <p className="text-gray-800 mb-4">Delete "{name}"? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteProduct.mutateAsync(id);
                // Invalidate the query to refetch
                await queryClient.invalidateQueries({ 
                  queryKey: ['products'] 
                });
                await refetch();
                toast.success('Product deleted successfully');
              } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete product');
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  }, [deleteProduct, queryClient, refetch]);

  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleView = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
    setShowProductForm(false);
    setEditingProduct(null);
  }, []);

  const getStatusBadge = useCallback((status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status] || badges.draft;
  }, []);

  const formatPrice = useCallback((price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }, []);

  const SortIcon = useCallback(({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-400" />;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  }, [sortField, sortOrder]);

  // Helper function to render product badges
  const renderProductBadges = useCallback((product) => {
    const badges = [];
    
    if (product.isFeatured) {
      badges.push(
        <span key="featured" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
          <Star size={12} />
          Featured
        </span>
      );
    }
    
    if (product.isPremium) {
      badges.push(
        <span key="premium" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
          <Crown size={12} />
          Premium
        </span>
      );
    }
    
    if (product.isBest) {
      badges.push(
        <span key="best" className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
          <Award size={12} />
          Best Seller
        </span>
      );
    }
    
    return badges;
  }, []);

  // Handle product form success
  const handleProductFormSuccess = useCallback(async () => {
    closeModal();
    await queryClient.invalidateQueries({ 
      queryKey: ['products'] 
    });
    await refetch();
    toast.success('Product saved successfully');
  }, [closeModal, queryClient, refetch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <p className="text-sm text-gray-500">Manage your product inventory</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isRefetching || isFetching}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {(isRefreshing || isRefetching || isFetching) ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <RefreshCw size={18} />
                )}
                Refresh
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
            >
              <Filter size={18} />
              Filters
              {(filters.category || filters.brand || filters.status || filters.minPrice || filters.isOnSale || filters.isPremium || filters.isBest || filters.isFeatured) && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter(v => v && v !== '' && v !== 1).length}
                </span>
              )}
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
                
                <select
                  value={filters.isOnSale}
                  onChange={(e) => handleFilterChange('isOnSale', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products</option>
                  <option value="true">On Sale</option>
                </select>
              </div>
              
              {/* Product Badges Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={filters.isFeatured}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products (Featured)</option>
                  <option value="true">Featured Products Only</option>
                  <option value="false">Non-Featured Products</option>
                </select>
                
                <select
                  value={filters.isPremium}
                  onChange={(e) => handleFilterChange('isPremium', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products (Premium)</option>
                  <option value="true">Premium Products Only</option>
                  <option value="false">Non-Premium Products</option>
                </select>
                
                <select
                  value={filters.isBest}
                  onChange={(e) => handleFilterChange('isBest', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Products (Best Seller)</option>
                  <option value="true">Best Seller Only</option>
                  <option value="false">Non-Best Seller</option>
                </select>
              </div>
              
              {/* Price Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {(filters.category || filters.brand || filters.status || filters.minPrice || filters.maxPrice || filters.isOnSale || filters.isPremium || filters.isBest || filters.isFeatured) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <X size={14} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <p className="text-red-600 mb-4">Failed to load products</p>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              <p className="text-gray-400 mb-4">Get started by adding your first product</p>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                          Product <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('regularPrice')} className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                          Price <SortIcon field="regularPrice" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category/Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('quantity')} className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                          Stock <SortIcon field="quantity" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status & Badges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                          Created <SortIcon field="createdAt" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package size={20} className="text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{product.shortDescription || product.description?.substring(0, 50)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{product.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {product.discountPrice && product.discountPrice < product.regularPrice ? (
                              <>
                                <span className="text-sm font-semibold text-red-600">
                                  {formatPrice(product.discountPrice)}
                                </span>
                                <span className="text-xs text-gray-400 line-through ml-2">
                                  {formatPrice(product.regularPrice)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                {formatPrice(product.regularPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                              {product.category?.name || '-'}
                            </span>
                            <br />
                            <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 rounded">
                              {product.brand?.name || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${product.quantity <= (product.lowStockThreshold || 10) ? 'text-red-600' : 'text-green-600'}`}>
                            {product.quantity}
                          </span>
                          {product.quantity <= (product.lowStockThreshold || 10) && product.quantity > 0 && (
                            <p className="text-xs text-red-500">Low stock</p>
                          )}
                          {product.quantity === 0 && (
                            <p className="text-xs text-red-500">Out of stock</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadge(product.status)}`}>
                              {product.status}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {renderProductBadges(product)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id, product.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (filters.page <= 3) {
                          pageNum = i + 1;
                        } else if (filters.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = filters.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange('page', pageNum)}
                            className={`px-3 py-1 border rounded-md cursor-pointer ${
                              filters.page === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProductForm
              onSuccess={handleProductFormSuccess}
              editingProduct={editingProduct}
              setEditingProduct={setEditingProduct}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
      
      {/* Product View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Product Details</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Product Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt={img.alt} className="rounded-lg h-32 w-full object-cover" />
                  ))}
                </div>
              )}
              
              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">SKU</label>
                  <p className="font-medium">{selectedProduct.sku}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Slug</label>
                  <p className="font-medium">{selectedProduct.slug}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="space-y-1">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadge(selectedProduct.status)}`}>
                      {selectedProduct.status}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {renderProductBadges(selectedProduct)}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Regular Price</label>
                  <p className="font-medium">{formatPrice(selectedProduct.regularPrice)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Discount Price</label>
                  <p className="font-medium">{selectedProduct.discountPrice ? formatPrice(selectedProduct.discountPrice) : '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Category</label>
                  <p className="font-medium">{selectedProduct.category?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Brand</label>
                  <p className="font-medium">{selectedProduct.brand?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Quantity</label>
                  <p className="font-medium">{selectedProduct.quantity}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Free Shipping</label>
                  <p className="font-medium">{selectedProduct.isFreeShipping ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="mt-1 text-gray-700">{selectedProduct.description}</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    closeModal();
                    handleEdit(selectedProduct);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Edit Product
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;