import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Comprehensive Location Data (Matches Landlord Form)
const LOCATION_DATA = [
  {
    name: "University of Nairobi",
    short: "UoN",
    city: "Nairobi",
    areas: ["Parklands", "Westlands", "CBD", "Chiromo", "Lower Kabete", "Upper Hill", "Kikuyu"]
  },
  {
    name: "Kenyatta University",
    short: "KU",
    city: "Nairobi",
    areas: ["Kahawa Wendani", "Kahawa Sukari", "KM", "Ruiru", "Githurai 45"]
  },
  {
    name: "Jomo Kenyatta University of Agriculture and Technology",
    short: "JKUAT",
    city: "Juja",
    areas: ["Juja Town", "Highpoint", "Gate A", "Gate B", "Gate C", "Gachororo"]
  },
  {
    name: "Strathmore University",
    short: "Strathmore",
    city: "Nairobi",
    areas: ["Madaraka", "Nairobi West", "Langata", "South B", "South C"]
  },
  {
    name: "United States International University Africa",
    short: "USIU",
    city: "Nairobi",
    areas: ["Roysambu", "Zimmerman", "Kasarani", "Thika Road", "Mirema"]
  },
  {
    name: "Catholic University of Eastern Africa",
    short: "CUEA",
    city: "Nairobi",
    areas: ["Rongai", "Karen", "Langata", "Bogani"]
  },
  {
    name: "KCA University",
    short: "KCA",
    city: "Nairobi",
    areas: ["Ruaraka", "Pangani", "Thika Road", "Ngara"]
  },
  {
    name: "Mount Kenya University",
    short: "MKU",
    city: "Thika",
    areas: ["Thika Town", "Makongeni", "Section 9", "Landless"]
  },
  {
    name: "Technical University of Kenya",
    short: "TUK",
    city: "Nairobi",
    areas: ["CBD", "South B", "Railways", "Ngara"]
  },
  {
    name: "Kenyatta International Conference Centre",
    short: "KICC",
    city: "Nairobi",
    areas: ["CBD", "City Hall Way"]
  }
];

const SearchBar = ({ onSearch, initialValues = {} }) => {
    const [searchQuery, setSearchQuery] = useState(initialValues.location || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    
    // Flatten data for auto-suggestions
    const allSuggestions = useMemo(() => {
        const list = [];
        LOCATION_DATA.forEach(uni => {
            // Add University
            list.push({
                id: `uni-${uni.short}`,
                name: uni.name,
                type: 'university',
                subtitle: uni.city,
                icon: '🎓'
            });
            // Add Areas
            uni.areas.forEach((area, idx) => {
                list.push({
                    id: `area-${uni.short}-${idx}`,
                    name: area,
                    type: 'location',
                    subtitle: `Near ${uni.short}`,
                    icon: '📍'
                });
            });
        });
        return list;
    }, []);

    // Filter suggestions based on query
    const filteredSuggestions = useMemo(() => {
        if (!searchQuery) return allSuggestions.filter(s => s.type === 'university').slice(0, 5);
        
        const lowerQuery = searchQuery.toLowerCase();
        return allSuggestions.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) || 
            item.subtitle.toLowerCase().includes(lowerQuery)
        ).slice(0, 6);
    }, [searchQuery, allSuggestions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Main search function used by both form submit and button click
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents page reload
        
        // Allow search with empty query to show all results, or filter by location
        onSearch({ location: searchQuery });
        setShowSuggestions(false);
    };

    const handleSelection = (name) => {
        setSearchQuery(name);
        // Wait for user to click search or trigger immediately? 
        // Based on previous request, we just set text. 
        // But usually selecting a dropdown item triggers search.
        // If you want to wait for the button, comment out the next line:
        // onSearch({ location: name }); 
        setShowSuggestions(false);
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 border-4 border-dashed border-purple-300 shadow-xl">
                <form onSubmit={handleSubmit}>
                    <div className="relative mb-6" ref={searchRef}>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search by location (e.g. Juja, Parklands) or university..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all text-gray-800 placeholder-gray-400 text-lg"
                            />
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden max-h-80 overflow-y-auto"
                                >
                                    {filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion.id}
                                                type="button"
                                                onClick={() => handleSelection(suggestion.name)}
                                                className="w-full px-4 py-3 hover:bg-purple-50 transition-colors text-left flex items-center gap-3 group border-b border-gray-100 last:border-0"
                                            >
                                                <span className="text-2xl">{suggestion.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                        {suggestion.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">{suggestion.subtitle}</div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 text-center">
                                            No results found
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* University Quick Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {LOCATION_DATA.map((uni) => (
                            <motion.button
                                key={uni.short}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelection(uni.name)}
                                className={`px-5 py-2 rounded-full font-semibold border-2 transition-all ${
                                    searchQuery === uni.name
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-purple-600 border-purple-300 hover:border-purple-50 hover:bg-purple-50'
                                }`}
                            >
                                {uni.short}
                            </motion.button>
                        ))}
                    </div>

                    {/* Search Button - Fully Functional */}
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl border-2 border-black cursor-pointer"
                    >
                        Search
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;