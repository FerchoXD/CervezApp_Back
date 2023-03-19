import bcrypt, { hash } from "bcrypt";
import { userModel } from "./UserModel.js";

const saltRounds = 10; // Número de rounds

async function createUserService(userDetails) {
  let password = userDetails.password;
  let passwordHasheada = await hasheo(password, saltRounds);
  console.log("Resolvi la promesa del hasheo")
  console.log(passwordHasheada);
  const newUser = {
    name: userDetails.name,
    email: userDetails.email,
    password: passwordHasheada,
    image: "",
  };

  const response = await crear(userModel, newUser);
  console.log("Resultado de userModel");
  console.log(response);

  return response;
}

async function hasheo(password, saltRounds) {
  return await new Promise(function hasheando(resolve, reject) {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        resolve(hash)
      }
    });
  });
}

async function crear(userModel, newUser){
  console.log("Entro a la funcion de crear")
  return await new Promise(function creando(resolve, reject){
    try{
      userModel.create(newUser).then((user) => {
        console.log("Registro Creado " + user);
        resolve({
          status: 201, 
          body: {
            id: user.dataValues.id,
            name: user.dataValues.name,
            email: user.dataValues.email
          }, 
          message: "The user was created successfully"
        })
      })
      .catch((error) => {
        console.log("Algo salio mal " + error);
        reject({
          status: 400, 
          message: "The user wasn not created"
        })
      });
    }catch{
      reject({
        status: 400, 
        message: "The user wasn not created"
      })
    }
    
  })
}

export { createUserService };
