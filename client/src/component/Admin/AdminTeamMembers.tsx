import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react";

type TeamMember = {
  _id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  order: number;
  isActive: boolean;
};

const AdminTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    photo: "",
    bio: "",
    order: 0,
    isActive: true,
  });

  const fetchTeamMembers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get<TeamMember[]>("/team-members/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(res.data);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editingMember) {
        // Update existing member
        await axios.put(`/team-members/${editingMember._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new member
        await axios.post("/team-members", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData({
        name: "",
        role: "",
        photo: "",
        bio: "",
        order: 0,
        isActive: true,
      });
      fetchTeamMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save team member");
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      photo: member.photo,
      bio: member.bio,
      order: member.order,
      isActive: member.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/team-members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeamMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete team member");
    }
  };

  const handleToggleActive = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/team-members/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTeamMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle team member status");
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      photo: "",
      bio: "",
      order: 0,
      isActive: true,
    });
    setShowModal(true);
  };

  if (loading) return <p className="p-6">Loading team members...</p>;

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members Management</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Team Members Grid */}
      {teamMembers.length === 0 ? (
        <p className="text-gray-600">No team members found. Add your first team member!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className={`bg-white rounded-xl shadow-md p-6 ${
                !member.isActive ? "opacity-60 border-2 border-red-300" : ""
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-orange-300"
                />
                <h3 className="text-xl font-semibold text-orange-700">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-orange-500 mb-2">
                  {member.role}
                </p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{member.bio}</p>
                <p className="text-xs text-gray-500 mb-4">Order: {member.order}</p>
                
                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleToggleActive(member._id)}
                    className={`p-2 rounded-lg transition ${
                      member.isActive
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                    title={member.isActive ? "Deactivate" : "Activate"}
                  >
                    {member.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingMember ? "Edit Team Member" : "Add New Team Member"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Position *
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Founder & CEO, Lead Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL *
                </label>
                <input
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {formData.photo && (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="mt-2 w-20 h-20 rounded-full object-cover border-2 border-orange-300"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Short description about the team member"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active (show on About page)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
                >
                  {editingMember ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMember(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamMembers;

