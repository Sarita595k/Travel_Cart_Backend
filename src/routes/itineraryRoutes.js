import express from "express";
import { deleteTrip, generateAiTrip, getMyTrips, regenerateDay, toggleFavorite } from "../controller/itineraryController.js";
import { isAuthenticatedUser } from "../middleware/auth.js"; // auth middleware

const router = express.Router();

// Only authenticated users can call this /api/itinerary/generate-trip
router.post("/generate-trip", isAuthenticatedUser, generateAiTrip);

// update trip data /api/itinerray/updateDay
router.post("/updateDay", isAuthenticatedUser, regenerateDay);

// To get history: /api/itinerary/my-trips
// To get favorites: /api/itinerary/my-trips?isFavorite=true
router.get("/my-trips", isAuthenticatedUser, getMyTrips);

///toggle favorite api/itinerary/favorite/:id
router.put("/favorite/:id", isAuthenticatedUser, toggleFavorite);

// to delete data /api/itinerary/:id
router.delete("/:id", isAuthenticatedUser, deleteTrip);

export default router;