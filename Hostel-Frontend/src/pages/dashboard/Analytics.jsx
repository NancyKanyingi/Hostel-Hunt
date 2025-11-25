import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/analytics/landlord`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Analytics Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-3xl font-bold mt-1">KES {analytics.totalRevenue?.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Lifetime earnings</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-medium opacity-90">Monthly Revenue</h3>
          <p className="text-3xl font-bold mt-1">KES {analytics.monthlyRevenue?.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Current month</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-medium opacity-90">Total Bookings</h3>
          <p className="text-3xl font-bold mt-1">{analytics.totalBookings}</p>
          <p className="text-xs opacity-75 mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-sm font-medium opacity-90">Occupancy Rate</h3>
          <p className="text-3xl font-bold mt-1">{analytics.occupancyRate}%</p>
          <p className="text-xs opacity-75 mt-2">Current active bookings</p>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-800">Revenue Trend (Last 4 Months)</h3>
          <div className="h-64 flex items-end justify-between space-x-4 px-2">
            {analytics.monthlyTrend?.map((data, index) => {
              // Calculate height percentage relative to max revenue (or default to 10000 for scale)
              const maxRev = Math.max(...analytics.monthlyTrend.map(d => d.revenue), 10000);
              const heightPercent = (data.revenue / maxRev) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex flex-col justify-end h-full">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      KES {data.revenue.toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div
                      className="bg-blue-500 w-full rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs mt-3 text-gray-500 font-medium">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Hostel */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-800">Top Performing Property</h3>
          {analytics.topHostel ? (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-xl text-gray-900">{analytics.topHostel.name}</h4>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                  #1 Earner
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.topHostel.bookings}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Revenue Generated</p>
                  <p className="text-2xl font-bold text-green-600">KES {analytics.topHostel.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 italic">
              No performance data available yet
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Active Bookings</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-purple-600">{analytics.activeBookings}</span>
            <span className="text-sm text-gray-500 mb-1">currently occupied</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Average Rating</h3>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-yellow-500">{analytics.averageRating}</span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(analytics.averageRating) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Properties Listed</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-blue-600">{analytics.totalHostels}</span>
            <span className="text-sm text-gray-500 mb-1">active listings</span>
          </div>
        </div>
      </div>
    </div>
  );
}