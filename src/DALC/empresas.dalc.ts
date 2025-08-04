import {createQueryBuilder, getRepository, Between, LessThan} from "typeorm"
import {Empresa} from "../entities/Empresa"
import { EmpresaConfiguracion } from "../entities/EmpresaConfiguracion"
import { MovimientosStock } from "../entities/MovimientoStock"
import { EmpresaConfiguracionHistorico } from '../entities/EmpresasConfigHistorico';



export const empresa_editOne_configuracion_DALC = async (configuracionOriginal: EmpresaConfiguracion, body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(EmpresaConfiguracion).update(configuracionOriginal.Id, datosAGuardar)
    return result
  }

export const save_Empresa_DALC = async (body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(Empresa).save(datosAGuardar)
    return result
  }

  export const empresa_DALC = async (body:any) => {
  
    // Creamos el usuario.
    //console.log(body)
    const newEmpresa = await getRepository(Empresa).create(body)
    const result = await getRepository(Empresa).save(newEmpresa);
    return result
}
  
export const empresa_getAlmacenajePeriodo_DALC = async (empresa: Empresa, fechaDesde: String, fechaHasta: String, tipoEstadistica: String) => {
    const hastaCompletado = fechaHasta + ' 23:59:59'

    // console.log(fechaDesde, fechaHasta)
    const result=await createQueryBuilder("movimientos", "MS")
        .select("sum(unidades * if(tipo, -1, 1)) as unidades, sum(prod.peso * if(tipo, -1, 1) * unidades) as kilos, sum(prod.alto*prod.ancho*prod.largo * if(tipo, -1, 1) * unidades) as m3")
        // .select("MS.id, prod.barrCode, prod.descripcion")
        .innerJoin("productos", "prod", "ms.codprod=prod.barrCode")
        .where("id_Empresa = :idEmpresa", {idEmpresa: empresa.Id})
        .andWhere("fecha >= :fechaDesde", {fechaDesde})
        .andWhere("fecha <= :hastaCompletado", {hastaCompletado})
        .execute()
    
    console.log(result)

    return {desde: fechaDesde, hasta: fechaHasta, unidades: result[0].unidades ? Number(result[0].unidades) : 0, kilos: result[0].kilos ? Number(result[0].kilos) : 0, m3: result[0].m3 ? Number(result[0].m3) : 0}
}


export const empresa_activar_DALC = async (empresa: Empresa, activa: boolean) => {
    empresa.Activa=activa
    const result=await getRepository(Empresa).save(empresa)
    return result
}

export const empresa_activar_autogestion_DALC = async (empresa: Empresa, activa: boolean) => {
    empresa.AutogestionHabilitada=activa
    const result=await getRepository(Empresa).save(empresa)
    return result
}

export const empresa_registrar_autogestion_opciones_DALC = async (empresa: Empresa, opciones: string) => {
    empresa.AutogestionOpciones=opciones
    const result=await getRepository(Empresa).save(empresa)
    return result
}

export const empresa_activar_mostrarTyC_DALC = async (empresa: Empresa, activa: boolean) => {
    empresa.MostrarTyC=activa
    const result=await getRepository(Empresa).save(empresa)
    return result
}

export const empresa_putConfiguracion_DALC = async (body:any, idEmpresa: number) => {
    // const configEmpresa = await getEmpresaConfiguracion_DALC(idEmpresa)
    const configEmpresa = await empresaConfiguracion_getById_DALC(idEmpresa)
    const datosEmpresa:EmpresaConfiguracion = await parseaEmpresaConfiguracion(body, idEmpresa)
    // Si ya existe los datos de Config de una Empresa - Lo actualiza
    if(configEmpresa){
        getRepository(EmpresaConfiguracion).merge(configEmpresa, datosEmpresa)
        const result = await getRepository(EmpresaConfiguracion).save(configEmpresa)
        return result
    } 
    // Si no existe los datos de Config de una Empresa - Lo crea
    const newConfiguracionEmpresa = await getRepository(EmpresaConfiguracion).create(datosEmpresa)
    const result = await getRepository(EmpresaConfiguracion).save(newConfiguracionEmpresa);
    return result
}

