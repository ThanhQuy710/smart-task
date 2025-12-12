import multer from 'multer'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_ATTACHMENT_FILE_TYPES, ALLOW_IMAGE_FILE_TYPES } from '~/utils/validators'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

/** Hầu hết những thứ bản demo đều ở docs của multer, chỉ là anh tự chỉnh lỗi sao cho khoa học và gọn gàng nhất có thể
* https://www.npmjs.com/package/multer
*/

// Function Kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  // console.log('Multer File: ', file)
  const allowList = file.fieldname === 'cardAttachment' ? ALLOW_ATTACHMENT_FILE_TYPES : ALLOW_IMAGE_FILE_TYPES

  // Đối với thằng multer, kiểm tra kiểu file thì sẽ dùng mimetype
  if (!allowList.includes(file.mimetype)) {
    const errMessage = 'File type is invalid.'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // Nếu như kiểu file hợp lệ:
  return callback(null, true)
}

// Khởi tạo function upload được bọc bởi thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }
