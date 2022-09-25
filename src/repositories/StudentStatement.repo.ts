import { DataSource, IsNull } from "typeorm";
import { StudentStatement } from "../entities/students_statements";


export interface IStudentStatementRepo {
    countStatements(idStudentsGroups: number, idSubjectControl: number | null, idTypeStatement: number): Promise<number>
    saveStatement(idStudentsGroups: number, idSubjectControl: number | null, idTypeStatement: number, path: string, 
        idUser: number | null): Promise<void>
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

    public async countStatements(idStudentsGroups: number, idSubjectControl: number | null, idTypeStatement: number) {
        return this.studentStatementRepo.count({
            where: {
                idStudentsGroups, 
                idTypeStatement,
                idSubjectControl: idSubjectControl ? idSubjectControl: IsNull()
            }
        })
    }

    public async saveUpdateStatement(idStudentsGroups: number, idSubjectControl: number | null, 
        idTypeStatement: number, path: string, idUser: number | null) {
    
        const checkExist = await this.studentStatementRepo.findOne({
            where: {
                idStudentsGroups, 
                idTypeStatement,
                idSubjectControl: idSubjectControl 
                     ? idSubjectControl
                     : IsNull()
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

    public async saveStatement(idStudentsGroups: number, idSubjectControl: number | null, 
        idTypeStatement: number, path: string, idUser: number | null) {
            
        const newStatement = new StudentStatement()
        newStatement.idStudentsGroups = idStudentsGroups
        newStatement.idSubjectControl = idSubjectControl
        newStatement.idTypeStatement = idTypeStatement
        newStatement.path = path
        newStatement.idUser = idUser

        await this.studentStatementRepo.save(newStatement)
    }
}