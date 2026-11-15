"use client";
import React, { useState } from "react";
import {
  FaPrint,
  FaTimes,
  FaReceipt,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaBarcode,
  FaTruck,
  FaShieldAlt,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

/**
 * Converts a numerical BDT currency amount to formal English words
 * using standard Bangladeshi denominations (Crore, Lakh, Thousand, Hundred, Taka).
 */
function numberToWordsBDT(amount) {
  if (!amount || isNaN(amount)) return "Zero Taka Only";
  const num = Math.round(Number(amount));
  if (num === 0) return "Zero Taka Only";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertChunk(n) {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  }

  let words = "";
  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const remainder = rem;

  if (crore > 0) words += convertChunk(crore) + " Crore ";
  if (lakh > 0) words += convertChunk(lakh) + " Lakh ";
  if (thousand > 0) words += convertChunk(thousand) + " Thousand ";
  if (remainder > 0) words += convertChunk(remainder) + " ";

  return words.trim() + " Taka Only";
}

const OrderInvoiceModal = ({ order, isOpen, onClose }) => {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const invoiceElement = document.getElementById("admin-order-invoice");
    if (!invoiceElement) {
      toast.error("Invoice element not found");
      return;
    }

    setIsDownloadingPDF(true);
    const toastId = toast.loading("Generating single-page invoice PDF...");

    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

      // Render the invoice to high-resolution canvas with clean white background
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById("admin-order-invoice");
          if (!el) return;

          // Enforce crisp white background & dark text on cloned container
          el.style.backgroundColor = "#ffffff";
          el.style.color = "#0f172a";

          // Canvas helper to convert modern CSS color functions (oklab, oklch) to standard rgba
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

      // Strictly single-page A4 PDF sizing (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8; // 8mm neat page margin

      const maxPrintWidth = pdfWidth - margin * 2; // 194 mm
      const maxPrintHeight = pdfHeight - margin * 2; // 281 mm

      // Scale proportionally to fit within max printable boundaries (guaranteeing 1 page)
      const widthRatio = maxPrintWidth / canvas.width;
      const heightRatio = maxPrintHeight / canvas.height;
      const scale = Math.min(widthRatio, heightRatio);

      const printWidth = canvas.width * scale;
      const printHeight = canvas.height * scale;

      // Center horizontally and vertically within printable bounds
      const xOffset = (pdfWidth - printWidth) / 2;
      const yOffset = (pdfHeight - printHeight) / 2;

      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      pdf.addImage(imgData, "JPEG", xOffset, yOffset, printWidth, printHeight, undefined, "FAST");

      const fileName = `Invoice-${order.orderId || "DSB-ORDER"}.pdf`;
      pdf.save(fileName);

      toast.success("Single-page Invoice PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Direct PDF generation failed. Opening print dialog...", { id: toastId });
      window.print();
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const invoiceNumber = `INV-${order.orderId || (order._id ? order._id.slice(-8).toUpperCase() : "0000")}`;
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";
  const printDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const paymentStatus = (order.payment?.status || "pending").toLowerCase();
  const isPaid = paymentStatus === "paid" || paymentStatus === "completed";
  const paymentMethod = order.payment?.method || "Cash on Delivery (COD)";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Print-specific style tag for browser print dialog */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #admin-order-invoice,
          #admin-order-invoice * {
            visibility: visible;
          }
          #admin-order-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none">
        {/* Screen Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FaReceipt size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Invoice & Packing Slip: {order.orderId}
              </h2>
              <p className="text-[11px] text-slate-400">
                Official commercial tax invoice for customer dispatch & records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download 1-Page Invoice as PDF"
            >
              {isDownloadingPDF ? (
                <>
                  <FaSpinner className="animate-spin" size={13} /> Generating PDF...
                </>
              ) : (
                <>
                  <FaDownload size={13} /> Download PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Print directly via browser print dialog"
            >
              <FaPrint size={13} /> Print (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close modal"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-8 bg-gray-100 print:p-0 print:bg-white">
          <div
            id="admin-order-invoice"
            className="mx-auto rounded-xl print:rounded-none print:border-none print:shadow-none"
            style={{
              backgroundColor: "#ffffff",
              color: "#0f172a",
              borderColor: "#e2e8f0",
              borderWidth: "1px",
              borderStyle: "solid",
              maxWidth: "760px",
              width: "100%",
              padding: "28px 32px",
              boxSizing: "border-box",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Header: Company Profile & Invoice Meta */}
            <div
              className="flex flex-col sm:flex-row justify-between items-start gap-5 pb-5"
              style={{ borderBottom: "2px solid #0f172a" }}
            >
              {/* Company Profile */}
              <div>
                <div className="mb-2">
                  <h1
                    style={{
                      color: "#0f172a",
                      fontWeight: 900,
                      fontSize: "22px",
                      letterSpacing: "-0.5px",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    DISCOUNT STORE BD
                  </h1>
                  <p
                    style={{
                      color: "#b45309",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "2px 0 0 0",
                    }}
                  >
                    Premium Leather & Lifestyle Goods
                  </p>
                </div>

                <div style={{ color: "#475569", fontSize: "12px", lineHeight: "1.55" }}>
                  <p className="flex items-center gap-1.5" style={{ margin: "2px 0" }}>
                    <FaMapMarkerAlt size={10} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <span>Madina Tannery, Tin Mazar, Tannery Mor, Hazaribagh, Dhaka - 1209</span>
                  </p>
                  <p className="flex items-center gap-1.5" style={{ margin: "2px 0" }}>
                    <FaPhoneAlt size={10} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <span>Hotline: +880 1628-159291</span>
                  </p>
                  <p className="flex items-center gap-1.5" style={{ margin: "2px 0" }}>
                    <FaEnvelope size={10} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    <span>Email: Nurhossain122@gmail.com</span>
                  </p>
                  <p style={{ margin: "2px 0", color: "#64748b", fontSize: "11px" }}>
                    Web: www.discountstorebd.com | Trade Lic: TRAD/DSB/2026-9481
                  </p>
                </div>
              </div>

              {/* Invoice Meta & Status Stamp */}
              <div className="text-left sm:text-right shrink-0">
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "8px",
                  }}
                >
                  Tax Invoice / Cash Memo
                </div>

                <div style={{ fontSize: "12px", lineHeight: "1.5", color: "#64748b" }}>
                  <p style={{ margin: "2px 0" }}>
                    Invoice No:{" "}
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                      {invoiceNumber}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    Order Ref:{" "}
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                      {order.orderId}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    Order Date:{" "}
                    <span style={{ color: "#334155", fontWeight: 600 }}>{orderDate}</span>
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    Printed On:{" "}
                    <span style={{ color: "#64748b" }}>{printDate}</span>
                  </p>
                </div>

                {/* Status Stamp Seal */}
                <div style={{ marginTop: "10px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderRadius: "6px",
                      border: isPaid
                        ? "1.5px solid #059669"
                        : order.orderStatus === "cancelled"
                        ? "1.5px solid #ef4444"
                        : "1.5px solid #d97706",
                      backgroundColor: isPaid
                        ? "#ecfdf5"
                        : order.orderStatus === "cancelled"
                        ? "#fef2f2"
                        : "#fffbeb",
                      color: isPaid
                        ? "#047857"
                        : order.orderStatus === "cancelled"
                        ? "#b91c1c"
                        : "#92400e",
                    }}
                  >
                    {isPaid
                      ? "PAID - COMPLETE"
                      : order.orderStatus === "cancelled"
                      ? "CANCELLED"
                      : "CASH ON DELIVERY (COD)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To & Ship To 2-Column Section */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-5 rounded-xl"
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "16px 20px",
                color: "#334155",
              }}
            >
              {/* Customer / Billed To */}
              <div>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  Customer / Billed To
                </h3>
                <div style={{ fontSize: "12px", lineHeight: "1.5", color: "#334155" }}>
                  <p style={{ margin: "2px 0", fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                    {order.user?.name || order.shippingAddress?.fullName || order.shippingAddress?.name || "Customer"}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Contact: </span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {order.user?.phone || order.shippingAddress?.phone || "N/A"}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Email: </span>
                    <span>{order.user?.email || "N/A"}</span>
                  </p>
                  <p style={{ margin: "2px 0", fontSize: "11px", color: "#64748b" }}>
                    Customer Type:{" "}
                    <span style={{ fontWeight: 600, color: "#334155" }}>
                      {order.user?.userId || order.user?._id ? "Registered Account" : "Guest Checkout"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Delivery / Shipping Destination */}
              <div>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  Delivery Destination
                </h3>
                <div style={{ fontSize: "12px", lineHeight: "1.5", color: "#334155" }}>
                  <p style={{ margin: "2px 0", fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                    {order.shippingAddress?.fullName || order.shippingAddress?.name || order.user?.name || "Recipient"}
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>Delivery Contact: </span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      {order.shippingAddress?.phone || order.user?.phone || "N/A"}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0", color: "#1e293b" }}>
                    {order.shippingAddress?.addressLine1}
                    {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                    <br />
                    {order.shippingAddress?.area && `${order.shippingAddress.area}, `}
                    {order.shippingAddress?.city}
                    {order.shippingAddress?.postCode && ` - ${order.shippingAddress.postCode}`}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", fontWeight: 700, color: "#b45309" }}>
                    Zone:{" "}
                    {order.shippingArea === "dhaka"
                      ? "Inside Dhaka Metropolitan (৳60 Regular)"
                      : "Outside Dhaka Nationwide (৳130 Courier)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div
              className="mb-5 overflow-hidden rounded-lg"
              style={{
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
              }}
            >
              <table className="w-full text-left border-collapse" style={{ fontSize: "12px" }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <th style={{ padding: "8px 10px", width: "36px", textAlign: "center", color: "#ffffff" }}>#</th>
                    <th style={{ padding: "8px 10px", color: "#ffffff" }}>Item Description & Specifications</th>
                    <th style={{ padding: "8px 10px", width: "110px", textAlign: "center", color: "#ffffff" }}>SKU / Code</th>
                    <th style={{ padding: "8px 10px", width: "95px", textAlign: "right", color: "#ffffff" }}>Unit Price</th>
                    <th style={{ padding: "8px 10px", width: "50px", textAlign: "center", color: "#ffffff" }}>Qty</th>
                    <th style={{ padding: "8px 10px", width: "105px", textAlign: "right", color: "#ffffff" }}>Total (BDT)</th>
                  </tr>
                </thead>
                <tbody style={{ color: "#1e293b" }}>
                  {order.items?.map((item, idx) => {
                    const unitPrice = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);
                    const lineTotal = Number(item.totalPrice || unitPrice * qty);

                    return (
                      <tr
                        key={item._id || idx}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: idx % 2 === 1 ? "#fafafa" : "#ffffff",
                        }}
                      >
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 600, color: "#64748b" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>
                            {item.name || "Product Item"}
                          </div>
                          {/* Variant Attributes (Size & Color) */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.size && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  backgroundColor: "#f1f5f9",
                                  color: "#334155",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                Size: {item.size.name || item.size}
                                {item.size.extraPrice > 0 && ` (+৳${item.size.extraPrice})`}
                              </span>
                            )}
                            {item.color && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  backgroundColor: "#f1f5f9",
                                  color: "#334155",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {item.color.hexCode && (
                                  <span
                                    style={{
                                      width: "9px",
                                      height: "9px",
                                      borderRadius: "50%",
                                      border: "1px solid #cbd5e1",
                                      display: "inline-block",
                                      backgroundColor: item.color.hexCode,
                                    }}
                                  />
                                )}
                                Color: {item.color.name || item.color}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontFamily: "monospace", fontSize: "11px", color: "#64748b" }}>
                          {item.sku || item.size?.sku || item.productId?.sku || "DSB-ITEM"}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500 }}>
                          ৳{unitPrice.toLocaleString()}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700 }}>
                          {qty}
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                          ৳{lineTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Amount in Words Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start pb-5"
              style={{ borderBottom: "1px solid #e2e8f0" }}
            >
              {/* Left Column: Amount in Words, Payment & Notes */}
              <div className="sm:col-span-7 space-y-2.5">
                {/* Amount in words */}
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "8px",
                    padding: "10px 14px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#92400e",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "2px",
                    }}
                  >
                    Amount in Words
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                      fontWeight: 700,
                      color: "#78350f",
                    }}
                  >
                    {numberToWordsBDT(order.total)}
                  </p>
                </div>

                {/* Payment & Delivery notes */}
                <div style={{ fontSize: "11px", lineHeight: "1.5", color: "#475569" }}>
                  <p style={{ margin: "2px 0" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Payment Method: </span>
                    <span style={{ textTransform: "uppercase", fontWeight: 600, color: "#0f172a" }}>
                      {paymentMethod}
                    </span>
                  </p>
                  <p style={{ margin: "2px 0" }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>Order Notes: </span>
                    <span style={{ fontStyle: "italic", color: "#1e293b" }}>
                      {order.notes || "None specified by customer"}
                    </span>
                  </p>
                  {order.deliveryMethod && (
                    <p style={{ margin: "2px 0" }}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>Courier Partner: </span>
                      <span>{order.deliveryMethod}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Financial Totals */}
              <div
                className="sm:col-span-5 rounded-xl"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "12px 16px",
                  color: "#334155",
                  fontSize: "12px",
                  lineHeight: "1.4",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", margin: "3px 0" }}>
                  <span>Subtotal ({order.items?.length || 1} items):</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>৳{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", margin: "3px 0" }}>
                  <span>Shipping & Delivery Fee:</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>৳{(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                {order.tax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", margin: "3px 0" }}>
                    <span>VAT / Govt Tax (5%):</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>৳{(order.tax || 0).toLocaleString()}</span>
                  </div>
                )}
                {(order.couponDiscount > 0 || order.discount > 0) && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontWeight: 600, margin: "3px 0" }}>
                    <span>
                      Discount
                      {order.couponCode && ` (${order.couponCode})`}:
                    </span>
                    <span>-৳{((order.couponDiscount || 0) + (order.discount || 0)).toLocaleString()}</span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "2px solid #0f172a",
                    paddingTop: "8px",
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                    Total Payable Amount:
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 900, color: "#b45309" }}>
                    ৳{(order.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions / Policy */}
            <div style={{ margin: "12px 0", fontSize: "10px", lineHeight: "1.45", color: "#64748b" }}>
              <p style={{ fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px 0" }}>
                Terms & Return Policy:
              </p>
              <ol className="list-decimal list-inside" style={{ margin: 0, paddingLeft: 0 }}>
                <li>Please verify the parcel contents and invoice amount in front of the courier delivery agent.</li>
                <li>Genuine leather goods are eligible for size replacement or warranty claims within 7 days with original packaging and invoice.</li>
                <li>Cash On Delivery parcels must be settled in full BDT before courier handover.</li>
              </ol>
            </div>

            {/* Signature & Seal Block */}
            <div
              className="flex justify-between items-end"
              style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "20px",
                marginTop: "12px",
                fontSize: "12px",
              }}
            >
              {/* Customer Signature */}
              <div style={{ textAlign: "center", width: "160px" }}>
                <div
                  style={{
                    borderBottom: "1px solid #94a3b8",
                    paddingBottom: "3px",
                    marginBottom: "4px",
                    height: "32px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>
                    Sign upon receipt
                  </span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Customer's Signature
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#94a3b8" }}>Date: ________________</p>
              </div>

              {/* Official Store Stamp / Seal */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    border: "2px dashed #d97706",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px",
                    textAlign: "center",
                    transform: "rotate(-5deg)",
                  }}
                >
                  <span style={{ fontSize: "8px", fontWeight: 900, color: "#92400e", textTransform: "uppercase", letterSpacing: "-0.5px" }}>
                    DISCOUNT STORE
                  </span>
                  <span style={{ fontSize: "7px", fontWeight: 700, color: "#b45309" }}>★ VERIFIED ★</span>
                  <span style={{ fontSize: "7px", color: "#92400e", fontFamily: "monospace" }}>DISPATCH</span>
                </div>
              </div>

              {/* Authorized Store Signature */}
              <div style={{ textAlign: "center", width: "160px" }}>
                <div
                  style={{
                    borderBottom: "1px solid #94a3b8",
                    paddingBottom: "3px",
                    marginBottom: "4px",
                    height: "32px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontStyle: "italic",
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "15px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Nur Hossain
                  </span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1e293b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Authorized Signatory
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#94a3b8" }}>Discount Store BD Ltd.</p>
              </div>
            </div>

            {/* Bottom Barcode Aesthetic */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between"
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "10px",
                marginTop: "14px",
                fontSize: "10px",
                color: "#94a3b8",
              }}
            >
              <span style={{ fontFamily: "monospace", letterSpacing: "0.15em", color: "#64748b" }}>
                ||| | ||||| || |||||| | |||| ||||||| {order.orderId}
              </span>
              <span>Computer-generated commercial tax invoice. Single page official document.</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>Page 1 of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
