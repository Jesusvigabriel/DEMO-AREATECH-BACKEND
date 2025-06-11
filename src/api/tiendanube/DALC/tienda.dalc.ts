import { getRepository } from "typeorm";
import { tiendanube_tienda } from "../../../entities/tiendanube/Tienda";

// Devuelve todas las tiendas Registradas
export const get_TiendasRegistradas_DALC = async () => await getRepository(tiendanube_tienda).find();

// Consulta si una tienda ya se encuentra Registrada por Numero de Tienda
export const get_TiendaByIdTiendaNube_DALC = async (parametro: number | string) => await  getRepository(tiendanube_tienda).findOne({ where: { id_tiendaNube: parametro }});
