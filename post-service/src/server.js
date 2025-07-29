require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet')
const postRoutes = require('./routes/post-routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const app = express();
const PORT = process.env.PORT || 3002;

//connect to mongoose
mongoose
    .connect(process.env.MONGODB_URI)
    .then(()=>logger.info("Successfully connected to database"))
    .catch((e)=>logger.error(`Error while connecting to database: ${e}`));

//creating a redis client
const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

//IP based rate limiter for sensitive endpoints(create post)
const senstiveEndpointsLimiter = rateLimit({    //uses the "express-rate-limit"
    windowMs : 15 * 60 * 1000,                  //Time frame: 15 mins
    max : 25,                                    //max request within the time frame
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Post-service endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests'
        });
    },
    store : new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

app.use('/api/posts/create-post', senstiveEndpointsLimiter);

//yet to implement for other operations


app.use('/api/posts/', (req, res, next)=>{
    req.redisClient = redisClient;
    next();
}, postRoutes);

app.use(errorHandler);


app.listen(PORT, ()=>{
    logger.info(`Post service running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise)=>{
    logger.error(`Unhandled rejection at ${promise} reason:, ${reason}`);
});

