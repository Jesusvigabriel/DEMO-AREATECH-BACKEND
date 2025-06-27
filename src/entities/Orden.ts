import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, AfterLoad, ManyToMany, JoinTable, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn} from "typeorm"
import {Empresa} from "../entities/Empresa"
import { Destino } from "./Destino"

import { get_BultosOrden_ByNumeroOrdenAndIdEmpresa } from "../DALC/ordenesDetalle.dalc";
import { OrdenDetalle } from "./OrdenDetalle";

@Entity("ordenes")

export class Orden {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "empresa"})
    IdEmpresa: number
 
    @ManyToOne( () => Empresa)
    @JoinColumn({name: "empresa"})
    Empresa: Empresa

    @Column({default: 1})
    Tipo: number

    @Column()
    Numero: string

    @Column({name: "id_integracion"})
    IdIntegracion: string
        
    @Column({name: "email_destinatario"})
    EmailDestinatario: string
        
    @Column({name: "retira_cliente"})
    RetiraCliente: boolean

    @Column({name: "prioridad"})
    Prioridad: number
    
    @Column()
    Eventual: number
 
    @OneToMany( () => OrdenDetalle, Detalle=> Detalle.Orden)
    Detalle: OrdenDetalle[]


    // @ManyToOne( () => Destino)
    // @JoinColumn({name: "eventual"})
    Destino: Destino
 
    @Column({name: "Valor"})
    ValorDeclarado: number
    
    @Column({name: "Valor_ctr"})
    ValorContrareembolso: number
    
    @Column({default: 1})
    Estado: number

    NombreEstado: String
    // Estado de las órdenes:
    // -1: Eliminada
    // 1: Pendiente
    // 2: Preparado
    // 3: A Distribucion
    // 4: Anulado
    // 5: Retira Cliente
    @AfterLoad()
    getNombreEstado = () => {
        switch (this.Estado) {
            case 1:
                this.NombreEstado="Pendiente"
                break;
            case 2:
                this.NombreEstado="Preparado"
                break;
            case 3:
                this.NombreEstado="A distribución"
                break;
            case 4:
                this.NombreEstado="Anulado"
                break;
            case 5:
                this.NombreEstado="Retira Cliente"
                break;    
        
            default:
                this.NombreEstado="Indeterminado"
                break;
        }
    }

    // @OneToOne(() => Guia, (guia) => guia.Id)
    // @JoinColumn()
    // IdGuia: number

    @Column({name: "id_guia"})
    IdGuia: number
    
    @Column({name: "Observ"})
    Observaciones: string

    @Column()
    Fecha: string

    @CreateDateColumn({name: "fechaCreacion", type: "timestamp"})
    FechaCreacion: Date

    @Column({name: "fechaPreparado"})
    FechaPreparado: string

    @Column({name: "email_aviso_impresion_etiquetas_enviado"})
    EmailAvisoImpresionEtiquetasEnviado: boolean

    @Column({name: "preOrden"})
    PreOrden: boolean

    @Column({name: "kilos"})
    Kilos: number

    @Column({name: "metros"})
    Metros: number
   
    Bultos: number | null
    @AfterLoad()
    obtieneBultos = async () => {
        this.Bultos = await get_BultosOrden_ByNumeroOrdenAndIdEmpresa(this.Numero, this.IdEmpresa)
    }

    @Column({name: "impresion"})
    Impresion: string

    @Column({name: "usuario"})
    Usuario: string

    @Column({name: "liberarPreOrden"})
    LiberarPreOrden: string

    @Column({name: "fechaOrdenPreparada"})
    FechaOrdenPreparada: string

    @Column({name: "usuarioCreoOrd"})
    UsuarioCreoOrd: string

    @Column({name: "usuarioQuitoPreOrd"})
    UsuarioQuitoPreOrd: string

    @Column({name: "usuarioPreparoOrd"})
    UsuarioPreparoOrd: string

    @Column({name: "usuario_creacion", length: 100, nullable: true})
    UsuarioCreacion: string
    
    @Column({name: "usuario_modificacion", length: 100, nullable: true})
    UsuarioModificacion: string
    
    @UpdateDateColumn({name: "fecha_modificacion", type: "timestamp", nullable: true})
    FechaModificacion: Date

    @Column({name: "punto_venta_id"})
    PuntoVentaId: number

    // Campos para empresas con partidas y remitos
    @Column({name: "cuit_iva", nullable: true})
    CuitIva: string

    @Column({name: "domicilio_entrega", nullable: true})
    DomicilioEntrega: string

    @Column({name: "codigo_postal_entrega", nullable: true})
    CodigoPostalEntrega: string

    @Column({nullable: true})
    Transporte: string

    @Column({name: "domicilio_transporte", nullable: true})
    DomicilioTransporte: string

    @Column({name: "cuit_iva_transporte", nullable: true})
    CuitIvaTransporte: string

    @Column({name: "orden_compra", nullable: true})
    OrdenCompra: string

    @Column({name: "nro_pedidos", nullable: true})
    NroPedidos: string

    @Column({name: "observaciones_lugar_entrega", type: "text", nullable: true})
    ObservacionesLugarEntrega: string

    @Column({name: "nro_remito"})
    NroRemito: string

    @Column({name: "despacho_plaza"})
    DespachoPlaza: string
}