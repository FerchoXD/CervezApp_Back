import { Sequelize } from "sequelize";

const db = new Sequelize('sys', 'admin', 'adminadmin', {
    host: 'users.c5i3kkz0eygh.us-east-1.rds.amazonaws.com',
    dialect: 'mysql',
    port: 3306
})

db.authenticate()
    .then(()=>{
        console.log("Conectado a la BDD")
    })
    .catch((error)=> {
        console.log("El error de la base de datos es: " + error)
    })

export default db;