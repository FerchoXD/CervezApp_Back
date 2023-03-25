import express from "express";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { createConnection } from "./RabbitMQ/ConnectionRabbitMQ.js";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = createServer(app);
const io = new SocketIOServer(server, {
    cors:{
        origin:'http://localhost:5173'
    }
});

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
await createConnection()

let socketLogin = io.of('/login')
let socketRegister = io.of('/register')

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 3, // Límite de 100 solicitudes por minuto
    message: "Has excedido el límite de solicitudes por minuto. Por favor, inténtalo de nuevo más tarde."
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Microservices/Register/src/Files/Images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer(
    {storage: storage}
);

const router = express.Router();

router.route('/user/login').post(limiter, async(req, res) => {
    const channel = await createConnection();
    let queueRequest = "login"
    let queueResponse = "loginRespuesta"
    const request = {
        email: req.body.email,
        password: req.body.password
    }
    const sent = channel.sendToQueue(queueRequest, Buffer.from(JSON.stringify(request)))
    sent ? console.log(`Enviando mensaje a la cola "${queueRequest}"`, request) : console.log("Fallo todo")
    let response = await consumeQueue(channel, queueResponse);

  //Aqui ira todo lo de los sockets, esto es momentaneo 
    res.status(response.status).send({ User: response})
    socketLogin.emit('login', {User: response})
    res.end()
})

router.route('/user/register').post(limiter, upload.single("my-file") ,async(req, res)=>{
  console.log(req)
  const channel = await createConnection();

  let queueRequest = "registro";
  let queueResponse = "registroRespuesta"

    const message = {
      name:  req.body.name,
      email: req.body.email,
      password: req.body.password,
      image: req.file.originalname
    };
    
    const sent = await channel.sendToQueue(queueRequest, Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    sent ? console.log(`Enviando mensaje a la cola "${queueRequest}"`, message) : console.log("Fallo todo");
  
    try {
      let response = await consumeQueue(channel, queueResponse);
      console.log("*");
      console.log(response);
      res.status(201).send(response);
      console.log("Finalizo el proceso")
      res.end();
      socketRegister.emit('newRegister', response)
    } catch (error) {
      console.log("Error en la prueba: ", error);
      res.status(500).send({ error: "Ocurrió un error en la prueba" });
      socketRegister.emit('badRegister', { status: 500, message: "Ocurrio un error en el registro" })
    }
})

async function consumeQueue(channel, queueResponse){
    return new Promise(async function consumingQueue(resolve, reject) {
      await channel.consume(queueResponse, async (messageReceived) => {
        console.log("Consume Queue")
        console.log(messageReceived)
        channel.ack(messageReceived);
        let content = JSON.parse(messageReceived.content.toString());
        console.log(content)
        await channel.close();
        resolve(content)
      })
    })
  }

app.use(router)

server.listen(3000, '0.0.0.0', () => {
    console.log('Running at at localhost:3000')
})