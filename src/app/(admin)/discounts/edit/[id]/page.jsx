'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  Calendar,
  Tag,
  Users,
  DollarSign,
  Percent,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import api from '@/config/api';
import toast from 'react-hot-toast';

export default function DiscountEditPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'standard',
    status: 'draft',
    startDate: '',
    endDate: '',
    usageLimit: '',
    coupon: {
      code: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      userGroups: []
    }
  });
  const [errors, setErrors] = useState({});
  const [userGroupInput, setUserGroupInput] = useState('');

  // Fetch discount data
  useEffect(() => {
    if (discountId) {
      fetchDiscount();
    }
  }, [discountId]);

  const fetchDiscount = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/discounts/${discountId}`);
      const data = response.data.data;
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        offerType: data.offerType || 'standard',
        status: data.status || 'draft',
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
        usageLimit: data.usageLimit || '',
        coupon: {
          code: data.coupon?.code || '',
          type: data.coupon?.type || 'percentage',
          value: data.coupon?.value || '',
          minPurchase: data.coupon?.minPurchase || '',
          maxDiscount: data.coupon?.maxDiscount || '',
          userGroups: data.coupon?.userGroups || []
        }
      });
    } catch (error) {
      console.error('Error fetching discount:', error);
      toast.error('Failed to load discount details');
      // router.push('/discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('coupon.')) {
      const couponField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coupon: {
          ...prev.coupon,
          [couponField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddUserGroup = () => {
    if (!userGroupInput.trim()) return;
    if (formData.coupon.userGroups.includes(userGroupInput.trim())) {
      toast.error('Group already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      coupon: {
        ...prev.coupon,
        userGroups: [...prev.coupon.userGroups, userGroupInput.trim()]
      }
    }));
    setUserGroupInput('');
  };

  const handleRemoveUserGroup = (group) => {
    setFormData(prev => ({
      ...prev,
      coupon: {
        ...prev.coupon,
        userGroups: prev.coupon.userGroups.filter(g => g !== group)
      }
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.coupon.code && !formData.coupon.code.trim()) {
      newErrors['coupon.code'] = 'Coupon code is required';
    }
    if (formData.coupon.value && (isNaN(formData.coupon.value) || Number(formData.coupon.value) <= 0)) {
      newErrors['coupon.value'] = 'Please enter a valid value';
    }
    if (formData.coupon.type === 'percentage' && formData.coupon.value && Number(formData.coupon.value) > 100) {
      newErrors['coupon.value'] = 'Percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        coupon: {
          ...formData.coupon,
          value: formData.coupon.value ? Number(formData.coupon.value) : undefined,
          minPurchase: formData.coupon.minPurchase ? Number(formData.coupon.minPurchase) : undefined,
          maxDiscount: formData.coupon.maxDiscount ? Number(formData.coupon.maxDiscount) : undefined
        }
      };

      const response = await api.put(`/discounts/${discountId}`, payload);
      
      if (response.data.success) {
        toast.success('Discount updated successfully!');
        router.push('/discounts');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error.response?.data?.message || 'Failed to update discount');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      inactive: <EyeOff className="w-4 h-4" />,
      expired: <Clock className="w-4 h-4" />,
      draft: <Eye className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
          <p className="text-gray-500">Loading discount details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/discounts"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Discounts
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Discount</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your promotional offer details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(formData.status)}`}>
              {getStatusIcon(formData.status)}
              {formData.status}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale 2024"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description of the discount offer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Offer Type
                  </label>
                  <select
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="standard">Standard</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                    <option value="free_shipping">Free Shipping</option>
                    <option value="bundle_discount">Bundle Discount</option>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Unlimited"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited uses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Date Range
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              Coupon Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  name="coupon.code"
                  value={formData.coupon.code}
                  onChange={handleChange}
                  placeholder="e.g., SUMMER2024"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase ${
                    errors['coupon.code'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['coupon.code'] && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors['coupon.code']}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    name="coupon.type"
                    value={formData.coupon.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {formData.coupon.type === 'percentage' ? (
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    )}
                    <input
                      type="number"
                      name="coupon.value"
                      value={formData.coupon.value}
                      onChange={handleChange}
                      placeholder={formData.coupon.type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors['coupon.value'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors['coupon.value'] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors['coupon.value']}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Minimum Purchase
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="coupon.minPurchase"
                      value={formData.coupon.minPurchase}
                      onChange={handleChange}
                      placeholder="e.g., 100"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum order amount to apply this coupon</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Maximum Discount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="coupon.maxDiscount"
                      value={formData.coupon.maxDiscount}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Maximum discount amount (for percentage discounts)</p>
                </div>
              </div>

              {/* User Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Groups
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userGroupInput}
                    onChange={(e) => setUserGroupInput(e.target.value)}
                    placeholder="Enter user group name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUserGroup();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddUserGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                {formData.coupon.userGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.coupon.userGroups.map((group, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {group}
                        <button
                          type="button"
                          onClick={() => handleRemoveUserGroup(group)}
                          className="hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to make this coupon available to all users
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Status
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['draft', 'active', 'inactive', 'expired'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status }))}
                  className={`px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all cursor-pointer ${
                    formData.status === status
                      ? status === 'active'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : status === 'inactive'
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : status === 'expired'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Select the status for this discount. Active discounts will be visible to customers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
            
            <Link
              href="/discounts"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}