import moment from "moment";
import { DataSource } from "typeorm";
import { Subject } from "../entities/plan_subjects";
import { SubjectsAcademicHour } from "../entities/plan_subjects_academic_hours";
import { SubjectsCreditUnit } from "../entities/plan_subjects_credit_units";


export interface ISubjectRepo {
    getSubjectInfo(idSubjectControl: number): Promise<{
        name: string;
        semester: string;
        creditUnits: string | false;
        hours: string | false;
        form_control_name: string;
        lecturer: string;
        date_exam: string;
        date_retake: string;
    }>
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
          .andWhere("cu.name LIKE 'экспертное'")
          .getOne()

      return checkExist ? true: false
    }

    private async checkAcademicHoursExistence(idSubjectGroup: number) {
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

        const checkExist = await this.connection.createQueryBuilder(SubjectsAcademicHour, 'sah')
            .leftJoinAndSelect('sah.academicHour', 'ah')
            .where('sah.idSubjectGroup = :idSubjectGroup', { idSubjectGroup })
            .andWhere("ah.name LIKE 'экспертное'")
            .getOne()

      return checkExist ? true: false
    }

    public async getSubjectInfo(idSubjectControl: number) {
        let result = await this.connection.createQueryBuilder(Subject, 'subject')
            .innerJoinAndSelect('subject.subjectGroups', 'subjectGroup')
            .innerJoinAndSelect('subjectGroup.subjectControls', 'sc')
            .innerJoinAndSelect('subjectGroup.formControl', 'formControl')
            .leftJoinAndSelect('subjectGroup.subjectsAcademicHours', 'sah')
            .leftJoinAndSelect('sah.academicHour', 'ah')
            .leftJoinAndSelect('subjectGroup.subjectsCreditUnits', 'scu')
            .leftJoinAndSelect('scu.creditUnit', 'cu')
            .leftJoinAndSelect('sc.person', 'person')
            .where('sc.id = :idSubjectControl', { idSubjectControl })
            .andWhere("ah.name IS NULL || ah.name LIKE 'экспертное'")
            .andWhere("cu.name IS NULL || cu.name LIKE 'экспертное'")
            .getOne() as Subject
        return this.prepareSubject(result)
    }

    private prepareSubject(subject: Subject) {
        /* Format
        .select(
      's.name',
      'sc.semester',
      'scu.hour as creditUnits',
      'sah.hour as hours',
      'fc.name as form_control_name',
      'prs.firstname as lecturer_lastname',
      'prs.name as lecturer_firstname',
      'prs.lastname as lecturer_middlename',
      'sc.date_exam',
      'sc.date_retake',
    )
        */

        return {
            name: subject.name,
            semester: subject.subjectGroups[0].subjectControls[0].semester,
            creditUnits: subject.subjectGroups[0].subjectsCreditUnits.length > 0
                && subject.subjectGroups[0].subjectsCreditUnits[0].hour,
            hours: subject.subjectGroups[0].subjectsAcademicHours.length > 0
                && subject.subjectGroups[0].subjectsAcademicHours[0].hour,
            form_control_name: subject.subjectGroups[0].subjectControls[0].formControl.name,
            lecturer: subject.subjectGroups[0].subjectControls[0].person 
                ? subject.subjectGroups[0].subjectControls[0].person.lastname + ' '+
                subject.subjectGroups[0].subjectControls[0].person.firstname + ' '+
                subject.subjectGroups[0].subjectControls[0].person.middlename
                : '',
            date_exam: subject.subjectGroups[0].subjectControls[0].dateExam 
                ?  moment(subject.subjectGroups[0].subjectControls[0].dateExam).format('DD-MM-YYYY').toString() 
                : '',
            date_retake: subject.subjectGroups[0].subjectControls[0].dateRetake 
                ?  moment(subject.subjectGroups[0].subjectControls[0].dateRetake).format('DD-MM-YYYY').toString() 
                : ''
        }
    }
}