
import {getRepository, Between, createQueryBuilder} from "typeorm"
import { MovimientosStock } from '../entities/MovimientoStock'
import { emailService } from "../services/email.service"
import { renderEmailTemplate } from "../helpers/emailTemplates"
import {EmpresaConfiguracion} from "../entities/EmpresaConfiguracion"
import { producto_getByBarcodeAndEmpresa_DALC, producto_getById_DALC } from "./productos.dalc"
import { Stock } from "../entities/Stock"
import { emailProcesoConfig_get } from "./emailProcesoConfig.dalc"

export const get_Ingresos_ByIdEmpresa_DALC = async (id:number, desde:string, hasta:string):Promise<MovimientosStock[]> => {

    const result = await getRepository(MovimientosStock).find({
        where: {
            IdEmpresa: id,
            Tipo: 0, 
            Fecha: Between(desde, hasta)
        },
        order: {Fecha:'ASC'}
    })
    return result
}

export const eliminarMovimientoStock_DALC = async (id:number) => {
    getRepository(MovimientosStock).delete(id)
    return {status: false}
}

export const getMovimientoByOrdenBarcodeAndEmpresa_DALC = async (id:number, orden:string, barcode:string) => {
    const result = await getRepository(MovimientosStock).find({
        where: {
            IdEmpresa: id,
            codprod: barcode,
            Orden: orden
        }
    })
    return result
}

export const get_Egresos_ByIdEmpresa_DALC = async (id:number, desde:string, hasta:string):Promise<MovimientosStock[]> => {
    const result = await getRepository(MovimientosStock).find({
        where: {
            IdEmpresa: id,
            Tipo: 1,
            Fecha: Between(desde, hasta)
        },
        order: {Fecha:'DESC'}
    })
    return result
}

export const get_Movimientos_ByEmpresaAndOrden_DALC = async (idEmpresa:number, orden:string):Promise<any> => {
    const result = await createQueryBuilder()
                    // .select()
                    .select("ms.id as idMovimiento, ms.orden, prod.id as idProducto, prod.descripcion as nombreProducto, prod.barrcode, prod.codeEmpresa, ms.id_empresa as idEmpresa, ms.unidades, ms.fecha, ms.tipo, ms.usuario")
                    .from(MovimientosStock,'ms')
                    .where("ms.id_empresa = :idEmpresa", {idEmpresa})
                    .andWhere("ms.orden = :orden", {orden})
                    .andWhere("prod.empresa = :idEmpresa", {idEmpresa})
                    .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
                    .execute()
    return result
}

export const get_Movimientos_MenorAFechaAndIdEmpresa_DALC = async (id:number, fechaHasta:string):Promise<any> => {
    const result = await createQueryBuilder()
                    .select()
                    .from(MovimientosStock,'Movimientos')
                    .where("Movimientos.id_empresa = :idEmpresa", {idEmpresa: id})
                    .andWhere("Movimientos.fecha <= :fechaHasta", {fechaHasta:fechaHasta})
                    .addOrderBy("Movimientos.fecha", "ASC")
                    .execute()
    return result
}

export const get_movimientosPorPeriodo_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number=-1, idProducto: number=-1): Promise<any> => {
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    const query=createQueryBuilder()
        .select("ms.id as idMovimiento, ms.id_empresa as idEmpresa, ms.unidades, if(ms.tipo=0 or ms.tipo=4, 1, -1) as signo, ms.tipo, ms.fecha, ms.orden, prod.id as idProducto, prod.descripcion, prod.barrcode, prod.alto, prod.ancho, prod.largo, prod.peso")
        .from(MovimientosStock, 'ms')
        .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
        .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
        .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})
                
        if (idEmpresa>0) {
            query.andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
            query.andWhere("prod.empresa = :idEmpresa", {idEmpresa})
        }
        if (idProducto>0) {
            query.andWhere("prod.id = :idProducto", {idProducto})
        }
        query.addOrderBy("ms.fecha", "ASC")

        const results = await query.execute()

        for(const result of results){
            let fechaDesdeBaseDeDatos = new Date(result.fecha)
            const desplazamientoDeseado = -3 * 60
            let fechaAjustada = new Date(fechaDesdeBaseDeDatos.getTime() + (desplazamientoDeseado * 60 * 1000))
            result.fecha = fechaAjustada
        }

        results.forEach((e: { signo: number; }) => e.signo=Number(e.signo))
        results.forEach((e: { alto: number; }) => e.alto=Number(e.alto))
        results.forEach((e: { ancho: number; }) => e.ancho=Number(e.ancho))
        results.forEach((e: { largo: number; }) => e.largo=Number(e.largo))
        results.forEach((e: { peso: number; }) => e.peso=Number(e.peso))

    return results
}

