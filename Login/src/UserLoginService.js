import bcrypt, { hash } from "bcrypt";
import { userModel } from "../../Models/UserModel.js";

async function loginUserService(user){
    let result = await findUser(user)
    return result;
}

async function findUser(user){
    let result = await userModel.findOne({ where: { email: user.email } })
    console.log(result)
    return result;
}

export { loginUserService }