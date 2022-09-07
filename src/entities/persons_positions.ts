import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Person } from './persons'
import { Position } from './position'


@Entity({ name: 'pers.PersonsPosition' })
export class PersonsPosition {
    @PrimaryGeneratedColumn()
    id!: number


    @Column({
        name: 'id_person'
    })
    idPerson!: number

    @Column({
        name: 'id_position'
    })
    idPosition!: number


    @ManyToOne(() => Person, (person) => person.personsPosition)
    @JoinColumn({ name: 'id_person'})
    person!: Person

    @ManyToOne(() => Position, (position) => position.personsPosition)
    @JoinColumn({ name: 'id_position'})
    position!: Position
}