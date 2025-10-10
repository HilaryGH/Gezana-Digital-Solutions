import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { FileText, Download, Eye, ChevronDown, ChevronUp } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  // Seeker files
  idFile?: string;
  // Provider files
  license?: string;
  tradeRegistration?: string;
  professionalCertificate?: string;
  photo?: string;
  servicePhotos?: string[];
  video?: string;
  priceList?: string;
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  // Toggle row expansion
  const toggleRow = (userId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Get uploaded files for a user
  const getUploadedFiles = (user: User) => {
    const files: { name: string; url: string }[] = [];
    const baseUrl = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';

    if (user.idFile) files.push({ name: 'ID File', url: `${baseUrl}/${user.idFile}` });
    if (user.license) files.push({ name: 'License', url: `${baseUrl}/${user.license}` });
    if (user.tradeRegistration) files.push({ name: 'Trade Registration', url: `${baseUrl}/${user.tradeRegistration}` });
    if (user.professionalCertificate) files.push({ name: 'Professional Certificate', url: `${baseUrl}/${user.professionalCertificate}` });
    if (user.photo) files.push({ name: 'Photo', url: `${baseUrl}/${user.photo}` });
    if (user.video) files.push({ name: 'Video', url: `${baseUrl}/${user.video}` });
    if (user.priceList) files.push({ name: 'Price List', url: `${baseUrl}/${user.priceList}` });
    if (user.servicePhotos) {
      user.servicePhotos.forEach((photo, idx) => {
        files.push({ name: `Service Photo ${idx + 1}`, url: `${baseUrl}/${photo}` });
      });
    }

    return files;
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
                <th className="py-3 px-4 text-left">Files</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const uploadedFiles = getUploadedFiles(user);
                const isExpanded = expandedRows.has(user._id);
                
                return (
                  <React.Fragment key={user._id}>
                    <tr className="border-t hover:bg-gray-100">
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{user.email}</td>
                      <td className="py-2 px-4">{user.phone || "-"}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'provider' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        {uploadedFiles.length > 0 ? (
                          <button
                            onClick={() => toggleRow(user._id)}
                            className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">No files</span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Row - Show Files */}
                    {isExpanded && uploadedFiles.length > 0 && (
                      <tr className="border-t bg-orange-50">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="bg-white rounded-lg shadow-sm p-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-orange-600" />
                              Uploaded Documents
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {uploadedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 p-1"
                                      title="View"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </a>
                                    <a
                                      href={file.url}
                                      download
                                      className="text-green-600 hover:text-green-700 p-1"
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
