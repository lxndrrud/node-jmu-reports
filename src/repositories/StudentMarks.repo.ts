import moment from "moment";
import { DataSource } from "typeorm";
import { SubjectControl } from "../entities/plan_subject_control";
import { SubjectGroup } from "../entities/plan_subject_group";
import { StudentGroup } from "../entities/students_groups";
import { StudentMark } from "../entities/students_marks";
import { BallECTS, MarkWithSubjectResponse, StudentMarkResponse } from "../types/studentMark.type";
import { ISubjectRepo } from "./Subject.repo";


export interface IMarksRepo {
    getMarksForGroup(idGroup: number, idSubjectControl: number): Promise<StudentMarkResponse[]>
    getMarksForStudent(idStudent: number, idGroup: number, semester: string, markType: "ДифЗач" | "КР" | "Зач" | "Экз", isUnion: boolean): 
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
        if (idsStudentGroups.length === 0) throw new Error('Студенты для группы не найдены!')

        let marks = await  this.connection.createQueryBuilder(StudentGroup, 'sg')
            .innerJoinAndSelect('sg.student', 's')
            .leftJoinAndSelect('sg.marks', 'm')
            .where('sg.id IN (:...idsStudentGroups)', { idsStudentGroups: idsStudentGroups.map(item => item.id) })
            .andWhere('m.id_subject_control = :idSubjectControl', { idSubjectControl })
            .andWhere('sg.status = :status', { status: 0 })
            .getMany()

        return this.prepareMarks(marks)
    }

    public async getMarksForStudent(idStudent: number, idGroup: number, semester: string, 
        markType: 'Зач' | 'ДифЗач' | 'КР' | 'Экз', isUnion: boolean) {

        const signOfExpression = isUnion ? '<=' : '='
        const map = {
            'Зач': 'зачет',  'ДифЗач': 'зачетсоц.',  'КР': 'кр',  'Экз': 'экзамен'
        }
        const formControl = map[markType]
        const subjectGroups = await this.connection.createQueryBuilder(SubjectGroup, 'subjG')
            .innerJoin('subjG.subjectControls', 'sc')
            .innerJoin('sc.formControl', 'fc')
            .where('subjG.idGroup = :idGroup', { idGroup })
            .andWhere('fc.name LIKE :formControl', { formControl })
            .andWhere(`sc.semester ${signOfExpression} :semester`, {semester})
            .getMany()

        let marksList: MarkWithSubjectResponse[] = [] 
        
        for (let subjG of subjectGroups) {
            let query = this.connection.createQueryBuilder(SubjectControl, 'sc')
                .innerJoinAndSelect('sc.subjectGroup', 'subjG')
                .innerJoinAndSelect('subjG.subject', 'sub')
                .innerJoinAndSelect('sc.formControl', 'fc')
                .innerJoinAndSelect('subjG.group', 'g')
                .innerJoinAndSelect('g.specialtyProfile', 'specProf')
                .innerJoinAndSelect('specProf.specialty', 'spec')
                .leftJoinAndSelect('sc.person', 'person')
                .where('subjG.id = :idSubjectGroup', { idSubjectGroup: subjG.id })

            if ((await this.subjectRepo.checkAcademicHoursExistence(subjG.id)))
                query
                    .leftJoinAndSelect('subjG.subjectsAcademicHours', 'sah')
                    .leftJoinAndSelect('sah.academicHour', 'ah')
                    .andWhere("ah.name = 'экспертное'")
            if ((await this.subjectRepo.checkCreditUnitsExistence(subjG.id)))
                query
                    .leftJoinAndSelect('subjG.subjectsCreditUnits', 'scu')
                    .leftJoinAndSelect('scu.creditUnit', 'cu')
                    .andWhere("cu.name = 'экспертное'")

            const subjectControlQuery = await query.getOne() as SubjectControl
            const mark = await this.connection.createQueryBuilder(StudentMark, 'mark')
                .innerJoin('mark.studentGroup', 'sg')
                .innerJoin('mark.subjectControl', 'sc')
                .where('sg.idStudent = :idStudent', { idStudent })
                .andWhere('sg.idGroup = :idGroup', { idGroup })
                .andWhere('sc.id = :idSubjectControl', { idSubjectControl: subjectControlQuery.id })
                .getOne()

            marksList.push(this.prepareMarkWithSubject(subjectControlQuery, mark))
        }

        return marksList
    }

    private unbalancing(key: BallECTS) {
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

    private prepareMarkWithSubject(subjectControl: SubjectControl, mark: StudentMark | null) {
        return <MarkWithSubjectResponse> {
            id_subject_control: subjectControl.id,
            subject_name: subjectControl.subjectGroup.subject.name,
            creditUnits: subjectControl.subjectGroup.subjectsCreditUnits
                ? subjectControl.subjectGroup.subjectsCreditUnits[0].hour
                : " ",
            hours: subjectControl.subjectGroup.subjectsAcademicHours
                ? subjectControl.subjectGroup.subjectsAcademicHours[0].hour
                : ' ',
            form_control_name: subjectControl.formControl.name,
            lecturer: subjectControl.person 
                ? subjectControl.person.lastname + ' ' + subjectControl.person.firstname + ' ' 
                    + subjectControl.person.middlename
                : ' ',
            date_exam: subjectControl.dateExam 
                ? moment(subjectControl.dateExam).format('DD-MM-YYYY').toString() 
                : ' ',
            ball_5: mark
                ? mark.ball5
                : ' ',
            ball_100: mark 
                ? mark.ball100
                : ' ',
            ball_ects: mark
                ? mark.ballECTS as BallECTS
                : ' ',
        }
    }

    private prepareMarks(studentGroups: StudentGroup[]) {
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