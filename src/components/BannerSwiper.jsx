"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const BannerSlider = () => {
  const router = useRouter();

  const banners = [
    {
      id: 1,
      title: "Premium Leather Collection",
      subtitle: "Handcrafted Excellence",
      discount: "30% OFF",
      bgColor: "from-amber-800 to-amber-900",
      buttonText: "Shop Now",
      link: "/shop",
      image: "https://res.cloudinary.com/doumlnejx/image/upload/v1776515769/sassy-goodlooking-redhead-female-yellow-sweater-listen-music-white-headphones-touch-earphones_l6p8sp.jpg",
    },
    {
      id: 2,
      title: "Fusion Handbags",
      subtitle: "Modern Meets Tradition",
      discount: "25% OFF",
      bgColor: "from-amber-700 to-amber-800",
      buttonText: "Explore",
      link: "/shop",
      image: "https://res.cloudinary.com/doumlnejx/image/upload/v1776515770/tender-romantic-dreamy-redhead-woman-winter-hat-sweater-embrace-big-cute-red-heart-sign-as-sy_sljs7f.jpg",
    },
    {
      id: 3,
      title: "Eid Special Offer",
      subtitle: "Limited Time Deal",
      discount: "40% OFF",
      bgColor: "from-amber-900 to-amber-950",
      buttonText: "Grab Deal",
      link: "/shop",
      image: "https://res.cloudinary.com/doumlnejx/image/upload/v1776515770/tender-romantic-dreamy-redhead-woman-winter-hat-sweater-embrace-big-cute-red-heart-sign-as-sy_sljs7f.jpg",
    },
  ];

  
  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        loop={true}
        className="rounded-2xl overflow-hidden h-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className={`relative h-full min-h-100 md:min-h-125 bg-linear-to-br ${banner.bgColor} overflow-hidden cursor-pointer`}
              onClick={() => handleSlideClick(banner.link)}
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-70">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={banner.id === 1}
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-2xl"></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-amber-500/20 backdrop-blur text-amber-100 text-xs font-semibold rounded-full border border-amber-400/30 cursor-default">
                    Limited Edition
                  </span>
                </div>

                <h3 className="text-amber-200 text-sm md:text-base uppercase tracking-wider mb-2">
                  {banner.subtitle}
                </h3>

                <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  {banner.title}
                </h2>

                <div className="mb-4">
                  <span className="text-amber-300 text-3xl md:text-4xl font-bold">
                    {banner.discount}
                  </span>
                </div>

                <p className="text-amber-100 text-sm md:text-base mb-6 max-w-[80%]">
                  Handcrafted premium leather products with modern fusion designs.
                  Limited stock available.
                </p>
                {/* Offer Badge */}
                <div className="absolute bottom-4 right-4 bg-amber-500/20 backdrop-blur rounded-lg px-3 py-1.5 border border-amber-400/30 cursor-default">
                  <div className="flex items-center gap-2 text-amber-100 text-xs">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Limited Time Offer
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <style jsx>{`
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        :global(.swiper-button-next:after),
        :global(.swiper-button-prev:after) {
          font-size: 16px;
          font-weight: bold;
        }
        
        :global(.swiper-pagination-bullet) {
          background: white;
          opacity: 0.5;
          cursor: pointer;
        }
        
        :global(.swiper-pagination-bullet-active) {
          background: #f59e0b;
          opacity: 1;
        }
        
        :global(.swiper-pagination) {
          bottom: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default BannerSlider;