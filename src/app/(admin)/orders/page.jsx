'use client';
import api from '@/config/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaPalette, FaMale, FaFemale, FaChild, FaVenusMars, FaSpinner } from 'react-icons/fa';

const AdminOrderPage = () => {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Format price in BDT (Taka)
    const formatPriceBDT = (price) => {
        if (!price && price !== 0) return "৳0";
        return `৳${Math.round(price).toLocaleString("en-US")}`;
    };

    // Get size type icon
    const getSizeTypeIcon = (type) => {
        if (!type) return <FaVenusMars className="text-purple-500" />;
        switch(type) {
            case 'men': return <FaMale className="text-blue-500" />;
            case 'women': return <FaFemale className="text-pink-500" />;
            case 'kids': return <FaChild className="text-green-500" />;
            default: return <FaVenusMars className="text-purple-500" />;
        }
    };

    // Fetch orders with better error handling and enabled flag
    const { 
        data: ordersData, 
        isLoading, 
        isError, 
        error, 
        refetch,
        isFetching 
    } = useQuery({
        queryKey: ['admin-orders', filterStatus],
        queryFn: async () => {
            console.log('Fetching orders with filter:', filterStatus);
            try {
                const url = filterStatus === 'all' 
                    ? '/orders/allorder' 
                    : `/orders/allorder?status=${filterStatus}`;
                const res = await api.get(url);
                console.log('API Response:', res.data);
                return res.data;
            } catch (err) {
                console.error('API Error Details:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                throw err;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
        keepPreviousData: true,
    });

    // Manual refresh function
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        toast.loading('Refreshing orders...', { id: 'refresh' });
        try {
            await refetch();
            toast.success('Orders refreshed successfully!', { id: 'refresh' });
        } catch (err) {
            console.error('Refresh error:', err);
            toast.error('Failed to refresh orders', { id: 'refresh' });
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    // Update order status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status, note }) => {
            const res = await api.put(`/orders/update-status/${orderId}`, { status, note });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Order status updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setTimeout(() => {
                refetch();
            }, 500);
            setShowStatusModal(false);
            setSelectedOrder(null);
            setNewStatus('');
            setStatusNote('');
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });

    // Delete order mutation
    const deleteOrderMutation = useMutation({
        mutationFn: async (orderId) => {
            const res = await api.delete(`/orders/${orderId}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Order deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setTimeout(() => {
                refetch();
            }, 500);
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete order');
        }
    });

    const handleStatusUpdate = () => {
        if (selectedOrder && newStatus) {
            updateStatusMutation.mutate({
                orderId: selectedOrder._id,
                status: newStatus,
                note: statusNote
            });
        }
    };

    const handleDeleteOrder = (orderId) => {
        if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            deleteOrderMutation.mutate(orderId);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        return status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    // Safe data extraction
    const orderList = ordersData?.data || ordersData?.orders || [];
    
    console.log('Rendering with:', {
        ordersData,
        orderListLength: orderList.length,
        filterStatus,
        isFetching,
        isLoading,
        isError,
        errorMessage: error?.message
    });

    // Statistics
    const stats = {
        total: orderList.length,
        pending: orderList.filter(o => o?.orderStatus === 'pending').length,
        processing: orderList.filter(o => o?.orderStatus === 'processing').length,
        shipped: orderList.filter(o => o?.orderStatus === 'shipped').length,
        delivered: orderList.filter(o => o?.orderStatus === 'delivered').length,
        cancelled: orderList.filter(o => o?.orderStatus === 'cancelled').length,
        totalRevenue: orderList.reduce((sum, o) => sum + (o?.total || 0), 0)
    };

    // Loading state
    if (isLoading && !ordersData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <div className="text-lg">Loading orders...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                    <div className="text-red-600 text-lg font-semibold mb-2">
                        ⚠️ Error Loading Orders
                    </div>
                    <div className="text-red-500 mb-4">
                        {error?.response?.data?.message || error?.message || 'Failed to load orders'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                        Please check your API endpoint and authentication
                    </div>
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                        {isRefreshing ? <FaSpinner className="animate-spin" /> : null}
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isFetching}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {(isRefreshing || isFetching) && <FaSpinner className="animate-spin" />}
                    {isRefreshing || isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Orders</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Pending</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Processing</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Shipped</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Delivered</div>
                    <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Cancelled</div>
                    <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <div className="text-2xl font-bold">{formatPriceBDT(stats.totalRevenue)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-2 flex-wrap">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded capitalize ${
                            filterStatus === status 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {status === 'all' ? 'All Orders' : status}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {orderList.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 text-lg">No orders found</p>
                    <button 
                        onClick={handleRefresh}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orderList.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{order.user?.name || order.shippingAddress?.name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{formatPriceBDT(order.total)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment?.status)}`}>
                                            {order.payment?.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowViewModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setNewStatus(order.orderStatus);
                                                setShowStatusModal(true);
                                            }}
                                            className="text-green-600 hover:text-green-900 mr-3"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Order Modal */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold">Order Details</h2>
                                <p className="text-gray-600">Order ID: {selectedOrder.orderId}</p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Order Status Banner */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <span className="text-sm text-gray-600">Order Status:</span>
                                    <span className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        {selectedOrder.orderStatus?.toUpperCase() || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Payment Status:</span>
                                    <span className={`ml-2 px-2 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.payment?.status)}`}>
                                        {selectedOrder.payment?.status?.toUpperCase() || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Payment Method:</span>
                                    <span className="ml-2 text-sm font-semibold uppercase">
                                        {selectedOrder.payment?.method || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">IP Address</p>
                                        <p className="font-medium">{selectedOrder.ipAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Shipping Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Address Line 1</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.addressLine1 || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Address Line 2</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.addressLine2 || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">City</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Area</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.area || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Post Code</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.postCode || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Country</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Shipping Area</p>
                                        <p className="font-medium">{selectedOrder.shippingArea || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={item._id || index} className="border rounded-lg p-4">
                                            <div className="flex gap-4">
                                                {item.image && (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                                                    
                                                    {/* Size Information */}
                                                    {item.size && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getSizeTypeIcon(item.size.type)}
                                                            <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-medium">
                                                                Size: {item.size.name}
                                                            </span>
                                                            {item.size.extraPrice > 0 && (
                                                                <span className="text-xs text-green-600">
                                                                    +{formatPriceBDT(item.size.extraPrice)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Color Information */}
                                                    {item.color && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <FaPalette className="text-xs text-pink-500" />
                                                            <span className="text-xs bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 font-medium">
                                                                Color: {item.color.name}
                                                            </span>
                                                            {item.color.hexCode && (
                                                                <div 
                                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                                    style={{ backgroundColor: item.color.hexCode }}
                                                                    title={item.color.name}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                                                    <p className="text-sm text-gray-600">Unit Price: {formatPriceBDT(item.price)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-lg">{formatPriceBDT(item.totalPrice)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Order Summary</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">{formatPriceBDT(selectedOrder.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Shipping Cost:</span>
                                            <span className="font-medium">{formatPriceBDT(selectedOrder.shippingCost)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="font-medium">{formatPriceBDT(selectedOrder.tax)}</span>
                                        </div>
                                        {selectedOrder.discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-{formatPriceBDT(selectedOrder.discount)}</span>
                                            </div>
                                        )}
                                        {selectedOrder.couponDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount:</span>
                                                <span>-{formatPriceBDT(selectedOrder.couponDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-2 border-t mt-2">
                                            <span className="font-bold text-lg">Total:</span>
                                            <span className="font-bold text-lg">{formatPriceBDT(selectedOrder.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">Order Timeline</h3>
                                    <div className="space-y-3">
                                        {selectedOrder.statusTimeline.map((timeline, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded">
                                                <div className="w-40 shrink-0">
                                                    <p className="text-sm font-medium">
                                                        {new Date(timeline.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold capitalize">{timeline.status}</p>
                                                    {timeline.note && (
                                                        <p className="text-sm text-gray-600 mt-1">{timeline.note}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Updated by: {timeline.updatedBy}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Additional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Created At</p>
                                        <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Updated</p>
                                        <p className="font-medium">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">User Agent</p>
                                        <p className="font-medium text-sm">{selectedOrder.userAgent || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Notes</p>
                                        <p className="font-medium">{selectedOrder.notes || 'No notes'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedOrder(selectedOrder);
                                    setNewStatus(selectedOrder.orderStatus);
                                    setShowStatusModal(true);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Update Status
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Print Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                Update Order Status - {selectedOrder.orderId}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Note (Optional)
                                    </label>
                                    <textarea
                                        value={statusNote}
                                        onChange={(e) => setStatusNote(e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add a note about this status update..."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={updateStatusMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedOrder(null);
                                        setNewStatus('');
                                        setStatusNote('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderPage;