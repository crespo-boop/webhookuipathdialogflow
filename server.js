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

      const maxRetries = 3;
      const retryDelay = 500; // 500ms

      let retries = 0;

      async function sendRequest() {
        try {
          const respuesta = await axios.post(processUrl, jobData, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              "X-UIPATH-OrganizationUnitId": 5180295,
              'Content-Type': 'application/json'
            }
          });
          console.log('Respuesta de UiPath Orchestrator:', respuesta.data);
        } catch (error) {
          if (retries < maxRetries) {
            retries++;
            setTimeout(sendRequest, retryDelay);
          } else {
            console.log("===================================================================")
            console.log('Error al activar el proceso en UiPath Orchestrator:', error);
            respuesta += error;
            console.log("===========================================================================")
          }
        }
      }

      sendRequest();
    } catch (error) {
      console.log("===================================================================")
      console.log('Error al activar el proceso en UiPath Orchestrator:', error);
      respuesta += error;
      console.log("===========================================================================")
    }
  } else {
    respuesta = 'Por favor, ingresa tanto la cédula como el tipo de documento.';
  }

  res.json({ fulfillmentText: respuesta });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Webhook escuchando en el puerto ${port}`);
});
