import { DataSource } from 'typeorm'
import { IStudentRepo } from '../repositories/Student.repo'
import { IMarksRepo } from '../repositories/StudentMarks.repo'
import { IGroupRepo } from '../repositories/StudyGroup.repo'
import { ISubjectRepo } from '../repositories/Subject.repo'
import { StudentWithMark } from '../types/studentMark.type'


export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, typeStatement: string, idUser: number | undefined): Promise<{
        studentsQuery: StudentWithMark[];
    }>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private studentRepo
    private marksRepo
    private groupRepo
    private subjectRepo


    constructor(
        studentRepoInstance: IStudentRepo,
        marksRepoInstance: IMarksRepo,
        groupRepoInstance: IGroupRepo,
        subjectRepoInstance: ISubjectRepo 
    ) {
        this.studentRepo = studentRepoInstance
        this.marksRepo = marksRepoInstance
        this.groupRepo = groupRepoInstance
        this.subjectRepo = subjectRepoInstance
    }

    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, idUser: number | undefined) {
  
        try {
            let [
                groupQuery, studentsQuery, marksQuery, subjectQuery
            ] = await Promise.all([
                this.groupRepo.getGroupInfoWithDirector(idGroup),
                this.studentRepo.mainInfoByGroup(idGroup),
                this.marksRepo.getMarksForGroup(idGroup, idSubjectControl),
                this.subjectRepo.getSubjectInfo(idSubjectControl)
            ])

            studentsQuery = this.marksRepo.fillMarkInfo(studentsQuery, marksQuery)

            return {
                studentsQuery, 
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}