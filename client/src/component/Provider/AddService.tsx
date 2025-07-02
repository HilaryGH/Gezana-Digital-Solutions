import { useState, useEffect } from "react";
import axios from "../../api/axios";

interface Service {
  _id: string;
  name: string;
  category: string;
  type: string;
  description?: string;
  price: number;
  provider: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface Type {
  _id: string;
  name: string;
  category: string; // add this to filter types by category
}

const AddService: React.FC = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [idCard, setIdCard] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [skillLicense, setSkillLicense] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [typeList, setTypeList] = useState<Type[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<Type[]>([]);

  // Fetch categories and types once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, typeRes] = await Promise.all([
          axios.get<Category[]>("/categories"),
          axios.get<Type[]>("/types"),
        ]);
        setCategoryList(catRes.data);
        setTypeList(typeRes.data);
      } catch (err) {
        console.error("Failed to fetch categories or types", err);
      }
    };
    fetchData();
  }, []);

  // Filter types by selected category
  useEffect(() => {
    if (!category) {
      setFilteredTypes([]);
      setType("");
      return;
    }
    const filtered = typeList.filter((t) => t.category === category);
    setFilteredTypes(filtered);
    setType("");
  }, [category, typeList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Login required to add services");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("type", type);
      formData.append("description", description);
      formData.append("price", String(price));
      if (idCard) formData.append("idCard", idCard);
      if (businessLicense) formData.append("businessLicense", businessLicense);
      if (skillLicense) formData.append("skillLicense", skillLicense);

      const res = await axios.post<Service>("/services", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`Service "${res.data.name}" created successfully!`);

      // Reset form
      setName("");
      setCategory("");
      setType("");
      setDescription("");
      setPrice("");
      setIdCard(null);
      setBusinessLicense(null);
      setSkillLicense(null);
      setFilteredTypes([]);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to add service");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded shadow-lg mt-16">
      <h2 className="text-2xl font-bold mb-4">Add a New Service</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service Name"
          className="w-full border p-2 rounded"
        />

        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categoryList.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          required
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={!filteredTypes.length}
        >
          <option value="">Select Service Type</option>
          {filteredTypes.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-2 rounded"
          rows={4}
        />

        <input
          required
          type="number"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder="Price"
          className="w-full border p-2 rounded"
        />

        <label className="block font-semibold">Upload ID Card</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => setIdCard(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <label className="block font-semibold">Upload Business License</label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => setBusinessLicense(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <label className="block font-semibold">
          Upload Skill License (optional)
        </label>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => setSkillLicense(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-orange text-white py-2 rounded hover:bg-orange-600 transition"
        >
          Create Service
        </button>
      </form>
    </div>
  );
};

export default AddService;
