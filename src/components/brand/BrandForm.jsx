"use client";

import React, { useState, useEffect } from "react";
import {
  useCreateBrand,
  useUpdateBrand,
} from "@/hooks/useBrands";
import { Loader2, Plus } from "lucide-react";

const BrandForm = ({ editingBrand, setEditingBrand }) => {
  const [name, setName] = useState("");

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  useEffect(() => {
    if (editingBrand) {
      setName(editingBrand.name);
    }
  }, [editingBrand]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingBrand) {
      await updateBrand.mutateAsync({
        id: editingBrand._id,
        data: { name },
      });
      setEditingBrand(null);
    } else {
      await createBrand.mutateAsync({ name });
    }

    setName("");
  };

  const loading =
    createBrand.isPending || updateBrand.isPending;

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-3">
        {editingBrand ? "Edit Brand" : "Create Brand"}
      </h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Brand name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <span className="flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Save
          </span>
        )}
      </button>
    </form>
  );
};

export default BrandForm;