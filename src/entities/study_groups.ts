import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Department } from './departments'
import { FormEducation } from './form_education'
import { LevelEducation } from './level_education'
import { Specialty } from './specialties'
import { StudentGroup } from './students_groups'


@Entity({ name: 'education.study_groups' })
export class StudyGroup {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    nickname!: string

    @Column()
    course!: string

    @Column({
        name: 'id_form'
    })
    idForm!: number

    @Column({
        name: 'id_level'
    })
    idLevel!: number

    @Column({
        name: 'id_faculty'
    })
    idDepartment!: number

    @Column({
        name: 'id_specialty'
    })
    idSpecialty!: number

    @Column({
        name: 'date_start'
    })
    dateStart!: string

    @OneToMany(() => StudentGroup, (studentGroup) => studentGroup.group)
    studentGroup!: StudentGroup[]

    @ManyToOne(() => Department, (department) => department.groups)
    @JoinColumn({ name: 'id_faculty' })
    department!: Department

    @ManyToOne(() => FormEducation, (form) => form.groups)
    @JoinColumn({ name: 'id_form' })
    formEducation!: FormEducation

    @ManyToOne(() => LevelEducation, (level) => level.groups)
    @JoinColumn({ name: 'id_level' })
    levelEducation!: LevelEducation

    @ManyToOne(() => Specialty, (spec) => spec.groups)
    @JoinColumn({ name: 'id_specialty' })
    specialty!: Specialty
}