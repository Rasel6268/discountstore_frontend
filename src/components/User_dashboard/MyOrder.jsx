import { useQuery } from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import api, { orderAPI } from "@/config/api";
import { useAuth } from "@/AuthProvider/AuthProvider";
import {
  FaEye,
  FaBoxOpen,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaSearch,
  FaPrint,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import ProtectedRoute from "../ProtectedRoute";

const MyOrder = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?._id || user?.id;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cancellation and Change states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderToChange, setOrderToChange] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
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
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadCustomerPDF = async () => {
    const invoiceEl = document.getElementById("printable-order-modal");
    if (!invoiceEl) {
      window.print();
      return;
    }
    setIsDownloadingPDF(true);
    const toastId = toast.loading("Generating single-page invoice PDF...");
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById("printable-order-modal");
          if (!el) return;

          el.style.backgroundColor = "#ffffff";
          el.style.color = "#0f172a";

          const helperCanvas = clonedDoc.createElement("canvas");
          helperCanvas.width = 1;
          helperCanvas.height = 1;
          const ctx = helperCanvas.getContext("2d", { willReadFrequently: true });

          const toStandardRgb = (val, fallback) => {
            if (!val || typeof val !== "string") return fallback;
            if (
              val.startsWith("#") ||
              val.startsWith("rgb(") ||
              val.startsWith("rgba(") ||
              val === "transparent"
            ) {
              return val;
            }
            if (
              val.includes("oklab") ||
              val.includes("oklch") ||
              val.includes("lab(") ||
              val.includes("lch(") ||
              val.includes("color(") ||
              val.includes("color-mix(")
            ) {
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = val;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                if (a === 0) return fallback;
                return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
              } catch (_) {
                return fallback;
              }
            }
            return val;
          };

          const allElements = el.querySelectorAll("*");
          allElements.forEach((node) => {
            const computed = window.getComputedStyle(node);
            if (
              computed.backgroundColor &&
              (computed.backgroundColor.includes("okl") || computed.backgroundColor.includes("color("))
            ) {
              node.style.backgroundColor = toStandardRgb(computed.backgroundColor, "transparent");
            }
            if (
              computed.color &&
              (computed.color.includes("okl") || computed.color.includes("color("))
            ) {
              node.style.color = toStandardRgb(computed.color, "#0f172a");
            }
            if (
              computed.borderColor &&
              (computed.borderColor.includes("okl") || computed.borderColor.includes("color("))
            ) {
              node.style.borderColor = toStandardRgb(computed.borderColor, "#e2e8f0");
            }
          });
        },
      });

      // Strict single-page A4 scaling (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8; // 8mm margin

      const maxPrintWidth = pdfWidth - margin * 2; // 194 mm
      const maxPrintHeight = pdfHeight - margin * 2; // 281 mm

      const widthRatio = maxPrintWidth / canvas.width;
      const heightRatio = maxPrintHeight / canvas.height;
      const scale = Math.min(widthRatio, heightRatio);

      const printWidth = canvas.width * scale;
      const printHeight = canvas.height * scale;

      const xOffset = (pdfWidth - printWidth) / 2;
      const yOffset = (pdfHeight - printHeight) / 2;

      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      pdf.addImage(imgData, "JPEG", xOffset, yOffset, printWidth, printHeight, undefined, "FAST");

      pdf.save(`Invoice-${selectedOrder?.orderId || "ORDER"}.pdf`);
      toast.success("Single-page Invoice PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Opening print dialog...", { id: toastId });
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Fetch my orders
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myOrders", userId, user?.email],
    queryFn: async () => {
      const endpoint = userId ? `/orders/myorder/${userId}` : `/orders/myorder`;
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!userId || !!user,
  });

  const isBeforeProcessing = (order) => {
    return order?.orderStatus === "pending" || order?.orderStatus === "confirmed";
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setSelectedReason("");
    setCustomReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    const finalReason =
      selectedReason === "Other"
        ? customReason.trim() || "Customer requested cancellation"
        : selectedReason.trim() || "Cancelled by customer before processing";

    try {
      const orderIdentifier = orderToCancel.orderId || orderToCancel._id;
      const res = await orderAPI.cancel(orderIdentifier, finalReason);
      if (res.data?.success) {
        toast.success(res.data.message || "Order cancelled successfully");
        setCancelModalOpen(false);
        setOrderToCancel(null);
        if (
          selectedOrder &&
          (selectedOrder.orderId === orderIdentifier || selectedOrder._id === orderIdentifier)
        ) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: "cancelled" }));
        }
        refetch();
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

  const handleOpenChangeModal = (order) => {
    setOrderToChange(order);
    setChangeForm({
      name:
        order.shippingAddress?.fullName ||
        order.shippingAddress?.name ||
        user?.name ||
        "",
      phone:
        order.shippingAddress?.phone ||
        order.user?.phone ||
        user?.phone ||
        "",
      shippingArea:
        order.shippingArea || (order.shippingCost === 60 ? "dhaka" : "outside_dhaka"),
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
    if (!orderToChange) return;
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
      const orderIdentifier = orderToChange.orderId || orderToChange._id;
      const res = await orderAPI.change(orderIdentifier, changeForm);
      if (res.data?.success) {
        toast.success(
          res.data.message || "Order delivery details updated successfully"
        );
        setChangeModalOpen(false);
        setOrderToChange(null);
        if (
          selectedOrder &&
          (selectedOrder.orderId === orderIdentifier || selectedOrder._id === orderIdentifier)
        ) {
          setSelectedOrder(res.data.data);
        }
        refetch();
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

  // Format price in BDT (Taka)
  const formatPriceBDT = (price) => {
    if (!price && price !== 0) return "৳0";
    return `৳${Math.round(price).toLocaleString()}`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-amber-100 text-amber-800 border-amber-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "confirmed":
        return <FaClock className="text-amber-500" />;
      case "processing":
        return <FaBoxOpen className="text-blue-500" />;
      case "shipped":
        return <FaTruck className="text-purple-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBoxOpen className="text-gray-500" />;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    return status === "paid" || status === "completed"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getItemImage = (item) => {
    if (item.image) return item.image;
    const pImgs = item.productId?.images;
    if (Array.isArray(pImgs) && pImgs.length > 0) {
      if (typeof pImgs[0] === "string") return pImgs[0];
      return pImgs[0]?.variants?.thumbnail || pImgs[0]?.url || "/placeholder.png";
    }
    return "/placeholder.png";
  };

  const allOrders = useMemo(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData;
    if (Array.isArray(ordersData?.data)) return ordersData.data;
    if (Array.isArray(ordersData?.orders)) return ordersData.orders;
    if (ordersData?.data?.orders && Array.isArray(ordersData.data.orders)) {
      return ordersData.data.orders;
    }
    return [];
  }, [ordersData]);

  // Filtered orders based on status tab and search query
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (!order) return false;
      const orderStatus = (order.orderStatus || "pending").toLowerCase();
      if (statusFilter !== "all" && orderStatus !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesId = (order.orderId || "").toLowerCase().includes(query);
        const matchesProduct = (order.items || []).some((item) =>
          (item?.name || "").toLowerCase().includes(query)
        );
        const matchesPhone = (order.shippingAddress?.phone || order.user?.phone || "").includes(query);
        return matchesId || matchesProduct || matchesPhone;
      }
      return true;
    });
  }, [allOrders, statusFilter, searchQuery]);

  // Pagination logic
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / itemsPerPage) || 1;
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Comprehensive statistics
  const stats = useMemo(() => {
    return {
      total: allOrders.length,
      pending: allOrders.filter((o) => o.orderStatus === "pending").length,
      confirmed: allOrders.filter((o) => o.orderStatus === "confirmed").length,
      processing: allOrders.filter((o) => o.orderStatus === "processing").length,
      shipped: allOrders.filter((o) => o.orderStatus === "shipped").length,
      delivered: allOrders.filter((o) => o.orderStatus === "delivered").length,
      cancelled: allOrders.filter((o) => o.orderStatus === "cancelled").length,
      totalSpent: allOrders
        .filter((o) => !["cancelled", "refunded"].includes(o.orderStatus))
        .reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }, [allOrders]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center p-8 bg-white rounded-xl shadow-md">
          <p className="text-lg text-red-500 font-semibold mb-3">
            Please login to view your orders
          </p>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition inline-block"
          >
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] flex-col p-4">
        <FaTimesCircle className="text-4xl text-red-500 mb-2" />
        <p className="text-base text-red-600 font-semibold mb-1">Error loading orders</p>
        <p className="text-xs text-gray-500 mb-4">{error?.message || "Please try again."}</p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-semibold transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />

        {/* Global Print Styling */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-order-modal,
            #printable-order-modal * {
              visibility: visible;
            }
            #printable-order-modal {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              height: auto;
              max-height: none;
              box-shadow: none !important;
              border: none !important;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              Review order history, live tracking, and request modifications or cancellations before dispatch.
            </p>
          </div>
          <Link
            href="/shop"
            className="self-start sm:self-auto px-4 py-2 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            + Continue Shopping
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
            <span className="text-xs text-gray-500 font-medium">Total Orders</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xs border border-amber-100 p-4">
            <span className="text-xs text-amber-700 font-medium">Pending & Confirmed</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats.pending + stats.confirmed}
            </div>
            <span className="text-[10px] text-gray-400">Modifiable before processing</span>
          </div>
          <div className="bg-white rounded-2xl shadow-xs border border-green-100 p-4">
            <span className="text-xs text-green-700 font-medium">Delivered Orders</span>
            <div className="text-2xl font-black text-green-600 mt-1">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4">
            <span className="text-xs text-gray-500 font-medium">Total Completed Spending</span>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {formatPriceBDT(stats.totalSpent)}
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {[
            { id: "all", label: "All Orders", count: stats.total },
            { id: "pending", label: "Pending", count: stats.pending },
            { id: "confirmed", label: "Confirmed", count: stats.confirmed },
            { id: "processing", label: "Processing", count: stats.processing },
            { id: "shipped", label: "Shipped", count: stats.shipped },
            { id: "delivered", label: "Delivered", count: stats.delivered },
            { id: "cancelled", label: "Cancelled", count: stats.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-amber-800/40 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Items Per Page Bar */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by Order ID, item name, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            <span>
              Showing {totalOrders === 0 ? 0 : indexOfFirstOrder + 1} -{" "}
              {Math.min(indexOfLastOrder, totalOrders)} of {totalOrders}
            </span>
          </div>
        </div>

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <FaBoxOpen className="text-5xl text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700 mb-1">
              {searchQuery || statusFilter !== "all"
                ? "No Orders Found Matching Filter"
                : "No Orders Placed Yet"}
            </h3>
            <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try clearing your search term or switching to another order status filter tab."
                : "Explore our latest catalogue and grab exclusive discount deals today."}
            </p>
            {searchQuery || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <Link
                href="/shop"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition inline-block"
              >
                Start Shopping Now
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentOrders.map((order) => {
                const canModify = isBeforeProcessing(order);

                return (
                  <div
                    key={order._id || order.orderId}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition duration-200"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Order ID</p>
                        <p className="font-mono font-bold text-gray-900 text-sm">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Placed on</p>
                        <p className="font-medium text-xs text-gray-800">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Amount</p>
                        <p className="font-extrabold text-sm sm:text-base text-amber-700">
                          {formatPriceBDT(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getStatusIcon(order.orderStatus)}
                          <span
                            className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${getStatusColor(order.orderStatus)}`}
                          >
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Payment</p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${getPaymentStatusColor(order.payment?.status)}`}
                        >
                          {order.payment?.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/track-order?orderId=${order.orderId}`}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <FaTruck size={12} /> Track
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-semibold transition shadow-xs cursor-pointer"
                        >
                          <FaEye size={12} /> Details
                        </button>
                        {canModify && (
                          <>
                            <button
                              onClick={() => handleOpenChangeModal(order)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              title="Modify delivery recipient or address before processing"
                            >
                              <FaEdit size={12} /> Change
                            </button>
                            <button
                              onClick={() => handleOpenCancelModal(order)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              title="Cancel order before processing begins"
                            >
                              <FaTimesCircle size={12} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pre-Processing Notification Ribbon */}
                    {canModify && (
                      <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
                        <span className="flex items-center gap-1.5">
                          <FaClock className="text-amber-600" />
                          <span>
                            Order is <strong>{order.orderStatus}</strong>. You may update recipient/address or cancel before processing.
                          </span>
                        </span>
                        <span className="hidden sm:inline text-[11px] text-amber-700 font-semibold">
                          Fulfillment Pending
                        </span>
                      </div>
                    )}

                    {/* Order Items Preview */}
                    <div className="p-4">
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                        {order.items?.map((item, idx) => {
                          const itemImg = getItemImage(item);

                          return (
                            <div
                              key={item._id || idx}
                              className="flex items-center gap-3 border border-gray-100 bg-gray-50/50 rounded-xl p-2.5 min-w-[220px]"
                            >
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg shrink-0 border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/placeholder.png";
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                                  <span>Qty: {item.quantity}</span>
                                  {item.size?.name && (
                                    <span className="px-1.5 py-0.2 bg-gray-200/70 rounded text-[10px]">
                                      {item.size.name}
                                    </span>
                                  )}
                                  {item.color?.name && (
                                    <span className="px-1.5 py-0.2 bg-gray-200/70 rounded text-[10px]">
                                      {item.color.name}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-extrabold text-gray-900 mt-0.5">
                                  {formatPriceBDT(item.totalPrice || item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && goToPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        currentPage === page
                          ? "bg-amber-600 text-white shadow-xs"
                          : page === "..."
                          ? "bg-transparent cursor-default"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}

            <div className="mt-3 text-center text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              id="printable-order-modal"
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative animate-scaleUp"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">Order Invoice & Details</h2>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${getStatusColor(selectedOrder.orderStatus)}`}
                    >
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">
                    Order ID: #{selectedOrder.orderId} • Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-lg cursor-pointer no-print"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Pre-Processing Modification Notice */}
                {isBeforeProcessing(selectedOrder) && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs no-print">
                    <div>
                      <p className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <FaClock className="text-amber-600" />
                        <span>Order is awaiting processing ({selectedOrder.orderStatus.toUpperCase()})</span>
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        You can update delivery address/phone or cancel this order before fulfillment begins.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenChangeModal(selectedOrder)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FaEdit size={12} /> Change Details
                      </button>
                      <button
                        onClick={() => handleOpenCancelModal(selectedOrder)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FaTimesCircle size={12} /> Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {/* Tracking Link Bar */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <FaTruck className="text-amber-600 text-sm" />
                    <span>
                      Track status: <strong>{selectedOrder.orderStatus.toUpperCase()}</strong>
                      {selectedOrder.shippingArea && ` (${selectedOrder.shippingArea === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"})`}
                    </span>
                  </div>
                  <Link
                    href={`/track-order?orderId=${selectedOrder.orderId}`}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 no-print"
                  >
                    Open Live Tracker →
                  </Link>
                </div>

                {/* Shipping & Payment Destination Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700">
                    <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-amber-600" />
                      Delivery Destination
                    </h4>
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedOrder.shippingAddress?.fullName ||
                        selectedOrder.shippingAddress?.name ||
                        selectedOrder.user?.name ||
                        "Customer Recipient"}
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-600 mt-1">
                      <FaPhoneAlt size={10} className="text-gray-400" />
                      {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "N/A"}
                    </p>
                    <p className="mt-2 text-gray-600 leading-relaxed">
                      {selectedOrder.shippingAddress?.addressLine1}
                      {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                      <br />
                      {selectedOrder.shippingAddress?.area && `${selectedOrder.shippingAddress.area}, `}
                      {selectedOrder.shippingAddress?.city}
                      {selectedOrder.shippingAddress?.postCode && ` - ${selectedOrder.shippingAddress.postCode}`}
                    </p>
                    {selectedOrder.notes && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-[11px] text-gray-600">
                        <strong>Delivery Instructions:</strong> {selectedOrder.notes}
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700">
                    <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
                      <FaReceipt className="text-amber-600" />
                      Payment Summary
                    </h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method:</span>
                        <span className="font-bold uppercase text-gray-800">
                          {selectedOrder.payment?.method || "Cash On Delivery"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getPaymentStatusColor(selectedOrder.payment?.status)}`}
                        >
                          {selectedOrder.payment?.status || "Pending"}
                        </span>
                      </div>
                      {selectedOrder.payment?.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Txn ID:</span>
                          <span className="font-mono text-gray-800">{selectedOrder.payment.transactionId}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                        <span>Invoice Amount:</span>
                        <span className="text-amber-700">{formatPriceBDT(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-3">
                    Purchased Items ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                    {selectedOrder.items?.map((item, index) => {
                      const itemImg = getItemImage(item);

                      return (
                        <div key={item._id || index} className="p-3.5 flex items-center gap-4 bg-white">
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{item.name}</h5>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {item.size?.name && (
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-700">
                                  Size: {item.size.name}
                                </span>
                              )}
                              {item.color?.name && (
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-700">
                                  Color: {item.color.name}
                                </span>
                              )}
                              <span>Qty: {item.quantity}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Rate: {formatPriceBDT(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-gray-900">
                              {formatPriceBDT(item.totalPrice || item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Calculation Breakdown */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-w-sm ml-auto space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium text-gray-800">{formatPriceBDT(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span className="font-medium text-gray-800">{formatPriceBDT(selectedOrder.shippingCost)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>VAT / Tax:</span>
                      <span className="font-medium text-gray-800">{formatPriceBDT(selectedOrder.tax)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount:</span>
                      <span>-{formatPriceBDT(selectedOrder.discount)}</span>
                    </div>
                  )}
                  {selectedOrder.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Coupon Discount:</span>
                      <span>-{formatPriceBDT(selectedOrder.couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                    <span>Grand Total:</span>
                    <span className="text-amber-700">{formatPriceBDT(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Timeline History */}
                {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-3">Order Status History</h4>
                    <div className="space-y-2.5">
                      {selectedOrder.statusTimeline.map((timeline, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                        >
                          <div className="mt-0.5">{getStatusIcon(timeline.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase text-gray-900">{timeline.status}</span>
                              <span className="text-[11px] text-gray-400">
                                {new Date(timeline.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {timeline.note && <p className="text-gray-600 mt-0.5">{timeline.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 sm:p-6 flex flex-wrap gap-2 justify-end items-center no-print">
                {isBeforeProcessing(selectedOrder) && (
                  <div className="mr-auto flex gap-2">
                    <button
                      onClick={() => handleOpenChangeModal(selectedOrder)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FaEdit size={12} /> Change Details
                    </button>
                    <button
                      onClick={() => handleOpenCancelModal(selectedOrder)}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FaTimesCircle size={12} /> Cancel Order
                    </button>
                  </div>
                )}
                <button
                  onClick={handleDownloadCustomerPDF}
                  disabled={isDownloadingPDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isDownloadingPDF ? (
                    <>
                      <FaSpinner className="animate-spin" size={12} /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FaDownload size={12} /> Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FaPrint size={12} /> Print Invoice
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {cancelModalOpen && orderToCancel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleUp">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <FaTimesCircle className="text-3xl shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                  <p className="text-xs text-gray-500 font-mono">Order #{orderToCancel.orderId}</p>
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
                  Reason for Cancellation
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-red-400 focus:outline-hidden"
                >
                  <option value="">Select a reason...</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered wrong product/variant">Ordered wrong product/variant</option>
                  <option value="Want to change shipping address">Want to change shipping address</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
                {selectedReason === "Other" && (
                  <textarea
                    rows={2}
                    placeholder="Please specify why you are cancelling..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOpen(false);
                    setOrderToCancel(null);
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
        {changeModalOpen && orderToChange && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaEdit className="text-amber-600" /> Modify Order Details
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Order #{orderToChange.orderId} (Status: {orderToChange.orderStatus?.toUpperCase()})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChangeModalOpen(false);
                    setOrderToChange(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmChange} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-semibold">ℹ️ Modifying before fulfillment begins:</p>
                  <p className="mt-0.5">
                    You can adjust recipient, contact number, delivery area, street address, and instructions.
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

                {/* Live Cost Estimate Preview */}
                {(() => {
                  const originalCost = orderToChange.shippingCost || 60;
                  const newCost = changeForm.shippingArea === "dhaka" ? 60 : 130;
                  const diff = newCost - originalCost;
                  const estimatedTotal = (orderToChange.total || 0) + diff;

                  return (
                    <div className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <span className="text-gray-600">Updated Delivery Total:</span>
                      <span className="font-bold text-amber-700">
                        {formatPriceBDT(estimatedTotal)}
                        {diff !== 0 && (
                          <span className="text-[11px] font-normal text-gray-500 ml-1">
                            ({diff > 0 ? `+৳${diff}` : `-৳${Math.abs(diff)}`} shipping adjustment)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })()}

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
                      setOrderToChange(null);
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
    </ProtectedRoute>
  );
};

export default MyOrder;