//Crea un registro nuevo en la tabla de configuracion Historica de Empresas
export const empresa_putConfiguracionHistorico_DALC = async (body:any, idEmpresa: number) => {
   
    const datosEmpresa:EmpresaConfiguracionHistorico = await parseaEmpresaConfiguracionHistorico(body, idEmpresa)
    
    // Crea los datos de Config de una Empresa en la tabla Historico - Lo crea
    const newConfiguracionEmpresa = await getRepository(EmpresaConfiguracionHistorico).create(datosEmpresa)
    const result = await getRepository(EmpresaConfiguracionHistorico).save(newConfiguracionEmpresa);
    return result
}

//Edita una configuracion del Historico
export const empresa_editOne_configuracionHistorico_DALC = async (configuracionOriginal: EmpresaConfiguracionHistorico, body: any) => {
    const datosAGuardar={}
    Object.assign(datosAGuardar, body)
    const result=await getRepository(EmpresaConfiguracionHistorico).update(configuracionOriginal.Id, datosAGuardar)
    return result
  }

export const getEmpresaByToken_Dalc = async (token: string) => {
    const result = await getRepository(Empresa).findOne( {where: {TokenApi: token}})

    return result
}

// Parsea el Body Recibido.
export const parseaEmpresaConfiguracion = async (body:any, idEmpresa: number): Promise<EmpresaConfiguracion> => {
    const dataDefault = '';
    const configEmpresa = new EmpresaConfiguracion();
    
    configEmpresa.IdEmpresa = idEmpresa
    configEmpresa.TipoCliente = body.TipoCliente
    configEmpresa.Direccion = body.Direccion
    configEmpresa.ContactoDeposito = body.ContactoDeposito
    configEmpresa.ContactoOficina = body.ContactoOficina


    configEmpresa.UnificarGuias = (body.UnificarGuias) ? body.UnificarGuias : false;

    configEmpresa.EntregaRegularHDGuia = (body.EntregaRegularHDGuia) ? body.EntregaRegularHDGuia : dataDefault;
    configEmpresa.EntregaRegularHDSeguro = (body.EntregaRegularHDSeguro) ? body.EntregaRegularHDSeguro : dataDefault;
    configEmpresa.EntregaRegularHDPickingCD = (body.EntregaRegularHDPickingCD) ? body.EntregaRegularHDPickingCD : dataDefault;
    configEmpresa.EntregaRegularHDComplemento = (body.EntregaRegularHDComplemento) ? body.EntregaRegularHDComplemento : dataDefault;

    configEmpresa.EntregaRegularRendicionesGuia = (body.EntregaRegularRendicionesGuia) ? body.EntregaRegularRendicionesGuia : dataDefault;
    configEmpresa.EntregaRegularRendicionesSeguro = (body.EntregaRegularRendicionesSeguro) ? body.EntregaRegularRendicionesSeguro : dataDefault;
    configEmpresa.EntregaRegularRendicionesPickingCD = (body.EntregaRegularRendicionesPickingCD) ? body.EntregaRegularRendicionesPickingCD : dataDefault;
    configEmpresa.EntregaRegularRendicionesComplemento = (body.EntregaRegularRendicionesComplemento) ? body.EntregaRegularRendicionesComplemento : dataDefault;

	configEmpresa.EntregaRegularDevolucionesGuia = (body.EntregaRegularDevolucionesGuia) ?  body.EntregaRegularDevolucionesGuia : dataDefault;
    configEmpresa.EntregaRegularDevolucionesSeguro = (body.EntregaRegularDevolucionesSeguro) ? body.EntregaRegularDevolucionesSeguro : dataDefault;
    configEmpresa.EntregaRegularDevolucionesCTR = (body.EntregaRegularDevolucionesCTR) ? body.EntregaRegularDevolucionesCTR : dataDefault;
    configEmpresa.EntregaRegularDevolucionesPickingCD = (body.EntregaRegularDevolucionesPickingCD) ? body.EntregaRegularDevolucionesPickingCD : dataDefault;
    configEmpresa.EntregaRegularDevolucionesComplemento = (body.EntregaRegularDevolucionesComplemento) ? body.EntregaRegularDevolucionesComplemento : dataDefault;
    configEmpresa.EntregaRegularB2BGuia = (body.EntregaRegularB2BGuia) ?  body.EntregaRegularB2BGuia : dataDefault;
    configEmpresa.EntregaRegularB2BSeguro = (body.EntregaRegularB2BSeguro) ? body.EntregaRegularB2BSeguro : dataDefault;
    configEmpresa.EntregaRegularB2BCTR = (body.EntregaRegularB2BCTR) ? body.EntregaRegularB2BCTR : dataDefault;
    configEmpresa.EntregaRegularB2BPickingCD = (body.EntregaRegularB2BPickingCD) ? body.EntregaRegularB2BPickingCD : dataDefault;
    configEmpresa.EntregaRegularB2BComplemento = (body.EntregaRegularB2BComplemento) ? body.EntregaRegularB2BComplemento : dataDefault;

    configEmpresa.EntregaRegularSupermercadoGuia = (body.EntregaRegularSupermercadoGuia) ? body.EntregaRegularSupermercadoGuia : dataDefault;
    configEmpresa.EntregaRegularSupermercadoSeguro = (body.EntregaRegularSupermercadoSeguro) ? body.EntregaRegularSupermercadoSeguro : dataDefault;
    configEmpresa.EntregaRegularSupermercadoPickingCD = (body.EntregaRegularSupermercadoPickingCD) ? body.EntregaRegularSupermercadoPickingCD : dataDefault;
    configEmpresa.EntregaRegularSupermercadoComplemento = (body.EntregaRegularSupermercadoComplemento) ? body.EntregaRegularSupermercadoComplemento : dataDefault;

    configEmpresa.EntregaRegularCNDGuia = (body.EntregaRegularCNDGuia) ? body.EntregaRegularCNDGuia : dataDefault;
    configEmpresa.EntregaRegularCNDSeguro = (body.EntregaRegularCNDSeguro) ? body.EntregaRegularCNDSeguro : dataDefault;
    configEmpresa.EntregaRegularCNDPickingCD = (body.EntregaRegularCNDPickingCD) ? body.EntregaRegularCNDPickingCD : dataDefault;
    configEmpresa.EntregaRegularCNDComplemento = (body.EntregaRegularCNDComplemento) ? body.EntregaRegularCNDComplemento : dataDefault;

    configEmpresa.EntregaEspecialGuia = (body.EntregaEspecialGuia) ? body.EntregaEspecialGuia : dataDefault;

    configEmpresa.RecoleccionRegularHDGuia = (body.RecoleccionRegularHDGuia) ? body.RecoleccionRegularHDGuia : dataDefault;
    configEmpresa.RecoleccionRegularHDSeguro = (body.RecoleccionRegularHDSeguro) ? body.RecoleccionRegularHDSeguro : dataDefault;
    configEmpresa.RecoleccionRegularB2BGuia = (body.RecoleccionRegularB2BGuia) ? body.RecoleccionRegularB2BGuia : dataDefault;
    configEmpresa.RecoleccionRegularB2BSeguro = (body.RecoleccionRegularB2BSeguro) ? body.RecoleccionRegularB2BSeguro : dataDefault;
    configEmpresa.RecoleccionRegularB2BCTR = (body.RecoleccionRegularB2BCTR) ? body.RecoleccionRegularB2BCTR : dataDefault;
    configEmpresa.RecoleccionRegularSupermercadoGuia = (body.RecoleccionRegularSupermercadoGuia) ? body.RecoleccionRegularSupermercadoGuia : dataDefault;
    configEmpresa.RecoleccionRegularSupermercadoSeguro = (body.RecoleccionRegularSupermercadoSeguro) ? body.RecoleccionRegularSupermercadoSeguro : dataDefault;
    configEmpresa.RecoleccionRegularCDNGuia = (body.RecoleccionRegularCDNGuia) ? body.RecoleccionRegularCDNGuia : dataDefault;
    configEmpresa.RecoleccionRegularCDNSeguro = (body.RecoleccionRegularCDNSeguro) ? body.RecoleccionRegularCDNSeguro : dataDefault;
    configEmpresa.RecoleccionEspecialGuia = (body.RecoleccionEspecialGuia) ? body.RecoleccionEspecialGuia : dataDefault;

    configEmpresa.AlmacenIngresoIn = (body.AlmacenIngresoIn) ? body.AlmacenIngresoIn : dataDefault;
    configEmpresa.AlmacenIngresoPaletizado = (body.AlmacenIngresoPaletizado) ? body.AlmacenIngresoPaletizado : dataDefault;
    configEmpresa.AlmacenIngresoDesconsolidado = (body.AlmacenIngresoDesconsolidado) ? body.AlmacenIngresoDesconsolidado : dataDefault;
    configEmpresa.AlmacenIngresoAdicionalDesconsolidado = (body.AlmacenIngresoAdicionalDesconsolidado) ? body.AlmacenIngresoAdicionalDesconsolidado : dataDefault;
    configEmpresa.AlmacenPrepago = (body.AlmacenPrepago) ? body.AlmacenPrepago : dataDefault;
    configEmpresa.AlmacenPostpago = (body.AlmacenPostpago) ? body.AlmacenPostpago : dataDefault;
    configEmpresa.AlmacenSeguro = (body.AlmacenSeguro) ? body.AlmacenSeguro : dataDefault;
    configEmpresa.AlmacenEgresoOut = (body.AlmacenEgresoOut) ? body.AlmacenEgresoOut : dataDefault;
    configEmpresa.AlmacenEgresoPicking = (body.AlmacenEgresoPicking) ? body.AlmacenEgresoPicking: dataDefault;

    return configEmpresa

}

