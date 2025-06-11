import { response } from "express"
import { Any, TransactionRepository } from "typeorm"

// Un Dia
const undia = (24*60*60*1000) * 1

// Ajusta Fecha Para respuesta
export const ajustaFechaConsulta = (fecha:Date) => {
    let anoFecha = fecha.getFullYear()
    let mesFecha = (fecha.getMonth()+1 <= 9)? `0${fecha.getMonth()+1}`: fecha.getMonth()+1
    let diaFecha = (fecha.getDate() <= 9)? `0${fecha.getDate()}`: fecha.getDate()
    return `${anoFecha}-${mesFecha}-${diaFecha}`
}

// Genera Fecha de Hasta
export const generaFechaHasta = (fechaHasta:string) => {
    const fechaRecibida = new Date(`${fechaHasta}T23:59:59.000Z`)
    const sumaUnDia = fechaRecibida.getTime() + undia
    return new Date(sumaUnDia)
}

// Valida las Fechas recibidas - Genera Periodo a revisar
export const validFechas = (fechaDesde:string, fechaHasta:string) => {
    const desde = new Date(`${fechaDesde}T23:59:59.000Z`)
    // const desde = new Date(`${fechaDesde}T00:00:00.000Z`)
    const hasta = generaFechaHasta(fechaHasta)
    // const hasta = new Date(`${fechaHasta}T23:59:59.000Z`)
    
    if(desde <= hasta){
        const periodo:string[] = []
        let currentDesde = desde.getTime()
        let currentHasta = hasta.getTime()
        
        while (currentDesde < currentHasta){
            const date = new Date(currentDesde)
            periodo.push(ajustaFechaConsulta(date))
            currentDesde = date.getTime() + undia
        }

        return {
            Desde: ajustaFechaConsulta(desde),
            Hasta: ajustaFechaConsulta(hasta),
            Periodo: periodo
        }

    }else{
        return false
    }
}

// Genera Respuesta de Ingresos / Egresos
export const responseMovimientos = (fechas:any, movimientos:any, productos:any[], tipo:string) => {
    const response = []

    for(const unaFecha of fechas.Periodo){
        let detalleMovimiento:any = {
            Fecha: unaFecha,
            totalKilos: 0,
            totalM3: 0,
            totalMetros:0,
            totalUnidades: 0,
            Detalle:[]
        }
        for(const unMovimiento of movimientos){
            const fechaMovimiento = ajustaFechaConsulta(unMovimiento.Fecha)

            // console.log(unMovimiento)
            if(fechaMovimiento === unaFecha){
                const unProducto = productos.find(element => element.barrCode === unMovimiento.codprod)

                if(unProducto){
                    let detalle = {
                        idArticulo: unMovimiento.codprod,
                        Unidades: unMovimiento.Unidades,
                        Kilos: unProducto.peso  * unMovimiento.Unidades,
                        Metros: Number(unProducto.ancho),
                        M3: unProducto.ancho * unProducto.alto * unProducto.largo * unMovimiento.Unidades,
                        Orden: unMovimiento.Orden,
                        ValorDeclarado: unMovimiento.ValorDeclarado,
                        idMovimiento: unMovimiento.Id
                    }
                    detalleMovimiento.totalKilos += detalle.Kilos
                    detalleMovimiento.totalM3 += detalle.M3
                    detalleMovimiento.totalUnidades += detalle.Unidades
                    detalleMovimiento.totalMetros += detalle.Metros

                    detalleMovimiento.Detalle.push(detalle)
                }else {
                    let detalle = {
                        idArticulo: unMovimiento.IdProducto,
                        Unidades: unMovimiento.Unidades,
                        Orden: unMovimiento.Orden,
                        ValorDeclarado: unMovimiento.ValorDeclarado,
                        Kilos: 'No se pudo calcular',
                        M3: 'No se pudo calcular',
                        Metros: 'No se pudo calcular'

                    }
                    detalleMovimiento.Detalle.push(detalle)
                }
            }

        }
        if(detalleMovimiento.Detalle.length === 0){
            // delete detalleMovimiento.Detalle
            // delete detalleMovimiento.totalKilos
            // delete detalleMovimiento.totalM3
            // delete detalleMovimiento.totalUnidades
            // detalleMovimiento.Detalle = `Sin ${tipo}`
            detalleMovimiento.Detalle = []
        }
        response.push(detalleMovimiento)
    }

    return response

}

