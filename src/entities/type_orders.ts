import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Order } from './orders'

@Entity({ name: 'education.type_orders' })
export class TypeOrder {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => Order, order => order.typeOrder)
    orders!: Order[]
}