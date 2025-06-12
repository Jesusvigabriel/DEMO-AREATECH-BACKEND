import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, JoinTable, AfterLoad, OneToOne, Index} from "typeorm"
import {Chofer} from '../entities/Chofer'
import { Empresa } from "./Empresa"
import { GuiaFoto } from "./GuiaFoto"
import { Orden } from "./Orden"

@Entity("planchada")

export class Guia {
    @PrimaryGeneratedColumn({name: "guia"})
    Id: number

    @ManyToOne( () => Chofer)
    @JoinColumn({name: "chofer"})
    Chofer: Chofer

    @OneToOne(() => Orden)
    @JoinColumn({name: "idOrden"})
    Orden: Orden

    // @OneToMany( () => GuiaFoto, foto => foto.IdGuia , )
    // @JoinColumn({})
    // Fotos: GuiaFoto[]

    @Index()
    @Column({name: "id_empresa"})
    IdEmpresa: number

    @ManyToOne(() => Empresa)
    @JoinColumn({name: "id_empresa"})
    Empresa: Empresa

    @Column({name: "chofer"})
    IdChofer: number

    @Column()
    Comprobante: string

    @Column({name: "Comentario"})
    Comentario: string

    @Column()
    OrdenEntrega: string

    @Column()
    Fecha: string
    @AfterLoad()
    formatearFecha = () => {
        const fecha=require("lsi-util-node/fechas").dateToString(this.Fecha)
        this.Fecha = fecha
    }

    @Index()
    @Column()
    FechaOriginal: string
    @AfterLoad()
    formatearFechaOriginal = () => {
        const fecha=require("lsi-util-node/fechas").dateToString(this.FechaOriginal)
        this.FechaOriginal = fecha
    }

    @Column({name: "Cliente"})
    NombreCliente: string

    @Column()
    Remitos: string
    
    @Column()
    Eventual: Number
    
    @Column()
    Atraso: Number
    
    @Column()
    Flete: Number
    
    @Column({name: 'id_rendicion'})
    IdRendicion: number
    
    @Column({name: 'id_factura'})
    IdFactura: number

    @Column({name: 'idOrden'})
    IdOrden: number
    
    @Column({name: 'detalle_calculo'})
    DetalleCalculo: String
    
    @Column()
    Estado: string
    
    @Column({name: "Destino"})
    NombreDestino: string

    @Column({name: "email_destinatario"})
    EmailDestinatario: string

    @Column({name: "token_acceso_tracking"})
    TokenAccesoTracking: string

    @Column()
    Domicilio: string
    
    @Column({name: "CP"})
    CodigoPostal: string
    
    @Column({name: "CRR"})
    ContraReembolso: number
    
    @Column()
    Localidad: string
    
    @Column()
    Bultos: number
    
    @Column()
    Kilos: number
    
    @Column()
    Volumen: number
    
    @Column({name: "declarado"})
    ValorDeclarado: number
    
    @Column()
    Observaciones: string
    
    @Column()
    Latitud: number
    
    @Column()
    Longitud: number
    
    @Column()
    NombreReceptor: string

    @Column()
    Ventana: number

    @Column()
    HashFotoNoEntregado: string

    CantidadEntregasPrevias: number

    PedirFotoDocumentacionEntrega: boolean

    @Column({name: "devolucion"})
    Devolucion: number

}