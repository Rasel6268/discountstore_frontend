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
    refetchOnMount: true,
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

    onSuccess: async (data) => {
      // Invalidate and refetch products
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Immediately update the cache with the new product
      if (data?.data) {
        queryClient.setQueryData(["products"], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: [data.data, ...(oldData.data || [])],
            pagination: {
              ...oldData.pagination,
              total: (oldData.pagination?.total || 0) + 1
            }
          };
        });
      }
    },

    
  });
};

// 🔹 Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productApi.updateProduct(id, data),

    onSuccess: async (res, variables) => {
      // Update the specific product in cache
      if (res?.data) {
        queryClient.setQueryData(["product", variables.id], res.data);
        
        // Update in the products list
        queryClient.setQueryData(["products"], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.map(product => 
              product._id === variables.id ? res.data : product
            )
          };
        });
      }

      // Invalidate all related queries
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

      toast.success(res?.message || "Product updated successfully!");
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

    onSuccess: async (res, variables) => {
      // Remove from cache immediately
      queryClient.setQueryData(["products"], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.filter(product => product._id !== variables),
          pagination: {
            ...oldData.pagination,
            total: (oldData.pagination?.total || 0) - 1
          }
        };
      });

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(res?.message || "Product deleted successfully!");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
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
      // Update product colors in cache
      if (res?.data) {
        queryClient.setQueryData(
          ["product-colors", variables.productId],
          (oldData) => [...(oldData || []), res.data]
        );
      }

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
      // Remove color from cache
      queryClient.setQueryData(
        ["product-colors", variables.productId],
        (oldData) => oldData?.filter(color => color._id !== variables.colorId) || []
      );

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
      // Update product sizes in cache
      if (res?.data) {
        queryClient.setQueryData(
          ["product-sizes", variables.productId],
          (oldData) => [...(oldData || []), res.data]
        );
      }

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
      // Remove size from cache
      queryClient.setQueryData(
        ["product-sizes", variables.productId],
        (oldData) => oldData?.filter(size => size.name !== variables.sizeName) || []
      );

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