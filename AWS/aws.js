import AWS from "aws-sdk";

AWS.config.update({
  //accessKeyId: "{aqui ira tu access key}",
  //secretAccessKey: "{aqui ira tu secret key}"",
  //region: "{aqui ira tu region}",
});

const s3 = new AWS.S3();
const sns = new AWS.SNS();

const paramsUser = {
  Bucket: "users-image-cervezaapp",
  ACL: "public-read",
};

s3.createBucket(paramsUser, function (err, data) {
  if (err) {
    console.log("Error al crear el bucket de usuarios", err);
  } else {
    console.log("Bucket creado correctamente", data.Location);
  }
});



export { s3, sns }