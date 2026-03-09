import { GoogleGenerativeAI } from "@google/generative-ai";
import { Itinerary } from "../model/itineraryModel.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /api/itinerary/generate-trip
export const generateAiTrip = async (req, res) => {
    try {
        const { destination, days, budgetType, interests } = req.body;
        console.log("Key being used:", process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Build a detailed prompt using the user's specific inputs
        const prompt = `
            Act as a travel expert. Create a ${days}-day itinerary for ${destination}.
            Budget Level: ${budgetType}.
            Interests: ${interests.join(", ")}.

            Requirements:
            1. Recommend 3 hotels in ${destination} that fit a ${budgetType} budget.
            2. Calculate the "Overall Estimated Budget Per Person" in USD for the entire ${days} days (including food, stay, and activities).
            3. Return ONLY a JSON object with this exact structure:
            {
                "totalBudgetPerPerson": 0,
                "suggestedHotels": [{"name": "", "description": "", "priceRange": ""}],
                "itinerary": [{"day": 1, "morning": "", "afternoon": "", "evening": ""}]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean any Markdown formatting (```json ... ```)
        const cleanJson = JSON.parse(text.replace(/```json|```/g, ""));

        // Save the generated trip to the database
        const savedItinerary = await Itinerary.create({
            user: req.user.id,
            destination,
            days,
            budgetType,
            interests,
            totalEstimatedBudget: cleanJson.totalBudgetPerPerson,
            suggestedHotels: cleanJson.suggestedHotels,
            plan: cleanJson.itinerary
        });

        res.status(201).json({
            success: true,
            itinerary: savedItinerary
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate itinerary. Please try again.",
            error: error
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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