export const calculaAlmacenaje = (movimientosEmpresa:any[], fechas:any, detalleProductos:any[], codProductos:any[])=>{
    // Fecha hasta que se va a calcular del Almacenaje
    const hasta = generaFechaHasta(fechas.Hasta)

    // Se agrupan movimientos por Productos
    const movimientosAgrupadosPorProducto:any =[]
    for(const unBarcode of codProductos){
        const movimientoProductos = movimientosEmpresa.filter(movimiento => {
            if(movimiento.codprod === unBarcode){
                movimiento.fecha = ajustaFechaConsulta(movimiento.fecha)
                return movimiento
            }
        })
        let detalle = {
            codProducto: unBarcode,
            primerMovimiento:movimientoProductos[0].fecha,
            movimientos: movimientoProductos
            
        }
        movimientosAgrupadosPorProducto.push(detalle) 
    }

    const parcialResponse:any=[]
    for (const detalleMovimientoProducto of movimientosAgrupadosPorProducto) {
        let currentDesde =  new Date(detalleMovimientoProducto.primerMovimiento).getTime()
        const currentHasta = hasta.getTime()
        let unidades = 0
        let detalleProducto:any ={
            codProducto: detalleMovimientoProducto.codProducto,
            almacenajeDiario: []
        }

        //PROPIEDADES DEL PRODUCTO
        const unProducto = detalleProductos.find(element => element.barrCode === detalleMovimientoProducto.codProducto)

        while(currentDesde <= currentHasta){
            const date = new Date(currentDesde)
            const currentDate = ajustaFechaConsulta(date)
            const detalleFecha:any = {                     
                fecha: currentDate,
                unidades: unidades
            }
            for (const unMovimiento of detalleMovimientoProducto.movimientos) {
                if(currentDate === unMovimiento.fecha){
                    if(unMovimiento.tipo === 0 || unMovimiento.tipo===3){
                        unidades += unMovimiento.unidades
                    }else{
                        unidades -= unMovimiento.unidades
                    }
                }else{
                    unidades = unidades
                }
            }
            detalleFecha.totalM3 = unidades * unProducto.alto * unProducto.largo * unProducto.ancho
            detalleFecha.totalKilos = unidades * unProducto.peso
            detalleProducto.almacenajeDiario.push(detalleFecha)
            currentDesde = date.getTime() + undia
        }
        parcialResponse.push(detalleProducto)
    }

    const response:any =[]
    for (const unFecha of fechas.Periodo) {
        let detalleFecha:any = {
            fecha: unFecha,
            totalM3: 0,
            detalleProductosAlmacendos:[]
        }
        for (const detallesUnProducto of parcialResponse) {
            const detalleAlmacenadoPorDia:any[] = detallesUnProducto.almacenajeDiario
            const almacenadoDelDia = detalleAlmacenadoPorDia.find(e => e.fecha === unFecha)
            if(almacenadoDelDia){
                detalleFecha.detalleProductosAlmacendos.push(almacenadoDelDia)
            }
            
        }

        for (const M3 of detalleFecha.detalleProductosAlmacendos) {
            detalleFecha.totalM3 += M3.totalM3
        }
        response.push(detalleFecha)
    }



    return response

}


//FIXME: 
export const formatResponseAlmacenaje = (movimientosEmpresa:any[], fechas:any, dataProductos:any[], barcodeProductos:any[]) => {

    //Se agrupan los Movimientos por Barcode
    const movimientosAgrupadosByBarcode:any =[]

    for(const unBarcode of barcodeProductos){
        const movimientoProductos = movimientosEmpresa.filter(movimiento => {
            if(movimiento.codprod === unBarcode){
                return movimiento
            }
        })
        movimientosAgrupadosByBarcode.push(movimientoProductos) 
    }




    const mapa = mapeaPeriodoProductos(movimientosAgrupadosByBarcode, fechas)

    const response:any = []

    for (const fecha of fechas.Periodo) {
        let detalleFecha: any = {
            fecha,
            totalKilos: 0,
            totalM3: 0,
            totalUnidades: 0,
            productos:[]
        }

        for (const movimientosUnProducto of mapa) {
            const unProducto = dataProductos.find(element => element.barrCode === movimientosUnProducto.idProducto)

            if(unProducto){
                for (const unMovimiento of movimientosUnProducto.MovimientosPorDia) {
                    if(unMovimiento.fecha === fecha){

                        if(unMovimiento){
                            let data:any = {
                                idProducto: movimientosUnProducto.idProducto,
                                unidades: unMovimiento.unidades,
                                Kilos: unProducto.peso  * unMovimiento.unidades,
                                M3: unProducto.ancho * unProducto.alto * unProducto.largo *unMovimiento.unidades
    
                            }
                            detalleFecha.totalKilos += data.Kilos
                            detalleFecha.totalM3 += data.M3
                            detalleFecha.totalUnidades += data.unidades
                            detalleFecha.productos.push(data)
                        }
                    }
                }
            }
        }

        response.push(detalleFecha)
    }

    return movimientosAgrupadosByBarcode

}

