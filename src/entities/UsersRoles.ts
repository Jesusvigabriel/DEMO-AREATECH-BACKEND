import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"



@Entity("users_roles")
export class UsersRoles {
    @PrimaryGeneratedColumn({name: "ID"})
    Id: number

    @Column({name: "USER_ID"})
    IdUsuario: string

    @Column({name: "ROLE_ID"})
    IdRole: string

  
	@Column({name: "CREATED_DATE"})
    Fecha_Creacion: Date
    
    @Column({name: "CREATED_USERNAME"})
    Usuario: string
    

   

}