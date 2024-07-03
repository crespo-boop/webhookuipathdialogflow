// webhook.js

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 10000;

const CONTROL_ROOM = 'https://community.cloud.automationanywhere.digital';
const BOT_JSON = {
    fileId: 13155573,
    runAsUserIds: [],  // Puedes ajustar esto según tus necesidades
    poolIds: [],
    overrideDefaultDevice: false,
    botInput: {}
};
const CR_USERNAME = 'e1315299923@live.uleam.edu.ec';
const CR_PASSWORD = 'Jerick2001.';

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    // Obtener los parámetros necesarios del cuerpo de la solicitud JSON
    const { cedula } = req.body.queryResult.parameters;

    // Añadir la cedula al JSON del bot
    BOT_JSON.botInput.cedula = { type: "STRING", string: cedula };

    // Obtener token para acceder al Control Room de Automation Anywhere
    const authPayload = { username: CR_USERNAME, password: CR_PASSWORD };
    const authUrl = `${CONTROL_ROOM}/v1/authentication`;
    
    request.post(authUrl, { json: authPayload }, (error, response, body) => {
        if (error) {
            return res.json({ fulfillmentText: "Error al obtener el token." });
        }
        const token = body.token;

        // Enviar la solicitud de despliegue del bot
        const botUrl = `${CONTROL_ROOM}/v3/automations/deploy`;
        request.post(botUrl, { json: BOT_JSON, headers: { 'X-Authorization': token } }, (error, response, body) => {
            if (error) {
                return res.json({ fulfillmentText: "Error al desplegar el bot." });
            }
            return res.json({
                fulfillmentText: "Gracias por la información. Tu solicitud está siendo procesada."
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});

