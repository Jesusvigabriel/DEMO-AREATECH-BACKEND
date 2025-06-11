import {Router} from 'express'
const router=Router()

import {
    getAll,
    putRol,
    editRol,
    putUsersRol,
    getUserRolesById,
    userRol_delete_byId,
    getAllMenu,
    menuRol_delete_byId,
    putMenuRol,
    getAllMenuRol,
    getAllMenuUser
} from "../controllers/roles.controller"

const prefixAPI="/apiv3"

//Rutas para Roles
router.get(prefixAPI+"/roles/getAll", getAll)
router.put(prefixAPI+"/rol/newOne", putRol)
router.patch(prefixAPI+"/rol/editOneById/:id", editRol)
// Rutas para asignacion de Roles
router.put(prefixAPI+"/usersrol/newOne", putUsersRol)
router.get(prefixAPI+"/usersrol/getUserRolesById/:id", getUserRolesById)
router.delete(prefixAPI+"/usersrol/eliminarRol/:idUsuario/:idRol", userRol_delete_byId)
// Rutas para opciones de Menu
router.get(prefixAPI+"/opcionesmenu/getAll", getAllMenu)
router.delete(prefixAPI+"/menurol/eliminarMenuRoles/:idRol", menuRol_delete_byId)
router.put(prefixAPI+"/menurol/newOne", putMenuRol)
router.get(prefixAPI+"/menuroles/getAllMenuRol/:idRol", getAllMenuRol)
router.get(prefixAPI+"/menuser/getAllMenuUser/:idUsuario", getAllMenuUser)

export default router


