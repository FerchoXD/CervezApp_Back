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
  channel.assertQueue('registroImagenRespuesta')
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

app.post("/register", upload.single("my-file") ,async (req, res) => {

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
      let response = await prueba();
      console.log("***");
      console.log(response);
      res.status(200).send(response);
      console.log("Finalizo el proceso")
    } catch (error) {
      console.log("Error en la prueba: ", error);
      res.status(500).send({ error: "Ocurrió un error en la prueba" });
    }
  
});

//Estas son funciones preventivas

async function prueba(){
  console.log("Funcion Prueba")
    return await new Promise(function prueba2(resolve, reject) {
      channel.consume('registroRespuesta', async (messageReceived) => {
        content = JSON.parse(messageReceived.content.toString());
        console.log(content);
        resolve(content);
        channel.ack(messageReceived);
      });
    })
}