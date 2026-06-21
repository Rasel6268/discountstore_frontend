'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Tag,
  Users,
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';
import api from '@/config/api';
import toast from 'react-hot-toast';

export default function DiscountsListPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/discounts');
      setDiscounts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  // Update discount status
  const updateDiscountStatus = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const response = await api.patch(`/discounts/${id}/status`, { status: newStatus });
      
      if (response.data.success) {
        setDiscounts(prev => 
          prev.map(discount => 
            discount._id === id 
              ? { ...discount, status: newStatus }
              : discount
          )
        );
        toast.success(`Discount ${newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'updated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete discount
  const handleDelete = async (id, title) => {
    toast.custom(
      (t) => (
        <div className="relative bg-white rounded-2xl shadow-2xl border border-red-100 p-6 max-w-md w-full mx-4 animate-in slide-in-from-top-4 duration-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Delete Discount
              </h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-red-600">"{title}"</span>?
              </p>
              <p className="text-xs text-gray-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeletingId(id);
                try {
                  await api.delete(`/discounts/${id}`);
                  setDiscounts(prev => prev.filter(d => d._id !== id));
                  toast.success(`"${title}" deleted successfully`);
                } catch (error) {
                  console.error('Error deleting discount:', error);
                  toast.error(error.response?.data?.message || 'Failed to delete discount');
                } finally {
                  setDeletingId(null);
                }
              }}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 size={16} />
              Delete Discount
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <EyeOff className="w-3 h-3" />,
      expired: <Clock className="w-3 h-3" />,
      draft: <Eye className="w-3 h-3" />
    };
    return icons[status] || <AlertCircle className="w-3 h-3" />;
  };

  // Get discount value display
  const getDiscountValue = (coupon) => {
    if (!coupon) return 'No coupon';
    if (coupon.type === 'percentage') {
      return `${coupon.value}% OFF`;
    } else if (coupon.type === 'fixed') {
      return `$${coupon.value} OFF`;
    }
    return 'No coupon';
  };

  // Get offer type badge
  const getOfferTypeBadge = (type) => {
    const types = {
      buy_x_get_y: 'Buy X Get Y',
      free_shipping: 'Free Shipping',
      bundle_discount: 'Bundle Discount',
      flash_sale: 'Flash Sale',
      seasonal: 'Seasonal'
    };
    return types[type] || type?.replace(/_/g, ' ') || 'Standard';
  };

  // Filter discounts
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discount.coupon?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' },
    { value: 'draft', label: 'Draft' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
          <p className="text-gray-500">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discount Offers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your promotional discounts and coupons
            </p>
          </div>
          <Link
            href="/discounts/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Discount
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search discounts by title, description or coupon code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title & Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Tag className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No discounts found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your filters' 
                            : 'Create your first discount to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => (
                    <tr key={discount._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {discount.title}
                        </div>
                        {discount.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {discount.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {discount.coupon ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {discount.coupon.code}
                            </span>
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              {getDiscountValue(discount.coupon)}
                            </div>
                            {discount.coupon.minPurchase && (
                              <div className="text-xs text-gray-400">
                                Min: ${discount.coupon.minPurchase}
                              </div>
                            )}
                            {discount.coupon.userGroups && discount.coupon.userGroups.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {discount.coupon.userGroups.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No coupon</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(discount.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                          → {new Date(discount.endDate).toLocaleDateString()}
                        </div>
                        {discount.usageLimit && (
                          <div className="text-xs text-gray-400 mt-1">
                            Limit: {discount.usageLimit} uses
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 capitalize">
                          {getOfferTypeBadge(discount.offerType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(discount.status)}`}>
                            {getStatusIcon(discount.status)}
                            {discount.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Toggle Buttons */}
                          <div className="flex items-center gap-1 mr-2">
                            {discount.status !== 'active' && (
                              <button
                                onClick={() => updateDiscountStatus(discount._id, 'active')}
                                disabled={updatingStatusId === discount._id}
                                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Activate"
                              >
                                {updatingStatusId === discount._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {discount.status !== 'inactive' && discount.status !== 'expired' && (
                              <button
                                onClick={() => updateDiscountStatus(discount._id, 'inactive')}
                                disabled={updatingStatusId === discount._id}
                                className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Deactivate"
                              >
                                {updatingStatusId === discount._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Edit Button */}
                          <Link
                            href={`/discounts/edit/${discount._id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(discount._id, discount.title)}
                            disabled={deletingId === discount._id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deletingId === discount._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Showing {filteredDiscounts.length} of {discounts.length} discounts
              </span>
              <span>
                {discounts.filter(d => d.status === 'active').length} active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}