export const get_movimientosPorPeriodoAndLote_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number=-1, idProducto: number=-1, lote: string): Promise<any> => {
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    const query=createQueryBuilder()
        .select("ms.id as idMovimiento, ms.id_empresa as idEmpresa, ms.unidades, if(ms.tipo=0 or ms.tipo=4, 1, -1) as signo, ms.tipo, ms.fecha, ms.orden, prod.id as idProducto, prod.descripcion, prod.barrcode, prod.alto, prod.ancho, prod.largo, prod.peso")
        .from(MovimientosStock, 'ms')
        .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
        .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
        .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})
        .andWhere("ms.lote = :lote", {lote: lote})
                
        if (idEmpresa>0) {
            query.andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
            query.andWhere("prod.empresa = :idEmpresa", {idEmpresa})
        }
        if (idProducto>0) {
            query.andWhere("prod.id = :idProducto", {idProducto})
        }
        query.addOrderBy("ms.fecha", "ASC")

        const results = await query.execute()

        for(const result of results){
            let fechaDesdeBaseDeDatos = new Date(result.fecha)
            const desplazamientoDeseado = -3 * 60
            let fechaAjustada = new Date(fechaDesdeBaseDeDatos.getTime() + (desplazamientoDeseado * 60 * 1000))
            result.fecha = fechaAjustada
        }

        results.forEach((e: { signo: number; }) => e.signo=Number(e.signo))
        results.forEach((e: { alto: number; }) => e.alto=Number(e.alto))
        results.forEach((e: { ancho: number; }) => e.ancho=Number(e.ancho))
        results.forEach((e: { largo: number; }) => e.largo=Number(e.largo))
        results.forEach((e: { peso: number; }) => e.peso=Number(e.peso))

    return results
}

export const get_movimientosPorPeriodoAndPartida_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number=-1, idProducto: number=-1, part: string): Promise<any> => {
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    const fechaDesdeCompletado = fechaDesde + ' 00:00:00'
    const query=createQueryBuilder()
        .select("ms.id as idMovimiento, ms.id_empresa as idEmpresa, ms.unidades, if(ms.tipo=0 or ms.tipo=4, 1, -1) as signo, ms.tipo, ms.fecha, ms.orden, prod.id as idProducto, prod.descripcion, prod.barrcode, prod.alto, prod.ancho, prod.largo, prod.peso,part.numeroPartida")
        .from(MovimientosStock, 'ms')
        .innerJoin("partidas", "part", "ms.variacion=part.id")
        .innerJoin("productos", "prod", "part.idProducto=prod.id")
        .andWhere("ms.fecha >= :fechaDesde", {fechaDesde: fechaDesdeCompletado})
        .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})
        .andWhere("ms.variacion = :Partida", {Partida: part})
    if (idEmpresa>0) {
        query.andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
    }
    query.groupBy("ms.id_empresa, ms.fecha")

    const results = await query.execute()
    console.log(results)
    return results
}

export const get_IngresosConPosicion_DALC = async (
    idEmpresa: number,
    desde: string,
    hasta: string
): Promise<any[]> => {
    const hastaCompleto = hasta + ' 23:59:59'
    const query = createQueryBuilder('movimientos', 'ms')
        .select([
            'ms.id                AS IdMovimiento',
            'ms.codprod           AS codprod',
            'ms.unidades          AS Unidades',
            'ms.fecha             AS fecha',
            'ms.orden             AS Orden',
            'ms.lote              AS lote',
            'pp.posicionId        AS IdPosicion',
            'pos.descripcion      AS NombrePosicion',
            'SUM(pp.unidades * IF(pp.existe,-1,1)) AS UnidadesPosicionadas'
        ])
        .from(MovimientosStock, 'ms')
        .leftJoin(
            'pos_prod',
            'pp',
            'pp.empresaId = ms.id_empresa AND pp.productId = ms.IdProducto AND pp.lote = ms.lote'
        )
        .leftJoin('posiciones', 'pos', 'pp.posicionId = pos.id')
        .where('ms.id_empresa = :idEmpresa', { idEmpresa })
        .andWhere('ms.tipo = 0')
        .andWhere('ms.fecha >= :desde', { desde })
        .andWhere('ms.fecha <= :hasta', { hasta: hastaCompleto })
        .groupBy('ms.id, pp.posicionId')
        .addOrderBy('ms.fecha', 'ASC')

    const results = await query.execute()
    return results
}

