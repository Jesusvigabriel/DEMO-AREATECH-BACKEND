import { Orden } from "../entities/Orden";
import { Empresa } from "../entities/Empresa";
import { EmpresaConfiguracion } from "../entities/EmpresaConfiguracion";

import { IServicio } from "../interfaces/Servicios";

import { calculaCostos  } from "./serviciosHelpers";

/**
 * Clase Servicio
 */
class Servicio implements IServicio {
    Concepto: string
    Guia: boolean
    Seguro: boolean
    CTR: boolean
    PickingCD: boolean
    Complemento: boolean

    constructor(concepto:string, guia:boolean ,seguro:boolean, CTR: boolean, pickingCD: boolean, complemento: boolean){
        this.Concepto = concepto
        this.Guia = guia
        this.Seguro = seguro
        this.CTR = CTR
        this.PickingCD = pickingCD
        this.Complemento = complemento
    }

    calculaCostos = (empresa: Empresa, orden:Orden, productos:any, valoresReferencia:any) => {
        const result:any = {};
        result.Empresa = {
            Id: orden.IdEmpresa,
            Nombre: empresa.Nombre,
        }
        result.OrdenId = orden.Id
        result.Calculo = []


        if(this.Guia){
            if (valoresReferencia.guia[3]==='true') {
                const costoGuia = calculaCostos( 'Guia' ,orden, productos,valoresReferencia.guia)
                result.Calculo.push(costoGuia)  
            }
        }

        if(this.Seguro){
            if (valoresReferencia.seguro[3]==='true') {
                const costoSeguro = calculaCostos( 'Seguro', orden, productos,valoresReferencia.seguro)
                result.Calculo.push(costoSeguro)
            }
        }

        if(this.CTR){
            if (valoresReferencia.ctr[3]==='true') {
                const costoCTR = calculaCostos( 'CTR', orden, productos,valoresReferencia.ctr)
                result.Calculo.push(costoCTR)
            }
        }
     
        if(this.PickingCD){
            if (valoresReferencia.pickingCD[3]==='true') {
                const costoPickingCD = calculaCostos( 'PickingCD', orden, productos,valoresReferencia.pickingCD)
                result.Calculo.push(costoPickingCD)
            }
        }
     
        if(this.Complemento){
            if (valoresReferencia.complemento[3]==='true') {
                const costoComplemento = calculaCostos( 'Complemento', orden, productos,valoresReferencia.complemento)
                result.Calculo.push(costoComplemento)
            }
        }
        
        return result

    }

}


// Se instancian los Servicios vigentes
const servicios = [
    // Distribución
    new Servicio ('EntregaRegularHD', true, true, false, true, true),
    new Servicio ('EntregaRegularRendiciones', true, true, false, true, true),
    new Servicio ('EntregaRegularB2B', true,true, true, true, true),
    new Servicio ('EntregaRegularSupermercado', true, true, false, true, true),
    new Servicio ('EntregaRegularCND', true,true, false, true, true),
    new Servicio ('EntregaEspecial', true,false, false, true, true),

    // Recoleccion
    new Servicio ('RecoleccionRegularHD', true, true, false, true, true),
    new Servicio ('RecoleccionRegularB2B', true,true, true, true, true),
    new Servicio ('RecoleccionRegularSupermercado', true, true, false, true, true),
    new Servicio ('RecoleccionRegularCND', true,true, false, true, true),
    new Servicio ('RecoleccionEspecial', true,false, false, true, true),

];

/**
 * Chequea que el tipo de Servicio pasado por Parametro exista
 * @param tipo 
 * @returns :Servicio 
 */
export const chequeaServicio = (tipo:string) => {
    let result 
    for (let index = 0; index <servicios.length; index++) {
        const element = servicios[index];
        if(element.Concepto === tipo){
            result = element
        }
        
    }
    return result

}

/**
 * Valida que la empresa tenga la configuración necesaria.
 * @param servicio 
 * @param configEmpresa 
 * @returns 
 */

