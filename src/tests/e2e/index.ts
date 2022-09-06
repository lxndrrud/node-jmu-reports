import { app } from '../../app'
import { Express } from 'express'
import { CreditExamTest } from './CreditExamStatement.test'

export function IndexE2E() {
    
    describe('E2E tests', () => {
        CreditExamTest()
    })
}