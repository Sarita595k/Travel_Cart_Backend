import axios from 'axios';

// /api/news/travel
export const getTravelNews = async (req, res) => {
    try {
        // assigning the api key from env file
        const API_KEY = process.env.NEWS_API_KEY;

        // getting response 
        const response = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: 'tourism AND vacation',
                sortBy: 'publishedAt',
                language: 'en',
                pageSize: 10,
                apiKey: API_KEY
            }
        });
        res.status(200).json({
            success: true,
            articles: response.data.articles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching travel news",
            error: error.message
        });
    }
};