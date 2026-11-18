"use client";

import { useAuth } from "@/AuthProvider/AuthProvider";
import api from "@/config/api";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Profile = () => {
  const { user, checkUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      postalCode: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          postalCode: user.address?.postalCode || "",
      
        }
      });
    }
  }, [user]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email format";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
        if (!phoneRegex.test(value)) return "Invalid phone number format";
        return "";

      case "address.street":
        if (!value.trim()) return "Street address is required";
        return "";

      case "address.city":
        if (!value.trim()) return "City is required";
        return "";

      case "address.postalCode":
        // Accept any number, postal code, or zip code without strict format restriction
        return "";

      default:
        return "";
    }
  };

  // Validate all fields
  const validateAll = () => {
    const newErrors = {};

    // Validate name
    const nameError = validateField("name", formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate email
    const emailError = validateField("email", formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate phone
    const phoneError = validateField("phone", formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    // Validate address fields
    Object.keys(formData.address).forEach((addrKey) => {
      const error = validateField(
        `address.${addrKey}`,
        formData.address[addrKey],
      );
      if (error) newErrors[`address.${addrKey}`] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));

      // Only validate if touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? e.target.checked : value,
      }));

      // Only validate if touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let value = "";
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      value = formData.address[addressField];
    } else {
      value = formData[name];
    }

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle save
  const handleSave = async () => {
    if (validateAll()) {
    
      
      try {
        const res = await api.put('/auth/edit_profile', formData);
        if (res.data.success) {
          toast.success(res.data.message || "Profile updated successfully");
          if (checkUser) {
            await checkUser();
          }
        } else {
          toast.error("Failed to update profile. Please try again.");
        }
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving profile:", error);
        toast.error("Failed to update profile. Please try again.");
      }
    } else {
      // Mark all fields as touched to show errors
      const allFields = {
        name: true,
        email: true,
        phone: true,
        "address.street": true,
        "address.city": true,
        "address.postalCode": true,
      };
      setTouched(allFields);
    }
  };

  // Check if a field has an error
  const hasError = (fieldName) => {
    return touched[fieldName] && !!errors[fieldName];
  };

  // Get input classes based on validation state
  const getInputClasses = (fieldName, isEmptyField) => {
    const baseClasses =
      "w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2";

    if (!isEditing) {
      return `${baseClasses} bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed`;
    }

    if (isEmptyField && !touched[fieldName]) {
      return `${baseClasses} border-amber-300 focus:ring-amber-500 focus:border-amber-500`;
    }

    if (hasError(fieldName)) {
      return `${baseClasses} border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50`;
    }

    if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClasses} border-green-500 focus:ring-green-500 focus:border-green-500 bg-green-50`;
    }

    return `${baseClasses} border-gray-300 focus:ring-amber-500 focus:border-amber-500`;
  };

  // Check if field is empty
  const isEmpty = (value) => {
    return !value || (typeof value === "string" && !value.trim());
  };

  // Get initials from name
  const getInitials = () => {
    if (!formData.name) return "?";
    const nameParts = formData.name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Personal Information
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Update your personal details and preferences
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaEdit className="text-sm" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original user data when canceling
                  if (user) {
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      address: {
                        street: user.address?.street || "",
                        city: user.address?.city || "",
                        postalCode: user.address?.postalCode || "",
                      }
                    });
                  }
                  setErrors({});
                  setTouched({});
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-all duration-300"
              >
                <FaTimes className="text-sm" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaSave className="text-sm" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {getInitials()}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition">
                  <FaCamera className="text-xs" />
                </button>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                Profile Picture
              </h4>
              <p className="text-gray-600 text-sm">
                Click the camera icon to change your photo
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaUser className="text-amber-500" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.name)
                    ? "Please fill this field"
                    : "Enter your full name"
                }
                className={getInputClasses(
                  "name",
                  isEmpty(formData.name),
                )}
              />
              {hasError("name") && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
              {!isEditing &&
                isEmpty(formData.name) &&
                !hasError("name") && (
                  <p className="text-amber-500 text-xs mt-1">
                    ⚠️ This field is empty
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.email)
                    ? ""
                    : "Never Change Your Email"
                }
                readOnly={isEditing}
                className={getInputClasses("email", isEmpty(formData.email))}
              />
              {hasError("email") && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
              {!isEditing && isEmpty(formData.email) && !hasError("email") && (
                <p className="text-amber-500 text-xs mt-1">
                  ⚠️ This field is empty
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.phone)
                    ? "Please fill this field"
                    : "Enter your phone number"
                }
                className={getInputClasses("phone", isEmpty(formData.phone))}
              />
              {hasError("phone") && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
              {!isEditing && isEmpty(formData.phone) && !hasError("phone") && (
                <p className="text-amber-500 text-xs mt-1">
                  ⚠️ This field is empty
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-amber-500" />
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.address.street)
                    ? "Please fill this field"
                    : "Enter your street address"
                }
                className={getInputClasses(
                  "address.street",
                  isEmpty(formData.address.street),
                )}
              />
              {hasError("address.street") && (
                <p className="text-red-500 text-xs mt-1">
                  {errors["address.street"]}
                </p>
              )}
              {!isEditing &&
                isEmpty(formData.address.street) &&
                !hasError("address.street") && (
                  <p className="text-amber-500 text-xs mt-1">
                    ⚠️ This field is empty
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.address.city)
                    ? "Please fill this field"
                    : "Enter your city"
                }
                className={getInputClasses(
                  "address.city",
                  isEmpty(formData.address.city),
                )}
              />
              {hasError("address.city") && (
                <p className="text-red-500 text-xs mt-1">
                  {errors["address.city"]}
                </p>
              )}
              {!isEditing &&
                isEmpty(formData.address.city) &&
                !hasError("address.city") && (
                  <p className="text-amber-500 text-xs mt-1">
                    ⚠️ This field is empty
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal / ZIP Code
              </label>
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!isEditing}
                placeholder={
                  !isEditing && isEmpty(formData.address.postalCode)
                    ? "Not provided"
                    : "Enter postal or zip code (any number)"
                }
                className={getInputClasses(
                  "address.postalCode",
                  isEmpty(formData.address.postalCode),
                )}
              />
              {hasError("address.postalCode") && (
                <p className="text-red-500 text-xs mt-1">
                  {errors["address.postalCode"]}
                </p>
              )}
              {!isEditing &&
                isEmpty(formData.address.postalCode) &&
                !hasError("address.postalCode") && (
                  <p className="text-amber-500 text-xs mt-1">
                    ⚠️ This field is empty
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {isEditing && Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 font-medium mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-500">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;