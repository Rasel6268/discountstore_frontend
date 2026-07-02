"use client";
import React, { useEffect, useState } from "react";
import {
  FaStar,
  FaRegHeart,
  FaAngleRight,
  FaGem,
  FaLeaf,
  FaTrophy,
  FaClock,
  FaGift,
  FaFire,
  FaShoppingCart,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Image from "next/image";
import BannerSlider from "../BannerSwiper";
import { useAuth } from "@/AuthProvider/AuthProvider";
import { useCart } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, addToCart } = useCart();

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data.data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data;
    },
  });

  // Fetch active discount offers
  const { data: discounts, isLoading: discountsLoading } = useQuery({
    queryKey: ["active-discounts"],
    queryFn: async () => {
      const res = await api.get("/discounts/active");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Discount Slider State
  const [currentDiscountIndex, setCurrentDiscountIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({});

  // Auto-slide discounts
  useEffect(() => {
    if (!discounts || discounts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentDiscountIndex((prev) =>
        prev === discounts.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [discounts]);

  // Calculate time remaining for each discount
  useEffect(() => {
    if (!discounts) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const newTimeRemaining = {};

      discounts.forEach((discount, index) => {
        const end = new Date(discount.endDate);
        const diff = end - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          newTimeRemaining[index] = { days, hours, minutes, seconds };
        } else {
          newTimeRemaining[index] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          };
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [discounts]);

  const handlePrevDiscount = () => {
    setCurrentDiscountIndex((prev) =>
      prev === 0 ? discounts.length - 1 : prev - 1,
    );
  };

  const handleNextDiscount = () => {
    setCurrentDiscountIndex((prev) =>
      prev === discounts.length - 1 ? 0 : prev + 1,
    );
  };

  const goToDiscount = (index) => {
    setCurrentDiscountIndex(index);
  };

  // Filter products
  const bestProducts = products?.filter((item) => item.isBest === true);
  const discountedProducts = products?.filter(
    (item) => item.discountPercentage > 20,
  );
  const premiumProducts = products?.filter((item) => item.isPremium === true);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    try {
      if (product.trackInventory && product.quantity === 0) {
        toast.error(`${product.name} is out of stock!`);
        return;
      }

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
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    }
  };
  const handleCategoryClick = (categoryId, categoryName) => {
    if (categoryId && categoryName) {
      router.push(
        `/shop?category=${categoryId}&categoryName=${encodeURIComponent(
          categoryName,
        )}`,
      );
    } else {
      router.push(`/shop?category=${categoryId || ""}`);
    }
  };

  const toggleWishlist = (productId) => {
    console.log("Toggle wishlist:", productId);
  };

  // Get discount icon based on offer type
  const getDiscountIcon = (offerType) => {
    const icons = {
      limited_time_offer: <FaClock className="text-amber-300 text-xl" />,
      seasonal: <FaLeaf className="text-amber-300 text-xl" />,
      clearance: <FaTags className="text-amber-300 text-xl" />,
      flash_sale: <FaFire className="text-amber-300 text-xl" />,
    };
    return icons[offerType] || <FaGift className="text-amber-300 text-xl" />;
  };

  // Get discount label
  const getDiscountLabel = (offerType) => {
    const labels = {
      limited_time_offer: "LIMITED TIME OFFER",
      seasonal: "SEASONAL SALE",
      clearance: "CLEARANCE SALE",
      flash_sale: "⚡ FLASH SALE",
    };
    return labels[offerType] || "SPECIAL OFFER";
  };

  // Get gradient based on offer type
  const getDiscountGradient = (offerType) => {
    const gradients = {
      limited_time_offer: "from-amber-600 to-amber-700",
      seasonal: "from-emerald-600 to-emerald-700",
      clearance: "from-red-600 to-red-700",
      flash_sale: "from-orange-500 to-red-600",
    };
    return gradients[offerType] || "from-amber-600 to-amber-700";
  };

  // Format coupon discount
  const formatDiscountValue = (coupon) => {
    if (!coupon) return "Special Offer";
    if (coupon.type === "percentage") {
      return `${coupon.value}% OFF`;
    }
    return `$${coupon.value} OFF`;
  };

  const productSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: true,
          autoplay: true,
          autoplaySpeed: 3000,
          pauseOnHover: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
          arrows: true,
          dots: true,
          autoplay: true,
          autoplaySpeed: 3000,
          pauseOnHover: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
          autoplay: true,
          autoplaySpeed: 3000,
          pauseOnHover: true,
        },
      },
    ],
  };

  return (
    <section className="bg-amber-50/30">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="w-11/12 mx-auto py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-2 lg:block hidden">
              <div className="bg-linear-to-br from-amber-900 to-amber-800 rounded-2xl shadow-2xl p-6 h-full lg:sticky lg:top-6 border border-amber-700/50">
                <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center border-b border-amber-700 pb-4 flex items-center justify-center gap-2">
                  <FaGem className="text-amber-400" />
                  Leather Collections
                  <FaGem className="text-amber-400" />
                </h2>

                <ul className="space-y-2.5">
                  {categories?.map((category, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center rounded-xl px-4 py-3 transition-all duration-300 cursor-pointer ${
                        category.active
                          ? "bg-linear-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                          : "bg-amber-800/50 text-amber-100 shadow-md hover:bg-amber-700/70 hover:shadow-lg"
                      }`}
                      onClick={() => {
                        if (category._id) {
                          handleCategoryClick(category._id, category.name);
                        } else {
                          console.warn("Category missing _id:", category);
                          router.push("/shop");
                        }
                      }}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span
                        className={`text-sm font-semibold rounded-full px-2.5 py-1 min-w-8 text-center ${
                          category.active
                            ? "bg-amber-100 text-amber-800"
                            : "bg-amber-600 text-amber-100"
                        }`}
                      >
                        {category.productCount}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 bg-linear-to-br from-amber-600 to-amber-700 rounded-2xl p-5 text-white text-center shadow-xl border border-amber-500">
                  <FaGift className="text-3xl mx-auto mb-2 text-amber-300" />
                  <h3 className="font-bold text-lg">Eid Special Offer! 🎉</h3>
                  <p className="text-sm mt-1 text-amber-100">
                    Up to 40% off on premium leather
                  </p>
                  <Link
                    href="/shop"
                    className="mt-3 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-amber-900 transition-all duration-200 inline-block cursor-pointer"
                  >
                    Shop Now →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Premium Banner */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <BannerSlider />
              </div>

              {/* Trusted Brands & Dynamic Discount Offers */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Hot Products */}
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-amber-200 flex flex-col h-[340px]">
                  <h2 className="text-2xl font-bold text-amber-900 mb-3 flex items-center gap-2 shrink-0">
                    <FaGem className="text-amber-600" />
                    HOT PRODUCTS
                  </h2>

                  <div className="flex-1 min-h-0">
                    <div className="h-full">
                      <Slider {...productSliderSettings}>
                        {bestProducts?.map((product, index) => {
                          const averageRating =
                            product.reviews?.length > 0
                              ? product.reviews.reduce(
                                  (sum, r) => sum + r.rating,
                                  0,
                                ) / product.reviews.length
                              : 0;
                          const isOutOfStock =
                            product.trackInventory && product.quantity === 0;

                          return (
                            <div
                              key={product._id}
                              className="bg-amber-50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group flex flex-col h-full relative"
                            >
                              {/* Image Container */}
                              <div
                                className="w-full relative overflow-hidden shrink-0 cursor-pointer"
                                style={{ height: "160px" }}
                              >
                                <Link href={`/shop/${product._id}`}>
                                  <Image
                                    src={
                                      product.images?.[0]?.url ||
                                      "/placeholder.png"
                                    }
                                    alt={product.name || "Product"}
                                    width={300}
                                    height={150}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    priority={index < 3}
                                    loading={index < 3 ? "eager" : "lazy"}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                </Link>

                                {/* Discount Badge */}
                                {product.discountPercentage > 0 && (
                                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                    -{product.discountPercentage}%
                                  </div>
                                )}

                                {/* Out of Stock Badge */}
                                {isOutOfStock && (
                                  <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    Out of Stock
                                  </div>
                                )}

                                {/* Price Card */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                  <div className="text-white">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs opacity-80">
                                          Price
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-lg flex items-center gap-1">
                                            <FaBangladeshiTakaSign size={14} />
                                            {product.discountPrice ||
                                              product.regularPrice}
                                          </span>
                                          {product.discountPrice && (
                                            <span className="text-gray-400 text-sm line-through flex items-center gap-0.5">
                                              <FaBangladeshiTakaSign
                                                size={10}
                                              />
                                              {product.regularPrice}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="p-3 flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-amber-900 text-sm line-clamp-1">
                                    {product.name}
                                  </h3>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, star) => (
                                        <FaStar
                                          key={star}
                                          className={`${
                                            star < Math.round(averageRating)
                                              ? "text-amber-400"
                                              : "text-amber-200"
                                          } text-[10px]`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[10px] text-amber-500">
                                      ({product.totalReviews || 0})
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() =>
                                    !isOutOfStock && handleAddToCart(product)
                                  }
                                  disabled={isOutOfStock}
                                  aria-label={`Add ${product.name} to cart`}
                                  className="bg-linear-to-r from-amber-600 to-amber-700 text-white p-2 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 cursor-pointer flex-shrink-0 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                                >
                                  <FaShoppingCart size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </Slider>
                    </div>
                  </div>
                </div>

                {/* Dynamic Discount Offer Slider */}
                <div className="relative h-[340px]">
                  {discountsLoading ? (
                    <div className="bg-gray-200 rounded-2xl p-6 h-full flex items-center justify-center">
                      <div className="text-gray-500">Loading offers...</div>
                    </div>
                  ) : discounts && discounts.length > 0 ? (
                    <div className="relative overflow-hidden rounded-2xl shadow-xl h-full">
                      <div
                        className="flex transition-transform duration-700 ease-in-out h-full"
                        style={{
                          transform: `translateX(-${currentDiscountIndex * 100}%)`,
                        }}
                      >
                        {discounts.map((discount, index) => (
                          <div
                            key={discount._id}
                            className="min-w-full h-full shrink-0"
                          >
                            <div
                              className={`bg-linear-to-r ${getDiscountGradient(discount.offerType)} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden h-full`}
                            >
                              {/* Background Decoration */}
                              <div className="absolute top-0 right-0 opacity-10">
                                <FaGift className="text-8xl" />
                              </div>
                              <div className="absolute bottom-0 left-0 opacity-5">
                                <FaTags className="text-6xl" />
                              </div>

                              {/* Content */}
                              <div className="relative z-10 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="transition-transform duration-500 hover:scale-110">
                                    {getDiscountIcon(discount.offerType)}
                                  </div>
                                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm whitespace-nowrap">
                                    {getDiscountLabel(discount.offerType)}
                                  </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold mb-1 line-clamp-1">
                                  {discount.title}
                                </h3>

                                {/* Description */}
                                <p className="text-white/90 text-sm mb-3 line-clamp-2">
                                  {discount.description}
                                </p>

                                {/* Discount Value & Offer Code */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  {discount.coupon && (
                                    <>
                                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap">
                                        <span className="font-bold">
                                          {formatDiscountValue(discount.coupon)}
                                        </span>
                                        {discount.coupon.minPurchase && (
                                          <span className="text-xs ml-2 opacity-80">
                                            Min. ${discount.coupon.minPurchase}
                                          </span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => {
                                          if (discount.coupon?.code) {
                                            navigator.clipboard.writeText(
                                              discount.coupon.code,
                                            );
                                            toast.success(
                                              `Coupon code ${discount.coupon.code} copied!`,
                                            );
                                          }
                                        }}
                                        className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer group whitespace-nowrap flex items-center gap-1 hover:scale-105"
                                      >
                                        <span className="text-xs opacity-80">
                                          Code:
                                        </span>
                                        <span className="font-mono font-bold tracking-wider group-hover:text-amber-200">
                                          {discount.coupon.code}
                                        </span>
                                        <span className="text-xs opacity-60 group-hover:opacity-100">
                                          📋
                                        </span>
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Spacer */}
                                <div className="flex-1"></div>

                                {/* Bottom Section - Timer and CTA */}
                                <div className="flex items-end justify-between mt-2 pt-2 border-t border-white/10">
                                  {/* Timer */}
                                  <div className="flex-1">
                                    {timeRemaining[index] && (
                                      <div className="flex items-center gap-2">
                                        <FaClock className="text-white/70 shrink-0 animate-pulse" />
                                        <div className="flex gap-1.5">
                                          {[
                                            "days",
                                            "hours",
                                            "minutes",
                                            "seconds",
                                          ].map((unit) => (
                                            <div
                                              key={unit}
                                              className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[36px]"
                                            >
                                              <span className="text-base font-bold">
                                                {String(
                                                  timeRemaining[index][unit],
                                                ).padStart(2, "0")}
                                              </span>
                                              <span className="text-[8px] block opacity-70 leading-tight capitalize">
                                                {unit}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* CTA Button */}
                                  <div className="shrink-0 ml-2">
                                    <Link
                                      href={`/shop?discount=${discount._id}`}
                                      className="inline-block bg-white text-amber-700 px-4 py-1.5 rounded-full font-semibold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl whitespace-nowrap text-sm hover:scale-105 hover:bg-amber-50 active:scale-95"
                                    >
                                      Claim Offer →
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Navigation Arrows */}
                      {discounts.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevDiscount}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-300 z-20 hover:scale-110 active:scale-95"
                          >
                            <FaChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextDiscount}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-300 z-20 hover:scale-110 active:scale-95"
                          >
                            <FaChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Dots Indicator */}
                      {discounts.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                          {discounts.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToDiscount(index)}
                              className={`transition-all duration-500 rounded-full ${
                                index === currentDiscountIndex
                                  ? "bg-white w-5 h-1.5"
                                  : "bg-white/50 hover:bg-white/70 w-1.5 h-1.5"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback static offer
                    <div className="bg-linear-to-r from-amber-600 to-amber-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden h-full">
                      <div className="absolute top-0 right-0 opacity-10">
                        <FaGift className="text-8xl" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          <FaFire className="text-amber-300 text-xl" />
                          <span className="text-sm font-semibold bg-amber-500 px-3 py-1 rounded-full">
                            LIMITED TIME OFFER
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                          Eid-ul-Fitr Mega Sale
                        </h3>
                        <p className="text-amber-100 mb-4">
                          Get up to 50% off on fusion leather collection + Free
                          Gift
                        </p>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-center">
                            <div className="bg-white/20 rounded-lg px-3 py-2">
                              <span className="text-xl font-bold">12</span>
                              <span className="text-xs block">Days</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="bg-white/20 rounded-lg px-3 py-2">
                              <span className="text-xl font-bold">08</span>
                              <span className="text-xs block">Hours</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="bg-white/20 rounded-lg px-3 py-2">
                              <span className="text-xl font-bold">45</span>
                              <span className="text-xs block">Mins</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <button className="bg-white text-amber-700 px-5 py-2 rounded-full font-semibold hover:bg-amber-100 transition cursor-pointer">
                            Claim Offer →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Fusion Collection Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="w-11/12 mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
              <FaLeaf className="text-amber-700" />
              <span className="text-amber-800 text-sm font-semibold">
                Premium Quality
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              🔥 Fusion Leather Collection
            </h2>
            <p className="text-amber-600 max-w-2xl mx-auto">
              Handcrafted with premium leather • Modern fusion designs • Limited
              edition
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {premiumProducts?.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-amber-100 transition-all duration-300 group flex flex-col h-full"
              >
                <Link href={`/shop/${product._id}`}>
                  <div className="aspect-4/3 w-full cursor-pointer overflow-hidden rounded-t-2xl">
                    <Image
                      src={
                        product.images?.[0]?.url || "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                <div className="p-4 md:p-5 flex flex-col grow">
                  <h3 className="font-semibold text-amber-900 text-base md:text-lg line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-amber-600 text-xs md:text-sm line-clamp-2 mb-3">
                    {product.shortDescription}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, star) => (
                        <FaStar
                          key={star}
                          className={`${
                            star < (product.averageRating || 0)
                              ? "text-amber-400"
                              : "text-amber-200"
                          } text-xs`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-amber-500">
                      ({product.totalReviews || 0})
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-amber-700 font-bold text-lg flex items-center gap-1">
                      <FaBangladeshiTakaSign size={14} />
                      {product.discountPrice?.toLocaleString()}
                    </div>
                    {product.regularPrice > product.discountPrice && (
                      <span className="text-xs line-through text-amber-400">
                        <FaBangladeshiTakaSign
                          size={10}
                          className="inline mr-0.5"
                        />
                        {product.regularPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.trackInventory && product.quantity === 0}
                    className={`mt-auto w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      product.trackInventory && product.quantity === 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-linear-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800"
                    }`}
                  >
                    {product.trackInventory && product.quantity === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>

                  {product.hasSizes && product.sizes?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-amber-100">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 3).map((size, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded"
                          >
                            {size.name || size}
                          </span>
                        ))}
                        {product.sizes.length > 3 && (
                          <span className="text-xs text-amber-400">
                            +{product.sizes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(!premiumProducts || premiumProducts.length === 0) && (
            <div className="text-center py-12">
              <div className="text-amber-400 mb-4">
                <FaGem className="text-5xl mx-auto" />
              </div>
              <p className="text-amber-600">
                No premium products available at the moment.
              </p>
              <p className="text-amber-400 text-sm mt-2">
                Check back soon for our luxury collection!
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Explore Full Collection
              <FaAngleRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Special Occasion Discount Banner */}
      <div className="py-12 bg-linear-to-r from-amber-800 to-amber-900">
        <div className="w-11/12 mx-auto">
          <div className="text-center text-white mb-8">
            <FaGift className="text-5xl mx-auto mb-4 text-amber-400" />
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Special Occasion Offers
            </h2>
            <p className="text-amber-200">
              Admin curated discounts for Eid, Puja, Christmas & More
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-amber-600 hover:bg-white/20 transition group">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaStar className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Eid Special</h3>
              <p className="text-amber-200 text-sm mb-3">
                Up to 40% off on fusion collection
              </p>
              <div className="text-3xl font-bold text-amber-400 mb-3">
                40% OFF
              </div>
              <button className="border border-amber-400 text-amber-400 px-4 py-2 rounded-full text-sm hover:bg-amber-400 hover:text-white transition">
                Shop Now
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-amber-600 hover:bg-white/20 transition group">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaGem className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Durga Puja Special
              </h3>
              <p className="text-amber-200 text-sm mb-3">
                Premium leather gifts collection
              </p>
              <div className="text-3xl font-bold text-amber-400 mb-3">
                35% OFF
              </div>
              <button className="border border-amber-400 text-amber-400 px-4 py-2 rounded-full text-sm hover:bg-amber-400 hover:text-white transition">
                Shop Now
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center border border-amber-600 hover:bg-white/20 transition group">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaGift className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Christmas Mega Sale
              </h3>
              <p className="text-amber-200 text-sm mb-3">
                Fusion leather + Free gift wrap
              </p>
              <div className="text-3xl font-bold text-amber-400 mb-3">
                50% OFF
              </div>
              <button className="border border-amber-400 text-amber-400 px-4 py-2 rounded-full text-sm hover:bg-amber-400 hover:text-white transition">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Leather Products */}
      <div className="py-12 md:py-16 bg-amber-50/50">
        <div className="w-11/12 mx-auto">
          <div className="text-center mb-10">
            <FaTrophy className="text-4xl mx-auto mb-3 text-amber-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Best Selling Leather Products
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestProducts?.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl border border-amber-100 transition-all duration-300 group flex flex-col h-full"
              >
                <Link href={`/shop/${product._id}`}>
                  <div className="aspect-4/3 w-full cursor-pointer overflow-hidden rounded-t-xl md:rounded-t-2xl">
                    <Image
                      src={
                        product.images?.[0]?.url || "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                <div className="p-4 md:p-5 flex flex-col grow">
                  <h3 className="font-semibold text-amber-900 text-sm md:text-base line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-amber-600 text-xs md:text-sm line-clamp-2 mb-3">
                    {product.shortDescription}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="text-amber-700 font-bold text-sm md:text-base flex items-center gap-1">
                      <FaBangladeshiTakaSign size={14} />
                      {product.discountPrice?.toLocaleString()}
                    </div>
                    {product.regularPrice > product.discountPrice && (
                      <span className="text-xs line-through text-amber-400">
                        <FaBangladeshiTakaSign
                          size={10}
                          className="inline mr-0.5"
                        />
                        {product.regularPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.trackInventory &&
                    product.quantity <= product.lowStockThreshold && (
                      <div className="mb-3">
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          Only {product.quantity} left in stock
                        </span>
                      </div>
                    )}

                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <button
                      disabled={
                        product.trackInventory && product.quantity === 0
                      }
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                        product.trackInventory && product.quantity === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-linear-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800"
                      }`}
                    >
                      {product.trackInventory && product.quantity === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>

                  {product.hasSizes && product.sizes?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-amber-100">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 4).map((size, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded"
                          >
                            {size.name || size}
                          </span>
                        ))}
                        {product.sizes.length > 4 && (
                          <span className="text-xs text-amber-400">
                            +{product.sizes.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(!bestProducts || bestProducts.length === 0) && (
            <div className="text-center py-12">
              <p className="text-amber-600">
                No products found in this collection.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              View All Best Sellers
              <FaAngleRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Discount Products Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="w-11/12 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-amber-900">
                <span className="w-3 h-8 bg-linear-to-b from-amber-500 to-amber-600 rounded-full"></span>
                Special Discount Offers
              </h2>
              <p className="text-amber-600 mt-2">
                Admin curated discounts for special occasions & events
              </p>
            </div>
            <Link
              href="/shop"
              className="flex items-center text-amber-600 gap-2 font-semibold hover:text-amber-700 transition-colors group cursor-pointer"
            >
              View All
              <FaAngleRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {discountedProducts?.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-amber-100 transition-all duration-300 group flex flex-col h-full"
              >
                <Link href={`/shop/${product._id}`}>
                  <div className="aspect-4/3 w-full cursor-pointer overflow-hidden">
                    <Image
                      src={
                        product.images?.[0]?.url || "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>

                <div className="p-3 md:p-4 flex flex-col grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm md:text-base font-bold text-amber-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="text-amber-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <FaRegHeart className="text-sm" />
                    </button>
                  </div>

                  <p className="text-amber-600 text-xs md:text-sm mb-2 line-clamp-2">
                    {product.shortDescription}
                  </p>

                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, star) => (
                      <FaStar
                        key={star}
                        className={`${
                          star < (product.averageRating || 0)
                            ? "text-amber-400"
                            : "text-amber-200"
                        } text-[10px] md:text-xs`}
                      />
                    ))}
                    <span className="text-[10px] text-amber-500 ml-1">
                      ({product.totalReviews || 0})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-sm md:text-base font-bold text-amber-700 flex items-center gap-1">
                        <FaBangladeshiTakaSign size={12} />
                        {product.discountPrice?.toLocaleString()}
                      </span>
                      {product.regularPrice > product.discountPrice && (
                        <span className="text-[10px] line-through text-amber-400">
                          <FaBangladeshiTakaSign
                            size={8}
                            className="inline mr-0.5"
                          />
                          {product.regularPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        product.trackInventory && product.quantity === 0
                      }
                      className={`${
                        product.trackInventory && product.quantity === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 cursor-pointer"
                      } text-white p-1.5 rounded-lg transition`}
                    >
                      <FaShoppingCart className="text-xs" />
                    </button>
                  </div>

                  {product.trackInventory &&
                    product.quantity <= product.lowStockThreshold &&
                    product.quantity > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          Only {product.quantity} left!
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {(!discountedProducts || discountedProducts.length === 0) && (
            <div className="text-center py-12">
              <div className="text-amber-400 mb-4">
                <FaTags className="text-5xl mx-auto" />
              </div>
              <p className="text-amber-600">
                No discount offers available at the moment.
              </p>
              <p className="text-amber-400 text-sm mt-2">
                Check back soon for exciting deals!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
