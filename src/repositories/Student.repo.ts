import { DataSource } from "typeorm";
import { Student } from "../entities/students";
import { StudentGroup } from "../entities/students_groups";
import { StudentMarkResponse } from "../types/studentMark.type";


export interface IStudentRepo {
    mainInfoByGroup(idGroup: number): Promise<StudentMarkResponse[]>
}

export class StudentRepo implements IStudentRepo {
    private connection
    private studentRepo
    private studentGroupRepo

    constructor( 
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.studentRepo = this.connection.getRepository(Student)
        this.studentGroupRepo = this.connection.getRepository(StudentGroup)
    }

    public async mainInfoByGroup(idGroup: number) {
        let students = await this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idGroup = :idGroup', { idGroup })
            .andWhere('studentGroup.status = :status', {status: 0})
            .getMany()

        return this.prepareStudents(students)
    }

    private prepareStudents(students: Student[]) {
        let result: StudentMarkResponse[] = []

        for (let student of students) { 
            result.push({
                id_students_groups: student.studentGroup[0].id, 
                firstname: student.firstname,
                middlename: student.middlename,
                lastname: student.lastname,
                id_mark: null,
                ball_5: null,
                ball_100: null,
                ball_ects: null 
            })
        }
        return result
    }
}