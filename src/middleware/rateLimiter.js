import rateLimit from 'express-rate-limit';

// Strict limiter for Auth
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Regular limiter for AI Generation
export const tripLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "You've reached your trip planning limit for now!" },
    standardHeaders: true,
    legacyHeaders: false,
});