import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("pos_prod")

export class PosicionProducto {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: "empresaId"})
    IdEmpresa: number

    @Column({name: "posicionId"})
    IdPosicion: number

    @Column({name: "productId"})
    IdProducto: number

    @Column()
    Unidades: number
    
    @Column()
    asigned: Date

    @Column()
    removed: Date

    @Column()
    Existe: number

    @Column({name: "lote"})
    Lote: string

    @Column({name: "embarque"})
    Embarque: string
    
    @Column({name: "usuarioNombre"})
    UsuarioNombre: string
}