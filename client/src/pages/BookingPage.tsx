import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AddressLink from '../AddressLink';
import PlaceGallery from '../PlaceGallery';
import BookingDates from '../BookingDates';
import { Place } from './PlacesPage';
import { sendBookingConfirmation } from '../emailService';

export interface Booking {
  place: Place;
  _id: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  name: string;
  email: string;
  phone: string;
  price: number;
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const emailSent = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  async function loadBooking() {
    try {
      const response = await axios.get<Booking[]>(`/account/bookings`);
      const foundBooking = response.data.find((booking) => booking._id === id);
      if (foundBooking) {
        setBooking(foundBooking);

        if (!emailSent.current) {
          sendBookingConfirmation(foundBooking);
          emailSent.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  }

  async function cancelBooking() {
    if (!booking || !id) return;

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/account/bookings/${id}`, { withCredentials: true });
      alert('Booking has been successfully canceled');
      navigate('/account/bookings');
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!booking) {
    return '';
  }

  return (
    <div className="my-8">
      <h1 className="text-3xl">{booking.place.title}</h1>
      <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
      <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-4">Your booking information:</h2>
          <BookingDates booking={booking} />
        </div>
        <div className="bg-primary p-6 text-white rounded-2xl">
          <div>Total price</div>
          <div className="text-3xl">${booking.price}</div>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={cancelBooking}
          disabled={isLoading}
          className="bg-primary py-2 px-6 rounded-xl text-white hover:bg-red-600 transition duration-300 disabled:opacity-70"
        >
          {isLoading ? 'Canceling...' : 'Cancel this booking'}
        </button>
      </div>
      <PlaceGallery place={booking.place} />
    </div>
  );
}
