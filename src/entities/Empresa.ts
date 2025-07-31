import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm"
import { EmailServer } from "./EmailServer"

@Entity("empresas")

export class Empresa {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    Nombre: string

    @Column()
    RazonSocial: string

     @Column({name: "Autogestion_Habilitada"})
     AutogestionHabilitada: boolean

     @Column({name: "Autogestion_Opciones"})
     AutogestionOpciones: string

    @Column({name: "Mostrar_TyC"})
    MostrarTyC: boolean

    @Column({name: "stock_unitario"})
    StockUnitario: boolean 

    @Column({name: "stock_posicionado"})
    StockPosicionado: boolean 

    @Column({name: "Requiere_Foto_Documentacion_Entrega"})
    RequiereFotoDocumentacionEntrega: boolean

    @Column({name: "Generacion_Automatica_Etiquetas"})
    GeneracionAutomaticaEtiquetas: boolean

    @Column({name: "Activa"})
    Activa: boolean

    @Column({name: "Estado"})
    Estado: number

    @Column({name: "Tipo"})
    Tipo: number

    @Column({name: "Iva"})
    Iva: number

    @Column({name: "CuitCuil"})
    Cuit: string

    @OneToMany(() => EmailServer, emailServer => emailServer.empresa)
    emailServers: EmailServer[];

    @Column({name: "Ingresosbrutos"})
    IngresosBrutos: string

    @Column({name: "DireccionOficina"})
    DireccionOficina: string

    @Column({name: "DireccionDeposito"})
    DireccionDeposito: string

    @Column({name: "ContactoOficina"})
    ContactoOficina: string

    @Column({name: "ContactoDeposito"})
    ContactoDeposito: string

    @Column({name: "CodigoPostal"})
    CodigoPostal: string

    @Column({name: "Alta"})
    FechaAlta: Date

    @Column({name: "Ingresar_Cantidad_Unidades_En_Salida_Ordenes"})
    IngesarCantidadUnidadesEnSalidaOrdenes: boolean

    @Column({name: "Vista_Detallada_Excel_Guias"})
    VistaDetalladaExcelGuias: boolean

    @Column({name: "ClienteTextil"})
    ClienteTextil: boolean

    @Column({name: "apiv2_token"})
    TokenApi: string

    @Column({name: "tipo_moneda"})
    TipoMoneda: string

    @Column({name: "tieneLOTE"})
    LOTE: boolean

    @Column({name: "tienePartida"})
    PART: boolean

    @Column({name: "salida_express"})
    SalidaExpress: boolean

    @Column({name: "UsaRemitos"})
    UsaRemitos: boolean
}
