import { DataSource, SelectQueryBuilder } from "typeorm";
import { StudyGroup } from "../entities/study_groups";
import { StudentGroup } from "../entities/students_groups";


export interface IGroupRepo {
    getGroupInfoWithDirector(idGroup: number): Promise<StudyGroup | null>
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

    public async getGroupInfoWithDirector(idGroup: number) {
        return this.connection.createQueryBuilder(StudyGroup, 'group')
            .innerJoinAndSelect('group.levelEducation', 'level')
            .innerJoinAndSelect('group.formEducation', 'form')
            .innerJoinAndSelect('group.specialty', 'specialty')
            .leftJoinAndSelect('group.department', 'department')
            .leftJoinAndSelect('department.positions', 'position')
            .leftJoinAndSelect('position.typePosition', 'typePosition')
            .leftJoinAndSelect('position.personsPosition', 'personsPosition')
            .leftJoinAndSelect('personsPosition.person', 'person')
            .where('group.id = :idGroup', { idGroup })
            .andWhere(`typePosition.name_position = 'Декан' OR typePosition.name_position = 'Директор'`)
            .getOne()
    }
}