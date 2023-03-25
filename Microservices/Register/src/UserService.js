import bcrypt, { hash } from "bcrypt";
import { userModel } from "../../../Models/UserModel.js";
import fs from "fs";
import path, { resolve } from "path";
import emailValidator from "email-validator";

import { s3, sns } from "../../../AWS/aws.js"

const saltRounds = 10;

async function createUserService(userDetails) {
  console.log("Entro aca de create del service de user")
  const correoValidado = validarCorreo(userDetails.email);
  const ext = path.extname(userDetails.image);
  const filepath = "src/Files/Images/" + userDetails.image;
  const timestamp = new Date().getTime();
  let key = timestamp + " - " + userDetails.image
  if (correoValidado && (ext === ".jpg" || ext === ".jpeg" || ext === ".png")) {
    let passwordHasheada = await hasheo(userDetails.password, saltRounds);
    let url = await setImage(filepath, key);
    const newUser = {
      name: userDetails.name,
      email: userDetails.email,
      password: passwordHasheada,
      image: url.url,
      KeyBucket: url.keyBucket
    };
    const response = await crear(userModel, newUser);
    if(response !== undefined){
      deleteImageServer(filepath)
      await suscribeEmail(userDetails.email)
      return response;
    }else{
      deletingImageBucket(key)
      deleteImageServer(filepath)
      return {status: false, message: "El correo que estas usando ya existe"}
    }
  } else {
    fs.unlink(filepath, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Se ha borrado exitosamente");
      }
    });
    deletingImageBucket(key)
    return {
      status: false,
      message:
        "Verifica que tu correo que proporcionaste existe o que haya subido una imagen",
    };
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

function deleteImageServer(filepath){
  fs.unlink(filepath, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Se ha borrado exitosamente");
    }
  });
}

function validarCorreo(email) {
  return !!(emailValidator.validate(email));
}

async function crear(userModel, newUser) {
  console.log("Entro a la funcion de crear del servicio");
  return await new Promise(async function creando(resolve, reject) {
    try{
      const result = await userModel.create(newUser).catch((error) => {console.log("Se controlo la promesa")})
      return resolve(result)
    }catch{
      console.log("Algo sucedio mal dentro de la funcion crear y cai en el catch")
      return reject({status: false, message: "El correo que estas usando ya existe"})
    }
  });
}

async function setImage(filepath, key) {
  const file = fs.readFileSync(filepath);
  const params = {
    Bucket: "users-image-cervezaapp",
    Key: key, // Puedes cambiar el nombre del archivo aquí si lo deseas
    Body: file,
    ACL: "public-read",
  };
  let result = await settingImage(params, key);
  return result;
}

async function settingImage(params, key) {
  console.log("Entro a setting image")
  return new Promise(async function settingImageProcess(resolve, reject) {
    try {
      s3.putObject(params, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          const params = {
            Bucket: "users-image-cervezaapp",
            Key: key,
            Expires: 31540000, // tiempo en segundos antes de que la URL prefirmada expire
          };
          const url = s3.getSignedUrl("getObject", params);
          resolve({url: url, keyBucket: key})
        }
      });
    } catch (error) {
      console.error("Error al cargar la imagen en S3", error);
      throw error;
    }
  });
}

function deletingImageBucket(key){
  const params = {
    Bucket: "users-image-cervezaapp",
    Key: key
  }
  s3.deleteObject(params, function(error, data) {
    if (error) { 
      console.log(error, error.stack); 
    } else {
        console.log(data);
    }         
  });
}

async function suscribeEmail(email){
  console.log("Funcion Suscribe Email")
  let params = {
    Protocol: 'EMAIL', 
    TopicArn: 'arn:aws:sns:us-east-1:240106434588:CervezApp',
    Endpoint: email
  };
  sns.subscribe(params, (err, data) => {
    if (err) {
        console.log("Algo ha salido mal dentro de aca de sns suscribe")
        console.log(err);
    } else {
        console.log(data);
    }
});
}

export { createUserService };