import { Router } from 'express'
import { CreditExamRouter } from './CreditExamStatements.router'

export const MainRouter = Router()

MainRouter.use('/creditExamStatements', CreditExamRouter)

