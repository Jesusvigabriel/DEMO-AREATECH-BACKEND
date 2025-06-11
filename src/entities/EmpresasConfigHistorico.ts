import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, Timestamp} from "typeorm"
import { Empresa } from "./Empresa"

@Entity("empresas_config_historico")
export class EmpresaConfiguracionHistorico {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "id_empresa"})
    IdEmpresa: number

    @Column({name: "Unificar_Guias"})
    UnificarGuias: boolean

    /*
    Almacen
    */   
    @Column({name: "Almacen_Ingreso_In"})
    AlmacenIngresoIn: string

    @Column({name: "Almacen_Ingreso_Paletizado"})
    AlmacenIngresoPaletizado: string

    @Column({name: "Almacen_Ingreso_Desconsolidado"})
    AlmacenIngresoDesconsolidado: string

    @Column({name: "Almacen_Ingreso_Adicional_Desconsolidado"})
    AlmacenIngresoAdicionalDesconsolidado: string

    @Column({name: "Almacen_Prepago"})
    AlmacenPrepago: string

    @Column({name: "Almacen_Postpago"})
    AlmacenPostpago: string

    @Column({name: "Almacen_Seguro"})
    AlmacenSeguro: string

    @Column({name: "Almacen_Egreso_Out"})
    AlmacenEgresoOut: string

    @Column({name: "Almacen_Egreso_Picking"})
    AlmacenEgresoPicking: string

    /*
    Distribucion Regular HD
    */
    @Column({name: "Entrega_Regular_HD_Guia"})
    EntregaRegularHDGuia: string

    @Column({name: "Entrega_Regular_HD_Seguro"})
    EntregaRegularHDSeguro: string

    @Column({name: "Entrega_Regular_HD_PickingCD"})
    EntregaRegularHDPickingCD: string

    @Column({name: "Entrega_Regular_HD_Complemento"})
    EntregaRegularHDComplemento: string


    /*
    Distribucion Regular Rendiciones
    */
    @Column({name: "Entrega_Regular_Rendiciones_Guia"})
    EntregaRegularRendicionesGuia: string

    @Column({name: "Entrega_Regular_Rendiciones_Seguro"})
    EntregaRegularRendicionesSeguro: string

    @Column({name: "Entrega_Regular_Rendiciones_PickingCD"})
    EntregaRegularRendicionesPickingCD: string

    @Column({name: "Entrega_Regular_Rendiciones_Complemento"})
    EntregaRegularRendicionesComplemento: string

    /*
    Entrega Regular B2B
    */
    @Column({name: "Entrega_Regular_B2B_Guia"})
    EntregaRegularB2BGuia: string

    @Column({name: "Entrega_Regular_B2B_Seguro"})
    EntregaRegularB2BSeguro: string

    @Column({name: "Entrega_Regular_B2B_CTR"})
    EntregaRegularB2BCTR: string

    @Column({name: "Entrega_Regular_B2B_PickingCD"})
    EntregaRegularB2BPickingCD: string

    @Column({name: "Entrega_Regular_B2B_Complemento"})
    EntregaRegularB2BComplemento: string

    /*
    Distribución Regular Supermercado
    */
    @Column({name: "Entrega_Regular_Supermercado_Guia"})
    EntregaRegularSupermercadoGuia: string

    @Column({name: "Entrega_Regular_Supermercado_Seguro"})
    EntregaRegularSupermercadoSeguro: string

    @Column({name: "Entrega_Regular_Supermercado_PickingCD"})
    EntregaRegularSupermercadoPickingCD: string

    @Column({name: "Entrega_Regular_Supermercado_Complemento"})
    EntregaRegularSupermercadoComplemento: string

    /*
    Distribución Regular CND
    */
    @Column({name: "Entrega_Regular_CND_Guia"})
    EntregaRegularCNDGuia: string

    @Column({name: "Entrega_Regular_CND_Seguro"})
    EntregaRegularCNDSeguro: string

    @Column({name: "Entrega_Regular_CND_PickingCD"})
    EntregaRegularCNDPickingCD: string

    @Column({name: "Entrega_Regular_CND_Complemento"})
    EntregaRegularCNDComplemento: string

    /* Entrega Regular Devoluciones*/
  
    @Column({name: "Entrega_Regular_Devoluciones_Guia"})
    EntregaRegularDevolucionesGuia: string

    @Column({name: "Entrega_Regular_Devoluciones_Seguro"})
    EntregaRegularDevolucionesSeguro: string

    @Column({name: "Entrega_Regular_Devoluciones_CTR"})
    EntregaRegularDevolucionesCTR: string

    @Column({name: "Entrega_Regular_Devoluciones_PickingCD"})
    EntregaRegularDevolucionesPickingCD: string

    @Column({name: "Entrega_Regular_Devoluciones_Complemento"})
    EntregaRegularDevolucionesComplemento: string

    /*
    Distribución Especial
    */
    @Column({name: "Entrega_Especial_Guia"})
    EntregaEspecialGuia: string

    /*
    Recoleccion
    */

    @Column({name: "Recoleccion_Regular_HD_Guia"})
    RecoleccionRegularHDGuia: string

    @Column({name: "Recoleccion_Regular_HD_Seguro"})
    RecoleccionRegularHDSeguro: string

    @Column({name: "Recoleccion_Regular_B2B_Guia"})
    RecoleccionRegularB2BGuia: string

    @Column({name: "Recoleccion_Regular_B2B_Seguro"})
    RecoleccionRegularB2BSeguro: string

    @Column({name: "Recoleccion_Regular_B2B_CTR"})
    RecoleccionRegularB2BCTR: string

    @Column({name: "Recoleccion_Regular_Supermercado_Guia"})
    RecoleccionRegularSupermercadoGuia: string

    @Column({name: "Recoleccion_Regular_Supermercado_Seguro"})
    RecoleccionRegularSupermercadoSeguro: string

    @Column({name: "Recoleccion_Regular_CDN_Guia"})
    RecoleccionRegularCDNGuia: string

    @Column({name: "Recoleccion_Regular_CDN_Seguro"})
    RecoleccionRegularCDNSeguro: string

    @Column({name: "Recoleccion_Especial_Guia"})
    RecoleccionEspecialGuia: string

    @Column({name: "Tipo_Cliente"})
    TipoCliente: number

    @Column({name: "fecha_creacion"})
    Fecha: Date

}