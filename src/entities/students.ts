import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'
import { StudentGroup } from './students_groups'


@Entity({ 
    name: 'education.students', 
    orderBy: {
        lastname: 'ASC', firstname: 'ASC', middlename: 'ASC' 
    } 
})
export class Student {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    firstname!: string

    @Column()
    middlename!: string

    @Column()
    lastname!: string

    @OneToMany(() => StudentGroup, (studentGroup) => studentGroup.student)
    studentGroup!: StudentGroup[]
}