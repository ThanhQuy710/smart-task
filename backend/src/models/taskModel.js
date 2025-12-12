import Joi from 'joi'
import { ObjectId } from 'mongodb'

const SUBTASK_SCHEMA = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().required(),
  isCompleted: Joi.boolean().default(false),
  assigneeIds: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now)
})

const TASK_SCHEMA = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null).default(''),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  subtasks: Joi.array().items(SUBTASK_SCHEMA).default([])
})

const buildNewTask = (title, description = '') => ({
  _id: new ObjectId().toString(),
  title: title?.trim(),
  description: description?.trim() || '',
  createdAt: Date.now(),
  subtasks: []
})

const buildNewSubtask = (title) => ({
  _id: new ObjectId().toString(),
  title: title?.trim(),
  isCompleted: false,
  assigneeIds: [],
  createdAt: Date.now()
})

export const taskModel = {
  TASK_SCHEMA,
  SUBTASK_SCHEMA,
  buildNewTask,
  buildNewSubtask
}
