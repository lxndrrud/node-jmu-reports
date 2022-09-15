import moment from "moment";
import { DataSource } from "typeorm";
import { Subject } from "../entities/plan_subjects";
import { SubjectsAcademicHour } from "../entities/plan_subjects_academic_hours";
import { SubjectsCreditUnit } from "../entities/plan_subjects_credit_units";
import { SubjectGroup } from "../entities/plan_subject_group";
import { SubjectResponse } from "../types/subject.type";


export interface ISubjectRepo {
    getSubjectInfo(idSubjectControl: number): Promise<SubjectResponse>
    getSubjectsForGroup(idGroup: number, semester: string, isUnion: boolean): Promise<Subject[]>
    checkCreditUnitsExistence(idSubjectGroup: number): Promise<boolean>
    checkAcademicHoursExistence(idSubjectGroup: number): Promise<boolean>
}

export class SubjectRepo implements ISubjectRepo {
    private connection

    constructor(
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
    }


    public async checkCreditUnitsExistence(idSubjectGroup: number) {
        const checkExist = await this.connection.createQueryBuilder(SubjectsCreditUnit, 'scu')
          .leftJoinAndSelect('scu.creditUnit', 'cu')
          .where('scu.idSubjectGroup = :idSubjectGroup', { idSubjectGroup })
          .andWhere("cu.name = 'экспертное'")
          .getOne()
        return !!checkExist
    }

    public async checkAcademicHoursExistence(idSubjectGroup: number) {
        const checkExist = await this.connection.createQueryBuilder(SubjectsAcademicHour, 'sah')
            .leftJoinAndSelect('sah.academicHour', 'ah')
            .where('sah.idSubjectGroup = :idSubjectGroup', { idSubjectGroup })
            .andWhere("ah.name = 'экспертное'")
            .getOne()
        return !!checkExist
    }

    public async getSubjectInfo(idSubjectControl: number) {
        const subjectGroup = await this.connection.createQueryBuilder(SubjectGroup, 'sg')
            .innerJoinAndSelect('sg.subjectControls', 'sc')
            .where('sc.id = :idSubjectControl', { idSubjectControl })
            .getOne()
        if (!subjectGroup) throw 'Информация по предмету не найдена'

        let query = this.connection.createQueryBuilder(Subject, 'subject')
            .innerJoinAndSelect('subject.subjectGroups', 'subjectGroup')
            .innerJoinAndSelect('subjectGroup.subjectControls', 'sc')
            .innerJoinAndSelect('sc.formControl', 'formControl')
            .leftJoinAndSelect('sc.person', 'person')
            .where('sc.id = :idSubjectControl', { idSubjectControl })

        if ((await this.checkAcademicHoursExistence(subjectGroup.id)))
            query
            .leftJoinAndSelect('subjectGroup.subjectsAcademicHours', 'sah')
            .leftJoinAndSelect('sah.academicHour', 'ah')
            .andWhere("ah.name = 'экспертное'")
        if ((await this.checkCreditUnitsExistence(subjectGroup.id)))
            query
            .leftJoinAndSelect('subjectGroup.subjectsCreditUnits', 'scu')
            .leftJoinAndSelect('scu.creditUnit', 'cu')
            .andWhere("cu.name = 'экспертное'")
        
        const result = await query.getOne()
        if (!result) throw 'Информация по предмету не найдена'
        return this.prepareSubject(result)
    }

    public async getSubjectsForGroup(idGroup: number, semester: string, isUnion: boolean) {
        const signOfExpression = isUnion ? '<=' : '=' 
        const subjects = await this.connection.createQueryBuilder(Subject, 'subj')
            .innerJoinAndSelect('subj.subjectGroup', 'subjG')
            .innerJoinAndSelect('subjG.subjectControl', 'sc')
            .innerJoinAndSelect('sc.formControl', 'fc')
            .innerJoin('subjG.group', 'g')
            .where('g.id = :idGroup', { idGroup })
            .andWhere(`sc.semester ${signOfExpression} :semester`, { semester })
            .orderBy('fc.name', 'ASC')
            .getMany()
        return subjects
    }

    private prepareSubject(subject: Subject) {
        return <SubjectResponse> {
            name: subject.name,
            semester: subject.subjectGroups[0].subjectControls[0].semester,
            creditUnits: subject.subjectGroups[0].subjectsCreditUnits
                ? subject.subjectGroups[0].subjectsCreditUnits[0].hour
                : ' ',
            hours: subject.subjectGroups[0].subjectsAcademicHours
                ? subject.subjectGroups[0].subjectsAcademicHours[0].hour
                : ' ',
            form_control_name: subject.subjectGroups[0].subjectControls[0].formControl.name,
            lecturer: subject.subjectGroups[0].subjectControls[0].person 
                ? subject.subjectGroups[0].subjectControls[0].person.lastname + ' '+
                subject.subjectGroups[0].subjectControls[0].person.firstname + ' '+
                subject.subjectGroups[0].subjectControls[0].person.middlename
                : ' ',
            date_exam: subject.subjectGroups[0].subjectControls[0].dateExam 
                ?  moment(subject.subjectGroups[0].subjectControls[0].dateExam).format('DD-MM-YYYY').toString() 
                : ' ',
            date_retake: subject.subjectGroups[0].subjectControls[0].dateRetake 
                ?  moment(subject.subjectGroups[0].subjectControls[0].dateRetake).format('DD-MM-YYYY').toString() 
                : ' '
        }
    }
}