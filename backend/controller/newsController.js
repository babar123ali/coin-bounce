// controller/newsController.js
const axios = require('axios');
const {NEWS_API_KEY} = require('../config/index');

const newsController = {
  async getNews(req, res, next) {
    const NEWS_API_ENDPOINT = `https://newsapi.org/v2/everything?q=business%20AND%20blockchain&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`;

    try {
      const response = await axios.get(NEWS_API_ENDPOINT);

      // NewsAPI returns { status: "ok", totalResults, articles: [...] }
      if (response.data.status !== 'ok') {
        const error = {
          status: 502,
          message: 'News API returned an error',
        };
        return next(error);
      }

      const articles = response.data.articles.slice(0, 15);
      return res.status(200).json({ articles });
    } catch (error) {
      // Pass to Express error handler middleware
      return next(error);
    }
  },
};

module.exports = newsController;