const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
    const { queryResult } = req.body;
    const { Tipodedocumento, cedula } = queryResult.parameters;

    let respuesta = '';

    if (Tipodedocumento && cedula) {
        respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;

        const jobData = {
            itemData: {
                "Priority": "Normal",
                "Name": "tesis",
                "Description": "Procesamiento de documento",
                "SpecificContent": {
                    "Name@odata.type": "#String",
                    "Name": "Default",
                    "cedula": cedula,
                    "Tipodedocumento": Tipodedocumento
                }
            },
            "Reference": "Dialogflow"
        };

        try {
            // Configuración de UiPath Orchestrator (reemplaza con tus valores)
            const authToken = 'rt_34C199550857FECB0FC5E0390130D76F724E921330095B52621DD4028AC9760A-1';
            const processUrl = 'https://cloud.uipath.com/tu_tenant/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem';

            const response = await axios.post(processUrl, jobData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    "X-UIPATH-OrganizationUnitId": 5180295,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta de UiPath:', response.data);

            // Devuelve un JSON con mensaje de éxito y la respuesta de UiPath (opcional)
            res.json({
                success: true,
                message: 'Tu solicitud ha sido procesada correctamente.',
                uiPathResponse: response.data
            });
        } catch (error) {
            console.error('Error al activar el proceso en UiPath Orchestrator:', error);

            // Devuelve un JSON con mensaje de error y el error detallado
            res.status(500).json({
                success: false,
                message: 'Ocurrió un error al procesar tu solicitud.',
                error: error.message
            });
        }
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
        res.json({
            success: false,
            message: respuesta
        });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});