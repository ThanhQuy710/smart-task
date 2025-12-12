/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { taskModel } from '~/models/taskModel'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy trước khi thêm
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo, cardAttachmentFile) => {
  try {
    let updatedCard = {}

    if (reqBody?.taskAction) {
      const { type, payload = {} } = reqBody.taskAction
      const currentCard = await cardModel.findOneById(cardId)
      let tasks = currentCard?.tasks || []

      switch (type) {
      case 'REORDER_TASKS': {
        const currentTasks = tasks || []
        const idToTask = currentTasks.reduce((acc, t) => ({ ...acc, [t._id]: t }), {})
        tasks = (payload.orderedIds || []).map(id => idToTask[id]).filter(Boolean)
        break
      }
      case 'ADD_TASK': {
        if (payload.title) tasks = [taskModel.buildNewTask(payload.title, payload.description), ...tasks]
        break
      }
      case 'ADD_SUBTASK': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          if (!payload.title) return task
          return {
            ...task,
            subtasks: [taskModel.buildNewSubtask(payload.title), ...(task.subtasks || [])]
          }
        })
        break
      }
      case 'TOGGLE_SUBTASK': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          return {
            ...task,
            subtasks: (task.subtasks || []).map(sub => sub._id === payload.subtaskId ? { ...sub, isCompleted: !!payload.isCompleted } : sub)
          }
        })
        break
      }
      case 'UPDATE_SUBTASK': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          return {
            ...task,
            subtasks: (task.subtasks || []).map(sub => sub._id === payload.subtaskId ? { ...sub, title: payload.title?.trim() || sub.title } : sub)
          }
        })
        break
      }
      case 'ASSIGN_SUBTASK': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          return {
            ...task,
            subtasks: (task.subtasks || []).map(sub => {
              if (sub._id !== payload.subtaskId) return sub
              const current = Array.isArray(sub.assigneeIds) ? sub.assigneeIds : (sub.assigneeId ? [sub.assigneeId] : [])
              if (payload.clearAll) {
                return { ...sub, assigneeIds: [] }
              }
              if (payload.userId) {
                const existed = current.includes(payload.userId)
                if (payload.remove) {
                  return { ...sub, assigneeIds: current.filter(id => id !== payload.userId) }
                }
                if (!existed) {
                  return { ...sub, assigneeIds: [...current, payload.userId] }
                }
                return sub
              }
              return sub
            })
          }
        })
        break
      }
      case 'REORDER_SUBTASKS': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          const currentSubs = task.subtasks || []
          const idToSub = currentSubs.reduce((acc, sub) => ({ ...acc, [sub._id]: sub }), {})
          const newSubtasks = (payload.orderedIds || []).map(id => idToSub[id]).filter(Boolean)
          return {
            ...task,
            subtasks: newSubtasks
          }
        })
        break
      }
      case 'DELETE_SUBTASK': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          return {
            ...task,
            subtasks: (task.subtasks || []).filter(sub => sub._id !== payload.subtaskId)
          }
        })
        break
      }
      case 'UPDATE_TASK': {
        tasks = tasks.map(task => task._id === payload.taskId ? {
          ...task,
          title: payload.title?.trim() || task.title,
          description: payload.description !== undefined ? (payload.description?.trim() || '') : task.description
        } : task)
        break
      }
      case 'DELETE_TASK': {
        tasks = tasks.filter(task => task._id !== payload.taskId)
        break
      }
      case 'COMPLETE_ALL_SUBTASKS': {
        tasks = tasks.map(task => {
          if (task._id !== payload.taskId) return task
          return {
            ...task,
            subtasks: (task.subtasks || []).map(sub => ({ ...sub, isCompleted: true }))
          }
        })
        break
      }
      default:
        break
      }

      updatedCard = await cardModel.update(cardId, {
        tasks,
        updatedAt: Date.now()
      })
    } else if (cardAttachmentFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardAttachmentFile.buffer, 'card-attachments')
      const currentCard = await cardModel.findOneById(cardId)
      const currentAttachments = currentCard?.attachments || []
      const fileExtension = uploadResult.format ? `.${uploadResult.format}` : ''
      const newAttachment = {
        _id: uploadResult.asset_id,
        fileName: `${uploadResult.original_filename}${fileExtension}`,
        format: uploadResult.format || null,
        url: uploadResult.secure_url,
        bytes: uploadResult.bytes,
        createdAt: Date.now(),
        publicId: uploadResult.public_id
      }
      updatedCard = await cardModel.update(cardId, {
        attachments: [newAttachment, ...currentAttachments],
        updatedAt: Date.now()
      })
    } else if (reqBody?.attachmentToRemove) {
      const currentCard = await cardModel.findOneById(cardId)
      const updatedAttachments = (currentCard?.attachments || []).filter(att => att._id !== reqBody.attachmentToRemove)
      updatedCard = await cardModel.update(cardId, {
        attachments: updatedAttachments,
        updatedAt: Date.now()
      })
    } else {
      const updateData = {
        ...reqBody,
        updatedAt: Date.now()
      }

      if (cardCoverFile) {
        const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
        updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
      } else if (updateData.commentToAdd) {
        // Tạo dữ liệu comment để thêm vào Database, cần bổ sung thêm những field cần thiết
        const commentData = {
          ...updateData.commentToAdd,
          commentedAt: Date.now(),
          userId: userInfo._id,
          userEmail: userInfo.email
        }
        updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
      } else if (updateData.incomingMemberInfo) {
        // Trường hợp ADD hoặc REMOVE thành viên ra khỏi Card
        updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
      } else if (updateData.incomingLabelInfo) {
        // Handle ADD/REMOVE label actions for the card
        updatedCard = await cardModel.updateLabels(cardId, updateData.incomingLabelInfo)
      } else if (updateData.dates) {
        updatedCard = await cardModel.updateDates(cardId, updateData.dates)
      } else {
        // Các trường hợp update chung như title, description
        updatedCard = await cardModel.update(cardId, updateData)
      }
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}
