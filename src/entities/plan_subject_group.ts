import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { Subject } from './plan_subjects'
import { SubjectsAcademicHour } from './plan_subjects_academic_hours'
import { SubjectsCreditUnit } from './plan_subjects_credit_units'
import { SubjectControl } from './plan_subject_control'
import { StudyGroup } from './study_groups'

@Entity({ name: 'education.plan_subject_group' })
export class SubjectGroup {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'ministryCode', nullable: true })
    ministryCode!: string

    @Column({ name: 'countInPlan', nullable: true })
    countInPlan!: string

    @Column({ name: 'id_cathedra' })
    idCathedra!: number

    @Column({ name: 'id_group' })
    idGroup!: number

    @Column({ name: 'hours_in_credit_units', nullable: true })
    hoursInCreditUnits!: string

    @ManyToOne(() => StudyGroup, (group) => group.subjectGroups)
    @JoinColumn({ name: 'id_group' })
    group!: StudyGroup

    @ManyToOne(() => Subject, subject => subject.subjectGroups)
    @JoinColumn({ name: 'id_subject' })
    subject!: Subject

    @OneToMany(() => SubjectsAcademicHour, subjAcadHour => subjAcadHour.subjectGroup)
    subjectsAcademicHours!: SubjectsAcademicHour[]

    @OneToMany(() => SubjectsCreditUnit, subjCreditUnits => subjCreditUnits.subjectGroup)
    subjectsCreditUnits!: SubjectsCreditUnit[]

    @OneToMany(() => SubjectControl, subjControl => subjControl.subjectGroup)
    subjectControls!: SubjectControl
}