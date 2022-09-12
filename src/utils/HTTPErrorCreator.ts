import { Response } from "express";

export class HTTPErrorCreator {
    public internalServer500(res: Response, error: string) {
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