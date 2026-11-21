"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const BannerSlider = () => {
  const router = useRouter();
  const cdnBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://cdn.discountstorebd.com").replace(/\/$/, "");

  const banners = [
    {
      id: 1,
      title: "Handcrafted Leather Footwear",
      subtitle: "Artisan Oxford & Heritage Boots",
      tag: "Signature Craft",
      discount: "UP TO 35% OFF",
      description:
        "Full-grain leather shoes engineered for timeless elegance, superior durability, and all-day comfort.",
      buttonText: "Shop Footwear",
      link: "/shop",
      image: `${cdnBase}/banners/banner_collection.webp`,
      fallbackImage: "https://cdn.discountstorebd.com/banner_1.jpg",
      badge: "Full-Grain Leather",
    },
    {
      id: 2,
      title: "Designer Fusion Handbags",
      subtitle: "Modern Luxury Meets Everyday Utility",
      tag: "Trending Now",
      discount: "FLAT 25% OFF",
      description:
        "Rich cognac leather tote and crossbody bags accented with custom gold hardware and structured silhouettes.",
      buttonText: "Explore Handbags",
      link: "/shop",
      image: `${cdnBase}/banners/banner_handbag.webp`,
      fallbackImage: "https://cdn.discountstorebd.com/Banner_2.jpg",
      badge: "Exclusive Design",
    },
    {
      id: 3,
      title: "Bespoke Leather Essentials",
      subtitle: "Jackets, Wallets & Formal Belts",
      tag: "Festive Special",
      discount: "SPECIAL 40% OFF",
      description:
        "Elevate your signature wardrobe with masterfully tailored leather jackets, slim wallets, and durable belts.",
      buttonText: "Grab Deal",
      link: "/shop",
      image: `${cdnBase}/banners/banner_shoes.webp`,
      fallbackImage: "https://cdn.discountstorebd.com/banner_3.jpg",
      badge: "Limited Stock",
    },
  ];

  const handleSlideClick = (link) => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl group/slider bg-neutral-900">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: ".banner-custom-pagination",
          bulletClass: "banner-bullet",
          bulletActiveClass: "banner-bullet-active",
        }}
        navigation={{
          nextEl: ".banner-nav-next",
          prevEl: ".banner-nav-prev",
        }}
        loop={true}
        className="w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[500px]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative w-full h-full overflow-hidden cursor-pointer flex items-center group/slide"
              onClick={() => handleSlideClick(banner.link)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  priority={banner.id === 1}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 80vw"
                  className="object-cover object-center transform scale-100 group-hover/slide:scale-105 transition-transform duration-1000 ease-out"
                  onError={(e) => {
                    if (banner.fallbackImage) {
                      e.currentTarget.srcset = "";
                      e.currentTarget.src = banner.fallbackImage;
                    }
                  }}
                />
              </div>

              {/* Multi-layer Gradient Overlay for 100% Text Contrast & Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25 sm:from-black/85 sm:via-black/55 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 sm:hidden" />

              {/* Decorative Subtle Glowing Orbs */}
              <div className="absolute -top-10 -left-10 w-44 h-44 sm:w-60 sm:h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-10 w-44 h-44 sm:w-72 sm:h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Content */}
              <div className="relative z-10 w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8 md:px-12 flex flex-col justify-center h-full">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2 sm:mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-500/25 text-amber-200 border border-amber-400/40 backdrop-blur-md shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {banner.tag}
                  </span>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-white/10 text-white/90 border border-white/20 backdrop-blur-md">
                    {banner.badge}
                  </span>
                </div>

                {/* Subtitle */}
                <p className="text-amber-300 font-medium tracking-wider uppercase text-[11px] sm:text-xs md:text-sm mb-1 sm:mb-1.5">
                  {banner.subtitle}
                </p>

                {/* Title */}
                <h2 className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-2 sm:mb-3 drop-shadow-md">
                  {banner.title}
                </h2>

                {/* Discount Tagline */}
                <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 drop-shadow">
                    {banner.discount}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-amber-100/80">
                    On Premium Selection
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 sm:mb-6 max-w-md">
                  {banner.description}
                </p>

                {/* CTA Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideClick(banner.link);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-950/40 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-amber-600 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    <span>{banner.buttonText}</span>
                    <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Next / Prev Buttons */}
      <button
        aria-label="Previous Slide"
        className="banner-nav-prev absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md hidden sm:flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110 cursor-pointer"
      >
        <FaChevronLeft className="text-sm sm:text-base" />
      </button>
      <button
        aria-label="Next Slide"
        className="banner-nav-next absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md hidden sm:flex items-center justify-center transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110 cursor-pointer"
      >
        <FaChevronRight className="text-sm sm:text-base" />
      </button>

      {/* Custom Pagination Container */}
      <div className="banner-custom-pagination absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" />

      {/* Scoped Styles for Swiper Pagination Bullets */}
      <style jsx>{`
        :global(.banner-bullet) {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.45);
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-block;
        }
        @media (min-width: 640px) {
          :global(.banner-bullet) {
            width: 10px;
            height: 10px;
          }
        }
        :global(.banner-bullet-active) {
          width: 24px;
          background: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
        }
        @media (min-width: 640px) {
          :global(.banner-bullet-active) {
            width: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;