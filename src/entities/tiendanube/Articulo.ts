import {Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity("tiendanube_articulos")
export class tiendanube_articulo {
    @PrimaryGeneratedColumn()
    Id: number

    Nombre: string
    SKU: string
    Barcode: string
    Peso: string
    Alto: string
    Ancho: string
    Profundidad: string
}

