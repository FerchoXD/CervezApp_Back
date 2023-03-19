import bcrypt, { hash } from "bcrypt";
import { userModel } from "./UserModel.js";
import fs from "fs";
import path from "path";
import emailValidator from "email-validator";

const saltRounds = 10; // Número de rounds

async function createUserService(userDetails) {
  const correoValidado = validarCorreo(userDetails.email);
  const ext = path.extname(userDetails.image);
  if (correoValidado && (ext === ".jpg" || ext === ".jpeg" || ext === ".png")) {
    let passwordHasheada = await hasheo(userDetails.password, saltRounds);
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
  } else {
    const filepath = "src/Files/Images/" + userDetails.image
    console.log(filepath)
    fs.unlink(filepath, (error) => {
      if(error){
        console.log(error)
      }else{
        console.log("Se ha borrado exitosamente")
      }
    })
    return({status: false, message: "Verifica que tu correo que proporcionaste existe o que haya subido una imagen"})
  }
}

async function hasheo(password, saltRounds) {
  return await new Promise(function hasheando(resolve, reject) {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        resolve(hash);
      }
    });
  });
}

function validarCorreo(email) {
  if (emailValidator.validate(email)) {
    return true;
  } else {
    return false;
  }
}

async function crear(userModel, newUser) {
  console.log("Entro a la funcion de crear");
  return await new Promise(function creando(resolve, reject) {
    try {
      userModel
        .create(newUser)
        .then((user) => {
          console.log("Registro Creado " + user);
          resolve({
            status: 201,
            body: {
              id: user.dataValues.id,
              name: user.dataValues.name,
              email: user.dataValues.email,
            },
            message: "The user was created successfully",
          });
        })
        .catch((error) => {
          console.log("Algo salio mal " + error);
          reject({
            status: 400,
            message: "The user wasn not created",
          });
        });
    } catch {
      reject({
        status: 400,
        message: "The user wasn not created",
      });
    }
  });
}

export { createUserService };
