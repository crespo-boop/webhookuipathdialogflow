const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const { queryResult } = req.body;
    const Tipodedocumento = queryResult.parameters.tipoDocumento;
    const cedula = queryResult.parameters.cedula;

    let respuesta = '';

    if (Tipodedocumento && cedula) {
        respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${tipoDocumento}.`;
        // Aquí puedes agregar la lógica para generar el certificado correspondiente
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.json({
        fulfillmentText: respuesta,
    });
});

app.listen(10000, () => {
    console.log('Webhook escuchando en el puerto 10000');
});
