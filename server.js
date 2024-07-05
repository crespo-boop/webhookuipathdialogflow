const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 10000;  // Render debería establecer la variable de entorno PORT

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { queryResult } = req.body;
    const Tipodedocumento = queryResult.parameters.Tipodedocumento;
    const cedula = queryResult.parameters.cedula;

    console.log('Tipodedocumento:', Tipodedocumento);
    console.log('cedula:', cedula);

    let respuesta = '';

    if (Tipodedocumento && cedula) {
        respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;
        // Aquí puedes agregar la lógica para generar el certificado correspondiente
    } else {
        respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.json({
        fulfillmentText: respuesta,
    });
});

app.listen(port, () => {
  console.log(`Webhook escuchando en el puerto ${port}`);
});
