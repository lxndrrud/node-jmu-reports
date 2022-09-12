import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Position } from './position'

@Entity({ name: 'pers.TypePositions' })
export class TypePosition {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'name_position'
    })
    namePosition!: string

    @OneToMany(() => Position, (position) => position.typePosition)
    positions!: Position[]
}