import api from "@/config/api";

export const productApi = {
  // Create product
  async createProduct(data) {
    const response = await api.post('/products', data);
    console.log("product",response.data)
    return response.data;
    
  },

  // Get all products with filters
  async getAllProducts(params = {}) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  async getProductBySlug(slug) {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Update product
  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Update stock
  async updateStock(id, quantity, operation = 'set') {
    const response = await api.patch(`/products/${id}/stock`, { quantity, operation });
    return response.data;
  },

  // ================== COLOR MANAGEMENT ==================
  
  // Add color to product
  async addColorToProduct(productId, colorData) {
    const response = await api.post(`/products/${productId}/colors`, colorData);
    return response.data;
  },

  // Update color quantity
  async updateColorQuantity(productId, colorId, quantity) {
    const response = await api.patch(`/products/${productId}/colors/${colorId}`, { quantity });
    return response.data;
  },

  // Remove color from product
  async removeColorFromProduct(productId, colorId) {
    const response = await api.delete(`/products/${productId}/colors/${colorId}`);
    return response.data;
  },

  // Get product colors
  async getProductColors(productId) {
    const response = await api.get(`/products/${productId}/colors`);
    return response.data;
  },

  // ================== SIZE MANAGEMENT ==================
  
  // Add size to product
  async addSizeToProduct(productId, sizeData) {
    const response = await api.post(`/products/${productId}/sizes`, sizeData);
    return response.data;
  },

  // Update size quantity
  async updateSizeQuantity(productId, sizeName, quantity) {
    const response = await api.patch(`/products/${productId}/sizes/${sizeName}`, { quantity });
    return response.data;
  },

  // Remove size from product
  async removeSizeFromProduct(productId, sizeName) {
    const response = await api.delete(`/products/${productId}/sizes/${sizeName}`);
    return response.data;
  },

  // Get product sizes
  async getProductSizes(productId) {
    const response = await api.get(`/products/${productId}/sizes`);
    return response.data;
  }
};