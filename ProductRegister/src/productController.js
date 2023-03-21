import * as productService from "./productService.js"

async function createProductController(productDetails){
    let result = await productService.createProductController(productDetails)
    console.log("Vengo despues del servicio")
    console.log(result)
    return result
}

export {createProductController}