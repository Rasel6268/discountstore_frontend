"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaLock,
  FaTruck,
  FaMoneyBillWave,
  FaCreditCard,
  FaMapMarkerAlt,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaShieldAlt,
  FaMale,
  FaFemale,
  FaVenusMars,
  FaChild,
  FaPalette,
  FaTag,
  FaSpinner,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { GiHandBag } from "react-icons/gi";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/AuthProvider/AuthProvider";
import api from "@/config/api";

const CheckoutPage = () => {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // Coupon states
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const isSSLActive = false;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    area: "",
    postCode: "",
    country: "Bangladesh",
    shippingArea: "dhaka",
    paymentMethod: "cod",
    notes: "",
    saveAddress: false,
    addressName: "",
  });

  const [errors, setErrors] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Load coupon from localStorage (passed from cart page)
  useEffect(() => {
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      const coupon = JSON.parse(savedCoupon);
      setAppliedCoupon(coupon);
      setCouponDiscount(coupon.discount);
      // Clear it after loading
      localStorage.removeItem("appliedCoupon");
    }
  }, []);

  // Calculate totals with coupon
  const subtotal = items.reduce((sum, item) => {
    const sizeExtra = item.size?.extraPrice || 0;
    const itemTotal = (item.price + sizeExtra) * item.quantity;
    return sum + itemTotal;
  }, 0);

  const shippingCost = formData.shippingArea === "dhaka" ? 60 : 130;
  const tax = (subtotal - couponDiscount) * 0.05;
  const total = subtotal + shippingCost + tax - couponDiscount;

  const shippingMethods = {
    dhaka: {
      id: "dhaka",
      name: "Inside Dhaka",
      price: 60,
      days: "1-2 business days",
      description: "Delivery within Dhaka city",
      icon: FaLocationDot,
    },
    outside_dhaka: {
      id: "outside_dhaka",
      name: "Outside Dhaka",
      price: 130,
      days: "3-5 business days",
      description: "Delivery anywhere outside Dhaka",
      icon: FaTruck,
    },
  };

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
    const loadSavedAddresses = async () => {
      if (user?._id) {
        try {
          const response = await api.get("/addresses");
          if (response.data.success) {
            setSavedAddresses(response.data.data);
          }
        } catch (error) {
          console.error("Failed to load addresses:", error);
        }
      }
    };
    loadSavedAddresses();

    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const determineShippingArea = (city, area) => {
    const dhakaAreas = [
      "dhaka",
      "dhanmondi",
      "gulshan",
      "banani",
      "uttara",
      "mirpur",
      "mohammadpur",
      "motijheel",
      "paltan",
      "ramna",
      "shahbag",
      "tejgaon",
      "badda",
      "khilgaon",
      "shyamoli",
      "farmgate",
    ];

    const cityLower = city?.toLowerCase() || "";
    const areaLower = area?.toLowerCase() || "";

    if (
      cityLower === "dhaka" ||
      dhakaAreas.some((area) => areaLower.includes(area))
    ) {
      return "dhaka";
    }
    return "outside_dhaka";
  };

  const handleAddressSelect = (address) => {
    setSelectedAddressId(address._id);
    const shippingArea = determineShippingArea(address.city, address.area);

    setFormData((prev) => ({
      ...prev,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      area: address.area,
      postCode: address.postCode,
      country: address.country,
      shippingArea: address.shippingArea || shippingArea,
    }));
  };

  const handleCityChange = (city, area) => {
    const shippingArea = determineShippingArea(city, area);
    setFormData((prev) => ({
      ...prev,
      shippingArea,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "city" || name === "area") {
      const newFormData = { ...formData, [name]: value };
      handleCityChange(
        name === "city" ? value : formData.city,
        name === "area" ? value : formData.area,
      );
      setFormData(newFormData);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.addressLine1) newErrors.addressLine1 = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.area) newErrors.area = "Area/Thana is required";
    if (!formData.postCode) newErrors.postCode = "Post code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.shippingArea) {
      toast.error("Please select a shipping area");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    return true;
  };

  // Handle apply coupon
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
        setCouponDiscount(data.data.discount);
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
          data.message || `Coupon applied! You saved ৳${data.data.discount}`,
        );
        setCouponCode("");
        setShowCouponInput(false);
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const addNewAddress = async (addressData) => {
    try {
      const response = await api.post("/addresses", addressData);
      if (response.data.success) {
        setSavedAddresses([...savedAddresses, response.data.data]);
        setShowAddAddressModal(false);
        toast.success("Address saved successfully");
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Failed to save address");
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      setSavedAddresses(
        savedAddresses.filter((addr) => addr._id !== addressId),
      );
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setFormData((prev) => ({
          ...prev,
          addressLine1: "",
          addressLine2: "",
          city: "",
          area: "",
          postCode: "",
        }));
      }
      toast.success("Address deleted");
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address");
    }
  };
  

  // Mark coupon as used after order
  const markCouponAsUsed = async (orderId) => {
    
    if (appliedCoupon && user?._id) {
      try {
        const applyData = {
          code: appliedCoupon.code,
          userId: user._id,
          orderId,
          discountAmount: couponDiscount,
        };
        
        await api.post("/coupons/apply", applyData);
       
      } catch (error) {
        console.error("Failed to mark coupon as used:", error);
      }
    }
  };

  const handleCODOrder = async () => {
    setLoading(true);

    try {
      const orderItems = items.map((item) => {
        const sizeExtra = item.size?.extraPrice || 0;
        const itemTotalPrice = (item.price + sizeExtra) * item.quantity;

        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          sku: item.size?.sku || item.color?.sku || item.sku || null,
          size: item.size
            ? {
                name: item.size.name,
                type: item.size.type || "unisex",
                extraPrice: item.size.extraPrice || 0,
                sku: item.size.sku || null,
              }
            : null,
          color: item.color
            ? {
                _id: item.color._id,
                name: item.color.name,
                hexCode: item.color.hexCode || "#000000",
              }
            : null,
          totalPrice: itemTotalPrice,
        };
      });

      const orderData = {
        user: {
          userId: user?._id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guestInfo: !user?._id,
        },
        shippingAddress: {
          name: formData.name,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || "",
          city: formData.city,
          area: formData.area,
          postCode: formData.postCode,
          country: formData.country || "Bangladesh",
        },
        shippingArea: formData.shippingArea,
        shippingCost: shippingCost,
        items: orderItems,
        subtotal: subtotal,
        discount: couponDiscount,
        couponDiscount: couponDiscount,
        couponCode: appliedCoupon?.code || null,
        couponId: appliedCoupon?.couponId || null,
        tax: tax,
        total: total,
        payment: {
          method: "cod",
          status: "pending",
          amount: total,
        },
        notes: formData.notes || "",
        ipAddress: null,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : null,
      };

      const response = await api.post("/orders/cod", orderData);
      if (response.data.success) {
        // Mark coupon as used
        await markCouponAsUsed(response.data.data?._id);

        toast.success("Order placed successfully!");
        clearCart();
        // router.push(
        //   `/orders/order-confirmation?orderId=${response.data.orderId}`,
        // );
      } else {
        throw new Error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("COD Order error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const initiateSSLPayment = async () => {
    setLoading(true);

    try {
      const orderItems = items.map((item) => {
        const sizeExtra = item.size?.extraPrice || 0;
        const itemTotalPrice = (item.price + sizeExtra) * item.quantity;

        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          sku: item.size?.sku || item.color?.sku || item.sku || null,
          size: item.size
            ? {
                name: item.size.name,
                type: item.size.type || "unisex",
                extraPrice: item.size.extraPrice || 0,
                sku: item.size.sku || null,
              }
            : null,
          color: item.color
            ? {
                _id: item.color._id,
                name: item.color.name,
                hexCode: item.color.hexCode || "#000000",
              }
            : null,
          totalPrice: itemTotalPrice,
        };
      });

      const orderDataForBackend = {
        user: {
          userId: user?._id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guestInfo: !user?._id,
        },
        shippingAddress: {
          name: formData.name,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || "",
          city: formData.city,
          area: formData.area,
          postCode: formData.postCode,
          country: formData.country || "Bangladesh",
        },
        shippingArea: formData.shippingArea,
        shippingCost: shippingCost,
        items: orderItems,
        subtotal: subtotal,
        discount: couponDiscount,
        couponDiscount: couponDiscount,
        couponCode: appliedCoupon?.code || null,
        couponId: appliedCoupon?.couponId || null,
        tax: tax,
        total: total,
        payment: {
          method: "ssl",
          status: "pending",
          amount: total,
        },
        notes: formData.notes || "",
        ipAddress: null,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : null,
      };

      const sslData = {
        total_amount: total,
        currency: "BDT",
        tran_id: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        success_url: `${window.location.origin}/payment/success`,
        fail_url: `${window.location.origin}/payment/fail`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        ipn_url: `${window.location.origin}/api/payment/ipn`,
        shipping_method: formData.shippingArea === "dhaka" ? "YES" : "NO",
        product_name: "Fashion Products",
        product_category: "Fashion",
        product_profile: "general",
        cus_name: formData.name,
        cus_email: formData.email,
        cus_add1: formData.addressLine1,
        cus_add2: formData.addressLine2 || "",
        cus_city: formData.city,
        cus_state: formData.area,
        cus_postcode: formData.postCode,
        cus_country: formData.country,
        cus_phone: formData.phone,
        ship_name: formData.name,
        ship_add1: formData.addressLine1,
        ship_add2: formData.addressLine2 || "",
        ship_city: formData.city,
        ship_state: formData.area,
        ship_postcode: formData.postCode,
        ship_country: formData.country,
      };

      const payload = {
        orderData: orderDataForBackend,
        ...sslData,
      };

      const response = await api.post("/payment/ssl-init", payload);
      const data = response.data;

      if (data.success && data.redirectUrl) {
        // Store coupon info to mark as used after payment success
        if (appliedCoupon) {
          sessionStorage.setItem(
            "pendingCoupon",
            JSON.stringify({
              code: appliedCoupon.code,
              discount: couponDiscount,
              orderId: sslData.tran_id,
            }),
          );
        }
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("SSL Payment error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!validateStep3()) return;

    if (formData.paymentMethod === "ssl") {
      await initiateSSLPayment();
    } else {
      await handleCODOrder();
    }
  };

  const formatPriceBDT = (price) => {
    if (!price) return "৳0";
    return `৳${Math.round(price).toLocaleString("en-US")}`;
  };

  const AddressModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add New Address</h3>
          <button onClick={() => setShowAddAddressModal(false)}>
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            addNewAddress({
              name: form.addressName.value,
              addressLine1: form.addressLine1.value,
              addressLine2: form.addressLine2.value,
              city: form.city.value,
              area: form.area.value,
              postCode: form.postCode.value,
              country: form.country.value,
            });
          }}
        >
          <div className="space-y-3">
            <input
              name="addressName"
              placeholder="Address Name (e.g., Home, Office)"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              name="addressLine1"
              placeholder="Address Line 1"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              name="addressLine2"
              placeholder="Address Line 2 (Optional)"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="city"
                placeholder="City"
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                name="area"
                placeholder="Area/Thana"
                className="px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="postCode"
                placeholder="Post Code"
                className="px-3 py-2 border rounded-lg"
                required
              />
              <select
                name="country"
                className="px-3 py-2 border rounded-lg"
                required
              >
                <option value="Bangladesh">Bangladesh</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            {[
              { step: 1, name: "Shipping Info", icon: FaMapMarkerAlt },
              { step: 2, name: "Shipping Method", icon: FaTruck },
              { step: 3, name: "Payment", icon: FaCreditCard },
            ].map((s) => (
              <div key={s.step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      step >= s.step
                        ? "bg-amber-500 text-white shadow-lg"
                        : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {step > s.step ? <FaCheckCircle /> : s.step}
                  </div>
                  <p className="text-sm mt-2 font-medium hidden md:block">
                    {s.name}
                  </p>
                </div>
                {s.step < 3 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${step > s.step ? "bg-amber-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Shipping Information
                  </h2>

                  {user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        Welcome back, {user.name}! Your information has been
                        pre-filled.
                      </p>
                    </div>
                  )}

                  {savedAddresses.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Saved Addresses
                      </h3>
                      <div className="space-y-2">
                        {savedAddresses.map((address) => (
                          <div
                            key={address._id}
                            className={`flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition ${
                              selectedAddressId === address._id
                                ? "ring-2 ring-amber-500"
                                : ""
                            }`}
                            onClick={() => handleAddressSelect(address)}
                          >
                            <input
                              type="radio"
                              checked={selectedAddressId === address._id}
                              onChange={() => {}}
                              className="mt-1 text-amber-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{address.name}</p>
                              <p className="text-sm text-gray-600">
                                {address.addressLine1}, {address.area},{" "}
                                {address.city} - {address.postCode}
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                {address.shippingArea === "dhaka"
                                  ? "Inside Dhaka"
                                  : "Outside Dhaka"}
                              </p>
                              {address.isDefault && (
                                <span className="text-xs text-amber-600 ml-2">
                                  Default
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(address._id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowAddAddressModal(true)}
                        className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                      >
                        <FaPlus /> Add New Address
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+880 XXXXXXXXXX"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaMapMarkerAlt /> Shipping Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                            errors.addressLine1
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="House/Building number, Street name"
                        />
                        {errors.addressLine1 && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.addressLine1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                          placeholder="Apartment, floor, landmark"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                              errors.city ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="e.g., Dhaka, Chittagong"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area/Thana *
                          </label>
                          <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                              errors.area ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="e.g., Gulshan, Banani, Uttara"
                          />
                          {errors.area && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.area}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Post Code *
                          </label>
                          <input
                            type="text"
                            name="postCode"
                            value={formData.postCode}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-amber-500 ${
                              errors.postCode
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="e.g., 1213"
                          />
                          {errors.postCode && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.postCode}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                          </label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                          >
                            <option value="Bangladesh">Bangladesh</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-amber-500 rounded"
                      />
                      <div className="flex-1">
                        <label className="font-medium text-gray-700">
                          Save this address for future purchases
                        </label>
                        {formData.saveAddress && (
                          <input
                            type="text"
                            name="addressName"
                            placeholder="Address name (e.g., Home, Office)"
                            value={formData.addressName}
                            onChange={handleInputChange}
                            className="mt-2 w-full px-3 py-1 border rounded-md text-sm"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (validateStep1()) {
                          setStep(2);
                        }
                      }}
                      className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                    >
                      Continue to Shipping →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Select Shipping Area
                  </h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Based on your address:{" "}
                      <strong>
                        {formData.city}, {formData.area}
                      </strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Shipping cost is calculated based on delivery location
                    </p>
                  </div>

                  <div className="space-y-3">
                    {Object.values(shippingMethods).map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
                          formData.shippingArea === method.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shippingArea"
                            value={method.id}
                            checked={formData.shippingArea === method.id}
                            onChange={handleInputChange}
                            className="text-amber-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <method.icon className="text-amber-500" />
                              <p className="font-semibold text-gray-800">
                                {method.name}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {method.days}
                            </p>
                            <p className="text-xs text-gray-400">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-600">
                            ৳{method.price}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700">
                      📦 Estimated delivery time:{" "}
                      {formData.shippingArea === "dhaka"
                        ? "1-2 business days"
                        : "3-5 business days"}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (validateStep2()) {
                          setStep(3);
                        }
                      }}
                      className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Select Payment Method
                  </h2>

                  {/* Coupon Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <FaTag className="text-amber-500" />
                        <h3 className="font-semibold text-gray-800">
                          Apply Coupon
                        </h3>
                      </div>
                      {!showCouponInput && !appliedCoupon && (
                        <button
                          onClick={() => setShowCouponInput(true)}
                          className="text-sm text-amber-600 hover:text-amber-700"
                        >
                          Apply Coupon
                        </button>
                      )}
                    </div>

                    {appliedCoupon ? (
                      // Applied coupon display
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
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
                    ) : showCouponInput ? (
                      // Coupon input form
                      <div>
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
                            autoFocus
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={couponLoading || !couponCode}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {couponLoading ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                          <button
                            onClick={() => setShowCouponInput(false)}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Try: WELCOME20, FIRST50, NEWMEMBER25
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition ${
                        isSSLActive && formData.paymentMethod === "ssl"
                          ? "border-amber-500 bg-amber-50 shadow-md"
                          : "border-gray-200 hover:border-amber-300 bg-white"
                      } ${!isSSLActive ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="ssl"
                        checked={
                          isSSLActive && formData.paymentMethod === "ssl"
                        }
                        onChange={handleInputChange}
                        className="mt-1 text-amber-500"
                        disabled={!isSSLActive}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaShieldAlt className="text-2xl text-blue-600" />
                          <p className="font-bold text-gray-800 text-lg">
                            SSL Commerce
                          </p>
                          {!isSSLActive && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full ml-2">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {isSSLActive
                            ? "Pay with Credit/Debit Card, bKash, Nagad, Rocket, or Mobile Banking"
                            : "SSL Commerce payment gateway is coming soon. Stay tuned!"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Visa
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Mastercard
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            bKash
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Nagad
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Amex
                          </span>
                        </div>
                        <div
                          className={`mt-3 p-2 rounded ${isSSLActive ? "bg-blue-50" : "bg-gray-50"}`}
                        >
                          <p
                            className={`text-xs ${isSSLActive ? "text-blue-700" : "text-gray-500"}`}
                          >
                            {isSSLActive
                              ? "🔒 Secure payment gateway. All major payment methods accepted."
                              : "⏳ SSL Commerce integration in progress. Available soon!"}
                          </p>
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition ${
                        formData.paymentMethod === "cod"
                          ? "border-amber-500 bg-amber-50 shadow-md"
                          : "border-gray-200 hover:border-amber-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                        className="mt-1 text-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaMoneyBillWave className="text-2xl text-green-600" />
                          <p className="font-bold text-gray-800 text-lg">
                            Cash on Delivery
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          Pay with cash when your order is delivered
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>

                  <div className="flex justify-between gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={loading}
                      className="px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaLock /> Place Order ({formatPriceBDT(total)})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item, index) => {
                  const sizeExtra = item.size?.extraPrice || 0;
                  const itemTotalPrice =
                    (item.price + sizeExtra) * item.quantity;

                  return (
                    <div
                      key={`${item.productId}_${index}`}
                      className="flex gap-3"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-amber-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          <GiHandBag className="text-3xl text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">
                          {item.name}
                        </p>

                        {item.size && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <div className="flex items-center gap-0.5">
                              {getSizeTypeIcon(item.size.type)}
                              <span className="text-xs text-gray-500">
                                {getSizeTypeLabel(item.size.type)}
                              </span>
                            </div>
                            <span className="text-xs bg-amber-100 px-2 py-0.5 rounded-full text-amber-700 font-medium">
                              Size: {item.size.name}
                            </span>
                            {item.size.extraPrice > 0 && (
                              <span className="text-xs text-green-600">
                                +৳{item.size.extraPrice}
                              </span>
                            )}
                          </div>
                        )}

                        {item.color && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <div className="flex items-center gap-0.5">
                              <FaPalette className="text-pink-500 text-xs" />
                              <span className="text-xs text-gray-500">
                                Color:
                              </span>
                            </div>
                            <span className="text-xs bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 font-medium flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    item.color.hexCode || "#CCCCCC",
                                }}
                              />
                              {item.color.name}
                            </span>
                            {item.color.extraPrice > 0 && (
                              <span className="text-xs text-green-600">
                                +৳{item.color.extraPrice}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-amber-600">
                            {formatPriceBDT(itemTotalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPriceBDT(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPriceBDT(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>
                    Shipping (
                    {formData.shippingArea === "dhaka"
                      ? "Inside Dhaka"
                      : "Outside Dhaka"}
                    )
                  </span>
                  <span>{formatPriceBDT(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (5%)</span>
                  <span>{formatPriceBDT(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-amber-600">
                      {formatPriceBDT(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <FaCreditCard className="text-amber-500" />
                  Payment:{" "}
                  {formData.paymentMethod === "ssl"
                    ? "SSL Commerce"
                    : "Cash on Delivery"}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaTruck />
                  Shipping to:{" "}
                  {formData.shippingArea === "dhaka"
                    ? "Inside Dhaka"
                    : "Outside Dhaka"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddAddressModal && <AddressModal />}
    </div>
  );
};

export default CheckoutPage;
