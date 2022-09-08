import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { AcademicHour } from './plan_academic_hours'
import { SubjectGroup } from './plan_subject_group'


@Entity({ name: 'education.plan_subjects_academic_hours' })
export class SubjectsAcademicHour {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'id_subject_group' })
    idSubjectGroup!: number

    @Column({ name: 'id_academicHours' })
    idAcademicHours!: number

    @Column()
    hour!: string

    @ManyToOne(() => SubjectGroup, subjectGroup =>  subjectGroup.subject) 
    @JoinColumn({ name: 'id_subject_group' })
    subjectGroup!: SubjectGroup

    @ManyToOne(() => AcademicHour, acadHour => acadHour.subjectAcademicHours)
    @JoinColumn({ name: 'id_academicHours' })
    academicHour!: AcademicHour
}