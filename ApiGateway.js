import express from "express";
import bodyParser from "body-parser";
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

//Importaciones de otros archivos
import { router } from "./Routes/Routes.js";


const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

export { io }

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

server.listen(3000, '0.0.0.0', () => {
    console.log('Running at at localhost:3000')
  }
)