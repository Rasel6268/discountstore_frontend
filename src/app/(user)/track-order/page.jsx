"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaPrint,
  FaWhatsapp,
  FaArrowLeft,
  FaShieldAlt,
  FaInfoCircle,
  FaEdit,
  FaReceipt,
} from "react-icons/fa";
import { GiLeatherBoot } from "react-icons/gi";
import toast from "react-hot-toast";
import { orderAPI } from "@/config/api";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", desc: "Order received in our system" },
  { key: "confirmed", label: "Confirmed", desc: "Verified and approved by store" },
  { key: "processing", label: "Processing", desc: "Packed and ready for dispatch" },
  { key: "shipped", label: "In Transit", desc: "Handed over to courier partner" },
  { key: "delivered", label: "Delivered", desc: "Package delivered to customer" },
];

const getStepIndex = (status) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
};

const getStatusBadge = (status) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-500 text-white" };
    case "shipped":
      return { label: "In Transit / Shipped", bg: "bg-blue-600 text-white" };
    case "processing":
      return { label: "Processing & Packed", bg: "bg-purple-600 text-white" };
    case "confirmed":
      return { label: "Order Confirmed", bg: "bg-amber-600 text-white" };
    case "cancelled":
      return { label: "Order Cancelled", bg: "bg-red-600 text-white" };
    case "refunded":
      return { label: "Refunded", bg: "bg-gray-600 text-white" };
    default:
      return { label: "Order Placed (Pending)", bg: "bg-amber-500 text-white" };
  }
};

const TrackOrderContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlOrderId = searchParams.get("orderId") || "";
  const [orderIdInput, setOrderIdInput] = useState(urlOrderId);
  const [phoneInput, setPhoneInput] = useState("");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cancellation and Change states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [changeForm, setChangeForm] = useState({
    name: "",
    phone: "",
    shippingArea: "dhaka",
    addressLine1: "",
    addressLine2: "",
    city: "",
    area: "",
    postCode: "",
    notes: "",
  });

  const isBeforeProcessing = (status) => {
    return status === "pending" || status === "confirmed";
  };

  const handleOpenCancelModal = () => {
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const orderId = order.orderId || order._id;
      const res = await orderAPI.cancel(
        orderId,
        cancelReason.trim() || "Cancelled by customer before processing"
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Order cancelled successfully");
        setCancelModalOpen(false);
        setOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
        }));
      } else {
        toast.error(res.data?.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenChangeModal = () => {
    if (!order) return;
    setChangeForm({
      name: order.shippingAddress?.fullName || order.shippingAddress?.name || "",
      phone: order.shippingAddress?.phone || "",
      shippingArea:
        order.shippingArea || (order.shippingCost === 70 || order.shippingCost === 60 ? "dhaka" : "outside_dhaka"),
      addressLine1: order.shippingAddress?.addressLine1 || "",
      addressLine2: order.shippingAddress?.addressLine2 || "",
      city: order.shippingAddress?.city || "",
      area: order.shippingAddress?.area || "",
      postCode: order.shippingAddress?.postCode || "",
      notes: order.notes || "",
    });
    setChangeModalOpen(true);
  };

  const handleConfirmChange = async (e) => {
    e.preventDefault();
    if (!order) return;
    if (
      !changeForm.name.trim() ||
      !changeForm.phone.trim() ||
      !changeForm.addressLine1.trim()
    ) {
      toast.error("Name, phone, and delivery address are required.");
      return;
    }
    setIsChanging(true);
    try {
      const orderId = order.orderId || order._id;
      const res = await orderAPI.change(orderId, changeForm);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Order delivery details updated successfully"
        );
        setChangeModalOpen(false);
        setOrder(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to update order");
      }
    } catch (err) {
      console.error("Change order error:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setIsChanging(false);
    }
  };

  const fetchTracking = async (id, phone) => {
    if (!id || !id.trim()) {
      toast.error("Please enter an Order ID");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await orderAPI.track(id.trim(), phone ? phone.trim() : undefined);
      if (res.data?.success && res.data?.data) {
        setOrder(res.data.data);
        // Sync URL query without reloading
        router.replace(`/track-order?orderId=${encodeURIComponent(id.trim())}`, { scroll: false });
      } else {
        setErrorMsg(res.data?.message || "Order not found");
        setOrder(null);
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      const msg = err.response?.data?.message || "Order could not be found with this ID.";
      setErrorMsg(msg);
      setOrder(null);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderId) {
      fetchTracking(urlOrderId);
    }
  }, [urlOrderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderIdInput, phoneInput);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Tracking number copied!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const activeStep = order ? getStepIndex(order.orderStatus) : 0;
  const isCancelled = order?.orderStatus === "cancelled";
  const isRefunded = order?.orderStatus === "refunded";

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/50 via-white to-gray-50 py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition font-medium"
          >
            <FaArrowLeft size={13} />
            Back to Home
          </Link>
          <span className="text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-semibold border border-amber-200">
            Discount Store Official Tracking
          </span>
        </div>

        {/* Hero Card with Search Input */}
        <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-10">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md mb-3">
              <FaTruck />
              Shipment Status Lookup
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Track Your Package
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mt-2 mb-8">
              Check real-time delivery status, courier tracking details, and estimated arrival date for your order.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-2">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    placeholder="Enter Order ID (e.g. ORD-2611151234)"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-md"
                  />
                </div>
                <div className="relative flex-1">
                  <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Phone (Optional)"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 shadow-md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold text-sm rounded-xl transition duration-300 shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch size={13} />
                      <span>Track</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 pl-1">
                You can find your Order ID on your receipt or SMS confirmation.
              </p>
            </form>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <FaTimesCircle className="text-red-500 text-3xl mx-auto mb-2" />
            <h3 className="font-bold text-red-900 text-base">Order Not Found</h3>
            <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{errorMsg}</p>
            <p className="text-xs text-gray-500 mt-3">
              Need assistance? Call our support helpline at <a href="tel:+8801700000000" className="text-amber-700 font-semibold underline">+880 1700-000000</a>
            </p>
          </div>
        )}

        {/* Tracking Details View */}
        {order && (
          <div id="tracking-print-area" className="space-y-8 animate-fadeIn">
            {/* Order Status Banner */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      Order #{order.orderId}
                    </h2>
                    {(() => {
                      const badge = getStatusBadge(order.orderStatus);
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.bg} shadow-xs`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <FaCalendarAlt size={12} className="text-gray-400" />
                    Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                  {isBeforeProcessing(order.orderStatus) && (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenChangeModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <FaEdit size={12} />
                        Change Details
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenCancelModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <FaTimesCircle size={12} />
                        Cancel Order
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <FaPrint size={13} className="text-amber-600" />
                    Print Details
                  </button>
                </div>
              </div>

              {/* Pre-Processing Modification & Cancellation Action Banner */}
              {isBeforeProcessing(order.orderStatus) && (
                <div className="my-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                      <FaClock className="text-amber-600" />
                      <span>Order Status: {order.orderStatus.toUpperCase()} (Awaiting Fulfillment)</span>
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Need to update your delivery address or cancel this order? Changes are permitted before fulfillment processing begins.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenChangeModal}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FaEdit size={12} /> Change Details
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenCancelModal}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FaTimesCircle size={12} /> Cancel Order
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Stepper */}
              {!isCancelled && !isRefunded ? (
                <div className="py-8 sm:py-10">
                  <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-5 left-10 right-10 h-1 bg-gray-200 -z-0 hidden md:block">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(0, Math.min(100, (activeStep / (STATUS_STEPS.length - 1)) * 100))}%`,
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx < activeStep;
                        const isCurrent = idx === activeStep;

                        return (
                          <div key={step.key} className="flex md:flex-col items-center gap-4 md:text-center">
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-sm transition-all ${
                                isCompleted
                                  ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                  : isCurrent
                                  ? "bg-white border-amber-600 text-amber-600 ring-4 ring-amber-100 shadow-md scale-105"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                            >
                              {isCompleted ? <FaCheck size={14} /> : idx + 1}
                            </div>
                            <div>
                              <h4
                                className={`text-xs md:text-sm font-bold ${
                                  isCurrent
                                    ? "text-amber-800"
                                    : isCompleted
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </h4>
                              <p className="text-[11px] text-gray-500 mt-0.5 max-w-[130px] mx-auto hidden md:block">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 my-4 bg-red-50 border border-red-200 rounded-2xl px-6 flex items-center gap-4">
                  <FaTimesCircle className="text-red-500 text-3xl shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-900 text-base">
                      {isCancelled ? "Order Cancelled" : "Order Refunded"}
                    </h3>
                    <p className="text-xs text-red-700 mt-1">
                      This order has been {order.orderStatus}. For questions or to request a re-order, please contact
                      our support desk.
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery and Courier Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
                    <FaClock size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Estimated Delivery
                    </span>
                    <p className="font-bold text-sm text-gray-900 mt-0.5">
                      {order.estimatedDeliveryDate
                        ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : order.shippingArea === "dhaka"
                        ? "2 - 3 Days (Inside Dhaka)"
                        : "3 - 5 Days (Outside Dhaka)"}
                    </p>
                    <span className="text-[11px] text-gray-500">Standard Delivery</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/70 flex items-start gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
                    <FaTruck size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                      Courier Partner
                    </span>
                    <p className="font-bold text-sm text-gray-900 mt-0.5 truncate">
                      {order.trackingInfo?.courier || "Assigned Upon Dispatch"}
                    </p>
                    {order.trackingInfo?.trackingNumber ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-mono text-xs text-gray-700">
                          {order.trackingInfo.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.trackingInfo.trackingNumber)}
                          className="text-gray-400 hover:text-blue-600 p-0.5"
                          title="Copy tracking ID"
                        >
                          {hasCopied ? <FaCheck size={11} className="text-emerald-600" /> : <FaCopy size={11} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-500">Tracking code will be updated once shipped</span>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70 flex items-start gap-3 sm:col-span-2 lg:col-span-1">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                    <FaShieldAlt size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Payment Status
                    </span>
                    <p className="font-bold text-sm text-gray-900 mt-0.5 uppercase">
                      {order.payment?.method || "Cash On Delivery"}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        order.payment?.status === "completed"
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      {order.payment?.status === "completed" ? "Paid" : "Due on Delivery"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Courier Tracking Link Button */}
              {order.trackingInfo?.trackingUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <a
                    href={order.trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <span>Track on {order.trackingInfo.courier || "Courier"} Website</span>
                    <FaExternalLinkAlt size={11} />
                  </a>
                </div>
              )}
            </div>

            {/* Grid: Order Items & Delivery/Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items Card (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaBoxOpen className="text-amber-600" />
                  Order Items ({order.items?.length || 0})
                </h3>

                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => {
                    const itemImg =
                      item.image ||
                      item.productId?.images?.[0]?.variants?.thumbnail ||
                      item.productId?.images?.[0]?.url ||
                      item.productId?.images?.[0] ||
                      "/placeholder.png";

                    return (
                      <div key={idx} className="py-4 flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            {item.size?.name && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] font-medium text-gray-700">
                                Size: {item.size.name}
                              </span>
                            )}
                            {item.color?.name && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[11px] font-medium text-gray-700">
                                Color: {item.color.name}
                              </span>
                            )}
                            <span className="text-gray-600 font-semibold">Qty: {item.quantity}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            SKU: {item.sku || "N/A"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-sm sm:text-base text-gray-900">
                            ৳{item.totalPrice?.toLocaleString() || (item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Timeline History */}
                {order.statusTimeline && order.statusTimeline.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaClock className="text-amber-600" />
                      Detailed Timeline Logs
                    </h4>
                    <div className="space-y-3">
                      {order.statusTimeline.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                            {idx !== order.statusTimeline.length - 1 && (
                              <div className="w-0.5 grow bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase tracking-wider text-gray-800">
                                {item.status}
                              </span>
                              <span className="text-gray-400 text-[11px]">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {item.note && <p className="text-gray-600 mt-0.5">{item.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Address & Payment Summary */}
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-amber-600" />
                    Delivery Destination
                  </h3>
                  <div className="space-y-2 text-xs text-gray-700">
                    <p className="font-bold text-sm text-gray-900">
                      {order.shippingAddress?.fullName || order.user?.name || "Recipient"}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <FaPhoneAlt size={10} className="text-gray-400" />
                      {order.shippingAddress?.phone || order.user?.phone || "N/A"}
                    </p>
                    <p className="pt-2 border-t border-gray-100 text-gray-600 leading-relaxed">
                      {order.shippingAddress?.addressLine1}
                      {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                      <br />
                      {order.shippingAddress?.area && `${order.shippingAddress.area}, `}
                      {order.shippingAddress?.city}
                      {order.shippingAddress?.postCode && ` - ${order.shippingAddress.postCode}`}
                    </p>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FaReceipt className="text-amber-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal ({order.items?.length || 1} items)</span>
                      <span className="font-semibold text-gray-900">৳{order.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee ({order.shippingArea === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                      <span className="font-semibold text-gray-900">৳{order.shippingCost?.toLocaleString()}</span>
                    </div>
                    {order.tax > 0 && (
                      <div className="flex justify-between">
                        <span>VAT (5%)</span>
                        <span className="font-semibold text-gray-900">৳{order.tax?.toLocaleString()}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount Savings</span>
                        <span>-৳{order.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline text-sm font-black text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-amber-600 text-lg">৳{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Support Hotline Box */}
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-3xl border border-amber-200 p-6">
                  <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <FaInfoCircle className="text-amber-600" />
                    Need Help With Delivery?
                  </h4>
                  <p className="text-xs text-amber-900/80 mt-1 mb-4">
                    Our customer care team is available 24/7 to resolve any delivery queries.
                  </p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://wa.me/8801700000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <FaWhatsapp size={15} />
                      Chat on WhatsApp
                    </a>
                    <a
                      href="tel:+8801700000000"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <FaPhoneAlt size={11} />
                      Call Helpline
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {cancelModalOpen && order && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleUp">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <FaTimesCircle className="text-3xl shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                  <p className="text-xs text-gray-500">Order ID: {order.orderId}</p>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700">
                <p className="font-semibold">⚠️ Are you sure you want to cancel this order?</p>
                <p className="mt-1">
                  Cancellation is only permitted before order processing begins. Once cancelled, reserved product inventory will be restored.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Cancellation (Optional)
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-red-400 focus:outline-hidden"
                >
                  <option value="">Select a reason...</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered wrong product/variant">Ordered wrong product/variant</option>
                  <option value="Want to change shipping address">Want to change shipping address</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Other">Other</option>
                </select>
                {cancelReason === "Other" && (
                  <textarea
                    rows={2}
                    placeholder="Please specify reason..."
                    value={cancelReason === "Other" ? "" : cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                  }}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Order Details Modal */}
        {changeModalOpen && order && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaEdit className="text-amber-600" /> Modify Order Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Order #{order.orderId} (Status: {order.orderStatus?.toUpperCase()})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChangeModalOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmChange} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-semibold">ℹ️ Editing before processing:</p>
                  <p className="mt-0.5">
                    You can change your delivery recipient, address, delivery area, and notes. Delivery fee adjusts automatically (Dhaka: ৳70 / Outside Dhaka: ৳130).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={changeForm.name}
                      onChange={(e) => setChangeForm({ ...changeForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={changeForm.phone}
                      onChange={(e) => setChangeForm({ ...changeForm, phone: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shipping Region / Area <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                        changeForm.shippingArea === "dhaka"
                          ? "border-amber-600 bg-amber-50 font-bold text-amber-900"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingArea"
                        value="dhaka"
                        checked={changeForm.shippingArea === "dhaka"}
                        onChange={() => setChangeForm({ ...changeForm, shippingArea: "dhaka" })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Inside Dhaka (৳70)</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer ${
                        changeForm.shippingArea === "outside_dhaka"
                          ? "border-amber-600 bg-amber-50 font-bold text-amber-900"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingArea"
                        value="outside_dhaka"
                        checked={changeForm.shippingArea === "outside_dhaka"}
                        onChange={() =>
                          setChangeForm({ ...changeForm, shippingArea: "outside_dhaka" })
                        }
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>Outside Dhaka (৳130)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Address (Line 1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House, Road, Area, Ward..."
                    value={changeForm.addressLine1}
                    onChange={(e) =>
                      setChangeForm({ ...changeForm, addressLine1: e.target.value })
                    }
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      value={changeForm.city}
                      onChange={(e) => setChangeForm({ ...changeForm, city: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Thana / Sub-district
                    </label>
                    <input
                      type="text"
                      value={changeForm.area}
                      onChange={(e) => setChangeForm({ ...changeForm, area: e.target.value })}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={changeForm.postCode}
                      onChange={(e) =>
                        setChangeForm({ ...changeForm, postCode: e.target.value })
                      }
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Special Delivery Instructions / Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Call before delivery, leave with guard..."
                    value={changeForm.notes}
                    onChange={(e) => setChangeForm({ ...changeForm, notes: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setChangeModalOpen(false);
                    }}
                    disabled={isChanging}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChanging}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isChanging ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
