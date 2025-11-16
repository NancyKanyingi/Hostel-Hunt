import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

const CreateHostel = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    rooms: "",
    price: "",
    description: ""
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        name: formData.name,
        location: formData.address,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.rooms, 10) || 1,
        room_type: 'shared', // default room_type
        description: formData.description
      };

      await axios.post(`${API_BASE_URL}/hostels`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/dashboard/my-hostels"); // corrected route
    } catch (err) {
      console.error("Failed to create hostel:", err);
      setError(err.response?.data?.message || "Failed to create hostel");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Hostel</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          name="name"
          placeholder="Hostel Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          name="rooms"
          type="number"
          min="1"
          placeholder="Number of Rooms"
          value={formData.rooms}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Price per night"
          value={formData.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Hostel
        </button>
      </form>
    </div>
  );
};

export default CreateHostel;
