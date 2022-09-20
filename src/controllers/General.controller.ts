import { Request, Response } from 'express'
import { IGeneralInfoService } from '../services/GeneralInfo.service'
import { IHttpErrorCreator } from '../utils/HttpErrorCreator'

export interface IGeneralController {
    getReportTypes(req: Request, res: Response): Promise<void>
}

export class GeneralController implements IGeneralController {
    private errorCreator
    private generalInfoService

    constructor(
        errorCreatorInstance: IHttpErrorCreator,
        generalInfoServiceInstance: IGeneralInfoService
    ) {
        this.errorCreator = errorCreatorInstance
        this.generalInfoService = generalInfoServiceInstance
    }

    public async getReportTypes(req: Request, res: Response) {
        try {
            const types = await this.generalInfoService.getAllStatementTypes()
            res.status(200).send({
                types
            })
        } catch(error) {
            this.errorCreator.internalServer500(res, <string> error)
        }
        
    }
}