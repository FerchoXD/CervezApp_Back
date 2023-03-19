import express from "express";
import bodyParser from "body-parser";
import amqp from "amqplib";

import multer from "multer";
import fs from "fs"
import path from "path";

import emailValidator from "email-validator"

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Register/Files/Images");
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

  const email = req.body.email;
  const emailValidado = validarCorreo(email)

  const ext = path.extname(req.file.originalname)

  let queueRegistro = "registro";

  if(emailValidado && (ext === ".jpg" || ext === ".jpeg" || ext === ".png")){
    const message = {
      name:  req.body.name,
      email: req.body.email,
      password: req.body.password,
      image: ""
    };
    const image = {
      status: "Ok",
      image: true
    }
    const sent = await channel.sendToQueue(queueRegistro, Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  
    sent ? console.log(`Enviando mensaje a la cola "${queueRegistro}"`, message) : console.log("Fallo todo");
  
    let response = await prueba()

    const sentImage = await channel.sendToQueue('registroImagen', Buffer.from(JSON.stringify(image)), { persistent: true })

    sentImage ? console.log("Enviando mensaje a la cola de registroImagen") : console.log("No se puedo procesar el mensaje en la cola registroImagen")
    
    res.send(response)
  }else{
    const nombreArchivo = req.file.originalname
    const filepath = "Register/Files/Images/" + nombreArchivo
    console.log(nombreArchivo)
    console.log(filepath)
    fs.unlink(filepath, (error) => {
      if(error){
        console.log(error)
      }else{
        console.log("Se ha borrado exitosamente")
      }
    })
    res.send({status: false, message: "Verifica que tu correo que proporcionaste existe o que haya subido una imagen"})
  }
});

//Estas son funciones preventivas

async function prueba(){
  console.log("Funcion Prueba")
  try {
    return await new Promise(function prueba2(resolve, reject) {
      channel.consume('registroRespuesta', async (messageReceived) => {
        content = JSON.parse(messageReceived.content.toString());
        console.log("Mensaje Recibido desde la cola registroRespuesta");
        console.log("Soy de channel consume");
        console.log(content);

        channel.ack(messageReceived);
        resolve(content);
      });
    });
  } catch (error) {
    console.log("Algo sucedio mal: " + error);
  }
}

async function image(){
  return await new Promise(function setImage(resolve, reject){
    channel.consume('registroImagenRespuesta', async (messageReceived) => {
      content = JSON.parse(messageReceived.content.toString());

      console.log("Mensaje Recibido desde la cola registroRespuesta");
        console.log("Soy de channel consume");
        console.log(content);

        channel.ack(messageReceived);
        resolve(content);
    })
  })
}

function validarCorreo(email){
  if(emailValidator.validate(email)){
    return true;
  }else{
    return false;
  }
}