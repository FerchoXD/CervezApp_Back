import bcrypt, { hash } from "bcrypt";
import { userModel } from "./UserModel.js";
import fs from "fs";
import path, { resolve } from "path";
import emailValidator from "email-validator";
import dotenv from "dotenv";
import AWS from "aws-sdk"

dotenv.config({path:"./src/AWS/Credentials/.env"})

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const params = {
  Bucket: "users-image-cervezaapp",
  ACL: 'public-read',
};

s3.createBucket(params, function(err, data) {
  if (err) {
    console.log('Error al crear el bucket', err);
  } else {
    console.log('Bucket creado correctamente', data.Location);
  }
});

const policyParams = {
  Bucket: 'users-image-cervezaapp',
  Policy: `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::users-image-cervezaapp/*"
            ]
        }
    ]
}`
};

s3.putBucketPolicy(policyParams, function(err, data) {
  if (err) {
    console.log('Error al establecer la política del bucket', err);
  } else {
    console.log('Política del bucket establecida correctamente');
  }
});

const saltRounds = 10;

async function createUserService(userDetails) {
  console.log("Funcion de crear del servicio")
  const correoValidado = validarCorreo(userDetails.email);
  const ext = path.extname(userDetails.image);
  const filepath = "src/Files/Images/" + userDetails.image
  if (correoValidado && (ext === ".jpg" || ext === ".jpeg" || ext === ".png")) {
    let passwordHasheada = await hasheo(userDetails.password, saltRounds);
    let url = await setImage(filepath, userDetails.image)
    const newUser = {
      name: userDetails.name,
      email: userDetails.email,
      password: passwordHasheada,
      image: url,
    };
    const response = await crear(userModel, newUser);
    fs.unlink(filepath, (error) => {
      if(error){
        console.log(error)
      }else{
        console.log("Se ha borrado exitosamente")
      }
    })
    return response;
  } else {
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
  console.log(newUser)
  return await new Promise(function creando(resolve, reject) {
    try {
      userModel.create(newUser)
        .then((user) => {
          console.log("Registro Creado " + user);
          resolve({
            status: 201,
            body: {
              id: user.dataValues.id,
              name: user.dataValues.name,
              email: user.dataValues.email,
              image: user.dataValues.image
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

async function setImage(filepath, filename){
  const file = fs.readFileSync(filepath);
  const params = {
    Bucket: 'users-image-cervezaapp',
    Key: filename, // Puedes cambiar el nombre del archivo aquí si lo deseas
    Body: file,
    ACL: 'public-read'
  }
  let result = await settingImage(params)
  return result;
}

async function settingImage(params){
  return new Promise(async function settingImageProcess(resolve, reject){
    try {
      const { Location } = await s3.upload(params).promise();
      console.log('Imagen cargada correctamente en S3', Location);
      console.log(Location)
      resolve(Location);
    } catch (error) {
      console.error('Error al cargar la imagen en S3', error);
      throw error;
    }
  })
}

export { createUserService };