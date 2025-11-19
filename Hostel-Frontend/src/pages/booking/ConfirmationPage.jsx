import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext.jsx';

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const { getBookingById } = useBooking();

  const booking = getBookingById(bookingId);

  // Normalize booking fields from API (snake_case) so the UI can safely display them
  const hostel = booking?.hostel || null;
  const checkIn = booking?.check_in || booking?.checkIn;
  const checkOut = booking?.check_out || booking?.checkOut;
  const guests = booking?.guests;
  const totalPrice = booking?.total_price ?? booking?.totalPrice;
  const currency = booking?.currency === 'KES' ? 'KSh' : booking?.currency || 'KSh';

  if (!booking || !hostel) {
    return <div className="min-h-screen flex items-center justify-center">Booking not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>

          <p className="text-gray-600 mb-8">
            Your booking has been successfully confirmed. You will receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">{hostel.name}</h2>
            <div className="space-y-2 text-left">
              <p><strong>Booking ID:</strong> #{booking.id}</p>
              <p><strong>Check-in:</strong> {checkIn ? new Date(checkIn).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Check-out:</strong> {checkOut ? new Date(checkOut).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Guests:</strong> {guests}</p>
              <p><strong>Total Paid:</strong> {currency} {totalPrice ?? 'N/A'}</p>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              View My Bookings
            </Link>
            <Link
              to="/"
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
