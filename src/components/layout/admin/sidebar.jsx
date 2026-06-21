"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IoIosClose,
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosArrowDown,
} from "react-icons/io";
import { FaProductHunt, FaUser, FaCog } from "react-icons/fa";
import {
  MdBorderAll,
  MdBrandingWatermark,
  MdCategory,
  MdDeliveryDining,
  MdPayment,
  MdDashboard,
  MdDiscount,
  MdChevronRight,
  MdLocalOffer,
} from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import { GiLeatherBoot, GiHandbag } from "react-icons/gi";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <MdDashboard className="text-lg" />,
    color: "text-amber-400",
  },
  {
    name: "Categories",
    href: "/category",
    icon: <MdCategory className="text-lg" />,
    color: "text-emerald-400",
    subItems: [
      {
        name: "All Categories",
        href: "/category/all",
        color: "text-emerald-300",
      }
    ],
  },
  {
    name: "Brands",
    href: "/brands",
    icon: <MdBrandingWatermark className="text-lg" />,
    color: "text-blue-400",
    subItems: [
      { name: "All Brands", href: "/brands/all", color: "text-blue-300" },

    ],
  },
  {
    name: "Product Size & Color", 
    href: "/product-attributes",
    icon: <GiLeatherBoot className="text-lg" />,
    color: "text-yellow-400",
    subItems: [
      { name: "Sizes", href: "/product-attributes/sizes", color: "text-yellow-300" },
      { name: "Colors", href: "/product-attributes/colors", color: "text-yellow-300" },
    ],
  },
  {
    name: "Products",
    href: "/products",
    icon: <FaProductHunt className="text-lg" />,
    color: "text-purple-400",
    subItems: [
      { name: "All Products", href: "/products", color: "text-purple-300" },
    ],
  },
  {
    name: "Discount Offers",
    href: "/discounts",
    icon: <MdDiscount className="text-lg" />,
    color: "text-red-400",
    subItems: [
      {
        name: "Active Discounts",
        href: "/discounts/all",
        color: "text-red-300",
      },
      { name: "Add Discount", href: "/discounts/add", color: "text-red-300" },
    ],
  },
  {
    name: "Coupons Offers",
    href: "/coupons",
    icon: <MdLocalOffer className="text-lg" />,
    color: "text-green-400",
    subItems: [
      { name: "All Coupons", href: "/coupons", color: "text-green-300" },
    ],
  },
  {
    name: "Users",
    href: "/users",
    icon: <FaUser className="text-lg" />,
    color: "text-cyan-400",
    subItems: [
      { name: "All Users", href: "/users", color: "text-cyan-300" },

    ],
  },
  {
    name: "Delivery",
    href: "/delivery_cost",
    icon: <MdDeliveryDining className="text-lg" />,
    color: "text-orange-400",
    subItems: [
      {
        name: "Delivery Settings",
        href: "/delivery_cost/settings",
        color: "text-orange-300",
      },
      {
        name: "Delivery Zones",
        href: "/delivery_cost/zones",
        color: "text-orange-300",
      },
    ],
  },
  {
    name: "Orders",
    href: "/orders",
    icon: <MdBorderAll className="text-lg" />,
    color: "text-indigo-400",
    subItems: [
      { name: "All Orders", href: "/orders", color: "text-indigo-300" },
    ],
  },
  {
    name: "Transaction",
    href: "/transaction",
    icon: <MdPayment className="text-lg" />,
    color: "text-green-400",
    subItems: [
      {
        name: "All Transactions",
        href: "/transaction",
        color: "text-green-300",
      },
    ],
  }
 
];

