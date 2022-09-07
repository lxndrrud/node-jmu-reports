import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Student } from './students'
import { StudyGroup } from './study_groups'


@Entity({ name: 'education.students_groups' })
export class StudentGroup {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'record_book'
    })
    recordBook!: string

    @Column({
        name: 'id_group'
    })
    idGroup!: number

    @Column({
        name: 'id_student'
    })
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
}