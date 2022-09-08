import { DataSource, DataSourceOptions } from 'typeorm'
import { Department } from './entities/departments'
import { FormEducation } from './entities/form_education'
import { LevelEducation } from './entities/level_education'
import { Person } from './entities/persons'
import { PersonsPosition } from './entities/persons_positions'
import { AcademicHour } from './entities/plan_academic_hours'
import { CreditUnit } from './entities/plan_credit_units'
import { FormControl } from './entities/plan_form_control'
import { Subject } from './entities/plan_subjects'
import { SubjectsAcademicHour } from './entities/plan_subjects_academic_hours'
import { SubjectsCreditUnit } from './entities/plan_subjects_credit_units'
import { SubjectControl } from './entities/plan_subject_control'
import { SubjectGroup } from './entities/plan_subject_group'
import { Position } from './entities/position'
import { Specialty } from './entities/specialties'
import { SpecialtyProfile } from './entities/specialties_profile'
import { Student } from './entities/students'
import { StudentGroup } from './entities/students_groups'
import { StudentMark } from './entities/students_marks'
import { StudyGroup } from './entities/study_groups'
import { TypePosition } from './entities/type_position'
import { StudentRepo } from './repositories/Student.repo'
import { MarksRepo } from './repositories/StudentMarks.repo'
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
        StudyGroup, Specialty, SpecialtyProfile,  StudentMark,
        FormEducation, LevelEducation,
        // PLan
        Subject, FormControl, SubjectControl, SubjectGroup, AcademicHour, CreditUnit,
        SubjectsAcademicHour, SubjectsCreditUnit,
        // Pers entities
        Department, 
        Position, PersonsPosition, Person, TypePosition],
    synchronize: false,
    logging: true
})


export function InitConnection() {
    DatabaseConnection.initialize()
    .then(async () => {
        console.log('⚡️⚡️⚡️ Подключение к базе установлено ⚡️⚡️⚡️')

        const studentRepo = new StudentRepo(DatabaseConnection)
        console.log(await studentRepo.mainInfoByGroup(1))

        const groupRepo = new GroupRepo(DatabaseConnection)
        console.log((await groupRepo.getGroupInfoWithDirector(1))
            )

        const marksRepo = new MarksRepo(DatabaseConnection)
        console.log(await DatabaseConnection.getRepository(StudentMark).find())
        console.log(await marksRepo.getMarksForGroup(1, 1))
    })
    .catch((e) => {
        throw new Error(e)
    })
}
