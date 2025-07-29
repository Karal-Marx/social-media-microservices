require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mediaRoutes = require('./routes/media-routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis')
const Redis = require('ioredis');

const app = express();
const PORT = process.env.PORT || 3003;

const redisClient = new Redis(process.env.REDIS_URL);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(()=>logger.info(`Successfully connected to database`))
    .catch((err)=>logger.error('Error while connecting to database', err));

app.use(cors);
app.use(helmet);
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
})

const sensitiveEndpointLimiter = rateLimit({
    windowMs : 10*60*1000,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req, res) => {
        logger.warn(`Media-service endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success : false,
            message : 'Too many request'
        });
    },
    store : new RedisStore({
        sendCommand : (...args) => redisClient.call(...args)
    }),   
});

app.use('/api/media/upload', sensitiveEndpointLimiter);
app.use('/api/media', mediaRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Media service running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at', promise, 'reason:', reason);
});