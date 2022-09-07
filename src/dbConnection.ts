import { DataSource, DataSourceOptions } from 'typeorm'
import { Department } from './entities/departments'
import { FormEducation } from './entities/form_education'
import { LevelEducation } from './entities/level_education'
import { Person } from './entities/persons'
import { PersonsPosition } from './entities/persons_positions'
import { Position } from './entities/position'
import { Specialty } from './entities/specialties'
import { Student } from './entities/students'
import { StudentGroup } from './entities/students_groups'
import { StudyGroup } from './entities/study_groups'
import { TypePosition } from './entities/type_position'
import { StudentRepo } from './repositories/Student.repo'
import { GroupRepo } from './repositories/StudyGroup.repo'

export const DatabaseConnection = new DataSource(<DataSourceOptions>{
    type: 'postgres',
    host: "db-jmu",
    username: 'dbjmu',
    password: 'Afgihn215zxdg',
    database: 'jmu',
    entities: [
        // Education entities
        Student, StudentGroup, 
        StudyGroup, Specialty,
        FormEducation, LevelEducation,
        // Pers entities
        Department, 
        Position, PersonsPosition, Person, TypePosition],
    synchronize: false,
    logging: true
})


export function InitConnection() {
    DatabaseConnection.initialize()
    .then(async () => {
        const studentRepo = new StudentRepo(DatabaseConnection)
        console.log(await studentRepo.mainInfoByGroup(1))

        const groupRepo = new GroupRepo(DatabaseConnection)
        console.log(await groupRepo.getGroupInfo(1))

        console.log('Подключение к базе установлено')
    })
    .catch((e) => {
        throw new Error(e)
    })
}
