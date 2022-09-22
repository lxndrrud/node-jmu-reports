import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import { InitConnection } from './dbConnection'; 
import { MainRouter } from './routes/main.router';


//export const app = express()
export async function Bootstrap() {
    const app = express()
    await InitConnection()

    app.use(bodyParser.json())

    app.use('/static', express.static('public')); // Static files
    app.use('/storage', express.static('storage')); // Storage files


    app.use('/reports-education', MainRouter)

    app.use((req: Request, res: Response) => {
        res.status(404).send('Страница не обнаружена!');
    });
    return app
}
