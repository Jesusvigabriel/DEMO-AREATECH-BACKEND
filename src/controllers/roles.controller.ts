import {Request, Response} from "express"
import { 
    roles_getAll_DALC,
    rol_DALC,
    rol_getById_DALC,
    rol_edit_DALC,
    usersRol_DALC,
    userRoles_getById_DALC,
    userRol_deleteById_DALC,
    menu_getAll_DALC,
    menuRoles_deleteById_DALC,
    menuRol_DALC,
    menuRoles_getAll_DALC,
    menuUsuario_getAll_DALC
    
     } from "../DALC/roles.dalc"

export const getAll = async (req: Request, res: Response): Promise <Response> => {
    const roles = await roles_getAll_DALC()
    
     if (roles!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(roles))
     } else {
         return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al obtener Roles"))
     }
}

// Se crea un Nuevo Rol
export const putRol = async (req: Request, res: Response): Promise <Response> => {
  
    console.log(req.body)

    const result = await rol_DALC(req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Usuario Creado Correctamente"))

}


// Se actualiza un rol existente
export const editRol = async (req: Request, res: Response): Promise <Response> => {
    
    const idRol = (parseInt(req.params.id)) ? parseInt(req.params.id) : 0
    const rol = await rol_getById_DALC(idRol)

    if(rol){
        const result = await rol_edit_DALC(req.body)
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    }
    return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Rol inexistente"))  

}


// Se asigna un Nuevo Rol al usuario
export const putUsersRol = async (req: Request, res: Response): Promise <Response> => {
  
    console.log(req.body)

    const result = await usersRol_DALC(req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Rol asignado Correctamente"))

}

//Obtenemos los Roles del usuario
export const getUserRolesById = async (req: Request, res: Response): Promise <Response> => {
    const result = await userRoles_getById_DALC(parseInt(req.params.id))
    
    if (result!=null) {
        return res.json(require("lsi-util-node/API").getFormatedResponse(result))
    } else {
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "El usuario No tiene Roles Asignados"))
    }
}


 export const userRol_delete_byId = async (req: Request, res: Response): Promise <Response> =>{

     
     const results=await userRol_deleteById_DALC(Number(req.params.idUsuario),Number(req.params.idRol))
     return res.json(require("lsi-util-node/API").getFormatedResponse(results))
 }

//Obtenemos todas las opciones de menu
 export const getAllMenu = async (req: Request, res: Response): Promise <Response> => {
    const menu = await menu_getAll_DALC()
    
     if (menu!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(menu))
     } else {
         return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Error al obtener las Opciones de Menu"))
     }
}

// Se eliminan los roles para un Menu
export const menuRol_delete_byId = async (req: Request, res: Response): Promise <Response> =>{

     
    const results=await menuRoles_deleteById_DALC(Number(req.params.idRol))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}


// Se crea habilita un Menu para un Rol
export const putMenuRol = async (req: Request, res: Response): Promise <Response> => {
  
    console.log(req.body)

    const result = await menuRol_DALC(req.body)
    return res.json(require("lsi-util-node/API").getFormatedResponse(result, "Menu Habilitado correctamente"))

}

//Se Optienen todos los menus para un Rol
export const getAllMenuRol = async (req: Request, res: Response): Promise <Response> => {
    const menuRoles = await menuRoles_getAll_DALC(Number(req.params.idRol))
    
     if (menuRoles!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(menuRoles))
     } else {
         return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "No se encontraron Menus para el Rol"))
     }
}


//Se Optienen todos los menus para un usuario
export const getAllMenuUser = async (req: Request, res: Response): Promise <Response> => {
    
    const menuRoles = await menuUsuario_getAll_DALC(Number(req.params.idUsuario))
    
     if (menuRoles!=null) {
         return res.json(require("lsi-util-node/API").getFormatedResponse(menuRoles))
     } else {
         return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "No se encontraron Menus para el Rol"))
     }
}



