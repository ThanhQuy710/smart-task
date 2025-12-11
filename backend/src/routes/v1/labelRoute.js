/**
 * Updated by trungquandev.com's author on Dec 10 2025
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from 'express'
import { labelValidation } from '~/validations/labelValidation'
import { labelController } from '~/controllers/labelController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, labelValidation.createNew, labelController.createNew)

Router.route('/board/:boardId')
  .get(authMiddleware.isAuthorized, labelController.getBoardLabels)

Router.route('/:id')
  .put(authMiddleware.isAuthorized, labelValidation.update, labelController.update)
  .delete(authMiddleware.isAuthorized, labelController.deleteItem)

export const labelRoute = Router
