import { createReport } from 'docx-templates'
import { Response } from 'express'
import fs from 'fs'
import path from 'path'
import { IHttpErrorCreator } from './HttpErrorCreator'

export interface IReportCreator {
    sendTemplate(res: Response, data: any, templateType: string, templateName: string, reportPath: string, reportName: string): Promise<void>
    sendExcelDocument(workBook: any, filepath: string, filename: string, res: Response): Promise<void>
}

export class ReportCreator implements IReportCreator {
    private pathToTemplates
    private pathToStorage
    private minHeader
    private mainHeader
    private errorCreator

    constructor(
        errorCreatorInstance: IHttpErrorCreator
    ) {
        this.minHeader = [
            'ГОСУДАРСТВЕННОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ',
            'ВЫСШЕГО ОБРАЗОВАНИЯ',
            'ЛУГАНСКОЙ НАРОДНОЙ РЕСПУБЛИКИ',
            '«ЛУГАНСКИЙ  ГОСУДАРСТВЕННЫЙ ПЕДАГОГИЧЕСКИЙ УНИВЕРСИТЕТ»',
            '(ГОУ ВО ЛНР «ЛГПУ»)',
        ];
        this.mainHeader = ['МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ', 'ЛУГАНСКОЙ НАРОДНОЙ РЕСПУБЛИКИ'];
        this.pathToStorage = 'storage'
        this.pathToTemplates = 'public/reportTemplates/'

        this.errorCreator = errorCreatorInstance
    }

    public async sendExcelDocument(workBook: any, filepath: string, filename: string, res: Response) {
        const relationalJournalsDirectory = `./storage${filepath}`;
        if (!fs.existsSync(relationalJournalsDirectory)) {
            fs.mkdirSync(relationalJournalsDirectory, { recursive: true });
        }
        const fileDescriptor = `${relationalJournalsDirectory}/${filename}.xlsx`;
        await new Promise((resolve, reject) => {
            workBook.write(fileDescriptor, async (err: string) => {
                if (err) reject(err)
                else {
                    res.status(200).sendFile(path.resolve(fileDescriptor));
                    resolve(1)
                }
            });
        })
    }

    public async sendTemplate(res: Response, data: any, templateType: string, templateName: string, 
        reportPath: string, reportName: string) {
        try { 
            if (!data) throw 'data is empty';
            data.min_header = this.minHeader;
            data.main_header = this.mainHeader;
            
            // Convert to async method
            const template = await fs.promises.readFile(`${this.pathToTemplates}${templateType}/${templateName}.docx`);
            // console.log({reportPath , reportName});
            // Convert to async method
            const report = await createReport({
                template,
                data,
                cmdDelimiter: ['{{', '}}'],
            });
        
            await this.saveDataToFile(res, report, reportPath, reportName);
        } catch (message) {
            this.errorCreator.internalServer500(res, <string> message)
        }
    }

    private async saveDataToFile(res: Response, buffer: Uint8Array, reportPath: string, reportName: string) {
        // Convert to async
        const dir = `${this.pathToStorage}/${reportPath}`;
        const exists = await this.checkFileExists(dir);
        if (!exists) 
            await fs.promises.mkdir(dir, { recursive: true });

        const existsFile = await this.checkFileExists(`${dir}/${reportName}.docx`);
        if(existsFile)
            await fs.promises.unlink(`${dir}/${reportName}.docx`);
        //if (fs.promises.access(`${dir}/${reportName}.docx`)) 
        //  await fs.promises.unlink(`${dir}/${reportName}.docx`);
      
        await fs.promises.writeFile(`${dir}/${reportName}.docx`, buffer);
        const file = fs.createReadStream(`${dir}/${reportName}.docx`);
        const stats = await fs.promises.stat(`${dir}/${reportName}.docx`);
        res.setHeader('Content-Length', stats.size);
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        );
        res.setHeader('Content-Disposition', `attachment; filename=${reportName}.docx`);
        file.pipe(res);
    }

    private async checkFileExists(file: string) {
        try {
          await fs.promises.access(file, fs.constants.F_OK);
          return true;
        } catch {
          return false;
        }
    }
}