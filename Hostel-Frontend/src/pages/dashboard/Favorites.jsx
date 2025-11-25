import { Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext.jsx';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Fallback images to ensure no black boxes
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80",
  "https://images.unsplash.com/photo-1522771753033-6a586611bf9e?w=600&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80"
];

export default function Favorites() {
  const { favorites, toggleFavorite, getHostelById } = useBooking();
  const [favoriteHostels, setFavoriteHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteHostels = async () => {
      if (favorites.length === 0) {
        setFavoriteHostels([]);
        setLoading(false);
        return;
      }

      try {
        const hostelPromises = favorites.map(id => getHostelById(id));
        const hostels = await Promise.all(hostelPromises);
        const validHostels = hostels.filter(hostel => hostel !== null);
        setFavoriteHostels(validHostels);
      } catch (error) {
        console.error('Failed to load favorite hostels:', error);
        setFavoriteHostels([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteHostels();
  }, [favorites, getHostelById]);

  // Helper to get a valid image
  const getDisplayImage = (hostel, index) => {
    const validImages = hostel.images?.filter(img => 
        img && typeof img === 'string' && img.length > 5 && !img.startsWith('blob:')
    ) || [];

    if (validImages.length > 0) return validImages[0];
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {favoriteHostels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">You haven't added any favorites yet.</p>
          <Link
            to="/search"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block font-medium"
          >
            Explore Hostels
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteHostels.map((hostel, index) => (
            <motion.div 
              key={hostel.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <Link to={`/hostel/${hostel.id}`} className="block relative h-48 overflow-hidden group">
                <img
                  src={getDisplayImage(hostel, index)}
                  alt={hostel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
                />
                {/* Availability Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded shadow-md text-white ${hostel.availability?.available ? 'bg-green-500' : 'bg-red-500'}`}>
                    {hostel.availability?.available ? 'Available' : 'Fully Booked'}
                  </span>
                </div>
              </Link>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/hostel/${hostel.id}`} className="hover:text-purple-600 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{hostel.name}</h3>
                  </Link>
                  <button
                    onClick={() => toggleFavorite(hostel.id)}
                    className="text-2xl text-red-500 hover:text-red-600 transition-transform hover:scale-110 active:scale-95"
                    title="Remove from favorites"
                  >
                    ♥
                  </button>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">
                    {hostel.location?.area || 'Unknown Area'}, {hostel.location?.city || 'City'}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Price</span>
                    <span className="text-lg font-bold text-purple-700">
                      {hostel.currency} {new Intl.NumberFormat('en-KE').format(hostel.price)}<span className="text-xs text-gray-500 font-normal">/mo</span>
                    </span>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-bold text-gray-800">{hostel.landlord?.rating > 0 ? hostel.landlord.rating.toFixed(1) : 'New'}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {/* UPDATED BUTTONS FOR CLARITY */}
                  <Link
                    to={`/hostel/${hostel.id}`}
                    className="flex-1 text-center bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                  >
                    View Details
                  </Link>
                  {hostel.availability?.available ? (
                    <Link
                      to={`/booking/${hostel.id}`}
                      className="flex-1 text-center bg-primary text-white py-2.5 rounded-lg hover:bg-hover transition-all font-bold text-sm shadow-md hover:shadow-lg"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <button disabled className="flex-1 text-center bg-gray-100 text-gray-400 border border-gray-200 py-2.5 rounded-lg cursor-not-allowed font-medium text-sm">
                      Full
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}