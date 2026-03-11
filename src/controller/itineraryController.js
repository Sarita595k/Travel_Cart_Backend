import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Itinerary } from "../model/itineraryModel.js";

// connect google ai
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /api/itinerary/generate-trip
export const generateAiTrip = async (req, res) => {
    try {
        const { destination, days, budgetType, interests } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // as per schema mapped the budget type 
        let mappedBudget = "Medium";
        if (budgetType === "Budget") mappedBudget = "Low";
        if (budgetType === "Luxury") mappedBudget = "High";

        // prompt to get itinerary
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

        // to genrate the result 
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI failed to provide a valid JSON structure.");

        // otherwise converts the first list into array/object
        const cleanJson = JSON.parse(jsonMatch[0]);

        // call req.user from the user model to match which user make the request of itinerary
        const savedItinerary = await Itinerary.create({
            user: req.user.id,
            destination,
            days,
            budgetType: mappedBudget, //  "Low", "Medium", or "High"
            interests,
            totalEstimatedBudget: cleanJson.totalBudgetPerPerson,
            suggestedHotels: cleanJson.suggestedHotels,
            plan: cleanJson.itinerary // Matches the schema
        });

        //  if everything is fine the send success true and send the itinerary
        res.status(201).json({
            success: true,
            itinerary: savedItinerary
        });
        // otherwise send the error message 
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

        // get the existing trip from your database
        const existingTrip = await Itinerary.findById(tripId);

        // check trip exist 
        if (!existingTrip) return res.status(404).json({ message: "Trip not found" });

        // again calling the model to generate new reponse 
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // feed the old plan back to Gemini as context
        const prompt = `
            Here is an existing travel plan for ${existingTrip.destination}:
            ${JSON.stringify(existingTrip.plan)}

            The user is unhappy with Day ${dayToChange}. 
            Please REGENERATE ONLY Day ${dayToChange} with new, different activities 
            but keep it consistent with the budget (${existingTrip.budgetType}) and interests.
            
            Return the FULL updated itinerary in JSON format.
        `;
        // new response generated
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET MY TRIPS /api/itinerary/my-trips
export const getMyTrips = async (req, res) => {
    try {
        //  basic filter for the logged-in user
        let filter = { user: req.user.id };

        // if the url has ?isFavorite=true, add it to the filter
        if (req.query.isFavorite === "true") {
            filter.isFavorite = true;
        }

        // otherwise find trips based on the filter and sort by newest first
        const trips = await Itinerary.find(filter).sort({ createdAt: -1 });

        // return the response
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

// TOGGLE FAVORITE (To add/remove from favorites) /api/itinerary/favorite/:id
export const toggleFavorite = async (req, res) => {
    try {
        const trip = await Itinerary.findById(req.params.id);

        // check id exist
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        // check the trip belongs to the person trying to favorite it
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        trip.isFavorite = !trip.isFavorite; // Toggles between true and false
        // saving to db
        await trip.save();

        // return the response
        res.status(200).json({
            success: true,
            message: trip.isFavorite ? "Added to favorites" : "Removed from favorites",
            isFavorite: trip.isFavorite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE /api/itinerary/:id
export const deleteTrip = async (req, res) => {
    try {
        const trip = await Itinerary.findById(req.params.id);

        // check of id exist
        if (!trip) {
            return res.status(404).json({ success: false, message: "Trip not found" });
        }

        // check if the trip belongs to the logged-in user
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        // delete from db 
        await trip.deleteOne();

        res.status(200).json({
            success: true,
            message: "Trip deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};