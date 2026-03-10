import express from 'express';
import { getTravelNews } from '../controller/newsController.js';

const route = express.Router();

// This defines the endpoint: GET /api/news/travel
route.get('/travel', getTravelNews);

export default route;