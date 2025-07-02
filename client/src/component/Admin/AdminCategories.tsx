import { useState } from "react";
import axios from "../../api/axios";

interface Category {
  _id: string;
  name: string;
}

interface Type {
  _id: string;
  name: string;
  category: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [selectedCategoryForType, setSelectedCategoryForType] = useState("");

  const [message, setMessage] = useState("");

  const [showCategories, setShowCategories] = useState(false);
  const [showTypes, setShowTypes] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      const res = await axios.get<Category[]>("/categories");
      setCategories(res.data);
    } catch {
      setMessage("Failed to load categories.");
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await axios.get<Type[]>("/types");
      setTypes(res.data);
    } catch {
      setMessage("Failed to load service types.");
    }
  };

  const handleShowCategories = async () => {
    if (!showCategories) await fetchCategories();
    setShowCategories(!showCategories);
  };

  const handleShowTypes = async () => {
    if (!showTypes) await fetchTypes();
    setShowTypes(!showTypes);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post<Category>(
        "/categories",
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Category added: ${res.data.name}`);
      setNewCategory("");
      if (showCategories) fetchCategories();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to add category.");
    }
  };

  const handleAddType = async () => {
    if (!newType.trim() || !selectedCategoryForType) return;
    try {
      const res = await axios.post<Type>(
        "/types",
        {
          name: newType,
          category: selectedCategoryForType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Service type added: ${res.data.name}`);
      setNewType("");
      setSelectedCategoryForType("");
      if (showTypes) fetchTypes();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to add service type.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Category deleted successfully.");
      fetchCategories();
    } catch {
      setMessage("Failed to delete category.");
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("Delete this service type?")) return;
    try {
      await axios.delete(`/types/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Service type deleted successfully.");
      fetchTypes();
    } catch {
      setMessage("Failed to delete service type.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">
        Manage Categories & Types
      </h2>

      {message && <p className="mb-4 text-green-600 font-medium">{message}</p>}

      {/* Add Category */}
      <div className="mb-8">
        <label className="block font-semibold mb-2">Add Category</label>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleAddCategory}
            className="bg-orange-700 hover:bg-orange-600 text-white px-6 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Service Type */}
      <div className="mb-8">
        <label className="block font-semibold mb-2">Add Service Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedCategoryForType}
            onChange={(e) => setSelectedCategoryForType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="New service type"
            className="border p-2 rounded"
          />

          <button
            onClick={handleAddType}
            className="bg-orange-700 hover:bg-orange-600 text-white px-6 py-2 rounded w-full md:w-auto"
          >
            Add
          </button>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={handleShowCategories}
          className="bg-gray-100 hover:bg-orange-100 text-orange-800 border border-orange-400 px-4 py-2 rounded"
        >
          {showCategories ? "Hide Categories" : "Show Categories"}
        </button>

        <button
          onClick={handleShowTypes}
          className="bg-gray-100 hover:bg-orange-100 text-orange-800 border border-orange-400 px-4 py-2 rounded"
        >
          {showTypes ? "Hide Service Types" : "Show Service Types"}
        </button>
      </div>

      {/* Category List */}
      {showCategories && (
        <>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Categories
          </h3>
          <ul className="space-y-2 mb-8">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span>{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Type List */}
      {showTypes && (
        <>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Service Types
          </h3>
          <ul className="space-y-2">
            {types.map((type) => (
              <li
                key={type._id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span>{type.name}</span>
                <button
                  onClick={() => handleDeleteType(type._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminCategories;