export const get_movimientosPorPeriodo_totalizadosPorEmpresa_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number): Promise<any> => {
 
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    
    const query=createQueryBuilder()
    .select("ms.fecha as Fecha ,sum(ms.unidades * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalUnidades, sum(prod.ancho * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalMetros, sum(ms.unidades * prod.peso * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalKilos, sum(ms.unidades * prod.alto * prod.largo * prod.ancho * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalM3, ms.id_empresa as idEmpresa")
    .from(MovimientosStock, 'ms')
    .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
    .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
    .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})

    if (idEmpresa>0) {
        query.andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
        query.andWhere("prod.empresa = :idEmpresa", {idEmpresa})
    }
    query.groupBy("ms.id_empresa, ms.fecha")

    const results = await query.execute()

    if (results.length===0) {
        return [{totalUnidades: 0, totalKilos: 0, totalM3: 0, totalMetros:0, idEmpresa}]
    }

    results.forEach((e: { totalUnidades: number; }) => e.totalUnidades=Number(e.totalUnidades))
    results.forEach((e: { totalKilos: number; }) => e.totalKilos=Number(e.totalKilos))
    results.forEach((e: { totalM3: number; }) => e.totalM3=Number(e.totalM3))
    results.forEach((e: { totalMetros: number; }) => e.totalMetros=Number(e.totalMetros))

    return results 
}

export const get_movimientosPorPeriodo_totalizadosPorEmpresaPrevio_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number): Promise<any> => {
 
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    
    const query=createQueryBuilder()
    .select("ms.fecha as Fecha ,sum(ms.unidades * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalUnidades, sum(ms.unidades * prod.peso * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalKilos, sum(ms.unidades * prod.alto * prod.largo * prod.ancho * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalM3, ms.id_empresa as idEmpresa")
    .from(MovimientosStock, 'ms')
    .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
    .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
    .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})

    if (idEmpresa>0) {
        query.andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
        query.andWhere("prod.empresa = :idEmpresa", {idEmpresa})
    }
    query.groupBy("ms.id_empresa")

    const results = await query.execute()

    if (results.length===0) {
        return [{totalUnidades: 0, totalKilos: 0, totalM3: 0, idEmpresa}]
    }

    results.forEach((e: { totalUnidades: number; }) => e.totalUnidades=Number(e.totalUnidades))
    results.forEach((e: { totalKilos: number; }) => e.totalKilos=Number(e.totalKilos))
    results.forEach((e: { totalM3: number; }) => e.totalM3=Number(e.totalM3))

    return results 
}

export const set_stockArticulo_movimientoVSStock_DALC = async (id: number, tipoForzado: string): Promise<any> => {

    const articulo=await producto_getById_DALC(id)

    if (articulo) {

        const query=createQueryBuilder()
        .select("sum(ms.unidades * if(ms.tipo=0 or ms.tipo=4, 1, -1)) as totalUnidades")
        .from(MovimientosStock, 'ms')
        .andWhere("ms.codprod = :codProd", {codProd: articulo.Barcode})
  
        const results = await query.execute()    

        const detalle={articulo, conciliacionEraOK: true, movimientosEnStock: results[0].totalUnidades, conciliacionForzada: tipoForzado}
        if (articulo.Stock == results[0].totalUnidades) {
            detalle.conciliacionEraOK=true
            return {status: true, detalle}
        } else {
            detalle.conciliacionEraOK=false

            if (tipoForzado==="M") {
                //Tengo que ajustar agregando un movimiento de tipo ajuste para que concuerde con el stock del producto
                let cantidadAAjustar=articulo.Stock - results[0].totalUnidades
                let tipo
                if (cantidadAAjustar>0) {
                    tipo=4
                } else {
                    tipo=3
                    cantidadAAjustar = cantidadAAjustar*-1
                }
                await getRepository(MovimientosStock).save({codprod: articulo.Barcode, IdProducto: articulo.Id, Unidades: cantidadAAjustar, Tipo: tipo, IdEmpresa: articulo.IdEmpresa, Orden: "Conciliación manual de stock", Usuario: "App Gestión"});
            } else if (tipoForzado==="S") {
                //Tengo que ajustar el stock del producto a lo que muestra la suma de movimientos de stock
                await getRepository(Stock).update({Producto: articulo.Id}, {Unidades: results[0].totalUnidades})
            }

            return {status: true, detalle}
        }{}

    } else {
        return {status: false, detalle: "Articulo inexistente"}
    }

}



