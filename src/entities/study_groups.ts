import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Department } from './departments'
import { FormEducation } from './form_education'
import { LevelEducation } from './level_education'
import { SubjectGroup } from './plan_subject_group'
import { Specialty } from './specialties'
import { SpecialtyProfile } from './specialties_profile'
import { StudentGroup } from './students_groups'
import { StudyGroupStatement } from './study_group_statements'


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
        name: 'id_profile'
    })
    idProfile!: number

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

    @ManyToOne(() => SpecialtyProfile, (specProf) => specProf.groups)
    @JoinColumn({ name: 'id_profile' })
    specialtyProfile!: SpecialtyProfile

    @OneToMany(() => SubjectGroup, subjGroup => subjGroup.group) 
    subjectGroups!: SubjectGroup[]

    @OneToMany(() => StudyGroupStatement, groupStatement => groupStatement.group)
    groupStatements!: StudyGroupStatement[]
}