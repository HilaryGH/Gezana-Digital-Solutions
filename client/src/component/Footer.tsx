import {
  FaFacebookSquare,
  FaTwitterSquare,
  FaInstagramSquare,
  FaLinkedin,
  FaYoutubeSquare,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-6 md:flex md:justify-between md:items-start space-y-10 md:space-y-0">
        {/* Quick Links */}
        <div className="md:w-1/4">
          <h3 className="text-xl font-semibold mb-5 border-b border-orange-600 pb-2">
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <a
                href="/"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/services"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Service Categories */}
        <div className="md:w-1/4">
          <h3 className="text-xl font-semibold mb-5 border-b border-orange-600 pb-2">
            Service Categories
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <a
                href="/services?category=maintenance"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Maintenance
              </a>
            </li>
            <li>
              <a
                href="/services?category=cleaning"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Cleaning
              </a>
            </li>
            <li>
              <a
                href="/services?category=home-appliances"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Home Appliances
              </a>
            </li>
            <li>
              <a
                href="/services?category=pickers-and-movers"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Pickers & Movers
              </a>
            </li>
            <li>
              <a
                href="/services?category=other"
                className="hover:text-orange-500 transition-colors duration-300"
              >
                Other Related Services
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="md:w-1/4">
          <h3 className="text-xl font-semibold mb-5 border-b border-orange-600 pb-2">
            Follow Us
          </h3>
          <div className="flex space-x-6 text-4xl text-gray-300">
            <a
              href="https://facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebookSquare />
            </a>
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors duration-300"
              aria-label="Twitter"
            >
              <FaTwitterSquare />
            </a>
            <a
              href="https://instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500 transition-colors duration-300"
              aria-label="Instagram"
            >
              <FaInstagramSquare />
            </a>
            <a
              href="https://linkedin.com/company/yourcompany"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition-colors duration-300"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://youtube.com/yourchannel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition-colors duration-300"
              aria-label="YouTube"
            >
              <FaYoutubeSquare />
            </a>
          </div>
        </div>

        {/* Contact Info or Newsletter (optional) */}
        <div className="md:w-1/4">
          <h3 className="text-xl font-semibold mb-5 border-b border-orange-600 pb-2">
            Contact Info
          </h3>
          <p className="text-gray-300 mb-2">
            Email:{" "}
            <a
              href="mailto:info@gezana.com"
              className="hover:text-orange-500 transition-colors duration-300"
            >
              info@gezana.com
            </a>
          </p>
          <p className="text-gray-300">
            Phone:{" "}
            <a
              href="tel:+251912345678"
              className="hover:text-orange-500 transition-colors duration-300"
            >
              +251 912 345 678
            </a>
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500 select-none">
        &copy; {new Date().getFullYear()} Gezana Digital Solutions. All rights
        reserved.
      </div>
    </footer>
  );
};

export default Footer;
