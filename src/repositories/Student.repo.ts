import { Brackets, DataSource } from "typeorm";
import { Order } from "../entities/orders";
import { Student } from "../entities/students";
import { StudentGroup } from "../entities/students_groups";
import { StudentInfoResponse } from "../types/student.type";
import { StudentMarkResponse } from "../types/studentMark.type";


export interface IStudentRepo {
    getStudentsByGroup(idGroup: number, status?: number): Promise<Student[]>
    getMainInfoByGroup(idGroup: number): Promise<StudentMarkResponse[]>
    getStudentInfo(idStudent: number, idGroup: number, status?: number): Promise<StudentInfoResponse>
    getBasisLearning(idStudentGroup: number): Promise<"Бюджет" | "Контракт" | "Не определено">
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
        const students = await this.getStudentsByGroup(idGroup, 0)
        return this.prepareStudentsMarks(students)
    }

    public async getStudentsByGroup(idGroup: number, status?: number) {
        let studentsQuery = this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idGroup = :idGroup', { idGroup })
        if (status) studentsQuery.andWhere('studentGroup.status = :status', { status: 0})

        const students = await studentsQuery.getMany()
        return students
    }

    public async getBasisLearning(idStudentGroup: number) {
        const basisLearning = await this.connection.createQueryBuilder(Order, 'o')
            .innerJoinAndSelect('o.typeOrder', 'to')
            .innerJoinAndSelect('o.studentGroupOrders', 'sgo')
            .innerJoinAndSelect('sgo.studentGroup', 'sg')
            .where('sg.id = :idStudentGroup', { idStudentGroup })
            .andWhere(new Brackets(qb => {
                qb.where('to.id = 12').orWhere('to.id = 1').orWhere('to.id = 3').orWhere('to.id = 2')
            }))
            .orderBy('sgo.id', 'DESC')
            .getOne()

        if (basisLearning && (basisLearning.idTypeOrder === 1 || basisLearning.idTypeOrder === 2)) {
            return 'Бюджет'
        } else if (basisLearning && (basisLearning.idTypeOrder === 3 || basisLearning.idTypeOrder === 12)) {
            return 'Контракт'
        } else {
            return 'Не определено'
        }
    }

    public async getStudentInfo(idStudent: number, idGroup: number, status?: number) {
        let query = this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idStudent = :idStudent', { idStudent })
            .andWhere('studentGroup.idGroup = :idGroup', { idGroup })
        if (status) query.andWhere('studentGroup.status = :status', { status })

        let student = await query.getOne()
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