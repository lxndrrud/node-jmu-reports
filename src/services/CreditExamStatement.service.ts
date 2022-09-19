// @ts-nocheck
import moment from 'moment'
import { IFormControlRepo } from '../repositories/FormControl.repo'
import { IStudentRepo } from '../repositories/Student.repo'
import { IMarksRepo } from '../repositories/StudentMarks.repo'
import { IStudentStatementRepo } from '../repositories/StudentStatement.repo'
import { IGroupRepo } from '../repositories/StudyGroup.repo'
import { IStudyGroupStatementRepo } from '../repositories/StudyGroupStatement.repo'
import { ISubjectRepo } from '../repositories/Subject.repo'
import { ITypeStatementRepo } from '../repositories/TypeStatement.repo'
import { GroupResponse } from '../types/group.type'
import { StudentInfoResponse } from '../types/student.type'
import { MarkWithSubjectResponse, StudentMarkResponse } from '../types/studentMark.type'
import { SubjectResponse } from '../types/subject.type'
import { Subject } from '../entities/plan_subjects'
import excel from 'excel4node'


export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, typeStatement: string, 
        path: string, idUser: number | undefined): 
    Promise<{
        students: StudentMarkResponse[];
        group: GroupResponse;
        subject: SubjectResponse;
        info: {
            year_start: number;
            year_end: number;
            type: string;
            number: number;
        }
    }>

    getCreditExamDebtStatement(idStudent: number, idGroup: number, idSubjectControl: number, path: string, idUser: number | undefined): Promise<{
        group: GroupResponse;
        student: StudentInfoResponse;
        subject: SubjectResponse;
        info: {
            year_start: number;
            year_end: number;
            type: string;
            number: number;
            date_sign: string;
        }
    }>

    getCreditExamIndiStatement(idStudent: number, idGroup: number, idFormControl: number, semester: string, path: string, idUser: number | undefined): Promise<{
        student: StudentInfoResponse;
        group: GroupResponse;
        credits: MarkWithSubjectResponse[];
        exams: MarkWithSubjectResponse[];
        info: {
            year_start: number;
            year_end: number;
            type: string;
            number: number;
            date_sign: string;
            semester: string;
        }
    }>

    getGroupJournal(idGroup: number, semester: string, isUnion: boolean, idUser?: number): Promise<any>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private studentRepo
    private marksRepo
    private groupRepo
    private subjectRepo
    private studentStatementRepo
    private groupStatementRepo
    private typeStatementRepo
    private formControlRepo

    constructor(
        studentRepoInstance: IStudentRepo,
        marksRepoInstance: IMarksRepo,
        groupRepoInstance: IGroupRepo,
        subjectRepoInstance: ISubjectRepo,
        studentStatementRepoInstance: IStudentStatementRepo,
        groupStatementRepoInstance: IStudyGroupStatementRepo,
        typeStatementRepoInstance: ITypeStatementRepo,
        formControlRepoInstance: IFormControlRepo,
    ) {
        this.studentRepo = studentRepoInstance
        this.marksRepo = marksRepoInstance
        this.groupRepo = groupRepoInstance
        this.subjectRepo = subjectRepoInstance
        this.studentStatementRepo = studentStatementRepoInstance
        this.groupStatementRepo = groupStatementRepoInstance
        this.typeStatementRepo = typeStatementRepoInstance
        this.formControlRepo = formControlRepoInstance
    }

    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, path: string, idUser?: number ) {
        const typeStatementQuery = await this.typeStatementRepo.getByName(typeStatement)
        if (!typeStatementQuery) throw 'Тип ведомости не определен'

        let [
            groupQuery, studentsQuery, marksQuery, subjectQuery, countStatements
        ] = await Promise.all([
            this.groupRepo.getGroupInfoWithDirector(idGroup),
            this.studentRepo.getMainInfoByGroup(idGroup),
            this.marksRepo.getMarksForGroup(idGroup, idSubjectControl),
            this.subjectRepo.getSubjectInfo(idSubjectControl),
            this.groupStatementRepo.countStatements(idGroup, idSubjectControl, typeStatementQuery.id)
        ])
        .catch(e => { throw e })

        studentsQuery = this.marksRepo.fillMarkInfo(studentsQuery, marksQuery)

        let info = {
            year_start: parseInt(groupQuery.date_start),
            year_end: parseInt(groupQuery.date_start) + 1,
            type: typeStatementQuery.name as string,
            number: countStatements + 1,
        }

        await this.groupStatementRepo.saveStatement(idGroup, idSubjectControl, typeStatementQuery.id, 
            path, idUser ? idUser : null)

        return {
            students: studentsQuery,
            group: groupQuery,
            subject: subjectQuery,
            info
        }
    }

    public async getCreditExamDebtStatement(idStudent: number, idGroup: number, idSubjectControl: number, 
        path: string, idUser?: number) {
        const typeStatementQuery = await this.typeStatementRepo.getByName('ЗЭЛ')
        if (!typeStatementQuery) throw 'Тип ведомости не определен'

        const [
            groupQuery, subjectQuery, studentQuery
        ] = await Promise.all([
            this.groupRepo.getGroupInfoWithDirector(idGroup),
            this.subjectRepo.getSubjectInfo(idSubjectControl),
            this.studentRepo.getStudentInfo(idStudent, idGroup),
        ])
        .catch(e => { throw e }) 

        const countStatements = await this.studentStatementRepo
            .countStatements(studentQuery.id_students_groups, idSubjectControl, typeStatementQuery.id)
            .catch(e => { throw e })

        const info = {
            year_start: parseInt(groupQuery.date_start),
            year_end: parseInt(groupQuery.date_start) + 1,
            type: typeStatementQuery.name,
            number: countStatements + 1,
            date_sign: moment().format('DD.MM.YYYY').toString(),
        };

        await this.studentStatementRepo.saveStatement(studentQuery.id_students_groups, idSubjectControl, 
            typeStatementQuery.id, path, idUser ? idUser : null)

        return {
            group: groupQuery,
            student: studentQuery,
            subject: subjectQuery,
            info
        }
        
    }

    public async getCreditExamIndiStatement(idStudent: number, idGroup: number, idFormControl: number, semester: string,
        path: string, idUser?: number) {
        const typeStatementQuery = await this.typeStatementRepo.getByName('ИВ')
        if (!typeStatementQuery) throw 'Тип ведомости не определен'

        const [
            groupQuery, studentQuery
        ] = await Promise.all([
            this.groupRepo.getGroupInfoWithDirector(idGroup),
            this.studentRepo.getStudentInfo(idStudent, idGroup, 0)
        ])

        let credits: MarkWithSubjectResponse[] = [],
            exams: MarkWithSubjectResponse[] = []
        if (idFormControl === -1) {
            [exams, credits] = await Promise.all([
                await this.marksRepo.getMarksForStudent(idStudent, idGroup, semester, 'Экз', false),
                await this.marksRepo.getMarksForStudent(idStudent, idGroup, semester, 'Зач', false)
            ])
        } else {
            const formControl = await this.formControlRepo.getFormControl(idFormControl)
            if (!formControl) throw 'Форма контроля не распознана'
            if (formControl.name === 'экзамен') 
                exams = await this.marksRepo.getMarksForStudent(idStudent, idGroup, semester, 'Экз', false)
            else if (formControl.name === 'зачет')
                credits =  await this.marksRepo.getMarksForStudent(idStudent, idGroup, semester, 'Зач', false)
        }

        const countStatements = await this.studentStatementRepo
            .countStatements(studentQuery.id_students_groups, null, typeStatementQuery.id)

        const info = {
            year_start: parseInt(groupQuery.date_start),
            year_end: parseInt(groupQuery.date_start) + 1,
            type: typeStatementQuery.name,
            number: countStatements + 1,
            date_sign: moment().format('DD.MM.YYYY').toString(),
            semester,
        }

        await this.studentStatementRepo.saveStatement(studentQuery.id_students_groups, null, 
            typeStatementQuery.id, path, idUser ? idUser : null)


        return {
            student: studentQuery,
            group: groupQuery,
            credits,
            exams,
            info
        }
    }

    public async getGroupJournal(idGroup: number, semester: string, isUnion: boolean, idUser?: number) {
        const typeStatementQuery = await this.typeStatementRepo.getByName('ИВ')
        if (!typeStatementQuery) throw 'Тип ведомости не определен'

        const subjects = await this.subjectRepo.getSubjectsForGroup(idGroup, semester, isUnion)

        const students = await this.studentRepo.getStudentsByGroup(idGroup, 0)
        const marksMap = new Map<string, MarkWithSubjectResponse>()
        for (let student of students) {
            const [
                credits, exams, diffCredits, controlWorks
            ] = await Promise.all([
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'Зач', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'Экз', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'ДифЗач', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'КР', isUnion),
            ])

            credits.forEach(item => {
                marksMap.set(student.id+'_'+item.form_control_name+'_'+item.subject_name, item)
            })
            exams.forEach(item => {
                marksMap.set(student.id+'_'+item.form_control_name+'_'+item.subject_name, item)
            })
            diffCredits.forEach(item => {
                marksMap.set(student.id+'_'+item.form_control_name+'_'+item.subject_name, item)
            })
            controlWorks.forEach(item => {
                marksMap.set(student.id+'_'+item.form_control_name+'_'+item.subject_name, item)
            })
        }
        return await this.prepareDocument(subjects, students, marksMap)
    }

    public async prepareDocument(subjects: Subject[], students: Student[], marksMap: Map<string, MarkWithSubjectResponse>) {
        console.log(subjects, students, marksMap)
        // Формирование документа
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('Журнал группы');

        const subjectNameStyle = workBook.createStyle({
        alignment: {
            textRotation: 90,
        },
        border: { outline: true },
        });

        workSheet.row(1).setHeight(300);
        workSheet.column(1).setWidth(50);

        const outlineStyle = {
            border: {
              top: {
                style: 'thin',
                color: '#000000',
              },
              bottom: {
                style: 'thin',
                color: '#000000',
              },
              left: {
                style: 'thin',
                color: '#000000',
              },
              right: {
                style: 'thin',
                color: '#000000',
              },
            },
        };

        const check = subjects.findIndex((subject, i) => {
            subjects[i].subjectGroups[0].subjectControls[0].formControl.name === 'зачет' &&
                subjects[i + 1].subjectGroups[0].subjectControls[0].formControl.name !== 'зачет'
        })
        const averageCountIndex = check !== -1 ? check : 1 

        // Формирование excel-файла
        for (let i = 1; i < students.length + 1 + 1; i++) {
            let needAverage = true;
            for (let j = 1; j < subjects.length + 1 + 1 + 5; j++) {
                workSheet.cell(i, j).style(outlineStyle);
        
                // Шапка
                // Первые пять пустые
                if (i === 1 && j < 6) workSheet.cell(i, j).string(' ');
        
                // Повернутый на 90 градусов текст с названиями предметов
                if (i === 1 && j >= 6 && j < subjects.length + 6) {
                    workSheet
                        .cell(i, j)
                        .string(subjects[j - 6].name)
                        .style(subjectNameStyle);
                }
        
                // Повернутый на 90 градусов текст 'Средний бал'
                if (i === 1 && j === subjects.length + 6)
                    workSheet.cell(i, j).string('Средний бал').style(subjectNameStyle);
        
                // Значения
                // ФИО
                if (i > 1 && j === 1)
                    workSheet
                        .cell(i, j)
                        .string(
                            `${students[i - 2].lastname} ${students[i - 2].firstname} ${
                            students[i - 2].middlename
                            }`,
                        )
                        .style(outlineStyle);
        
                // Номер зачетной книжки
                if (i > 1 && j === 2) workSheet.cell(i, j).string(students[i - 2].studentGroup[0].recordBook);
        
                // Бюджет или контракт
                if (i > 1 && j === 3) workSheet.cell(i, j)
                    .string(await this.studentRepo.getBasisLearning(students[i - 2].studentGroup[0].id));
        
                // Зачеты, диф зачеты, кр и экзамены
                if (i > 1 && j >= 6 && j < subjects.length + 6) {
                    // Зачеты
                    if (marksMap.has(students[i - 2].id+'_'+"зачет"+'_'+subjects[j-6].name)) {
                        if (
                            marksMap.get(students[i - 2].id+'_зачет_'+subjects[j-6].name)?.ball_5 === 0 &&
                            subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'зачет'
                        ) {
                            workSheet.cell(i, j).number(2);
                            needAverage = false;
                        } else if (
                            marksMap.get(students[i - 2].id+'_зачет_'+subjects[j-6].name)?.ball_5 === 1 &&
                            subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'зачет'
                        )
                            workSheet.cell(i, j).number(1).style(outlineStyle);
                    } else if (
                        !marksMap.get(students[i - 2].id+'_зачет_'+subjects[j-6].name) &&
                        subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'зачет'
                    ) {
                        workSheet.cell(i, j).string(' ');
                        needAverage = false;
                    }
        
                    // Диф зачеты
                    if (!marksMap.get(students[i - 2].id+'_зачетсоц._'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'зачетсоц.'
                    ) {
                        workSheet.cell(i, j).string(' ').style(outlineStyle);
                        needAverage = false;
                    }
                    else if(marksMap.has(students[i - 2].id+'_зачетсоц._'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'зачетсоц.'
                    ) {
                        if (marksMap.get(students[i - 2].id+'_зачетсоц._'+subjects[j-6].name)?.ball_5 as number >= 3)
                            workSheet
                            .cell(i, j)
                            .number(marksMap.get(students[i - 2].id+'_зачетсоц._'+subjects[j-6].name)?.ball_5);
                        else if (marksMap.get(students[i - 2].id+'_зачетсоц._'+subjects[j-6].name)?.ball_5 as number < 3) {
                            needAverage = false;
                            workSheet.cell(i, j).number(2).style(outlineStyle);
                        } 
                    } 
        
                    // Контрольные работы
                    if (!marksMap.get(students[i - 2].id+'_кр_'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'кр'
                    ) {
                        workSheet.cell(i, j).string(' ').style(outlineStyle);
                        needAverage = false;
                    }
                    else if(marksMap.has(students[i - 2].id+'_кр_'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'кр'
                    ) {
                        if (marksMap.get(students[i - 2].id+'_кр_'+subjects[j-6].name)?.ball_5 as number >= 3)
                            workSheet
                            .cell(i, j)
                            .number(marksMap.get(students[i - 2].id+'_кр._'+subjects[j-6].name)?.ball_5);
                        else if (marksMap.get(students[i - 2].id+'_кр_'+subjects[j-6].name)?.ball_5 as number < 3) {
                            needAverage = false;
                            workSheet.cell(i, j).number(2).style(outlineStyle);
                        } 
                    } 
        
                    // Экзамены
                    if (!marksMap.get(students[i - 2].id+'_экзамен_'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'экзамен'
                    ) {
                        workSheet.cell(i, j).string(' ').style(outlineStyle);
                        needAverage = false;
                    }
                    else if(marksMap.has(students[i - 2].id+'_экзамен_'+subjects[j-6].name)
                        && subjects[j - 6].subjectGroups[0].subjectControls[0].formControl.name === 'экзамен'
                    ) {
                        if (marksMap.get(students[i - 2].id+'_экзамен_'+subjects[j-6].name)?.ball_5 as number >= 3)
                            workSheet
                            .cell(i, j)
                            .number(marksMap.get(students[i - 2].id+'_экзамен_'+subjects[j-6].name)?.ball_5);
                        else if (marksMap.get(students[i - 2].id+'_экзамен_'+subjects[j-6].name)?.ball_5 as number < 3) {
                            needAverage = false;
                            workSheet.cell(i, j).number(2).style(outlineStyle);
                        } 
                    } 
                }
        
                // Средний бал
                if (i > 1 && j === subjects.length + 6) {
                    if (needAverage) {
                        const averageStringFormula = `AVERAGEIF(${excel.getExcelCellRef(
                            i,
                            averageCountIndex + 6,
                        )} : ${excel.getExcelCellRef(i, subjects.length + 5)}, ">2")`;
                        workSheet.cell(i, j).formula(averageStringFormula);
                    }
                }
            }
        }
        return workBook
    }
}