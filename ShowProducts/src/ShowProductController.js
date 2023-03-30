import * as ShowProductService from "./ShowProductService.js";

async function ShowProduct(productos){
    console.log('Vengo del controlador')
    let productosResponse = await ShowProductService.getProducts(productos)
    console.log(productosResponse)
    return productosResponse
}

export {ShowProduct}