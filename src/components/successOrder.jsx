// app/order-confirmation/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaClipboardList,
  FaPrint,
  FaEnvelope,
  FaWhatsapp,
  FaHome,
  FaShoppingBag,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaMoneyBillWave,
  FaCreditCard,
  FaCalendarAlt,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { GiHandBag } from "react-icons/gi";
import Link from "next/link";
import api from "@/config/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

const OrderConfirmationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);


  // Helper function to get size type icon
  const getSizeTypeIcon = (type) => {
    if (!type) return "👤";
    switch (type) {
      case "men":
        return "👨";
      case "women":
        return "👩";
      case "kids":
        return "🧒";
      default:
        return "👤";
    }
  };

  // Helper function to get size type label
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
  console.log(order);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/track/${orderId}`);
        console.log("API Response:", response);
        
        if(response.data.success) {
            setOrder(response.data.data);
            const orderDate = new Date(response.data.data.createdAt);
            const shippingDays = response.data.data.shippingArea === "dhaka" ? 2 : 5;
            const estimatedDate = new Date(orderDate);
            estimatedDate.setDate(orderDate.getDate() + shippingDays);
            setEstimatedDelivery(estimatedDate);
        }

       
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Could not load order details. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-100",
      processing: "text-blue-600 bg-blue-100",
      confirmed: "text-indigo-600 bg-indigo-100",
      shipped: "text-purple-600 bg-purple-100",
      delivered: "text-green-600 bg-green-100",
      cancelled: "text-red-600 bg-red-100",
      refunded: "text-orange-600 bg-orange-100",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      processing: "Processing",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    return status === "paid" 
      ? "text-green-600 bg-green-100" 
      : "text-yellow-600 bg-yellow-100";
  };

  const getPaymentMethodLabel = (method) => {
    return method === "cod" ? "Cash on Delivery" : "SSL Commerce (Online Payment)";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <FaBoxOpen className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 mb-6">{error || "Unable to find your order."}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Go Home
              </Link>
              <Link
                href="/shop"
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order Info Card */}
        <div id="order-confirmation-content" className="space-y-6">
          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaClipboardList className="text-amber-500" />
                  Order Details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Order ID: {order.orderId || order.orderNumber || order._id}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <Link
                  href={`/track-order?orderId=${order.orderId || order._id}`}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <FaTruck />
                  Track Order
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  <FaPrint />
                  Print Receipt
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-800 flex items-center gap-2 mt-1">
                  <FaCalendarAlt className="text-amber-500" size={14} />
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(order.orderStatus)}`}>
                  {getStatusLabel(order.orderStatus)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-800 flex items-center gap-2 mt-1">
                  {order.payment?.method === "cod" ? (
                    <FaMoneyBillWave className="text-green-500" />
                  ) : (
                    <FaCreditCard className="text-blue-500" />
                  )}
                  {getPaymentMethodLabel(order.payment?.method)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPaymentStatusColor(order.payment?.status)}`}>
                  {order.payment?.status === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShoppingBag className="text-amber-500" />
              Items Ordered
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-amber-100 rounded-lg flex items-center justify-center">
                      <GiHandBag className="text-3xl text-amber-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        {item.size && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm">
                              {getSizeTypeIcon(item.size.type)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getSizeTypeLabel(item.size.type)}
                            </span>
                            <span className="text-sm bg-amber-100 px-2 py-0.5 rounded-full text-amber-700 font-medium">
                              Size: {item.size.name}
                            </span>
                            {item.size.extraPrice > 0 && (
                              <span className="text-sm text-green-600">
                                +{formatPrice(item.size.extraPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="font-semibold text-amber-600">
                          {formatPrice(item.totalPrice || item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaUser className="text-amber-500" />
                Customer Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Name:</strong> {order.user?.name || order.shippingAddress?.name}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {order.user?.email}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <FaPhone className="text-amber-500" size={14} />
                  <strong>Phone:</strong> {order.user?.phone}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaMapMarkerAlt className="text-amber-500" />
                Shipping Address
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  {order.shippingAddress?.addressLine1}
                  {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress?.area}, {order.shippingAddress?.city}
                </p>
                <p className="text-gray-700">
                  {order.shippingAddress?.postCode}, {order.shippingAddress?.country}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaTruck className="text-amber-500" />
                    <strong>Shipping Area:</strong>{" "}
                    {order.shippingArea === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                  </p>
                  {estimatedDelivery && (
                    <p className="text-sm text-green-600 flex items-center gap-2 mt-1">
                      <FaCheckCircle />
                      <strong>Estimated Delivery:</strong> {estimatedDelivery.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({order.items.length} items)</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Cost</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (5%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-amber-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Order Notes:</strong> {order.notes}
                </p>
              </div>
            )}
          </div>

      
        </div>
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #order-confirmation-content,
            #order-confirmation-content * {
              visibility: visible;
            }
            #order-confirmation-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
            }
            button,
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;