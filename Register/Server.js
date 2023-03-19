import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";
import * as userController from "./src/UserController.js"
//import { hole, adios } from "./src/prueba.js"

let content;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(3001, (req, res) => {
  console.log("SERVER RUNNING IN http://localhost:3001");
});

//RabbitMq

async function createConnection() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  channel.assertQueue("registro");
  return channel;
}

createConnection()
  .then(() => {
    console.log("Funcionando");
  })
  .catch((error) => {
    console.log(error);
  });

const channel = await createConnection()

channel.consume('registro', async (message) => {
    content = JSON.parse(message.content.toString())
    console.log("Mensaje Recibido desde la cola registro")
    channel.ack(message);

    let result = await userController.createUserController(content)

    console.log("Vengo del controller")
    console.log(result)

    channel.sendToQueue('registroRespuesta', Buffer.from(JSON.stringify(result), {persistent: true}))
})

channel.consume('registroImagenRespuesta', async (message) => {
  content = JSON.parse(message.content.toString())
  console.log("Mensaje Recibido desde la cola registro")
  channel.ack(message);

  let result = await userController.createUserController(content)

  console.log("Vengo del controller")
  console.log(result)

  channel.sendToQueue('registroRespuesta', Buffer.from(JSON.stringify(result), {persistent: true}))
})