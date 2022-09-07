import { Router } from 'express'
import { CreditExamStatementsController } from '../controllers/CreditExamStatements.controller'
import { DatabaseConnection } from '../dbConnection';
import { StudentRepo } from '../repositories/Student.repo';
import { CreditExamStatementService } from '../services/CreditExamStatement.service';
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator';
import { ReportCreator } from '../utils/ReportCreator';

export const CreditExamRouter = Router()

const creditExamController = new CreditExamStatementsController(
    new HTTPErrorCreator(),
    new ReportCreator(new HTTPErrorCreator()),
    new CreditExamStatementService(
        DatabaseConnection, new StudentRepo(DatabaseConnection))
)

CreditExamRouter.get('/creditStatement', 
    creditExamController.getCreditExamStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementDebt', 
    creditExamController.getCreditExamDebtStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementIndividual', 
    creditExamController.getCreditExamIndividualStatement.bind(creditExamController));
CreditExamRouter.get('/groupJournal', 
    creditExamController.getGroupJournal.bind(creditExamController));
