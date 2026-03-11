import express from 'express'
import dotenv from 'dotenv'
import cors from "cors"
import { connectToDb } from './src/db/config.js'
import routes from './src/routes/userRoute.js'
import router from './src/routes/itineraryRoutes.js'
import route from './src/routes/newsRoute.js'
import { authLimiter, tripLimiter } from './src/middleware/rateLimiter.js'
import rout from './src/routes/discoverRoute.js'

dotenv.config()

const app = express()

// Trust Proxy
app.set('trust proxy', 1);

//  Combined and Fixed CORS
const corsOptions = {
    origin: "https://travelcartavsar.netlify.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json())

// Rate Limiters
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/itinerary/generate-trip", tripLimiter);

//  Routes
app.use('/api/user', routes)
app.use("/api/itinerary", router)
app.use('/api/news', route)
app.use("/api/discover", rout)

// Test route 
app.get("/", (req, res) => {
    res.json({ message: "Travel Cart API is running" })
})

// Optimized Startup
const PORT = process.env.PORT || 2100;

app.listen(PORT, async () => {
    try {
        await connectToDb();
        console.log(`🚀 Server is running on port ${PORT}`);
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
});