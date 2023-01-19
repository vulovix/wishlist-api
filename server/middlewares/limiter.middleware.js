const Redis = require("ioredis");
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const { TooManyConnections } = require("../helpers/response.helper");
const redisClient = new Redis({ enableOfflineQueue: false });

const rateLimiterMemory = new RateLimiterMemory({
  points: 2, // 10 / 5 if there are 5 processes
  duration: 1,
});

const rateLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "standard_request",
  points: 10, // Number of requests
  inmemoryBlockOnConsumed: 10,
  duration: 1, // Per second,
  blockDuration: 60 * 15, // block for 15 mins
  inmemoryBlockDuration: 60 * 15,
  insuranceLimiter: rateLimiterMemory,
});

const loginAttemptLimiterRedis = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "loggin_attempt",
  points: 3, // Can fail 3 times
  inmemoryBlockOnConsumed: 3,
  duration: 60, // per minute 
  blockDuration: 60 * 15, // block for 15 minutes
  inmemoryBlockDuration: 60 * 15,
});

const rateLimiterMiddleware = (req, res, next) => {
  // rateLimiterRedis.delete(req.ip);
  rateLimiterRedis.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(_ => {
      res.status(429).send(TooManyConnections(15));
    })
}

module.exports = {
  middleware: {
    rateLimiterMiddleware
  },
  limiter: {
    loginAttemptLimiterRedis
  }
}