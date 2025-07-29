SOCIAL MEDIA MICROSERVICES BACKEND
A modular, scalable backend system for a social media platform, built using microservice architecture. It includes an API Gateway, Authentication/Authorization service, and a Post management service, communicating over REST and protected with JWT.

-----------------------------------------------------------------------------
🔧 Tech Stack
Languages & Frameworks:

- Node.js, Express.js

Tools & Technologies:

- Redis, MongoDB, JWT, Winston, Cloudinary, Multer

Security:

- Helmet, CORS, Rate Limiting (express-rate-limit & rate-limiter-flexible)

Dev Tools:

- Docker-ready structure, Postman-tested routes, .env support via dotenv


🧩 MICROSERVICES OVERVIEW
-----------------------------------------------------------------------------


1. API Gateway
- Central entry point for all client requests.

- Routes and proxies requests to underlying services using express-http-proxy.

- Applies global middlewares (rate limiting, logging, token validation).

-------------------------------------------------------------------------------

2. Identity Service
- Handles user registration, login, and JWT token generation.

- Secure password hashing with bcrypt.

- Validates credentials and issues access & refresh tokens.

------------------------------------------------------------------------------

3. Post Service
- CRUD operations for user posts.

- Pagination and Redis-based caching for read-heavy endpoints.

- JWT-protected endpoints with user ownership validation.

------------------------------------------------------------------------------

🔐 Security Features
- Redis-backed rate limiting to prevent abuse and DDoS.

- JWT-based user authentication & authorization.

- HTTP headers hardened via Helmet.

- CORS policy enforced for API protection.

-----------------------------------------------------------------------------

🚀 Getting Started
Prerequisites:
-Node.js & npm

-MongoDB running locally or via MongoDB Atlas

-Redis server (locally or cloud-based)

-.env files set up in each service with relevant configs

------------------------------------------------------------------------

✅ .env (for API Gateway):

PORT=5000
JWT_SECRET=your_jwt_secret
IDENTITY_SERVICE_URL=http://localhost:5001
POST_SERVICE_URL=http://localhost:5002
REDIS_URL=redis://localhost:6379

-------------------------------------------------------------------------

✅ .env for Identity Service

PORT=5001
MONGO_URI=mongodb://localhost:27017/identity-db
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

-------------------------------------------------------------------------

✅ .env for Post Service

PORT=5002
MONGO_URI=mongodb://localhost:27017/post-db
REDIS_URL=redis://localhost:6379

-------------------------------------------------------------------------

🛠️ Running Locally
# In each service folder (api-gateway, identity-service, post-service). Run in terminal
>npm install
>npm start

-------------------------------------------------------------------------

🗂️ Folder Structure

social-media-microservices/
├── api-gateway/
├── identity-service/
├── post-service/
└── README.md

--------------------------------------------------------------------------

📌 Status
✅ API Gateway, Identity Service, and Post Service fully functional and tested.
🔄 Services can be independently scaled or extended.

--------------------------------------------------------------------------

📫 Author
Karal Marx
🔗 GitHub: Karal-Marx

