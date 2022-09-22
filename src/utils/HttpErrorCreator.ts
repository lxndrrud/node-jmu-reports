import { Response } from "express";

export interface IHttpErrorCreator {
    internalServer500(res: Response, error: string): void
    badRequest400(res: Response, error: string): void
}

export class HttpErrorCreator implements IHttpErrorCreator {
    public internalServer500(res: Response, error: string) {
        console.error(error)
        res.status(500).send({
            message: "Внутренняя ошибка: " + error
        })
    }

    public badRequest400(res: Response, error: string) {
        res.status(400).send({
            message: "Неправильный запрос: " + error
        })
    }
}