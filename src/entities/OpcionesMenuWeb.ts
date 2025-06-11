import {Entity, Column, PrimaryGeneratedColumn} from "typeorm"



@Entity("web_options_menu")
export class OpcionesMenu {
    @PrimaryGeneratedColumn({name: "MENU_ID"})
    Id: number

    @Column({name: "MENU_ROUTE"})
    Ruta: string

    @Column({name: "MENU_NAME"})
    Nombre: string

  
	@Column({name: "MENU_ICON"})
    Icono: string
    
    @Column({name: "MODULE_MENU"})
    Modulo: string


}