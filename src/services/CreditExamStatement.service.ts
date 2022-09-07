import { DataSource } from 'typeorm'
import { IStudentRepo } from '../repositories/Student.repo'


export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number): Promise<void>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private connection
    private studentRepo

    constructor(
        connectionInstance: DataSource,
        studentRepoInstance: IStudentRepo
    ) {
        this.connection = connectionInstance
        this.studentRepo = studentRepoInstance
    }

    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number | undefined) {

    }
}