export const createMovimientosStock_DALC = async (body: any): Promise<any> => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    // Creo el Movimiento de Ingreso o egreso de Stock
    // console.log(datosAGuardar)
    const result = await getRepository(MovimientosStock).save(datosAGuardar);
   
    return result

}

export const validarMovimento_DALC = async (body: any): Promise<any> => {

    const movimiento=await getRepository(MovimientosStock).findOne({where: {Orden: body.Orden, codprod: body.codprod, Unidades: body.Unidades, Tipo: body.Tipo, IdEmpresa: body.IdEmpresa}})

    return movimiento
}

export const validarMovimentos_DALC = async (Orden: string, IdEmpresa: number, codprod: string): Promise<any> => {

    const movimiento=await getRepository(MovimientosStock).findOne({where: {Orden: Orden, codprod: codprod, IdEmpresa: IdEmpresa}})

    return movimiento
}

export const valida_movimientosStock_DALC = async (idOrden: string, idEmpresa: number=-1, barrcodes: string ): Promise<any> => {
    //const fechaHastaCompletado = fechaHasta + ' 23:59:59'
    const duplicados = []
    let registros = []
    let Barrcodes = barrcodes.split(',')
    if (Barrcodes.length>0)
    {
        if(!!idOrden || idEmpresa>0 )
        {
      
         for(const barrcode of Barrcodes)
         {
            const registrosDuplicados = await createQueryBuilder("movimientos", "MV")
            .select("id, orden, codprod, tipo, id_empresa, unidades, count(*) as cantidad")   
            .where("tipo = 1 ")
            .andWhere("id_empresa = :idEmpresa", {idEmpresa})
            .andWhere("codprod = :barrcode ", {barrcode})
            .andWhere("orden = :idOrden", {idOrden})
            .groupBy("orden, codprod, tipo, id_empresa, unidades")
            .having("count(*) > 1")
            .getRawMany()

            for (const unRegistroDuplicado of registrosDuplicados){
            duplicados.push(
                {
                    id: unRegistroDuplicado.id,
                    orden:  unRegistroDuplicado.orden,
                    codprod: unRegistroDuplicado.codprod,
                    tipo: unRegistroDuplicado.tipo,
                    idEmpresa: unRegistroDuplicado.id_empresa,
                    cantidad: unRegistroDuplicado.cantidad
                }
            )
            
            } 
        }
         
        console.log(duplicados)
        duplicados.forEach(async registro => {
            const orden = registro.orden
            const codprod = registro.codprod
            const idEmpresa = registro.idEmpresa
         

        if(registro.cantidad>1){
                
            const registro = await createQueryBuilder("movimientos", "MV")
            .select("id, orden, codprod, tipo, id_empresa, unidades")   
            .where("tipo = 1 ")
            .andWhere("id_empresa = :idEmpresa", {idEmpresa})
            .andWhere("codprod = :codprod ", {codprod})
            .andWhere("orden = :orden", {orden})
            .getRawMany()
            
            
            let contador = 0
            for (const unRegistro of registro){
                       const orden = unRegistro.orden
                        const codprod = unRegistro.codprod
                         const idEmpresa = unRegistro.id_empresa
                         const id = unRegistro.id
                         
                         console.log("Id: "+ id, "Orden: " +orden, "Empresa: "+idEmpresa, "Codigo: " + codprod)
                         console.log("Contador" + contador)
                         if (contador< registro.length - 1){
                             contador++
                          const result =  await  getRepository(MovimientosStock)
                             .createQueryBuilder()
                             .delete()
                             .from("movimientos")
                             .where("tipo = 1 ")
                             .andWhere("id_empresa = :idEmpresa", {idEmpresa})
                             .andWhere("codprod = :codprod ", {codprod})
                            .andWhere("orden = :orden", {orden})
                            .andWhere("id = :id", {id})
                            .execute()
                        
                        }
 
                
                
                }
   
            }

           }
        )
      
        }
    }
}

