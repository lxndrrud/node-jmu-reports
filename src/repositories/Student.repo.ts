import { DataSource } from "typeorm";
import { Student } from "../entities/students";
import { StudentGroup } from "../entities/students_groups";
import { StudentInfoResponse } from "../types/student.type";
import { StudentMarkResponse } from "../types/studentMark.type";


export interface IStudentRepo {
    getMainInfoByGroup(idGroup: number): Promise<StudentMarkResponse[]>
    getStudentInfo(idStudent: number, idGroup: number, status: string | null): Promise<StudentInfoResponse>
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

    public async getMainInfoByGroup(idGroup: number) {
        let students = await this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idGroup = :idGroup', { idGroup })
            .andWhere('studentGroup.status = :status', {status: 0})
            .getMany()

        return this.prepareStudentsMarks(students)
    }

    public async getStudentInfo(idStudent: number, idGroup: number, status: string | null) {
        let query = this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idStudent = :idStudent', { idStudent })
            .andWhere('studentGroup.idGroup = :idGroup', { idGroup })
        if (status) query.andWhere('studentGroup.status = :status', { status })

        let student = await query.getOne() as Student
        if (!student) throw 'Информация по студенту не найдена'
        return this.prepareStudentInfo(student)
    }

    private prepareStudentInfo(student: Student) {
        return <StudentInfoResponse> {
            id_students_groups: student.studentGroup[0].id,
            firstname: student.firstname,
            middlename: student.middlename,
            lastname: student.lastname,
            record_book: student.studentGroup[0].recordBook
        }
    }

    private prepareStudentsMarks(students: Student[]) {
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