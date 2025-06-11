import {Entity, Column, PrimaryGeneratedColumn, AfterLoad, ManyToOne, JoinColumn} from "typeorm"
import { empresa_getById_DALC } from "../DALC/empresas.dalc"
import { Empresa } from "./Empresa"

@Entity("usuarios")
export class Usuario {
    @PrimaryGeneratedColumn({name: "ID"})
    Id: number

    @Column({name: "Usuario"})
    Usuario: string

    @Column({name: "Password"})
    Password: string

    // 👇 Nuevo campo agregado
    @Column({name: "email"})  // Nombre exacto de la columna en tu DB
    Email: string;

    @Column()
    Permiso: number

    @Column({name: 'idempresa'})
    IdEmpresa: number
    @AfterLoad()
    parsearIdEmpresa = () => {
        this.IdEmpresa=Number(this.IdEmpresa)
    }
     
    Empresa: Empresa
    @AfterLoad()
    asignarEmpresa = async () => {
        if (this.IdEmpresa>0) {
            const empresa=await empresa_getById_DALC(this.IdEmpresa)
            this.Empresa=empresa
        } else {
            this.Empresa=new Empresa()
        }
    }
   
	@Column({name: "nempresa"})
    Nombre_Empresa: string
    
    @Column({name: "tc"})
    Terminos_Condiciones: number

     @Column({name: "deshabilitado"})
     Deshabilitado: number
}