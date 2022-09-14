import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SubjectControl } from './plan_subject_control'
import { StudentGroup } from './students_groups'
import { TypeStatement } from './type_statement'

@Entity({ name: 'education.students_statements' })
export class StudentStatement {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    path!: string

    @Column({ name: 'date_crt' })
    dateCreated!: string

    @Column({ name: 'id_students_groups' })
    idStudentsGroups!: number

    @Column({ name: 'id_type_statement' })
    idTypeStatement!: number

    @Column({ type: 'int', name: 'id_subject_control', nullable: true, unsigned: true })
    idSubjectControl!: number | null

    @Column({ type: 'int', name: 'id_user', nullable: true, unsigned: true })
    idUser!: number | null

    @ManyToOne(() => StudentGroup, studGroup => studGroup.studentStatements)
    @JoinColumn({ name: 'id_students_groups' })
    studentGroup!: StudentGroup

    @ManyToOne(() => TypeStatement, typeStatement => typeStatement.studentStatements)
    @JoinColumn({ name: 'id_type_statement' })
    typeStatement!: TypeStatement

    @ManyToOne(() => SubjectControl, subjControl => subjControl.studentStatements)
    @JoinColumn({ name: 'id_subject_control' })
    subjectControl!: SubjectControl 
}