export const mapeaPeriodoProductos = (movimientosGroupByProductos:any,fechas:any) => {
    const hasta = generaFechaHasta(fechas.Hasta)
    const response:any = []

    for (let index = 0; index < movimientosGroupByProductos.length; index++) {
        const element = movimientosGroupByProductos[index];

        if(element.length > 0){

            let detalle:any = {
                idProducto: element[0].codprod,
                MovimientosPorDia:[]
            }
            let currentDesde = element[0].fecha.getTime()
            const currentHasta = hasta.getTime()

            let unidades = 0


            while(currentDesde <= currentHasta){
                const date = new Date(currentDesde)
                const currentDate = ajustaFechaConsulta(date)
                const fecha =  ajustaFechaConsulta(date)

                const temp = {
                    fecha,
                    unidades: unidades
                }
                
                for (let i = 0; i < element.length; i++) {
                    const p = element[i];

                    const fechaMovimiento = ajustaFechaConsulta(p.fecha)

                    if(currentDate === fechaMovimiento){
    
                        if(p.tipo ==  0){
                            //Es un ingreso
                            unidades += p.unidades
                        }else if(p.tipo== 1 ){
                            unidades -= p.unidades

                        }else{
                            console.log('tipo nuevo', p.tipo)
                        }
                    }else{
                        unidades = unidades
                    } 
                    console.log(unidades)
                }

                detalle.MovimientosPorDia.push(temp)

                currentDesde = date.getTime() + undia

            }

            response.push(detalle)

        }  

        
    }

    return response

}

// const detalleProductoAlmacenadoPorFecha:any =[]
// for (const unCodigo of codProductos) {
//     const unProducto = detalleProductos.find(element => element.barrCode === unCodigo)        
//     if(unProducto){
//         let detalleProducto:any = {
//             idProducto: unProducto.id,
//             codProducto: unProducto.barrCode,
//             movimientosPorDia: []
//         }
        
//         for (let index = 0; index < movimientosAgrupadosPorProducto.length; index++) {
//             const unGrupoMovimientos = movimientosAgrupadosPorProducto[index];
//             let currentDesde = unGrupoMovimientos[0].fecha.getTime()
//             const currentHasta = hasta.getTime()
//             let unidades = 0

//             while(currentDesde <= currentHasta){
//                 const date = new Date(currentDesde)
//                 const currentDate = ajustaFechaConsulta(date)
//                 const fecha =  ajustaFechaConsulta(date)

//                 const detalleFecha:any = {
//                     fecha,
//                     unidades: unidades
//                 }

//                 for (let index = 0; index < unGrupoMovimientos.length; index++) {
//                     const element = unGrupoMovimientos[index];
//                     const fechaMovimiento = ajustaFechaConsulta(element.fecha)
//                     if(currentDate === fechaMovimiento){

//                         if(element.tipo === 0){
//                             unidades += element.unidades
//                         }else{
//                             unidades -= element.unidades
//                         }
//                     }else{
//                         unidades = unidades
//                     }
                    
//                 }
//                 detalleFecha.totalM3 = unidades * unProducto.alto * unProducto.largo * unProducto.ancho
//                 detalleFecha.totalKilos = unidades * unProducto.peso
//                 detalleProducto.movimientosPorDia.push(detalleFecha)
//                 currentDesde = date.getTime() + undia
//             }
            
//         }

//         detalleProductoAlmacenadoPorFecha.push(detalleProducto)

        
//     }else{
//         console.log('nada')
//     }
    
// }

