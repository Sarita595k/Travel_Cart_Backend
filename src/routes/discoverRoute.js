import express from "express"
import { isAuthenticatedUser } from "../middleware/auth.js";
import { discoverDestinations } from "../controller/discoverController.js";
const rout = express.Router();

// /api/discover/
rout.post("/", isAuthenticatedUser, discoverDestinations);

export default rout