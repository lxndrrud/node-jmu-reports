import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { SpecialtyProfile } from './specialties_profile'
import { StudyGroup } from './study_groups'

@Entity({ name: 'education.specialties' })
export class Specialty {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({
        name: 'minid'
    })
    minId!: string

    @Column({
        name: 'abit_id',
        nullable: true
    })
    abitId!: number

    @OneToMany(() => SpecialtyProfile, (specProf) => specProf.specialty)
    specialtyProfiles!: SpecialtyProfile[]
}