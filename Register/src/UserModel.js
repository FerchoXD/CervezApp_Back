import { DataTypes, Model } from "sequelize";
import db from "../DataBase/DBConnection"

class User extends Model { };

User.init({
    id:{
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    image:{
        type: DataTypes.STRING
    }
}, {
    sequelize: db,
    tableName: 'users'
})

User.sync();

export default User;