import { productModel } from "../../Models/ProductModel.js"

async function insertProductService(product){
    console.log("Insertando productos")
    const timestamp = new Date().getTime();
    const keyBucket = timestamp + " - " + product.keyBucket
    product.size = parseFloat(product.size)
    product.stock = parseInt(product.size)
    product.price = parseFloat(product.price)
    product.keyBucket = keyBucket;
    console.log(product)
    let productAdd = await newProduct(product)
    console.log("Regreso de querer crear el producto");
    console.log(productAdd)
    if(productAdd !== undefined){
        return {
            status: 201,
            message: "El producto a sido añadido correctamente"
        }
    }else{
        return {
            status: 500,
            message: "El producto no pudo haber sido añadido"
        }
    }
}

async function newProduct(product){
    console.log("Entro a new Producto")
    let result = await productModel.create(product).catch((error) => { console.log("Por si acaso") })
    return result;
}

export { insertProductService }