const axios = require('axios');

const Dev = require('../models/dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
    async index(request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async create(request, response) {
        const { github_username, techs, latitude, longitude } = request.body;

        let dev = await Dev.findOne({ github_username });

        if (!dev) {
            const githubApiResponse =  await axios.get(`https://api.github.com/users/${github_username}`);

            const { name = login, avatar_url, bio } = githubApiResponse.data;
    
            const devTechs = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        
            dev = await Dev.create({
                name,
                github_username,
                bio,
                avatar_url,
                techs: devTechs,
                location,
            });

            const sendSocketMessageTo = findConnections(
                { latitude, longitude },
                devTechs
            );

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }

        return response.json(dev);
    },

    async update(request, response) {
        // @TODO
    },

    async delete(request, response) {
        // @TODO
    },
};