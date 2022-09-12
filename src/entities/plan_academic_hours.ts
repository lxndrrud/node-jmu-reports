import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SubjectsAcademicHour } from './plan_subjects_academic_hours'

@Entity({ name: 'education.plan_academic_hours'})
export class AcademicHour {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => SubjectsAcademicHour, (subjAcadHour) => subjAcadHour.academicHour)
    subjectAcademicHours!: SubjectsAcademicHour[] 
}