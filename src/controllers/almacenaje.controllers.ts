import { Request, Response } from "express";

import { empresa_getById_DALC } from "../DALC/empresas.dalc";

import { 
    get_Ingresos_ByIdEmpresa_DALC, 
    get_Egresos_ByIdEmpresa_DALC,
    get_Movimientos_MenorAFechaAndIdEmpresa_DALC,
    get_movimientosPorPeriodo_DALC,
    get_movimientosPorPeriodo_totalizadosPorEmpresa_DALC,
    get_Movimientos_ByEmpresaAndOrden_DALC,
    get_ingresosPorPeriodo_totalizadosPorOrden_DALC,
    get_ingresosPorPeriodoEmpresa_totalizadosPorOrden_DALC,
    get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio_DALC,
    get_movimientosPorPeriodoAndLote_DALC,
    get_movimientosPorPeriodoAndPartida_DALC
} from "../DALC/movimientos.dalc";

import { 
    validFechas,
    responseMovimientos,
    formatResponseAlmacenaje,
    calculaAlmacenaje
} from "../helpers/almacenaje";

import { 
    producto_getProductos_ByBarcodeAndIdEmpresa_DALC 
} from "../DALC/productos.dalc";
import { orden_getByNumeroAndIdEmpresa_DALC } from "../DALC/ordenes.dalc";


export const get_movimientosPorPeriodo = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_movimientosPorPeriodo_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa), Number(req.params.idProducto))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_movimientosPorPeriodoAndLote = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_movimientosPorPeriodoAndLote_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa), Number(req.params.idProducto), req.params.lote)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_movimientosPorPeriodoAndPartida = async (req: Request, res: Response): Promise<Response> => {
    const results = await get_movimientosPorPeriodoAndPartida_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa), Number(req.params.idProducto), req.params.part)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_ingresosPorPeriodo = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_ingresosPorPeriodo_totalizadosPorOrden_DALC(req.params.fechaDesde, req.params.fechaHasta)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_ingresosPorPeriodoEmpresa = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_ingresosPorPeriodoEmpresa_totalizadosPorOrden_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_movimientosPorPeriodo_totalizadosPorEmpresa = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_movimientosPorPeriodo_totalizadosPorEmpresa_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}

export const get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio_DALC(req.params.fechaDesde, req.params.fechaHasta, Number(req.params.idEmpresa))
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}





export const get_Movimientos_ByEmpresaAndOrden = async (req: Request, res: Response): Promise<Response> => {
    const results=await get_Movimientos_ByEmpresaAndOrden_DALC(Number(req.params.idEmpresa), req.params.orden)
    return res.json(require("lsi-util-node/API").getFormatedResponse(results))
}


