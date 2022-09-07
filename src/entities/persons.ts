import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'
import { PersonsPosition } from './persons_positions'


@Entity({ 
    name: 'pers.Persons', 
    orderBy: {
        lastname: 'ASC', firstname: 'ASC', middlename: 'ASC' 
    } 
})
export class Person {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'name'
    })
    firstname!: string

    @Column({
        name: 'lastname'
    })
    middlename!: string

    @Column({
        name: 'firstname'
    })
    lastname!: string

    @OneToMany(() => PersonsPosition, (personsPosition) => personsPosition.person)
    personsPosition!: PersonsPosition
}