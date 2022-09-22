import 'dotenv/config'
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
import { StudyGroupStatement } from './entities/study_group_statements'
import { TypeStatement } from './entities/type_statement'
import { StudentStatement } from './entities/students_statements'
import { Order } from './entities/orders'
import { StudentGroupOrder } from './entities/students_groups_orders'
import { TypeOrder } from './entities/type_orders'


export const DatabaseConnection = new DataSource(<DataSourceOptions>{
    type: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        // Education entities
        Student, StudentGroup, 
        StudyGroup, Specialty, SpecialtyProfile,  StudentMark,
        FormEducation, LevelEducation, StudyGroupStatement, StudentStatement, TypeStatement,
        Order, StudentGroupOrder, TypeOrder,
        // PLan
        Subject, FormControl, SubjectControl, SubjectGroup, AcademicHour, CreditUnit,
        SubjectsAcademicHour, SubjectsCreditUnit,
        // Pers entities
        Department, 
        Position, PersonsPosition, Person, TypePosition],
    synchronize: false,
    logging: false
})


export async function InitConnection() {
    return DatabaseConnection.initialize()
    .then(async () => {
        console.log('⚡️⚡️⚡️ Подключение к базе установлено ⚡️⚡️⚡️')
    })
    .catch((e) => {
        throw new Error(e)
    })
}
