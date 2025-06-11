import {getRepository, createQueryBuilder} from "typeorm"
import { Roles } from "../entities/Roles"
import { UsersRoles } from '../entities/UsersRoles';
import { OpcionesMenu } from "../entities/OpcionesMenuWeb";
import { MenuRoles } from "../entities/MenuRoles";


export const roles_getAll_DALC = async () => {
    const roles = await getRepository(Roles).find()
    return roles
}

export const rol_DALC = async (body:any) => {
  
    // Creamos el usuario.
    console.log(body)
    const newRol = await getRepository(Roles).create(body)
    const result = await getRepository(Roles).save(newRol);
    return result
}


export const rol_getById_DALC = async (id: number) => {
    const result = await getRepository(Roles).findOne( {where: {Id: id}})
    return result
}


export const rol_edit_DALC = async (body:any) => {
    
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    // Editamos el Usuario
    console.log(datosAGuardar)
        const result = await getRepository(Roles).save(datosAGuardar)
        return result
    
}


export const usersRol_DALC = async (body:any) => {
  
    // asignamos el rol al usuario.
    console.log(body)
    const newRol = await getRepository(UsersRoles).create(body)
    const result = await getRepository(UsersRoles).save(newRol);
    return result
}

export const userRoles_getById_DALC = async (id: number) => {
    const result = await getRepository(UsersRoles).find( {where: {IdUsuario: id}})
    return result
}

export const userRol_deleteById_DALC = async(idUsuario: number, idRol: number ) => {
    const results = await getRepository(UsersRoles)
        .createQueryBuilder()
        .delete()
        .from("users_roles")
        .where("USER_ID = :idUsuario", {idUsuario})
        .andWhere("ROLE_ID = :idRol", {idRol})
        .execute()
    return
}

// Obtenemos todas las opciones de Menu
export const menu_getAll_DALC = async () => {
    const roles = await getRepository(OpcionesMenu).find()
    return roles
}


export const menuRoles_deleteById_DALC = async(idRol: number ) => {
    console.log(idRol)
    const results = await getRepository(MenuRoles)
        .createQueryBuilder()
        .delete()
        .from("web_options_menu_roles")
        .where("ROLE_ID = :idRol", {idRol})
        .execute()
    return
}


export const menuRol_DALC = async (body:any) => {
  
    // Creamos el usuario.
    console.log(body)
    const newRol = await getRepository(MenuRoles).create(body)
    const result = await getRepository(MenuRoles).save(newRol);
    return result
}


export const menuRoles_getAll_DALC = async (idRol: number) => {
    const result=await createQueryBuilder("web_options_menu_roles", "W")
        .select("M.MENU_ID as Id, M.MENU_NAME as Nombre , M.MODULE_MENU as Modulo")
        .innerJoin("web_options_menu", "M", "W.MENU_ID =  M.MENU_ID ")
        .where("W.ROLE_ID = :idRol",{idRol})
        .execute()
    return result
}


export const menuUsuario_getAll_DALC = async (idUsuario: number) => {
    let menus = []
    const idRoles = await createQueryBuilder("users_roles", "rol")
    .select("ROLE_ID")
    .where("USER_ID = :idUsuario", {idUsuario})
    .getRawMany()

    
        for (const idRol of idRoles){
        const rol = idRol.ROLE_ID
       
            const menu = await createQueryBuilder("web_options_menu_roles", "w")
            .select("m.MENU_ID as Id, m.MENU_NAME as Nombre , m.MODULE_MENU as Modulo, m.MENU_ROUTE as Ruta, m.MENU_ICON as Icono ")
            .innerJoin("web_options_menu", "m", "w.MENU_ID =  m.MENU_ID ")
            .where("w.ROLE_ID = :rol",{rol})
            .getRawMany()
    
            for (const menurol of menu){
                let indice = menus.findIndex(e => e.nombre === menurol.Nombre);
                if(indice >0){
                    menus.splice(indice,1)
                }
                
                    menus.push(
                        {
                            id: menurol.Id,
                            nombre:  menurol.Nombre,
                            modulo: menurol.Modulo,
                            ruta: menurol.Ruta,
                            icono: menurol.Icono,
                            
                        }
                    )
                    
                    

                }
                
        }
     
    return menus
}





