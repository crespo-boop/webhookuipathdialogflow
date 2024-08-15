const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
    const { queryResult, outputContexts } = req.body;
    
    if (!outputContexts) {
        console.log('outputContexts no está presente en el request body');
        return res.json({
            fulfillmentText: 'Error interno. Por favor, intente de nuevo.',
        });
    }

    const contextTipoDocumento = outputContexts.find(context => context.name.endsWith('/await_tipo_documento'));

    if (!contextTipoDocumento) {
        console.log('Contexto await_tipo_documento no encontrado');
        return res.json({
            fulfillmentText: 'No se encontró el contexto necesario para procesar la solicitud.',
        });
    }

    const cedula = contextTipoDocumento.parameters.cedula;
    const Tipodedocumento = contextTipoDocumento.parameters.Tipodedocumento;

    let respuesta = '';

    if (Tipodedocumento && cedula) {
        respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;

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
            respuesta += ' Error al activar el proceso.';
        }
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.json({
        fulfillmentText: respuesta,
    });
});
