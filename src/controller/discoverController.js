import { Discover } from "../model/discoverModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// connect to Google AI  api/discover/
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const discoverDestinations = async (req, res) => {
    try {
        const { budget, month, interests } = req.body;

        // Check if anyone has searched for this exact combo before if yes then show that
        const existingDiscovery = await Discover.findOne({
            month,
            budget,
            interests: { $all: interests }
        });

        if (existingDiscovery) {
            // console.log("Serving from Cache...");
            return res.status(200).json({
                success: true,
                recommendations: existingDiscovery.recommendations
            });
        }
        // used 2.5-flash for free tier
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // the prompt
        // all details comes from the req.body
        // proper structure design for the required json 
        const prompt = `
    Act as an expert Indian Travel Consultant. 
    The user is based in India. Suggest exactly 4 destinations for the month of ${month} 
    considering a ${budget} budget and these interests: ${interests.join(", ")}.

    CRITICAL INSTRUCTIONS:
    - You MUST provide exactly 2 Domestic destinations (States/Cities within INDIA).
    - You MUST provide exactly 2 International destinations (Outside India).
    - For International trips, prioritize visa-friendly or popular destinations for Indian travelers.

    Return ONLY a valid JSON array of objects with exactly this structure:
    [
      {
        "name": "City, Country (or City, State for India)",
        "type": "Domestic", 
        "highlights": "A catchy 2-sentence description of why it's great for ${month}.",
        "budgetVibe": "Specific explanation of how it fits a ${budget} budget.",
        "weather": "Approximate temperature and sky conditions."
      }
    ]
`;

        // sending the prompt to the model(gemini 2.5 flash)
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);

        // if no list send error 
        if (!jsonMatch) throw new Error("AI Format Error");

        // otherwise converts the first list into array/object
        const recommendations = JSON.parse(jsonMatch[0]);

        //  saving to db all the recommendations in the discover db
        await Discover.create({
            user: req.user.id,
            month,
            budget,
            interests,
            recommendations
        });

        // returning the response 
        res.status(200).json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error("Discovery Error:", error);
        // Send error message so frontend can display it
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Failed to fetch suggestions."
        });
    }
};