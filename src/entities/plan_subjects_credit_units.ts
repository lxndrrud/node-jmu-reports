import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { CreditUnit } from './plan_credit_units'
import { SubjectGroup } from './plan_subject_group'


@Entity({ name: 'education.plan_subjects_credit_units' })
export class SubjectsCreditUnit {
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

    @ManyToOne(() => CreditUnit, credUnit => credUnit.subjectCreditUnits)
    @JoinColumn({ name: 'id_creditUnit' })
    creditUnit!: CreditUnit
}