import express from 'express';
import { getTravelNews } from '../controller/newsController.js';

const route = express.Router();

// /api/news/travel
route.get('/travel', getTravelNews);

export default route;