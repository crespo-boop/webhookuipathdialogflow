const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT   
 || 10000;

app.use(bodyParser.json());

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
    const { queryResult } = req.body;
    const Tipodedocumento = queryResult.parameters.Tipodedocumento;
    const cedula = queryResult.parameters.cedula;

    let respuesta = '';

    if (Tipodedocumento && cedula) {
        respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;

        try {
            // Configuración de UiPath Orchestrator
            const authToken = 'rt_34C199550857FECB0FC5E0390130D76F724E921330095B52621DD4028AC9760A-1';
            const processKey = '5180295';

            const processUrl = "https://cloud.uipath.com/uleam_proyecto/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem";
            const jobData = {
                // ...
            };

            await axios.post(processUrl, jobData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    "X-UIPATH-OrganizationUnitId": 5180295,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Proceso activado en UiPath Orchestrator.');
        } catch (error) {
            console.error('Error al activar el proceso en UiPath Orchestrator:', error);

            let errorMessage = 'Ocurrió un error al procesar tu solicitud.';
            if (error.response) {
                console.error(error.response.data);
                console.error(error.response.status);
                console.error(error.response.headers);
                errorMessage   
 = 'UiPath respondió con un error: ' + error.response.data.message;
            } else if (error.request) {
                console.error(error.request);
                errorMessage = 'No se pudo conectar con UiPath.';
            } else {
                console.error('Error', error.message);
                errorMessage = 'Ocurrió un error inesperado.';
            }

            respuesta += errorMessage;
        }
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.status(200).json({
        fulfillmentText: respuesta,
    });
});

app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});