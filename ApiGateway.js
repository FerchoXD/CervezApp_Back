import express from 'express'
import bodyParser from 'body-parser';
import amqp from 'amqplib'

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
})

//Rutas Para api

app.post('/register', (req, res) => {
    res.send({Message: "Hola Mundo"})
})