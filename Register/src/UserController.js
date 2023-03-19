import * as userService from "./UserService.js"

async function createUserController(userDetails){
    console.log("Vengo del Servicio")
    let result =  await userService.createUserService(userDetails)
    console.log("Vego despues del servicio")
    console.log(result)
    return result;
}

async function setUserImage(userDetails){
    
}

export { createUserController }