// Parsea el Body Recibido.
export const parseaEmpresaConfiguracionHistorico = async (body:any, idEmpresa: number): Promise<EmpresaConfiguracionHistorico> => {
    const dataDefault = '';
    const configEmpresa = new EmpresaConfiguracionHistorico();
    
    configEmpresa.IdEmpresa = idEmpresa
    configEmpresa.TipoCliente = body.TipoCliente
    configEmpresa.Fecha = new Date()
    

    configEmpresa.UnificarGuias = (body.UnificarGuias) ? body.UnificarGuias : false;

    configEmpresa.EntregaRegularHDGuia = (body.EntregaRegularHDGuia) ? body.EntregaRegularHDGuia : dataDefault;
    configEmpresa.EntregaRegularHDSeguro = (body.EntregaRegularHDSeguro) ? body.EntregaRegularHDSeguro : dataDefault;
    configEmpresa.EntregaRegularHDPickingCD = (body.EntregaRegularHDPickingCD) ? body.EntregaRegularHDPickingCD : dataDefault;
    configEmpresa.EntregaRegularHDComplemento = (body.EntregaRegularHDComplemento) ? body.EntregaRegularHDComplemento : dataDefault;

    configEmpresa.EntregaRegularRendicionesGuia = (body.EntregaRegularRendicionesGuia) ? body.EntregaRegularRendicionesGuia : dataDefault;
    configEmpresa.EntregaRegularRendicionesSeguro = (body.EntregaRegularRendicionesSeguro) ? body.EntregaRegularRendicionesSeguro : dataDefault;
    configEmpresa.EntregaRegularRendicionesPickingCD = (body.EntregaRegularRendicionesPickingCD) ? body.EntregaRegularRendicionesPickingCD : dataDefault;
    configEmpresa.EntregaRegularRendicionesComplemento = (body.EntregaRegularRendicionesComplemento) ? body.EntregaRegularRendicionesComplemento : dataDefault;

    configEmpresa.EntregaRegularB2BGuia = (body.EntregaRegularB2BGuia) ?  body.EntregaRegularB2BGuia : dataDefault;
    configEmpresa.EntregaRegularB2BSeguro = (body.EntregaRegularB2BSeguro) ? body.EntregaRegularB2BSeguro : dataDefault;
    configEmpresa.EntregaRegularB2BCTR = (body.EntregaRegularB2BCTR) ? body.EntregaRegularB2BCTR : dataDefault;
    configEmpresa.EntregaRegularB2BPickingCD = (body.EntregaRegularB2BPickingCD) ? body.EntregaRegularB2BPickingCD : dataDefault;
    configEmpresa.EntregaRegularB2BComplemento = (body.EntregaRegularB2BComplemento) ? body.EntregaRegularB2BComplemento : dataDefault;

    configEmpresa.EntregaRegularSupermercadoGuia = (body.EntregaRegularSupermercadoGuia) ? body.EntregaRegularSupermercadoGuia : dataDefault;
    configEmpresa.EntregaRegularSupermercadoSeguro = (body.EntregaRegularSupermercadoSeguro) ? body.EntregaRegularSupermercadoSeguro : dataDefault;
    configEmpresa.EntregaRegularSupermercadoPickingCD = (body.EntregaRegularSupermercadoPickingCD) ? body.EntregaRegularSupermercadoPickingCD : dataDefault;
    configEmpresa.EntregaRegularSupermercadoComplemento = (body.EntregaRegularSupermercadoComplemento) ? body.EntregaRegularSupermercadoComplemento : dataDefault;

    configEmpresa.EntregaRegularCNDGuia = (body.EntregaRegularCNDGuia) ? body.EntregaRegularCNDGuia : dataDefault;
    configEmpresa.EntregaRegularCNDSeguro = (body.EntregaRegularCNDSeguro) ? body.EntregaRegularCNDSeguro : dataDefault;
    configEmpresa.EntregaRegularCNDPickingCD = (body.EntregaRegularCNDPickingCD) ? body.EntregaRegularCNDPickingCD : dataDefault;
    configEmpresa.EntregaRegularCNDComplemento = (body.EntregaRegularCNDComplemento) ? body.EntregaRegularCNDComplemento : dataDefault;

    configEmpresa.EntregaEspecialGuia = (body.EntregaEspecialGuia) ? body.EntregaEspecialGuia : dataDefault;

    configEmpresa.RecoleccionRegularHDGuia = (body.RecoleccionRegularHDGuia) ? body.RecoleccionRegularHDGuia : dataDefault;
    configEmpresa.RecoleccionRegularHDSeguro = (body.RecoleccionRegularHDSeguro) ? body.RecoleccionRegularHDSeguro : dataDefault;
    configEmpresa.RecoleccionRegularB2BGuia = (body.RecoleccionRegularB2BGuia) ? body.RecoleccionRegularB2BGuia : dataDefault;
    configEmpresa.RecoleccionRegularB2BSeguro = (body.RecoleccionRegularB2BSeguro) ? body.RecoleccionRegularB2BSeguro : dataDefault;
    configEmpresa.RecoleccionRegularB2BCTR = (body.RecoleccionRegularB2BCTR) ? body.RecoleccionRegularB2BCTR : dataDefault;
    configEmpresa.RecoleccionRegularSupermercadoGuia = (body.RecoleccionRegularSupermercadoGuia) ? body.RecoleccionRegularSupermercadoGuia : dataDefault;
    configEmpresa.RecoleccionRegularSupermercadoSeguro = (body.RecoleccionRegularSupermercadoSeguro) ? body.RecoleccionRegularSupermercadoSeguro : dataDefault;
    configEmpresa.RecoleccionRegularCDNGuia = (body.RecoleccionRegularCDNGuia) ? body.RecoleccionRegularCDNGuia : dataDefault;
    configEmpresa.RecoleccionRegularCDNSeguro = (body.RecoleccionRegularCDNSeguro) ? body.RecoleccionRegularCDNSeguro : dataDefault;
    configEmpresa.RecoleccionEspecialGuia = (body.RecoleccionEspecialGuia) ? body.RecoleccionEspecialGuia : dataDefault;

    configEmpresa.AlmacenIngresoIn = (body.AlmacenIngresoIn) ? body.AlmacenIngresoIn : dataDefault;
    configEmpresa.AlmacenIngresoPaletizado = (body.AlmacenIngresoPaletizado) ? body.AlmacenIngresoPaletizado : dataDefault;
    configEmpresa.AlmacenIngresoDesconsolidado = (body.AlmacenIngresoDesconsolidado) ? body.AlmacenIngresoDesconsolidado : dataDefault;
    configEmpresa.AlmacenIngresoAdicionalDesconsolidado = (body.AlmacenIngresoAdicionalDesconsolidado) ? body.AlmacenIngresoAdicionalDesconsolidado : dataDefault;
    configEmpresa.AlmacenPrepago = (body.AlmacenPrepago) ? body.AlmacenPrepago : dataDefault;
    configEmpresa.AlmacenPostpago = (body.AlmacenPostpago) ? body.AlmacenPostpago : dataDefault;
    configEmpresa.AlmacenSeguro = (body.AlmacenSeguro) ? body.AlmacenSeguro : dataDefault;
    configEmpresa.AlmacenEgresoOut = (body.AlmacenEgresoOut) ? body.AlmacenEgresoOut : dataDefault;
    configEmpresa.AlmacenEgresoPicking = (body.AlmacenEgresoPicking) ? body.AlmacenEgresoPicking: dataDefault;

    configEmpresa.EntregaRegularDevolucionesGuia = (body.EntregaRegularDevolucionesGuia) ?  body.EntregaRegularDevolucionesGuia : dataDefault;
    configEmpresa.EntregaRegularDevolucionesSeguro = (body.EntregaRegularDevolucionesSeguro) ? body.EntregaRegularDevolucionesSeguro : dataDefault;
    configEmpresa.EntregaRegularDevolucionesCTR = (body.EntregaRegularDevolucionesCTR) ? body.EntregaRegularDevolucionesCTR : dataDefault;
    configEmpresa.EntregaRegularDevolucionesPickingCD = (body.EntregaRegularDevolucionesPickingCD) ? body.EntregaRegularDevolucionesPickingCD : dataDefault;
    configEmpresa.EntregaRegularDevolucionesComplemento = (body.EntregaRegularDevolucionesComplemento) ? body.EntregaRegularDevolucionesComplemento : dataDefault;
    
    return configEmpresa

}

