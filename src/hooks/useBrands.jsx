"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { brandApi } from "@/services/brandApi";


// ================== QUERIES ==================

// 🔹 Get all brands
export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await brandApi.getAllBrands();
      return res.data || [];
    },
  });
};


// 🔹 Get single brand
export const useBrand = (id) => {
  return useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      const res = await brandApi.getBrandById(id);
      return res;
    },
    enabled: !!id,
  });
};


// ================== MUTATIONS ==================

// 🔹 Create brand
export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandApi.createBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["brands"]);
      
    },
    onError: () => {
      
    },
  });
};


// 🔹 Update brand
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => brandApi.updateBrand(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["brands"]);
      queryClient.invalidateQueries(["brand"]);
     
    },
    onError: () => {
     
    },
  });
};


// 🔹 Delete brand
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandApi.deleteBrand,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["brands"]);
    },
    onError: () => {
      
    },
  });
};