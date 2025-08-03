import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("mailssalientes")

export class MailSaliente {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    Destinatarios: string

    @Column()
    Titulo: string

    @Column()
    Cuerpo: string

    @Column()
    Adjuntos: string

    @Column()
    Enviado: boolean

    @Column()
    CantidadIntentos:  number
 
    @Column()
    ConCopia: string

    @Column()
    ConCopiaOculta: string

    @Column()
    NombreRemitente: string

    @Column()
    EmailRemitente: string

    @Column({ type: 'datetime' })
    FechaEnvio: Date

    @Column({ type: 'int', nullable: true })
    IdEmailServer?: number

    @Column({ type: 'int', nullable: true })
    IdEmailTemplate?: number

}