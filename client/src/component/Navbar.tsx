import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <nav className="bg-black text-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <img
            src="Gezana-logo.PNG"
            alt="Logo"
            className="h-12 md:h-16 object-contain"
          />

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6 items-center">
            <li>
              <a href="#about" className="hover:text-gray-300 transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-gray-300 transition">
                Services Offered
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-gray-300 transition">
                Contact Us
              </a>
            </li>
            <li>
              <button
                className="hover:text-orange-400 border border-white px-4 py-1 rounded transition"
                onClick={() => setAuthModalOpen(true)}
              >
                Login / Signup
              </button>
            </li>
          </ul>

          {/* Hamburger Icon */}
          <div className="md:hidden cursor-pointer" onClick={toggleMenu}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </div>
        </div>

        {/* Slide-in Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-black text-white z-50 transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 shadow-lg md:hidden`}
        >
          <div className="p-4 flex flex-col space-y-4">
            <div className="flex justify-between items-center mb-4">
              <img
                src="logo 3.png"
                alt="Logo"
                className="h-10 object-contain"
              />
              <FaTimes
                size={20}
                className="cursor-pointer text-white"
                onClick={toggleMenu}
              />
            </div>

            <hr />
            <a
              href="#about"
              className="hover:text-orange-600 cursor-pointer"
              onClick={toggleMenu}
            >
              About
            </a>
            <a
              href="#services"
              className="hover:text-orange-600 cursor-pointer"
              onClick={toggleMenu}
            >
              Services Offered
            </a>
            <a
              href="#contact"
              className="hover:text-orange-600 cursor-pointer"
              onClick={toggleMenu}
            >
              Contact
            </a>

            <button
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
              onClick={() => {
                toggleMenu();
                setAuthModalOpen(true);
              }}
            >
              Login / Signup
            </button>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
