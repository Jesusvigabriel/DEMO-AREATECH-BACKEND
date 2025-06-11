import { getRepository } from "typeorm"
import { Usuario } from "../entities/Usuario"

/**
 * Obtiene un usuario por ID
 */
export const usuario_getById_DALC = async (
  id: number
): Promise<Usuario | undefined> => {
  return await getRepository(Usuario).findOne({ where: { Id: id } })
}

/**
 * Obtiene todos los usuarios
 */
export const usuario_getAll_DALC = async (): Promise<Usuario[]> => {
  return await getRepository(Usuario).find()
}

/**
 * Obtiene usuario por usuario/password
 */
export const usuario_getByUsernameAndPassword_DALC = async (
  username: string,
  password: string
): Promise<Usuario | undefined> => {
  return await getRepository(Usuario).findOne({ where: { Usuario: username, Password: password } })
}

/**
 * Crea un nuevo usuario
 */
export const usuario_DALC = async (
  body: Partial<Usuario>
): Promise<Usuario> => {
  const repo = getRepository(Usuario)
  const newUsuario = repo.create(body)
  return await repo.save(newUsuario)
}

/**
 * Actualiza los campos recibidos para el usuario con idUsuario
 */
export const usuario_edit_DALC = async (
  body: Partial<Usuario>,
  idUsuario: number
): Promise<Usuario | undefined> => {
  const repo = getRepository(Usuario)
  await repo.update(idUsuario, body)
  return await repo.findOne({ where: { Id: idUsuario } })
}

/**
 * Busca usuario por email (para flujo de reset)
 */
export const usuario_getByEmail_DALC = async (
  email: string
): Promise<Usuario | undefined> => {
  return await getRepository(Usuario).findOne({ where: { Email: email } })
}
