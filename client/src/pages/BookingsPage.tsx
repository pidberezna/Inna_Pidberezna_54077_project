import AccountNav from '../AccountNav';
import { useEffect, useState } from 'react';
import axios from 'axios';
import PlaceImg from '../PlaceImg';
import { Link } from 'react-router-dom';
import BookingDates from '../BookingDates';
import { Booking } from './BookingPage';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    try {
      const response = await axios.get(`/account/bookings`, {
        withCredentials: true,
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelBooking(ev: React.MouseEvent, bookingId: string) {
    ev.preventDefault();

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/account/bookings/${bookingId}`, {
        withCredentials: true,
      });

      loadBookings();
      alert('Booking has been successfully canceled');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div>
        <AccountNav />
        <div className="text-center mt-8">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <AccountNav />
      <div className="flex flex-col gap-4">
        {bookings?.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden relative"
            >
              <Link
                to={`/account/bookings/${booking._id}`}
                className="flex gap-4 w-full"
              >
                <div className="w-48">
                  <PlaceImg place={booking.place} />
                </div>
                <div className="py-3 pr-3 grow">
                  <h2 className="text-xl">{booking.place.title}</h2>
                  <div className="text-xl">
                    <BookingDates
                      booking={booking}
                      className="mb-2 mt-4 text-gray-500"
                    />
                    <div className="flex gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                        />
                      </svg>
                      <span className="text-2xl">
                        Total price: ${booking.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(ev) => cancelBooking(ev, booking._id)}
                className="absolute bottom-2 right-2 bg-primary py-2 px-4 rounded-xl text-white hover:bg-primary/80 transition duration-300"
              >
                Cancel booking
              </button>
            </div>
          ))
        ) : (
          <div className="text-center mt-8">
            <p>No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
