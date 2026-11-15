"use client";
import React from "react";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";
import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";
import { MdPayment, MdCheckCircle, MdPending, MdCancel } from "react-icons/md";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Link from "next/link";

const TransactionPage = () => {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const res = await api.get("/orders/allorder");
      return res.data.data || [];
    },
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  const getPaymentBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><MdCheckCircle /> Paid</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><MdPending /> Pending</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><MdCancel /> Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status || "Unpaid"}</span>;
    }
  };

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MdPayment className="text-amber-500" /> Transactions & Payments
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Overview of all customer payments and gateway settlements.
            </p>
          </div>
          <Link
            href="/orders"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-xl transition"
          >
            Manage Orders →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Transaction / Bank ID</th>
                  <th className="px-6 py-4">Amount (BDT)</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-800">
                        {order.orderId || order._id}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.user?.name || order.shippingAddress?.name || "Guest Customer"}
                      </td>
                      <td className="px-6 py-4 uppercase font-semibold text-xs text-gray-600">
                        {order.payment?.method || "COD"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {order.payment?.transactionId || order.payment?.sslData?.bank_tran_id || "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ৳{Math.round(order.total || 0).toLocaleString("en-US")}
                      </td>
                      <td className="px-6 py-4">
                        {getPaymentBadge(order.payment?.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default TransactionPage;
