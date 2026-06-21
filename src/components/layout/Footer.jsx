"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from "react-icons/md";
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset } from "react-icons/fa";
import { FaGem, FaLeaf, FaGift } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Best Sellers", href: "/shop?filter=bestseller" },
    { name: "Discount Offers", href: "/shop?filter=discount" },
    { name: "Contact Us", href: "/contact" },
  ];

  const customerService = [
    { name: "FAQs", href: "/faqs" },
    { name: "Shipping Policy", href: "/shipping-policy" },
    { name: "Return & Exchange", href: "/return-policy" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Track Order", href: "/track-order" },
  ];

  const categories = [
    { name: "Leather Bags", count: 24 },
    { name: "Fusion Handbags", count: 18 },
    { name: "Men's Wallets", count: 12 },
    { name: "Leather Jackets", count: 15 },
    { name: "Belts & Accessories", count: 20 },
    { name: "Shoe Collection", count: 10 },
  ];

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-900 to-amber-900 text-white">
      {/* Main Footer */}
      <div className="w-11/12 mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dlaeg7qjm/image/upload/q_auto/f_auto/v1781946003/ChatGPT_Image_Jun_20_2026_02_38_14_PM_sqijgu.png"
                alt="Discount Store"
                className="h-15 w-auto object-contain"
                style={{ maxHeight: "60px" }}
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Premium leather and fusion products crafted with excellence.
              Bringing you the finest quality since 2024.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300 group"
              >
                <FaFacebookF className="text-gray-400 text-sm group-hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300 group"
              >
                <FaTwitter className="text-gray-400 text-sm group-hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300 group"
              >
                <FaInstagram className="text-gray-400 text-sm group-hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300 group"
              >
                <FaLinkedinIn className="text-gray-400 text-sm group-hover:text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors duration-300 group"
              >
                <FaYoutube className="text-gray-400 text-sm group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500 mt-1"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Customer Service
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500 mt-1"></span>
            </h3>
            <ul className="space-y-3">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative inline-block">
              Get In Touch
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500 mt-1"></span>
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <MdLocationOn className="text-amber-400 text-lg mt-0.5" />
                <p className="text-gray-400 text-sm">
                  123 Leather Street, Fashion District, Dhaka, Bangladesh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-amber-400 text-lg" />
                <p className="text-gray-400 text-sm">+880 1234 567890</p>
              </div>
              <div className="flex items-center gap-3">
                <MdEmail className="text-amber-400 text-lg" />
                <p className="text-gray-400 text-sm">
                  support@discountStore.com
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MdAccessTime className="text-amber-400 text-lg" />
                <p className="text-gray-400 text-sm">Mon-Sat: 9AM - 8PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Row */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=${category.name}`}
                className="text-gray-400 hover:text-amber-400 text-sm transition flex items-center gap-1"
              >
                {category.name}
                <span className="text-amber-500 text-xs">
                  ({category.count})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="w-11/12 mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} DiscountStore. All rights reserved.
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">Secure Payments:</span>
              <div className="flex gap-2">
                <FaCcVisa className="text-gray-400 text-2xl hover:text-amber-400 transition" />
                <FaCcMastercard className="text-gray-400 text-2xl hover:text-amber-400 transition" />
                <FaCcAmex className="text-gray-400 text-2xl hover:text-amber-400 transition" />
                <FaCcPaypal className="text-gray-400 text-2xl hover:text-amber-400 transition" />
                <FaApplePay className="text-gray-400 text-2xl hover:text-amber-400 transition" />
                <FaGooglePay className="text-gray-400 text-2xl hover:text-amber-400 transition" />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FaGem className="text-amber-500 text-xs" />
                <span className="text-gray-500 text-xs">Premium Quality</span>
              </div>
              <div className="flex items-center gap-1">
                <FaLeaf className="text-amber-500 text-xs" />
                <span className="text-gray-500 text-xs">Eco-Friendly</span>
              </div>
              <div className="flex items-center gap-1">
                <FaGift className="text-amber-500 text-xs" />
                <span className="text-gray-500 text-xs">Gift Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
