import bodyParser from 'body-parser'
import express from 'express'


export const app = express()

app.use('/static', express.static('public')); // Static files
app.use('/storage', express.static('storage')); // Storage files

app.use(bodyParser.json())