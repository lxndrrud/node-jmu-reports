import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SubjectsCreditUnit } from './plan_subjects_credit_units'

@Entity({ name: 'education.plan_credit_units'})
export class CreditUnit {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => SubjectsCreditUnit, (subjCredUnit) => subjCredUnit.creditUnit)
    subjectCreditUnits!: SubjectsCreditUnit[] 
}