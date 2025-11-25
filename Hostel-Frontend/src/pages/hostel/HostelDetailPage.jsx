import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchRoomById } from '../../utils/api';
import { useBooking } from '../../context/BookingContext';
import Card from '../../components/Card';

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80",
  "https://images.unsplash.com/photo-1522771753033-6a586611bf9e?w=1200&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&q=80"
];

export default function HostelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, favorites } = useBooking();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const { data: roomData, isLoading, isError, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => fetchRoomById(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-body">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (isError || !roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-alert mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-text-body mb-2">Room Not Found</h2>
          <p className="text-text-body mb-6">{error?.message || 'The room you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-hover transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const room = roomData;
  
  // Logic: Check availability
  const isFullyBooked = !room.availability.available;

  // Logic: Check favorites (convert IDs to strings for safe comparison)
  const isFavorite = favorites.some(favId => String(favId) === String(room.id));

  // Logic: Image Handling
  const displayImages = (room.images && room.images.length > 0) 
    ? room.images 
    : FALLBACK_IMAGES;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const displayedAmenities = showAllAmenities ? room.amenities : room.amenities.slice(0, 8);

  // Logic: Contact Handler
  const handleContactClick = () => {
    if (room.landlord?.phone) {
      if (window.confirm(`Call Landlord at ${room.landlord.phone}?`)) {
        window.location.href = `tel:${room.landlord.phone}`;
      }
    } else {
      alert("Phone number not available for this landlord.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-body hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-96 bg-gray-200">
                <img
                  src={displayImages[currentImageIndex]}
                  alt={`${room.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMAGES[0];
                  }}
                />

                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {displayImages.length}
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {room.featured && (
                    <span className="bg-highlight text-primary text-sm font-bold px-3 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {room.verified && (
                    <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? 'border-primary scale-105' : 'border-text-body'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGES[0];
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-text-body mb-2">{room.title}</h1>
                  <div className="flex items-center text-text-body">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{room.location.area}, {room.location.city}</span>
                  </div>
                  <p className="text-sm text-text-body mt-1">{room.location.distance}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {room.currency} {new Intl.NumberFormat('en-KE').format(room.price)}
                  </div>
                  <div className="text-sm text-text-body">per month</div>
                </div>
              </div>

              {/* Room Features (Beds, Baths, Furnishing) */}
              <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b mb-4 text-sm">
                <span className="bg-purple-100 text-primary px-3 py-1 rounded-full font-semibold border border-purple-200">
                  {room.roomType}
                </span>
                
                {room.features.bathrooms && (
                  <span className="flex items-center gap-1 text-gray-700">
                    <span className="text-lg">🚿</span> 
                    {room.features.bathrooms} {room.features.shared_bathroom ? '(Shared)' : 'Bath'}
                  </span>
                )}
                
                {room.features.furnished && (
                  <span className="flex items-center gap-1 text-gray-700">
                    <span className="text-lg">🪑</span> Furnished
                  </span>
                )}
              </div>

              <p className="text-text-body leading-relaxed whitespace-pre-line">{room.description}</p>
            </motion.div>

            {/* What's Included in Rent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-text-body mb-4">What's Included in Rent</h2>
              {room.priceIncludes && room.priceIncludes.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {room.priceIncludes.map((item, idx) => (
                    <span key={idx} className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Please contact the landlord for details on rent inclusions.</p>
              )}
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-2xl font-bold text-text-body mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {displayedAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-body">{amenity}</span>
                  </div>
                ))}
              </div>
              {room.amenities.length > 8 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-primary hover:text-hover font-medium"
                >
                  {showAllAmenities ? 'Show Less' : `Show All ${room.amenities.length} Amenities`}
                </button>
              )}
            </motion.div>

            {/* Similar Rooms */}
            {room.similarRooms && room.similarRooms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-2xl font-bold text-text-body mb-4">Similar Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {room.similarRooms.map((similarRoom, idx) => (
                    <Card key={similarRoom.id} room={similarRoom} index={idx} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              {/* Availability Status */}
              <div className="mb-6">
                {!isFullyBooked ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Available Now
                    </div>
                    <p className="text-sm text-text-body">
                      <span className="font-bold">{room.available_rooms ?? 0}</span> rooms left
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Move-in from: {new Date(room.availability.availableFrom).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Fully Booked
                    </div>
                    <p className="text-sm text-red-600 mt-1">Check back later</p>
                  </div>
                )}
              </div>

              {/* Booking Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-body">Minimum Stay:</span>
                  <span className="font-semibold">{room.availability.minimumStay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-body">Deposit Required:</span>
                  <span className="font-semibold">
                    {room.currency} {new Intl.NumberFormat('en-KE').format(room.availability.deposit)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Conditional Booking Button */}
                {!isFullyBooked ? (
                  <Link
                    to={`/booking/${room.id}`}
                    className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-hover transition-colors font-semibold shadow-lg"
                  >
                    Book This Room
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-gray-300 text-gray-500 text-center py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
                
                {/* Functional Favorite Button */}
                <button 
                  onClick={() => toggleFavorite(room.id)}
                  className={`w-full border-2 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2
                    ${isFavorite 
                      ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                >
                  <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {isFavorite ? 'Saved' : 'Save to Favorites'}
                </button>
              </div>

              {/* Landlord Info Section */}
              {room.landlord && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Landlord</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
                      {room.landlord.name.charAt(0)}
                    </div>
                    
                    {/* Name & Verification */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{room.landlord.name}</p>
                      {room.landlord.verified && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Identity
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating - Conditionally rendered to avoid 0 */}
                  {room.landlord.rating > 0 && (
                    <div className="flex items-center gap-2 mb-4 bg-yellow-50 p-2 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="font-bold text-gray-800 ml-1">{room.landlord.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-gray-500">({room.landlord.reviewCount} reviews)</span>
                    </div>
                  )}

                  <button 
                    onClick={handleContactClick}
                    className="w-full bg-white border-2 border-primary text-primary py-3 rounded-xl hover:bg-purple-50 transition-colors font-bold"
                  >
                    Contact Landlord
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}