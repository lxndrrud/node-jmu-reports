import { DataSource } from "typeorm";
import { Subject } from "../entities/plan_subjects";
import { SubjectsCreditUnit } from "../entities/plan_subjects_credit_units";


export interface ISubjectRepo {

}

export class SubjectRepo implements ISubjectRepo {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }


    private async checkCreditUnitsExistence(idSubjectGroup: number) {
        /* WAS 
        const checkExist = await education('plan_subjects_credit_units')
        .where('id_subject_group', idSubjectControl)
        .leftJoin(
          'plan_credit_units',
          'plan_credit_units.id',
          'plan_subjects_credit_units.id_creditUnits',
        )
        .andWhere('name', 'like', 'экспертное')
        .first();
      if (checkExist) builder.andWhere('cu.name', 'like', 'экспертное');
      */

        const checkExist = await this.connection.createQueryBuilder(SubjectsCreditUnit, 'scu')
            .leftJoinAndSelect('scu.creditUnit', 'cu')
            .where('scu.idSubjectGroup = :idSubjectGroup', { idSubjectGroup })
            .andWhere('scu.id')
            .getOne()

      return checkExist ? true: false
    }

    public async getSubjectInfo(idSubjectControl: number) {
        return this.connection.createQueryBuilder(Subject, 'subject')
            .innerJoinAndSelect('subject.subjectGroups', 'subjectGroup')
            .innerJoinAndSelect('subjectGroup.formControl', 'formControl')
            .innerJoinAndSelect('subjectGroup.subjectsAcademicHours', 'sah')
            .innerJoinAndSelect('sah.academicHour', 'ah')
            .innerJoinAndSelect('subjectGroup.subjectsCreditUnits', 'scu')
            .innerJoinAndSelect('scu.creditUnit', 'cu')
            .leftJoinAndSelect('sc.person', 'p')
    }

}