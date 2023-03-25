import express from "express";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = createServer(app);
const io = new SocketIOServer(server);

server.listen(3000, '0.0.0.0', () => {
    console.log('Running at at localhost:3000')
})
export { app, io }