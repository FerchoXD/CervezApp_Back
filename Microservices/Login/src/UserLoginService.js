import bcrypt, { hash } from "bcrypt";
import { userModel } from "../../../Models/UserModel.js";
import * as Security from "./Security/Security.js"
import { s3 } from "../../.././AWS/aws.js"

async function loginUserService(user) {
  let result = await findUser(user);
  if (result !== null) {
    let comparing = await comparingPassword(user.password, result.password);
    const userInfo = {
        id: result.dataValues.id,
        username: result.dataValues.name
    }
    let token = await setToken(userInfo, Security.secretKey, Security.options);
    console.log(result.dataValues.KeyBucket)
    let response = decide(comparing, result, token, result.dataValues.KeyBucket)
    return response;
  } else {
    return {
      status: 400,
      message: "Verifica bien tu correo",
    };
  }
}

async function findUser(user) {
  let result = await userModel.findOne({ where: { email: user.email } });
  console.log(result);
  return result;
}

async function comparingPassword(password, passwordHasheada) {
  return await bcrypt.compare(password, passwordHasheada);
}

async function decide(comparing, result, token, key){
    if(comparing){
        let image = await getImage(key)
        console.log("Regreso de getImage")
        console.log(image)
        return({
            status: 200,
            name: result.dataValues.name,
            image: image,
            token: token
        })
    }else{
        return({
            status: 400,
            message: "Contraseña Incorrecta"
        })
    }
}

async function getImage(key){
    const params = {
        Bucket: "users-image-cervezaapp",
        Key: key,
        Expires: 31540000,
    }
    const url = await s3.getSignedUrl("getObject", params)
    return url;
}

async function setToken(userInfo, secretKey, options){
    return await Security.generateToken(userInfo, secretKey, options)
}

export { loginUserService };