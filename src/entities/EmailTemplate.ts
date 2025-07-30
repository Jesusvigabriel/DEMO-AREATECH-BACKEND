import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { EmailServer } from "./EmailServer"

@Entity("email_templates")
export class EmailTemplate {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({ name: "email_server_id" })
    IdEmailServer: number

    @ManyToOne(() => EmailServer)
    @JoinColumn({ name: "email_server_id" })
    Servidor: EmailServer

    @Column()
    Codigo: string

    @Column()
    Asunto: string

    @Column({ type: "text", name: "cuerpo_html" })
    CuerpoHtml: string

    @Column({ type: "text", name: "cuerpo_texto" })
    CuerpoTexto: string

    @Column()
    Activo: boolean
}
