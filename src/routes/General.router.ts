import { Router } from 'express'
import { GeneralController } from '../controllers/General.controller';
import { DatabaseConnection } from '../dbConnection';
import { TypeStatementRepo } from '../repositories/TypeStatement.repo';
import { GeneralInfoService } from '../services/GeneralInfo.service';
import { HttpErrorCreator } from '../utils/HttpErrorCreator';

export const GeneralRouter = Router()

const generalController = new GeneralController(
    new HttpErrorCreator(),
    new GeneralInfoService(new TypeStatementRepo(DatabaseConnection))
)


GeneralRouter.get('/types/all', generalController.getReportTypes.bind(generalController));
