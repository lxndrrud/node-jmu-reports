import { DataSource } from 'typeorm'
import { IStudentRepo } from '../repositories/Student.repo'
import { IMarksRepo } from '../repositories/StudentMarks.repo'
import { IStudentStatementRepo } from '../repositories/StudentStatement.repo'
import { IGroupRepo } from '../repositories/StudyGroup.repo'
import { IStudyGroupStatementRepo } from '../repositories/StudyGroupStatement.repo'
import { ISubjectRepo } from '../repositories/Subject.repo'
import { StudentMarkResponse } from '../types/studentMark.type'


export interface ICreditExamStatementService {
    getCreditExamStatement(idGroup: number, idSubjectControl: number, typeStatement: string, idUser: number | undefined): Promise<{
        studentsQuery: StudentMarkResponse[];
    }>
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private studentRepo
    private marksRepo
    private groupRepo
    private subjectRepo
    private studentStatementRepo
    private groupStatementRepo

    constructor(
        studentRepoInstance: IStudentRepo,
        marksRepoInstance: IMarksRepo,
        groupRepoInstance: IGroupRepo,
        subjectRepoInstance: ISubjectRepo,
        studentStatementRepoInstance: IStudentStatementRepo,
        groupStatementRepoInstance: IStudyGroupStatementRepo
    ) {
        this.studentRepo = studentRepoInstance
        this.marksRepo = marksRepoInstance
        this.groupRepo = groupRepoInstance
        this.subjectRepo = subjectRepoInstance
        this.studentStatementRepo = studentStatementRepoInstance
        this.groupStatementRepo = groupStatementRepoInstance
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
            .catch(e => { throw e })

            studentsQuery = this.marksRepo.fillMarkInfo(studentsQuery, marksQuery)

            return {
                studentsQuery,
                groupQuery,
                subjectQuery 
            }
        } catch (e) {
            console.error(e)
            throw e
        }
    }
}