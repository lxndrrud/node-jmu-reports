import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { StudyGroup } from './study_groups'

@Entity({ name: 'education.level_education' })
export class LevelEducation {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({
        name: 'abit_id',
        nullable: true
    })
    abitId!: number

    @OneToMany(() => StudyGroup, (group) => group.levelEducation)
    groups!: StudyGroup[] 

}