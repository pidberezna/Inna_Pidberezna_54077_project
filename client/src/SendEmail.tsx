import { useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_7agvmw2', // Service ID
        'template_qo123gf', // Template ID
        form.current,
        '2d5eU0FC4EQ3Yemqu' // Public Key
      )
      .then((result) => {
        console.log('Email sent successfully:', result.text);
        alert('Повідомлення надіслано!');
      })
      .catch((error) => {
        console.error('Error sending email:', error.text);
      });

    e.target.reset();
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <input type="text" name="name" placeholder="Ваше ім'я" required />
      <input type="email" name="email" placeholder="Ваш Email" required />
      <textarea name="message" placeholder="Ваше повідомлення" required />
      <button type="submit">Надіслати</button>
    </form>
  );
};

export default ContactForm;
