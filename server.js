const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

// Endpoint para el webhook de Dialogflow
app.post('/webhook', async (req, res) => {
  try {
    const { queryResult } = req.body;
    const Tipodedocumento = queryResult.parameters.Tipodedocumento;
    const cedula = queryResult.parameters.cedula;
    let respuesta = '';

    if (Tipodedocumento && cedula) {
      respuesta = `Tu cédula es ${cedula}. Has seleccionado procesar un documento de tipo ${Tipodedocumento}.`;

      // Configuración de UiPath Orchestrator
      const authToken = 'rt_34C199550857FECB0FC5E0390130D76F724E921330095B52621DD4028AC9760A-1';
      const processUrl = "(link unavailable)";
      const jobData = {
        itemData: {
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
      const response = await axios.post(processUrl, jobData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          "X-UIPATH-OrganizationUnitId": 5180295,
          'Content-Type': 'application/json'
        }
      });

      console.log('Proceso activado en UiPath Orchestrator.');
    } else {
      respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
    }

    res.json({ fulfillmentText: respuesta });
  } catch (error) {
    const errorMessage = error.message;
    const errorStatus = error.status;
    const errorData = error.data;

    // Devuelve la respuesta de error detallada
    res.json({
      error: {
        message: errorMessage,
        status: errorStatus,
        data: errorData
      }
    });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Webhook escuchando en el puerto ${port}`);
});
