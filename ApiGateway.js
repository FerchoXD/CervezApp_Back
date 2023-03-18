import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";

const app = express();

let content;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(3000, (req, res) => {
  console.log("SERVER RUNNING IN http://localhost:3000");
});

//Configuracion de RabbitMq

async function createConnection() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  channel.assertQueue("registro");
  channel.assertQueue("registroRespuesta")
  channel.assertQueue("login");
  return channel;
}

createConnection()
  .then(() => {
    console.log("Funcionando");
  })
  .catch((error) => {
    console.log(error);
  });

const channel = await createConnection();

//Rutas Para api

app.post("/register", async (req, res) => {

  let queueRegistro = "registro";

  const message = {
    name:  req.body.name,
    email: req.body.email,
    password: req.body.password,
    image: ""
  };

  const sent = await channel.sendToQueue(queueRegistro, Buffer.from(JSON.stringify(message)),
    {
      persistent: true
    }
  );

  sent
  ? console.log(`Enviando mensaje a la cola "${queueRegistro}"`, message)
  : console.log("Fallo todo");

  let response = await prueba()
  console.log("---")
  console.log(response)
  res.send({ Message: response })
});

async function prueba(){
  console.log("Funcion Prueba")
  try {
    return await new Promise(function prueba2(resolve, reject) {
      channel.consume('registroRespuesta', async (messageReceived) => {
        content = JSON.parse(messageReceived.content.toString());
        console.log("Mensaje Recibido desde la cola registroRespuesta");
        console.log("Soy de channel consume");
        console.log(content);

        channel.ack(messageReceived);
        resolve(content);
      });
    });
  } catch (error) {
    console.log("Algo sucedio mal");
  }
}