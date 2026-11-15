// app/product/[id]/page.jsx
"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductDetails from "@/components/ProductDetails";

const ProductDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  // Canonical URL normalization: replace /product/:id with /shop/:id in browser history
  useEffect(() => {
    if (id) {
      const cleanId = typeof id === "string" ? id.replace(/\/+$/, "").trim() : id;
      router.replace(`/shop/${cleanId}/`, { scroll: false });
    }
  }, [id, router]);

  return <ProductDetails />;
};

export default ProductDetailPage;
