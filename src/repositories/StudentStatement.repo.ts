import { DataSource } from "typeorm";
import { StudentStatement } from "../entities/students_statements";


export interface IStudentStatementRepo {
    countStatements(idStudentsGroups: number, idSubjectControl: number, idTypeStatement: number): Promise<number>
    saveStatement(idStudentsGroups: number, idSubjectControl: number, idTypeStatement: number, 
        path: string, idUser: number | null): Promise<void>
}

export class StudentStatementRepo implements IStudentStatementRepo {
    private connection
    private studentStatementRepo

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.studentStatementRepo = this.connection.getRepository(StudentStatement)
    }

    public async countStatements(idStudentsGroups: number, idSubjectControl: number, idTypeStatement: number) {
        return this.studentStatementRepo.count({
            where: {
                idStudentsGroups, idSubjectControl, idTypeStatement
            }
        })
    }

    public async saveStatement(idStudentsGroups: number, idSubjectControl: number, 
        idTypeStatement: number, path: string, idUser: number | null) {
    
        const checkExist = await this.studentStatementRepo.findOne({
            where: {
                idStudentsGroups, idSubjectControl, idTypeStatement
            }
        })

        if (!checkExist) {
            const newStatement = new StudentStatement()
            newStatement.idStudentsGroups = idStudentsGroups
            newStatement.idSubjectControl = idSubjectControl
            newStatement.idTypeStatement = idTypeStatement
            newStatement.path = path
            newStatement.idUser = idUser

            await this.studentStatementRepo.save(newStatement)
            return
        }

        checkExist.path = path
        checkExist.idUser = idUser
        await this.studentStatementRepo.save(checkExist)
    }
}