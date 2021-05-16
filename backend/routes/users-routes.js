import express from 'express'
import { getUsers, login, signup } from '../controllers/users-controller.js'
import { check } from 'express-validator'
import fileUpload from '../middleware/fileUploadMiddleware.js'

const router = express.Router()

router.get('/', getUsers)
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  signup
)
router.post('/login', login)

export default router
