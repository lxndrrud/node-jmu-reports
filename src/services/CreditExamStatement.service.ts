import moment from 'moment'
import { IStudentRepo } from '../repositories/Student.repo'
import { IMarksRepo } from '../repositories/StudentMarks.repo'
import { IStudentStatementRepo } from '../repositories/StudentStatement.repo'
import { IGroupRepo } from '../repositories/StudyGroup.repo'
import { IStudyGroupStatementRepo } from '../repositories/StudyGroupStatement.repo'
import { ISubjectRepo } from '../repositories/Subject.repo'
import { ITypeStatementRepo } from '../repositories/TypeStatement.repo'
import { GroupResponse } from '../types/group.type'
import { StudentInfoResponse } from '../types/student.type'
import { StudentMarkResponse } from '../types/studentMark.type'
import { SubjectResponse } from '../types/subject.type'


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
    
}

export class CreditExamStatementService implements ICreditExamStatementService {
    private studentRepo
    private marksRepo
    private groupRepo
    private subjectRepo
    private studentStatementRepo
    private groupStatementRepo
    private typeStatementRepo

    constructor(
        studentRepoInstance: IStudentRepo,
        marksRepoInstance: IMarksRepo,
        groupRepoInstance: IGroupRepo,
        subjectRepoInstance: ISubjectRepo,
        studentStatementRepoInstance: IStudentStatementRepo,
        groupStatementRepoInstance: IStudyGroupStatementRepo,
        typeStatementRepoInstance: ITypeStatementRepo
    ) {
        this.studentRepo = studentRepoInstance
        this.marksRepo = marksRepoInstance
        this.groupRepo = groupRepoInstance
        this.subjectRepo = subjectRepoInstance
        this.studentStatementRepo = studentStatementRepoInstance
        this.groupStatementRepo = groupStatementRepoInstance
        this.typeStatementRepo = typeStatementRepoInstance
    }

    public async getCreditExamStatement(idGroup: number, idSubjectControl: number, 
        typeStatement: string, path: string, idUser: number | undefined) {
  
        try {
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
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    public async getCreditExamDebtStatement(idStudent: number, idGroup: number, idSubjectControl: number, 
        path: string, idUser: number | undefined) {
        try {
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
        } catch(e) {
            console.error(<string> e)
            throw e
        }
    }

    public async getCreditExamIndiStatement() {
        const typeStatementQuery = await this.typeStatementRepo.getByName('ИВ')
        if (!typeStatementQuery) throw 'Тип ведомости не определен'

        


    }
}