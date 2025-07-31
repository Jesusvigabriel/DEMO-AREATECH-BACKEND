import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Empresa } from "./Empresa";

@Entity("email_servers")
export class EmailServer {
    @PrimaryGeneratedColumn({ name: "Id" })
    Id: number;

    @Column({ name: "IdEmpresa" })
    IdEmpresa: number;

    @ManyToOne(() => Empresa, empresa => empresa.emailServers)
    @JoinColumn({ name: "IdEmpresa" })
    empresa: Empresa;

    @Column({ name: "Host" })
    Host: string;

    @Column({ name: "Port", default: 587 })
    Port: number;

    @Column({ name: "Secure", default: false })
    Secure: boolean;

    @Column({ name: "Username" })
    Username: string;

    @Column({ name: "Password" })
    Password: string;

    @Column({ name: "FromName", nullable: true })
    FromName: string;

    @Column({ name: "FromEmail", nullable: true })
    FromEmail: string;

    @Column({ name: "UsuarioCreacion", nullable: true })
    UsuarioCreacion: string;

    @Column({ name: "FechaCreacion", type: "datetime", nullable: true })
    FechaCreacion: Date;

    @Column({ name: "UsuarioModificacion", nullable: true })
    UsuarioModificacion: string;

    @Column({ name: "FechaModificacion", type: "datetime", nullable: true })
    FechaModificacion: Date;
}
