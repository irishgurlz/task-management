import redisClient from "../lib/redis.js";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

const aiRateLimiter = async (req, res, next) => {
  const userId = req.user?.id;
  const key = `ai_cmd:${userId}`;

  try {
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    if (count > MAX_REQUESTS) {
      const ttl = await redisClient.ttl(key);
      const retryAfter = ttl > 0 ? ttl : WINDOW_SECONDS;

      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        message: `Terlalu banyak request. Maksimal ${MAX_REQUESTS} request per menit.`,
        retryAfter
      });
    }

    res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - count));

    next();
  } catch (err) {
    console.error("Rate limiter error:", err);
    res.status(503).json({
      message: "Layanan rate limiter tidak tersedia, coba lagi sebentar"
    });
  }
};

export default aiRateLimiter;