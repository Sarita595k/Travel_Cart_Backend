import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: [true, "Destination is required"]
    },
    days: {
        type: Number,
        required: [true, "Number of days is required"]
    },
    budgetType: {
        type: String,
        enum: ["Low", "Medium", "High"],
        required: true
    },
    interests: {
        type: [String], // Array: ["Food", "Adventure"]
        required: true
    },
    totalEstimatedBudget: {
        type: Number, // Stores the total amount per person
        required: true
    },
    suggestedHotels: [
        {
            name: String,
            description: String,
            priceRange: String
        }
    ],
    plan: {
        type: Object,
        required: true
    },
    isFavorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Itinerary = mongoose.model("Itinerary", itinerarySchema);