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

            console.log('Proceso activado en UiPath Orchestrator:', response.data);

            // Devuelve un JSON con mensaje de éxito
            res.json({
                success: true,
                message: 'Tu solicitud ha sido procesada correctamente.'
            });
        } catch (error) {
            console.error('Error al activar el proceso en UiPath Orchestrator:', error);

            if (error.response && error.response.data.message.includes('itemData')) {
                console.error('El campo itemData es inválido o falta algún campo requerido.');
                respuesta += 'Ocurrió un error al procesar tu solicitud. Por favor, verifica los datos ingresados.';
            } else if (error.response && error.response.status === 401) {
                console.error('Error de autenticación');
                respuesta += 'Error de autenticación. Verifica tu token de acceso.';
            } else if (error.response && error.response.status === 404) {
                console.error('Proceso no encontrado en UiPath');
                respuesta += 'El proceso que intentas activar no existe en UiPath.';
            } else {
                console.error('Ocurrió un error inesperado:', error);
                respuesta += 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.';
            }

            res.json({
                success: false,
                message: respuesta
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