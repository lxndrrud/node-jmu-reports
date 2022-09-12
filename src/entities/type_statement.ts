import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { StudentStatement } from './students_statements'
import { StudyGroupStatement } from './study_group_statements'


@Entity({ name: 'education.type_statement' })
export class TypeStatement {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @OneToMany(() => StudyGroupStatement, groupStatement => groupStatement.typeStatement)
    groupStatements!: StudyGroupStatement[]

    @OneToMany(() => StudentStatement, studStatement => studStatement.typeStatement)
    studentStatements!: StudentStatement[]
}