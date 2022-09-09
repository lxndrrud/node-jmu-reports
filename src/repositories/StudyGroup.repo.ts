import { DataSource } from "typeorm";
import { StudyGroup } from "../entities/study_groups";


export interface IGroupRepo {
    getGroupInfoWithDirector(idGroup: number): Promise<{
        nickname: string;
        course: string;
        specialty_code: string;
        level_education_name: string;
        form_education_name: string;
        date_start: string;
        department_name: string;
        director: string;
    }>
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
        let result = await  this.connection.createQueryBuilder(StudyGroup, 'group')
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

        return {
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