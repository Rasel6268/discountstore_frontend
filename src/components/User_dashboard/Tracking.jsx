"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { orderAPI } from "@/config/api";
import { useAuth } from "@/AuthProvider/AuthProvider";
import {
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaReceipt,
  FaUndo,
  FaEdit,
} from "react-icons/fa";
import { GiHandBag } from "react-icons/gi";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", desc: "We have received your order." },
  { key: "confirmed", label: "Confirmed", desc: "Your order has been verified." },
  { key: "processing", label: "Processing", desc: "Items packed and prepared for dispatch." },
  { key: "shipped", label: "In Transit", desc: "Dispatched with courier partner." },
  { key: "delivered", label: "Delivered", desc: "Package successfully delivered." },
];

const getStepIndex = (status) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
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
    case "cancelled":
    case "refunded":
      return -1;
    default:
      return 0;
  }
};

const getStatusBadge = (status) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "delivered":
      return { label: "Delivered", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "shipped":
      return { label: "On The Way", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    case "processing":
      return { label: "Processing", bg: "bg-purple-100 text-purple-800 border-purple-200" };
    case "confirmed":
      return { label: "Confirmed", bg: "bg-amber-100 text-amber-800 border-amber-200" };
    case "cancelled":
      return { label: "Cancelled", bg: "bg-red-100 text-red-800 border-red-200" };
    case "refunded":
      return { label: "Refunded", bg: "bg-gray-100 text-gray-800 border-gray-200" };
    default:
      return { label: "Pending", bg: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  }
};

const Tracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

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

  // Fetch logged-in user's recent orders for quick 1-click tracking
  const { data: userOrders = [], isLoading: loadingUserOrders } = useQuery({
    queryKey: ["trackingUserOrders", user?._id, user?.email],
    queryFn: async () => {
      if (!user?._id && !user) return [];
      const res = await api.get(user?._id ? `/orders/myorder/${user._id}` : `/orders/myorder`);
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.orders)) return payload.orders;
      return [];
    },
    enabled: !!user?._id || !!user,
  });

  // Automatically track the latest active order if none selected
  useEffect(() => {
    if (userOrders.length > 0 && !trackedOrder && !searchInput) {
      const active =
        userOrders.find((o) => ["shipped", "processing", "confirmed", "pending"].includes(o.orderStatus)) ||
        userOrders[0];
      setTrackedOrder(active);
      setSearchInput(active.orderId);
    }
  }, [userOrders, trackedOrder, searchInput]);

  const handleTrackSubmit = async (e, overrideId = null) => {
    if (e) e.preventDefault();
    const idToTrack = (overrideId || searchInput || "").trim();

    if (!idToTrack) {
      toast.error("Please enter an Order ID to track.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await orderAPI.track(idToTrack, phoneInput.trim() || undefined);
      if (res.data?.success && res.data?.data) {
        setTrackedOrder(res.data.data);
        toast.success("Order details loaded!");
      } else {
        toast.error(res.data?.message || "Order not found");
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      const msg = err.response?.data?.message || "Could not locate order with the provided information.";
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Tracking number copied!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const isBeforeProcessing = (status) => {
    return status === "pending" || status === "confirmed";
  };

  const handleOpenCancelModal = () => {
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!trackedOrder) return;
    setIsCancelling(true);
    try {
      const orderId = trackedOrder.orderId || trackedOrder._id;
      const res = await orderAPI.cancel(
        orderId,
        cancelReason.trim() || "Cancelled by customer before processing"
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Order cancelled successfully");
        setCancelModalOpen(false);
        setTrackedOrder((prev) => ({
          ...prev,
          orderStatus: "cancelled",
        }));
        queryClient.invalidateQueries(["trackingUserOrders"]);
        queryClient.invalidateQueries(["myOrders"]);
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
    if (!trackedOrder) return;
    setChangeForm({
      name:
        trackedOrder.shippingAddress?.fullName ||
        trackedOrder.shippingAddress?.name ||
        user?.name ||
        "",
      phone: trackedOrder.shippingAddress?.phone || user?.phone || "",
      shippingArea:
        trackedOrder.shippingArea ||
        (trackedOrder.shippingCost === 60 ? "dhaka" : "outside_dhaka"),
      addressLine1: trackedOrder.shippingAddress?.addressLine1 || "",
      addressLine2: trackedOrder.shippingAddress?.addressLine2 || "",
      city: trackedOrder.shippingAddress?.city || "",
      area: trackedOrder.shippingAddress?.area || "",
      postCode: trackedOrder.shippingAddress?.postCode || "",
      notes: trackedOrder.notes || "",
    });
    setChangeModalOpen(true);
  };

  const handleConfirmChange = async (e) => {
    e.preventDefault();
    if (!trackedOrder) return;
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
      const orderId = trackedOrder.orderId || trackedOrder._id;
      const res = await orderAPI.change(orderId, changeForm);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Order delivery details updated successfully"
        );
        setChangeModalOpen(false);
        setTrackedOrder(res.data.data);
        queryClient.invalidateQueries(["trackingUserOrders"]);
        queryClient.invalidateQueries(["myOrders"]);
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

  const activeStep = trackedOrder ? getStepIndex(trackedOrder.orderStatus) : 0;
  const isCancelled = trackedOrder?.orderStatus === "cancelled";
  const isRefunded = trackedOrder?.orderStatus === "refunded";

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Search Bar Section */}
      <div className="bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-3">
            <FaTruck className="text-amber-200" />
            Live Shipment Tracking
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Track Your Order In Real-Time
          </h2>
          <p className="text-amber-100 text-sm mt-1 mb-6">
            Enter your Order ID (from order confirmation or SMS) to monitor package movement.
          </p>

          <form onSubmit={(e) => handleTrackSubmit(e)} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order ID (e.g. ORD-2611151234)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-7 py-3 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FaSearch size={14} />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Quick Order Selector for Logged-In Users */}
      {userOrders.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FaBoxOpen className="text-amber-600" />
              Your Recent Orders ({userOrders.length})
            </h3>
            <span className="text-xs text-gray-500">Click to track directly</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {userOrders.map((ord) => {
              const isSelected = trackedOrder?.orderId === ord.orderId;
              const badge = getStatusBadge(ord.orderStatus);
              return (
                <button
                  key={ord._id || ord.orderId}
                  type="button"
                  onClick={() => {
                    setTrackedOrder(ord);
                    setSearchInput(ord.orderId);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/80 shadow-xs"
                      : "border-gray-200 hover:border-amber-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">{ord.orderId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 1} item(s)
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracked Order Details Card */}
      {trackedOrder ? (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    Order #{trackedOrder.orderId}
                  </h3>
                  {(() => {
                    const badge = getStatusBadge(trackedOrder.orderStatus);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <FaCalendarAlt size={12} className="text-gray-400" />
                  Placed on {new Date(trackedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Courier info / Tracking URL */}
              {trackedOrder.trackingInfo?.trackingNumber && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  <div>
                    <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider block">
                      {trackedOrder.trackingInfo.courier || "Courier"} Tracking
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-900">
                      {trackedOrder.trackingInfo.trackingNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(trackedOrder.trackingInfo.trackingNumber)}
                    className="p-1.5 hover:bg-amber-100 text-amber-700 rounded-lg transition"
                    title="Copy tracking number"
                  >
                    {hasCopied ? <FaCheck size={13} className="text-emerald-600" /> : <FaCopy size={13} />}
                  </button>
                  {trackedOrder.trackingInfo.trackingUrl && (
                    <a
                      href={trackedOrder.trackingInfo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                      title="View on courier site"
                    >
                      <FaExternalLinkAlt size={12} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Pre-Processing Modification & Cancellation Action Banner */}
            {isBeforeProcessing(trackedOrder.orderStatus) && (
              <div className="my-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <FaClock className="text-amber-600" />
                    <span>Order Status: {trackedOrder.orderStatus.toUpperCase()} (Awaiting Fulfillment)</span>
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

            {/* Stepper Visualizer */}
            {!isCancelled && !isRefunded ? (
              <div className="py-8">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-gray-200 -z-0 hidden md:block">
                    <div
                      className="h-full bg-amber-500 transition-all duration-700 ease-out"
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
                        <div key={step.key} className="flex md:flex-col items-center gap-3 md:text-center">
                          {/* Circle Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                              isCompleted
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                : isCurrent
                                ? "bg-white border-amber-600 text-amber-600 ring-4 ring-amber-100"
                                : "bg-white border-gray-300 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <FaCheck size={14} />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>

                          {/* Label & Description */}
                          <div>
                            <h4
                              className={`text-xs md:text-sm font-bold ${
                                isCurrent
                                  ? "text-amber-700"
                                  : isCompleted
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </h4>
                            <p className="text-[11px] text-gray-500 hidden md:block mt-0.5 max-w-[130px] mx-auto">
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
              <div className="py-6 my-4 bg-red-50 border border-red-200 rounded-xl px-5 flex items-center gap-3">
                <FaTimesCircle className="text-red-500 text-2xl shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">
                    {isCancelled ? "Order Cancelled" : "Order Refunded"}
                  </h4>
                  <p className="text-xs text-red-700 mt-0.5">
                    This order has been {trackedOrder.orderStatus}. If you have any inquiries, please contact our
                    support team.
                  </p>
                </div>
              </div>
            )}

            {/* Estimated Delivery Banner */}
            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <FaClock className="text-amber-600 text-base" />
                <span>
                  <strong>Estimated Delivery:</strong>{" "}
                  {trackedOrder.estimatedDeliveryDate
                    ? new Date(trackedOrder.estimatedDeliveryDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : trackedOrder.shippingArea === "dhaka"
                    ? "2 - 3 Business Days (Dhaka)"
                    : "3 - 5 Business Days (Outside Dhaka)"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-amber-600" />
                <span>
                  Shipping to: {trackedOrder.shippingAddress?.city || "Customer Address"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          {trackedOrder.statusTimeline && trackedOrder.statusTimeline.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaClock className="text-amber-600" />
                Tracking Timeline Activity
              </h3>
              <div className="space-y-4">
                {trackedOrder.statusTimeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5" />
                      {idx !== trackedOrder.statusTimeline.length - 1 && (
                        <div className="w-0.5 grow bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                          {item.status}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.note && <p className="text-xs text-gray-600 mt-0.5">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBoxOpen className="text-amber-600" />
              Items in this Shipment ({trackedOrder.items?.length || 0})
            </h3>

            <div className="divide-y divide-gray-100">
              {trackedOrder.items?.map((item, idx) => {
                const itemImg = item.image || item.productId?.images?.[0]?.url || item.productId?.images?.[0] || "/placeholder.png";

                return (
                  <div key={idx} className="py-3 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
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
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        {item.size?.name && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                            Size: {item.size.name}
                          </span>
                        )}
                        {item.color?.name && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                            Color: {item.color.name}
                          </span>
                        )}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-gray-900">
                        ৳{item.totalPrice?.toLocaleString() || (item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
          <FaTruck className="text-gray-300 text-5xl mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">No Order Selected</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Enter your Order ID in the search box above or select one of your recent orders to inspect its live status.
          </p>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && trackedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FaTimesCircle className="text-3xl shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                <p className="text-xs text-gray-500">Order ID: {trackedOrder.orderId}</p>
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
      {changeModalOpen && trackedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaEdit className="text-amber-600" /> Modify Order Details
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{trackedOrder.orderId} (Status: {trackedOrder.orderStatus?.toUpperCase()})
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
                  You can change your delivery recipient, address, delivery area, and notes. Delivery fee adjusts automatically (Dhaka: ৳60 / Outside Dhaka: ৳130).
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
                    <span>Inside Dhaka (৳60)</span>
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
  );
};

export default Tracking;