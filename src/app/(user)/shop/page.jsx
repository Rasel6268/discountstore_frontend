"use client";
import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import {
  FaStar,
  FaRegHeart,
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaHeart,
} from "react-icons/fa";
import { GiHandBag } from "react-icons/gi";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBrands } from "@/hooks/useBrands";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useRouter, useSearchParams } from "next/navigation";

// Separate component that uses useSearchParams
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    priceRanges: [],
  });
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch data from API
  const { data: categoriesData = [] } = useCategories();
  const { data: brandsData = [] } = useBrands();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Transform categories from API
  const categories = useMemo(() => {
    const data = categoriesData?.data || categoriesData || [];
    return data.map((cat) => ({
      name: cat.name,
      count: cat.productCount || 0,
      id: cat._id,
    }));
  }, [categoriesData]);

  // Transform brands from API
  const brands = useMemo(() => {
    const data = brandsData?.data || brandsData || [];
    return data.map((brand) => ({
      name: brand.name,
      count: brand.productCount || 0,
      id: brand._id,
    }));
  }, [brandsData]);

  const priceRanges = [
    { id: 1, range: "৳0 - ৳500", min: 0, max: 500 },
    { id: 2, range: "৳500 - ৳1000", min: 500, max: 1000 },
    { id: 3, range: "৳1000 - ৳2000", min: 1000, max: 2000 },
    { id: 4, range: "৳2000+", min: 2000, max: 100000 },
  ];

  // Build filter params for API
  const filterParams = useMemo(() => {
    const params = {};
    
    if (searchTerm) params.search = searchTerm;
    if (sortBy) params.sortBy = sortBy;
    if (currentPage) params.page = currentPage;
    
    // Categories - send as comma-separated string
    if (selectedFilters.categories.length > 0) {
      params.category = selectedFilters.categories.join(',');
    }
    
    // Brands - send as comma-separated string
    if (selectedFilters.brands.length > 0) {
      params.brand = selectedFilters.brands.join(',');
    }
    
    // Price range
    if (selectedFilters.priceRanges.length > 0) {
      const priceRange = selectedFilters.priceRanges[0];
      if (priceRange.min !== undefined) params.minPrice = priceRange.min;
      if (priceRange.max !== undefined) params.maxPrice = priceRange.max;
    }
    
    return params;
  }, [searchTerm, sortBy, currentPage, selectedFilters]);

  // UseProducts with filter params
  const { 
    data: productsResponse, 
    isLoading: productsLoading, 
    error: productsError,
    refetch 
  } = useProducts(filterParams);

  // Extract products and pagination from response
  const products = productsResponse?.data || [];
  console.log("this is the product data",products)
  const pagination = productsResponse?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  };

  // Initialize filters from URL parameters - runs only once on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const categoryParam = searchParams.get('category');
    const categoryName = searchParams.get('categoryName');
    
    if (categoryParam && categories.length > 0) {
      // Find the category in the categories list
      const categoryExists = categories.some(cat => cat.id === categoryParam);
      
      if (categoryExists) {
        setSelectedFilters(prev => ({
          ...prev,
          categories: [categoryParam]
        }));
        setIsInitialized(true);
      }
    }
  }, [searchParams, categories, isInitialized]);

  // Refetch when filter params change - but only when initialized
  useEffect(() => {
    if (isInitialized) {
      refetch();
    }
  }, [filterParams, refetch, isInitialized]);

  const handleFilterChange = (type, value) => {
    setSelectedFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      return { ...prev, [type]: updated };
    });
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range) => {
    setSelectedFilters((prev) => {
      const isSelected = prev.priceRanges.some((r) => r.id === range.id);
      const updated = isSelected ? [] : [range];
      return { ...prev, priceRanges: updated };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      brands: [],
      priceRanges: [],
    });
    setSearchTerm("");
    setSortBy("featured");
    setCurrentPage(1);
    setIsInitialized(false);
    // Remove category from URL
    router.push('/shop');
  };

  const getActiveFiltersCount = () => {
    return (
      selectedFilters.categories.length +
      selectedFilters.brands.length +
      selectedFilters.priceRanges.length
    );
  };

  const formatPriceBDT = (price) => {
    if (!price) return "৳0";
    return `৳${Math.round(price).toLocaleString("en-US")}`;
  };

  const handleAddToCart = async (product) => {
    try {
      const result = await addToCart({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.regularPrice,
        quantity: 1,
        image: product.images?.[0]?.url,
      });
      
      if (result.success) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = async (product) => {
    try {
      const inWishlist = isInWishlist(product._id);
      
      if (inWishlist) {
        await removeFromWishlist(product._id);
        toast.success(`${product.name} removed from wishlist`);
      } else {
        await addToWishlist({
          productId: product._id,
          name: product.name,
          price: product.discountPrice || product.regularPrice,
          image: product.images?.[0]?.url,
        });
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const renderStars = (rating) => {
    const numRating = rating || 0;
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`text-xs ${i < Math.floor(numRating) ? "text-amber-400" : "text-gray-300"}`}
      />
    ));
  };

  const handleProductClick = (productId) => {
    router.push(`/shop/${productId}`);
  };

  // Get the selected category name for display
  const getSelectedCategoryName = () => {
    const categoryId = selectedFilters.categories[0];
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || searchParams.get('categoryName') || 'Selected category';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50">
      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-lg border-b border-amber-100">
        <div className="w-11/12 mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-amber-50/50"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 shadow-md"
              >
                <FaFilter className="text-sm" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-white text-amber-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Sort Select */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent border-none focus:ring-0 text-sm text-gray-800"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating_desc">Rating: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-11/12 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:col-span-1 ${isFilterOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-amber-100 sticky top-24">
              <div className="p-5 border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden p-2 hover:bg-amber-50 rounded-lg"
                  >
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Categories */}
                {categories.length > 0 && (
                  <div className="p-5 border-b border-amber-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      Categories
                    </h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFilters.categories.includes(category.id)}
                              onChange={() =>
                                handleFilterChange("categories", category.id)
                              }
                              className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-gray-700 group-hover:text-amber-600 transition">
                              {category.name}
                            </span>
                          </div>
                          <span className="bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="p-5 border-b border-amber-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Brands</h3>
                    <div className="space-y-3">
                      {brands.map((brand) => (
                        <label
                          key={brand.id}
                          className="flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFilters.brands.includes(brand.id)}
                              onChange={() =>
                                handleFilterChange("brands", brand.id)
                              }
                              className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-gray-700 group-hover:text-amber-600 transition">
                              {brand.name}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs">
                            ({brand.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="p-5 border-b border-amber-100">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    {priceRanges.map((range) => (
                      <label
                        key={range.id}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFilters.priceRanges.some(
                              (r) => r.id === range.id,
                            )}
                            onChange={() => handlePriceRangeChange(range)}
                            className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-gray-700 group-hover:text-amber-600 transition">
                            {range.range}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="p-5 border-t border-amber-100">
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all duration-300 font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-4">
            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  All Products
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Showing {products?.length || 0} of {pagination.total || 0} products
                </p>
              </div>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Active Category Filter Banner */}
            {selectedFilters.categories.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-medium">
                    Filtering by category:
                  </span>
                  <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {getSelectedCategoryName()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFilters(prev => ({ ...prev, categories: [] }));
                    setIsInitialized(false);
                    router.push('/shop');
                  }}
                  className="text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <FaTimes className="text-xs" />
                  Clear Filter
                </button>
              </div>
            )}

            {/* Loading State */}
            {productsLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            )}

            {/* Error State */}
            {productsError && (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Failed to load products</p>
                <button
                  onClick={() => refetch()}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!productsLoading && !productsError && (
              <>
                {products?.length === 0 ? (
                  <div className="text-center py-20">
                    <GiHandBag className="text-6xl text-amber-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No products found</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {products?.map((product) => (
                      <div
                        key={product._id}
                        className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-100 overflow-hidden cursor-pointer"
                      >
                        {/* Image Container */}
                        <div 
                          className="relative overflow-hidden bg-linear-to-br from-amber-50 to-amber-100"
                          onClick={() => handleProductClick(product._id)}
                        >
                          <div className="aspect-square w-full">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-amber-100">
                                <GiHandBag className="text-6xl text-amber-300" />
                              </div>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <span className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-md">
                                NEW
                              </span>
                            )}
                            {product.discountPercentage > 0 && (
                              <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-md">
                                -{Math.round(product.discountPercentage)}%
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-md">
                                FEATURED
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWishlist(product);
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50"
                          >
                            {isInWishlist(product._id) ? (
                              <FaHeart className="text-red-500 text-sm" />
                            ) : (
                              <FaRegHeart className="text-gray-600 hover:text-red-500 text-sm transition" />
                            )}
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 md:p-4">
                          {/* Brand */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              {product.brand?.name || "Premium Brand"}
                            </span>
                            <span className="text-[10px] text-gray-500 capitalize">
                              {product.category?.name || "Category"}
                            </span>
                          </div>

                          {/* Name */}
                          <h3 
                            className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-amber-600 transition"
                            onClick={() => handleProductClick(product._id)}
                          >
                            {product.name}
                          </h3>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                              {renderStars(product.averageRating || 0)}
                            </div>
                            <span className="text-[10px] text-gray-500">
                              ({product.totalReviews || 0})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-base md:text-lg font-bold text-amber-600">
                                {formatPriceBDT(
                                  product.discountPrice || product.regularPrice,
                                )}
                              </span>
                              {product.discountPrice && product.discountPrice > 0 && (
                                <span className="block text-[10px] text-gray-400 line-through">
                                  {formatPriceBDT(product.regularPrice)}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                product.quantity > 0
                                  ? "text-green-600 bg-green-50"
                                  : "text-red-600 bg-red-50"
                              }`}
                            >
                              {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.quantity === 0}
                            className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                              product.quantity > 0
                                ? "bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <FaShoppingCart className="text-xs" />
                            {isInCart(product._id) 
                              ? "View Cart" 
                              : product.quantity > 0
                                ? "Add to Cart"
                                : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-amber-200 rounded-lg text-gray-600 hover:bg-amber-50 hover:border-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg transition ${
                              currentPage === pageNum
                                ? "bg-amber-500 text-white shadow-md"
                                : "border border-amber-200 text-gray-600 hover:bg-amber-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(pagination.pages, prev + 1),
                          )
                        }
                        disabled={currentPage === pagination.pages}
                        className="px-4 py-2 border border-amber-200 rounded-lg text-gray-600 hover:bg-amber-50 hover:border-amber-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}

// Loading fallback component
function ShopLoadingFallback() {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-amber-700 font-medium">Loading shop...</p>
      </div>
    </div>
  );
}

// Main Shop component with Suspense boundary
export default function Shop() {
  return (
    <Suspense fallback={<ShopLoadingFallback />}>
      <ShopContent />
    </Suspense>
  );
}