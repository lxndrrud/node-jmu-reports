import { Router } from 'express'
import { GeneralController } from '../controllers/General.controller';
import { HTTPErrorCreator } from '../utils/HTTPErrorCreator';

export const GeneralRouter = Router()

const generalController = new GeneralController(
    new HTTPErrorCreator()
)


GeneralRouter.get('/types/all', generalController.getReportTypes.bind(generalController));
