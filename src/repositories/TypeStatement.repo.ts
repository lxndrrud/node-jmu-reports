import { DataSource } from "typeorm";
import { TypeStatement } from "../entities/type_statement";

export interface ITypeStatementRepo {
    getByName(name: string): Promise<TypeStatement | null>
}

export class TypeStatementRepo implements ITypeStatementRepo {
    private connection
    private typeStatementRepo

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.typeStatementRepo = this.connection.getRepository(TypeStatement)
    }

    public async getByName(name: string) {
        return this.typeStatementRepo.findOne({
            where: {
                name
            }
        })
    }
}