/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { env } from '~/config/environment'

// Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173' // Không cần localhost nữa vì ở file config/cors đã luôn luôn cho phép môi trường dev (env.BUILD_MODE === 'dev')

  // Lưu ý: Đây là domain ví dụ sau khi Deploy Production (xem video 75 và video 76 để hiểu rõ kiến thức phần này, còn hiện tại mình đã xóa domain này rồi, đừng cố truy cập làm gì =))
  'https://trello-web-mu.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}
export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const CARD_LABEL_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

// Fixed palette to keep labels consistent across boards
export const LABEL_COLORS = [
  '#61bd4f', // green
  '#f2d600', // yellow
  '#ff9f1a', // orange
  '#eb5a46', // red
  '#c377e0', // purple
  '#0079bf', // blue
  '#00c2e0', // sky
  '#ff78cb', // pink
  '#b6bbbf'  // gray
]
