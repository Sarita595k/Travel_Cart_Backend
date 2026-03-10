import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Itinerary } from "../model/itineraryModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /api/itinerary/generate-trip
export const generateAiTrip = async (req, res) => {
    try {
        const { destination, days, budgetType, interests } = req.body;

        // FIX 1: Use the correct model name
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // FIX 2: Mapping "Moderate" or "Budget" to match your Schema Enums
        let mappedBudget = "Medium";
        if (budgetType === "Budget") mappedBudget = "Low";
        if (budgetType === "Luxury") mappedBudget = "High";

        const prompt = `
            Act as a travel expert. Create a ${days}-day itinerary for ${destination}.
            Budget Level: ${mappedBudget}.
            Interests: ${interests.join(", ")}.

            Return ONLY a JSON object with this exact structure:
            {
                "totalBudgetPerPerson": 1200,
                "suggestedHotels": [{"name": "Hotel Name", "description": "Nice place", "priceRange": "$100-$150"}],
                "itinerary": [{"day": 1, "morning": "Visit park", "afternoon": "Eat lunch", "evening": "Relax"}]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI failed to provide a valid JSON structure.");
        const cleanJson = JSON.parse(jsonMatch[0]);

        // FIX 3: Ensure req.user exists and fields match Schema
        const savedItinerary = await Itinerary.create({
            user: req.user.id,
            destination,
            days,
            budgetType: mappedBudget, // Must match "Low", "Medium", or "High"
            interests,
            totalEstimatedBudget: cleanJson.totalBudgetPerPerson,
            suggestedHotels: cleanJson.suggestedHotels,
            plan: cleanJson.itinerary // Matches your schema
        });

        res.status(201).json({
            success: true,
            itinerary: savedItinerary
        });

    } catch (error) {
        console.error("GENERATION ERROR:", error); // Check your VS Code Terminal!
        res.status(500).json({
            success: false,
            message: "Failed to generate itinerary. " + error.message
        });
    }
};
// regenerate the specific date itinerary
export const regenerateDay = async (req, res) => {
    try {
        const { tripId, dayToChange } = req.body;

        // 1. Get the existing trip from your database
        const existingTrip = await Itinerary.findById(tripId);
        if (!existingTrip) return res.status(404).json({ message: "Trip not found" });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 2. Feed the old plan back to Gemini as context
        const prompt = `
            Here is an existing travel plan for ${existingTrip.destination}:
            ${JSON.stringify(existingTrip.plan)}

            The user is unhappy with Day ${dayToChange}. 
            Please REGENERATE ONLY Day ${dayToChange} with new, different activities 
            but keep it consistent with the budget (${existingTrip.budgetType}) and interests.
            
            Return the FULL updated itinerary in JSON format.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const updatedPlan = JSON.parse(response.text().replace(/```json|```/g, ""));

        // 3. Update the database with the new plan
        existingTrip.plan = updatedPlan.itinerary || updatedPlan;
        await existingTrip.save();

        res.status(200).json({
            success: true,
            message: `Day ${dayToChange} has been updated`,
            itinerary: existingTrip
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET MY TRIPS (Handles both History and Favorites)
export const getMyTrips = async (req, res) => {
    try {
        // 1. Start with a basic filter for the logged-in user
        let filter = { user: req.user.id };

        // 2. If the URL has ?isFavorite=true, add it to the filter
        if (req.query.isFavorite === "true") {
            filter.isFavorite = true;
        }

        // 3. Find trips based on the filter and sort by newest first
        const trips = await Itinerary.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: trips.length,
            trips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching trips: " + error.message
        });
    }
};

// TOGGLE FAVORITE (To add/remove from favorites)
export const toggleFavorite = async (req, res) => {
    try {
        const trip = await Itinerary.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        // Security: Ensure the trip belongs to the person trying to favorite it
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        trip.isFavorite = !trip.isFavorite; // Toggles between true and false
        await trip.save();

        res.status(200).json({
            success: true,
            message: trip.isFavorite ? "Added to favorites" : "Removed from favorites",
            isFavorite: trip.isFavorite
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};