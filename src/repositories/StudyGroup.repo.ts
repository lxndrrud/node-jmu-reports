import { DataSource } from "typeorm";
import { StudyGroup } from "../entities/study_groups";
import { StudentGroup } from "../entities/students_groups";


export interface IGroupRepo {

}

export class GroupRepo implements IGroupRepo {
    private connection
    private groupRepo

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.groupRepo = this.connection.getRepository(StudyGroup)
    }

    public async getGroupInfo(idGroup: number) {
        return this.connection.createQueryBuilder(StudyGroup, 'group')
            .innerJoinAndSelect('group.levelEducation', 'level')
            .innerJoinAndSelect('group.formEducation', 'form')
            .innerJoinAndSelect('group.department', 'department')
            .innerJoinAndSelect('group.specialty', 'specialty')
            .where('group.id = :idGroup', { idGroup })
            .getOne()
    }
}