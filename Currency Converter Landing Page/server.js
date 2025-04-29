const express = require('express');
const axios = require('axios');
const csrf = require('csurf');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(csrf());

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Rates endpoint
app.get('/api/rates', async (req, res) => {
    try {
        const response = await axios.get('https://api.exchangeratesapi.io/v1/latest', {
            params: {
                access_key: process.env.EXCHANGE_RATES_API_KEY,
                symbols: 'NGN,XOF,GHS,USD,EUR,GBP'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rates' });
    }
});

// News endpoint
app.get('/api/news', async (req, res) => {
    try {
        const { category, country } = req.query;
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                apiKey: process.env.NEWS_API_KEY,
                category,
                country
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const cleanData = {
        name: sanitizeHtml(req.body.name, { allowedTags: [] }),
        email: sanitizeHtml(req.body.email, { allowedTags: [] }),
        message: sanitizeHtml(req.body.message, { allowedTags: [] })
    };
    // Process or store cleanData
    res.json({ success: true });
});

// Error logging endpoint
app.post('/api/log-error', (req, res) => {
    console.error('Client error:', req.body);
    res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on port 3000'));