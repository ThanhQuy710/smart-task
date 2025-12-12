/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import { CARD_MEMBER_ACTIONS, CARD_LABEL_ACTIONS } from '~/utils/constants'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  attachments: Joi.array().items({
    _id: Joi.string().required(),
    fileName: Joi.string().required(),
    format: Joi.string().allow(null, ''),
    url: Joi.string().uri().required(),
    bytes: Joi.number().required(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    publicId: Joi.string().allow(null, '')
  }).default([]),
  labelIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  dates: Joi.object({
    startDate: Joi.date().timestamp('javascript').allow(null),
    endDate: Joi.date().timestamp('javascript').allow(null),
    totalDate: Joi.number().allow(null)
  }).default({
    startDate: null,
    endDate: null,
    totalDate: null
  }),
  // Embedded comments
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    commentedAt: Joi.date().timestamp()
  }).default([]),
  tasks: Joi.array().items({
    _id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().allow('', null).default(''),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    subtasks: Joi.array().items({
      _id: Joi.string().required(),
      title: Joi.string().required(),
      isCompleted: Joi.boolean().default(false),
      assigneeIds: Joi.array().items(Joi.string()).default([]),
      createdAt: Joi.date().timestamp('javascript').default(Date.now)
    }).default([])
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Fields not allowed to update
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
      labelIds: validData.labelIds ? validData.labelIds.map(id => new ObjectId(id)) : []
    }

    if (validData.dates) {
      newCardToAdd.dates = {
        startDate: validData.dates.startDate ? new Date(validData.dates.startDate) : null,
        endDate: validData.dates.endDate ? new Date(validData.dates.endDate) : null,
        totalDate: validData.dates.totalDate ?? null
      }
    }

    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
    return createdCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (cardId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(cardId) })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.columnId) updateData.columnId = new ObjectId(updateData.columnId)
    if (updateData.labelIds) updateData.labelIds = updateData.labelIds.map(_id => (new ObjectId(_id)))

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateDates = async (cardId, dates = {}) => {
  try {
    const updateFields = {}
    const dateKeys = ['startDate', 'endDate', 'totalDate']
    dateKeys.forEach(key => {
      if (dates[key] !== undefined) {
        if (['startDate', 'endDate'].includes(key)) {
          updateFields[`dates.${key}`] = dates[key] ? new Date(dates[key]) : dates[key]
        } else {
          updateFields[`dates.${key}`] = dates[key]
        }
      }
    })

    if (Object.keys(updateFields).length === 0) {
      return await findOneById(cardId)
    }

    updateFields.updatedAt = Date.now()

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(columnId) })
    return result
  } catch (error) { throw new Error(error) }
}

// Unshift comment to top of array
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Update members ADD/REMOVE
const updateMembers = async (cardId, incomingMemberInfo) => {
  try {
    let updateCondition = {}
    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.ADD) {
      updateCondition = { $push: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }

    if (incomingMemberInfo.action === CARD_MEMBER_ACTIONS.REMOVE) {
      updateCondition = { $pull: { memberIds: new ObjectId(incomingMemberInfo.userId) } }
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      updateCondition,
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

/**
 * Update labelIds of a card based on incoming action info.
 */
const updateLabels = async (cardId, incomingLabelInfo) => {
  try {
    let updateCondition = {}
    if (incomingLabelInfo.action === CARD_LABEL_ACTIONS.ADD) {
      updateCondition = { $addToSet: { labelIds: new ObjectId(incomingLabelInfo.labelId) } }
    }

    if (incomingLabelInfo.action === CARD_LABEL_ACTIONS.REMOVE) {
      updateCondition = { $pull: { labelIds: new ObjectId(incomingLabelInfo.labelId) } }
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      updateCondition,
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const updateManyComments = async (userInfo) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { 'comments.userId': new ObjectId(userInfo._id) },
      { $set: {
        'comments.$[element].userAvatar': userInfo.avatar,
        'comments.$[element].userDisplayName': userInfo.displayName
      } },
      { arrayFilters: [{ 'element.userId': new ObjectId(userInfo._id) }] }
    )

    return result
  } catch (error) { throw new Error(error) }
}

const removeLabelFromCards = async (labelId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).updateMany(
      { labelIds: new ObjectId(labelId) },
      { $pull: { labelIds: new ObjectId(labelId) } }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment,
  updateMembers,
  updateLabels,
  updateManyComments,
  removeLabelFromCards,
  updateDates
}
