# Rently - Accommodation Booking Platform

A full-stack web application for booking accommodations, built with NestJS and React.

## Features

- User authentication with JWT tokens
- Accommodation listings with details and image uploads
- Booking system with date selection and price calculation
- Address search with Geoapify API integration
- Email notifications for bookings via EmailJS
- Comprehensive API documentation with Swagger
- Error handling with appropriate HTTP status codes

## Tech Stack

### Backend (API)

- NestJS framework
- MongoDB with Mongoose ORM
- JWT authentication
- Swagger API documentation
- Express.js

### Frontend

- React.js
- TypeScript
- Vite as build tool
- React Router for navigation
- Tailwind CSS for styling
- Axios for HTTP requests

## External API Integrations

- Geoapify API for address search and autocomplete
- EmailJS for sending email notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- API keys for Geoapify and EmailJS

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd rently-app
```

2. Set up the backend

```bash
cd api
npm install
# Create a .env file with the following variables:
# API_PORT=3000
# MONGODB_URI=mongodb://localhost:27017/rently
# JWT_SECRET=your_jwt_secret
# CORS_ORIGIN=http://localhost:5173
```

3. Set up the frontend

```bash
cd ../client
npm install
# Create a .env file with the following variables:
# VITE_API_BASE_URL=http://localhost:3000
# VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
# VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
# VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
# VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Running the Application

1. Start the backend server

```bash
cd api
npm run start:dev
```

2. Start the frontend development server

```bash
cd ../client
npm run dev
```

3. Access the application

- Frontend: http://localhost:5173
- API documentation: http://localhost:3000/api

## API Documentation

API documentation is available via Swagger UI at `/api` endpoint when the backend server is running.

Key API endpoints:

- Authentication: `/register`, `/login`, `/logout`
- User profile: `/profile`
- Accommodations: `/account/accommodations`, `/account/accommodations/:id`
- Bookings: `/account/bookings`, `/account/bookings/:id`

## Testing

The application includes unit tests for both backend services and controllers.

To run tests for the backend:

```bash
cd api
npm test
```

## Project Structure

- `/api` - Backend NestJS application
  - `/src` - Source code
  - `/test` - Test files
- `/client` - Frontend React application
  - `/src` - Source code
  - `/public` - Static assets

## Error Handling

The application implements comprehensive error handling with appropriate HTTP status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