export const get_ingresosPorPeriodo_totalizadosPorOrden_DALC = async (fechaDesde: string, fechaHasta: string): Promise<any> => {
 
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'

    const query=createQueryBuilder()
    .select("ms.orden, emp.nombre as nombreEmpresa, ms.fecha, sum(ms.unidades) as totalUnidades, sum(ms.unidades * prod.peso) as totalKilos, sum(ms.unidades * prod.alto * prod.largo * prod.ancho) as totalM3")
    .from(MovimientosStock, 'ms')
    .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
    .innerJoin("empresas", "emp", "ms.id_empresa=emp.id")
    .where("(ms.tipo=0 or ms.tipo=4)")
    .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
    .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})

    console.log(fechaDesde, fechaHastaCompletado)
    query.groupBy("ms.orden")

    const results = await query.execute()

    if (results.length===0) {
        return [{totalUnidades: 0, totalKilos: 0, totalM3: 0}]
    }

    results.forEach((e: { totalUnidades: number; }) => e.totalUnidades=Number(e.totalUnidades))
    results.forEach((e: { totalKilos: number; }) => e.totalKilos=Number(e.totalKilos))
    results.forEach((e: { totalM3: number; }) => e.totalM3=Number(e.totalM3))

    return results 
}

export const get_ingresosPorPeriodoEmpresa_totalizadosPorOrden_DALC = async (fechaDesde: string, fechaHasta: string, idEmpresa: number): Promise<any> => {
 
    const fechaHastaCompletado = fechaHasta + ' 23:59:59'
 
    const query=createQueryBuilder()
    .select("ms.orden, emp.nombre as nombreEmpresa, ms.fecha, sum(ms.unidades) as totalUnidades, sum(ms.unidades * prod.peso) as totalKilos, sum(ms.unidades * prod.alto * prod.largo * prod.ancho) as totalM3")
    .from(MovimientosStock, 'ms')
    .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
    .innerJoin("empresas", "emp", "ms.id_empresa=emp.id")
    .where("(ms.tipo=0 or ms.tipo=4)")
    .andWhere("ms.id_empresa = :idEmpresa", {idEmpresa})
    .andWhere("ms.fecha >= :fechaDesde", {fechaDesde})
    .andWhere("ms.fecha <= :fechaHasta", {fechaHasta: fechaHastaCompletado})
    

   
    console.log(fechaDesde, fechaHastaCompletado)
    query.groupBy("ms.orden")

    const results = await query.execute()

    if (results.length===0) {
        return [{totalUnidades: 0, totalKilos: 0, totalM3: 0}]
    }

    results.forEach((e: { totalUnidades: number; }) => e.totalUnidades=Number(e.totalUnidades))
    results.forEach((e: { totalKilos: number; }) => e.totalKilos=Number(e.totalKilos))
    results.forEach((e: { totalM3: number; }) => e.totalM3=Number(e.totalM3))

    return results 
}
export const empresa_getById_DALC = async (id: number): Promise<EmpresaConfiguracion> => {
    const result = await getRepository(EmpresaConfiguracion).findOne( {where: {IdEmpresa: id}})
    return result!
}

export const informar_IngresoStock_DALC = async (body: any) => {

        const resgistros = body
        const comprobante = ""
        let idEmpresa = 0
       


        let cuerpo = `Se han registrado los siguientes ingresos de stock: <br>`

        for(const registro of resgistros){
            const articulo = await producto_getByBarcodeAndEmpresa_DALC(registro.Barcode,registro.IdEmpresa)
            idEmpresa = registro.IdEmpresa
            if(articulo){
                cuerpo += `<br> Barcode Producto: ${registro.Barcode} Nombre: ${articulo.Nombre} Unidades: ${registro.Cantidad} Fecha Ingreso: ${registro.Fecha}<br>`
            }
        }
     
        const empresa =  await empresa_getById_DALC(idEmpresa)
        if(empresa){
            if(empresa.ContactoDeposito)
            {
                let titulo = `Nuevo ingreso de stock`
                const config = await emailProcesoConfig_get(idEmpresa, 'INGRESO_STOCK')
                const plantilla = await renderEmailTemplate('INGRESO_STOCK', { detalle: cuerpo }, config?.IdEmailTemplate)
                if (plantilla) {
                    titulo = plantilla.asunto
                    cuerpo = plantilla.cuerpo
                }

                let destinatarios = empresa.ContactoDeposito
                if (config?.Destinatarios) {
                    destinatarios = config.Destinatarios
                }

                await emailService.sendEmail({
                    idEmpresa: empresa.IdEmpresa,
                    destinatarios,
                    titulo,
                    cuerpo,
                    idEmailServer: config?.IdEmailServer,
                    idEmailTemplate: config?.IdEmailTemplate
                })
            }
        }
                      

}
