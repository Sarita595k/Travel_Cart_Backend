import rateLimit from 'express-rate-limit';

// strict limiter for auth only 5
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// regular limiter for AI Generation only 10 request
export const tripLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "You've reached your trip planning limit for now!" },
    standardHeaders: true,
    legacyHeaders: false,
});