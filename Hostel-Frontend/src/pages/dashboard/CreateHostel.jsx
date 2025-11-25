import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

const CreateHostel = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // NEW: Mapping Universities to Specific Areas and Cities
  const locationMapping = {
    "University of Nairobi": {
      city: "Nairobi",
      areas: ["Parklands", "Westlands", "CBD", "Chiromo", "Lower Kabete", "Upper Hill", "Kikuyu"]
    },
    "Kenyatta University": {
      city: "Nairobi",
      areas: ["Kahawa Wendani", "Kahawa Sukari", "KM", "Ruiru", "Githurai 45"]
    },
    "Jomo Kenyatta University of Agriculture and Technology": {
      city: "Juja",
      areas: ["Juja Town", "Highpoint", "Gate A", "Gate B", "Gate C", "Gachororo"]
    },
    "Strathmore University": {
      city: "Nairobi",
      areas: ["Madaraka", "Nairobi West", "Langata", "South B", "South C"]
    },
    "United States International University Africa": {
      city: "Nairobi",
      areas: ["Roysambu", "Zimmerman", "Kasarani", "Thika Road", "Mirema"]
    },
    "Catholic University of Eastern Africa": {
      city: "Nairobi",
      areas: ["Rongai", "Karen", "Langata", "Bogani"]
    },
    "KCA University": {
      city: "Nairobi",
      areas: ["Ruaraka", "Pangani", "Thika Road", "Ngara"]
    },
    "Mount Kenya University": {
      city: "Thika",
      areas: ["Thika Town", "Makongeni", "Section 9", "Landless"]
    },
    "Technical University of Kenya": {
      city: "Nairobi",
      areas: ["CBD", "South B", "Railways", "Ngara"]
    },
    "Kenyatta International Conference Centre": {
      city: "Nairobi",
      areas: ["CBD", "City Hall Way"]
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    area: "", // NEW field for specific neighborhood
    rooms: "",
    price: "",
    description: "",
    room_type: "bedsitter",
    bathrooms: "1",
    is_shared_bathroom: false,
    images: [], 
    rent_included: {
      Water: false,
      Electricity: false,
      WiFi: false,
      Garbage: false,
      Security: false
    },
    amenities: {
      wifi: false,
      water: false,
      electricity: false,
      furnished: false,
      transport_to_campus: false,
      parking: false,
      cctv: false
    }
  });

  // Available areas based on selected university
  const [availableAreas, setAvailableAreas] = useState([]);

  // Update available areas when university changes
  useEffect(() => {
    if (formData.university && locationMapping[formData.university]) {
      setAvailableAreas(locationMapping[formData.university].areas);
      // Reset area selection if it's no longer valid
      if (!locationMapping[formData.university].areas.includes(formData.area)) {
        setFormData(prev => ({ ...prev, area: "" }));
      }
    } else {
      setAvailableAreas([]);
    }
  }, [formData.university]);

  const roomTypes = [
    { id: "bedsitter", label: "Bedsitter" },
    { id: "studio", label: "Studio" },
    { id: "1_bedroom", label: "1 Bedroom" },
    { id: "2_bedroom", label: "2 Bedroom" },
    { id: "3_bedroom", label: "3 Bedroom" },
    { id: "single", label: "Single Room (Shared Amenities)" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (category, key) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 6) {
      setError("You can only upload a maximum of 6 images");
      return;
    }
    setError("");
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    const token = localStorage.getItem("token");

    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append('file', file);

      try {
        const res = await axios.post(`${API_BASE_URL}/upload/`, uploadData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        uploadedUrls.push(res.data.url);
      } catch (err) {
        console.error("Error uploading file:", file.name, err);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");

      // 1. Upload images
      let imageUrls = [];
      if (formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      // 2. Map Amenities
      const amenityMap = { 
        wifi: 1, water: 2, electricity: 3, furnished: 4, transport_to_campus: 5, 
        parking: 6, cctv: 7 
      };
      const selectedAmenityIds = Object.entries(formData.amenities)
        .filter(([key, isChecked]) => isChecked && amenityMap[key])
        .map(([key]) => amenityMap[key]);

      // 3. Rent Included List
      const rentIncludedList = Object.entries(formData.rent_included)
        .filter(([_, isChecked]) => isChecked)
        .map(([key]) => key);

      // 4. Construct Location String: "Area, City"
      // This format allows the backend to split it correctly
      const city = locationMapping[formData.university]?.city || "Nairobi";
      const locationString = `${formData.area}, ${city}`;

      const payload = {
        name: formData.name,
        location: locationString, // Sending formatted location
        price: parseFloat(formData.price),
        capacity: parseInt(formData.rooms, 10) || 1,
        room_type: formData.room_type,
        description: formData.description,
        images: imageUrls,
        amenities: selectedAmenityIds,
        features: { 
          furnished: formData.amenities.furnished,
          bathrooms: parseInt(formData.bathrooms) || 1,
          shared_bathroom: formData.is_shared_bathroom,
          rent_included: rentIncludedList,
          university: formData.university // Store uni name for reference if needed
        }
      };

      await axios.post(`${API_BASE_URL}/hostels/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/dashboard/my-hostels");
    } catch (err) {
      console.error("Create failed:", err);
      setError(err.message || err.response?.data?.message || "Failed to create hostel");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Listing</h1>
      
      {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-100">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Location Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sunrise Apartments" />
            </div>
            
            {/* University Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearest University</label>
              <select name="university" value={formData.university} onChange={handleChange} required className="w-full border p-2.5 rounded-lg bg-white">
                <option value="">Select University</option>
                {Object.keys(locationMapping).map((uni) => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
            </div>

            {/* NEW: Specific Area Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Neighborhood / Area</label>
              <select 
                name="area" 
                value={formData.area} 
                onChange={handleChange} 
                required 
                disabled={!formData.university}
                className="w-full border p-2.5 rounded-lg bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">{formData.university ? "Select Area" : "Select a university first"}</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Room Configuration */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Room Details</h2>
          
          {/* Room Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of House</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roomTypes.map((type) => (
                <label 
                  key={type.id} 
                  className={`
                    border p-3 rounded-lg cursor-pointer text-sm text-center transition-all
                    ${formData.room_type === type.id 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                      : 'hover:bg-gray-50 border-gray-200'}
                  `}
                >
                  <input 
                    type="radio" 
                    name="room_type" 
                    value={type.id} 
                    checked={formData.room_type === type.id} 
                    onChange={handleChange} 
                    className="sr-only"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Monthly)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">KES</span>
                <input name="price" type="number" value={formData.price} onChange={handleChange} required className="w-full border p-2.5 pl-12 rounded-lg" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Units Available</label>
              <input name="rooms" type="number" value={formData.rooms} onChange={handleChange} required className="w-full border p-2.5 rounded-lg" placeholder="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <div className="flex items-center gap-2">
                <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-20 border p-2.5 rounded-lg" min="0" />
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_shared_bathroom} 
                    onChange={(e) => setFormData({...formData, is_shared_bathroom: e.target.checked})}
                    className="rounded text-blue-600"
                  />
                  Shared
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Inclusions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">What's Included in Rent?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(formData.rent_included).map(key => (
              <label key={key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={formData.rent_included[key]} 
                  onChange={() => handleCheckboxChange('rent_included', key)} 
                  className="rounded text-green-600 focus:ring-green-500 mr-3 h-5 w-5"
                />
                <span className="text-gray-700">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 4: Amenities */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Property Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(formData.amenities).map(key => (
              <label key={key} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.amenities[key]} 
                  onChange={() => handleCheckboxChange('amenities', key)} 
                  className="rounded text-purple-600 focus:ring-purple-500 mr-2"
                />
                <span className="capitalize text-gray-700">{key.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <textarea name="description" placeholder="Additional Description (e.g. quiet environment, newly painted...)" value={formData.description} onChange={handleChange} className="w-full border p-3 rounded-lg h-32" />

        {/* Section 5: Images */}
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50">
          <label className="cursor-pointer block">
            <span className="text-blue-600 font-semibold hover:underline text-lg">Click to Upload Photos</span>
            <span className="block text-gray-500 text-sm mt-1">Max 6 images</span>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" disabled={formData.images.length >= 6} />
          </label>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6">
              {formData.images.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isUploading} className={`w-full py-4 text-white text-lg font-bold rounded-xl transition-all shadow-lg ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:-translate-y-1'}`}>
          {isUploading ? 'Uploading & Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateHostel;