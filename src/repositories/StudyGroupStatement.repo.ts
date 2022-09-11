import { DataSource } from "typeorm";
import { StudyGroupStatement } from "../entities/study_group_statements";


export interface IStudyGroupStatementRepo {
    countStatements(idGroup: number, idSubjectControl: number, idTypeStatement: number): Promise<number>
    saveStatement(idGroup: number, idSubjectControl: number, idTypeStatement: number, path: string, idUser: number | null): Promise<void>
}

export class StudyGroupStatementRepo implements IStudyGroupStatementRepo {
    private connection
    private groupStatementRepo

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.groupStatementRepo = this.connection.getRepository(StudyGroupStatement)
    }

    public async countStatements(idGroup: number, idSubjectControl: number, idTypeStatement: number) {
        return this.groupStatementRepo.count({
            where: {
                idGroup, idSubjectControl, idTypeStatement
            }
        })
    }
    
    public async saveStatement(idGroup: number, idSubjectControl: number, 
        idTypeStatement: number, path: string, idUser: number | null) {
        const checkExist = await this.groupStatementRepo.findOne({
            where: {
                idGroup, idSubjectControl, idTypeStatement
            }
        })

        if (!checkExist) {
            const newStatement = new StudyGroupStatement()
            newStatement.idGroup = idGroup
            newStatement.idSubjectControl = idSubjectControl
            newStatement.idTypeStatement = idTypeStatement
            newStatement.path = path
            newStatement.idUser = idUser

            await this.groupStatementRepo.save(newStatement)
            return
        }

        checkExist.path = path
        checkExist.idUser = idUser
        await this.groupStatementRepo.save(checkExist)
    }
}