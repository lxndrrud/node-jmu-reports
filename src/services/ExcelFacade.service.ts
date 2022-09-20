import { IStudyGroupStatementRepo } from "../repositories/StudyGroupStatement.repo"
import { ITypeStatementRepo } from "../repositories/TypeStatement.repo"
import { IExcelDataService } from "./ExcelData.service"
import { IExcelPreparatorService } from "./ExcelPreparator.service"

/**
 * Интерфейс фасада для работы с Excel-документами
 * 
 * Предоставлят простой интерфейс для следующей последовательности действий для одной функции:
 * 1. Получить данные для формирования отчета (ExcelDataService)
 * 2. Сформировать(подготовить) Excel-документ, но не сохранить ни на диск, ни в базу (ExcelPreparatorService)
 * 3. Сохранить запись об отчете в базу (к примеру, groupStatementRepo)
 * 4. Вернуть несохраненный на диск отчет (workbook), чтоб потом сохранить его в контроллере
 */
export interface IExcelFacadeService {
    getGroupJournal(idGroup: number, semester: string, isUnion: boolean, path: string, idUser?: number): Promise<any>
}

/**
 * Фасад для работы с Excel-документами
 * 
 * Предоставлят простой интерфейс для следующей последовательности действий:
 * 1. Получить данные для формирования отчета (ExcelDataService)
 * 2. Сформировать(подготовить) Excel-документ, но не сохранить ни на диск, ни в базу (ExcelPreparatorService)
 * 3. Сохранить запись об отчете в базу (к примеру, groupStatementRepo)
 * 4. Вернуть несохраненный на диск отчет (workbook), чтоб потом сохранить его в контроллере
 */
export class ExcelFacadeService implements IExcelFacadeService {
    private excelDataService 
    private excelPreparatorService 
    private typeStatementRepo
    private groupStatementRepo

    constructor(
        excelDataServiceInstance: IExcelDataService,
        excelPreparatorInstance: IExcelPreparatorService,
        groupStatementRepoInstance: IStudyGroupStatementRepo,
        typeStatementRepoInstance: ITypeStatementRepo
    ) {
        this.excelDataService = excelDataServiceInstance
        this.excelPreparatorService = excelPreparatorInstance
        this.typeStatementRepo = typeStatementRepoInstance
        this.groupStatementRepo = groupStatementRepoInstance
    }

    public async getGroupJournal(idGroup: number, semester: string, isUnion: boolean, path: string, idUser?: number) {
        // Формирование строки семестра
        const semesterString = isUnion ? `1:${semester}` : semester
        // Получение типа ведомости
        const typeStatementQuery = await this.typeStatementRepo.getByName('Журнал успеваемости')
        if (!typeStatementQuery) throw new Error('Тип ведомости не определен')
        // Получение данных для формирования отчета
        const { subjects, students, marksMap } = await this.excelDataService
            .getGroupJournalData(idGroup, semester, isUnion)
        // Формирование документа Excel
        const workBook = await this.excelPreparatorService.prepareGroupJournal(subjects, students, marksMap)
        // Сохранение документа
        await this.groupStatementRepo
            .saveStatement(idGroup, null, typeStatementQuery.id, path, semesterString, idUser ? idUser: null)
        return workBook
    }
}