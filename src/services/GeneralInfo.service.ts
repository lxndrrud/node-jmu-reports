import { TypeStatement } from "../entities/type_statement";
import { ITypeStatementRepo } from "../repositories/TypeStatement.repo";


export interface IGeneralInfoService {
    getAllStatementTypes(): Promise<TypeStatement[]>
}

export class GeneralInfoService {
    private typeStatementRepo

    constructor(
        typeStatementRepoInstance: ITypeStatementRepo
    ) {
        this.typeStatementRepo = typeStatementRepoInstance
    }

    public async getAllStatementTypes() {
        const types = await this.typeStatementRepo.getAll()
        return types
    }
}