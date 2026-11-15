"use client";
import React, { useState } from "react";
import AdminRoute from "@/components/ProtectedRoute/AdminRoute";
import { MdDeliveryDining, MdSave } from "react-icons/md";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import toast from "react-hot-toast";

const DeliverySettingsPage = () => {
  const [dhakaRate, setDhakaRate] = useState(60);
  const [outsideDhakaRate, setOutsideDhakaRate] = useState(130);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Delivery settings saved successfully!");
  };

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdDeliveryDining className="text-amber-500" /> Delivery Cost & Zones
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure delivery fees across Dhaka and outside Dhaka districts.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Inside Dhaka Delivery Fee (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                value={dhakaRate}
                onChange={(e) => setDhakaRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Applies to all areas inside Dhaka metropolitan.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Outside Dhaka Delivery Fee (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                value={outsideDhakaRate}
                onChange={(e) => setOutsideDhakaRate(Number(e.target.value))}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Applies to all other divisions and districts in Bangladesh.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Free Shipping Threshold (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Orders above this amount qualify for free shipping.</p>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition cursor-pointer shadow-sm"
            >
              <MdSave className="text-lg" /> Save Delivery Settings
            </button>
          </form>
        </div>
      </div>
    </AdminRoute>
  );
};

export default DeliverySettingsPage;
