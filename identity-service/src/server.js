require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const helmet = require("helmet");
const cors = require('cors');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const routes = require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001

//connect to mongodb
mongoose
    .connect(process.env.MONGODB_URI)
    .then(()=> logger.info('Connected to the database') )
    .catch((e) => logger.error('Connection to database was not successful', e));

    const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());   //DIY
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body ${req.body}`);
    next();
})

//DDoS Protection
const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    points : 5,
    duration : 1
});

//Global Middleware for rate limiting
app.use((req, res, next) => {
    rateLimiter.consume(req.ip).then( () => next() ).catch(()=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success : false,
            message : "Too many requests"
        });
    });
});

//IP based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success : false,
            message : 'Too many requests'
        });
    },
    store : new RedisStore({
        sendCommand : (...args) => redisClient.call(...args),
    }),
})

//apple senstiveEndpointsLimiter to our routes
app.use('/api/auth/register', sensitiveEndpointsLimiter);

app.use('/api/auth', routes);

//error handler
app.use(errorHandler)

app.listen(PORT, ()=> {
    logger.info(`Identity service running on port ${PORT}`);
});

//unhandled  promise rejection
process.on('unhandledRejection', (reason, promise)=>{
    logger.error('unhandled Rejection at', promise, 'reason:', reason);
})