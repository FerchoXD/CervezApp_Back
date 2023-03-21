import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";
import multer from "multer";

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Register/src/Files/Images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer(
    {storage: storage}
);

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
  channel.assertQueue('registroImagen')
  channel.assertQueue('registroImagenRespuesta')//Verificar si se esta usando esta cola
  channel.assertQueue("login");
  channel.assertQueue('loginRespuesta')
  return channel;
}

//Rutas Para api

app.post("/register", upload.single("my-file") ,async (req, res) => {

  const channel = await createConnection();

  let queueRegistro = "registro";

    const message = {
      name:  req.body.name,
      email: req.body.email,
      password: req.body.password,
      image: req.file.originalname
    };
    
    const sent = await channel.sendToQueue(queueRegistro, Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    sent ? console.log(`Enviando mensaje a la cola "${queueRegistro}"`, message) : console.log("Fallo todo");
  
    try {
      let response = await consumeQueue(channel);
      console.log("***");
      console.log(response);
      res.status(201).send(response);
      console.log("Finalizo el proceso")
      res.end();
    } catch (error) {
      console.log("Error en la prueba: ", error);
      res.status(500).send({ error: "Ocurrió un error en la prueba" });
    }
  
});

app.get("/login", async (req, res) => {
  const channel = await createConnection();
  let queueLogin = "login"
  const request = {
    email: req.body.email,
    password: req.body.password
  }
  const sent = channel.sendToQueue(queueLogin, Buffer.from(JSON.stringify(request)))
  sent ? console.log(`Enviando mensaje a la cola "${queueLogin}"`, request) : console.log("Fallo todo")
  let response = await consumeQueue2(channel);
  console.log("Recibo en Api Gateway")
  console.log(response)
  res.send(response)
})

//Estas son funciones preventivas

async function consumeQueue(channel){
  return new Promise(async function consumingQueue(resolve, reject) {
    await channel.consume('registroRespuesta', async (messageReceived) => {
      console.log("Consume Queue")
      console.log(messageReceived)
      content = JSON.parse(messageReceived.content.toString());
      channel.ack(messageReceived);
      console.log(content)
      await channel.close();
      resolve(content)
    })
  })
}

async function consumeQueue2(channel){
  return new Promise(async function consumingQueue(resolve, reject) {
    await channel.consume('loginRespuesta', async (messageReceived) => {
      console.log("Consume Queue")
      console.log(messageReceived)
      content = JSON.parse(messageReceived.content.toString());
      channel.ack(messageReceived);
      console.log(content)
      await channel.close();
      resolve(content)
    })
  })
}