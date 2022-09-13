import { DataSource } from "typeorm";
import { SubjectControl } from "../entities/plan_subject_control";
import { StudentGroup } from "../entities/students_groups";
import { BallECTS, MarkWithSubjectResponse, StudentMarkResponse } from "../types/studentMark.type";
import { ISubjectRepo } from "./Subject.repo";


export interface IMarksRepo {
    getMarksForGroup(idGroup: number, idSubjectControl: number): Promise<StudentMarkResponse[]>
    getMarksForStudent(idStudent: number, idGroup: number, semester: string, isExam: boolean): 
    Promise<MarkWithSubjectResponse[]>
    fillMarkInfo(students: StudentMarkResponse[], marks: StudentMarkResponse[]): StudentMarkResponse[]
}

export class MarksRepo implements IMarksRepo {
    private connection
    private subjectRepo

    constructor(
        connectionInstance: DataSource,
        subjectRepoInstance: ISubjectRepo
    ) {
        this.connection = connectionInstance,
        this.subjectRepo = subjectRepoInstance
    }

    public async getMarksForGroup(idGroup: number, idSubjectControl: number) {
        const idsStudentGroups = await this.connection.getRepository(StudentGroup).find({
            select: {
                id: true
            },
            where: {
                idGroup: idGroup
            }
        })

        let marks = await  this.connection.createQueryBuilder(StudentGroup, 'sg')
            .innerJoinAndSelect('sg.student', 's')
            .leftJoinAndSelect('sg.marks', 'm')
            //.whereInIds(idsStudentGroups)
            .where('sg.id IN (:...idsStudentGroups)', { idsStudentGroups: idsStudentGroups.map(item => item.id) })
            .andWhere('m.id_subject_control = :idSubjectControl', { idSubjectControl })
            .andWhere('sg.status = :status', { status: 0 })
            .getMany()

        return this.prepareMarks(marks)
    }

    public async getMarksForStudent(idStudent: number, idGroup: number, semester: string, isExam: boolean) {
        /*
let resultList = await trx('plan_subjects_control as sc')
    .select(
      'sc.id as id_subject_control',
      'sub.name as subject_name',
      'scu.hour as creditUnits',
      'sah.hour as hours',
      'fc.name as form_control_name',
      'prs.firstname as lecturer_lastname',
      'prs.name as lecturer_firstname',
      'prs.lastname as lecturer_middlename',
      'sc.date_exam',
    )
    .join('plan_subjects_group as sep', 'sep.id', 'sc.id_subject_group')
    .join('plan_subjects as sub', 'sub.id', 'sep.id_subject')

    .join('plan_subjects_academic_hours as sah', 'sah.id_subject_group', 'sep.id')
    .join('plan_subjects_credit_units as scu', 'scu.id_subject_group', 'sep.id')
    .join('plan_academic_hours as ah', 'ah.id', 'sah.id_academicHours')
    .join('plan_credit_units as cu', 'cu.id', 'scu.id_creditUnits')

    .join('plan_form_control as fc', 'fc.id', 'sc.id_form_control')

    .join('plan as ep', 'ep.id', 'sep.id_plan')
    .join('specialties as sp', 'sp.id', 'ep.id_specialty')
    .join('study_groups as g', 'g.id_specialty', 'sp.id')
    .leftJoin('pers.Persons as prs', 'prs.id', 'sc.idWorker')

    .where('g.id', idGroup)
    .andWhere('fc.name', 'ilike', exam)
    .andWhere('sc.semester', semester)
    .andWhere('ah.name', 'like', '%экспертное%')
    .andWhere('cu.name', 'like', '%экспертное%');
        */

        let marksList = await this.connection.createQueryBuilder(SubjectControl, 'sc')
            .innerJoinAndSelect('sc.subjectGroup', 'subjG')
            .innerJoinAndSelect('subjG.subject', 'sub')
            .innerJoinAndSelect('sc.formControl', 'fc')
            .innerJoinAndSelect('subjG.group', 'g')
            .innerJoinAndSelect('g.studentGroup', 'studG')
            .innerJoinAndSelect('g.specialtyProfile', 'specProf')
            .innerJoinAndSelect('specProf.specialty', 'spec')
            // Надо сделать их условными
            .leftJoinAndSelect('subjG.subjectsAcademicHours', 'sah')
            .leftJoinAndSelect('subjG.subjectsCreditUnits', 'scu')
            .leftJoinAndSelect('sah.academicHour', 'ah')
            .leftJoinAndSelect('scu.creditUnit', 'cu')
            // -- 
            .leftJoinAndSelect('sc.person', 'person')
            .leftJoinAndSelect('sc.marks', 'mark')
            .where('studG.idGroup = :idGroup', { idGroup })
            .andWhere('studG.idStudent = :idStudent', { idStudent })
            .andWhere("fc.name LIKE 'экзамен'")
            .andWhere("sc.semester = :semester", { semester })
            // И их
            .andWhere("ah.name LIKE 'экспертное'")
            .andWhere("cu.name LIKE 'экспертное'")
            //
            .getMany()

        console.log(marksList)

        return this.prepareMarksWithSubject(marksList)
    }

