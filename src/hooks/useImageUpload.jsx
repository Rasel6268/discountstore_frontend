import { useState } from 'react';
import api from '@/config/api';
import toast from 'react-hot-toast';

const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a single image to ImageKit via backend
   * @param {File} file - Image file object
   * @param {string} folder - Destination folder on ImageKit (default: '/products')
   * @returns {Promise<{ url: string, fileId: string, name: string, thumbnailUrl: string } | null>}
   */
  const uploadImage = async (file, folder = '/products') => {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file.';
      toast.error(msg);
      setError(msg);
      return null;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      const msg = 'Image size must be less than 10MB.';
      toast.error(msg);
      setError(msg);
      return null;
    }

    setUploading(true);
    setError(null);
    setProgress(10);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        },
      });

      setProgress(100);
      return response.data?.data;
    } catch (err) {
      console.error('Image upload failed:', err);
      const msg =
        err.response?.data?.message || 'Image upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload multiple images to ImageKit via backend
   * @param {File[] | FileList} files - List of image files
   * @param {string} folder - Destination folder on ImageKit (default: '/products')
   * @returns {Promise<Array<{ url: string, fileId: string, name: string, thumbnailUrl: string }>>}
   */
  const uploadMultipleImages = async (files, folder = '/products') => {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) return [];

    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('No valid image files selected.');
      return [];
    }

    setUploading(true);
    setError(null);
    setProgress(10);

    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    try {
      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          }
        },
      });

      setProgress(100);
      toast.success(
        `${response.data?.data?.length || validFiles.length} image(s) uploaded successfully!`
      );
      return response.data?.data || [];
    } catch (err) {
      console.error('Multiple image upload failed:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to upload images. Please try again.';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete an image from ImageKit
   * @param {string} fileId - The ImageKit fileId
   */
  const deleteImage = async (fileId) => {
    if (!fileId) return false;
    try {
      await api.delete(`/upload/${fileId}`);
      toast.success('Image removed from ImageKit');
      return true;
    } catch (err) {
      console.error('Failed to delete image:', err);
      toast.error('Failed to delete image from storage.');
      return false;
    }
  };

  /**
   * Helper event handler to attach directly to <input type="file" multiple />
   */
  const handleFileChange = async (e, folder = '/products') => {
    const files = e.target.files;
    if (!files || files.length === 0) return [];

    if (files.length === 1) {
      const result = await uploadImage(files[0], folder);
      return result ? [result] : [];
    } else {
      return await uploadMultipleImages(files, folder);
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    handleFileChange,
    uploading,
    progress,
    error,
  };
};

export default useImageUpload;