import express from 'express';
import bodyParser from 'body-parser';
import * as  updateController from ""
import {createConnection} from "../../RabbitMQ/ConnectionRabbitMq.js";

let content; 
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.listen(3005, (req ,res) => {
    console.log("server Running in http://localhost:3005")
})

const channel = await createConnection()

channel.consume('updateProductRequest', async (message)=> {
    content = JSON.parse(message.content.toString())
    channel.ack(message)
    console.log("Mensaje de la cola updateProduct")
    console.log(content)
    let updateProduct = await productController.updateProductController(content)
    channel.sendToQueue("updateProductResponse", Buffer.FROM(JSON.stringify(product), {persistent : true}))
})