import express from 'express'
import dotenv from 'dotenv'
import { connectToDb } from './src/db/config.js'
import routes from './src/routes/userRoute.js'
import router from './src/routes/itineraryRoutes.js'
dotenv.config()

const app = express()

// app.use(express.static())
app.use(express.json())

// user route
app.use('/api/user', routes)

// itinerary route 
app.use("/api/itinerary", router)

app.get("/", (req, res) => {
    res.json({ message: "express is running" })
})

app.listen(process.env.PORT, () => {
    connectToDb()
    console.log("server is running")
})