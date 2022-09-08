import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SubjectControl } from './plan_subject_control'

@Entity({ name: 'education.plan_form_control'})
export class FormControl {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => SubjectControl, (subjectControl) => subjectControl.formControl)
    subjectControls!: SubjectControl[] 
}