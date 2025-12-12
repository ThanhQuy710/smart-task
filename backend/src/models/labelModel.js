/**
 * Updated by trungquandev.com's author on Dec 10 2025
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { LABEL_COLORS } from '~/utils/constants'

// Define Collection (Name & Schema)
const LABEL_COLLECTION_NAME = 'labels'
const LABEL_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(1).max(50).trim().strict(),
  color: Joi.string().required().valid(...LABEL_COLORS),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await LABEL_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newLabelToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId)
    }
    const createdLabel = await GET_DB().collection(LABEL_COLLECTION_NAME).insertOne(newLabelToAdd)
    return createdLabel
  } catch (error) { throw new Error(error) }
}

const findOneById = async (labelId) => {
  try {
    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).findOne({ _id: new ObjectId(labelId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findByBoardId = async (boardId) => {
  try {
    const results = await GET_DB().collection(LABEL_COLLECTION_NAME).find({
      boardId: new ObjectId(boardId),
      _destroy: false
    }).toArray()
    return results
  } catch (error) { throw new Error(error) }
}

const update = async (labelId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName]
    })

    // Extra guard for color update
    if (updateData.color && !LABEL_COLORS.includes(updateData.color)) {
      delete updateData.color
    }

    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(labelId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (labelId) => {
  try {
    const result = await GET_DB().collection(LABEL_COLLECTION_NAME).deleteOne({ _id: new ObjectId(labelId) })
    return result
  } catch (error) { throw new Error(error) }
}

export const labelModel = {
  LABEL_COLLECTION_NAME,
  LABEL_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByBoardId,
  update,
  deleteOneById
}