export const empresas_getAll_DALC = async () => {
    const results = await getRepository(Empresa).find()
    return results
}

export const empresa_getById_DALC = async (id: number): Promise<Empresa> => {
    console.log('[EmpresaDALC] Buscando empresa', id)
    const result = await getRepository(Empresa).findOne({
        where: { Id: id },
        select: [
            'Id', 'Nombre', 'RazonSocial', 'AutogestionHabilitada', 'AutogestionOpciones',
            'MostrarTyC', 'StockUnitario', 'StockPosicionado', 'RequiereFotoDocumentacionEntrega',
            'GeneracionAutomaticaEtiquetas', 'Activa', 'Estado', 'Tipo', 'Iva', 'Cuit', 'IngresosBrutos',
            'DireccionOficina', 'DireccionDeposito', 'ContactoOficina', 'ContactoDeposito', 'CodigoPostal',
            'FechaAlta', 'IngesarCantidadUnidadesEnSalidaOrdenes', 'VistaDetalladaExcelGuias', 'ClienteTextil',
            'TokenApi', 'TipoMoneda', 'LOTE', 'PART', 'SalidaExpress', 'UsaRemitos'
        ]
    })
    console.log('[EmpresaDALC] Empresa encontrada', result?.Id)
    console.log('[EmpresaDALC] Datos empresa', {
        Nombre: result?.Nombre,
        RazonSocial: result?.RazonSocial,
        UsaRemitos: result?.UsaRemitos,
        Activa: result?.Activa,
        Tipo: result?.Tipo
    })
    return result!
}

