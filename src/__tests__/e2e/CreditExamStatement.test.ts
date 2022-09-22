import { Bootstrap } from "../../app";
import request from 'supertest'
import { DatabaseConnection } from "../../dbConnection";
import { Server } from "http";

let server: Server

describe("Credit exam controller", function() {
    beforeAll(async () => {
        server = (await Bootstrap()).listen(8083)
        return
    })
    afterAll(async () => {
        await DatabaseConnection.destroy()
        server.close()
    })
    describe("зачетно-экзаменационная ведомость", function() {
        const link = "/reports-education/creditExamStatements/creditStatement"
        it("должно сломаться - группы такой нет", async function () {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1101,
                    idSubjectControl: 1,
                    typeStatement: 'ПВ'
                })
            expect(response.statusCode).toEqual(500)
        })

        it("должно сломаться - предмето-контроля такого нет", async function () {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1,
                    idSubjectControl: 1113,
                    typeStatement: 'ПВ'
                })
            expect(response.statusCode).toEqual(500)
        })

        // TODO: надо добавить в сиды предмето-контроль, который не подвязан к группе
        it.skip("должно сломаться - группа не подвязана к предмето-контролю", async function () {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1,
                    idSubjectControl: 3,
                    typeStatement: 'ПВ'
                })

            expect(response.statusCode).toEqual(500)
        })

        it("должно сломаться - несуществующий тип ведомости", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1,
                    idSubjectControl: 1,
                    typeStatement: 'КЕКВ'
                })
            expect(response.statusCode).toEqual(500)
        })

        it("должно быть ОК", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1,
                    idSubjectControl: 1,
                    typeStatement: 'ПВ'
                })
            expect(response.statusCode).toEqual(200)
            expect(response.headers)
                .toHaveProperty("content-type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        })
    })

    describe('хвостовка', function() {
        const link = "/reports-education/creditExamStatements/creditStatementDebt"

        it("должно сломаться - группы такой нет", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1114, 
                    idSubjectControl: 1, 
                    idStudent: 1
                })
            expect(response.statusCode).toEqual(500)
        })
        it("должно сломаться - нет такого предмета", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1, 
                    idSubjectControl: 1114, 
                    idStudent: 1
                })
            expect(response.statusCode).toEqual(500)
        })
        it("должно сломаться - нет такого студента", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1, 
                    idSubjectControl: 1, 
                    idStudent: 1114
                })
            expect(response.statusCode).toEqual(500)
        })
        it("должно сломаться - не отправлен идентификатор группы", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idSubjectControl: 1, 
                    idStudent: 1
                })
            expect(response.statusCode).toEqual(400)
        })
        it.skip("нужно добавить сиды для проверки не связанных данных", async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1, 
                    idSubjectControl: 1, 
                    idStudent: 3
                })
            expect(response.status).toEqual(500)
        })
        it('должно быть ОК', async function() {
            const response = await request(server)
                .get(link)
                .query({
                    idGroup: 1, 
                    idSubjectControl: 1, 
                    idStudent: 1
                })
            expect(response.statusCode).toEqual(200)
            expect(response.headers)
                .toHaveProperty("content-type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        })
    })
})
