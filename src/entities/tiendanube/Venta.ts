
import {Entity, PrimaryGeneratedColumn} from "typeorm"

interface Iproducts {
    id: number
    sku: string
    name: string
    quantity: number
    weight: number
    height: number
    width: number
    depth: number
    barcode: string
};

interface IshippingAddress{
    name: string
    address: string
    number: string
    floor: string
    locality: string
    city: string
    province: string
    country: string
    zipCode: string
    phone: string
    customs: any
}

interface Icustomer {
    id: number
    name: string
    email: string
    phone: string
}

interface IclientDetails {
    browserIP: string
    userAgent: string
}


@Entity("tiendanube_ventas")
export class tiendanube_ventas {
    @PrimaryGeneratedColumn()
    id: number

    paymentStatus: string
    
    status: string

    total: string

    completedAt: string

    products: Iproducts[]

    shippingAddress: IshippingAddress

    customer: Icustomer

    clientDetails: IclientDetails

}



