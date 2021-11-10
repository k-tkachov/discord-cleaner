const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const apiVersion = 9;
const baseURL = `https://discord.com/api/v${apiVersion}/`;

const instance = rateLimit(axios.create({
    baseURL,
    headers: {
        'Authorization': process.env.CLIENT_TOKEN,
    }
}), { maxRequests: 1, perMilliseconds: 1 });

module.exports = instance;
