import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Department } from './departments'
import { PersonsPosition } from './persons_positions'
import { TypePosition } from './type_position'

@Entity({ name: 'pers.Position' })
export class Position {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'id_department'
    })
    idDepartment!: number

    @Column({
        name: 'id_type'
    })
    idType!: number

    @ManyToOne(() => Department, (department) => department.positions)
    @JoinColumn({ name: 'id_department'})
    department!: Department

    @ManyToOne(() => TypePosition, (typePosition) => typePosition.positions)
    @JoinColumn({ name: 'id_type'})
    typePosition!: TypePosition

    @OneToMany(() => PersonsPosition, (personsPosition) => personsPosition.position)
    personsPosition!: PersonsPosition
}