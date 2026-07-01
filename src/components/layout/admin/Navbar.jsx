"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoIosMenu } from "react-icons/io";
import { FaSearch, FaBell, FaEnvelope, FaBars } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Add this import
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/AuthProvider/AuthProvider";
import toast from "react-hot-toast";

const AdminNavbar = ({ onMenuClick, onCollapseClick, isSidebarCollapsed }) => {
  const [openUserModel, setOpenUserModel] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userModelRef = useRef(null);
  const { logout,user } = useAuth();
  const router = useRouter(); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userModelRef.current && !userModelRef.current.contains(event.target)) {
        setOpenUserModel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logoutHandler = async() => {
    try {
      const result = await logout();
      if(result.status === 200){
        toast.success("Logged out successfully");
        router.push("/auth/login");
        router.refresh();
      }
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  }

  return (
    <header 
      className={`
        transition-all duration-300 w-full
        ${isScrolled 
          ? "bg-linear-to-r from-gray-900 to-gray-800 shadow-2xl py-2" 
          : "bg-linear-to-r from-gray-900 to-gray-800 shadow-lg py-3"
        }
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300 lg:hidden"
          >
            <IoIosMenu className="text-2xl text-white" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onCollapseClick}
            className="hidden lg:flex p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <FaBars className="text-white" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="hidden sm:block">
              <span className="text-sm font-bold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                DiscountStore
              </span>
              <p className="text-[10px] text-amber-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="hidden md:flex relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all duration-300"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-105">
            <FaBell className="text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Messages */}
          <button className="relative p-2 text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-105">
            <FaEnvelope className="text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <div ref={userModelRef} className="relative">
            <button
              onClick={() => setOpenUserModel(!openUserModel)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-700 transition-all duration-300 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-500 group-hover:border-amber-400 transition-all duration-300">
                <img 
                  src="/admin-avatar.jpg" 
                  alt="Admin" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-white">Admin User</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
              <ChevronDown 
                className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform duration-300 ${openUserModel ? "rotate-180" : ""}`} 
              />
            </button>

            {openUserModel && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 shadow-2xl rounded-xl border border-gray-700 overflow-hidden z-50 animate-fadeIn">
                <div className="bg-linear-to-r from-amber-900/50 to-gray-800 p-4 border-b border-gray-700 flex items-center gap-3">
                  <img 
                    src="/admin-avatar.jpg" 
                    alt="Admin" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500" 
                  />
                  <div>
                    <h2 className="font-semibold text-white">{user.name}</h2>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Active
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-amber-500/20 hover:text-amber-400 transition"
                    onClick={() => setOpenUserModel(false)}
                  >
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <button 
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 w-full transition"
                    onClick={logoutHandler}
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;