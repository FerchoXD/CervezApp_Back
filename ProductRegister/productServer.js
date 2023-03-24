import  express  from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";
import * as productController from "./src/productController.js"

let content; 

const app= express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.urlencoded({extended:false}))
app.use(express.json());

app.listen(3003, ()=> {
    console.log("Server running in http://localhost:3003");
});

//RabbitMq

const url = "amqp://localhost"
async function CreateConnectionToRabbitMq() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    channel.assertQueue("registroProducto");
    return channel;
}

const channel = await CreateConnectionToRabbitMq(); 

channel.consume('registroProducto', async (message) => {
    content.JSON.bodyParser(message.content.toString())
    console.log("Mensaje recibido desde la cola de registro")
    channel.ack(message);

    let result = await productController.createProductController(content)

    console.log("Vengo del controller")
    console.log(result)

    const sent = await channel.sendToQueue('registroRespuesta', Buffer.from(JSON.stringify(result), {persistent:true}))
    sent ? console.log('Enviando mensae de respuesta de cola', message) : console.log("error")
})



channel.consume('registroImagenRespuesta' , async(message)=>{
    content = JSON.parse(message.content.toString())
    console.log("Mensaje recibido desde la cola")
    let result = await productController.createProductController(content)

    console.log("Vengo del controller")
    console.log(result)

    channel.sendToQueue('registroRespuesta' , Buffer.from(JSON.stringify(result),{persistent:true}))
})