const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

let userCedula = '';

app.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    let response;

    if (intent === 'SolicitarDocumento') {
        response = {
            fulfillmentText: 'Por favor, ingresa tu cédula.'
        };
    } else if (intent === 'GetCedula') {
        userCedula = req.body.queryResult.parameters.cedula;
        response = {
            fulfillmentText: `Cédula recibida: ${userCedula}. Iniciando proceso...`
        };

        // Enviar solicitud HTTP al Orchestrator para iniciar el proceso
        const orchestratorUrl = 'https://your-orchestrator-url/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs';
        const authToken = 'YOUR_AUTH_TOKEN'; // Obtén tu token de autenticación del Orchestrator
        const processKey = 'YOUR_PROCESS_KEY'; // Clave del proceso en Orchestrator

        try {
            await axios.post(orchestratorUrl, {
                startInfo: {
                    ReleaseKey: processKey,
                    Strategy: 'ModernJobsCount',
                    JobsCount: 1,
                    InputArguments: JSON.stringify({ cedula: userCedula })
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Proceso iniciado en UiPath Orchestrator.');
        } catch (error) {
            console.error('Error al iniciar el proceso en UiPath Orchestrator:', error);
        }
    }

    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor webhook escuchando en el puerto ${PORT}`);
});
