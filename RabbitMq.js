import amqp from 'amqplib'

async function createConnection () {
    const connection = await amqp.connect('amqp://localhost')
    const channel = await connection.createChannel();
    channel.assertQueue('registro');
    channel.assertQueue('login');
}

createConnection().
    then(()=>{
        console.log("Funcionando")
    }).
    catch((error)=>{
        console.log(error)
})