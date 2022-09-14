import { DataSource } from "typeorm";
import { FormControl } from "../entities/plan_form_control";

export interface IFormControlRepo {
    getFormControl(idFormControl: number): Promise<FormControl | null>
}

export class FormControlRepo implements IFormControlRepo {
    private connection
    private formControlRepo

    constructor( 
        connectionInstance: DataSource
    ) {
        this.connection = connectionInstance
        this.formControlRepo = this.connection.getRepository(FormControl)
    }

    public async getFormControl(idFormControl: number) {
        return this.formControlRepo.findOne({
            where: {
                id: idFormControl
            }
        })
    }
}