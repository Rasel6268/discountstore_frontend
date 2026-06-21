"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productApi } from "@/services/productApi";

// ================== HELPERS ==================

const getErrorMessage = (err) =>
  err?.response?.data?.error || err?.message || "Something went wrong";

// ================== QUERIES ==================

// 🔹 Get all products with filters
export const useProducts = (filters = {}) => {
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  return useQuery({
    queryKey: ["products", JSON.stringify(cleanFilters)],
    queryFn: async () => {
      const res = await productApi.getAllProducts(cleanFilters);

      return {
        data: res?.data || [],
        pagination: res?.pagination || {
          total: 0,
          page: 1,
          limit: 12,
          pages: 1,
        },
        success: res?.success ?? true,
      };
    },
    staleTime: 1000 * 30, // 30 sec
    gcTime: 1000 * 60 * 5, // 5 min cache
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

// 🔹 Get single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await productApi.getProductById(id);
      return res?.data || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};

// 🔹 Get product colors
export const useProductColors = (productId) => {
  return useQuery({
    queryKey: ["product-colors", productId],
    queryFn: async () => {
      const res = await productApi.getProductColors(productId);
      return res?.data || [];
    },
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
};

// 🔹 Get product sizes
export const useProductSizes = (productId) => {
  return useQuery({
    queryKey: ["product-sizes", productId],
    queryFn: async () => {
      const res = await productApi.getProductSizes(productId);
      return res?.data || [];
    },
    enabled: !!productId,
    staleTime: 1000 * 30,
  });
};

// ================== MUTATIONS ==================

// 🔹 Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });

    },
  });
};

// 🔹 Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-colors", variables.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-sizes", variables.id],
      });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.deleteProduct,

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ================== COLOR MUTATIONS ==================

// 🔹 Add color
export const useAddColorToProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, colorData }) =>
      productApi.addColorToProduct(productId, colorData),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-colors", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Color added successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Update color quantity
export const useUpdateColorQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, colorId, quantity }) =>
      productApi.updateColorQuantity(productId, colorId, quantity),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-colors", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Color quantity updated!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Remove color
export const useRemoveColorFromProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, colorId }) =>
      productApi.removeColorFromProduct(productId, colorId),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-colors", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Color removed successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// ================== SIZE MUTATIONS ==================

// 🔹 Add size
export const useAddSizeToProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, sizeData }) =>
      productApi.addSizeToProduct(productId, sizeData),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-sizes", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Size added successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Update size quantity
export const useUpdateSizeQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, sizeName, quantity }) =>
      productApi.updateSizeQuantity(productId, sizeName, quantity),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-sizes", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Size quantity updated!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Remove size
export const useRemoveSizeFromProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, sizeName }) =>
      productApi.removeSizeFromProduct(productId, sizeName),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.productId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["product-sizes", variables.productId],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Size removed successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};

// 🔹 Update stock (legacy)
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity, operation = "set" }) =>
      productApi.updateStock(id, quantity, operation),

    onSuccess: async (res, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["product", variables.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(res?.message || "Stock updated successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
};