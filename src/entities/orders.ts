import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { StudentGroupOrder } from './students_groups_orders'
import { TypeOrder } from './type_orders'

@Entity({ name: 'education.orders' })
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'id_type_order' })
    idTypeOrder!: number

    @Column()
    name!: string

    @Column()
    date!: string

    @Column({ name: 'created_at' })
    createdAt!: string

    @ManyToOne(() => TypeOrder, typeOrder => typeOrder.orders)
    @JoinColumn({ name: 'id_type_order' })
    typeOrder!: TypeOrder 

    @OneToMany(() => StudentGroupOrder, studGroupOrder => studGroupOrder.order)
    studentGroupOrders!: StudentGroupOrder[]
}