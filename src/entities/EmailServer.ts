import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("email_servers")
export class EmailServer {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({ name: "id_empresa" })
    IdEmpresa: number

    @Column()
    Nombre: string

    @Column()
    Host: string

    @Column()
    Puerto: number

    @Column()
    Usuario: string

    @Column()
    Password: string

    @Column()
    Seguro: boolean

    @Column({ name: "desde_email" })
    DesdeEmail: string

    @Column({ name: "desde_nombre" })
    DesdeNombre: string
}
