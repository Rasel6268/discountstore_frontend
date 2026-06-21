"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaShareAlt,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaMinus,
  FaPlus,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaEnvelope,
  FaBoxOpen,
  FaTag,
  FaCalendarAlt,
  FaInfoCircle,
  FaVenusMars,
  FaMale,
  FaFemale,
  FaChild,
  FaPalette,
  FaTelegram,
} from "react-icons/fa";
import { GiHandBag } from "react-icons/gi";
import { MdVerified, MdDiscount } from "react-icons/md";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import api from "@/config/api";
import debounce from "lodash/debounce";

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8 md:py-12">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
        
        {/* Main Product Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="space-y-5">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="flex gap-3">
                <div className="h-12 bg-gray-200 rounded flex-1"></div>
                <div className="h-12 bg-gray-200 rounded flex-1"></div>
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Share Modal Component
const ShareModal = ({ isOpen, onClose, onShare, productName }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 min-w-[320px] max-w-md share-modal">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Share {productName}
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onShare("facebook")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaFacebook className="text-blue-600 text-xl" />
            <span>Facebook</span>
          </button>
          <button
            onClick={() => onShare("twitter")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaTwitter className="text-sky-500 text-xl" />
            <span>Twitter</span>
          </button>
          <button
            onClick={() => onShare("whatsapp")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaWhatsapp className="text-green-500 text-xl" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => onShare("telegram")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaTelegram className="text-blue-400 text-xl" />
            <span>Telegram</span>
          </button>
          <button
            onClick={() => onShare("linkedin")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaLinkedin className="text-blue-700 text-xl" />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => onShare("email")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition cursor-pointer"
          >
            <FaEnvelope className="text-gray-600 text-xl" />
            <span>Email</span>
          </button>
          <button
            onClick={() => onShare("copy")}
            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition border-t border-gray-200 mt-2 pt-3 cursor-pointer"
          >
            <FaBoxOpen className="text-gray-600 text-xl" />
            <span>Copy Link</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </>
  );
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, size = "md", interactive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`focus:outline-none transition ${interactive ? "cursor-pointer" : "cursor-default"}`}
          disabled={!interactive}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          {star <= (hoverRating || rating) ? (
            <FaStar className={`text-amber-400 ${sizeClasses[size]}`} />
          ) : star <= (hoverRating || rating) + 0.5 && rating % 1 !== 0 ? (
            <FaStarHalfAlt className={`text-amber-400 ${sizeClasses[size]}`} />
          ) : (
            <FaRegStar className={`text-amber-400 ${sizeClasses[size]}`} />
          )}
        </button>
      ))}
    </div>
  );
};

// Render Stars Helper
const renderStars = (ratingValue, showNumber = true) => {
  const numRating = ratingValue || 0;
  const fullStars = Math.floor(numRating);
  const hasHalfStar = numRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className="text-amber-400 text-sm" />
      ))}
      {hasHalfStar && <FaStarHalfAlt className="text-amber-400 text-sm" />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className="text-amber-400 text-sm" />
      ))}
      {showNumber && (
        <span className="text-sm text-gray-500 ml-2">({numRating.toFixed(1)})</span>
      )}
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Size selection states
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeStock, setSizeStock] = useState(0);
  const [sizeExtraPrice, setSizeExtraPrice] = useState(0);

  // Color selection states
  const [selectedColor, setSelectedColor] = useState(null);

  // Fetch product details
  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Handle click outside for share modal
  useEffect(() => {
    if (showShareModal) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.share-modal')) {
          setShowShareModal(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareModal]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data || response.data;
      
      if (!productData) {
        throw new Error('Product not found');
      }
      
      setProduct(productData);

      // Auto-select first available size if product has sizes
      if (productData.hasSizes && productData.sizes?.length > 0) {
        const availableSizes = productData.sizes.filter(
          (s) => s.isActive && s.quantity > 0,
        );
        if (availableSizes.length > 0) {
          setSelectedSize(availableSizes[0]);
          setSizeStock(availableSizes[0].quantity);
          setSizeExtraPrice(availableSizes[0].extraPrice || 0);
        }
      }

      // Auto-select first available color if product has colors
      if (productData.hasColors && productData.colors?.length > 0) {
        const availableColors = productData.colors.filter(
          (c) => c.isActive !== false && (c.quantity || 0) > 0,
        );
        if (availableColors.length > 0) {
          setSelectedColor(availableColors[0]);
        }
      }

      // Fetch related products from same category
      if (productData.category?._id || productData.category) {
        fetchRelatedProducts(productData.category._id || productData.category);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error(error.response?.data?.message || "Failed to load product");
      setTimeout(() => {
        router.push("/shop");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await api.get(
        `/products?category=${categoryId}&limit=4`,
      );
      const products = response.data.data || response.data;
      if (products && Array.isArray(products)) {
        const filtered = products.filter((p) => p._id !== id);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSizeStock(size.quantity);
    setSizeExtraPrice(size.extraPrice || 0);
    setQuantity(1); // Reset quantity when size changes
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  // Get available sizes grouped by type
  const getSizesByType = useMemo(() => {
    if (!product?.hasSizes || !product?.sizes) return {};

    const grouped = {
      men: [],
      women: [],
      unisex: [],
      kids: [],
    };

    product.sizes.forEach((size) => {
      if (size.isActive && size.quantity > 0) {
        const type = size.type || "unisex";
        grouped[type].push(size);
      }
    });

    return grouped;
  }, [product?.sizes, product?.hasSizes]);

  // Get type icon
  const getTypeIcon = (type) => {
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

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case "men":
        return "Men's Sizes";
      case "women":
        return "Women's Sizes";
      case "kids":
        return "Kids' Sizes";
      default:
        return "Unisex Sizes";
    }
  };

  // Debounced quantity change
  const handleQuantityChange = useCallback(
    debounce((type) => {
      let maxStock = 0;
      if (product?.hasSizes && selectedSize) {
        maxStock = sizeStock;
      } else {
        maxStock = product?.quantity || 0;
      }

      if (type === "increase" && quantity < maxStock) {
        setQuantity(quantity + 1);
      } else if (type === "decrease" && quantity > 1) {
        setQuantity(quantity - 1);
      }
    }, 100),
    [quantity, product, selectedSize, sizeStock]
  );

  const getCurrentPrice = useMemo(() => {
    const basePrice = product?.discountPrice || product?.regularPrice || 0;
    const sizeExtra = selectedSize?.extraPrice || 0;
    const colorExtra = selectedColor?.extraPrice || 0;
    return basePrice + sizeExtra + colorExtra;
  }, [product?.discountPrice, product?.regularPrice, selectedSize, selectedColor]);

  const getOriginalPrice = useMemo(() => {
    const basePrice = product?.regularPrice || 0;
    const sizeExtra = selectedSize?.extraPrice || 0;
    return basePrice + sizeExtra;
  }, [product?.regularPrice, selectedSize]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check if size is required but not selected
    if (product.hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Check if color is required but not selected
    if (product.hasColors && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    const currentStock = product.hasSizes ? sizeStock : product?.quantity || 0;
    if (currentStock === 0) {
      toast.error(
        product.hasSizes
          ? "Selected size is out of stock"
          : "Product is out of stock",
      );
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: getCurrentPrice,
      quantity: quantity,
      image: product.images?.[0]?.url || product.images?.[0],
      sku: product.sku,
      size: selectedSize
        ? {
            name: selectedSize.name,
            type: selectedSize.type,
            extraPrice: selectedSize.extraPrice,
          }
        : null,
      color: selectedColor
        ? {
            _id: selectedColor._id,
            name: selectedColor.name,
            hexCode: selectedColor.hexCode,
          }
        : null,
    };

    addToCart(cartItem);

    let message = `${quantity} × ${product.name}`;
    if (selectedSize) message += ` (Size: ${selectedSize.name})`;
    if (selectedColor) message += ` (Color: ${selectedColor.name})`;
    message += " added to cart!";

    toast.success(message);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  const handleWishlist = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.regularPrice || product.price,
        image: product.images?.[0]?.url || product.images?.[0],
      });
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const shareProduct = (platform) => {
    if (!product) return;

    const url = window.location.href;
    const text = `🔥 Check out this product: ${product.name} at Sahl Exchange`;

    const shareData = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      copy: "copy",
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
      setShowShareModal(false);
      return;
    }

    const shareUrl = shareData[platform];
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=600");
    }

    setShowShareModal(false);
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    if (reviewText.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating,
        comment: reviewText
      });
      toast.success("Thank you for your review!");
      setRating(0);
      setReviewText("");
      await fetchProductDetails(); // Refresh to show new review
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GiHandBag className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/shop"
            className="bg-amber-500 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const originalPrice = product.regularPrice || 0;
  const discountPrice = product.discountPrice || originalPrice;
  const discountPercentage =
    product.discountPercentage ||
    (originalPrice > discountPrice
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0);

  let stock = product.quantity || 0;
  if (product.hasSizes && selectedSize) {
    stock = sizeStock;
  }

  const isInStock = stock > 0 && product.isActive !== false;
  const hasAnySizes = Object.values(getSizesByType).some((arr) => arr.length > 0);
  const showLowStockWarning = stock <= 5 && stock > 0;

  return (
    <>
      <Head>
        <title>{product.name} | Sahl Exchange</title>
        <meta name="description" content={product.shortDescription || product.description?.substring(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.shortDescription || product.description?.substring(0, 160)} />
        <meta property="og:image" content={product.images?.[0]?.url || product.images?.[0]} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={getCurrentPrice} />
        <meta property="product:price:currency" content="BDT" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
            <Link href="/" className="text-gray-500 hover:text-amber-600 transition">
              Home
            </Link>
            <span className="text-gray-400" aria-hidden="true">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-amber-600 transition">
              Shop
            </Link>
            <span className="text-gray-400" aria-hidden="true">/</span>
            {product.category && (
              <>
                <Link
                  href={`/shop?category=${product.category._id}`}
                  className="text-gray-500 hover:text-amber-600 transition"
                >
                  {product.category.name}
                </Link>
                <span className="text-gray-400" aria-hidden="true">/</span>
              </>
            )}
            <span className="text-gray-800 truncate" aria-current="page">
              {product.name}
            </span>
          </nav>

          {/* Product Main Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
              {/* Product Images Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-linear-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden">
                  {product.images &&
                  product.images.length > 0 &&
                  product.images[selectedImage] ? (
                    <Image
                      src={
                        typeof product.images[selectedImage] === "string"
                          ? product.images[selectedImage]
                          : product.images[selectedImage].url
                      }
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GiHandBag className="text-8xl text-amber-300" />
                    </div>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discountPercentage > 0 && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        -{discountPercentage}%
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        Featured
                      </span>
                    )}
                    {product.isPremium && (
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        Premium
                      </span>
                    )}
                    {product.isBest && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        Best Seller
                      </span>
                    )}
                    {product.isFreeShipping && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        Free Shipping
                      </span>
                    )}
                  </div>

                  <div className="absolute top-4 right-4">
                    {isInStock ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        In Stock ({stock})
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                          selectedImage === index
                            ? "border-amber-500 shadow-md"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                        aria-label={`View product image ${index + 1}`}
                      >
                        <Image
                          src={typeof image === "string" ? image : image.url}
                          alt={`${product.name} view ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {product.brand && (
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {product.brand.name}
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {product.name}
                </h1>

                <div className="flex items-center flex-wrap gap-3">
                  {renderStars(product.averageRating || 0)}
                  <span className="text-sm text-gray-500">
                    ({product.totalReviews || 0} reviews)
                  </span>
                  {product.totalSold > 0 && (
                    <span className="text-sm text-gray-500">
                      • {product.totalSold}+ sold
                    </span>
                  )}
                </div>

                <div className="flex items-baseline flex-wrap gap-3">
                  <span className="text-3xl font-bold text-amber-600">
                    ৳{getCurrentPrice.toFixed(2)}
                  </span>
                  {selectedSize?.extraPrice > 0 && (
                    <span className="text-sm text-gray-500">
                      (Base: ৳{discountPrice.toFixed(2)} + Size: ৳
                      {selectedSize.extraPrice})
                    </span>
                  )}

                  {getCurrentPrice < getOriginalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ৳{getOriginalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Color Selection Section */}
                {product.hasColors && product.colors?.length > 0 && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2">
                      <FaPalette className="text-amber-500" aria-hidden="true" />
                      <h3 className="font-semibold text-gray-800">
                        Select Color
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => {
                        const isAvailable = color.isActive !== false;

                        return (
                          <button
                            key={color._id}
                            onClick={() => isAvailable && handleColorSelect(color)}
                            className={`group flex flex-col items-center gap-1 transition-all duration-200 ${
                              !isAvailable
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            } ${
                              selectedColor?._id === color._id
                                ? "scale-105"
                                : "hover:scale-105"
                            }`}
                            disabled={!isAvailable}
                            aria-label={`Select ${color.name} color`}
                            title={!isAvailable ? "Out of stock" : `Select ${color.name}`}
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-2 transition-all ${
                                selectedColor?._id === color._id
                                  ? "border-amber-500 shadow-lg"
                                  : "border-gray-300 group-hover:border-amber-400"
                              }`}
                              style={{
                                backgroundColor: color.hexCode || "#CCCCCC",
                              }}
                              aria-hidden="true"
                            />
                            <span
                              className={`text-xs transition-colors ${
                                selectedColor?._id === color._id
                                  ? "text-amber-600 font-medium"
                                  : "text-gray-600 group-hover:text-amber-500"
                              }`}
                            >
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {product.hasColors && !selectedColor && (
                      <p className="text-sm text-red-500" role="alert">
                        Please select a color to continue
                      </p>
                    )}
                    {selectedColor && (
                      <p className="text-sm text-green-600">
                        Selected: {selectedColor.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Size Selection Section */}
                {product.hasSizes && hasAnySizes && (
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2">
                      <FaVenusMars className="text-amber-500" aria-hidden="true" />
                      <h3 className="font-semibold text-gray-800">Select Size</h3>
                      {selectedSize && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({sizeStock} available)
                        </span>
                      )}
                    </div>

                    {Object.entries(getSizesByType).map(([type, sizes]) => 
                      sizes.length > 0 && (
                        <div key={type}>
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(type)}
                            <span className="text-sm font-medium text-gray-700">
                              {getTypeLabel(type)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sizes.map((size) => (
                              <button
                                key={size.name}
                                onClick={() => handleSizeSelect(size)}
                                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                  selectedSize?.name === size.name
                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                    : "border-gray-300 hover:border-amber-300 text-gray-700"
                                }`}
                                aria-label={`Select size ${size.name}`}
                                aria-pressed={selectedSize?.name === size.name}
                              >
                                {size.name}
                                {size.extraPrice > 0 && (
                                  <span className="text-xs ml-1 text-amber-600">
                                    +৳{size.extraPrice}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {product.hasSizes && !selectedSize && (
                      <p className="text-sm text-red-500" role="alert">
                        Please select a size to continue
                      </p>
                    )}
                  </div>
                )}

                {product.shortDescription && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>
                )}

                {product.description && (
                  <div className="text-gray-600">
                    <p className="line-clamp-3">
                      {product.description.replace(/<[^>]*>/g, "")}
                    </p>
                    <button
                      onClick={() => setActiveTab("description")}
                      className="text-amber-600 text-sm font-medium mt-1 hover:underline"
                      aria-label="Read full description"
                    >
                      Read more →
                    </button>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        disabled={quantity <= 1}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <FaMinus className="text-xs" aria-hidden="true" />
                      </button>
                      <span className="w-12 text-center font-medium" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        disabled={quantity >= stock}
                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <FaPlus className="text-xs" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stock} items available
                    </span>
                  </div>
                  {showLowStockWarning && (
                    <p className="text-orange-600 text-sm mt-1" role="alert">
                      ⚠️ Only {stock} items left in stock!
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || (product.hasSizes && !selectedSize)}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    aria-label="Add to cart"
                  >
                    <FaShoppingCart aria-hidden="true" /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!isInStock || (product.hasSizes && !selectedSize)}
                    className="flex-1 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Buy now"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="py-3 px-5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"
                    aria-label="Share product"
                  >
                    <FaShareAlt aria-hidden="true" />
                  </button>
                </div>

                {/* Delivery & Returns Info */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {product.isFreeShipping && (
                    <div className="flex items-start gap-3 text-sm">
                      <FaTruck className="text-amber-500 text-lg mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-gray-800">Free Delivery</p>
                        <p className="text-gray-500">
                          Free shipping on this item
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 text-sm">
                    <FaUndo className="text-amber-500 text-lg mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-gray-800">Easy Returns</p>
                      <p className="text-gray-500">30 days easy return policy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <FaShieldAlt className="text-amber-500 text-lg mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-gray-800">Secure Payment</p>
                      <p className="text-gray-500">100% secure payment gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex gap-6 px-6 min-w-max" role="tablist">
                {["description", "specifications", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 font-medium transition relative ${
                      activeTab === tab
                        ? "text-amber-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`${tab}-panel`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Description Tab */}
              <div
                id="description-panel"
                role="tabpanel"
                hidden={activeTab !== "description"}
              >
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    {product.description ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    ) : (
                      <p className="text-gray-500">No description available.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Specifications Tab */}
              <div
                id="specifications-panel"
                role="tabpanel"
                hidden={activeTab !== "specifications"}
              >
                {activeTab === "specifications" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Product Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex py-2 border-b border-gray-100">
                        <span className="w-1/3 font-medium text-gray-600">SKU</span>
                        <span className="w-2/3 text-gray-800">
                          {product.sku || "N/A"}
                        </span>
                      </div>
                      <div className="flex py-2 border-b border-gray-100">
                        <span className="w-1/3 font-medium text-gray-600">
                          Category
                        </span>
                        <span className="w-2/3 text-gray-800">
                          {product.category?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex py-2 border-b border-gray-100">
                        <span className="w-1/3 font-medium text-gray-600">
                          Brand
                        </span>
                        <span className="w-2/3 text-gray-800">
                          {product.brand?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex py-2 border-b border-gray-100">
                        <span className="w-1/3 font-medium text-gray-600">
                          Stock Status
                        </span>
                        <span className="w-2/3 text-gray-800">
                          {isInStock
                            ? `In Stock (${stock} available)`
                            : "Out of Stock"}
                        </span>
                      </div>
                      {product.hasSizes && (
                        <div className="flex py-2 border-b border-gray-100">
                          <span className="w-1/3 font-medium text-gray-600">
                            Available Sizes
                          </span>
                          <span className="w-2/3 text-gray-800">
                            {product.sizes
                              .filter((s) => s.isActive && s.quantity > 0)
                              .map((s) => s.name)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {product.hasColors && (
                        <div className="flex py-2 border-b border-gray-100">
                          <span className="w-1/3 font-medium text-gray-600">
                            Available Colors
                          </span>
                          <span className="w-2/3 text-gray-800">
                            <div className="flex flex-wrap gap-2">
                              {product.colors
                                .filter((c) => c.isActive !== false && (c.quantity || 0) > 0)
                                .map((color) => (
                                  <span
                                    key={color._id}
                                    className="inline-flex items-center gap-1"
                                  >
                                    <span
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor: color.hexCode || "#CCCCCC",
                                      }}
                                      aria-hidden="true"
                                    />
                                    {color.name}
                                  </span>
                                ))}
                            </div>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews Tab */}
              <div
                id="reviews-panel"
                role="tabpanel"
                hidden={activeTab !== "reviews"}
              >
                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-800">
                          {product.averageRating?.toFixed(1) || "0.0"}
                        </div>
                        <div className="flex justify-center mt-1">
                          {renderStars(product.averageRating || 0, false)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Based on {product.totalReviews || 0} reviews
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Write a Review
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                          </label>
                          <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="md"
                            interactive={true}
                          />
                        </div>
                        <div>
                          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Review
                          </label>
                          <textarea
                            id="review-text"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                            placeholder="Share your experience with this product..."
                            aria-label="Your review"
                          />
                        </div>
                        <button
                          onClick={handleReviewSubmit}
                          disabled={isSubmittingReview}
                          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Customer Reviews
                      </h3>
                      <div className="space-y-4">
                        {product.reviews?.length > 0 ? (
                          product.reviews.map((review, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-100 pb-4"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {renderStars(review.rating)}
                                    <span className="font-medium text-gray-800">
                                      {review.user?.name || "Anonymous"}
                                    </span>
                                    {review.verifiedPurchase && (
                                      <span className="flex items-center gap-1 text-xs text-green-600">
                                        <MdVerified aria-hidden="true" /> Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-600 mt-2">{review.comment}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No reviews yet. Be the first to review!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100 group cursor-pointer"
                    onClick={() => router.push(`/product/${relatedProduct._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        router.push(`/product/${relatedProduct._id}`);
                      }
                    }}
                  >
                    <div className="relative aspect-square bg-linear-to-br from-amber-50 to-amber-100">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <Image
                          src={
                            typeof relatedProduct.images[0] === "string"
                              ? relatedProduct.images[0]
                              : relatedProduct.images[0].url
                          }
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <GiHandBag className="text-5xl text-amber-300" />
                        </div>
                      )}
                      {relatedProduct.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          -{Math.round(relatedProduct.discountPercentage)}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-base font-bold text-amber-600">
                            ৳
                            {(
                              relatedProduct.discountPrice ||
                              relatedProduct.regularPrice
                            ).toFixed(2)}
                          </span>
                          {relatedProduct.discountPrice && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                              ৳{relatedProduct.regularPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={shareProduct}
        productName={product.name}
      />
    </>
  );
};

export default ProductDetailsPage;