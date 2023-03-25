import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";
import * as productController from "./src/RegisterProductController.js"

let content;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(3003, (req, res) => {
  console.log("SERVER RUNNING IN http://localhost:3001");
});

async function createConnection() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    return channel;
}
  
const channel = await createConnection()

channel.consume('registroProducto', async(message) => {
    content = JSON.parse(message.content.toString())
    channel.ack(message)
    console.log("Mensaje de la cola registroProducto")
    console.log(content)
    let product = await productController.registerProductController(content)
    console.log("Regreso del controller")
    console.log(product)
    const sent = channel.sendToQueue("registroProductoRespuesta", Buffer.from(JSON.stringify(product), {persistent: true}))
})