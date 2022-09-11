import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SubjectControl } from './plan_subject_control'
import { StudyGroup } from './study_groups'
import { TypeStatement } from './type_statement'


@Entity({ name: "education.study_group_statements" })
export class StudyGroupStatement {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'id_group' })
    idGroup!: number

    @Column({ name: 'id_type_statement' })
    idTypeStatement!: number 

    @Column({ name: 'id_subject_control' , nullable: true })
    idSubjectControl!: number

    @Column({ type: 'int', name: 'id_user', nullable: true, unsigned: true })
    idUser!: number | null

    @Column()
    path!: string

    @Column({ nullable: true })
    semester!: string

    @Column({ name: 'date_crt' })
    dateCreated!: string

    @ManyToOne(() => StudyGroup, group => group.groupStatements)
    @JoinColumn({ name: 'id_group' })
    group!: StudyGroup

    @ManyToOne(() => TypeStatement, typeStatement => typeStatement.groupStatements)
    @JoinColumn({ name: 'id_type_statement' })
    typeStatement!: TypeStatement

    @ManyToOne(() => SubjectControl, subjectControl => subjectControl.groupStatements, { nullable:true })
    @JoinColumn({ name: 'id_subject_control' })
    subjectControl!: SubjectControl 
}