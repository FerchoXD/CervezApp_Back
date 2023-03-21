import { DataTypes } from "sequelize";
import { db } from "../DataBase/DBConnection.js"

const productModel = db.define('product', {
    id:{
        type:DataTypes.BIGINT,
        autoIncrement : true,
        primaryKey: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    size:{
        type: DataTypes.DOUBLE,
        allowNull: false
    },
        marca:{ 
            type: DataTypes.STRING,
            allowNull: false
        }
    ,
    createDate:{
        type: DataTypes.DATE,
        defaultValue: Date.now,
        allowNull:false
    },
    updateDate:{
        type:DataTypes.DATE,
        defaultValue: ()=>{
            Date.now();
        }
    }

},{
    hooks: {
        beforeUpdate : (user) => {
            user.updateDate = Date.now()
        }
    },
    sequelize : db ,
    tableName: 'products'
})
db.sync()
    .then(() => {
        console.log("Tablas creadas")
    })
    .catch((error) => {
        console.log("Error al crear tablas: ", error)
    }) 
export {productModel} ; 