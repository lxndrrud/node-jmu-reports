import { DataSource } from "typeorm";


export interface IStudentStatementRepo {

}

export class StudentStatementRepo implements IStudentStatementRepo {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }
}