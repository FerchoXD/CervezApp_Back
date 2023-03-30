import express from 'express'
import bodyParser from 'body-parser'
import * as ShowProductController from './src/ShowProductController'
import {createConnection} from '../../RabbitMQ/ConnectionRabbitMQ'

let content 

const app = express()

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

app.use(express.urlencoded({ extended: false}))
app.use(express.json())

app.listen(3010, (req, res) =>{
    console.log("Server running in port", app.get('port'))
})

const channel = await createConnection()

channel.consume('showProductsRequest') , async(message)=>{
    content = JSON.parse(message.content.toString())
    channel.ack(message)
    console.log("Mensaje de la cola registroProducto")
    console.log(content)
    let product = await ShowProductController.ShowProduct(content)
    console.log("Regreso de todos los procesos")
    console.log(product)
    channel.sendToQueue("showProductResponse", Buffer.from(JSON.stringify(product), {persistent: true}))
}