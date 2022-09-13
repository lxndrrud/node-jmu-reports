import { Router } from 'express'
import { CreditExamStatementsController } from '../controllers/CreditExamStatements.controller'
import { DatabaseConnection } from '../dbConnection';
import { StudentRepo } from '../repositories/Student.repo';
import { MarksRepo } from '../repositories/StudentMarks.repo';
import { StudentStatementRepo } from '../repositories/StudentStatement.repo';
import { GroupRepo } from '../repositories/StudyGroup.repo';
import { StudyGroupStatementRepo } from '../repositories/StudyGroupStatement.repo';
import { SubjectRepo } from '../repositories/Subject.repo';
import { TypeStatementRepo } from '../repositories/TypeStatement.repo';
import { CreditExamStatementService } from '../services/CreditExamStatement.service';
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator';
import { ReportCreator } from '../utils/ReportCreator';

export const CreditExamRouter = Router()

const creditExamController = new CreditExamStatementsController(
    new HTTPErrorCreator(),
    new ReportCreator(new HTTPErrorCreator()),
    new CreditExamStatementService(
        new StudentRepo(DatabaseConnection),
        new MarksRepo(DatabaseConnection, new SubjectRepo(DatabaseConnection)),
        new GroupRepo(DatabaseConnection),
        new SubjectRepo(DatabaseConnection),
        new StudentStatementRepo(DatabaseConnection),
        new StudyGroupStatementRepo(DatabaseConnection),
        new TypeStatementRepo(DatabaseConnection)
    )
)

CreditExamRouter.get('/creditStatement', 
    creditExamController.getCreditExamStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementDebt', 
    creditExamController.getCreditExamDebtStatement.bind(creditExamController));
CreditExamRouter.get('/creditStatementIndividual', 
    creditExamController.getCreditExamIndividualStatement.bind(creditExamController));
CreditExamRouter.get('/groupJournal', 
    creditExamController.getGroupJournal.bind(creditExamController));
