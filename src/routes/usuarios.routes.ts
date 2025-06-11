import { Router } from 'express';
const router = Router();

import {
    getById,
    getByUsernameAndPassword,
    getAll,
    putUsuario,
    editUsuario,
    loginWithGoogle,
    getByEmail // 🆕 Nuevo controlador importado
} from "../controllers/usuarios.controller";

const prefixAPI = "/apiv3";

// Endpoints existentes
router.get(prefixAPI + "/usuarios/getById/:id", getById);
router.get(prefixAPI + "/usuarios/getByUsernameAndPassword/:username/:password", getByUsernameAndPassword);
router.get(prefixAPI + "/usuarios/getAll", getAll);
router.put(prefixAPI + "/usuarios/newOne", putUsuario);
router.patch(prefixAPI + "/usuarios/editOneById/:id", editUsuario);

// 🆕 Endpoint para buscar usuario por email (flujo de restablecimiento)
router.get(prefixAPI + "/usuarios/getByEmail/:email", getByEmail);

// ✅ Endpoint para autenticación con Google
router.post(prefixAPI + "/usuarios/loginWithGoogle", loginWithGoogle);

export default router;
