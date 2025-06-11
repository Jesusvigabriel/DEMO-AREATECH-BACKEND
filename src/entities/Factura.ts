import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("facturas")
export class Factura {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "id_empresa"})
    IdEmpresa: number

    @Column({name: "importe_a_facturar"})
    ImporteAFacturar: number

    @Column({name: "fecha_orden"})
    FechaOrden: string

    @Column({name: "hash_excel"})
    HashExcel: string
    
    @Column({name: "fecha_emision"})
    FechaEmision: string

    @Column({name: "numero"})
    Numero: string

    @Column({name: "importe_total_facturado"})
    ImporteTotalFacturado: number

    @Column({name: "tipo_servicio"})
    TipoServicio: string

    @Column({name: "periodo_facturado"})
    PeriodoFacturado: string

    @Column({name: "id_guias_a_facturar"})
    IdGuiasAFacturar: string

}