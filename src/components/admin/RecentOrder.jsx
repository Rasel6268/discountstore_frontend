import api from "@/config/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";

const RecentOrder = () => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: "bg-green-100 text-green-600",
      processing: "bg-blue-100 text-blue-600",
      pending: "bg-yellow-100 text-yellow-600",
      shipped: "bg-purple-100 text-purple-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["Recent_orders"],
    queryFn: async () => {
      const res = await api.get("/orders/allorder");
      return res.data;
    },
  });
  const recentOrders =
    data?.data
      ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Orders
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Latest transactions from your store
            </p>
          </div>
          <Link
            href="/orders"
            className="text-amber-600 text-sm hover:text-amber-700 font-medium"
          >
            View All Orders →
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition">
                {/* Order ID */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderId}
                </td>

                {/* Customer */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {order.user?.name}
                </td>

                {/* Amount */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  ৳{order.total.toLocaleString()}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.orderStatus)}
                </td>

                {/* Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-GB")}
                </td>

                {/* Action */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/orders/${order._id}`}
                    className="text-amber-600 hover:text-amber-700 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrder;
