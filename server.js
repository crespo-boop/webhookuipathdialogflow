const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

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
            const authToken = 'rt_34C199550857FECB0FC5E0390130D76F724E921330095B52621DD4028AC9760A-1'; // Token de autenticación válido y vigente
            const organizationUnitId = 5180295; // ID de la unidad organizativa
            const tenantName = 'tu_inquilino'; // Reemplaza con el nombre de tu inquilino

            const processUrl = "https://cloud.uipath.com/uleam_proyecto/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem";
            const jobData = {
                "itemData": {
                    "Priority": "Normal",
                    "Name": "tesis",
                    "SpecificContent": {
                        "Name@odata.type": "#String",
                        "Name": "Default",
                        "cedula": cedula,
                        "Tipodedocumento": Tipodedocumento
                    },
                    "Reference": "Dialogflow"
                }
            };

            // Realizar solicitud POST para activar el proceso
            await axios.post(processUrl, jobData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    "X-UIPATH-OrganizationUnitId": organizationUnitId,
                    'X-UIPATH-TenantName': tenantName,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Proceso activado en UiPath Orchestrator.');

        } catch (error) {
            console.error('Error al activar el proceso en UiPath Orchestrator:', error);
            respuesta += error;
        }
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.json({
        fulfillmentText: respuesta,
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});