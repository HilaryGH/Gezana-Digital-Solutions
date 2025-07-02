// src/component/Admin/AdminDashboard.tsx

import AdminNavbar from "./AdminNavbar";
import AdminCategories from "./AdminCategories";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Layout: Fixed topbar + sidebar + main content */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <AdminNavbar />

        {/* Main content */}
        <div className="flex-1 pt-16 md:pt-6 md:ml-56">
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-6 mt-12">
              <h2 className="text-3xl font-bold text-orange-600">
                Welcome, Admin 👋
              </h2>
              <p className="text-gray-700 text-base mt-2">
                This is your dashboard where you can manage the Gezana platform.
              </p>
            </header>

            {/* Dashboard widgets or modules */}
            <section>
              <AdminCategories />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
