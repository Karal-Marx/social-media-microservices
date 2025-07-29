Social Media Microservices Backend

A modular, microservices-based backend system for a social media platform, built using Node.js and Express.js. This project currently includes three core services:

API Gateway

Identity Service (Authentication & Authorization)

Post Service (CRUD for user posts)

All services are containerized and communicate via REST APIs, with JWT-based authentication, Redis caching, and rate-limiting for security.

Features

API Gateway

Central entry point for routing client requests

JWT validation and token propagation

Service proxying using express-http-proxy

Request logging with Winston

Global Redis-backed rate limiting

Identity Service

User registration & login

Secure password hashing with bcrypt

JWT access & refresh token generation

Token-based authentication with role-based support

MongoDB with Mongoose for user persistence

Post Service

Create, fetch (with pagination), view, and delete posts

Redis-based caching for performance

Rate limiting per endpoint to prevent DDoS attacks

JWT-protected routes using user ID from request headers

Tech Stack

Languages & Frameworks: JavaScript, Node.js, Express.jsDatabases: MongoDB, RedisAuth: JWT, bcryptAPI Tools: express-http-proxy, express-rate-limit, rate-limiter-flexibleSecurity: Helmet, CORSUtilities: dotenv, Winston, Cloudinary (planned for media service)Containerization: Docker (planned)

Folder Structure

├── api-gateway
│   └── src
├── identity-service
│   └── src
├── post-service
│   └── src
├── .gitignore
├── README.md

Setup Instructions

1. Clone Repository

git clone https://github.com/Karal-Marx/social-media-microservices.git
cd social-media-microservices

2. Set up Environment Variables

Create .env files in each service (api-gateway, identity-service, post-service) and add the required variables:

PORT

MONGO_URI

JWT_SECRET

REDIS_URL

IDENTITY_SERVICE_URL

POST_SERVICE_URL

3. Install Dependencies

cd api-gateway && npm install
cd ../identity-service && npm install
cd ../post-service && npm install

4. Run Services

In each service directory:

npm run dev

API Endpoints

Identity Service

POST /v1/auth/register

POST /v1/auth/login

Post Service (via Gateway)

POST /v1/posts/create-post

GET /v1/posts/all-posts?page=1&limit=10

GET /v1/posts/:id

DELETE /v1/posts/:id

Status

✅ Fully functional: API Gateway, Identity, and Post Services🛠️ Upcoming: Media Service, Search Service, Dockerization

Author

Karal-Marx

License

This project is licensed under the MIT License.
