import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const SIZE_TYPES = [
  { value: "men", label: "Men's Sizes", icon: "👨" },
  { value: "women", label: "Women's Sizes", icon: "👩" },
  { value: "unisex", label: "Unisex Sizes", icon: "👥" },
  { value: "kids", label: "Kids' Sizes", icon: "👶" },
];

const ProductSizeManager = ({
  sizes = [],
  onSizesChange,
  disabled = false,
  sizeGroups = [],
}) => {
  const [editingSize, setEditingSize] = useState(null);
  
  // Extract unique size types from backend data
  const sizeTypes = [...new Set(sizeGroups.map((item) => item.SizeType))];

  const [activeTab, setActiveTab] = useState("");
  const [quantities, setQuantities] = useState({});

  // Auto-select the first tab if available
  useEffect(() => {
    if (sizeTypes.length > 0 && !activeTab) {
      setActiveTab(sizeTypes[0]);
    }
  }, [sizeTypes, activeTab]);

  const handleQuantityChange = (sizeName, value) => {
    setQuantities({
      ...quantities,
      [sizeName]: value,
    });
  };

  const handleAddSize = (backendSize) => {
    const qty = Number(quantities[backendSize.size]) || 0;
    if (qty <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    // Check for duplicate in the added list
    if (sizes.some((s) => s.name === backendSize.size)) {
      alert(`Size "${backendSize.size}" is already added.`);
      return;
    }

    const sizeToAdd = {
      name: backendSize.size,
      type: activeTab,
      quantity: qty,
      extraPrice: backendSize.extraPrice || 0,
      isActive: true,
    };

    const updatedSizes = [...sizes, sizeToAdd];
    onSizesChange(updatedSizes);

    // Reset quantity input for this specific size after adding
    setQuantities({
      ...quantities,
      [backendSize.size]: "",
    });
  };

  const handleUpdateSize = () => {
    if (!editingSize) return;

    // Only update the quantity since size and extraPrice come from backend
    const updatedSizes = sizes.map((s) =>
      s.name === editingSize.originalName
        ? { ...s, quantity: editingSize.quantity }
        : s,
    );
    onSizesChange(updatedSizes);
    setEditingSize(null);
  };

  const handleRemoveSize = (sizeName) => {
    if (window.confirm(`Remove size "${sizeName}"?`)) {
      const updatedSizes = sizes.filter((s) => s.name !== sizeName);
      onSizesChange(updatedSizes);
    }
  };
  
  const getSizeBySizeType = (type) => {
    return sizeGroups.filter((item) => item.SizeType === type);
  };
  
  const filteredSizes = getSizeBySizeType(activeTab);
  const currentSizes = filteredSizes.length > 0 ? filteredSizes[0].size : [];

  // Group added sizes by their type for the list view
  const groupedSizes = sizes.reduce((acc, size) => {
    if (!acc[size.type]) acc[size.type] = [];
    acc[size.type].push(size);
    return acc;
  }, {});

  const getTypeInfo = (typeValue) => {
    return SIZE_TYPES.find(t => t.value.toLowerCase() === typeValue.toLowerCase()) || { label: typeValue, icon: "🏷️" };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Size Management
          </h3>
          <p className="text-sm text-gray-500">
            Select sizes from the available options and set quantities
          </p>
          
          {/* Tabs for Size Types */}
          {sizeTypes.length > 0 && (
            <div className="flex gap-3 mt-4 mb-5">
              {sizeTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-5 py-2 rounded-lg border transition-all capitalize ${
                    activeTab === type
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backend Sizes Available to Add */}
      {currentSizes.length > 0 ? (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-700 capitalize">Available {activeTab} Sizes</h4>
          {currentSizes.map((sizeObj, index) => {
            const isAdded = sizes.some((s) => s.name === sizeObj.size);
            
            return (
              <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Size (Auto-filled & ReadOnly) */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-gray-500 mb-1">Size</label>
                    <input
                      type="text"
                      value={sizeObj.size || ""}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
                    />
                  </div>

                  {/* Extra Price (Auto-filled & ReadOnly) */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-gray-500 mb-1">Extra Price (৳)</label>
                    <input
                      type="number"
                      value={sizeObj.extraPrice || 0}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Quantity (User Input) */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={quantities[sizeObj.size] || ""}
                      onChange={(e) => handleQuantityChange(sizeObj.size, e.target.value)}
                      disabled={isAdded}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none ${isAdded ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  {/* Add Button */}
                  <div className="flex items-end mt-1">
                    <button
                      type="button"
                      onClick={() => handleAddSize(sizeObj)}
                      disabled={isAdded}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors h-10 ${
                        isAdded
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      <FaPlus className="text-sm" /> 
                      {isAdded ? "Added" : "Add Size"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        sizeTypes.length > 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed mb-6">
            <p className="text-gray-500">No sizes found for the selected type.</p>
          </div>
        )
      )}

      {/* Added Sizes Inventory List */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 text-lg border-b pb-2">Added Sizes Inventory</h4>
          
          {Object.keys(groupedSizes).map((typeValue) => {
            const typeSizes = groupedSizes[typeValue] || [];
            if (typeSizes.length === 0) return null;
            
            const typeInfo = getTypeInfo(typeValue);

            return (
              <div
                key={typeValue}
                className="border rounded-lg overflow-hidden bg-white shadow-sm"
              >
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h4 className="font-medium text-gray-800 capitalize flex items-center gap-2">
                    <span>{typeInfo.icon}</span> {typeInfo.label || `${typeValue} Sizes`}
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Extra Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeSizes.map((size) => (
                        <tr key={size.name} className="border-t hover:bg-gray-50">
                          {editingSize?.originalName === size.name ? (
                            // Edit Mode (Only quantity can be edited)
                            <>
                              <td className="px-4 py-3">
                                <span className="font-medium text-gray-700">{size.name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-gray-600">
                                  {size.extraPrice > 0 ? `৳${size.extraPrice}` : "-"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={editingSize.quantity}
                                  onChange={(e) =>
                                    setEditingSize({
                                      ...editingSize,
                                      quantity: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-24 px-2 py-1.5 border rounded focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={handleUpdateSize}
                                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                    title="Save"
                                  >
                                    <FaSave size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSize(null)}
                                    className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <FaTimes size={18} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {size.name}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {size.extraPrice > 0
                                  ? `৳${size.extraPrice}`
                                  : "-"}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                  {size.quantity} units
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {!disabled && (
                                  <div className="flex justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingSize({
                                          ...size,
                                          originalName: size.name,
                                        })
                                      }
                                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                      title="Edit Quantity"
                                    >
                                      <FaEdit size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveSize(size.name)
                                      }
                                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                      title="Remove"
                                    >
                                      <FaTrash size={16} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {sizes.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">
              Total Inventory:{" "}
              <span className="text-lg font-bold">
                {sizes.reduce((sum, size) => sum + size.quantity, 0)}
              </span>{" "}
              units
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Total product quantity is automatically calculated from all added sizes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSizeManager;