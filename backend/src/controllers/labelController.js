/**
 * Updated by trungquandev.com's author on Dec 10 2025
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from 'http-status-codes'
import { labelService } from '~/services/labelService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdLabel = await labelService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdLabel)
  } catch (error) { next(error) }
}

const getBoardLabels = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { boardId } = req.params
    const labels = await labelService.getBoardLabels(userId, boardId)
    res.status(StatusCodes.OK).json(labels)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const labelId = req.params.id
    const updated = await labelService.updateLabel(userId, labelId, req.body)
    res.status(StatusCodes.OK).json(updated)
  } catch (error) { next(error) }
}

const deleteItem = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const labelId = req.params.id
    const result = await labelService.deleteLabel(userId, labelId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const labelController = {
  createNew,
  getBoardLabels,
  update,
  deleteItem
}
