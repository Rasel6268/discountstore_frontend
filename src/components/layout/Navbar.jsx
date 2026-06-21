"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { AiOutlineShoppingCart } from "react-icons/ai";
import {
  FaInfoCircle,
  FaRegHeart,
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { FcAbout } from "react-icons/fc";
import Link from "next/link";
import {
  UserRoundPlus,
  LogIn,
  House,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/AuthProvider/AuthProvider";
import { useCart } from "@/hooks/useCart";
import Marquee from "react-fast-marquee";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "@/AuthProvider/ThemeContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openUserModel, setOpenUserModel] = useState(false);
  const [openCategoriesDropdown, setOpenCategoriesDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userModelRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { getTotalItems, items: cartItems } = useCart();
  const router = useRouter();
  const { theme, toggleTheme, mounted: themeMounted } = useTheme();

  // Handle mounting to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userModelRef.current &&
        !userModelRef.current.contains(event.target)
      ) {
        setOpenUserModel(false);
      }
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target)
      ) {
        setOpenCategoriesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUserModel = () => setOpenUserModel(!openUserModel);
  const toggleMobileMenu = () => setIsMenuOpen(!isMenuOpen);

  // Get cart count (total items including quantities)
  const cartCount = mounted ? getTotalItems() : 0;



  // Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      console.log(result)
      if (result.status === 200) {
        setIsLoggingOut(false);
        toast.success("Logged out successfully");
        router.push("/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-blue-950 shadow-2xl transition-colors duration-300">
      {/* Announcement Bar */}
      <Marquee
        pauseOnHover={true}
        className="bg-linear-to-r from-amber-600 to-amber-700 text-white py-2.5 px-4 text-center text-sm font-medium"
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Eid Special Offer
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 15 8 17 9 13 6 10 10 10 12 6" />
          </svg>
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Free shipping for all orders from $60.00
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 15 8 17 9 13 6 10 10 10 12 6" />
          </svg>
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Summer sale discount 50% off
          </span>
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Free shipping for all orders from $60.00
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 15 8 17 9 13 6 10 10 10 12 6" />
          </svg>
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Instant discount code 50% off M06LY6
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 15 8 17 9 13 6 10 10 10 12 6" />
          </svg>
          <span className="flex items-center gap-1 font-bold text-[16px]">
            Free shipping for all orders from $60.00
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 6 14 10 18 10 15 13 16 17 12 15 8 17 9 13 6 10 10 10 12 6" />
          </svg>
        </div>
      </Marquee>

      <div className="w-11/12 mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dlaeg7qjm/image/upload/q_auto/f_auto/v1781946003/ChatGPT_Image_Jun_20_2026_02_38_14_PM_sqijgu.png"
            alt="Discount Store"
            className="h-15 w-auto object-contain"
            style={{ maxHeight: "60px" }}
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 font-medium">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300"
          >
            <House className="w-4 h-4" /> Home
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300"
          >
            <FaShoppingCart className="w-4 h-4" /> Shop
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Search Icon */}
          <button className="hidden md:flex p-2 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300">
            <FaSearch className="text-lg" />
          </button>

          {/* Cart Icon - Desktop */}
          <Link
            href="/cart"
            className="hidden lg:flex relative p-2 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-300"
          >
            <AiOutlineShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          {themeMounted && (
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <FaSun
                  className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
                />
                <FaMoon
                  className={`absolute inset-0 text-gray-700 dark:text-gray-300 transition-all duration-300 ${theme === "light" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
                />
              </div>
            </button>
          )}
          {/* User Auth Desktop */}
          {user ? (
            <div ref={userModelRef} className="relative hidden lg:block">
              <button
                onClick={toggleUserModel}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500 hover:border-amber-400 transition-all duration-300 hover:scale-105"
              >
                <img
                  src={
                    "https://res.cloudinary.com/dlaeg7qjm/image/upload/q_auto/f_auto/v1781938843/istockphoto-588258370-612x612_nebeq7.png"
                  }
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {openUserModel && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-linear-to-r from-amber-50 to-white dark:from-amber-900/50 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <img
                      src={
                        "https://res.cloudinary.com/dlaeg7qjm/image/upload/q_auto/f_auto/v1781938843/istockphoto-588258370-612x612_nebeq7.png"
                      }
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-sm"
                    />
                    <div className="truncate">
                      <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                        {user.name || user.fullName || "John Doe"}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email || "john.doe@example.com"}
                      </p>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/cart"
                      className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                    >
                      <AiOutlineShoppingCart className="w-4 h-4" /> 
                      My Cart
                      {cartCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    {user.role === "admin" ? (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                      >
                        <User className="w-4 h-4" /> Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 w-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-5 h-5 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                          Logging out...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-5 h-5" /> Logout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg"
              >
                <UserRoundPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 relative"
          >
            {isMenuOpen ? (
              <IoIosClose className="text-2xl text-gray-900 dark:text-white" />
            ) : (
              <>
                <IoIosMenu className="text-2xl text-gray-900 dark:text-white" />
                {/* Mobile cart badge */}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-200 dark:border-gray-700 absolute w-full z-40 left-0 top-full animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2 p-4 max-h-[80vh] overflow-y-auto">
            {/* Search Bar */}
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>

            {/* Theme Toggle in Mobile Menu */}
            {themeMounted && (
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <>
                      <FaSun className="w-4 h-4 text-yellow-500" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <FaMoon className="w-4 h-4" />
                      Dark Mode
                    </>
                  )}
                </div>
                <span className="text-sm">
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </span>
              </button>
            )}

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
              onClick={toggleMobileMenu}
            >
              <House className="w-4 h-4" /> Home
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
              onClick={toggleMobileMenu}
            >
              <ShoppingBag className="w-4 h-4" /> Shop
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
              onClick={toggleMobileMenu}
            >
              <FcAbout className="w-4 h-4" /> About
            </Link>
            {user ? (
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                  <img
                    src={
                      "https://res.cloudinary.com/dlaeg7qjm/image/upload/q_auto/f_auto/v1781938843/istockphoto-588258370-612x612_nebeq7.png"
                    }
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.name || user.fullName || "John Doe"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email || "john.doe@example.com"}
                    </p>
                  </div>
                </div>
                {user.role === "admin" ? (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                    onClick={toggleMobileMenu}
                  >
                    <User className="w-4 h-4" /> Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                    onClick={toggleMobileMenu}
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" /> Logout
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                  onClick={toggleMobileMenu}
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition text-center justify-center"
                  onClick={toggleMobileMenu}
                >
                  <UserRoundPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;