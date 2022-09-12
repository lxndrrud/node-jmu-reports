import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SubjectGroup } from './plan_subject_group'


@Entity({ name: 'education.plan_subjects' })
export class Subject {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => SubjectGroup, subjectGroup =>  subjectGroup.subject) 
    subjectGroups!: SubjectGroup[]
}