export const get_IngresosAlmacenajeByIdEmpresa = async (req: Request, res:Response):Promise<Response> => {
    const idEmpresa = parseInt(req.params.idEmpresa) ? parseInt(req.params.idEmpresa): 0;
    const empresa = await empresa_getById_DALC(idEmpresa);

    if(empresa){
        const fechas = validFechas(req.params.fechaDesde, req.params.fechaHasta)

        if(!fechas){
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Revise el formato de las fechas indicadas. Formato aceptado AAAA-MM-DD. El parametro de fechaHasta debe ser mayor o igual al paramatro fechaDesde"))
        }

        const ingresos = await get_Ingresos_ByIdEmpresa_DALC(idEmpresa, fechas.Desde, fechas.Hasta)

        if(ingresos.length > 0){
            const codeProductos = ingresos.reduce((acc:any, movimiento)=> {
                if(!acc.includes(movimiento.codprod)){
                    acc.push(movimiento.codprod)
                }
                return acc
            },[])

            const detalleProductos = await producto_getProductos_ByBarcodeAndIdEmpresa_DALC(codeProductos, idEmpresa)

            const response = responseMovimientos(fechas, ingresos, detalleProductos, 'Ingresos')
            console.log(response)
            response.forEach(e => {
                e.totalKilos = Number(e.totalKilos.toFixed(2))
                e.totalM3 = Number(e.totalM3.toFixed(2))
                e.totalMetros = Number(e.totalMetros.toFixed(2))
                e.Detalle.forEach ((d: any) => {

                    if (isNaN(Number(d.Kilos))) {
                        d.Kilos=0
                    } else {
                        d.Kilos=Number(d.Kilos.toFixed(2))
                    }

                    if (isNaN(Number(d.M3))) {
                        d.M3=0
                    } else {
                        d.M3=Number(d.M3.toFixed(2))
                    }

                    if (isNaN(Number(d.Metros))) {
                        d.Metros=0
                    } else {
                        d.Metros=Number(d.Metros.toFixed(2))
                    }

                    
                })
            })
            return res.json(require("lsi-util-node/API").getFormatedResponse(response))
            
        }else{
            // return res.json(require("lsi-util-node/API").getFormatedResponse(`Durante el periodo ${req.params.fechaDesde} - ${req.params.fechaHasta}, La empresa ${empresa.Nombre} no tuvo ingresos.`))           
            const response=[]
            for (const unaFecha of fechas.Periodo) {
                response.push({Fecha: unaFecha, totalKilos: 0, totalM3: 0, totalUnidades: 0, Detalle: []})
            }
            return res.json(require("lsi-util-node/API").getFormatedResponse(response))
        }        
    }else{
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
    
}

//Controller: Obtiene los Egresos de Articulos de una Empresa
export const get_EgresosAlmacenajeByIdEmpresa = async (req: Request, res: Response):Promise<Response> => {
    const idEmpresa = parseInt(req.params.idEmpresa) ? parseInt(req.params.idEmpresa): 0;
    const empresa = await empresa_getById_DALC(idEmpresa);
    if(empresa){
        const fechas = validFechas(req.params.fechaDesde, req.params.fechaHasta)
        
        if(!fechas){
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Revise el formato de las fechas indicadas. Formato aceptado AAAA-MM-DD. El parametro de fechaHasta debe ser mayor o igual al paramatro fechaDesde"))
        }

        // console.log("Voy a obtener los egresos")
        const egresos = await get_Egresos_ByIdEmpresa_DALC(idEmpresa, fechas.Desde, fechas.Hasta)

        for (const unEgreso of egresos) {
            const orden = await orden_getByNumeroAndIdEmpresa_DALC(unEgreso.Orden, unEgreso.IdEmpresa)
            // console.log("La orden del movimiento", orden)
            if (orden) {
                unEgreso.ValorDeclarado=Number(orden!.ValorDeclarado)
            }
        }

        //console.log("Los egresos obtenidos", egresos)
        console.log("Si entro aca")


        if(egresos.length > 0){
            const codeProductos:string[] = egresos.reduce((acc:any, movimiento)=> {
                if(!acc.includes(movimiento.codprod)){
                    acc.push(movimiento.codprod)
                }
                return acc
            },[])

            console.log(codeProductos)

            const detalleProductos = await producto_getProductos_ByBarcodeAndIdEmpresa_DALC(codeProductos, idEmpresa)
            console.log("Detalle de productos", detalleProductos)
            const response = responseMovimientos(fechas, egresos, detalleProductos, 'Egresos')

            // console.log(response)

            response.forEach(e => {
                e.totalKilos = Number(e.totalKilos.toFixed(2))
                e.totalM3 = Number(e.totalM3.toFixed(2))
                e.totalMetros = Number(e.totalMetros.toFixed(2))
                e.Detalle.forEach ((d: any) => {

                    if (isNaN(Number(d.Kilos))) {                        
                        d.Kilos=0
                    } else {
                        d.Kilos=Number(d.Kilos.toFixed(2))
                    }

                    if (isNaN(Number(d.M3))) {
                        d.M3=0
                    } else {
                        d.M3=Number(d.M3.toFixed(2))
                    }

                    if (isNaN(Number(d.Metros))) {
                        d.Metros=0
                    } else {
                        d.Metros=Number(d.Metros.toFixed(2))
                    }

                })
            })
            return res.json(require("lsi-util-node/API").getFormatedResponse(response))
        }else{
            // return res.json(require("lsi-util-node/API").getFormatedResponse(`Durante el periodo ${req.params.fechaDesde} - ${req.params.fechaHasta}, La empresa ${empresa.Nombre} no tuvo egresos.`)) 
            const response=[]
            for (const unaFecha of fechas.Periodo) {
                response.push({Fecha: unaFecha, totalKilos: 0, totalM3: 0, totalUnidades: 0, totalMetros:0, Detalle: []})
            }

            return res.json(require("lsi-util-node/API").getFormatedResponse(response))
        }
    }else{
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }
    
}

export const get_AlmacenadoByIdEmpresa = async (req: Request, res: Response):Promise<Response> => {
    console.time('Tiempo Respuesta Almacenaje')
    const idEmpresa = parseInt(req.params.idEmpresa) ? parseInt(req.params.idEmpresa): 0;
    const empresa = await empresa_getById_DALC(idEmpresa);

    if(empresa){
        const fechas = validFechas(req.params.fechaDesde, req.params.fechaHasta)
        if(!fechas){
            return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Revise el formato de las fechas indicadas. Formato aceptado AAAA-MM-DD. El parametro de fechaHasta debe ser mayor o igual al paramatro fechaDesde"))
        }

        const movimientosEmpresa = await get_Movimientos_MenorAFechaAndIdEmpresa_DALC(idEmpresa, fechas.Hasta)


        if(movimientosEmpresa.length > 0){
            // Se agrupan elementos cuya IdProducto sea === 0 por su CodigoProductos
            const barcodeProductos = movimientosEmpresa.reduce((acc:any, movimiento:any) => {
                if(!acc.includes(movimiento.codprod)){
                    acc.push(movimiento.codprod)
                }
                return acc
            },[])

            const datosProductosByBarcode = await producto_getProductos_ByBarcodeAndIdEmpresa_DALC(barcodeProductos, idEmpresa)

            const response = calculaAlmacenaje(movimientosEmpresa, fechas, datosProductosByBarcode, barcodeProductos)

            console.timeEnd('Tiempo Respuesta Almacenaje')
            return res.json(require("lsi-util-node/API").getFormatedResponse(response))
        }

        return res.json(require("lsi-util-node/API").getFormatedResponse(`La empresa ${empresa.Nombre} no posee Movimientos de Ingreso o Egresos.`)) 


    }else{
        return res.status(404).json(require("lsi-util-node/API").getFormatedResponse("", "Empresa inexistente"))
    }

}



