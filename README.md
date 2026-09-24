# Short URL API

A secure URL shortener REST API built with **Node.js, Express.js, and MongoDB**.

## Features

- User signup and login with JWT authentication
- Password hashing with bcrypt
- Create, update, and delete short URLs
- URL redirection and click tracking
- URL statistics
- User-based authorization
- Pagination
- Input validation
- Rate limiting
- Helmet security headers
- CORS
- Centralized error handling
- Automated API testing

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT
- bcrypt
- Helmet
- CORS
- express-rate-limit
- Mocha & Supertest

## API Endpoints

### Users

```text
POST   /users/signup
POST   /users/login
GET    /users/me
PATCH  /users/me
PATCH  /users/me/update-password
```

### URLs

```text
POST   /urls
GET    /urls
GET    /urls/:shortcode
PATCH  /urls/:shortcode
DELETE /urls/:shortcode
GET    /urls/:shortcode/statistics
GET    /open/:shortcode
```

## Security

The API implements JWT authentication, bcrypt password hashing, Helmet, CORS, rate limiting, input validation, authorization, and centralized error handling.

## Testing

The project includes automated tests covering authentication, authorization, URL management, validation, security, pagination, redirects, and click tracking.
