"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { categoryApi } from "@/services/categoryApi";

// 🔹 Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryApi.getAllCategories();
      return res || [];
    },
  });
};

// 🔹 Get main categories
export const useMainCategories = () => {
  return useQuery({
    queryKey: ["mainCategories"],
    queryFn: async () => {
      const res = await categoryApi.getMainCategories();
      return res || [];
    },
  });
};

// 🔹 Get single category
export const useCategory = (id) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await categoryApi.getCategoryById(id);
      return res;
    },
    enabled: !!id,
  });
};

// ================== MUTATIONS ==================

// 🔹 Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.createMainCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["mainCategories"]);
      
    },
    onError: () => {
      
    },
  });
};

// 🔹 Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });
};

// 🔹 Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });
};
