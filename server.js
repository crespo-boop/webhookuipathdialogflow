// Importa las librerías necesarias
const express = require('express');
const bodyParser = require('body-parser');

// Crea una instancia de Express
const app = express();

// Configura el middleware para analizar solicitudes JSON
app.use(bodyParser.json());

// Ruta para el webhook
app.post('/webhook', (req, res) => {
    // Extrae los parámetros de la solicitud de Dialogflow
    const { queryResult } = req.body;
    const cedula = queryResult.parameters.cedula;
    const nombre = queryResult.parameters.nombre;

    // Realiza cualquier procesamiento necesario (por ejemplo, consulta a una base de datos)
    // Aquí simplemente devolvemos una respuesta con los datos recibidos
    const respuesta = `¡Hola ${nombre}! Tu cédula es ${cedula}.`;

    // Envía la respuesta a Dialogflow
    res.json({
        fulfillmentText: respuesta,
    });
});

// Inicia el servidor en el puerto 3000
app.listen(10000, () => {
    console.log('Webhook escuchando en el puerto 10000');
});