export const empresa_getByNombre_DALC = async (nombre: String): Promise<Empresa> => {
    const result = await getRepository(Empresa).findOne( {where: {Nombre: nombre}})
    return result!
}

export const empresa_getByRazonSocial_DALC = async (razonSocial: String): Promise<Empresa> => {
    const result = await getRepository(Empresa).findOne( {where: {RazonSocial: razonSocial}})
    return result!
}

export const empresaConfiguracion_getById_DALC = async (id: number): Promise<EmpresaConfiguracion> => {
    const result = await getRepository(EmpresaConfiguracion).findOne({IdEmpresa: id})
    return result!
}

export const empresaConfiguraciones_getById_DALC = async (id:number ,desde:string, hasta:string): Promise<EmpresaConfiguracionHistorico[]> => {
    // console.log("Desde: "+desde+" Hasta: "+ hasta)
    const result = await getRepository(EmpresaConfiguracionHistorico).find({
        where: {
            IdEmpresa: id,
            Fecha: Between(desde, hasta)
        },
        order: {Fecha:'DESC'}
    })
    // console.log(result)
    return result
}

export const empresaConfiguraciones_getOneById_DALC = async (id:number): Promise<EmpresaConfiguracionHistorico> => {
    // console.log("Desde: "+desde+" Hasta: "+ hasta)
    const result = await getRepository(EmpresaConfiguracionHistorico).findOne({
        where: {
            IdEmpresa: id},
        order: {Fecha:'DESC'}
    })
    // console.log(result)
    return result!
}

export const empresasConfiguracion_getAll_DALC = async (): Promise<any> => {
    const results = await getRepository(EmpresaConfiguracion).find()
    return results
}