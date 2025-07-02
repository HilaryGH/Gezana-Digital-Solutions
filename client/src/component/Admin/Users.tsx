import { useEffect, useState } from "react";
import axios from "../../api/axios";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get<User[]>("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedUsers = res.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
        setError(null);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Map raw role to readable label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "seeker":
        return "Service Seeker";
      case "provider":
        return "Service Provider";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  // Search users by name, email, phone, or role
  useEffect(() => {
    const query = search.toLowerCase();

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        getRoleLabel(user.role).toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  }, [search, users]);

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6 bg-orange-50">
      <h2 className="text-xl font-bold mb-4">All Users</h2>

      {/* Search Bar */}
      <div className="mb-4 max-w-sm">
        <input
          type="text"
          placeholder="Search by name, email, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* User Table */}
      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow-md rounded-md overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-100">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.phone || "-"}</td>
                  <td className="py-2 px-4">{getRoleLabel(user.role)}</td>
                  <td className="py-2 px-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
