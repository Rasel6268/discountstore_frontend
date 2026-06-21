'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreateDiscountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: 'Get up to 50% off on fusion leather collection + Free Gift',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    coupon: '',
    offerType: 'limited_time_offer'
  });

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch coupons using React Query
  const { 
    data: coupons = [], 
    isLoading: loading, 
    error: fetchError 
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await api.get('/coupons');
      return response.data.coupons;
    },
  });

  // Create discount mutation
  const createDiscountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/discounts/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      router.push('/discounts/all');
    },
    onError: (error) => {
      setErrors({ submit: error.response?.data?.message || 'Failed to create discount' });
    },
  });

  // Update selected coupon when coupon changes
  useEffect(() => {
    if (formData.coupon) {
      const coupon = coupons.find(c => c._id === formData.coupon);
      setSelectedCoupon(coupon || null);
    } else {
      setSelectedCoupon(null);
    }
  }, [formData.coupon, coupons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    if (!formData.coupon) {
      newErrors.coupon = 'Please select a coupon';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    createDiscountMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: 'Get up to 50% off on fusion leather collection + Free Gift',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      coupon: '',
      offerType: 'limited_time_offer'
    });
    setErrors({});
    setSelectedCoupon(null);
  };

  // Format coupon display text
  const getCouponDisplayText = (coupon) => {
    const discountText = coupon.type === 'percentage' 
      ? `${coupon.value}%` 
      : `$${coupon.value}`;
    
    let details = [];
    if (coupon.minPurchase) {
      details.push(`Min: $${coupon.minPurchase}`);
    }
    if (coupon.userGroups && coupon.userGroups.length > 0) {
      details.push(`Groups: ${coupon.userGroups.join(', ')}`);
    }
    
    return `${coupon.code} - ${discountText}${details.length > 0 ? ` (${details.join(', ')})` : ''}`;
  };

  // Format coupon details for preview
  const getCouponDetails = (coupon) => {
    const details = [
      { label: 'Code', value: coupon.code },
      { label: 'Name', value: coupon.name || 'N/A' },
      { 
        label: 'Discount', 
        value: coupon.type === 'percentage' 
          ? `${coupon.value}%` 
          : `$${coupon.value}` 
      },
      { label: 'Type', value: coupon.type === 'percentage' ? 'Percentage' : 'Fixed Amount' },
    ];

    if (coupon.minPurchase) {
      details.push({ label: 'Minimum Purchase', value: `$${coupon.minPurchase}` });
    }
    
    if (coupon.userGroups && coupon.userGroups.length > 0) {
      details.push({ label: 'User Groups', value: coupon.userGroups.join(', ') });
    }
    
    if (coupon.usageLimit) {
      details.push({ label: 'Usage Limit', value: coupon.usageLimit });
    }
    
    if (coupon.perUserLimit) {
      details.push({ label: 'Per User Limit', value: coupon.perUserLimit });
    }
    
    details.push({ 
      label: 'Status', 
      value: coupon.status,
      className: coupon.status === 'active' ? 'text-green-600' : 'text-gray-600'
    });

    return details;
  };

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
            Error loading coupons: {fetchError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/discounts/all" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Discounts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Create New Discount Offer
          </h1>
        </div>

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Summer Sale 2024"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the discount offer"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Coupon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Coupon *
            </label>
            <select
              name="coupon"
              value={formData.coupon}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.coupon ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a coupon...</option>
              {loading ? (
                <option disabled>Loading coupons...</option>
              ) : (
                coupons.map((coupon) => (
                  <option key={coupon._id} value={coupon._id}>
                    {getCouponDisplayText(coupon)}
                  </option>
                ))
              )}
            </select>
            {errors.coupon && (
              <p className="mt-1 text-sm text-red-500">{errors.coupon}</p>
            )}
            {!loading && coupons.length === 0 && (
              <p className="mt-2 text-sm text-yellow-600">
                No coupons available. Please create a coupon first.
              </p>
            )}
          </div>

          {/* Coupon Preview */}
          {selectedCoupon && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">Selected Coupon Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getCouponDetails(selectedCoupon).map((detail, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-gray-600">{detail.label}:</span>{' '}
                    <span className={detail.className || 'text-gray-800'}>
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer Type
            </label>
            <select
              name="offerType"
              value={formData.offerType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="limited_time_offer">Limited Time Offer</option>
              <option value="seasonal">Seasonal</option>
              <option value="clearance">Clearance</option>
              <option value="flash_sale">Flash Sale</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={createDiscountMutation.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createDiscountMutation.isPending ? 'Creating...' : 'Create Discount'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}