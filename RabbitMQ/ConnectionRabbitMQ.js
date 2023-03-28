import amqp from "amqplib";

async function createConnection() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    channel.assertQueue("registro");
    channel.assertQueue("registroRespuesta")
    channel.assertQueue("login");
    channel.assertQueue('loginRespuesta')
    channel.assertQueue('newProductRequest')
    channel.assertQueue('newProductResponse')
    return channel;
}

export { createConnection }