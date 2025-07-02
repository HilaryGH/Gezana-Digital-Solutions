import { NavLink } from "react-router-dom";

const DashboardNavbar = () => {
  return (
    <nav className="bg-orange-600 text-white p-4 flex space-x-6 shadow-md">
      <NavLink
        to="/seeker-dashboard"
        className={({ isActive }) =>
          isActive ? "underline font-bold" : "hover:underline"
        }
      >
        Seeker Dashboard
      </NavLink>

      <NavLink
        to="/provider-dashboard"
        className={({ isActive }) =>
          isActive ? "underline font-bold" : "hover:underline"
        }
      >
        Provider Dashboard
      </NavLink>

      <NavLink
        to="/admin-dashboard"
        className={({ isActive }) =>
          isActive ? "underline font-bold" : "hover:underline"
        }
      >
        Admin Dashboard
      </NavLink>

      <NavLink
        to="/my-bookings"
        className={({ isActive }) =>
          isActive ? "underline font-bold" : "hover:underline"
        }
      >
        My Bookings
      </NavLink>
    </nav>
  );
};

export default DashboardNavbar;
