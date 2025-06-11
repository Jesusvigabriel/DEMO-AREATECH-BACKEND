import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"



@Entity("roles")
export class Roles {
    @PrimaryGeneratedColumn({name: "ROLE_ID"})
    Id: number

    @Column({name: "ROLE_NAME"})
    Nombre: string

    @Column({name: "ROLE_DESCRIPTION"})
    Descripcion: string

  
	@Column({name: "CREATED_DATE"})
    Fecha_Creacion: Date
    
    @Column({name: "CREATED_USERNAME"})
    Usuario: string



}