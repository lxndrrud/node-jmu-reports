import bodyParser from 'body-parser'
import express from 'express'
import { InitConnection } from './dbConnection'; 
import { MainRouter } from './routes/main.router';


export const app = express()


InitConnection()

app.use(bodyParser.json())

app.use('/static', express.static('public')); // Static files
app.use('/storage', express.static('storage')); // Storage files


app.use(MainRouter)