    private unbalancing(key: 'A' | 'B' | 'C' | 'D' | 'E' | 'FX' | 'F') {
        const marksMap = {
            A: 'отлично',
            B: 'хорошо',
            C: 'хорошо',
            D: 'удовлетворительно',
            E: 'удовлетворительно',
            FX: 'неудовлетворительно',
            F: 'неудовлетворительно',
        };
        return marksMap[key]
    }

    private prepareMarksWithSubject(subjectControls: SubjectControl[]) {
        let result: MarkWithSubjectResponse[] = []
        for (let sc of subjectControls) {
            /*
.select(
      'sc.id as id_subject_control',
      'sub.name as subject_name',
      'scu.hour as creditUnits',
      'sah.hour as hours',
      'fc.name as form_control_name',
      'prs.firstname as lecturer_lastname',
      'prs.name as lecturer_firstname',
      'prs.lastname as lecturer_middlename',
      'sc.date_exam',
    )
            */
            result.push(<MarkWithSubjectResponse>{
                id_subject_control: sc.id,
                subject_name: sc.subjectGroup.subject.name,
                creditUnits: sc.subjectGroup.subjectsCreditUnits[0]
                    ? sc.subjectGroup.subjectsCreditUnits[0].hour
                    : " ",
                hours: sc.subjectGroup.subjectsAcademicHours[0]
                    ? sc.subjectGroup.subjectsAcademicHours[0].hour
                    : ' ',
                form_control_name: sc.formControl.name,
                lecturer: sc.person 
                    ? sc.person.lastname + ' ' + sc.person.firstname + ' ' + sc.person.middlename
                    : '',
                date_exam: sc.dateExam,
                ball_5: sc.marks[0] 
                    ? this.unbalancing(sc.marks[0].ballECTS as BallECTS)
                    : ' ',
                ball_100: sc.marks[0] 
                    ? sc.marks[0].ball100
                    : ' ',
                ball_ects: sc.marks[0] 
                    ? sc.marks[0].ballECTS as BallECTS
                    : ' ',
            })
        }
        return result
    }

    private prepareMarks(studentGroups: StudentGroup[]) {
        /*
.select(
      's.id as id_student',
      's.firstname as student_firstname',
      's.middlename as student_middlename',
      's.lastname as student_lastname',
      'm.id as id_mark',
      'm.id_subject_control',
      'm.ball_100',
      'm.ball_5',
      'm.ball_ects',
      'm.created_at',
      'm.id_user',
      'm.ip_address_user',
      'm.id_students_groups',
    )

        */
        let result: StudentMarkResponse[] = []
        for (let studGroup of studentGroups) {
            result.push({
                id_students_groups: studGroup.id,
                firstname: studGroup.student.firstname,
                middlename: studGroup.student.middlename,
                lastname: studGroup.student.lastname,
                id_mark: studGroup.marks[0].id,
                ball_5: this.unbalancing(studGroup.marks[0].ballECTS as BallECTS),
                ball_100: studGroup.marks[0].ball100,
                ball_ects: studGroup.marks[0].ballECTS as BallECTS,
            })
        }
        return result
    }

    public fillMarkInfo(students: StudentMarkResponse[], marks: StudentMarkResponse[]) {
        return students.map((student) => {
            marks.forEach((mark) => {
                if (mark.id_students_groups === student.id_students_groups) {
                    student.id_mark = mark.id_mark
                    student.ball_5 = this.unbalancing(mark.ball_ects as BallECTS)
                    student.ball_100 = mark.ball_100
                    student.ball_ects = mark.ball_ects
                }
            });
            return student;
        });
    }
}