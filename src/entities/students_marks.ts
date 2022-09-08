import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SubjectControl } from './plan_subject_control'
import { StudentGroup } from './students_groups'

@Entity({ name: 'education.students_marks' })
export class StudentMark {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({
        name: 'id_students_groups'
    })
    idStudentsGroups!: number

    @Column({
        name: 'id_subject_control'
    })
    idSubjectControl!: number

    @Column({
        name: 'ball_ects'
    })
    ballECTS!: string

    @Column({
        name: 'ball_100'
    })
    ball100!: number

    @Column({
        name: 'ball_5'
    })
    ball5!: number

    @Column({ name: 'id_user', nullable: true})
    idUser!: number

    @ManyToOne(() => StudentGroup, (studentGroup) => studentGroup.marks)
    @JoinColumn({ name: 'id_students_groups'})
    studentGroup!: StudentGroup   
    
    @ManyToOne(() => SubjectControl, (subjectControl) => subjectControl.marks)
    @JoinColumn({ name: 'id_subject_control'})
    subjectControl!: StudentGroup   
}