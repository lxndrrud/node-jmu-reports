import { DataSource } from "typeorm";
import { Student } from "../entities/students";
import { StudentGroup } from "../entities/students_groups";


export interface IStudentRepo {
    mainInfoByGroup(idGroup: number): Promise<Student[]>
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
        return this.connection.createQueryBuilder(Student, 'student')
            .innerJoinAndSelect('student.studentGroup', 'studentGroup')
            .where('studentGroup.idGroup = :idGroup', { idGroup })
            .andWhere('studentGroup.status = :status', {status: 0})
            .getMany()
    }
}