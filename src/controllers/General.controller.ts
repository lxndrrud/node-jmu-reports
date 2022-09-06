import { Request, Response } from 'express'
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator'

export interface IGeneralController {
    getReportTypes(req: Request, res: Response): Promise<void>
}

export class GeneralController implements IGeneralController {
    protected errorCreator

    constructor(
        errorCreatorInstance: HTTPErrorCreator
    ) {
        this.errorCreator = errorCreatorInstance
    }

    public async getReportTypes(req: Request, res: Response) {
        
    }
}