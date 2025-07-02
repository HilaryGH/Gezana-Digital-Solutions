import { useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../Avatar";
import { Menu, X } from "lucide-react";

const AdminNavbar = () => {
  const userName = localStorage.getItem("name") || "GU";
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/admin-dashboard", label: "Dashboard" },
    { to: "/admin/user", label: "Users" },
    { to: "/admin/bookings", label: "Bookings" },
    { to: "/admin/services", label: "Services" },
    { to: "/admin/Providers-list", label: "Providers" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-orange-50 shadow-md px-4 py-3 md:pl-60 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <img
            src="/logo 3.png"
            alt="Gezana Logo"
            className="h-12 w-auto object-contain"
          />
          <span className="text-xl font-extrabold text-orange-800 hidden sm:block">
            Gezana Digital Solutions
          </span>
        </div>

        {/* Avatar and Hamburger */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-orange-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logout on desktop */}
          <button
            onClick={handleLogout}
            className="hidden md:block bg-orange-800 hover:bg-red-600 text-white rounded py-2 px-4 font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-64px)] w-56 bg-orange-50 shadow-md text-orange-900 px-4 py-6 flex flex-col space-y-4 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Navigation Links */}
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `py-3 px-4 rounded text-sm transition-colors ${
                isActive
                  ? "bg-orange-300 font-semibold"
                  : "hover:bg-orange-200 font-medium"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        {/* Mobile Logout Button */}
        <div className="pt-6 mt-auto border-t border-orange-300 md:hidden">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded py-2 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar;
