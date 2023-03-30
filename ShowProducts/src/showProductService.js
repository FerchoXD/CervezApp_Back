import { productModel } from "../../../Models/ProductModel";
import {s3} from '../../../AWS/aws.js'
import { where } from "sequelize";

async function getProducts() {
    let productos = await findProducts()
    if (productos.length > 0) {
        productos = productos.dataValues['status'] = 200
        productos = productos.dataValues['image'] = await getImage(productos[0].dataValues.keyBucket)
        return productos
    } else {
        return [
            {
                status : 404,
                error:{
                    code: "NOT FOUND"
                },
                message : "No se encuentran productos"
            }
        ]
    }

}

async function findProducts() {
    console.log("Entro al findProducts");
    try {
      let products = await productModel.findAll({
        where: {  },
        attributes : ['name', 'brand', 'size', 'unit', 'price', 'KeyBucket'],
        order :[
            ['name','ASC'],
            ['price','ASC']
        ]
      }
      );
    } catch (err) {
      console.error(err);
      return null;
    }
    return products;
  }

  function getImage(key) {
    console.log("entro a getimage")
  const params = {
    Bucket: "products-image-cervezaapp",
    Key: key,
    Expires: 31540000, // tiempo en segundos antes de que la URL prefirmada expire
  };
  return s3.getSignedUrl("getObject", params);
}

export {getProducts}