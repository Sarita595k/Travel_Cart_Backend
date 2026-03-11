import mongoose from "mongoose";

// creating schema for discover page 
const discoverySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    month: String,
    budget: String,
    recommendations: [
        {
            name: String,
            type: { type: String, enum: ['Domestic', 'International'] }, //type of trip 
            highlights: String,
            weather: String
        }
    ], interests: [String],
}, { timestamps: true });

// discover model
export const Discover = mongoose.model("Discover", discoverySchema)
