import { Request, Response } from 'express'
import { ICreditExamStatementService } from '../services/CreditExamStatement.service'
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator'
import { ReportCreator } from '../utils/ReportCreator'


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

    constructor(
        errorCreatorInstance: HTTPErrorCreator,
        reportCreatorInstance: ReportCreator,
        creditExamStatementServiceInstance: ICreditExamStatementService
    ) {
        this.errorCreator = errorCreatorInstance
        this.reportCreator = reportCreatorInstance
        this.creditExamStatementService = creditExamStatementServiceInstance
    }


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

        try {
            const reportPath = `Cont/reports/statements/group/gid_${idGroup}/id_subject_control_${idSubjectControl}`
            const reportName = `Зач-экз ведомость (${typeStatement})`
            const templateType = 'education'
            const templateName = 'Зач-экз ведомость'
            const path = `${reportPath}/${reportName}` 

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

        try {
            const reportPath = `Cont/reports/student/sid_${pIdStudent}/creditStatements/id_subject_control_${req.query.idSubjectControl}`
            const reportName = `Хвостовка`
            const templateType = 'education'
            const templateName = 'Хвостовка'
            const path = `${reportPath}/${reportName}` 

            const data = await this.creditExamStatementService.getCreditExamDebtStatement(
                pIdStudent, pIdGroup, pIdSubjectControl, path, pIdUser)


            await this.reportCreator.sendTemplate(res, data, templateType, templateName, reportPath, reportName)
        } catch(e) {
            this.errorCreator.internalServer500(res, <string> e)
        }

    }

    public async getCreditExamIndividualStatement(req: Request, res: Response) {
        try {
            const {
                idGroup, semester, idFormControl, idStudent, idUser
            } = req.query
    
            if (!idGroup || !semester || !idFormControl || !idStudent) {
                this.errorCreator.badRequest400(res, 'Недостаточно данных для генерации отчета!')
                return
            }
    
            const reportPath = `Cont/reports/student/sid_${req.query.idUser}/personalStatements/semester_${req.query.semester}`;
            const reportName = `Инд зач-экз ведомость`;
            const templateType = 'education'
            const templateName = 'Инд зач-экз ведомость';
            const path = `${reportPath}/${reportName}`

            let data: any
    
            await this.reportCreator.sendTemplate(res, data, templateType, templateName, reportPath, reportName)
        } catch (e) {
            this.errorCreator.internalServer500(res, <string> e)
        }
        

        
    }

    public async getGroupJournal(req: Request, res: Response) {

    }
}