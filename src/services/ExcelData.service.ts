import { Subject } from "../entities/plan_subjects"
import { Student } from "../entities/students"
import { IStudentRepo } from "../repositories/Student.repo"
import { IMarksRepo } from "../repositories/StudentMarks.repo"
import { ISubjectRepo } from "../repositories/Subject.repo"
import { ITypeStatementRepo } from "../repositories/TypeStatement.repo"
import { MarkWithSubjectResponse } from "../types/studentMark.type"


export interface IExcelDataService {
    getGroupJournalData(idGroup: number, semester: string, isUnion: boolean): Promise<{
        subjects: Subject[];
        students: Student[];
        marksMap: Map<string, MarkWithSubjectResponse>;
    }>
}

export class ExcelDataService implements IExcelDataService {
    private studentRepo
    private marksRepo
    private subjectRepo

    constructor(
        studentRepoInstance: IStudentRepo,
        marksRepoInstance: IMarksRepo,
        subjectRepoInstance: ISubjectRepo
    ) {
        this.studentRepo = studentRepoInstance
        this.marksRepo = marksRepoInstance
        this.subjectRepo = subjectRepoInstance
    }
    
    public async getGroupJournalData(idGroup: number, semester: string, isUnion: boolean) {
        const [ subjects, students ] = await Promise.all([
            this.subjectRepo.getSubjectsForGroup(idGroup, semester, isUnion),
            this.studentRepo.getStudentsByGroup(idGroup, 0)
        ])
        if (subjects.length === 0) throw new Error('Предметы для группы не найдены.')
        if (students.length === 0) throw new Error('Студенты группы не найдены.')

        const marksMap = new Map<string, MarkWithSubjectResponse>()
        for (let student of students) {
            const [ credits, exams, diffCredits, controlWorks ] = await Promise.all([
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'Зач', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'Экз', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'ДифЗач', isUnion),
                this.marksRepo.getMarksForStudent(student.id, idGroup, semester, 'КР', isUnion),
            ])

            credits.forEach(item => {
                marksMap.set(student.id+'_credit_'+item.subject_name, item)
            })
            exams.forEach(item => {
                marksMap.set(student.id+'_exam_'+item.subject_name, item)
            })
            diffCredits.forEach(item => {
                marksMap.set(student.id+'_diffCredit_'+item.subject_name, item)
            })
            controlWorks.forEach(item => {
                marksMap.set(student.id+'_controlWork_'+item.subject_name, item)
            })
        }
        return { subjects, students, marksMap }
    }
}