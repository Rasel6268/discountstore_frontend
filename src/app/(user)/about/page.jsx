import React from "react";
import Link from "next/link";
import {
  FaGem,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaShoppingBag,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaWhatsapp,
  FaAward,
  FaCheck,
} from "react-icons/fa";
import { GiLeatherBoot } from "react-icons/gi";

export const metadata = {
  title: "About Us | Discount Store BD",
  description:
    "Learn about Discount Store BD - Premium genuine leather goods and lifestyle essentials crafted with excellence in Hazaribagh, Dhaka.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/30 via-white to-gray-50 py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
            Our Story & Craftsmanship
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">
            Style Meets Affordability
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Welcome to <strong>Discount Store BD</strong>. Based in the historic leather hub of Hazaribagh, Dhaka, we are dedicated to providing authentic 100% genuine leather goods, stylish footwear, textured bifold wallets, and contemporary lifestyle products directly from craftsmen to your doorstep.
          </p>
        </div>

        {/* Brand Mission & Story Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
                Hazaribagh Leather Heritage
              </span>
              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                Crafted at Madina Tannery, Dhaka
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Our workshop is located at <strong>Madina Tannery, Tin Mazar, Tannery Mor, Hazaribagh, Dhaka</strong>. We eliminate expensive middlemen by producing and curating genuine full-grain leather accessories directly, allowing us to pass massive savings on to our customers without compromising on craftsmanship.
              </p>
              <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 shrink-0" /> 100% Authentic Genuine Leather Products
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 shrink-0" /> Durable stitching, premium hardware & long-lasting finishes
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 shrink-0" /> Transparent pricing in Bangladeshi Taka (৳ BDT)
                </li>
                <li className="flex items-center gap-2">
                  <FaCheck className="text-emerald-600 shrink-0" /> Direct customer assistance via WhatsApp and Phone
                </li>
              </ul>
            </div>

            <div className="bg-linear-to-br from-amber-600 to-amber-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between h-full min-h-[260px]">
              <div>
                <FaAward className="text-amber-300 text-4xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Direct From The Artisans</h3>
                <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                  "Every wallet, jacket, and accessory tells a story of quality and dedication. We believe luxury shouldn't cost a fortune."
                </p>
              </div>
              <div className="pt-4 border-t border-amber-500/50 mt-4 flex items-center justify-between text-xs">
                <span>Management: <strong>Nur Hossain</strong></span>
                <span className="bg-white/20 px-2.5 py-1 rounded-full font-semibold">Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl">
              <FaGem />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Quality Assured</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Every item in our catalog undergoes rigorous inspection so you receive durable, authentic goods.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl">
              <FaShippingFast />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Nationwide Fast Delivery</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Reliable delivery across all 64 districts (Inside Dhaka ৳60 / Outside Dhaka ৳130) with real-time parcel tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-5 text-2xl">
              <FaShieldAlt />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cash on Delivery & Easy Inspection</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Pay with cash upon package receipt or pay digitally with complete customer satisfaction guaranteed.
            </p>
          </div>
        </div>

        {/* Direct Contact & Social Connect */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 mb-16 shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Connect With Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <a
              href="https://wa.me/8801628159291"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition flex items-center gap-3"
            >
              <FaWhatsapp className="text-emerald-600 text-2xl shrink-0" />
              <div>
                <span className="font-bold text-emerald-950 block">WhatsApp Chat</span>
                <span className="text-emerald-700 font-mono">+8801628159291</span>
              </div>
            </a>

            <a
              href="tel:+8801628159291"
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition flex items-center gap-3"
            >
              <FaPhoneAlt className="text-amber-600 text-xl shrink-0" />
              <div>
                <span className="font-bold text-amber-950 block">Customer Helpline</span>
                <span className="text-amber-800 font-mono">+8801628159291</span>
              </div>
            </a>

            <a
              href="mailto:Nurhossain122@gmail.com"
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition flex items-center gap-3"
            >
              <FaEnvelope className="text-blue-600 text-xl shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-blue-950 block">Official Email</span>
                <span className="text-blue-700 truncate block">Nurhossain122@gmail.com</span>
              </div>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61574698905110"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition flex items-center gap-3"
            >
              <FaFacebook className="text-indigo-600 text-2xl shrink-0" />
              <div>
                <span className="font-bold text-indigo-950 block">Facebook Page</span>
                <span className="text-indigo-700">Discount Store BD</span>
              </div>
            </a>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-linear-to-r from-amber-600 to-amber-700 text-white rounded-3xl p-8 md:p-12 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Explore Premium Leather & Fashion
          </h2>
          <p className="text-amber-100 max-w-xl mx-auto mb-8 text-xs sm:text-sm">
            Experience handcrafted excellence made right here in Bangladesh. Browse wallets, accessories, and apparel.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-amber-700 font-bold rounded-xl shadow-md hover:bg-amber-50 transition transform hover:-translate-y-0.5 text-xs sm:text-sm"
            >
              <FaShoppingBag /> Browse Collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 bg-amber-800/60 hover:bg-amber-800 text-white font-bold rounded-xl border border-amber-400/40 transition text-xs sm:text-sm"
            >
              Contact Us Directly →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
