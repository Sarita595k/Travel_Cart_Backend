import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from "cors"
import { connectToDb } from './src/db/config.js'
import routes from './src/routes/userRoute.js'
import router from './src/routes/itineraryRoutes.js'
import route from './src/routes/newsRoute.js'

const app = express()

// adding cors
app.use(cors());

// app.use(express.static())
app.use(express.json())

// user route
app.use('/api/user', routes)

// itinerary route 
app.use("/api/itinerary", router)

// for news route
app.use('/api/news', route)

app.get("/", (req, res) => {
    res.json({ message: "express is running" })
})

app.listen(process.env.PORT, () => {
    connectToDb()
    console.log("server is running")
})