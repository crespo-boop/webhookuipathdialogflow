const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const { queryResult, outputContexts } = req.body;

    // Verifica si outputContexts está presente
    if (!outputContexts || !Array.isArray(outputContexts)) {
        return res.json({
            fulfillmentText: 'Error interno. No se encontraron los contextos necesarios.',
        });
    }

    // Buscar el contexto específico
    const contextTipoDocumento = outputContexts.find(context => context.name.endsWith('/await_tipo_documento'));

    // Verificar si el contexto necesario está presente
    if (contextTipoDocumento) {
        const cedula = contextTipoDocumento.parameters.cedula;
        const Tipodedocumento = queryResult.parameters.Tipodedocumento; // Parámetro capturado en el intent actual

        if (Tipodedocumento && cedula) {
            const respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;

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
                return res.json({ fulfillmentText: respuesta });

            } catch (error) {
                console.log('Error al activar el proceso en UiPath Orchestrator:', error);
                return res.json({ fulfillmentText: 'Error al activar el proceso.' });
            }
        } else {
            return res.json({ fulfillmentText: 'Por favor, ingresa tanto la cédula como el tipo de documento.' });
        }
    } else {
        return res.json({ fulfillmentText: 'No se encontró el contexto necesario para procesar la solicitud.' });
    }
});

app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});
