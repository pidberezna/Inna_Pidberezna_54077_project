import emailjs from '@emailjs/browser';
import { Booking } from './pages/BookingPage';

export const sendBookingConfirmation = async (booking: Booking) => {
  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        user_email: booking.email,
        user_name: booking.name,
        property_name: booking.place.title,
        check_in: new Date(booking.checkIn).toLocaleDateString(),
        check_out: new Date(booking.checkOut).toLocaleDateString(),
        total_price: booking.price,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};
