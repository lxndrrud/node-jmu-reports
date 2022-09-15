import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Student } from './students'
import { StudentGroupOrder } from './students_groups_orders'
import { StudentMark } from './students_marks'
import { StudentStatement } from './students_statements'
import { StudyGroup } from './study_groups'


@Entity({ name: 'education.students_groups' })
export class StudentGroup {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", name: 'record_book', nullable: true })
    recordBook!: string

    @Column({ name: 'id_group' })
    idGroup!: number

    @Column({ name: 'id_student' })
    idStudent!: number

    @Column()
    status!: number

    @Column()
    target!: boolean

    @ManyToOne(() => Student, (student) => student.studentGroup)
    @JoinColumn({ name: 'id_student'})
    student!: Student

    @ManyToOne(() => StudyGroup, (group) => group.studentGroup)
    @JoinColumn({ name: 'id_group'})
    group!: StudyGroup

    @OneToMany(() => StudentMark, (mark) => mark.studentGroup)
    marks!: StudentMark[]

    @OneToMany(() => StudentStatement, studStatement => studStatement.studentGroup)
    studentStatements!: StudentStatement[]

    @OneToMany(() => StudentGroupOrder, studGroupOrder => studGroupOrder.studentGroup)
    studentGroupOrders!: StudentGroupOrder[] 
}