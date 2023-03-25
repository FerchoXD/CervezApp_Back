import bodyParser from "body-parser";
import express from "express"
import amqp from "amqplib"

let content; 

const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())

app.listen(3006,(req, res) => {
    console.log("Server running on port 3006")
})

async function createConnection() {
     const connection = await amqp.connect("amqp://localhost");
     const channel = await connection.createChannel();
     return channel;
}

const channel =   await createConnection();

channel.consume('busquedaProducto', async (message) => {
    content = JSON.parse(message.content.toString());
    channel.ack(message)
    console.log("Mensaje a la cola busquedaProducto")
    console.log(content)
    let search = await searchController.searchProductController(content);
    console.log("Regreso del controlador")
    console.log(search)
    const sent = channel.sendToQueue('busquedaProductoRespuesta', Buffer.from(JSON.stringify(search), {persistent: true }))
})