export const validaConfiguracionServicio = (servicio:IServicio, configEmpresa:EmpresaConfiguracion) =>{
    
    const parametros = 5
    let result 

    if(servicio.Concepto === 'EntregaRegularHD'){
        const guia = configEmpresa.EntregaRegularHDGuia.split('|')
        // console.log(guia);
        
        const seguro = configEmpresa.EntregaRegularHDSeguro.split('|')
        // console.log(seguro);
        
        const pickingCD = configEmpresa.EntregaRegularHDPickingCD.split('|')
        // console.log(pickingCD);
        
        const complemento = configEmpresa.EntregaRegularHDComplemento.split('|')
        // console.log(complemento);
        
        if(guia.length === parametros && seguro.length === parametros && pickingCD.length === parametros && complemento.length === parametros) {
            result = {guia, seguro, pickingCD, complemento}
        }        
    }

    if(servicio.Concepto === 'EntregaRegularRendiciones'){
        const guia = configEmpresa.EntregaRegularRendicionesGuia.split('|')
        // console.log(guia);
        
        const seguro = configEmpresa.EntregaRegularRendicionesSeguro.split('|')
        // console.log(seguro);
        
        const pickingCD = configEmpresa.EntregaRegularRendicionesPickingCD.split('|')
        // console.log(pickingCD);
        
        const complemento = configEmpresa.EntregaRegularRendicionesComplemento.split('|')
        // console.log(complemento);
        
        if(guia.length === parametros && seguro.length === parametros && pickingCD.length === parametros && complemento.length === parametros) {
            result = {guia, seguro, pickingCD, complemento}
        }        
    }

    if(servicio.Concepto === 'EntregaRegularB2B'){
        const guia = configEmpresa.EntregaRegularB2BGuia.split('|')
        const seguro = configEmpresa.EntregaRegularB2BSeguro.split('|')
        const ctr = configEmpresa.EntregaRegularB2BCTR.split('|')  
        const pickingCD = configEmpresa.EntregaRegularB2BPickingCD.split('|')  
        const complemento = configEmpresa.EntregaRegularB2BComplemento.split('|')  
        if(guia.length === parametros && seguro.length === parametros && ctr.length === 5 && pickingCD.length === parametros && complemento.length === parametros) {
            result = {guia, seguro, ctr, pickingCD, complemento}
        }
    }


    if(servicio.Concepto === 'EntregaRegularSupermercado'){
        const guia = configEmpresa.EntregaRegularSupermercadoGuia.split('|')
        const seguro = configEmpresa.EntregaRegularSupermercadoSeguro.split('|')
        const pickingCD = configEmpresa.EntregaRegularSupermercadoPickingCD.split('|')
        const complemento = configEmpresa.EntregaRegularSupermercadoComplemento.split('|')
        if(guia.length === parametros && seguro.length === parametros && pickingCD.length === parametros && complemento.length === parametros) {
            result = {guia, seguro, pickingCD, complemento}
        }
    }

    if(servicio.Concepto === 'EntregaRegularCND'){
        const guia = configEmpresa.EntregaRegularCNDGuia.split('|');
        const seguro =  configEmpresa.EntregaRegularCNDSeguro.split('|')
        const pickingCD =  configEmpresa.EntregaRegularCNDPickingCD.split('|')
        const complemento =  configEmpresa.EntregaRegularCNDComplemento.split('|')
        if(guia.length === parametros && seguro.length === parametros && pickingCD.length === parametros && complemento.length === parametros) {
            result = {guia, seguro, pickingCD, complemento}
        }
    }

    if(servicio.Concepto === 'EntregaEspecial'){
        const guia = configEmpresa.EntregaEspecialGuia.split('|')
        if(guia.length === parametros) {
            result = {guia}
        }
    }

    if(servicio.Concepto === 'RecoleccionRegularHD'){
        const guia = configEmpresa.RecoleccionRegularHDGuia.split('|')
        const seguro = configEmpresa.RecoleccionRegularHDSeguro.split('|')
        if(guia.length === parametros && seguro.length === parametros) {
            result = {
                guia,
                seguro
            }
        }
    }

    if(servicio.Concepto === 'RecoleccionRegularB2B'){
        const guia = configEmpresa.RecoleccionRegularB2BGuia.split('|')
        const seguro = configEmpresa.RecoleccionRegularB2BSeguro.split('|')
        const ctr = configEmpresa.RecoleccionRegularB2BCTR
        if(guia.length === parametros && seguro.length === parametros && ctr.length === parametros) {
            result = {
                guia,
                seguro,
                ctr
            }
        }

    }

    if(servicio.Concepto === 'RecoleccionRegularSupermercado'){
        const guia = configEmpresa.RecoleccionRegularSupermercadoGuia.split('|')
        const seguro = configEmpresa.RecoleccionRegularSupermercadoSeguro.split('|')
        if(guia.length === parametros && seguro.length === parametros) {
            result = {
                guia,
                seguro
            }
        }
    }

    if(servicio.Concepto === 'RecoleccionRegularCND'){
        const guia = configEmpresa.RecoleccionRegularCDNGuia.split('|')
        const seguro = configEmpresa.RecoleccionRegularCDNSeguro.split('|')
        if(guia.length === parametros && seguro.length === parametros) {
            result = {
                guia,
                seguro
            }
        }
    }

    if(servicio.Concepto === 'RecoleccionEspecial'){
        const guia = configEmpresa.RecoleccionEspecialGuia.split('|')
        if(guia.length === parametros) {
            result = {
                guia
            }
        }
    }

    return result
}