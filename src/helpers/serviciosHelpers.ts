import { IResponseDetalleServicio } from "../interfaces/Servicios";
import { Orden } from "../entities/Orden";

/**
 * Calcula el costos del concepto del Servicio
 * @param concepto 
 * @param orden 
 * @param productos 
 * @param valoresReferencia 
 * @returns 
 */
export const calculaCostos = (concepto:string, orden:Orden, productos:any, valoresReferencia:any) => {
    let status = true
    // console.log(orden)
    const result:IResponseDetalleServicio = {
        Concepto: concepto,
        VariableConfigurada: valoresReferencia[0],
        ValorConfigurado : valoresReferencia[1],
        MinimoConfigurado : valoresReferencia[2],
        ValorBase : "",
        Total : 0,

    }

    switch  (valoresReferencia[0]) {
        case 'M3':
            result.ValorBase = sumaM3(productos)
            result.Total = calculaPorUnidades(result.ValorBase, result.ValorConfigurado, result.MinimoConfigurado )
        break;

        case 'Kilos':
            result.ValorBase = sumaKilos(productos)
            result.Total = calculaPorUnidades(result.ValorBase, result.ValorConfigurado, result.MinimoConfigurado )
        break;

        case 'Unidades':
            result.ValorBase =  sumaUnidades(productos)
            result.Total = calculaPorUnidades(result.ValorBase, result.ValorConfigurado, result.MinimoConfigurado )
        break;

        case '%VD':
            result.ValorBase = orden.ValorDeclarado
            console.log("Por %VD", result.ValorBase, orden.ValorDeclarado, result.ValorConfigurado, result.MinimoConfigurado);
            
            result.Total = calculaPorVD(orden.ValorDeclarado, result.ValorConfigurado, result.MinimoConfigurado)
            console.log("Total", result.Total);
            
        break;

        case 'Fijo':
            result.ValorBase = result.ValorConfigurado
            result.Total = Math.max(Number(result.ValorConfigurado), Number(result.MinimoConfigurado))
        break;

        case 'Bultos':
            if (!orden.Bultos) {
                status=false
                result.Mensaje="La orden indicada no dispone de información sobre Bultos"
            } else {
                result.ValorBase = result.ValorConfigurado
                result.Total = calculaPorUnidades(orden.Bultos, result.ValorConfigurado, result.MinimoConfigurado )
            }
        break;
        
        default:
            status = false
            result.Mensaje = `La variable ${valoresReferencia[0]} no esta definida para realizar la operación, sus opciones son M3 / Kilos / Unidades / %VD / Bultos `
    }

    if(status === true){
        result.Total = (!Number(result.Total)) ? result.Total : Number(result.Total) 
        return result
    } else {
        result.Total = 'Error'
        return result
    }

}

/**
 * Suma las unidades que contiene los productos de una Orden
 * @param productos 
 * @returns  
 */
export const sumaUnidades = (productos:any):number => {
    let unidades = 0
    for (let index = 0; index < productos.length; index++) {
        const element = productos[index];
        unidades += element.Unidades
    }
    return unidades
}


/**
 * Suma las Kilos que contiene los productos de una Orden
 * @param productos 
 * @returns 
 */
export const sumaKilos = (productos:any): number => {
    let kilos = 0
    for (let index = 0; index < productos.length; index++) {
        const element = productos[index];
        const kilosDelProducto = parseFloat(element.Producto.Peso)
        const unidades = element.Unidades
        const totalKilosProducto = kilosDelProducto * unidades
        kilos += totalKilosProducto
    }
    return kilos
}

/**
 * Suma los Metros Cuadrados que contiene los productos de una Orden
 * @param productos 
 * @returns 
 */
export const sumaM3 = (productos:any): number => {
    let M3 = 0
    for (let index = 0; index < productos.length; index++) {
        const element = productos[index];
        const altoDelProducto = parseFloat(element.Producto.Alto)
        const largoDelProducto = parseFloat(element.Producto.Largo)
        const anchoDelProducto = parseFloat(element.Producto.Ancho)
        const unidades = element.Unidades

        const M3DelProducto = largoDelProducto * anchoDelProducto * altoDelProducto
        const totalM3Delproducto = M3DelProducto * unidades
        M3 += totalM3Delproducto
        
    }
    return M3
}

/**
 * Multiplica las unidades por el Valor Configurado y lo compara con el minimo Configurado
 * @param unidades 
 * @param valorBaseConfigurado 
 * @param minimoConfig 
 * @returns 
 */
export const calculaPorUnidades = (unidades: number | null, valorBaseConfigurado:string, minimoConfig:string): string =>{
    if(unidades === null){
        return "Las unidades indicadas para realizar este cálculo no son válidas."
    }else{
        const valorBase = parseFloat(valorBaseConfigurado)
        const minimo = parseFloat(minimoConfig)
        const result = unidades * valorBase
        if(minimo > result){
            return minimo.toFixed(2)
        } else {
            return result.toFixed(2)
        }
    }
    

}
/**
 * Multiplica el Valor Declarado por el Valor Configurado y lo compara con el minimo Configurado
 * @param valorDeclarado 
 * @param valorBase 
 * @param minimoConfig 
 * @returns 
 */
export const calculaPorVD = (valorDeclarado: number, valorBase:string, minimoConfig:string): string => {
    const seguroPorcentaje = parseFloat(valorBase)
    const minimo = parseFloat(minimoConfig)
    const result = (seguroPorcentaje * valorDeclarado) / 100
    if(minimo > result){
        return minimo.toFixed(2)
    } else {
        return result.toFixed(2)
    }
    
}


