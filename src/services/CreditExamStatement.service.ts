import { DataSource } from 'typeorm'


export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number): Promise<void>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }

    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number | undefined) {

    }
}