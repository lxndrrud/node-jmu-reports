// @ts-nocheck
import { Subject } from "../entities/plan_subjects";
import { Student } from "../entities/students";
import { MarkWithSubjectResponse } from "../types/studentMark.type";
import excel from 'excel4node'
import { IStudentRepo } from "../repositories/Student.repo";

export interface IExcelPreparatorService {
    prepareGroupJournal(subjects: Subject[], students: Student[], marksMap: Map<string, MarkWithSubjectResponse>): any
}

export class ExcelPreparatorService implements IExcelPreparatorService {
    private studentRepo

    constructor(
        studentRepoInstance: IStudentRepo
    ) {
        this.studentRepo = studentRepoInstance
    }


    public async prepareGroupJournal(subjects: Subject[], students: Student[], marksMap: Map<string, MarkWithSubjectResponse>) {
        // Формирование документа
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('Журнал группы');

        const subjectNameStyle = workBook.createStyle({
            alignment: {
                textRotation: 90,
            },
            border: { outline: true },
        });

        workSheet.row(1).setHeight(300);
        workSheet.column(1).setWidth(50);

        // Стиль форматирования с черной рамкой со всех сторон 
        const outlineStyle = {
            border: {
                top: {
                    style: 'thin',
                    color: '#000000',
                },
                bottom: {
                    style: 'thin',
                    color: '#000000',
                },
                left: {
                    style: 'thin',
                    color: '#000000',
                },
                right: {
                    style: 'thin',
                    color: '#000000',
                },
            },
        };

        const check = subjects.findIndex((subject, i) => 
            subjects[i].subjectGroups[0].subjectControls[0].formControl.name === 'зачет' &&
                subjects[i+1].subjectGroups[0].subjectControls[0].formControl.name !== 'зачет'
        )
        const averageCountIndex = check !== -1 ? check : 1 

        // Формирование excel-файла
        for (let i = 1; i < students.length + 1 + 1; i++) {
            let needAverage = true;
            for (let j = 1; j < subjects.length + 1 + 1 + 5; j++) {
                workSheet.cell(i, j).style(outlineStyle);
        
                // Шапка
                // Первые пять пустые
                if (i === 1 && j < 6) workSheet.cell(i, j).string(' ');
        
                // Повернутый на 90 градусов текст с названиями предметов
                if (i === 1 && j >= 6 && j < subjects.length + 6) {
                    workSheet
                        .cell(i, j)
                        .string(subjects[j - 6].name)
                        .style(subjectNameStyle);
                }
        
                // Повернутый на 90 градусов текст 'Средний бал'
                if (i === 1 && j === subjects.length + 6)
                    workSheet.cell(i, j).string('Средний бал').style(subjectNameStyle);
        
                // Значения
                // ФИО
                if (i > 1 && j === 1)
                    workSheet
                        .cell(i, j)
                        .string(
                            `${students[i - 2].lastname} ${students[i - 2].firstname} ${
                            students[i - 2].middlename
                            }`,
                        )
                        .style(outlineStyle);
        
                // Номер зачетной книжки
                if (i > 1 && j === 2) workSheet.cell(i, j).string(students[i - 2].studentGroup[0].recordBook);
        
                // Бюджет или контракт
                if (i > 1 && j === 3) workSheet.cell(i, j)
                    .string(await this.studentRepo.getBasisLearning(students[i - 2].studentGroup[0].id));
        
                // Зачеты, диф зачеты, controlWork и экзамены
                if (i > 1 && j >= 6 && j < subjects.length + 6) {
                    // Зачеты
                    if (subjects[j-6].subjectGroups[0].subjectControls[0].formControl.name === 'зачет') {
                        if (!marksMap.get(students[i - 2].id+'_credit_'+subjects[j-6].name)) {
                            workSheet.cell(i, j).string(' ');
                            needAverage = false;
                            console.log('here 1')
                        }
                        if (marksMap.has(students[i - 2].id+"_credit_"+subjects[j-6].name)) {
                            if (marksMap.get(students[i - 2].id+"_credit_"+subjects[j-6].name)?.ball_5 === 0) {
                                workSheet.cell(i, j).number(2);
                                needAverage = false;
                                console.log('here 2')

                            } else if (marksMap.get(students[i - 2].id+'_credit_'+subjects[j-6].name)?.ball_5 === 1 )
                                workSheet.cell(i, j).number(1).style(outlineStyle);
                        }
                    }
                    // Диф зачеты
                    if (subjects[j-6].subjectGroups[0].subjectControls[0].formControl.name === 'зачетсоц.') {
                        if (!marksMap.get(students[i - 2].id+'_diffCredit_'+subjects[j-6].name)) {
                            workSheet.cell(i, j).string(' ').style(outlineStyle);
                            needAverage = false;
                        }
                        else if(marksMap.has(students[i - 2].id+'_diffCredit_'+subjects[j-6].name)) {
                            if (marksMap.get(students[i - 2].id+'_diffCredit_'+subjects[j-6].name)?.ball_5 as number >= 3)
                                workSheet
                                .cell(i, j)
                                .number(marksMap.get(students[i - 2].id+'_diffCredit_'+subjects[j-6].name)?.ball_5);
                            else if (marksMap.get(students[i - 2].id+'_diffCredit_'+subjects[j-6].name)?.ball_5 as number < 3) {
                                needAverage = false;
                                workSheet.cell(i, j).number(2).style(outlineStyle);
                            } 
                        } 
                    }
                    // Контрольные работы
                    if (subjects[j-6].subjectGroups[0].subjectControls[0].formControl.name === 'кр') {
                        if (!marksMap.get(students[i - 2].id+'_controlWork_'+subjects[j-6].name)) {
                            workSheet.cell(i, j).string(' ').style(outlineStyle);
                            needAverage = false;
                        }
                        else if(marksMap.has(students[i - 2].id+'_controlWork_'+subjects[j-6].name)) {
                            if (marksMap.get(students[i - 2].id+'_controlWork_'+subjects[j-6].name)?.ball_5 as number >= 3)
                                workSheet
                                .cell(i, j)
                                .number(marksMap.get(students[i - 2].id+'_controlWork_'+subjects[j-6].name)?.ball_5);
                            else if (marksMap.get(students[i - 2].id+'_controlWork_'+subjects[j-6].name)?.ball_5 as number < 3) {
                                needAverage = false;
                                workSheet.cell(i, j).number(2).style(outlineStyle);
                            } 
                        } 
                    }
                    // Экзамены
                    if (subjects[j-6].subjectGroups[0].subjectControls[0].formControl.name === 'экзамен') {
                        if (!marksMap.get(students[i - 2].id+'_exam_'+subjects[j-6].name)) {
                            workSheet.cell(i, j).string(' ').style(outlineStyle);
                            needAverage = false;
                        }
                        else if(marksMap.has(students[i - 2].id+'_exam_'+subjects[j-6].name)) {
                            if (marksMap.get(students[i - 2].id+'_exam_'+subjects[j-6].name)?.ball_5 as number >= 3)
                                workSheet
                                .cell(i, j)
                                .number(marksMap.get(students[i - 2].id+'_exam_'+subjects[j-6].name)?.ball_5);
                            else if (marksMap.get(students[i - 2].id+'_exam_'+subjects[j-6].name)?.ball_5 as number < 3) {
                                needAverage = false;
                                workSheet.cell(i, j).number(2).style(outlineStyle);
                            } 
                        } 
                    }
                }
        
                // Средний бал
                if (i > 1 && j === subjects.length + 6) {
                    if (needAverage) {
                        const averageStringFormula = `AVERAGEIF(${excel.getExcelCellRef(
                            i,
                            averageCountIndex + 6,
                        )} : ${excel.getExcelCellRef(i, subjects.length + 5)}, ">2")`;
                        workSheet.cell(i, j).formula(averageStringFormula);
                    }
                }
            }
        }
        return workBook
    }
}