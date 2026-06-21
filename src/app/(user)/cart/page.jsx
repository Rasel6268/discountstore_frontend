"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaTrash,
  FaShoppingCart,
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaLock,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaMale,
  FaFemale,
  FaVenusMars,
  FaChild,
  FaPalette,
  FaTag,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { GiHandBag } from "react-icons/gi";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useAuth } from "@/AuthProvider/AuthProvider";
import toast from "react-hot-toast";
import api from "@/config/api";

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoading: cartLoading,
  } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [savedForLater, setSavedForLater] = useState([]);

  // Get size type icon
  const getSizeTypeIcon = (type) => {
    if (!type) return <FaVenusMars className="text-purple-500" />;
    switch (type) {
      case "men":
        return <FaMale className="text-blue-500" />;
      case "women":
        return <FaFemale className="text-pink-500" />;
      case "kids":
        return <FaChild className="text-green-500" />;
      default:
        return <FaVenusMars className="text-purple-500" />;
    }
  };

  // Get size type label
  const getSizeTypeLabel = (type) => {
    if (!type) return "Unisex";
    switch (type) {
      case "men":
        return "Men's";
      case "women":
        return "Women's";
      case "kids":
        return "Kids'";
      default:
        return "Unisex";
    }
  };

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCartItems(items);
      calculateTotals();
      setIsLoading(false);
    };
    
    loadData();
  }, [items]);

  // Calculate totals
  const calculateTotals = () => {
    const subtotalAmount = getTotalPrice();
    setSubtotal(subtotalAmount);

    const shipping = shippingCost;
    const discountAmount = discount;
    const totalAmount = subtotalAmount + shipping - discountAmount;
    setTotal(totalAmount > 0 ? totalAmount : 0);
  };

  useEffect(() => {
    calculateTotals();
  }, [subtotal, shippingCost, discount]);

  // Handle quantity update with loading
  const handleQuantityUpdate = async (
    productId,
    newQuantity,
    size = null,
    color = null,
  ) => {
    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    
    // Show loading for this specific item
    setUpdatingItemId(`${productId}_${size?.name || 'nosize'}_${color?.name || 'nocolor'}`);
    setIsUpdatingQuantity(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateQuantity(productId, newQuantity, size, color);
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdatingQuantity(false);
      setUpdatingItemId(null);
    }
  };

  // Handle remove item with loading
  const handleRemoveItem = async (productId, size, color, productName) => {
    const itemId = `${productId}_${size?.name || 'nosize'}_${color?.name || 'nocolor'}`;
    setUpdatingItemId(itemId);
    setIsUpdatingQuantity(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      removeFromCart(productId, size, color);
      let variantText = "";
      if (size) variantText += ` (Size: ${size.name})`;
      if (color) variantText += ` (Color: ${color.name})`;
      toast.success(`${productName}${variantText} removed from cart`);
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsUpdatingQuantity(false);
      setUpdatingItemId(null);
    }
  };

  // Handle save for later with loading
  const handleSaveForLater = async (item) => {
    const itemId = `${item.productId}_${item.size?.name || 'nosize'}_${item.color?.name || 'nocolor'}`;
    setUpdatingItemId(itemId);
    setIsUpdatingQuantity(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      removeFromCart(item.productId, item.size, item.color);
      setSavedForLater([...savedForLater, item]);
      let variantText = "";
      if (item.size) variantText += ` (Size: ${item.size.name})`;
      if (item.color) variantText += ` (Color: ${item.color.name})`;
      toast.success(`${item.name}${variantText} saved for later`);
    } catch (error) {
      toast.error("Failed to save for later");
    } finally {
      setIsUpdatingQuantity(false);
      setUpdatingItemId(null);
    }
  };

  // Handle move to cart from saved
  const handleMoveToCart = async (item) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSavedForLater(
        savedForLater.filter(
          (i) =>
            i.productId !== item.productId ||
            i.size?.name !== item.size?.name ||
            i.color?.name !== item.color?.name,
        ),
      );
      toast.success(`${item.name} moved to cart`);
    } catch (error) {
      toast.error("Failed to move to cart");
    }
  };

  // Handle apply coupon with loading
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    const coupondata = {
      code: couponCode,
      subtotal: subtotal,
      userId: user?._id,
    };

    try {
      const response = await api.post("/coupons/validate", coupondata);
      const data = response.data;
    
      if (data.success) {
        setDiscount(data.data.discount);
        setAppliedCoupon({
          code: data.data.code,
          name: data.data.name,
          discount: data.data.discount,
          type: data.data.type,
          couponId: data.data.couponId,
          minPurchase: data.data.minPurchase,
          maxDiscount: data.data.maxDiscount,
        });
        toast.success(
          data.message ||
            `Coupon applied! You saved ${formatPriceBDT(data.data.discount)}`,
        );
        setCouponCode("");
      } else {
        toast.error(data.message || "Invalid coupon code");
        setDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  // Handle checkout with loading
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Save applied coupon to localStorage for checkout
    if (appliedCoupon) {
      localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    }

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/checkout");
    } catch (error) {
      toast.error("Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format price in BDT (Taka)
  const formatPriceBDT = (price) => {
    if (!price) return "৳0";
    return `৳${Math.round(price).toLocaleString("en-US")}`;
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
      <div className="p-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-amber-200 rounded w-48"></div>
          <div className="h-6 bg-amber-200 rounded w-24"></div>
        </div>
        
        {/* Table header skeleton */}
        <div className="hidden md:grid grid-cols-5 gap-4 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-amber-100 rounded"></div>
          ))}
        </div>
        
        {/* Cart items skeleton */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col md:flex-row gap-4 py-4 border-t border-amber-100">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 bg-amber-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-amber-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-amber-100 rounded w-1/2"></div>
                <div className="h-4 bg-amber-100 rounded w-1/3 mt-1"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 bg-amber-200 rounded w-20"></div>
              <div className="h-10 bg-amber-200 rounded w-24"></div>
              <div className="h-6 bg-amber-200 rounded w-16"></div>
              <div className="h-8 bg-amber-200 rounded w-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Empty cart component
  const EmptyCart = () => (
    <div className="text-center py-16 md:py-24">
      <div className="bg-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <GiHandBag className="text-5xl text-amber-600" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-8">
        Looks like you haven't added any items to your cart yet.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-md"
      >
        <FaArrowLeft className="text-sm" />
        Continue Shopping
      </Link>
    </div>
  );

  // Show loading state
  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <div className="h-10 bg-amber-200 rounded w-64 animate-pulse"></div>
            <div className="h-6 bg-amber-100 rounded w-80 mt-2 animate-pulse"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-amber-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length > 0
              ? `You have ${getTotalItems()} item(s) in your cart`
              : "Your cart is waiting for you"}
          </p>
        </div>

        {cartItems.length === 0 && savedForLater.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2">
              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-50 border-b border-amber-200">
                      <tr className="text-left">
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Product
                        </th>
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Price
                        </th>
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => {
                        const itemKey = `${item.productId}_${item.size?.name || "nosize"}_${item.color?.name || "nocolor"}`;
                        const isItemUpdating = updatingItemId === itemKey && isUpdatingQuantity;
                        
                        return (
                          <tr
                            key={itemKey}
                            className={`border-b border-gray-100 hover:bg-amber-50/30 transition-colors ${isItemUpdating ? 'opacity-60' : ''}`}
                          >
                            {/* Product Info */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-amber-100 rounded-lg overflow-hidden shrink-0 relative">
                                  {isItemUpdating && (
                                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                      <FaSpinner className="animate-spin text-amber-500" />
                                    </div>
                                  )}
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <GiHandBag className="text-2xl text-amber-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    href={`/product/${item.productId}`}
                                    className="font-semibold text-gray-800 hover:text-amber-600 transition line-clamp-2"
                                  >
                                    {item.name}
                                  </Link>

                                  {/* Size Information */}
                                  {item.size && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        {getSizeTypeIcon(item.size.type)}
                                        <span className="text-xs font-medium text-gray-600">
                                          {getSizeTypeLabel(item.size.type)}
                                        </span>
                                      </div>
                                      <span className="text-xs bg-amber-100 px-2 py-0.5 rounded-full text-amber-700 font-medium">
                                        Size: {item.size.name}
                                      </span>
                                      {item.size.extraPrice > 0 && (
                                        <span className="text-xs text-green-600">
                                          +{formatPriceBDT(item.size.extraPrice)}
                                        </span>
                                      )}
                                      {item.size.sku && (
                                        <span className="text-xs text-gray-400">
                                          SKU: {item.size.sku}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Color Information */}
                                  {item.color && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <FaPalette className="text-xs text-pink-500" />
                                      <span className="text-xs bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 font-medium">
                                        Color: {item.color.name}
                                      </span>
                                      {item.color.hexCode && (
                                        <div
                                          className="w-4 h-4 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor: item.color.hexCode,
                                          }}
                                          title={item.color.name}
                                        />
                                      )}
                                      {item.color.extraPrice > 0 && (
                                        <span className="text-xs text-green-600">
                                          +{formatPriceBDT(item.color.extraPrice)}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Original price if discounted */}
                                  {item.originalPrice &&
                                    item.originalPrice > item.price && (
                                      <p className="text-xs text-gray-400 line-through mt-1">
                                        {formatPriceBDT(item.originalPrice)}
                                      </p>
                                    )}
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-4">
                              <div>
                                <span className="text-gray-700 font-medium">
                                  {formatPriceBDT(item.price)}
                                </span>
                                {(item.size?.extraPrice > 0 ||
                                  item.color?.extraPrice > 0) && (
                                  <p className="text-xs text-gray-400">
                                    Base:{" "}
                                    {formatPriceBDT(
                                      item.price -
                                        (item.size?.extraPrice || 0) -
                                        (item.color?.extraPrice || 0),
                                    )}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleQuantityUpdate(
                                      item.productId,
                                      item.quantity - 1,
                                      item.size,
                                      item.color,
                                    )
                                  }
                                  disabled={isItemUpdating}
                                  className="w-8 h-8 rounded-lg border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaMinus className="text-xs text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-medium text-gray-800">
                                  {isItemUpdating ? (
                                    <FaSpinner className="animate-spin mx-auto text-amber-500" />
                                  ) : (
                                    item.quantity
                                  )}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityUpdate(
                                      item.productId,
                                      item.quantity + 1,
                                      item.size,
                                      item.color,
                                    )
                                  }
                                  disabled={isItemUpdating}
                                  className="w-8 h-8 rounded-lg border border-amber-200 flex items-center justify-center hover:bg-amber-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FaPlus className="text-xs text-gray-600" />
                                </button>
                              </div>
                              {/* Stock indicator */}
                              {item.maxStock &&
                                item.quantity >= item.maxStock && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Max stock reached
                                  </p>
                                )}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-4">
                              <span className="font-bold text-amber-600">
                                {formatPriceBDT(item.price * item.quantity)}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveForLater(item)}
                                  disabled={isItemUpdating}
                                  className="p-2 text-gray-500 hover:text-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Save for later"
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
                                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveItem(
                                      item.productId,
                                      item.size,
                                      item.color,
                                      item.name,
                                    )
                                  }
                                  disabled={isItemUpdating}
                                  className="p-2 text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Remove"
                                >
                                  {isItemUpdating ? (
                                    <FaSpinner className="animate-spin text-sm" />
                                  ) : (
                                    <FaTrash className="text-sm" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cart Actions */}
                <div className="p-4 bg-amber-50/50 border-t border-amber-100 flex justify-between items-center flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition"
                  >
                    <FaArrowLeft className="text-sm" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to clear your cart?")
                      ) {
                        clearCart();
                        setAppliedCoupon(null);
                        setDiscount(0);
                        toast.success("Cart cleared");
                      }
                    }}
                    className="text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Saved for Later */}
              {savedForLater.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
                  <div className="p-4 bg-amber-50 border-b border-amber-200">
                    <h3 className="font-semibold text-gray-800">
                      Saved for Later ({savedForLater.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {savedForLater.map((item, idx) => (
                      <div
                        key={`saved_${item.productId}_${item.size?.name || "nosize"}_${item.color?.name || "nocolor"}_${idx}`}
                        className="p-4 flex items-center justify-between hover:bg-amber-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <GiHandBag className="text-xl text-amber-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>
                            {item.size && (
                              <p className="text-xs text-gray-500">
                                Size: {item.size.name}
                                {item.size.type && ` (${item.size.type})`}
                              </p>
                            )}
                            {item.color && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                Color: {item.color.name}
                                {item.color.hexCode && (
                                  <span
                                    className="w-3 h-3 rounded-full inline-block"
                                    style={{
                                      backgroundColor: item.color.hexCode,
                                    }}
                                  />
                                )}
                              </p>
                            )}
                            <p className="text-sm text-amber-600">
                              {formatPriceBDT(item.price)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                        >
                          Move to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-amber-100 sticky top-24">
                <div className="p-6 border-b border-amber-100">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order Summary
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">
                      {formatPriceBDT(subtotal)}
                    </span>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-2">
                    <label className="block text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <FaTag className="text-amber-500" />
                      Coupon Code
                    </label>

                    {appliedCoupon ? (
                      // Applied coupon display
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-xs text-green-600 capitalize">
                                {appliedCoupon.type === "percentage"
                                  ? `${appliedCoupon.discount}% off`
                                  : appliedCoupon.type === "fixed"
                                    ? `${formatPriceBDT(appliedCoupon.discount)} off`
                                    : "Free Shipping"}
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-1">
                              {appliedCoupon.name}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Saved: {formatPriceBDT(appliedCoupon.discount)}
                            </p>
                            {appliedCoupon.minPurchase > 0 &&
                              subtotal < appliedCoupon.minPurchase && (
                                <p className="text-xs text-red-500 mt-1">
                                  Add{" "}
                                  {formatPriceBDT(
                                    appliedCoupon.minPurchase - subtotal,
                                  )}{" "}
                                  more to use this coupon
                                </p>
                              )}
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 hover:text-red-700 transition p-1"
                            title="Remove coupon"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Coupon input form
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                          disabled={couponLoading}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode}
                          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {couponLoading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTag />
                          )}
                          Apply
                        </button>
                      </div>
                    )}

                    {/* Available coupons hint */}
                    {!appliedCoupon && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">
                          Try: WELCOME20, FIRST50, NEWMEMBER25, FIRSTSHIP
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPriceBDT(discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-amber-100 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-amber-600">
                        {formatPriceBDT(total)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      *Taxes calculated at checkout
                    </p>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaLock className="text-sm" />
                        Proceed to Checkout
                      </>
                    )}
                  </button>

                  {/* Payment Methods */}
                  <div className="pt-4">
                    <p className="text-xs text-gray-500 text-center mb-3">
                      Secure payment methods
                    </p>
                    <div className="flex justify-center gap-3">
                      <FaCcVisa className="text-3xl text-gray-400" />
                      <FaCcMastercard className="text-3xl text-gray-400" />
                      <FaCcPaypal className="text-3xl text-gray-400" />
                      <FaCcAmex className="text-3xl text-gray-400" />
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      bKash | Nagad | Rocket also accepted
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;