import { DataSource } from "typeorm";


export interface IStudyGroupStatementRepo {

}

export class StudyGroupStatementRepo implements IStudyGroupStatementRepo {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }
}