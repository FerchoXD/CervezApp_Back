import * as productControllerService from "./UpdateProductService.js"

async function updateProductController(product) {
    let response = await productControllerService.insertProductService(product)
    console.log("Regrese del servicio")
    console.log(response)
    return response
}

export {updateProductController}