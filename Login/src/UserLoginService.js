import bcrypt, { hash } from "bcrypt";
import { userModel } from "../../Models/UserModel.js";

async function loginUserService(user) {
  let result = await findUser(user);
  console.log("Vengo de buscar el usuario");
  if (result !== null) {
    let comparing = await comparingPassword(user.password, result.password);
    return response = decide(comparing)
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
  await bcrypt.compare(password, passwordHasheada);
}

function decide(comparing){
    if(comparing){
        return({
            status: 200,
            name: result.dataValues.name,
            image: result.dataValues.image
        })
    }else{
        return({
            status: 400,
            message: "Contraseña Incorrecta"
        })
    }
}

export { loginUserService };