export default function Sidebar({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileClose,
}) {
  const pathname = usePathname();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (itemName) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const isSubItemActive = (subItems) => {
    return subItems?.some((subItem) => pathname === subItem.href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}
      <div
        className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 bg-linear-to-b from-gray-900 to-gray-800 shadow-2xl transition-all duration-300 ease-in-out h-screen overflow-y-auto
          ${isOpen ? "w-72" : "lg:w-20"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 5px;
          }
          div::-webkit-scrollbar-track {
            background: #374151;
          }
          div::-webkit-scrollbar-thumb {
            background: #f59e0b;
            border-radius: 5px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #d97706;
          }
        `}</style>

        {/* Sidebar Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between h-16 px-5 bg-linear-to-r from-amber-800 to-amber-900 transition-all duration-300 ${!isOpen && "lg:justify-center lg:px-3"}`}
        >
          {isOpen ? (
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-base font-bold text-white">Admin Panel</h1>
                <p className="text-[10px] text-amber-300">AIS DiscountMart</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img
                src="/icon.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
          )}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded-md hover:bg-amber-700 transition-colors text-white"
          >
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        {/* Admin Profile Summary - Sticky */}
        {isOpen ? (
          <div className="sticky top-16 z-10 p-4 border-b border-gray-700 bg-gray-900">
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
              <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-bold text-lg">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-400 truncate">
                  admin@aisdiscountmart.com
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky top-16 z-10 p-3 border-b border-gray-700 flex justify-center bg-gray-900">
            <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AD</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={`mt-6 px-3 overflow-y-auto transition-all duration-300 pb-24`}
          style={{ height: "calc(100vh - 160px)" }}
        >
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isSubMenuOpen = openSubMenus[item.name];
              const isAnySubItemActive = isSubItemActive(item.subItems);

              return (
                <div key={item.name}>
                  {/* Main Menu Item */}
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (hasSubItems && isOpen) {
                        e.preventDefault();
                        toggleSubMenu(item.name);
                      } else if (hasSubItems && !isOpen) {
                        e.preventDefault();
                        onToggle();
                        setTimeout(() => {
                          toggleSubMenu(item.name);
                        }, 300);
                      } else {
                        onMobileClose?.();
                      }
                    }}
                    className={`
                      flex items-center rounded-lg transition-all duration-300 group
                      ${isOpen ? "px-3 py-2.5 gap-3" : "lg:px-2 lg:py-3 lg:justify-center"}
                      ${
                        isActive || isAnySubItemActive
                          ? "bg-linear-to-r from-amber-500/20 to-amber-600/10 text-amber-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-amber-400"
                      }
                    `}
                    title={!isOpen ? item.name : ""}
                  >
                    <span
                      className={`${item.color} group-hover:text-amber-400 transition ${!isOpen && "lg:text-xl"}`}
                    >
                      {item.icon}
                    </span>
                    {isOpen && (
                      <>
                        <span className="text-sm font-medium flex-1">
                          {item.name}
                        </span>
                        {hasSubItems && (
                          <span className="text-gray-500">
                            {isSubMenuOpen ? (
                              <IoIosArrowDown className="text-xs" />
                            ) : (
                              <MdChevronRight className="text-sm" />
                            )}
                          </span>
                        )}
                        {item.name === "Discount Offers" && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                            HOT
                          </span>
                        )}
                      </>
                    )}
                  </Link>

                  {/* Sub-menu Items */}
                  {hasSubItems && isOpen && isSubMenuOpen && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-gray-700 pl-2">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`
                              flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm
                              ${
                                isSubActive
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "text-gray-500 hover:bg-gray-800 hover:text-amber-400"
                              }
                            `}
                            onClick={() => onMobileClose?.()}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                            <span className="text-xs">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Logout Button - Sticky Bottom */}
        <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
          <button
            className={`
              flex items-center rounded-lg transition-all duration-300 w-full
              ${isOpen ? "gap-3 px-4 py-2.5" : "lg:justify-center lg:px-2 lg:py-3"}
              text-gray-400 hover:bg-red-500/20 hover:text-red-400
            `}
            title={!isOpen ? "Logout" : ""}
          >
            <HiOutlineLogout className="text-lg" />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
          {isOpen && (
            <p className="text-center text-[10px] text-gray-600 mt-2">
              © 2024 AIS DiscountMart
            </p>
          )}
        </div>

        {/* Collapse Toggle Button - Desktop only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-amber-600 rounded-full items-center justify-center shadow-lg hover:bg-amber-500 transition-all duration-300 z-50 hover:scale-110"
        >
          {isOpen ? (
            <IoIosArrowBack className="text-white text-sm" />
          ) : (
            <IoIosArrowForward className="text-white text-sm" />
          )}
        </button>
      </div>
    </>
  );
}
