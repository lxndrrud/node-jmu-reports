import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { Person } from './persons'
import { FormControl } from './plan_form_control'
import { SubjectGroup } from './plan_subject_group'
import { StudentMark } from './students_marks'
import { StudyGroupStatement } from './study_group_statements'

@Entity({ name: 'education.plan_subjects_control' })
export class SubjectControl {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'id_subject_group' })
    idSubjectGroup!: number

    @Column({ name: 'id_form_control' })
    idFormControl!: number

    @Column({ nullable: true })
    idWorker!: number

    @Column()
    semester!: string

    @Column({ name: 'date_retake' })
    dateRetake!: string

    @Column({ name: 'date_exam' })
    dateExam!: string

    @OneToMany(() => StudentMark, (mark) => mark.subjectControl)
    marks!: StudentMark[]

    @ManyToOne(() => FormControl, (formControl) => formControl)
    @JoinColumn({ name: 'id_form_control' })
    formControl!: FormControl

    @ManyToOne(() => SubjectGroup, subjGroup => subjGroup.subjectControls)
    @JoinColumn({ name: 'id_subject_group' })
    subjectGroup!: SubjectGroup

    @ManyToOne(() => Person, (person) => person.subjectControls)
    @JoinColumn({ name: 'idWorker' })
    person!: Person

    @OneToMany(() => StudyGroupStatement, groupStatement => groupStatement.subjectControl)
    groupStatements!: StudyGroupStatement[] 
}