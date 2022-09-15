import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Order } from './orders'
import { StudentGroup } from './students_groups'


@Entity({ name: "education.students_groups_orders" }) 
export class StudentGroupOrder {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type:'int', nullable: true })
    course!: number 

    @Column({ name: 'current_date' })
    currentDate!: string

    @Column({ name: 'id_students_groups' })
    idStudentsGroups!: number

    @Column({ name: 'id_order' })
    idOrder!: number

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'id_order' })
    order!: Order 

    @ManyToOne(() => StudentGroup, studGroup => studGroup.studentGroupOrders)
    @JoinColumn({ name: 'id_students_groups' })
    studentGroup!: StudentGroup
}