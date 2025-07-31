import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("email_templates")
export class EmailTemplate {
    @PrimaryGeneratedColumn()
    Id: number

    @Column()
    IdEmpresa: number

    @Column()
    Tipo: string

    @Column()
    Titulo: string

    @Column({ type: "text" })
    Cuerpo: string

    @Column()
    Activo: boolean

    @Column({ name: "UsuarioCreacion" })
    UsuarioCreacion: string

    @Column({ type: "datetime", name: "FechaCreacion" })
    FechaCreacion: Date

    @Column({ name: "UsuarioModificacion", nullable: true })
    UsuarioModificacion?: string

    @Column({ type: "datetime", name: "FechaModificacion", nullable: true })
    FechaModificacion?: Date
}
