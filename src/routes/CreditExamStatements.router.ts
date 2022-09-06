import { Router } from 'express'
import { CreditExamStatementsController } from '../controllers/CreditExamStatements.controller'
import { CreditExamStatementService } from '../services/CreditExamStatement.service';
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator';
import { ReportCreator } from '../utils/ReportCreator';

export const CreditExamRouter = Router()

const creditExamController = new CreditExamStatementsController(
    new HTTPErrorCreator(),
    new ReportCreator(
        new HTTPErrorCreator()
    ),
    new CreditExamStatementService()
)

CreditExamRouter.get('/creditStatement', 
    creditExamController.getCreditExamStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementDebt', 
    creditExamController.getCreditExamDebtStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementIndividual', 
    creditExamController.getCreditExamIndividualStatement.bind(creditExamController));
CreditExamRouter.get('/groupJournal', 
    creditExamController.getGroupJournal.bind(creditExamController));
