const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
    const { queryResult } = req.body;
    const cedula = queryResult.parameters.cedula;
    const Tipodedocumento = queryResult.parameters.Tipodedocumento;

    let respuesta = '';

    if (cedula && Tipodedocumento) {
        respuesta = `Recibí tu cédula ${cedula} y el tipo de documento ${Tipodedocumento}. Estoy procesando tu solicitud.`;

        try {
            const authToken = 'rt_A40BBDF3FEF867EA85582E3C53C4AFE8555A3339159B8B03ADEEE10DE304182C-1';
            const processUrl = "https://cloud.uipath.com/uleam_proyecto/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem";
            
            const jobData = {
                itemData: {
                    "Priority": "Normal",
                    "Name": "tesis",
                    "SpecificContent": {
                        "cedula": cedula,
                        "Tipodedocumento": Tipodedocumento
                    },
                    "Reference": "Dialogflow"
                }
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
            console.log('Error al activar el proceso en UiPath Orchestrator:', error);
            respuesta += ' Hubo un error al procesar tu solicitud.';
        }
    } else {
        respuesta = 'Por favor, proporciona tanto tu cédula como el tipo de documento.';
    }

    res.json({
        fulfillmentText: respuesta
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});
