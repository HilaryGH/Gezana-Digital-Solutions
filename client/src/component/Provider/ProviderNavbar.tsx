import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../Avatar";
import { Menu, X } from "lucide-react";

const ProviderNavbar = () => {
  const [userName, setUserName] = useState("GU");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "GU";

  const navLinks = [
    { to: "/provider-dashboard", label: "Dashboard" },
    { to: "/provider/bookings", label: "Bookings" },
    { to: "/provider/add-service", label: "Add Service" },
    { to: "/my-profile", label: "My Profile" },
    { to: "/provider/service-lists", label: "Service lists" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Top navbar */}
      <nav className="bg-white text-orange-900 p-4 flex justify-between items-center shadow-md fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <img
            src="/logo 3.png"
            alt="Logo"
            className="w-auto h-12 object-contain"
          />
          <span className="text-xl font-bold text-orange-800 hidden sm:block">
            Gezana Providers
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <Avatar name={initials} />
            <span className="font-semibold text-lg truncate">{userName}</span>
          </div>
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-56 h-screen bg-white text-orange-900 fixed top-16 left-0 pt-8 shadow-md z-30">
        <nav className="flex-grow flex flex-col mt-4 space-y-4 px-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `py-3 px-6 text-sm hover:bg-orange-200 transition-colors duration-200 ${
                  isActive ? "bg-orange-300 font-semibold" : "font-medium"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-orange-300">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 rounded py-2 font-semibold text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile menu drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-40 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-16 left-0 z-50 w-3/4 h-full bg-white p-6 space-y-6 shadow-lg overflow-auto">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar name={initials} />
              <span className="font-semibold text-lg truncate">{userName}</span>
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block text-orange-700 font-semibold text-lg"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-orange-600 hover:bg-orange-400 rounded py-2 font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default ProviderNavbar;
