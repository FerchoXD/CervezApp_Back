import * as  productSearchService from "./registerProductService.js"

async function searchProductController(search){
    let response = await productSearchService
    console.log("Regrese del servicio")
    console.log(response)
    return response
}

export {searchProductController}