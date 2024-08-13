const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: '206.206.127.140',
    user: 'crespito',
    password: '2002',
    database: 'tesis'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Función para verificar si la cédula existe en la base de datos
const verificarCedula = (cedula, callback) => {
    const Cedula = cedula.toUpperCase(); // Convertir cédula a mayúsculas
    const query = 'SELECT * FROM estudiante WHERE Cedula = ?'; // La columna en la base de datos está en mayúsculas
    db.query(query, [Cedula], (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);
            callback(err, null);
        } else {
            callback(null, results.length > 0);
        }
    });
};

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
    const queryResult = req.body.queryResult || {};
    const intent = queryResult.intent || {};
    const intentName = intent.displayName || 'Intent desconocido';  // Nombre del intent activado, valor por defecto si no existe

    let respuesta = '';
    let followUp = '';
    const cedula = queryResult.parameters ? queryResult.parameters.cedula : null; // La cédula proporcionada por Dialogflow
    const TipoDocumento = queryResult.parameters ? queryResult.parameters.TipoDocumento : null;

    switch (intentName) {
        case 'ActivarProceso': // Intent para iniciar el proceso
            respuesta = 'Por favor, facilítame tu cédula.';
            break;

        case 'ObtenerCedula': // Intent para recibir la cédula
            if (cedula) {
                verificarCedula(cedula, async (err, existe) => {
                    if (err) {
                        respuesta = 'Hubo un problema al verificar la cédula. Por favor, inténtalo de nuevo más tarde.';
                    } else if (existe) {
                        followUp = 'SolicitarTipoDocumento'; // Indica que la cédula es válida y necesitamos el tipo de documento
                        respuesta = 'Tu cédula ha sido recibida. Ahora, ¿qué tipo de documento necesitas?';
                    } else {
                        respuesta = 'La cédula proporcionada no se encuentra en nuestra base de datos. Por favor, verifica e intenta de nuevo.';
                    }
                    res.json({
                        fulfillmentText: respuesta,
                        followUpEventInput: followUp ? {
                            name: followUp,
                            parameters: {},
                            languageCode: 'es'
                        } : undefined
                    });
                });
            } else {
                respuesta = 'Por favor, proporciona una cédula.';
                res.json({
                    fulfillmentText: respuesta
                });
            }
            break;

        case 'TipoDocumento': // Intent para recibir el tipo de documento
            if (TipoDocumento) {
                try {
                    // Configuración para activar el proceso en UiPath
                    const authToken = 'rt_A40BBDF3FEF867EA85582E3C53C4AFE8555A3339159B8B03ADEEE10DE304182C-1'; // Reemplaza con tu token de autenticación válido
                    const processUrl = "https://cloud.uipath.com/uleam_proyecto/DefaultTenant/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem";
                    const jobData = {
                        itemData: {
                            "Priority": "Normal",
                            "Name": "tesis",
                            "SpecificContent": {
                                "cedula": cedula,
                                "documento": TipoDocumento
                            },
                            "Reference": "Dialogflow"
                        }
                    };

                    // Activar el proceso en UiPath
                    await axios.post(processUrl, jobData, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            "X-UIPATH-OrganizationUnitId": 5180295,
                            'Content-Type': 'application/json'
                        }
                    });

                    respuesta = `Tu solicitud para el documento de tipo ${TipoDocumento} ha sido procesada.`;
                } catch (error) {
                    console.error('Error al activar el proceso en UiPath:', error);
                    respuesta = 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
                }
            } else {
                respuesta = 'Por favor, proporciona el tipo de documento.';
            }
            res.json({
                fulfillmentText: respuesta
            });
            break;

        case 'SolicitarOtroDocumento': // Intent para preguntar si el usuario quiere otro documento
            respuesta = '¿Necesitas algún otro documento?';
            res.json({
                fulfillmentText: respuesta
            });
            break;

        default:
            respuesta = 'No entiendo lo que dices. Por favor, proporciona la información solicitada.';
            res.json({
                fulfillmentText: respuesta
            });
            break;
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Webhook escuchando en el puerto ${port}`);
});
