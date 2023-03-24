import {productModel} from "../../Models/productModel"

async function createProductService(productDetails){
    const newProduct =  {
      name : productDetails.name,
      size : productDetails.size,
      brand : productDetails.brand,
      price : productDetails.price
    }
    const response = await createProduct(productModel, newProduct);

}

async function createProduct (productModel, newProduct) {
   console.log("Creating Product")
   return await new Promise(async function creating(resolve, reject) {
      try{
         const result = await productModel.create(newProduct).catch((error) => {
            console.log("Promise controlated");
         }) 
         return resolve(result);
      }
      catch{
         console.log("Failed to create Product");
         return reject(new Error("Failed to create Product"));
      }
   })
}

