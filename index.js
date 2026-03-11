import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from "cors"
import { connectToDb } from './src/db/config.js'
import routes from './src/routes/userRoute.js'
import router from './src/routes/itineraryRoutes.js'
import route from './src/routes/newsRoute.js'
import { authLimiter, tripLimiter } from './src/middleware/rateLimiter.js'
import rout from './src/routes/discoverRoute.js'

const app = express()

// setting proxy for render deployment
app.set('trust proxy', 1);

// adding cors
app.use(cors());

// app.use(express.static())
app.use(express.json())

// rate limiter different for login,register and trip
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/itinerary/generate-trip", tripLimiter);

// user route
app.use('/api/user', routes)

// itinerary route 
app.use("/api/itinerary", router)

// for news route
app.use('/api/news', route)

// for discover route 
app.use("/api/discover", rout)

// test route 
app.get("/", (req, res) => {
    res.json({ message: "express is running" })
})

app.listen(process.env.PORT, () => {
    connectToDb()
    console.log("server is running")
})