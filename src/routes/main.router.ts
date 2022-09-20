import { Router } from 'express'
import { CreditExamRouter } from './CreditExamStatements.router'
import { GeneralRouter } from './General.router'

export const MainRouter = Router()

MainRouter.use('/creditExamStatements', CreditExamRouter)
MainRouter.use('/general/', GeneralRouter)

