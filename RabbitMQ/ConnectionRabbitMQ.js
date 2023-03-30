import amqp from "amqplib";

async function createConnection() {
    const connection = await amqp.connect('amqp://fer:1234@52.71.157.124:5672');
    const channel = await connection.createChannel();
    channel.assertQueue("registro");
    channel.assertQueue("registroRespuesta")
    channel.assertQueue("login");
    channel.assertQueue('loginRespuesta')
    channel.assertQueue('newProductRequest')
    channel.assertQueue('newProductResponse')
    channel.assertQueue('searchProductRequest')
    channel.assertQueue('searchProductResponse')


    channel.assertQueue('payProductRequest')
    channel.assertQueue('payProductResponse')
    return channel;
}

export { createConnection }