import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Specialty } from './specialties'
import { StudyGroup } from './study_groups'

@Entity({ name: 'education.specialty_profile' })
export class SpecialtyProfile {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'id_specialty', nullable: true })
    idSpecialty!: number

    @Column()
    name!: string

    @Column({ nullable: true })
    nickname!: string

    @Column({ name: 'study_period', nullable: true })
    studyPeriod!: string

    @Column({ name: 'created_at', nullable: true })
    createdAt!: string

    @OneToMany(() => StudyGroup, (group) => group.specialtyProfile)
    groups!: StudyGroup[] 

    @ManyToOne(() => Specialty, (spec) => spec.specialtyProfiles)
    @JoinColumn({ name: 'id_specialty' })
    specialty!: Specialty
}