import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { StudyGroup } from './study_groups'

@Entity({ name: 'education.specialties' })
export class Specialty {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    nickname!: string

    @Column({
        name: 'minid'
    })
    minId!: string

    @Column({
        name: 'abit_id',
        nullable: true
    })
    abitId!: number

    @OneToMany(() => StudyGroup, (group) => group.specialty)
    groups!: StudyGroup[] 
}