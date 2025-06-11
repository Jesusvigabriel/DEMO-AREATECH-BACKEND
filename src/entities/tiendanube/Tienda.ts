import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("tiendanube_tienda")
export class tiendanube_tienda {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    id_tiendaNube: number

    @Column()
    accessTienda: string

    @Column()
    id_tiendaArea: number

    @Column()
    nombreTienda: string

}


