import { NavLink } from "react-router-dom";

const DashboardNavbar = () => {
  return (
    <nav className="bg-white text-brand-primary p-4 flex space-x-6 shadow-md border-b border-gray-100">
      <NavLink
        to="/seeker-dashboard"
        className={({ isActive }) =>
          isActive
            ? "underline font-bold text-brand-accent"
            : "hover:underline hover:text-brand-secondary transition-colors"
        }
      >
        Seeker Dashboard
      </NavLink>

      <NavLink
        to="/provider-dashboard"
        className={({ isActive }) =>
          isActive
            ? "underline font-bold text-brand-accent"
            : "hover:underline hover:text-brand-secondary transition-colors"
        }
      >
        Provider Dashboard
      </NavLink>

      <NavLink
        to="/admin-dashboard"
        className={({ isActive }) =>
          isActive
            ? "underline font-bold text-brand-accent"
            : "hover:underline hover:text-brand-secondary transition-colors"
        }
      >
        Admin Dashboard
      </NavLink>

      <NavLink
        to="/my-bookings"
        className={({ isActive }) =>
          isActive
            ? "underline font-bold text-brand-accent"
            : "hover:underline hover:text-brand-secondary transition-colors"
        }
      >
        My Bookings
      </NavLink>
    </nav>
  );
};

export default DashboardNavbar;
