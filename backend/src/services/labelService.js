/**
 * Updated by trungquandev.com's author on Dec 10 2025
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { ObjectId } from 'mongodb'
import { StatusCodes } from 'http-status-codes'
import { labelModel } from '~/models/labelModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'

const ensureUserInBoard = (board, userId) => {
  const userObjectId = new ObjectId(userId)
  const isOwner = board.ownerIds?.some(id => id.equals(userObjectId))
  const isMember = board.memberIds?.some(id => id.equals(userObjectId))
  if (!isOwner && !isMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to manage labels of this board!')
  }
}

const createNew = async (userId, reqBody) => {
  try {
    const board = await boardModel.findOneById(reqBody.boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    ensureUserInBoard(board, userId)

    const createdLabel = await labelModel.createNew(reqBody)
    const newLabel = await labelModel.findOneById(createdLabel.insertedId)

    return newLabel
  } catch (error) { throw error }
}

const getBoardLabels = async (userId, boardId) => {
  try {
    const board = await boardModel.findOneById(boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    ensureUserInBoard(board, userId)

    const labels = await labelModel.findByBoardId(boardId)
    return labels
  } catch (error) { throw error }
}

const updateLabel = async (userId, labelId, data) => {
  try {
    const existedLabel = await labelModel.findOneById(labelId)
    if (!existedLabel || existedLabel._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found!')
    }
    const board = await boardModel.findOneById(existedLabel.boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    ensureUserInBoard(board, userId)

    const updated = await labelModel.update(labelId, { ...data, updatedAt: Date.now() })
    return updated.value
  } catch (error) { throw error }
}

const deleteLabel = async (userId, labelId) => {
  try {
    const existedLabel = await labelModel.findOneById(labelId)
    if (!existedLabel || existedLabel._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Label not found!')
    }
    const board = await boardModel.findOneById(existedLabel.boardId)
    if (!board || board._destroy) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    ensureUserInBoard(board, userId)

    await labelModel.deleteOneById(labelId)
    await cardModel.removeLabelFromCards(labelId)

    return { deleteResult: 'Label deleted successfully!' }
  } catch (error) { throw error }
}

export const labelService = {
  createNew,
  getBoardLabels,
  updateLabel,
  deleteLabel
}
