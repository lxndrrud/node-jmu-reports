import { Router } from 'express'
import { CreditExamStatementsController } from '../controllers/CreditExamStatements.controller'
import { DatabaseConnection } from '../dbConnection';
import { FormControlRepo } from '../repositories/FormControl.repo';
import { StudentRepo } from '../repositories/Student.repo';
import { MarksRepo } from '../repositories/StudentMarks.repo';
import { StudentStatementRepo } from '../repositories/StudentStatement.repo';
import { GroupRepo } from '../repositories/StudyGroup.repo';
import { StudyGroupStatementRepo } from '../repositories/StudyGroupStatement.repo';
import { SubjectRepo } from '../repositories/Subject.repo';
import { TypeStatementRepo } from '../repositories/TypeStatement.repo';
import { CreditExamStatementService } from '../services/CreditExamStatement.service';
import { ExcelDataService } from '../services/ExcelData.service';
import { ExcelFacadeService } from '../services/ExcelFacade.service';
import { ExcelPreparatorService } from '../services/ExcelPreparator.service';
import { HttpErrorCreator } from '../utils/HttpErrorCreator';
import { ReportCreator } from '../utils/ReportCreator';

export const CreditExamRouter = Router()

const creditExamController = new CreditExamStatementsController(
    new HttpErrorCreator(),
    new ReportCreator(new HttpErrorCreator()),
    new CreditExamStatementService(
        new StudentRepo(DatabaseConnection),
        new MarksRepo(DatabaseConnection, new SubjectRepo(DatabaseConnection)),
        new GroupRepo(DatabaseConnection),
        new SubjectRepo(DatabaseConnection),
        new StudentStatementRepo(DatabaseConnection),
        new StudyGroupStatementRepo(DatabaseConnection),
        new TypeStatementRepo(DatabaseConnection),
        new FormControlRepo(DatabaseConnection),
    ),
    new ExcelFacadeService(
        new ExcelDataService(
            new StudentRepo(DatabaseConnection),
            new MarksRepo(DatabaseConnection, new SubjectRepo(DatabaseConnection)),
            new SubjectRepo(DatabaseConnection)
        ),
        new ExcelPreparatorService(new StudentRepo(DatabaseConnection)),
        new StudyGroupStatementRepo(DatabaseConnection),
        new TypeStatementRepo(DatabaseConnection)
    )
)

// Зачетно-экзаменационная
CreditExamRouter.get('/creditStatement', 
    creditExamController.getCreditExamStatement.bind(creditExamController));
// Хвостовка
CreditExamRouter.get('/creditStatementDebt', 
    creditExamController.getCreditExamDebtStatement.bind(creditExamController));
// Зачетно-экзаменационная на человека
CreditExamRouter.get('/creditStatementIndividual', 
    creditExamController.getCreditExamIndividualStatement.bind(creditExamController));
// Журнал группы
CreditExamRouter.get('/groupJournal', 
    creditExamController.getGroupJournal.bind(creditExamController));
