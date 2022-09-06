
export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number): Promise<void>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number | undefined) {

    }
}