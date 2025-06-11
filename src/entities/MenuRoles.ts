import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"

@Entity("web_options_menu_roles")
export class MenuRoles {
    @PrimaryGeneratedColumn({name: "ID"})
    Id: number

    @Column({name: "ROLE_ID"})
    IdRol: number

    @Column({name: "MENU_ID"})
    IdMenu: number

  
	@Column({name: "CREATED_DATE"})
    Fecha_Creacion: Date
    
    @Column({name: "CREATED_USER"})
    Usuario: string


}