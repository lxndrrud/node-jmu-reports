import { Brackets, DataSource, QueryBuilder } from "typeorm";
import { Person } from "../entities/persons";
import { StudyGroup } from "../entities/study_groups";
import { GroupResponse } from "../types/group.type";


export interface IGroupRepo {
    getGroupInfoWithDirector(idGroup: number): Promise<GroupResponse>
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

    private async checkMainPersonOnDepartment(idGroup: number) {
        const check = await this.connection.createQueryBuilder(Person, 'person')
            .leftJoinAndSelect('person.personsPosition', 'personsPosition')
            .leftJoinAndSelect('personsPosition.position', 'position')
            .leftJoinAndSelect('position.typePosition', 'typePosition')
            .leftJoinAndSelect('position.department', 'department')
            .leftJoinAndSelect('department.groups', 'group')
            .where('group.id = :idGroup', { idGroup })
            .andWhere(new Brackets(builder => {
                builder
                    .where(`typePosition.name_position = 'Декан'`)
                    .orWhere(`typePosition.name_position = 'Директор'`)
            }))
            .getOne()

        return !!check
    }

    public async getGroupInfoWithDirector(idGroup: number) {
        let result = await  this.connection.createQueryBuilder(StudyGroup, 'group')
            .innerJoinAndSelect('group.levelEducation', 'level')
            .innerJoinAndSelect('group.formEducation', 'form')
            .innerJoinAndSelect('group.specialtyProfile', 'profile')
            .innerJoinAndSelect('profile.specialty', 'specialty')
            .leftJoinAndSelect('group.department', 'department')
            .leftJoinAndSelect('department.positions', 'position')
            .leftJoinAndSelect('position.typePosition', 'typePosition')
            .leftJoinAndSelect('position.personsPosition', 'personsPosition')
            .leftJoinAndSelect('personsPosition.person', 'person')
            .where('group.id = :idGroup', { idGroup })
            .andWhere(new Brackets(async builder => {
                (await this.checkMainPersonOnDepartment(idGroup))
                &&
                builder
                    .where(`typePosition.name_position = 'Декан'`)
                    .orWhere(`typePosition.name_position = 'Директор'`)
            }))
            .getOne() as StudyGroup

        return this.prepareGroup(result)
    }

    private prepareGroup(group: StudyGroup) {
        /* format
.select(
        'g.nickname',
        'g.course',
        'sp.minid as specialty_code',
        'sp.name as specialty_name',
        'le.name as level_education_name',
        'fe.name as form_education_name',
        'g.date_start',
        'd.name_department as department_name',
        'prs.firstname as director_lastname',
        'prs.name as director_firstname',
        'prs.lastname as director_middlename',
      )

        */

        return <GroupResponse>{
            nickname: group.nickname,
            course: group.course,
            specialty_code: group.specialtyProfile.specialty.minId,
            level_education_name: group.levelEducation.name,
            form_education_name: group.formEducation.name,
            date_start: group.dateStart,
            department_name: group.department.name,
            director: group.department.positions[0]?.personsPosition.person 
                ?
                group.department.positions[0]?.personsPosition.person.lastname + ' ' +
                group.department.positions[0]?.personsPosition.person.firstname + ' ' +
                group.department.positions[0]?.personsPosition.person.middlename
                : ''
        }
    }
}