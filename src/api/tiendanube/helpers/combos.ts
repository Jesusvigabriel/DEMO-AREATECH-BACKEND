
import selecta from "./selecta";

const idEmpresas = [selecta.idTiendaArea]
const combos = [selecta.combos]

export const helpersProductosTienda = async (producto:any, idTiendaArea:number) => {
    // Vefica si que la tiena exista
    for (let index = 0; index < idEmpresas.length; index++) {
        if(idEmpresas[index] === idTiendaArea){
            const tienda = combos[index]
            for (let index = 0; index < tienda.length; index++) {
                const element = tienda[index];
                if(element.sku === producto.sku)
                
                return element.productos
            }
        }
    }

}

