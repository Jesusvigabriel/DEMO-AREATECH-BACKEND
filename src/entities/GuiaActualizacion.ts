import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, JoinTable, AfterLoad} from "typeorm"
import {Chofer} from './Chofer'

@Entity("planchada_actualizacion")

export class GuiaActualizacion {
    @PrimaryGeneratedColumn()
    Id: number

    @Column({name: 'id_guia'})
    IdGuia: Number
    
    @Column({name: 'estado_anterior'})
    EstadoAnterior: String
    
    @Column({name: 'estado_actualizado'})
    EstadoActualizado: String
    
    @Column({name: 'fecha_anterior'})
    FechaAnterior: String
    
    @Column({name: 'fecha_actualizada'})
    FechaActualizada: String
    
    @Column({name: 'atraso_anterior'})
    AtrasoAnterior: Number
    
    @Column({name: 'atraso_actualizado'})
    AtrasoActualizado: Number
    
}