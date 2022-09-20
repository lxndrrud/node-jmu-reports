import { Request, Response } from 'express'
import { ICreditExamStatementService } from '../services/CreditExamStatement.service'
import { IHttpErrorCreator } from '../utils/HttpErrorCreator'
import { IReportCreator, ReportCreator } from '../utils/ReportCreator'
import { IExcelFacadeService } from '../services/ExcelFacade.service'


export interface ICreditExamStatementsController {
    getCreditExamStatement(req: Request, res: Response): Promise<void>
    getCreditExamDebtStatement(req: Request, res: Response): Promise<void>
    getCreditExamIndividualStatement(req: Request, res: Response): Promise<void>
    getGroupJournal(req: Request, res: Response): Promise<void>
}

export class CreditExamStatementsController implements ICreditExamStatementsController {
    protected errorCreator
    protected reportCreator
    protected creditExamStatementService
    protected excelFacadeService

    constructor(
        errorCreatorInstance:IHttpErrorCreator,
        reportCreatorInstance: IReportCreator,
        creditExamStatementServiceInstance: ICreditExamStatementService,
        excelFacadeServiceInstance: IExcelFacadeService
    ) {
        this.errorCreator = errorCreatorInstance
        this.reportCreator = reportCreatorInstance
        this.creditExamStatementService = creditExamStatementServiceInstance
        this.excelFacadeService = excelFacadeServiceInstance
    }

    // Зачетно экзаменационная
    public async getCreditExamStatement(req: Request, res: Response) {
        // Получить данные
        const {
            idGroup, idSubjectControl, typeStatement, idUser
        } = req.query
        
        // Валидация
        if (!idGroup || !idSubjectControl || !typeStatement) {
            this.errorCreator.badRequest400(res, 'Недостаточно данных для генерации отчёта!')
            return
        }

        // Преобразование к типам
        const pIdGroup = parseInt(idGroup as string), 
            pIdSubjecControl = parseInt(idSubjectControl as string),
            pIdUser = parseInt(idUser as string)

        const reportPath = `Cont/reports/statements/group/gid_${idGroup}/id_subject_control_${idSubjectControl}`
        const reportName = `Зач-экз ведомость (${typeStatement})`
        const templateType = 'education'
        const templateName = 'Зач-экз ведомость'
        const path = `${reportPath}/${reportName}.docx` 

        try {
            let data = await this.creditExamStatementService.getCreditExamStatement(
                pIdGroup,
                pIdSubjecControl,
                typeStatement as string,
                path,
                pIdUser
            )

            await this.reportCreator.sendTemplate(res, data, templateType, templateName, reportPath, reportName)
        } catch (e) {
            this.errorCreator.internalServer500(res, <string> e)
        }
    }

    // Хвостовка
    public async getCreditExamDebtStatement(req: Request, res: Response) {
        const { 
            idGroup, idSubjectControl, idStudent, idUser
        } = req.query

        if (!idGroup || !idSubjectControl || !idStudent) {
            this.errorCreator.badRequest400(res, 'Недостаточно данных для генерации отчета!')
            return
        }

        const [
            pIdGroup, pIdSubjectControl, pIdStudent, pIdUser
        ] = [
            parseInt(idGroup as string), parseInt(idSubjectControl as string),
            parseInt(idStudent as string), parseInt(idUser as string)
        ]

        const reportPath = `Cont/reports/student/sid_${idStudent}/creditStatements/id_subject_control_${idSubjectControl}`
        const reportName = `Хвостовка`
        const templateType = 'education'
        const templateName = 'Хвостовка'
        const path = `${reportPath}/${reportName}.docx` 

        try {
            const data = await this.creditExamStatementService.getCreditExamDebtStatement(
                pIdStudent, pIdGroup, pIdSubjectControl, path, pIdUser)


            await this.reportCreator.sendTemplate(res, data, templateType, templateName, reportPath, reportName)
        } catch(e) {
            this.errorCreator.internalServer500(res, <string> e)
        }
    }

    // Зачетно-экзаменационная на человека
    public async getCreditExamIndividualStatement(req: Request, res: Response) {
        const {
            idGroup, semester, idFormControl, idStudent, idUser
        } = req.query

        if (!idGroup || !semester || !idFormControl || !idStudent) {
            this.errorCreator.badRequest400(res, 'Недостаточно данных для генерации отчета!')
            return
        }

        const [
            pIdGroup, pIdFormControl, pIdStudent, pIdUser
        ] = [
            parseInt(idGroup as string), parseInt(idFormControl as string),
            parseInt(idStudent as string), parseInt(idUser as string)
        ]

        const reportPath = `Cont/reports/student/sid_${idStudent}/personalStatements/semester_${semester}`;
        const reportName = `Инд зач-экз ведомость`;
        const templateType = 'education'
        const templateName = 'Инд зач-экз ведомость';
        const path = `${reportPath}/${reportName}.docx`

        try {
            let data = await this.creditExamStatementService
                .getCreditExamIndiStatement(pIdStudent, pIdGroup, pIdFormControl, semester as string, path, pIdUser)
            
            await this.reportCreator.sendTemplate(res, data, templateType, templateName, reportPath, reportName)
        } catch (e) {
            this.errorCreator.internalServer500(res, <string> e)
        }
    }

    // Журнал группы
    public async getGroupJournal(req: Request, res: Response) {
        const {
            idGroup, semester, isUnion, idUser
        } = req.query

        if (!idGroup || !semester) {
            this.errorCreator.badRequest400(res, 'Недостаточно данных для генерации отчета!')
            return
        }

        const [
            pIdGroup, pIdUser
        ] = [ parseInt(idGroup as string), parseInt(idUser as string) ]

        try {
            const workBook = await this.excelFacadeService.getGroupJournal(pIdGroup, semester as string,
                !!isUnion, `Cont/reports/groupJournals/Журнал_группы_${idGroup}`, pIdUser)

            await this.reportCreator.sendExcelDocument(workBook, '/Cont/reports/groupJournals', 
                `Журнал_группы_${idGroup}`, res)
        } catch (error) {
            this.errorCreator.internalServer500(res, <string> error)
        }
    }
}