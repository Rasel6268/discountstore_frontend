"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaWhatsapp,
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaArrowLeft,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name, phone number, and message.");
      return;
    }

    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent. We will contact you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/40 via-white to-gray-50 py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-amber-600 transition font-medium"
          >
            <FaArrowLeft size={12} /> Back to Home
          </Link>
          <span className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-semibold border border-amber-200">
            24/7 Customer Help & Support
          </span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-3 tracking-tight">
            We’d Love to Hear From You
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Have questions about an order, custom leather products, or bulk purchases? Reach out to us through any channel below or visit our factory outlet in Dhaka.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {/* Card 1: WhatsApp Chat */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs hover:shadow-md transition text-center flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
                <FaWhatsapp />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">WhatsApp Chat</h3>
              <p className="text-xs text-gray-500 mb-3">Instant answers for queries, orders & photos</p>
              <p className="font-mono text-sm font-bold text-emerald-700 mb-4">+880 1628-159291</p>
            </div>
            <a
              href="https://wa.me/8801628159291"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FaWhatsapp size={14} /> Start WhatsApp Chat
            </a>
          </div>

          {/* Card 2: Phone Hotline */}
          <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-xs hover:shadow-md transition text-center flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl shadow-xs">
                <FaPhoneAlt />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Call Helpline</h3>
              <p className="text-xs text-gray-500 mb-3">Available Sat - Thu: 9 AM to 10 PM</p>
              <p className="font-mono text-sm font-bold text-amber-800 mb-4">+880 1628-159291</p>
            </div>
            <a
              href="tel:+8801628159291"
              className="w-full py-2.5 px-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FaPhoneAlt size={12} /> Call Now
            </a>
          </div>

          {/* Card 3: Email Support */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-xs hover:shadow-md transition text-center flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl shadow-xs">
                <FaEnvelope />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Email Inquiries</h3>
              <p className="text-xs text-gray-500 mb-3">For order tracking, feedback & corporate deals</p>
              <p className="text-xs font-bold text-blue-700 truncate mb-4" title="Nurhossain122@gmail.com">
                Nurhossain122@gmail.com
              </p>
            </div>
            <a
              href="mailto:Nurhossain122@gmail.com"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FaEnvelope size={12} /> Send Email
            </a>
          </div>

          {/* Card 4: Facebook Page */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-xs hover:shadow-md transition text-center flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
                <FaFacebook />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Facebook Community</h3>
              <p className="text-xs text-gray-500 mb-3">Join our community, reviews & live updates</p>
              <p className="text-xs font-bold text-indigo-700 mb-4">Official Facebook Page</p>
            </div>
            <a
              href="https://www.facebook.com/profile.php?id=61574698905110"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FaFacebook size={14} /> Visit Facebook
            </a>
          </div>
        </div>

        {/* Main Grid: Form + Address / Office Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Fill out the form below and our customer care team will respond within a few hours.
            </p>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
                <FaCheckCircle className="text-emerald-600 text-xl shrink-0" />
                <div>
                  <p className="font-bold">Message sent successfully!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Our team will contact you shortly on your provided phone number or email.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Nur Hossain"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 01628159291"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. yourname@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Inquiry Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="e.g. Order Tracking / Product Details"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href="https://wa.me/8801628159291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1.5"
                >
                  <FaWhatsapp className="text-base text-emerald-600" /> Prefer WhatsApp? Click to message directly
                </a>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <FaPaperPlane size={12} /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Location & Outlet Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-amber-600" />
                Physical Factory & Outlet Address
              </h3>

              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-gray-800 mb-4 space-y-1 leading-relaxed">
                <p className="font-bold text-amber-950 text-base">Discount Store BD</p>
                <p className="font-semibold text-gray-900">
                  Madina Tannery, Tin Mazar, Tannery Mor
                </p>
                <p className="text-gray-600">Hazaribagh, Dhaka, Bangladesh</p>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <FaClock className="text-amber-600 text-sm mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-gray-800 block">Operating Hours</strong>
                    <span>Saturday – Thursday: 9:00 AM – 10:00 PM</span>
                    <br />
                    <span>Friday: 2:00 PM – 10:00 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FaTruck className="text-amber-600 text-sm mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-gray-800 block">Nationwide Delivery</strong>
                    <span>Cash on Delivery available all across Bangladesh (Dhaka ৳60 / Outside Dhaka ৳130)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FaShieldAlt className="text-amber-600 text-sm mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-gray-800 block">Customer Guarantee</strong>
                    <span>30-day hassle-free replacement and inspection before final payment</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout Banner */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <a
                  href="https://wa.me/8801628159291"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <FaWhatsapp size={16} /> Chat on WhatsApp for Fast Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
